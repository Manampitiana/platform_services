<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderMessageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'body' => $this->body,
            'has_attachment' => (bool) $this->attachment_path,
            'attachment_name' => $this->attachment_name,
            'is_mine' => $this->user_id === $request->user()?->id,
            'sender' => [
                'name' => $this->user?->name,
                'avatar_url' => $this->user?->avatar_url,
                'is_admin' => $this->user?->isAdmin() ?? false,
            ],
            'read_at' => $this->read_at,
            'created_at' => $this->created_at,
        ];
    }
}