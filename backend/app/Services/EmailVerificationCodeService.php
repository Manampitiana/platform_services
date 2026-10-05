<?php

namespace App\Services;

use App\Models\EmailVerificationCode;
use App\Models\User;
use App\Notifications\VerifyEmailCode;
use Illuminate\Auth\Events\Verified;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class EmailVerificationCodeService
{
    public const TTL_MINUTES = 10;
    public const COOLDOWN_SECONDS = 60;
    public const MAX_ATTEMPTS = 5;

    public function secondsUntilResend(User $user): int
    {
        $record = EmailVerificationCode::where('user_id', $user->id)->first();

        if (! $record) {
            return 0;
        }

        $elapsed = (int) $record->sent_at->diffInSeconds(now(), true);

        return max(0, self::COOLDOWN_SECONDS - $elapsed);
    }

    public function send(User $user): void
    {
        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        EmailVerificationCode::updateOrCreate(
            ['user_id' => $user->id],
            [
                'code_hash' => Hash::make($code),
                'attempts' => 0,
                'expires_at' => now()->addMinutes(self::TTL_MINUTES),
                'sent_at' => now(),
            ]
        );

        $user->notify(new VerifyEmailCode($code, self::TTL_MINUTES));
    }

    public function verify(User $user, string $code): void
    {
        if ($user->hasVerifiedEmail()) {
            return;
        }

        $record = EmailVerificationCode::where('user_id', $user->id)->first();

        if (! $record || $record->expires_at->isPast()) {
            throw ValidationException::withMessages([
                'code' => ['This code has expired. Request a new one.'],
            ]);
        }

        if ($record->attempts >= self::MAX_ATTEMPTS) {
            $record->delete();

            throw ValidationException::withMessages([
                'code' => ['Too many attempts. Request a new code.'],
            ]);
        }

        if (! Hash::check($code, $record->code_hash)) {
            $record->increment('attempts');
            $left = self::MAX_ATTEMPTS - $record->attempts;

            throw ValidationException::withMessages([
                'code' => [$left > 0
                    ? "Incorrect code. {$left} attempt(s) left."
                    : 'Incorrect code. Request a new code.'],
            ]);
        }

        DB::transaction(function () use ($user, $record) {
            $user->markEmailAsVerified();
            $record->delete();
        });

        event(new Verified($user));
    }
}