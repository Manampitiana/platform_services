<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\OrderStatus;
use App\Services\NotificationService;
use Illuminate\Support\Str;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\ChangeOrderStatusRequest;
// use App\Http\Requests\Api\V1\Admin\SetOrderPriceRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\OrderService;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

class AdminOrderController extends Controller
{
    private const RELATIONS = ['service', 'package', 'items', 'files', 'statusHistories', 'payments', 'user', 'deliverables'];

    public function __construct(
        private OrderService $orders,
        private PaymentService $payments,
        private NotificationService $notifications,
    ) {}

    public function index(Request $request)
    {
        $search = trim((string) $request->query('search'));

        // Fototra: tsy misy draft, ary fikarohana. Ny isa dia tsy miankina amin'ny filtre status.
        $base = Order::query()
            ->where('status', '!=', OrderStatus::Draft->value)
            ->when($search !== '', fn($q) => $q->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                    ->orWhereHas('user', fn($u) => $u
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%"));
            }));

        $counts = (clone $base)
            ->toBase()
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $sort = ['created_at' => 'created_at', 'total' => 'total', 'order_number' => 'order_number'][$request->query('sort')] ?? 'created_at';
        $dir = $request->query('dir') === 'asc' ? 'asc' : 'desc';
        $perPage = in_array((int) $request->query('per_page'), [10, 15, 25, 50], true) ? (int) $request->query('per_page') : 15;

        $orders = (clone $base)
            ->with(['service', 'user'])
            ->when(
                OrderStatus::tryFrom((string) $request->query('status')),
                fn($q, $status) => $q->where('status', $status->value)
            )
            ->orderBy($sort, $dir)
            ->orderByDesc('id')
            ->paginate($perPage)
            ->withQueryString();

        return OrderResource::collection($orders)->additional(['counts' => $counts]);
    }

    public function show(Order $order): OrderResource
    {
        return new OrderResource($order->load(self::RELATIONS));
    }

    public function changeStatus(ChangeOrderStatusRequest $request, Order $order): OrderResource
    {
        Gate::authorize('manage', $order);

        $to = OrderStatus::from($request->validated('status'));

        $this->orders->changeStatus($order, $to, $request->user(), $request->validated('note'));

        $this->notifications->toClient(
            $order,
            'order.status',
            'Order status updated',
            "Your order {$order->order_number} is now: " . Str::headline($to->value) . '.'
        );
        return new OrderResource($order->load(self::RELATIONS));
    }

    /** Vonjimaika: mametraka vidiny ho an'ny Custom Project (mandra-pahatongan'ny module Devis). */
    // public function setPrice(SetOrderPriceRequest $request, Order $order): OrderResource
    // {
    //     if (! in_array($order->status, [OrderStatus::Submitted, OrderStatus::UnderReview], true)) {
    //         throw new ConflictHttpException('The price can only be set while the order is being reviewed.');
    //     }

    //     $order->subtotal = $request->validated('total');
    //     $order->total = $order->subtotal - $order->discount + $order->tax;
    //     $order->save();

    //     $this->payments->recalculate($order);

    //     $this->orders->changeStatus(
    //         $order,
    //         OrderStatus::AwaitingPayment,
    //         $request->user(),
    //         'Price set by admin'
    //     );

    //     $this->notifications->toClient(
    //         $order,
    //         'order.payment_requested',
    //         'Your order is ready for payment',
    //         'Please pay ' . number_format($order->total, 0, '.', ' ') . " {$order->currency} to start production."
    //     );

    //     return new OrderResource($order->load(self::RELATIONS));
    // }
}
