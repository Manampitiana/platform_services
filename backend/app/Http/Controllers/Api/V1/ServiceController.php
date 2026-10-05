<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ServiceResource;
use App\Models\Service;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    public function index(Request $request)
    {
        $services = Service::active()
            ->with('category')
            ->when($request->query('category'), fn ($q, $slug) =>
                $q->whereHas('category', fn ($c) => $c->where('slug', $slug))
            )
            ->when($request->query('search'), fn ($q, $term) =>
                $q->where('name', 'like', "%{$term}%")
            )
            ->when($request->boolean('featured'), fn ($q) => $q->where('is_featured', true))
            ->orderBy('sort_order')
            ->paginate(12);

        return ServiceResource::collection($services);
    }

    public function show(string $slug): ServiceResource
    {
        $service = Service::active()
            ->with([
                'category',
                'features',
                'packages' => fn ($q) => $q->where('is_active', true),
                'formFields' => fn ($q) => $q->where('is_active', true),
                'packages.features',
            ])
            ->where('slug', $slug)
            ->firstOrFail();

        return new ServiceResource($service);
    }
}