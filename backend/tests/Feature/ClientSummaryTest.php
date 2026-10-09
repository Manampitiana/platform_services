<?php

namespace Tests\Feature;

use App\Services\PaymentService;
use Tests\TestCase;

class ClientSummaryTest extends TestCase
{
    public function test_summary_lists_orders_waiting_for_the_client_but_not_drafts(): void
    {
        $client = $this->client();
        $waiting = $this->submittedOrder($client); // awaiting_payment
        $this->draftOrder($client);

        $this->actingAs($client)
            ->getJson('/api/v1/orders/summary')
            ->assertOk()
            ->assertJsonCount(1, 'data.actions')
            ->assertJsonPath('data.actions.0.uuid', $waiting->uuid)
            ->assertJsonPath('data.actions.0.status', 'awaiting_payment');
    }

    public function test_an_order_whose_payment_is_under_review_is_not_waiting_for_the_client(): void
    {
        $client = $this->client();
        $order = $this->submittedOrder($client);
        $this->paymentMethod();
        app(PaymentService::class)->create($order, $client, 'mvola', 'REF-1', null);

        $this->actingAs($client)
            ->getJson('/api/v1/orders/summary')
            ->assertOk()
            ->assertJsonCount(0, 'data.actions');
    }

    public function test_other_clients_orders_never_appear_in_the_summary(): void
    {
        $this->submittedOrder($this->client());

        $this->actingAs($this->client())
            ->getJson('/api/v1/orders/summary')
            ->assertJsonCount(0, 'data.actions');
    }
}