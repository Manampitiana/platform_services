<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceFormField extends Model
{
    protected $fillable = [
        'service_id', 'name', 'label', 'type', 'placeholder', 'help_text',
        'options', 'validation_rules', 'is_required', 'sort_order', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'options' => 'array',
            'validation_rules' => 'array',
            'is_required' => 'boolean',
            'is_active' => 'boolean',
        ];
    }
}