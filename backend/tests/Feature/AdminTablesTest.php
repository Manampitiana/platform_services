<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\PaymentService;
use Tests\TestCase;

class AdminTablesTest extends TestCase
{
    public function test_orders_can_be_sorted_searched_and_counted(): void
    {
        $jane = User::factory()->create(['name' => 'Jane Rakoto']);
        $paul = User::factory()->create(['name' => 'Paul Randria']);

        $cheap = $this->submittedOrder($jane);
        $cheap->forceFill(['total' => 10000])->save();
        $dear = $this->submittedOrder($paul);
        $dear->forceFill(['total' => 90000])->save();
        $this->draftOrder($paul); // tsy ao amin'ny lisitra mihitsy

        $this->actingAs($this->admin());

        $this->getJson('/api/v1/admin/orders?sort=total&dir=asc')
            ->assertOk()
            ->assertJsonPath('data.0.uuid', $cheap->uuid)
            ->assertJsonPath('data.1.uuid', $dear->uuid)
            ->assertJsonPath('meta.total', 2)
            ->assertJsonPath('counts.awaiting_payment', 2);

        $this->getJson('/api/v1/admin/orders?sort=total&dir=desc')
            ->assertJsonPath('data.0.uuid', $dear->uuid);

        $this->getJson('/api/v1/admin/orders?search=Randria')
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.uuid', $dear->uuid)
            ->assertJsonPath('counts.awaiting_payment', 1);
    }

    public function test_status_counts_ignore_the_status_filter(): void
    {
        $client = $this->client();
        $this->submittedOrder($client);                          // awaiting_payment
        $this->submittedOrder($client, $this->customService());  // submitted

        $this->actingAs($this->admin())
            ->getJson('/api/v1/admin/orders?status=submitted')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('counts.submitted', 1)
            ->assertJsonPath('counts.awaiting_payment', 1);
    }

    public function test_unsupported_sort_and_page_size_fall_back_to_safe_defaults(): void
    {
        $this->submittedOrder($this->client());

        $this->actingAs($this->admin())
            ->getJson('/api/v1/admin/orders?sort=password&dir=sideways&per_page=9999')
            ->assertOk()
            ->assertJsonPath('meta.per_page', 15);
    }

    public function test_payments_can_be_filtered_sorted_searched_and_counted(): void
    {
        $admin = $this->admin();
        $this->paymentMethod();

        $a = $this->client();
        $b = $this->client();
        $orderA = $this->submittedOrder($a);
        $orderB = $this->submittedOrder($b);
        $orderB->forceFill(['due_amount' => 50000])->save();

        $payments = app(PaymentService::class);
        $small = $payments->create($orderA, $a, 'mvola', 'REF-ALPHA', null); // 25 000
        $big = $payments->create($orderB, $b, 'mvola', 'REF-BETA', null);    // 50 000
        $payments->verify($big, $admin);

        $this->actingAs($admin);

        $this->getJson('/api/v1/admin/payments?sort=amount&dir=desc')
            ->assertOk()
            ->assertJsonPath('data.0.id', $big->id)
            ->assertJsonPath('counts.proof_submitted', 1)
            ->assertJsonPath('counts.paid', 1);

        $this->getJson('/api/v1/admin/payments?status=paid')
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('counts.proof_submitted', 1);

        $this->getJson('/api/v1/admin/payments?search=ALPHA')
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $small->id);
    }

    public function test_clients_cannot_read_the_admin_tables(): void
    {
        $this->actingAs($this->client());

        $this->getJson('/api/v1/admin/orders')->assertForbidden();
        $this->getJson('/api/v1/admin/payments')->assertForbidden();
    }
}