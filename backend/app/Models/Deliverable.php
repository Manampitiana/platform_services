<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Deliverable extends Model
{
    protected $fillable = [
        'order_id', 'uploaded_by', 'title', 'description', 'version', 'status',
        'disk', 'file_path', 'original_name', 'mime_type', 'size',
        'delivery_url', 'delivery_notes', 'revision_note', 'delivered_at', 'approved_at',
    ];

    protected function casts(): array
    {
        return [
            'size' => 'integer',
            'delivered_at' => 'datetime',
            'approved_at' => 'datetime',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}