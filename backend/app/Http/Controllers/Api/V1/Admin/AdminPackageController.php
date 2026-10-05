<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\PackageRequest;
use App\Http\Resources\AdminServiceResource;
use App\Models\Order;
use App\Models\Service;
use App\Models\ServicePackage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

class AdminPackageController extends Controller
{
    private const WITH = ['category', 'packages.features', 'features', 'formFields'];

    public function store(PackageRequest $request, Service $service): AdminServiceResource
    {
        DB::transaction(function () use ($request, $service) {
            $data = $request->safe()->except('features');

            $package = $service->packages()->create($data + [
                'slug' => $this->uniqueSlug($service, $data['name']),
                'sort_order' => $data['sort_order']
                    ?? ((int) ServicePackage::where('service_id', $service->id)->max('sort_order')) + 1,
            ]);

            $this->syncFeatures($package, $request->validated('features'));
            $this->keepSinglePopular($package);
        });

        return new AdminServiceResource($service->fresh(self::WITH));
    }

    public function update(PackageRequest $request, ServicePackage $package): AdminServiceResource
    {
        DB::transaction(function () use ($request, $package) {
            // Ny slug dia tsy miova (ampiasaina amin'ny URL)
            $package->update($request->safe()->except('features'));

            $this->syncFeatures($package, $request->validated('features'));
            $this->keepSinglePopular($package);
        });

        return new AdminServiceResource(Service::withTrashed()->findOrFail($package->service_id)->fresh(self::WITH));
    }

    public function destroy(ServicePackage $package): AdminServiceResource
    {
        if (Order::where('service_package_id', $package->id)->exists()) {
            throw new ConflictHttpException('This package is used by existing orders. Deactivate it instead.');
        }

        $serviceId = $package->service_id;
        $package->delete();

        return new AdminServiceResource(Service::withTrashed()->findOrFail($serviceId)->fresh(self::WITH));
    }

    private function syncFeatures(ServicePackage $package, array $features): void
    {
        $package->features()->delete();

        foreach ($features as $i => $feature) {
            $package->features()->create([
                'label' => $feature['label'],
                'is_included' => $feature['is_included'] ?? true,
                'sort_order' => $i,
            ]);
        }
    }

    private function keepSinglePopular(ServicePackage $package): void
    {
        if ($package->is_popular) {
            ServicePackage::where('service_id', $package->service_id)
                ->where('id', '!=', $package->id)
                ->update(['is_popular' => false]);
        }
    }

    private function uniqueSlug(Service $service, string $name): string
    {
        $base = Str::slug($name) ?: 'package';
        $slug = $base;
        $i = 2;

        while (ServicePackage::where('service_id', $service->id)->where('slug', $slug)->exists()) {
            $slug = $base . '-' . $i++;
        }

        return $slug;
    }
}