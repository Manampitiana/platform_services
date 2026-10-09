<?php

namespace Tests\Feature;

use App\Enums\OrderStatus;
use App\Services\PaymentService;
use Tests\TestCase;

class AdminSeparationTest extends TestCase
{
    public function test_admins_cannot_place_orders_but_clients_can(): void
    {
        $this->fixedService();
        $data = ['service' => 'cv-design', 'package' => 'standard'];

        $this->actingAs($this->admin())->postJson('/api/v1/orders', $data)->assertForbidden();
        $this->actingAs($this->client())->postJson('/api/v1/orders', $data)->assertCreated();
    }

    public function test_an_admin_cannot_act_as_a_client_on_an_order_they_own(): void
    {
        $admin = $this->admin();
        $order = $this->submittedOrder($admin); // donnée héritée, créée sans passer par l'API
        $this->paymentMethod();

        $this->actingAs($admin);

        $this->patchJson("/api/v1/orders/{$order->uuid}/brief", ['brief' => ['full_name' => 'X']])->assertForbidden();
        $this->postJson("/api/v1/orders/{$order->uuid}/payments", [
            'method' => 'mvola', 'transaction_reference' => 'REF',
        ])->assertForbidden();
        $this->postJson("/api/v1/orders/{$order->uuid}/messages", ['body' => 'Hello me'])->assertForbidden();
    }

    public function test_an_admin_cannot_verify_or_reject_their_own_payment(): void
    {
        $admin = $this->admin();
        $order = $this->submittedOrder($admin);
        $this->paymentMethod();
        $payment = app(PaymentService::class)->create($order, $admin, 'mvola', 'REF-1', null);

        $this->actingAs($admin)
            ->postJson("/api/v1/admin/payments/{$payment->id}/verify")
            ->assertForbidden();

        $this->postJson("/api/v1/admin/payments/{$payment->id}/reject", ['note' => 'No'])->assertForbidden();

        $this->assertSame(OrderStatus::AwaitingPayment, $order->refresh()->status);

        // Admin hafa kosa afaka
        $this->actingAs($this->admin())
            ->postJson("/api/v1/admin/payments/{$payment->id}/verify")
            ->assertOk();

        $this->assertSame(OrderStatus::Paid, $order->refresh()->status);
    }

    public function test_an_admin_cannot_manage_quotes_status_or_deliveries_of_their_own_order(): void
    {
        $admin = $this->admin();
        $order = $this->submittedOrder($admin, $this->customService());

        $this->actingAs($admin);

        $this->postJson("/api/v1/admin/orders/{$order->uuid}/quotes")->assertForbidden();
        $this->patchJson("/api/v1/admin/orders/{$order->uuid}/status", ['status' => 'under_review'])->assertForbidden();
        $this->postJson("/api/v1/admin/orders/{$order->uuid}/deliverables", [
            'title' => 'Mine', 'delivery_url' => 'https://example.com',
        ])->assertForbidden();

        $this->assertSame(OrderStatus::Submitted, $order->refresh()->status);
    }

    public function test_an_admin_can_still_manage_a_clients_order(): void
    {
        $order = $this->submittedOrder($this->client(), $this->customService());

        $this->actingAs($this->admin())
            ->patchJson("/api/v1/admin/orders/{$order->uuid}/status", ['status' => 'under_review'])
            ->assertOk()
            ->assertJsonPath('data.status', 'under_review');
    }
}