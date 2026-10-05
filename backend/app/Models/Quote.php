<?php

namespace App\Models;

use App\Enums\QuoteStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Quote extends Model
{
    protected $fillable = [
        'order_id', 'parent_quote_id', 'created_by', 'quote_number', 'version', 'status',
        'currency', 'subtotal', 'discount', 'tax_rate', 'tax', 'total', 'valid_until',
        'notes', 'terms', 'response_note', 'sent_at', 'accepted_at', 'rejected_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => QuoteStatus::class,
            'valid_until' => 'date',
            'sent_at' => 'datetime',
            'accepted_at' => 'datetime',
            'rejected_at' => 'datetime',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(QuoteItem::class)->orderBy('sort_order');
    }

    public function isExpired(): bool
    {
        return $this->status === QuoteStatus::Sent
            && $this->valid_until !== null
            && $this->valid_until->copy()->endOfDay()->isPast();
    }
}