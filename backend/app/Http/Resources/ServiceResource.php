<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ServiceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'name' => $this->name,
            'icon' => $this->icon,
            'short_description' => $this->short_description,
            'description' => $this->description,
            'base_price' => $this->base_price,
            'currency' => $this->currency,
            'estimated_days' => $this->estimated_days,
            'revisions_included' => $this->revisions_included,
            'requires_quote' => $this->requires_quote,
            'is_featured' => $this->is_featured,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'packages' => ServicePackageResource::collection($this->whenLoaded('packages')),
            'features' => ServiceFeatureResource::collection($this->whenLoaded('features')),
            'form_fields' => ServiceFormFieldResource::collection($this->whenLoaded('formFields')),
        ];
    }
}