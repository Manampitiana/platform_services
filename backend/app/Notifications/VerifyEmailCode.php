<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class VerifyEmailCode extends Notification
{
    public function __construct(
        public string $code,
        public int $minutes = 10,
    ) {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("{$this->code} is your verification code")
            ->greeting("Hello {$notifiable->name},")
            ->line('Use this code to verify your email address:')
            ->line("**{$this->code}**")
            ->line("It expires in {$this->minutes} minutes.")
            ->line('If you did not create an account, you can ignore this email.');
    }
}