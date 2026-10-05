<?php

namespace Tests\Feature;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\Payment;
use App\Models\PaymentMethod;
use App\Models\User;
use App\Notifications\OrderActivity;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Illuminate\Testing\TestResponse;
use Tests\TestCase;

class PaymentTest extends TestCase
{
    private function pay(User $client, Order $order, array $data = []): TestResponse
    {
        return $this->actingAs($client)->postJson("/api/v1/orders/{$order->uuid}/payments", array_merge([
            'method' => 'mvola',
            'transaction_reference' => 'MP240101.1234.A56789',
        ], $data));
    }

    public function test_the_amount_is_the_amount_due_whatever_the_client_sends(): void
    {
        $client = $this->client();
        $order = $this->submittedOrder($client);
        $this->paymentMethod();

        $this->pay($client, $order, ['amount' => 1])
            ->assertCreated()
            ->assertJsonPath('data.amount', 25000)
            ->assertJsonPath('data.status', 'proof_submitted');
    }

    public function test_only_one_payment_can_wait_for_verification(): void
    {
        $client = $this->client();
        $order = $this->submittedOrder($client);
        $this->paymentMethod();

        $this->pay($client, $order)->assertCreated();
        $this->pay($client, $order)->assertStatus(409);
    }

    public function test_draft_orders_cannot_be_paid(): void
    {
        $client = $this->client();
        $order = $this->draftOrder($client);
        $this->paymentMethod();

        $this->pay($client, $order)->assertStatus(409);
    }

    public function test_unknown_or_inactive_methods_are_rejected(): void
    {
        $client = $this->client();
        $order = $this->submittedOrder($client);
        $this->paymentMethod('cash');
        PaymentMethod::where('code', 'cash')->update(['is_active' => false]);

        $this->pay($client, $order, ['method' => 'cash'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('method');

        $this->pay($client, $order, ['method' => 'bitcoin'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('method');
    }

    public function test_a_reference_or_a_proof_is_required(): void
    {
        $client = $this->client();
        $order = $this->submittedOrder($client);
        $this->paymentMethod();

        $this->pay($client, $order, ['transaction_reference' => null])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('transaction_reference');
    }

    public function test_proofs_are_stored_privately_and_only_the_owner_and_admins_can_open_them(): void
    {
        $owner = $this->client();
        $other = $this->client();
        $admin = $this->admin();
        $order = $this->submittedOrder($owner);
        $this->paymentMethod();

        $id = $this->actingAs($owner)
            ->postForm("/api/v1/orders/{$order->uuid}/payments", [
                'method' => 'mvola',
                'proof' => $this->pdf('proof.pdf'),
            ])
            ->assertCreated()
            ->assertJsonPath('data.has_proof', true)
            ->assertJsonMissingPath('data.proof_path')
            ->json('data.id');

        Storage::disk('local')->assertExists(Payment::findOrFail($id)->proof_path);

        $this->actingAs($other)->get("/api/v1/payments/{$id}/proof")->assertForbidden();
        $this->actingAs($owner)->get("/api/v1/payments/{$id}/proof")->assertOk();
        $this->actingAs($admin)->get("/api/v1/payments/{$id}/proof")->assertOk();
    }

    public function test_a_new_payment_notifies_the_admins_and_shows_up_in_their_queue(): void
    {
        $admin = $this->admin();
        $client = $this->client();
        $order = $this->submittedOrder($client);
        $this->paymentMethod();

        $this->pay($client, $order)->assertCreated();

        Notification::assertSentTo(
            $admin,
            OrderActivity::class,
            fn ($notification) => $notification->event === 'payment.submitted'
        );

        $this->actingAs($admin)
            ->getJson('/api/v1/admin/payments?status=proof_submitted')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.order.client', $client->name);
    }

    public function test_verifying_a_payment_marks_the_order_as_paid(): void
    {
        $client = $this->client();
        $admin = $this->admin();
        $order = $this->submittedOrder($client);
        $this->paymentMethod();

        $paymentId = $this->pay($client, $order)->json('data.id');

        $this->actingAs($admin)
            ->postJson("/api/v1/admin/payments/{$paymentId}/verify")
            ->assertOk()
            ->assertJsonPath('data.status', 'paid');

        $order->refresh();
        $this->assertSame(OrderStatus::Paid, $order->status);
        $this->assertSame(25000, $order->paid_amount);
        $this->assertSame(0, $order->due_amount);

        Notification::assertSentTo(
            $client,
            OrderActivity::class,
            fn ($notification) => $notification->event === 'payment.verified'
        );
    }

    public function test_a_payment_cannot_be_processed_twice(): void
    {
        $client = $this->client();
        $admin = $this->admin();
        $order = $this->submittedOrder($client);
        $this->paymentMethod();
        $paymentId = $this->pay($client, $order)->json('data.id');

        $this->actingAs($admin)->postJson("/api/v1/admin/payments/{$paymentId}/verify")->assertOk();
        $this->postJson("/api/v1/admin/payments/{$paymentId}/verify")->assertStatus(409);
        $this->postJson("/api/v1/admin/payments/{$paymentId}/reject", ['note' => 'Too late'])->assertStatus(409);
    }

    public function test_rejecting_needs_a_reason_and_lets_the_client_pay_again(): void
    {
        $client = $this->client();
        $admin = $this->admin();
        $order = $this->submittedOrder($client);
        $this->paymentMethod();
        $paymentId = $this->pay($client, $order)->json('data.id');

        $this->actingAs($admin)
            ->postJson("/api/v1/admin/payments/{$paymentId}/reject")
            ->assertUnprocessable()
            ->assertJsonValidationErrors('note');

        $this->postJson("/api/v1/admin/payments/{$paymentId}/reject", ['note' => 'Reference not found'])
            ->assertOk()
            ->assertJsonPath('data.status', 'rejected');

        $this->assertSame(OrderStatus::AwaitingPayment, $order->refresh()->status);
        $this->pay($client, $order)->assertCreated();
    }

    public function test_clients_cannot_verify_their_own_payments(): void
    {
        $client = $this->client();
        $order = $this->submittedOrder($client);
        $this->paymentMethod();
        $paymentId = $this->pay($client, $order)->json('data.id');

        $this->postJson("/api/v1/admin/payments/{$paymentId}/verify")->assertForbidden();

        $this->assertSame(OrderStatus::AwaitingPayment, $order->refresh()->status);
    }
}