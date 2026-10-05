<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuoteItem extends Model
{
    protected $fillable = [
        'quote_id', 'title', 'description', 'quantity', 'unit_price', 'discount', 'total', 'sort_order',
    ];
}