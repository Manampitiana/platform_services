<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderFile;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class FileService
{
    public const MAX_FILES = 10;

    public function store(Order $order, UploadedFile $file, User $user, ?string $category): OrderFile
    {
        if ($order->files()->count() >= self::MAX_FILES) {
            throw ValidationException::withMessages([
                'file' => ['You can attach up to ' . self::MAX_FILES . ' files per order.'],
            ]);
        }

        $originalName = $file->getClientOriginalName();
        $mime = $file->getMimeType();
        $size = $file->getSize();

        // Private disk, generated file name
        $path = $file->store("orders/{$order->uuid}", 'local');

        return $order->files()->create([
            'user_id' => $user->id,
            'file_name' => basename($path),
            'original_name' => $originalName,
            'disk' => 'local',
            'path' => $path,
            'mime_type' => $mime,
            'size' => $size,
            'category' => $category,
            'is_private' => true,
        ]);
    }

    public function delete(OrderFile $file): void
    {
        Storage::disk($file->disk)->delete($file->path);
        $file->delete();
    }
}