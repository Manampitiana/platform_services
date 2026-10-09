<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderMessage extends Model
{
    protected $fillable = [
        'order_id',
        'user_id',
        'body',
        'attachment_disk',
        'attachment_path',
        'attachment_name',
        'is_internal',
        'read_at',
        'deleted_at',
        'deleted_by'
    ];

    protected function casts(): array
    {
        return [
            'is_internal' => 'boolean',
            'read_at' => 'datetime',
            'deleted_at' => 'datetime',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
