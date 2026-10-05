<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminServiceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $feature = fn ($f) => ['label' => $f->label, 'is_included' => $f->is_included];

        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'name' => $this->name,
            'category_id' => $this->category_id,
            'category' => $this->whenLoaded('category', fn () => $this->category
                ? ['id' => $this->category->id, 'name' => $this->category->name]
                : null),
            'icon' => $this->icon,
            'short_description' => $this->short_description,
            'description' => $this->description,
            'base_price' => $this->base_price,
            'currency' => $this->currency,
            'estimated_days' => $this->estimated_days,
            'revisions_included' => $this->revisions_included,
            'requires_quote' => $this->requires_quote,
            'is_active' => $this->is_active,
            'is_featured' => $this->is_featured,
            'sort_order' => $this->sort_order,
            'packages_count' => $this->whenCounted('packages'),

            'packages' => $this->whenLoaded('packages', fn () => $this->packages->map(fn ($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'slug' => $p->slug,
                'description' => $p->description,
                'price' => $p->price,
                'estimated_days' => $p->estimated_days,
                'revisions_included' => $p->revisions_included,
                'is_popular' => $p->is_popular,
                'is_active' => $p->is_active,
                'sort_order' => $p->sort_order,
                'features' => $p->features->map($feature)->values(),
            ])->values()),

            'features' => $this->whenLoaded('features', fn () => $this->features->map($feature)->values()),

            'form_fields' => $this->whenLoaded('formFields', fn () => $this->formFields->map(fn ($f) => [
                'id' => $f->id,
                'name' => $f->name,
                'label' => $f->label,
                'type' => $f->type,
                'placeholder' => $f->placeholder,
                'help_text' => $f->help_text,
                'options' => $f->options,
                'is_required' => $f->is_required,
                'is_active' => $f->is_active,
            ])->values()),
        ];
    }
}