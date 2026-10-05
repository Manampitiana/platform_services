<?php

namespace App\Http\Requests\Api\V1\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class ServiceFormFieldsRequest extends FormRequest
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
            'fields' => ['present', 'array', 'max:40'],
            'fields.*.name' => ['required', 'string', 'max:50', 'regex:/^[a-z][a-z0-9_]*$/', 'distinct'],
            'fields.*.label' => ['required', 'string', 'max:255'],
            'fields.*.type' => ['required', Rule::in(['text', 'textarea', 'select', 'radio', 'checkbox', 'date', 'url', 'file'])],
            'fields.*.placeholder' => ['nullable', 'string', 'max:255'],
            'fields.*.help_text' => ['nullable', 'string', 'max:255'],
            'fields.*.options' => ['nullable', 'array', 'max:30'],
            'fields.*.options.*' => ['string', 'max:100'],
            'fields.*.is_required' => ['sometimes', 'boolean'],
            'fields.*.is_active' => ['sometimes', 'boolean'],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator) {
                foreach ($this->input('fields', []) as $i => $field) {
                    $needsOptions = in_array($field['type'] ?? null, ['select', 'radio'], true);

                    if ($needsOptions && empty($field['options'])) {
                        $validator->errors()->add("fields.$i.options", 'Add at least one option for each select or radio field.');
                    }
                }
            },
        ];
    }
}
