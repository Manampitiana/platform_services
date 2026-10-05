<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\UploadOrderFileRequest;
use App\Http\Resources\OrderFileResource;
use App\Models\Order;
use App\Models\OrderFile;
use App\Services\FileService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class OrderFileController extends Controller
{
    public function __construct(private FileService $files)
    {
    }

    public function store(UploadOrderFileRequest $request, Order $order): JsonResponse
    {
        Gate::authorize('update', $order);
        abort_if($order->status !== OrderStatus::Draft, 409, 'Files can only be added to draft orders.');

        $file = $this->files->store(
            $order,
            $request->file('file'),
            $request->user(),
            $request->validated('category')
        );

        return (new OrderFileResource($file))->response()->setStatusCode(201);
    }

    public function destroy(Order $order, OrderFile $file): JsonResponse
    {
        Gate::authorize('update', $order);
        abort_unless($file->order_id === $order->id, 404);
        abort_if($order->status !== OrderStatus::Draft, 409, 'Files can only be removed from draft orders.');

        $this->files->delete($file);

        return response()->json(null, 204);
    }

    public function download(Order $order, OrderFile $file): StreamedResponse
    {
        Gate::authorize('view', $order);
        abort_unless($file->order_id === $order->id, 404);

        return Storage::disk($file->disk)->download($file->path, $file->original_name);
    }
}