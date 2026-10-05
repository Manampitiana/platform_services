<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ContactRequest extends FormRequest
{
    public const SUBJECTS = [
        'General question', 'Order or quote', 'Payment', 'Partnership', 'Other',
    ];

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:255'],
            'subject' => ['required', Rule::in(self::SUBJECTS)],
            'message' => ['required', 'string', 'min:10', 'max:3000'],
            // Honeypot: tsy tokony hofenoin'ny olombelona
            'website' => ['nullable', 'string', 'max:255'],
        ];
    }
}