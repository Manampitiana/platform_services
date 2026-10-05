<?php

namespace Tests\Feature;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\User;
use App\Notifications\OrderActivity;
use Illuminate\Support\Facades\Notification;
use Illuminate\Testing\TestResponse;
use Tests\TestCase;

class DeliverableTest extends TestCase
{
    private User $staff;
    private User $customer;
    private Order $order;

    protected function setUp(): void
    {
        parent::setUp();

        $this->staff = $this->admin();
        $this->customer = $this->client();
        $this->order = $this->inProgressOrder($this->customer, $this->staff); // Standard = 2 révisions
    }

    private function deliver(array $data = []): TestResponse
    {
        return $this->actingAs($this->staff)->postForm(
            "/api/v1/admin/orders/{$this->order->uuid}/deliverables",
            array_merge(['title' => 'Final files', 'file' => $this->pdf('final.pdf', 120)], $data)
        );
    }

    private function requestRevision(int $id, string $note = 'Please adjust the colors'): TestResponse
    {
        return $this->actingAs($this->customer)
            ->postJson("/api/v1/deliverables/{$id}/revision-request", ['note' => $note]);
    }

    private function orderStatus(): OrderStatus
    {
        return $this->order->refresh()->status;
    }

    public function test_admin_delivers_a_file_and_the_client_is_notified(): void
    {
        $this->deliver()
            ->assertCreated()
            ->assertJsonPath('data.version', 1)
            ->assertJsonPath('data.status', 'delivered')
            ->assertJsonPath('data.has_file', true)
            ->assertJsonMissingPath('data.file_path');

        $this->assertSame(OrderStatus::Delivered, $this->orderStatus());

        Notification::assertSentTo(
            $this->customer,
            OrderActivity::class,
            fn ($notification) => $notification->event === 'deliverable.delivered'
        );
    }

    public function test_a_delivery_can_be_a_link_only(): void
    {
        $this->actingAs($this->staff)
            ->postJson("/api/v1/admin/orders/{$this->order->uuid}/deliverables", [
                'title' => 'Your website',
                'delivery_url' => 'https://example.com',
                'delivery_notes' => 'Admin access sent by email.',
            ])
            ->assertCreated()
            ->assertJsonPath('data.has_file', false)
            ->assertJsonPath('data.delivery_url', 'https://example.com');
    }

    public function test_a_delivery_needs_a_file_or_a_link(): void
    {
        $this->actingAs($this->staff)
            ->postJson("/api/v1/admin/orders/{$this->order->uuid}/deliverables", ['title' => 'Nothing'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('file');
    }

    public function test_nothing_can_be_delivered_before_production(): void
    {
        $unpaid = $this->submittedOrder($this->customer);

        $this->actingAs($this->staff)
            ->postForm("/api/v1/admin/orders/{$unpaid->uuid}/deliverables", ['title' => 'Too early', 'file' => $this->pdf()])
            ->assertStatus(409);
    }

    public function test_clients_cannot_deliver(): void
    {
        $this->actingAs($this->customer)
            ->postForm("/api/v1/admin/orders/{$this->order->uuid}/deliverables", ['title' => 'Mine', 'file' => $this->pdf()])
            ->assertForbidden();
    }

    public function test_approving_completes_the_order(): void
    {
        $id = $this->deliver()->json('data.id');

        $this->actingAs($this->customer)
            ->postJson("/api/v1/deliverables/{$id}/approve")
            ->assertOk()
            ->assertJsonPath('data.status', 'approved');

        $this->assertSame(OrderStatus::Completed, $this->orderStatus());
    }

    public function test_revisions_are_limited_by_the_package(): void
    {
        foreach ([1, 2] as $round) {
            $id = $this->deliver()->assertCreated()->json('data.id');

            $this->requestRevision($id)
                ->assertOk()
                ->assertJsonPath('data.status', 'revision_requested');

            $this->assertSame($round, $this->order->refresh()->revisions_used);
            $this->assertSame(OrderStatus::Revision, $this->order->status);
        }

        $id = $this->deliver()->assertCreated()->json('data.id');

        $this->requestRevision($id, 'One more change please')->assertStatus(409);

        $this->assertSame(2, $this->order->refresh()->revisions_used);
        $this->assertSame(OrderStatus::Delivered, $this->order->status);
    }

    public function test_a_revision_note_is_required(): void
    {
        $id = $this->deliver()->json('data.id');

        $this->requestRevision($id, 'no')
            ->assertUnprocessable()
            ->assertJsonValidationErrors('note');
    }

    public function test_only_the_latest_version_can_be_reviewed(): void
    {
        $v1 = $this->deliver()->json('data.id');
        $this->requestRevision($v1)->assertOk();
        $this->deliver()->assertCreated()->assertJsonPath('data.version', 2);

        $this->actingAs($this->customer)->postJson("/api/v1/deliverables/{$v1}/approve")->assertStatus(409);
    }

    public function test_other_clients_cannot_review_or_download(): void
    {
        $id = $this->deliver()->json('data.id');
        $intruder = $this->client();

        $this->actingAs($intruder)->postJson("/api/v1/deliverables/{$id}/approve")->assertForbidden();
        $this->requestRevisionAs($intruder, $id)->assertForbidden();
        $this->actingAs($intruder)->get("/api/v1/deliverables/{$id}/download")->assertForbidden();

        $this->actingAs($this->customer)->get("/api/v1/deliverables/{$id}/download")->assertOk();
        $this->actingAs($this->staff)->get("/api/v1/deliverables/{$id}/download")->assertOk();
    }

    public function test_admins_cannot_approve_on_behalf_of_the_client(): void
    {
        $id = $this->deliver()->json('data.id');

        $this->actingAs($this->staff)->postJson("/api/v1/deliverables/{$id}/approve")->assertForbidden();
    }

    private function requestRevisionAs(User $user, int $id): TestResponse
    {
        return $this->actingAs($user)
            ->postJson("/api/v1/deliverables/{$id}/revision-request", ['note' => 'Please change things']);
    }
}