<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\SendMessageRequest;
use App\Http\Resources\OrderMessageResource;
use App\Models\Order;
use App\Models\OrderMessage;
use App\Services\MessageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;

class OrderMessageController extends Controller
{
    public function __construct(private MessageService $messages)
    {
    }

    public function index(Request $request, Order $order)
    {
        Gate::authorize('view', $order);

        $this->messages->markRead($order, $request->user());

        $query = $order->messages()->with('user');

        // Ny client dia tsy mahita ny hafatra anaty
        if (! $request->user()->isAdmin()) {
            $query->where('is_internal', false);
        }

        // Ampiasain'ny policy (can_delete): tsy mila query isaky ny hafatra
        $messages = $query->get()->each(fn (OrderMessage $m) => $m->setRelation('order', $order));

        return OrderMessageResource::collection($messages);
    }

    public function store(SendMessageRequest $request, Order $order): JsonResponse
    {
        Gate::authorize('message', $order);

        $message = $this->messages->send(
            $order,
            $request->user(),
            $request->validated('body'),
            $request->file('attachment')
        );

        $message->setRelation('order', $order);

        return (new OrderMessageResource($message))->response()->setStatusCode(201);
    }

    public function destroy(Request $request, Order $order, OrderMessage $message): OrderMessageResource
    {
        abort_unless($message->order_id === $order->id, 404);

        Gate::authorize('delete', $message);

        $message->update([
            'deleted_at' => now(),
            'deleted_by' => $request->user()->id,
        ]);

        return new OrderMessageResource($message->load('user'));
    }

    public function attachment(Order $order, OrderMessage $message)
    {
        Gate::authorize('view', $order);

        abort_unless(
            $message->order_id === $order->id
                && $message->attachment_path
                && $message->deleted_at === null,
            404
        );

        return Storage::disk($message->attachment_disk)
            ->download($message->attachment_path, $message->attachment_name);
    }

    public function unread(Request $request): JsonResponse
    {
        $user = $request->user();

        $perOrder = DB::table('order_messages')
            ->join('orders', 'orders.id', '=', 'order_messages.order_id')
            ->whereNull('order_messages.read_at')
            ->whereNull('order_messages.deleted_at')
            ->where('order_messages.user_id', '!=', $user->id)
            ->where('order_messages.is_internal', false)
            ->whereNull('orders.deleted_at')
            ->when(! $user->isAdmin(), fn ($q) => $q->where('orders.user_id', $user->id))
            ->selectRaw('orders.uuid as uuid, COUNT(*) as total')
            ->groupBy('orders.uuid')
            ->pluck('total', 'uuid');

        return response()->json([
            'data' => [
                'total' => (int) $perOrder->sum(),
                'orders' => $perOrder,
            ],
        ]);
    }
}