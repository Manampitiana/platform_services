<?php

namespace App\Http\Requests\Api\V1\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreDeliverableRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:3000'],
            'file' => ['nullable', 'file', 'max:51200'], // 50 Mo
            'delivery_url' => ['nullable', 'url', 'max:500'],
            'delivery_notes' => ['nullable', 'string', 'max:5000'],
        ];
    }
}