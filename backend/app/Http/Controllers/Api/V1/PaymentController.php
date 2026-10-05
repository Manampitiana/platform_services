<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StorePaymentRequest;
use App\Http\Resources\PaymentMethodResource;
use App\Http\Resources\PaymentResource;
use App\Models\Order;
use App\Models\Payment;
use App\Models\PaymentMethod;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;

class PaymentController extends Controller
{
    public function __construct(private PaymentService $payments)
    {
    }

    public function methods()
    {
        return PaymentMethodResource::collection(PaymentMethod::active()->get());
    }

    public function store(StorePaymentRequest $request, Order $order): JsonResponse
    {
        Gate::authorize('update', $order);

        $payment = $this->payments->create(
            $order,
            $request->user(),
            $request->validated('method'),
            $request->validated('transaction_reference'),
            $request->file('proof')
        );

        return (new PaymentResource($payment))->response()->setStatusCode(201);
    }

    public function proof(Payment $payment)
    {
        Gate::authorize('view', $payment);

        return $this->payments->proofStream($payment);
    }
}