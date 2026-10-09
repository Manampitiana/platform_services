<?php

namespace App\Policies;

use App\Models\OrderMessage;
use App\Models\User;

class OrderMessagePolicy
{
    public const WINDOW_MINUTES = 10;

    public function delete(User $user, OrderMessage $message): bool
    {
        if ($message->deleted_at !== null) {
            return false;
        }

        // Admin: modération, tsy voafetra amin'ny fotoana
        if ($user->isAdmin()) {
            return true;
        }

        // Mpanoratra: ny hafatra nosoratany ihany, mandritra ny 10 minitra
        return $message->user_id === $user->id
            && $message->created_at->gt(now()->subMinutes(self::WINDOW_MINUTES));
    }
}