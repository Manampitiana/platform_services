<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceFeature extends Model
{
    protected $fillable = ['service_id', 'service_package_id', 'label', 'is_included', 'sort_order'];

    protected function casts(): array
    {
        return ['is_included' => 'boolean'];
    }
}