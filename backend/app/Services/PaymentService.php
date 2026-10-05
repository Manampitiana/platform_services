<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Models\Payment;
use App\Models\PaymentMethod;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

class PaymentService
{
    public function __construct(private OrderService $orders, private NotificationService $notifications) {}

    /** Ny client dia mamorona paiement: ny vola dia avy amin'ny commande, tsy avy amin'ny client. */
    public function create(Order $order, User $user, string $methodCode, ?string $reference, ?UploadedFile $proof): Payment
    {
        if ($order->status !== OrderStatus::AwaitingPayment) {
            throw new ConflictHttpException('This order is not awaiting payment.');
        }

        if ($order->due_amount <= 0) {
            throw new ConflictHttpException('Nothing left to pay on this order.');
        }

        if ($order->payments()->whereIn('status', [PaymentStatus::Pending, PaymentStatus::ProofSubmitted])->exists()) {
            throw new ConflictHttpException('A payment is already waiting for verification.');
        }

        $method = PaymentMethod::active()->where('code', $methodCode)->first();
        if (! $method) {
            throw ValidationException::withMessages(['method' => ['Please choose a valid payment method.']]);
        }

        if (! $reference && ! $proof) {
            throw ValidationException::withMessages([
                'transaction_reference' => ['Enter the transaction reference or upload a proof of payment.'],
            ]);
        }

        return DB::transaction(function () use ($order, $user, $method, $reference, $proof) {
            $payment = new Payment([
                'order_id' => $order->id,
                'user_id' => $user->id,
                'payment_number' => $this->generatePaymentNumber(),
                'method' => $method->code,
                'status' => PaymentStatus::ProofSubmitted,
                'currency' => $order->currency,
                'amount' => $order->due_amount,
                'transaction_reference' => $reference,
                'submitted_at' => now(),
            ]);

            if ($proof) {
                $path = $proof->store("payments/{$order->uuid}", 'local');
                $payment->proof_disk = 'local';
                $payment->proof_path = $path;
                $payment->proof_original_name = $proof->getClientOriginalName();
            }

            $payment->save();

            $this->notifications->toAdmins(
                $order,
                'payment.submitted',
                'Payment to verify',
                "{$payment->payment_number}: " . number_format($payment->amount, 0, '.', ' ')
                    . " {$payment->currency} via {$method->name}."
            );

            return $payment;
        });
    }

    public function verify(Payment $payment, User $admin, ?string $note = null): Payment
    {
        $this->ensureOpen($payment);

        return DB::transaction(function () use ($payment, $admin, $note) {
            $payment->update([
                'status' => PaymentStatus::Paid,
                'verified_at' => now(),
                'verified_by' => $admin->id,
                'admin_note' => $note,
            ]);

            $order = $payment->order()->lockForUpdate()->first();
            $this->recalculate($order);

            if ($order->due_amount <= 0 && $order->status === OrderStatus::AwaitingPayment) {
                $this->orders->changeStatus($order, OrderStatus::Paid, $admin, "Payment {$payment->payment_number} verified");
            }

            $this->notifications->toClient(
                $order,
                'payment.verified',
                'Payment confirmed',
                "Your payment {$payment->payment_number} has been confirmed."
            );
            return $payment->refresh();
        });
    }

    public function reject(Payment $payment, User $admin, string $note): Payment
    {
        $this->ensureOpen($payment);

        $payment->update([
            'status' => PaymentStatus::Rejected,
            'verified_at' => now(),
            'verified_by' => $admin->id,
            'admin_note' => $note,
        ]);

        $this->notifications->toClient(
            $payment->order,
            'payment.rejected',
            'Payment rejected',
            "Your payment {$payment->payment_number} was rejected. Reason: {$note}"
        );

        return $payment->refresh();
    }

    public function recalculate(Order $order): void
    {
        $paid = (int) $order->payments()->where('status', PaymentStatus::Paid)->sum('amount');

        $order->paid_amount = $paid;
        $order->due_amount = max(0, $order->total - $paid);
        $order->save();
    }

    private function ensureOpen(Payment $payment): void
    {
        if (! $payment->status->isOpen()) {
            throw new ConflictHttpException('This payment has already been processed.');
        }
    }

    private function generatePaymentNumber(): string
    {
        do {
            $number = sprintf('PAY-%s-%06d', now()->year, random_int(0, 999999));
        } while (Payment::where('payment_number', $number)->exists());

        return $number;
    }

    public function proofStream(Payment $payment)
    {
        abort_unless($payment->proof_path, 404);

        return Storage::disk($payment->proof_disk)->download($payment->proof_path, $payment->proof_original_name);
    }
}
