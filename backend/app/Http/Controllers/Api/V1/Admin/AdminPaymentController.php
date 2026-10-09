<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\ReviewPaymentRequest;
use App\Http\Resources\PaymentResource;
use App\Models\Payment;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;

class AdminPaymentController extends Controller
{
    public function __construct(private PaymentService $payments) {}

    public function index(Request $request)
    {
        $search = trim((string) $request->query('search'));

        $base = Payment::query()
            ->when($search !== '', fn($q) => $q->where(function ($q) use ($search) {
                $q->where('payment_number', 'like', "%{$search}%")
                    ->orWhere('transaction_reference', 'like', "%{$search}%")
                    ->orWhereHas('order', fn($o) => $o
                        ->where('order_number', 'like', "%{$search}%")
                        ->orWhereHas('user', fn($u) => $u
                            ->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%")));
            }));

        $counts = (clone $base)
            ->toBase()
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $sort = ['created_at' => 'created_at', 'amount' => 'amount'][$request->query('sort')] ?? 'created_at';
        $dir = $request->query('dir') === 'asc' ? 'asc' : 'desc';
        $perPage = in_array((int) $request->query('per_page'), [10, 15, 25, 50], true) ? (int) $request->query('per_page') : 15;

        $payments = (clone $base)
            ->with(['order.service', 'order.user'])
            ->when(
                PaymentStatus::tryFrom((string) $request->query('status')),
                fn($q, $status) => $q->where('status', $status->value)
            )
            ->orderBy($sort, $dir)
            ->orderByDesc('id')
            ->paginate($perPage)
            ->withQueryString();

        return PaymentResource::collection($payments)->additional(['counts' => $counts]);
    }

    public function verify(ReviewPaymentRequest $request, Payment $payment): PaymentResource
    {
        Gate::authorize('manage', $payment->order);

        $this->payments->verify($payment, $request->user(), $request->validated('note'));

        return new PaymentResource($payment->load('order.service', 'order.user'));
    }

    public function reject(ReviewPaymentRequest $request, Payment $payment): PaymentResource
    {
        Gate::authorize('manage', $payment->order);

        if (! $request->validated('note')) {
            throw ValidationException::withMessages(['note' => ['Please give a reason for rejecting.']]);
        }

        $this->payments->reject($payment, $request->user(), $request->validated('note'));

        return new PaymentResource($payment->load('order.service', 'order.user'));
    }
}
