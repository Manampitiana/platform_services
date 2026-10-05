<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'payment_number' => $this->payment_number,
            'method' => $this->method,
            'status' => $this->status->value,
            'currency' => $this->currency,
            'amount' => $this->amount,
            'transaction_reference' => $this->transaction_reference,
            'has_proof' => (bool) $this->proof_path,
            'admin_note' => $this->admin_note,
            'submitted_at' => $this->submitted_at,
            'verified_at' => $this->verified_at,
            'created_at' => $this->created_at,
            'order' => $this->whenLoaded('order', fn () => [
                'uuid' => $this->order->uuid,
                'order_number' => $this->order->order_number,
                'service' => $this->order->service?->name,
                'client' => $this->order->user?->name,
            ]),
        ];
    }
}