<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\ReviewPaymentRequest;
use App\Http\Resources\PaymentResource;
use App\Models\Payment;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AdminPaymentController extends Controller
{
    public function __construct(private PaymentService $payments)
    {
    }

    public function index(Request $request)
    {
        $payments = Payment::query()
            ->with(['order.service', 'order.user'])
            ->when($request->query('status'), fn ($q, $s) => $q->where('status', $s))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return PaymentResource::collection($payments);
    }

    public function verify(ReviewPaymentRequest $request, Payment $payment): PaymentResource
    {
        $this->payments->verify($payment, $request->user(), $request->validated('note'));

        return new PaymentResource($payment->load('order.service', 'order.user'));
    }

    public function reject(ReviewPaymentRequest $request, Payment $payment): PaymentResource
    {
        if (! $request->validated('note')) {
            throw ValidationException::withMessages(['note' => ['Please give a reason for rejecting.']]);
        }

        $this->payments->reject($payment, $request->user(), $request->validated('note'));

        return new PaymentResource($payment->load('order.service', 'order.user'));
    }
}