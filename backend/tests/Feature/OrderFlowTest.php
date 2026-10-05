<?php

namespace Tests\Feature;

use App\Models\User;
use App\Notifications\OrderActivity;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class OrderFlowTest extends TestCase
{
    public function test_draft_price_comes_from_the_server_and_ignores_client_values(): void
    {
        $this->fixedService();

        $this->actingAs($this->client())
            ->postJson('/api/v1/orders', [
                'service' => 'cv-design', 'package' => 'standard', 'total' => 1, 'subtotal' => 1, 'due_amount' => 1,
            ])
            ->assertCreated()
            ->assertJsonPath('data.status', 'draft')
            ->assertJsonPath('data.total', 25000)
            ->assertJsonPath('data.due_amount', 25000)
            ->assertJsonPath('data.package.slug', 'standard');
    }

    public function test_a_package_is_required_when_the_service_has_packages(): void
    {
        $this->fixedService();

        $this->actingAs($this->client())
            ->postJson('/api/v1/orders', ['service' => 'cv-design'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('package');

        $this->postJson('/api/v1/orders', ['service' => 'cv-design', 'package' => 'platinum'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('package');
    }

    public function test_unknown_services_return_404(): void
    {
        $this->actingAs($this->client())
            ->postJson('/api/v1/orders', ['service' => 'does-not-exist'])
            ->assertNotFound();
    }

    public function test_custom_projects_have_no_package_and_no_price_yet(): void
    {
        $this->customService();

        $this->actingAs($this->client())
            ->postJson('/api/v1/orders', ['service' => 'custom-project'])
            ->assertCreated()
            ->assertJsonPath('data.type', 'custom')
            ->assertJsonPath('data.total', 0);
    }

    public function test_brief_values_are_validated_against_the_service_fields(): void
    {
        $client = $this->client();
        $order = $this->draftOrder($client);

        $this->actingAs($client)
            ->patchJson("/api/v1/orders/{$order->uuid}/brief", ['brief' => ['cv_language' => 'Klingon']])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('brief.cv_language');
    }

    public function test_unknown_brief_keys_are_dropped(): void
    {
        $client = $this->client();
        $order = $this->draftOrder($client);

        $this->actingAs($client)
            ->patchJson("/api/v1/orders/{$order->uuid}/brief", [
                'brief' => ['full_name' => 'Jane', 'hacker' => '<script>alert(1)</script>'],
            ])
            ->assertOk()
            ->assertJsonPath('data.brief_data.full_name', 'Jane')
            ->assertJsonMissingPath('data.brief_data.hacker');
    }

    public function test_changing_the_package_recalculates_the_total(): void
    {
        $client = $this->client();
        $order = $this->draftOrder($client, null, 'standard');

        $this->actingAs($client)
            ->patchJson("/api/v1/orders/{$order->uuid}/brief", ['brief' => [], 'package' => 'basic'])
            ->assertOk()
            ->assertJsonPath('data.total', 15000)
            ->assertJsonPath('data.due_amount', 15000)
            ->assertJsonCount(1, 'data.items');
    }

    public function test_submission_requires_every_required_field(): void
    {
        $client = $this->client();
        $order = $this->draftOrder($client);

        $this->actingAs($client)
            ->patchJson("/api/v1/orders/{$order->uuid}/brief", ['brief' => ['full_name' => 'Jane']])
            ->assertOk();

        $this->postJson("/api/v1/orders/{$order->uuid}/submit")
            ->assertUnprocessable()
            ->assertJsonValidationErrors('brief.cv_language');
    }

    public function test_fixed_price_orders_go_straight_to_awaiting_payment_with_a_full_history(): void
    {
        $client = $this->client();
        $order = $this->draftOrder($client);

        $this->actingAs($client)
            ->patchJson("/api/v1/orders/{$order->uuid}/brief", [
                'brief' => ['full_name' => 'Jane Doe', 'cv_language' => 'English'],
            ])
            ->assertOk();

        $this->postJson("/api/v1/orders/{$order->uuid}/submit")
            ->assertOk()
            ->assertJsonPath('data.status', 'awaiting_payment');

        $this->assertSame(
            ['draft', 'submitted', 'awaiting_payment'],
            $order->statusHistories()->pluck('to_status')->all()
        );
    }

    public function test_custom_orders_wait_for_review_and_notify_admins(): void
    {
        $admin = $this->admin();
        $order = $this->submittedOrder($this->client(), $this->customService());

        $this->assertSame('submitted', $order->status->value);
        $this->assertSame(0, $order->total);

        Notification::assertSentTo(
            $admin,
            OrderActivity::class,
            fn ($notification) => $notification->event === 'order.submitted'
        );
    }

    public function test_submitted_orders_are_locked(): void
    {
        $client = $this->client();
        $order = $this->submittedOrder($client);

        $this->actingAs($client)
            ->patchJson("/api/v1/orders/{$order->uuid}/brief", ['brief' => ['full_name' => 'Changed']])
            ->assertStatus(409);

        $this->postJson("/api/v1/orders/{$order->uuid}/submit")->assertStatus(409);
    }

    public function test_summary_counts_orders_by_status(): void
    {
        $client = $this->client();
        $this->draftOrder($client);
        $this->submittedOrder($client);

        $this->actingAs($client)
            ->getJson('/api/v1/orders/summary')
            ->assertOk()
            ->assertJsonPath('data.counts.draft', 1)
            ->assertJsonPath('data.counts.awaiting_payment', 1)
            ->assertJsonCount(2, 'data.recent');
    }
}