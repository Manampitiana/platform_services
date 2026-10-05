<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'uuid' => $this->uuid,
            'order_number' => $this->order_number,
            'type' => $this->type,
            'status' => $this->status->value,
            'currency' => $this->currency,
            'subtotal' => $this->subtotal,
            'discount' => $this->discount,
            'tax' => $this->tax,
            'total' => $this->total,
            'paid_amount' => $this->paid_amount,
            'due_amount' => $this->due_amount,
            'brief_data' => $this->brief_data ?? [],
            'submitted_at' => $this->submitted_at,
            'created_at' => $this->created_at,
            'service' => $this->whenLoaded('service', fn() => $this->service ? [
                'slug' => $this->service->slug,
                'name' => $this->service->name,
                'icon' => $this->service->icon,
            ] : null),
            'package' => $this->whenLoaded('package', fn() => $this->package ? [
                'id' => $this->package->id,
                'slug' => $this->package->slug,
                'name' => $this->package->name,
                'price' => $this->package->price,
            ] : null),
            'items' => $this->whenLoaded('items', fn() => $this->items->map(fn($item) => [
                'id' => $item->id,
                'title' => $item->title,
                'quantity' => $item->quantity,
                'unit_price' => $item->unit_price,
                'total' => $item->total,
            ])),
            'client' => $this->whenLoaded('user', fn() => [
                'name' => $this->user->name,
                'email' => $this->user->email,
                'phone' => $this->user->phone,
                'avatar_url' => $this->user->avatar_url,
            ]),
            'revisions_used' => $this->revisions_used,
            'revisions_allowed' => $this->when(
                $this->relationLoaded('package') || $this->relationLoaded('service'),
                fn() => $this->revisionsAllowed()
            ),
            'deliverables' => DeliverableResource::collection($this->whenLoaded('deliverables')),
            'files' => OrderFileResource::collection($this->whenLoaded('files')),
            'payments' => PaymentResource::collection($this->whenLoaded('payments')),
            'status_histories' => OrderStatusHistoryResource::collection($this->whenLoaded('statusHistories')),
        ];
    }
}
