<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\OrderFile;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Testing\TestResponse;
use Tests\TestCase;

class FileTest extends TestCase
{
    private User $customer;
    private Order $order;

    protected function setUp(): void
    {
        parent::setUp();

        $this->customer = $this->client();
        $this->order = $this->draftOrder($this->customer);
    }

    private function upload(?UploadedFile $file = null, string $category = 'attachment', ?User $as = null, ?Order $order = null): TestResponse
    {
        $order ??= $this->order;

        return $this->actingAs($as ?? $this->customer)->postForm("/api/v1/orders/{$order->uuid}/files", [
            'file' => $file ?? $this->pdf('brief.pdf'),
            'category' => $category,
        ]);
    }

    public function test_files_are_stored_privately_under_a_generated_name(): void
    {
        $this->upload()
            ->assertCreated()
            ->assertJsonPath('data.original_name', 'brief.pdf')
            ->assertJsonMissingPath('data.path');

        $file = OrderFile::firstOrFail();

        Storage::disk('local')->assertExists($file->path);
        Storage::disk('public')->assertMissing($file->path);
        $this->assertStringStartsWith("orders/{$this->order->uuid}/", $file->path);
        $this->assertNotSame('brief.pdf', basename($file->path));
        $this->assertTrue($file->is_private);
    }

    public function test_dangerous_file_types_are_rejected(): void
    {
        $this->upload(UploadedFile::fake()->create('virus.exe', 10))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('file');

        $this->upload(UploadedFile::fake()->create('shell.php', 10))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('file');

        $this->assertDatabaseCount('order_files', 0);
    }

    public function test_files_larger_than_10_mb_are_rejected(): void
    {
        $this->upload($this->pdf('big.pdf', 10241))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('file');
    }

    public function test_an_order_accepts_at_most_ten_files(): void
    {
        for ($i = 1; $i <= 10; $i++) {
            $this->order->files()->create([
                'file_name' => "f{$i}.pdf", 'original_name' => "f{$i}.pdf", 'path' => "orders/x/f{$i}.pdf",
            ]);
        }

        $this->upload()
            ->assertUnprocessable()
            ->assertJsonValidationErrors('file');
    }

    public function test_files_are_locked_once_the_order_is_submitted(): void
    {
        $submitted = $this->submittedOrder($this->customer);

        $this->upload(order: $submitted)->assertStatus(409);
    }

    public function test_a_file_can_be_removed_from_a_draft(): void
    {
        $id = $this->upload()->json('data.id');
        $path = OrderFile::findOrFail($id)->path;

        $this->deleteJson("/api/v1/orders/{$this->order->uuid}/files/{$id}")->assertNoContent();

        Storage::disk('local')->assertMissing($path);
        $this->assertDatabaseCount('order_files', 0);
    }

    public function test_only_the_owner_and_admins_can_download(): void
    {
        $id = $this->upload()->json('data.id');
        $url = "/api/v1/orders/{$this->order->uuid}/files/{$id}/download";

        $this->actingAs($this->client())->get($url)->assertForbidden();
        $this->actingAs($this->customer)->get($url)->assertOk();
        $this->actingAs($this->admin())->get($url)->assertOk();
    }

    public function test_a_file_cannot_be_reached_through_someone_elses_order(): void
    {
        $id = $this->upload()->json('data.id');

        $other = $this->client();
        $otherOrder = $this->draftOrder($other);

        // B utilise SA commande pour tenter d'atteindre le fichier de A
        $this->actingAs($other)
            ->get("/api/v1/orders/{$otherOrder->uuid}/files/{$id}/download")
            ->assertNotFound();

        $this->deleteJson("/api/v1/orders/{$otherOrder->uuid}/files/{$id}")->assertNotFound();
        $this->assertDatabaseCount('order_files', 1);
    }

    public function test_required_file_fields_block_the_submission_until_uploaded(): void
    {
        $service = $this->fixedService();
        $service->formFields()->create([
            'name' => 'brief_doc', 'label' => 'Requirements document',
            'type' => 'file', 'is_required' => true, 'sort_order' => 9,
        ]);

        $this->actingAs($this->customer)
            ->patchJson("/api/v1/orders/{$this->order->uuid}/brief", [
                'brief' => ['full_name' => 'Jane Doe', 'cv_language' => 'English'],
            ])
            ->assertOk();

        $this->postJson("/api/v1/orders/{$this->order->uuid}/submit")
            ->assertUnprocessable()
            ->assertJsonValidationErrors('files.brief_doc');

        $this->upload($this->pdf('requirements.pdf'), 'brief_doc')->assertCreated();

        $this->postJson("/api/v1/orders/{$this->order->uuid}/submit")->assertOk();
    }
}