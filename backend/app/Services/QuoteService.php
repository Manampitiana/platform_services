<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\QuoteStatus;
use App\Models\Order;
use App\Models\Quote;
use App\Models\User;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

class QuoteService
{
    private const QUOTABLE = [
        OrderStatus::Submitted,
        OrderStatus::UnderReview,
        OrderStatus::QuotePending,
        OrderStatus::QuoteSent,
    ];

    public function __construct(
        private OrderService $orders,
        private PaymentService $payments,
        private NotificationService $notifications,
    ) {
    }

    /** Mamorona draft (version vaovao avy amin'ny teo aloha raha misy). */
    public function createDraft(Order $order, User $admin): Quote
    {
        if (! in_array($order->status, self::QUOTABLE, true)) {
            throw new ConflictHttpException('A quote cannot be created for an order in this status.');
        }

        return DB::transaction(function () use ($order, $admin) {
            $latest = $order->quotes()->with('items')->first();

            if ($latest?->status === QuoteStatus::Draft) {
                return $latest;
            }

            if ($latest?->status === QuoteStatus::Accepted) {
                throw new ConflictHttpException('A quote has already been accepted for this order.');
            }

            $quote = $order->quotes()->create([
                'quote_number' => $this->generateNumber(),
                'version' => ($latest?->version ?? 0) + 1,
                'parent_quote_id' => $latest?->id,
                'created_by' => $admin->id,
                'status' => QuoteStatus::Draft,
                'currency' => $order->currency,
                'tax_rate' => $latest?->tax_rate ?? 0,
                'notes' => $latest?->notes,
                'terms' => $latest?->terms,
            ]);

            foreach ($latest?->items ?? [] as $item) {
                $quote->items()->create($item->only([
                    'title', 'description', 'quantity', 'unit_price', 'discount', 'total', 'sort_order',
                ]));
            }

            $this->recalculate($quote);

            // Ny version taloha efa nalefa dia tsy azo ekena intsony
            if ($latest?->status === QuoteStatus::Sent) {
                $latest->update(['status' => QuoteStatus::Superseded]);
            }

            if ($order->status !== OrderStatus::QuotePending) {
                $this->orders->changeStatus(
                    $order,
                    OrderStatus::QuotePending,
                    $admin,
                    "Quote {$quote->quote_number} v{$quote->version} drafted"
                );
            }

            return $quote->load('items');
        });
    }

    public function updateDraft(Quote $quote, array $data): Quote
    {
        $this->ensureStatus($quote, QuoteStatus::Draft, 'Only draft quotes can be edited.');

        return DB::transaction(function () use ($quote, $data) {
            $quote->update(Arr::only($data, ['valid_until', 'tax_rate', 'notes', 'terms']));

            $quote->items()->delete();

            foreach (array_values($data['items']) as $i => $item) {
                $gross = $item['quantity'] * $item['unit_price'];
                $discount = (int) ($item['discount'] ?? 0);

                $quote->items()->create([
                    'title' => $item['title'],
                    'description' => $item['description'] ?? null,
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'discount' => $discount,
                    'total' => max(0, $gross - $discount),
                    'sort_order' => $i,
                ]);
            }

            $this->recalculate($quote->refresh());

            return $quote->load('items');
        });
    }

    public function deleteDraft(Quote $quote): void
    {
        $this->ensureStatus($quote, QuoteStatus::Draft, 'Only draft quotes can be deleted.');

        $quote->delete();
    }

    public function send(Quote $quote, User $admin): Quote
    {
        $this->ensureStatus($quote, QuoteStatus::Draft, 'Only draft quotes can be sent.');
        $quote->load('items', 'order');

        if ($quote->items->isEmpty() || $quote->total <= 0) {
            throw ValidationException::withMessages(['items' => ['Add at least one item with a price before sending.']]);
        }

        $validUntil = $quote->valid_until ?? now()->addDays(14);

        if ($validUntil->copy()->endOfDay()->isPast()) {
            throw ValidationException::withMessages(['valid_until' => ['The validity date must be in the future.']]);
        }

        return DB::transaction(function () use ($quote, $admin, $validUntil) {
            $quote->update([
                'status' => QuoteStatus::Sent,
                'sent_at' => now(),
                'valid_until' => $validUntil->toDateString(),
            ]);

            $order = $quote->order;

            $this->orders->changeStatus(
                $order,
                OrderStatus::QuoteSent,
                $admin,
                "Quote {$quote->quote_number} v{$quote->version} sent"
            );

            $this->notifications->toClient(
                $order,
                'quote.sent',
                'You received a quote',
                'Total: ' . number_format($quote->total, 0, '.', ' ') . " {$quote->currency}. "
                    . 'Valid until ' . $quote->valid_until->format('d/m/Y') . '.'
            );

            return $quote->refresh()->load('items');
        });
    }

    public function accept(Quote $quote, User $client, ?string $note): Quote
    {
        $this->guardRespond($quote);

        return DB::transaction(function () use ($quote, $client, $note) {
            $order = Order::lockForUpdate()->findOrFail($quote->order_id);

            $quote->update([
                'status' => QuoteStatus::Accepted,
                'accepted_at' => now(),
                'response_note' => $note,
            ]);

            // Ny totaux an'ny commande dia avy amin'ny devis nekena
            $order->subtotal = $quote->subtotal;
            $order->discount = $quote->discount;
            $order->tax = $quote->tax;
            $order->total = $quote->total;
            $order->save();

            $order->items()->delete();
            foreach ($quote->items as $item) {
                $order->items()->create([
                    'item_type' => 'quote',
                    'title' => $item->title,
                    'description' => $item->description,
                    'quantity' => $item->quantity,
                    'unit_price' => $item->unit_price,
                    'total' => $item->total,
                    'metadata' => ['quote_id' => $quote->id, 'discount' => $item->discount],
                ]);
            }

            $this->payments->recalculate($order);

            $this->orders->changeStatus(
                $order,
                OrderStatus::AwaitingPayment,
                $client,
                "Quote {$quote->quote_number} v{$quote->version} accepted"
            );

            $this->notifications->toAdmins(
                $order,
                'quote.accepted',
                'Quote accepted',
                "{$client->name} accepted {$quote->quote_number} v{$quote->version}."
            );

            return $quote->refresh()->load('items');
        });
    }

    public function reject(Quote $quote, User $client, ?string $note): Quote
    {
        $this->guardRespond($quote);

        return DB::transaction(function () use ($quote, $client, $note) {
            $order = Order::lockForUpdate()->findOrFail($quote->order_id);

            $quote->update([
                'status' => QuoteStatus::Rejected,
                'rejected_at' => now(),
                'response_note' => $note,
            ]);

            $this->orders->changeStatus(
                $order,
                OrderStatus::QuotePending,
                $client,
                "Quote {$quote->quote_number} v{$quote->version} declined"
            );

            $this->notifications->toAdmins(
                $order,
                'quote.rejected',
                'Quote declined',
                "{$client->name} declined {$quote->quote_number} v{$quote->version}."
                    . ($note ? ' Comment: ' . \Illuminate\Support\Str::limit($note, 200) : '')
            );

            return $quote->refresh()->load('items');
        });
    }

    public function expire(Quote $quote): void
    {
        if ($quote->status !== QuoteStatus::Sent) {
            return;
        }

        DB::transaction(function () use ($quote) {
            $quote->update(['status' => QuoteStatus::Expired]);

            $order = $quote->order;

            if ($order->status === OrderStatus::QuoteSent) {
                $this->orders->changeStatus(
                    $order,
                    OrderStatus::QuotePending,
                    null,
                    "Quote {$quote->quote_number} v{$quote->version} expired"
                );
            }

            $this->notifications->toAdmins($order, 'quote.expired', 'Quote expired', "{$quote->quote_number} v{$quote->version} has expired.");
            $this->notifications->toClient($order, 'quote.expired', 'Your quote has expired', 'Please contact us if you still want to go ahead.');
        });
    }

    /** Alefa rehefa misokatra ny lisitry ny devis amin'ny commande iray. */
    public function expireDueFor(Order $order): void
    {
        $order->quotes()
            ->where('status', QuoteStatus::Sent->value)
            ->get()
            ->filter(fn (Quote $quote) => $quote->isExpired())
            ->each(fn (Quote $quote) => $this->expire($quote));
    }

    /** Alefa isan'andro (scheduler). */
    public function expireAllDue(): int
    {
        $count = 0;

        Quote::where('status', QuoteStatus::Sent->value)
            ->whereDate('valid_until', '<', today())
            ->get()
            ->each(function (Quote $quote) use (&$count) {
                $this->expire($quote);
                $count++;
            });

        return $count;
    }

    private function guardRespond(Quote $quote): void
    {
        $quote->loadMissing('items', 'order');

        if ($quote->isExpired()) {
            $this->expire($quote);
            throw new ConflictHttpException('This quote has expired. Please ask us for a new one.');
        }

        if ($quote->status !== QuoteStatus::Sent || $quote->order->status !== OrderStatus::QuoteSent) {
            throw new ConflictHttpException('This quote can no longer be answered.');
        }
    }

    private function ensureStatus(Quote $quote, QuoteStatus $expected, string $message): void
    {
        if ($quote->status !== $expected) {
            throw new ConflictHttpException($message);
        }
    }

    private function recalculate(Quote $quote): void
    {
        $items = $quote->items()->get();

        $gross = (int) $items->sum(fn ($item) => $item->quantity * $item->unit_price);
        $discount = (int) $items->sum('discount');
        $taxable = max(0, $gross - $discount);
        $tax = (int) round($taxable * $quote->tax_rate / 100);

        $quote->update([
            'subtotal' => $gross,
            'discount' => $discount,
            'tax' => $tax,
            'total' => $taxable + $tax,
        ]);
    }

    private function generateNumber(): string
    {
        do {
            $number = sprintf('QUO-%s-%06d', now()->year, random_int(0, 999999));
        } while (Quote::where('quote_number', $number)->exists());

        return $number;
    }
}