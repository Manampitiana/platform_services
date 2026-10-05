<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ServicePackageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'price' => $this->price,
            'estimated_days' => $this->estimated_days,
            'revisions_included' => $this->revisions_included,
            'is_popular' => $this->is_popular,
            'features' => ServiceFeatureResource::collection($this->whenLoaded('features')),
        ];
    }
}