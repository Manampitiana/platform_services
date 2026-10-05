<?php

namespace App\Http\Requests\Api\V1\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ServiceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $service = $this->route('service');

        return [
           'name' => ['required', 'string', 'max:255'],
            'slug' => [
                'required', 'string', 'max:255',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique('services', 'slug')->ignore($service?->id),
            ],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'icon' => ['nullable', Rule::in(['cv', 'logo', 'website', 'custom'])],
            'short_description' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:10000'],
            'base_price' => ['nullable', 'integer', 'min:0', 'max:1000000000'],
            'estimated_days' => ['nullable', 'integer', 'min:1', 'max:365'],
            'revisions_included' => ['required', 'integer', 'min:0', 'max:20'],
            'requires_quote' => ['required', 'boolean'],
            'is_active' => ['required', 'boolean'],
            'is_featured' => ['required', 'boolean'],
            'sort_order' => ['sometimes', 'integer', 'min:0', 'max:1000'],
        ];
    }
}
