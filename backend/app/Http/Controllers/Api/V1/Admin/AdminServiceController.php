<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\ServiceFeaturesRequest;
use App\Http\Requests\Api\V1\Admin\ServiceFormFieldsRequest;
use App\Http\Requests\Api\V1\Admin\ServiceRequest;
use App\Http\Resources\AdminServiceResource;
use App\Models\Service;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class AdminServiceController extends Controller
{
    private const WITH = ['category', 'packages.features', 'features', 'formFields'];

    public function index()
    {
        $services = Service::with('category')
            ->withCount('packages')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        return AdminServiceResource::collection($services);
    }

    public function show(Service $service): AdminServiceResource
    {
        return new AdminServiceResource($service->load(self::WITH));
    }

    public function store(ServiceRequest $request): JsonResponse
    {
        $service = Service::create($request->validated());

        return (new AdminServiceResource($service->fresh(self::WITH)))
            ->response()
            ->setStatusCode(201);
    }

    public function update(ServiceRequest $request, Service $service): AdminServiceResource
    {
        $service->update($request->validated());

        return new AdminServiceResource($service->fresh(self::WITH));
    }

    // Soft delete: ny commande taloha mitazona ny service
    public function destroy(Service $service): JsonResponse
    {
        $service->delete();

        return response()->json(null, 204);
    }

    public function saveFeatures(ServiceFeaturesRequest $request, Service $service): AdminServiceResource
    {
        DB::transaction(function () use ($request, $service) {
            $service->features()->delete();

            foreach ($request->validated('features') as $i => $feature) {
                $service->features()->create([
                    'label' => $feature['label'],
                    'is_included' => $feature['is_included'] ?? true,
                    'sort_order' => $i,
                ]);
            }
        });

        return new AdminServiceResource($service->fresh(self::WITH));
    }

    public function saveFormFields(ServiceFormFieldsRequest $request, Service $service): AdminServiceResource
    {
        DB::transaction(function () use ($request, $service) {
            $service->formFields()->delete();

            foreach ($request->validated('fields') as $i => $field) {
                $hasOptions = in_array($field['type'], ['select', 'radio'], true);

                $service->formFields()->create([
                    'name' => $field['name'],
                    'label' => $field['label'],
                    'type' => $field['type'],
                    'placeholder' => $field['placeholder'] ?? null,
                    'help_text' => $field['help_text'] ?? null,
                    'options' => $hasOptions ? array_values($field['options']) : null,
                    'is_required' => $field['is_required'] ?? false,
                    'is_active' => $field['is_active'] ?? true,
                    'sort_order' => $i,
                ]);
            }
        });

        return new AdminServiceResource($service->fresh(self::WITH));
    }
}