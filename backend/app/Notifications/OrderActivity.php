<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderActivity extends Notification implements ShouldQueue
{
    use Queueable;

    // Alefa aorian'ny commit an'ny transaction

    public function __construct(
        public string $event,
        public string $title,
        public string $body,
        public string $orderUuid,
        public string $orderNumber,
        public bool $forAdmin = false,
        public array $channels = ['database', 'mail'],
    ) {
        $this->afterCommit();
    }

    public function via(object $notifiable): array
    {
        return $this->channels;
    }

    private function path(): string
    {
        return ($this->forAdmin ? '/admin/orders/' : '/orders/') . $this->orderUuid;
    }

    public function toMail(object $notifiable): MailMessage
    {
        $url = rtrim(config('app.frontend_url'), '/') . $this->path();

        return (new MailMessage)
            ->subject($this->title)
            ->greeting("Hello {$notifiable->name},")
            ->line($this->body)
            ->line("Order: {$this->orderNumber}")
            ->action('View order', $url);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'event' => $this->event,
            'title' => $this->title,
            'body' => $this->body,
            'order_number' => $this->orderNumber,
            'path' => $this->path(),
        ];
    }
}