<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $frontend = fn () => rtrim(config('app.frontend_url'), '/');

        ResetPassword::createUrlUsing(function ($user, string $token) use ($frontend) {
            return $frontend() . '/reset-password?token=' . $token . '&email=' . urlencode($user->getEmailForPasswordReset());
        });

        VerifyEmail::createUrlUsing(function ($notifiable) use ($frontend) {
           $hash = sha1($notifiable->getEmailForVerification());

           //URL sonian'ny backend: ny frontend no mamerina azy amin'ny API
           $signed = URL::temporarySignedRoute(
                'verification.verify',
                now()->addMinutes(60),
                [
                    'id' => $notifiable->getKey(),
                    'hash' => $hash,
                ]
            );

            return $frontend() . '/verify-email?id=' . $notifiable->getKey() . '&hash=' . $hash . '&' . parse_url($signed, PHP_URL_QUERY);
        });
    }
}
