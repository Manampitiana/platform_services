<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\Service;
use App\Models\ServicePackage;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

class OrderService
{
    public function __construct(private NotificationService $notifications) {}
    public function createDraft(User $user, Service $service, ?string $packageSlug): Order
    {
        $package = $this->resolvePackage($service, $packageSlug);

        return DB::transaction(function () use ($user, $service, $package) {
            $order = new Order([
                'user_id' => $user->id,
                'service_id' => $service->id,
                'order_number' => $this->generateOrderNumber(),
                'type' => $service->requires_quote ? 'custom' : 'package',
                'status' => OrderStatus::Draft,
                'currency' => $service->currency,
            ]);

            $this->applyPackage($order, $service, $package);
            $this->recordHistory($order, null, OrderStatus::Draft, $user, 'Order created');

            return $order;
        });
    }

    public function saveBrief(Order $order, array $brief, ?string $packageSlug = null): Order
    {
        $this->ensureDraft($order);

        $order->loadMissing('service.formFields');
        $service = $order->service;
        abort_if(! $service || $service->trashed(), 409, 'This service is no longer available.');

        return DB::transaction(function () use ($order, $service, $brief, $packageSlug) {
            if ($packageSlug !== null) {
                $package = $this->resolvePackage($service, $packageSlug);

                if ($package?->id !== $order->service_package_id) {
                    $this->applyPackage($order, $service, $package);
                }
            }

            $order->brief_data = $this->validateBrief($this->activeFields($service), $brief, false);
            $order->save();

            return $order;
        });
    }

    public function submit(Order $order, User $by): Order
    {
        $this->ensureDraft($order);

        $order->loadMissing('service.formFields');
        $service = $order->service;
        abort_if(! $service || $service->trashed(), 409, 'This service is no longer available.');

        $fields = $this->activeFields($service);

        // Strict validation of the saved brief
        $this->validateBrief($fields, $order->brief_data ?? [], true);

        // Required file fields
        $missing = [];
        foreach ($fields->where('type', 'file')->where('is_required', true) as $field) {
            if (! $order->files()->where('category', $field->name)->exists()) {
                $missing["files.{$field->name}"] = ["{$field->label} is required."];
            }
        }
        if ($missing) {
            throw ValidationException::withMessages($missing);
        }

        return DB::transaction(function () use ($order, $service, $by) {
            $this->changeStatus($order, OrderStatus::Submitted, $by, 'Order submitted by client');

            // Fixed price: no quote needed, go straight to payment
            if (! $service->requires_quote && $order->total > 0) {
                $this->changeStatus($order, OrderStatus::AwaitingPayment, null, 'Fixed price, no quote required');
            }

            $this->notifications->toAdmins(
                $order,
                'order.submitted',
                'New order submitted',
                "{$by->name} submitted {$order->order_number} ({$service->name})."
            );

            return $order;
        });
    }

    /** Single entry point for every status change. */
    public function changeStatus(Order $order, OrderStatus $to, ?User $by = null, ?string $note = null): Order
    {
        $from = $order->status;

        if (! $from->canTransitionTo($to)) {
            throw new ConflictHttpException("Cannot change order status from {$from->value} to {$to->value}.");
        }

        $order->status = $to;

        $column = match ($to) {
            OrderStatus::Submitted => 'submitted_at',
            OrderStatus::InProgress => 'started_at',
            OrderStatus::Delivered => 'delivered_at',
            OrderStatus::Completed => 'completed_at',
            OrderStatus::Cancelled => 'cancelled_at',
            default => null,
        };

        if ($column) {
            $order->{$column} = now();
        }

        $order->save();
        $this->recordHistory($order, $from, $to, $by, $note);

        return $order;
    }

    private function ensureDraft(Order $order): void
    {
        if ($order->status !== OrderStatus::Draft) {
            throw new ConflictHttpException('Only draft orders can be edited.');
        }
    }

    private function activeFields(Service $service): Collection
    {
        return $service->formFields->where('is_active', true)->values();
    }

    private function resolvePackage(Service $service, ?string $slug): ?ServicePackage
    {
        if ($service->requires_quote) {
            return null;
        }

        $packages = $service->packages()->where('is_active', true)->get();

        if ($packages->isEmpty()) {
            return null;
        }

        $package = $packages->firstWhere('slug', $slug);

        if (! $package) {
            throw ValidationException::withMessages(['package' => ['Please select a valid package.']]);
        }

        return $package;
    }

    /** Amounts are always computed on the server. */
    private function applyPackage(Order $order, Service $service, ?ServicePackage $package): void
    {
        $subtotal = $package?->price ?? 0;
        $total = $subtotal - (int) $order->discount + (int) $order->tax;

        $order->service_package_id = $package?->id;
        $order->subtotal = $subtotal;
        $order->total = $total;
        $order->due_amount = $total - (int) $order->paid_amount;
        $order->save();

        $order->items()->delete();

        if ($package) {
            $order->items()->create([
                'item_type' => 'package',
                'title' => "{$service->name} - {$package->name}",
                'quantity' => 1,
                'unit_price' => $package->price,
                'total' => $package->price,
            ]);
        }
    }

    private function validateBrief(Collection $fields, array $brief, bool $strict): array
    {
        $rules = [];
        $labels = [];

        foreach ($fields as $field) {
            if ($field->type === 'file') {
                continue;
            }

            $key = "brief.{$field->name}";
            $rules[$key] = array_merge(
                [$strict && $field->is_required ? 'required' : 'nullable'],
                $this->typeRules($field)
            );
            $labels[$key] = $field->label;
        }

        $validator = Validator::make(['brief' => $brief], $rules, [], $labels);
        $validator->validate();

        return $validator->validated()['brief'] ?? [];
    }

    private function typeRules($field): array
    {
        return match ($field->type) {
            'textarea' => ['string', 'max:5000'],
            'select', 'radio' => ['string', Rule::in($field->options ?? [])],
            'checkbox' => ['boolean'],
            'date' => ['date'],
            'url' => ['url', 'max:500'],
            default => ['string', 'max:255'],
        };
    }

    private function generateOrderNumber(): string
    {
        do {
            $number = sprintf('ORD-%s-%06d', now()->year, random_int(0, 999999));
        } while (Order::withTrashed()->where('order_number', $number)->exists());

        return $number;
    }

    private function recordHistory(Order $order, ?OrderStatus $from, OrderStatus $to, ?User $by, ?string $note): void
    {
        $order->statusHistories()->create([
            'from_status' => $from?->value,
            'to_status' => $to->value,
            'changed_by' => $by?->id,
            'note' => $note,
        ]);
    }
}
