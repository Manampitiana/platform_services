<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\ContactMessage;
use App\Models\Order;
use App\Models\OrderStatusHistory;
use App\Models\Payment;
use Carbon\CarbonPeriod;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminDashboardController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $days = (int) $request->query('days', 30);
        $days = in_array($days, [7, 30, 90], true) ? $days : 30;

        $end = now()->endOfDay();
        $start = now()->subDays($days - 1)->startOfDay();
        $prevStart = $start->copy()->subDays($days);
        $prevEnd = $start->copy()->subSecond();

        $paid = PaymentStatus::Paid->value;

        $stats = fn ($from, $to) => [
            'revenue' => (int) Payment::where('status', $paid)->whereBetween('verified_at', [$from, $to])->sum('amount'),
            'payments' => Payment::where('status', $paid)->whereBetween('verified_at', [$from, $to])->count(),
            'orders' => Order::whereBetween('submitted_at', [$from, $to])->count(),
            'completed' => Order::whereBetween('completed_at', [$from, $to])->count(),
        ];

        $current = $stats($start, $end);
        $previous = $stats($prevStart, $prevEnd);

        $average = fn (array $s) => $s['payments'] > 0 ? (int) round($s['revenue'] / $s['payments']) : 0;

        // Andalana isan'andro (tsy misy banga)
        $revenueByDay = Payment::query()->toBase()
            ->where('status', $paid)
            ->where('verified_at', '>=', $start)
            ->selectRaw('DATE(verified_at) as day, SUM(amount) as total')
            ->groupBy('day')
            ->pluck('total', 'day');

        $ordersByDay = Order::query()->toBase()
            ->whereNotNull('submitted_at')
            ->where('submitted_at', '>=', $start)
            ->selectRaw('DATE(submitted_at) as day, COUNT(*) as total')
            ->groupBy('day')
            ->pluck('total', 'day');

        $series = collect(CarbonPeriod::create($start, now()->startOfDay()))
            ->map(fn ($date) => [
                'date' => $date->toDateString(),
                'revenue' => (int) ($revenueByDay[$date->toDateString()] ?? 0),
                'orders' => (int) ($ordersByDay[$date->toDateString()] ?? 0),
            ])
            ->values();

        $counts = Order::query()->toBase()
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $recent = Order::with(['service', 'user'])
            ->where('status', '!=', OrderStatus::Draft->value)
            ->latest()
            ->limit(6)
            ->get();

        $activity = OrderStatusHistory::with('order:id,uuid,order_number')
            ->where('to_status', '!=', OrderStatus::Draft->value)
            ->latest('id')
            ->limit(8)
            ->get()
            ->filter(fn ($h) => $h->order)
            ->map(fn ($h) => [
                'id' => $h->id,
                'order_uuid' => $h->order->uuid,
                'order_number' => $h->order->order_number,
                'to_status' => $h->to_status,
                'note' => $h->note,
                'created_at' => $h->created_at,
            ])
            ->values();

        return response()->json([
            'data' => [
                'days' => $days,
                'kpis' => [
                    'revenue' => $this->kpi($current['revenue'], $previous['revenue']),
                    'orders' => $this->kpi($current['orders'], $previous['orders']),
                    'completed' => $this->kpi($current['completed'], $previous['completed']),
                    'average_order' => $this->kpi($average($current), $average($previous)),
                ],
                'series' => $series,
                'counts' => $counts,
                'actions' => [
                    'payments_to_verify' => Payment::where('status', PaymentStatus::ProofSubmitted->value)->count(),
                    'orders_to_review' => (int) ($counts['submitted'] ?? 0) + (int) ($counts['under_review'] ?? 0),
                    'contact_messages' => ContactMessage::where('is_spam', false)->whereNull('handled_at')->count(),
                    'quotes_to_prepare' => (int) ($counts['quote_pending'] ?? 0),
                    'revisions_requested' => (int) ($counts['revision'] ?? 0),
                ],
                'recent_orders' => OrderResource::collection($recent)->resolve(),
                'activity' => $activity,
            ],
        ]);
    }

    private function kpi(int $current, int $previous): array
    {
        return [
            'value' => $current,
            'previous' => $previous,
            'change' => $previous > 0 ? round((($current - $previous) / $previous) * 100, 1) : null,
        ];
    }
}