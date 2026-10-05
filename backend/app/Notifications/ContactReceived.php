<?php

namespace App\Notifications;

use App\Models\ContactMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ContactReceived extends Notification
{
    public function __construct(public ContactMessage $message)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("New contact message: {$this->message->subject}")
            ->replyTo($this->message->email, $this->message->name)
            ->greeting('New message from the contact form')
            ->line("From: {$this->message->name} <{$this->message->email}>")
            ->line("Subject: {$this->message->subject}")
            ->line($this->message->message);
    }
}