<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\RevisionRequest;
use App\Http\Resources\DeliverableResource;
use App\Models\Deliverable;
use App\Services\DeliverableService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;

class DeliverableController extends Controller
{
    public function __construct(private DeliverableService $deliverables)
    {
    }

    public function download(Deliverable $deliverable)
    {
        Gate::authorize('view', $deliverable->order);
        abort_unless($deliverable->file_path, 404);

        return Storage::disk($deliverable->disk)
            ->download($deliverable->file_path, $deliverable->original_name);
    }

    public function approve(Request $request, Deliverable $deliverable): DeliverableResource
    {
        Gate::authorize('update', $deliverable->order);

        return new DeliverableResource($this->deliverables->approve($deliverable, $request->user()));
    }

    public function requestRevision(RevisionRequest $request, Deliverable $deliverable): DeliverableResource
    {
        Gate::authorize('update', $deliverable->order);

        return new DeliverableResource(
            $this->deliverables->requestRevision($deliverable, $request->user(), $request->validated('note'))
        );
    }
}