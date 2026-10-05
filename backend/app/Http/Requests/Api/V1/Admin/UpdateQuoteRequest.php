<?php

namespace App\Http\Requests\Api\V1\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UpdateQuoteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'valid_until' => ['nullable', 'date', 'after:today'],
            'tax_rate' => ['required', 'integer', 'min:0', 'max:100'],
            'notes' => ['nullable', 'string', 'max:3000'],
            'terms' => ['nullable', 'string', 'max:3000'],
            'items' => ['present', 'array', 'max:30'],
            'items.*.title' => ['required', 'string', 'max:255'],
            'items.*.description' => ['nullable', 'string', 'max:1000'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:1000'],
            'items.*.unit_price' => ['required', 'integer', 'min:0', 'max:1000000000'],
            'items.*.discount' => ['sometimes', 'integer', 'min:0', 'max:1000000000'],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator) {
                foreach ($this->input('items', []) as $i => $item) {
                    $gross = (int) ($item['quantity'] ?? 0) * (int) ($item['unit_price'] ?? 0);

                    if ((int) ($item['discount'] ?? 0) > $gross) {
                        $validator->errors()->add("items.$i.discount", 'The discount cannot exceed the line amount.');
                    }
                }
            },
        ];
    }
}