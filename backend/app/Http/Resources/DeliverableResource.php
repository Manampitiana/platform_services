<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DeliverableResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'version' => $this->version,
            'status' => $this->status,
            'has_file' => (bool) $this->file_path,
            'original_name' => $this->original_name,
            'size' => $this->size,
            'delivery_url' => $this->delivery_url,
            'delivery_notes' => $this->delivery_notes,
            'revision_note' => $this->revision_note,
            'delivered_at' => $this->delivered_at,
            'approved_at' => $this->approved_at,
        ];
    }
}