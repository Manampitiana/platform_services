<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Models\Deliverable;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

class DeliverableService
{
    public function __construct(private OrderService $orders, private NotificationService $notifications) {}

    public function deliver(
        Order $order,
        User $admin,
        string $title,
        ?string $description,
        ?UploadedFile $file,
        ?string $url,
        ?string $notes
    ): Deliverable {
        if (! in_array($order->status, [OrderStatus::InProgress, OrderStatus::Revision], true)) {
            throw new ConflictHttpException('Deliverables can only be added while the order is in progress or in revision.');
        }

        if (! $file && ! $url) {
            throw ValidationException::withMessages(['file' => ['Upload a file or provide a delivery URL.']]);
        }

        return DB::transaction(function () use ($order, $admin, $title, $description, $file, $url, $notes) {
            $deliverable = new Deliverable([
                'order_id' => $order->id,
                'uploaded_by' => $admin->id,
                'title' => $title,
                'description' => $description,
                'version' => ((int) $order->deliverables()->max('version')) + 1,
                'status' => 'delivered',
                'delivery_url' => $url,
                'delivery_notes' => $notes,
                'delivered_at' => now(),
            ]);

            if ($file) {
                $deliverable->disk = 'local';
                $deliverable->file_path = $file->store("deliverables/{$order->uuid}", 'local');
                $deliverable->original_name = $file->getClientOriginalName();
                $deliverable->mime_type = $file->getMimeType();
                $deliverable->size = $file->getSize();
            }

            $deliverable->save();

            $this->orders->changeStatus(
                $order,
                OrderStatus::Delivered,
                $admin,
                "Deliverable v{$deliverable->version} delivered"
            );

            $this->notifications->toClient(
                $order,
                'deliverable.delivered',
                'Your delivery is ready',
                "Version {$deliverable->version} of your order is ready for review."
            );

            return $deliverable;
        });
    }

    public function approve(Deliverable $deliverable, User $client): Deliverable
    {
        $order = $deliverable->order;
        $this->ensureLatestDelivered($order, $deliverable);

        return DB::transaction(function () use ($order, $deliverable, $client) {
            $deliverable->update(['status' => 'approved', 'approved_at' => now()]);
            $this->orders->changeStatus($order, OrderStatus::Completed, $client, "Deliverable v{$deliverable->version} approved");

            $this->notifications->toAdmins(
                $order,
                'deliverable.approved',
                'Delivery approved',
                "The client approved version {$deliverable->version}. The order is completed."
            );
            return $deliverable->refresh();
        });
    }

    public function requestRevision(Deliverable $deliverable, User $client, string $note): Deliverable
    {
        $order = $deliverable->order;
        $this->ensureLatestDelivered($order, $deliverable);

        if ($order->revisions_used >= $order->revisionsAllowed()) {
            throw new ConflictHttpException('You have used all the revisions included in your package.');
        }

        return DB::transaction(function () use ($order, $deliverable, $client, $note) {
            $deliverable->update(['status' => 'revision_requested', 'revision_note' => $note]);
            $order->increment('revisions_used');
            $this->orders->changeStatus($order->refresh(), OrderStatus::Revision, $client, 'Revision requested');

            $this->notifications->toAdmins(
                $order,
                'deliverable.revision',
                'Revision requested',
                'The client asked for changes: ' . \Illuminate\Support\Str::limit($note, 200)
            );
            return $deliverable->refresh();
        });
    }

    private function ensureLatestDelivered(Order $order, Deliverable $deliverable): void
    {
        $latest = $order->deliverables()->first();

        if (
            $order->status !== OrderStatus::Delivered
            || $deliverable->status !== 'delivered'
            || $latest?->id !== $deliverable->id
        ) {
            throw new ConflictHttpException('This deliverable can no longer be reviewed.');
        }
    }
}
