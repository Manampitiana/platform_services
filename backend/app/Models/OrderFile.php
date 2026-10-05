<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderFile extends Model
{
    protected $fillable = [
        'order_id', 'user_id', 'file_name', 'original_name', 'disk', 'path',
        'mime_type', 'size', 'category', 'is_private',
    ];

    protected function casts(): array
    {
        return ['is_private' => 'boolean', 'size' => 'integer'];
    }
}