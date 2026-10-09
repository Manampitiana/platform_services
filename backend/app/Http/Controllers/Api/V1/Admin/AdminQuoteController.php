<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\UpdateQuoteRequest;
use App\Http\Resources\QuoteResource;
use App\Models\Order;
use App\Models\Quote;
use App\Services\QuoteService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class AdminQuoteController extends Controller
{
    public function __construct(private QuoteService $quotes)
    {
    }

    public function store(Request $request, Order $order): JsonResponse
    {
        Gate::authorize('manage', $order);

        $quote = $this->quotes->createDraft($order, $request->user());

        return (new QuoteResource($quote))->response()->setStatusCode(201);
    }

    public function update(UpdateQuoteRequest $request, Quote $quote): QuoteResource
    {
        Gate::authorize('manage', $quote->order);
        return new QuoteResource($this->quotes->updateDraft($quote, $request->validated()));
    }

    public function send(Request $request, Quote $quote): QuoteResource
    {
        Gate::authorize('manage', $quote->order);
        return new QuoteResource($this->quotes->send($quote, $request->user()));
    }

    public function destroy(Quote $quote): JsonResponse
    {
        Gate::authorize('manage', $quote->order);
        
        $this->quotes->deleteDraft($quote);

        return response()->json(null, 204);
    }
}