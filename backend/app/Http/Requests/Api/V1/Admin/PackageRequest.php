<?php

namespace App\Http\Requests\Api\V1\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class PackageRequest extends FormRequest
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
        return [
            'name' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:1000'],
            'price' => ['required', 'integer', 'min:1', 'max:1000000000'],
            'estimated_days' => ['nullable', 'integer', 'min:1', 'max:365'],
            'revisions_included' => ['required', 'integer', 'min:0', 'max:20'],
            'is_popular' => ['required', 'boolean'],
            'is_active' => ['required', 'boolean'],
            'sort_order' => ['sometimes', 'integer', 'min:0', 'max:1000'],
            'features' => ['present', 'array', 'max:20'],
            'features.*.label' => ['required', 'string', 'max:255'],
            'features.*.is_included' => ['sometimes', 'boolean'],
        ];
    }
}
