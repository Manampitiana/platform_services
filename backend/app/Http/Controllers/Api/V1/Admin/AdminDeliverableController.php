<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\StoreDeliverableRequest;
use App\Http\Resources\DeliverableResource;
use App\Models\Order;
use App\Services\DeliverableService;
use Illuminate\Http\JsonResponse;

class AdminDeliverableController extends Controller
{
    public function __construct(private DeliverableService $deliverables)
    {
    }

    public function store(StoreDeliverableRequest $request, Order $order): JsonResponse
    {
        $deliverable = $this->deliverables->deliver(
            $order,
            $request->user(),
            $request->validated('title'),
            $request->validated('description'),
            $request->file('file'),
            $request->validated('delivery_url'),
            $request->validated('delivery_notes')
        );

        return (new DeliverableResource($deliverable))->response()->setStatusCode(201);
    }
}