<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\PaymentMethodRequest;
use App\Http\Resources\AdminPaymentMethodResource;
use App\Models\Payment;
use App\Models\PaymentMethod;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

class AdminPaymentMethodController extends Controller
{
    public function index()
    {
        return AdminPaymentMethodResource::collection(
            PaymentMethod::orderBy('sort_order')->orderBy('id')->get()
        );
    }

    public function store(PaymentMethodRequest $request): JsonResponse
    {
       $data = $request->validated();
       $data['sort_order'] ??= ((int) PaymentMethod::max('sort_order')) + 1;

       return (new AdminPaymentMethodResource(PaymentMethod::create($data)))
           ->response()
           ->setStatusCode(201);
    }

    public function update(PaymentMethodRequest $request, PaymentMethod $paymentMethod): AdminPaymentMethodResource
    {
        $paymentMethod->update($request->validated());

        return new AdminPaymentMethodResource($paymentMethod);
    }

    public function destroy(PaymentMethod $paymentMethod): JsonResponse
    {
        if (Payment::where('method', $paymentMethod->code)->exists()) {
            throw new ConflictHttpException('This method is used by existing payments. Deactivate it instead.');
        }

        $paymentMethod->delete();

        return response()->json(null, 204);
    }
}
