<?php

namespace App\Http\Requests\Api\V1\Admin;

use App\Enums\OrderStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ChangeOrderStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', Rule::in([
                OrderStatus::UnderReview->value,
                OrderStatus::InProgress->value,
                OrderStatus::Completed->value,
                OrderStatus::Cancelled->value,
            ])],
            'note' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
