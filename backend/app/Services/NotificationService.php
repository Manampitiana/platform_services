<?php

namespace App\Services;

use App\Models\Order;
use App\Models\User;
use App\Notifications\OrderActivity;
use Illuminate\Support\Facades\Notification;

class NotificationService
{
    public function toClient(Order $order, string $event, string $title, string $body, array $channels = ['database', 'mail']): void
    {
        $order->loadMissing('user');

        $order->user?->notify(new OrderActivity(
            $event, $title, $body, $order->uuid, $order->order_number, false, $channels
        ));
    }

    public function toAdmins(Order $order, string $event, string $title, string $body, array $channels = ['database', 'mail']): void
    {
        $admins = User::where('role', 'admin')->get();

        if ($admins->isEmpty()) {
            return;
        }

        Notification::send($admins, new OrderActivity(
            $event, $title, $body, $order->uuid, $order->order_number, true, $channels
        ));
    }
}