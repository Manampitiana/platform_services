<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ContactMessageResource;
use App\Models\ContactMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminContactMessageController extends Controller
{
    public function index(Request $request)
    {
        $status = $request->query('status', 'open');

        $messages = ContactMessage::query()
            ->when(
                $status === 'spam',
                fn ($q) => $q->where('is_spam', true),
                fn ($q) => $q->where('is_spam', false)
            )
            ->when($status === 'open', fn ($q) => $q->whereNull('handled_at'))
            ->when($status === 'handled', fn ($q) => $q->whereNotNull('handled_at'))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return ContactMessageResource::collection($messages);
    }

    public function count(): JsonResponse
    {
        return response()->json([
            'data' => [
                'open' => ContactMessage::where('is_spam', false)->whereNull('handled_at')->count(),
            ],
        ]);
    }

    public function handle(ContactMessage $contactMessage): ContactMessageResource
    {
        $contactMessage->update(['handled_at' => now()]);

        return new ContactMessageResource($contactMessage);
    }

    public function reopen(ContactMessage $contactMessage): ContactMessageResource
    {
        $contactMessage->update(['handled_at' => null]);

        return new ContactMessageResource($contactMessage);
    }

    public function destroy(ContactMessage $contactMessage): JsonResponse
    {
        $contactMessage->delete();

        return response()->json(null, 204);
    }
}