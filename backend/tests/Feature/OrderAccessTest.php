<?php

namespace Tests\Feature;

use Tests\TestCase;

class OrderAccessTest extends TestCase
{
    public function test_guests_cannot_reach_orders(): void
    {
        $order = $this->draftOrder($this->client());

        $this->getJson('/api/v1/orders')->assertUnauthorized();
        $this->getJson("/api/v1/orders/{$order->uuid}")->assertUnauthorized();
    }

    public function test_clients_only_list_their_own_orders(): void
    {
        $service = $this->fixedService();
        $a = $this->client();
        $b = $this->client();

        $this->draftOrder($a, $service);
        $this->draftOrder($a, $service);
        $this->draftOrder($b, $service);

        $this->actingAs($a)->getJson('/api/v1/orders')
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_a_client_cannot_touch_another_clients_order(): void
    {
        $owner = $this->client();
        $intruder = $this->client();
        $order = $this->submittedOrder($owner);
        $this->paymentMethod();
        $uuid = $order->uuid;

        $this->actingAs($intruder);

        $this->getJson("/api/v1/orders/{$uuid}")->assertForbidden();
        $this->patchJson("/api/v1/orders/{$uuid}/brief", ['brief' => ['full_name' => 'Hacker']])->assertForbidden();
        $this->postJson("/api/v1/orders/{$uuid}/submit")->assertForbidden();
        $this->postJson("/api/v1/orders/{$uuid}/payments", ['method' => 'mvola', 'transaction_reference' => 'X'])->assertForbidden();
        $this->getJson("/api/v1/orders/{$uuid}/messages")->assertForbidden();
        $this->postJson("/api/v1/orders/{$uuid}/messages", ['body' => 'hello'])->assertForbidden();
        $this->getJson("/api/v1/orders/{$uuid}/quotes")->assertForbidden();
        $this->postForm("/api/v1/orders/{$uuid}/files", ['file' => $this->pdf()])->assertForbidden();
    }

    public function test_clients_cannot_use_admin_endpoints(): void
    {
        $client = $this->client();
        $order = $this->submittedOrder($client);
        $uuid = $order->uuid;

        $this->actingAs($client);

        foreach (
            [
                ['get', '/api/v1/admin/dashboard'],
                ['get', '/api/v1/admin/orders'],
                ['get', '/api/v1/admin/payments'],
                ['get', '/api/v1/admin/services'],
                ['get', '/api/v1/admin/payment-methods'],
                ['post', "/api/v1/admin/orders/{$uuid}/quotes"],
                ['patch', "/api/v1/admin/orders/{$uuid}/status"],
                ['post', "/api/v1/admin/orders/{$uuid}/deliverables"],
            ] as [$method, $url]
        ) {
            $this->{$method . 'Json'}($url)->assertForbidden();
        }
    }

    public function test_admins_can_view_any_order_including_drafts(): void
    {
        $client = $this->client();
        $draft = $this->draftOrder($client);

        $this->actingAs($this->admin())
            ->getJson("/api/v1/orders/{$draft->uuid}")
            ->assertOk()
            ->assertJsonPath('data.uuid', $draft->uuid);
    }

    public function test_admin_order_list_hides_drafts_and_exposes_the_client(): void
    {
        $client = $this->client();
        $this->draftOrder($client);
        $submitted = $this->submittedOrder($client);

        $this->actingAs($this->admin())
            ->getJson('/api/v1/admin/orders')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.uuid', $submitted->uuid);

        $this->getJson("/api/v1/admin/orders/{$submitted->uuid}")
            ->assertOk()
            ->assertJsonPath('data.client.email', $client->email);
    }

    public function test_admin_cannot_skip_payment_through_the_status_endpoint(): void
    {
        $order = $this->submittedOrder($this->client());

        $this->actingAs($this->admin())
            ->patchJson("/api/v1/admin/orders/{$order->uuid}/status", ['status' => 'paid'])
            ->assertUnprocessable();

        $this->patchJson("/api/v1/admin/orders/{$order->uuid}/status", ['status' => 'delivered'])
            ->assertUnprocessable();

        $this->patchJson("/api/v1/admin/orders/{$order->uuid}/status", ['status' => 'in_progress'])
            ->assertStatus(409);
    }
}
