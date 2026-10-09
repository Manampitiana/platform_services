<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderMessageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $deleted = $this->deleted_at !== null;

        return [
            'id' => $this->id,
            // Ny votoatiny dia tsy mivoaka intsony rehefa voafafa
            'body' => $deleted ? null : $this->body,
            'has_attachment' => ! $deleted && (bool) $this->attachment_path,
            'attachment_name' => $deleted ? null : $this->attachment_name,
            'is_deleted' => $deleted,
            'can_delete' => $request->user()?->can('delete', $this->resource) ?? false,
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