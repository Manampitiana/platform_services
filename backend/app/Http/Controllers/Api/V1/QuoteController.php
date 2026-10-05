<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\RespondQuoteRequest;
use App\Http\Resources\QuoteResource;
use App\Models\Order;
use App\Models\Quote;
use App\Services\QuoteService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class QuoteController extends Controller
{
    public function __construct(private QuoteService $quotes)
    {
    }

    public function index(Request $request, Order $order)
    {
        Gate::authorize('view', $order);

        $this->quotes->expireDueFor($order);

        $query = $order->quotes()->with('items');

        // Ny client dia tsy mahita ny draft
        if (! $request->user()->isAdmin()) {
            $query->where('status', '!=', 'draft');
        }

        return QuoteResource::collection($query->get());
    }

    public function accept(RespondQuoteRequest $request, Quote $quote): QuoteResource
    {
        Gate::authorize('update', $quote->order);

        return new QuoteResource($this->quotes->accept($quote, $request->user(), $request->validated('note')));
    }

    public function reject(RespondQuoteRequest $request, Quote $quote): QuoteResource
    {
        Gate::authorize('update', $quote->order);

        return new QuoteResource($this->quotes->reject($quote, $request->user(), $request->validated('note')));
    }
}