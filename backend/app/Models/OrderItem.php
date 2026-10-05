<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    protected $fillable = [
        'order_id', 'item_type', 'title', 'description', 'quantity', 'unit_price', 'total', 'metadata',
    ];

    protected function casts(): array
    {
        return ['metadata' => 'array'];
    }
}