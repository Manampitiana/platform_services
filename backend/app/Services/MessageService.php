<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderMessage;
use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Http\UploadedFile;
use Illuminate\Validation\ValidationException;

class MessageService
{
    public function __construct(private NotificationService $notifications) {}
    public function send(Order $order, User $user, ?string $body, ?UploadedFile $attachment): OrderMessage
    {
        if (! $body && ! $attachment) {
            throw ValidationException::withMessages(['body' => ['Write a message or attach a file.']]);
        }

        // E-mail iray ihany isaky ny andiana hafatra tsy voalaza (tsy spam)
        $alreadyNotified = $order->messages()
            ->where('user_id', $user->id)
            ->whereNull('read_at')
            ->exists();

        $message = new OrderMessage([
            'order_id' => $order->id,
            'user_id' => $user->id,
            'body' => $body,
        ]);

        if ($attachment) {
            $message->attachment_disk = 'local';
            $message->attachment_path = $attachment->store("messages/{$order->uuid}", 'local');
            $message->attachment_name = $attachment->getClientOriginalName();
        }

        $message->save();

        if (! $alreadyNotified) {
            $preview = Str::limit($body ?: 'Sent an attachment.', 140);

            $user->isAdmin()
                ? $this->notifications->toClient($order, 'message.new', 'New message', $preview, ['mail'])
                : $this->notifications->toAdmins($order, 'message.new', 'New message from a client', $preview, ['mail']);
        }

        return $message->load('user');
    }

    /** Marque comme lus les messages de l'autre partie. */
    public function markRead(Order $order, User $reader): void
    {
        $order->messages()
            ->where('user_id', '!=', $reader->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
    }
}
