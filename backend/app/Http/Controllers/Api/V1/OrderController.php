<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreOrderRequest;
use App\Http\Requests\Api\V1\UpdateBriefRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\Service;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class OrderController extends Controller
{
    private const RELATIONS = ['service', 'package', 'items', 'files'];

    public function __construct(private OrderService $orders) {}

    public function index(Request $request)
    {
        $orders = $request->user()
            ->orders()
            ->with('service')
            // ->when($request->query('status'), fn($q, $status) => $q->where('status', $status))
            ->when(
                OrderStatus::tryFrom((string) $request->query('status')),
                fn($q, $status) => $q->where('status', $status->value)
            )
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return OrderResource::collection($orders);
    }

    public function store(StoreOrderRequest $request): JsonResponse
    {
        Gate::authorize('create', Order::class);

        $service = Service::active()->where('slug', $request->validated('service'))->firstOrFail();

        $order = $this->orders->createDraft($request->user(), $service, $request->validated('package'));

        return (new OrderResource($order->load(self::RELATIONS)))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Order $order): OrderResource
    {
        Gate::authorize('view', $order);

        return new OrderResource($order->load([...self::RELATIONS, 'statusHistories', 'payments', 'deliverables']));
    }

    public function updateBrief(UpdateBriefRequest $request, Order $order): OrderResource
    {
        Gate::authorize('update', $order);

        $order = $this->orders->saveBrief(
            $order,
            $request->validated('brief') ?? [],
            $request->validated('package')
        );

        return new OrderResource($order->load(self::RELATIONS));
    }

    public function submit(Request $request, Order $order): OrderResource
    {
        Gate::authorize('update', $order);

        $order = $this->orders->submit($order, $request->user());

        return new OrderResource($order->load(self::RELATIONS));
    }

    public function summary(Request $request): JsonResponse
    {
        $user = $request->user();

        $counts = $user->orders()
            ->toBase()
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $recent = $user->orders()->with('service')->latest()->limit(5)->get();

        // Commande miandry ny client: devis alefa, livrable vonona, na paiement mbola tsy nalefa
        $actions = $user->orders()
            ->with('service')
            ->where(function ($q) {
                $q->whereIn('status', ['quote_sent', 'delivered'])
                    ->orWhere(function ($q) {
                        $q->where('status', 'awaiting_payment')
                            ->whereDoesntHave('payments', fn($p) => $p->whereIn('status', ['pending', 'proof_submitted']));
                    });
            })
            ->latest('updated_at')
            ->limit(5)
            ->get()
            ->map(fn(Order $o) => [
                'uuid' => $o->uuid,
                'order_number' => $o->order_number,
                'service' => $o->service?->name,
                'status' => $o->status->value,
                'total' => $o->total,
                'currency' => $o->currency,
            ])
            ->values();

        return response()->json([
            'data' => [
                'counts' => $counts,
                'recent' => OrderResource::collection($recent)->resolve(),
                'actions' => $actions,
            ],
        ]);
    }
}
