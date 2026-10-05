<?php

namespace Tests\Feature;

use App\Enums\OrderStatus;
use App\Enums\QuoteStatus;
use App\Models\Order;
use App\Models\Quote;
use App\Models\User;
use App\Notifications\OrderActivity;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class QuoteTest extends TestCase
{
    private User $staff;
    private User $customer;
    private Order $order;

    protected function setUp(): void
    {
        parent::setUp();

        $this->staff = $this->admin();
        $this->customer = $this->client();
        $this->order = $this->submittedOrder($this->customer, $this->customService());
    }

    private function createDraft(): int
    {
        return $this->actingAs($this->staff)
            ->postJson("/api/v1/admin/orders/{$this->order->uuid}/quotes")
            ->assertCreated()
            ->json('data.id');
    }

    private function payload(array $override = []): array
    {
        return array_merge([
            'tax_rate' => 20,
            'valid_until' => now()->addDays(10)->toDateString(),
            'notes' => 'Thank you for your trust.',
            'items' => [
                ['title' => 'Website design', 'quantity' => 1, 'unit_price' => 500000],
                ['title' => 'Hosting (months)', 'quantity' => 2, 'unit_price' => 50000, 'discount' => 10000],
            ],
        ], $override);
    }

    private function sendQuote(): int
    {
        $id = $this->createDraft();

        $this->putJson("/api/v1/admin/quotes/{$id}", $this->payload())->assertOk();
        $this->postJson("/api/v1/admin/quotes/{$id}/send")->assertOk();

        return $id;
    }

    private function orderStatus(): OrderStatus
    {
        return $this->order->refresh()->status;
    }

    public function test_drafting_a_quote_puts_the_order_in_quote_pending(): void
    {
        $this->createDraft();

        $this->assertSame(OrderStatus::QuotePending, $this->orderStatus());
    }

    public function test_totals_are_computed_by_the_server(): void
    {
        $id = $this->createDraft();

        // gross 600 000 − remise 10 000 = 590 000 ; TVA 20 % = 118 000 ; total 708 000
        $this->putJson("/api/v1/admin/quotes/{$id}", $this->payload(['total' => 1, 'subtotal' => 1]))
            ->assertOk()
            ->assertJsonPath('data.subtotal', 600000)
            ->assertJsonPath('data.discount', 10000)
            ->assertJsonPath('data.tax', 118000)
            ->assertJsonPath('data.total', 708000)
            ->assertJsonPath('data.items.1.total', 90000);
    }

    public function test_an_empty_quote_cannot_be_sent(): void
    {
        $id = $this->createDraft();

        $this->postJson("/api/v1/admin/quotes/{$id}/send")
            ->assertUnprocessable()
            ->assertJsonValidationErrors('items');
    }

    public function test_a_discount_cannot_exceed_the_line_amount(): void
    {
        $id = $this->createDraft();

        $this->putJson("/api/v1/admin/quotes/{$id}", $this->payload([
            'items' => [['title' => 'Logo', 'quantity' => 1, 'unit_price' => 1000, 'discount' => 5000]],
        ]))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('items.0.discount');
    }

    public function test_sending_locks_the_quote_and_notifies_the_client(): void
    {
        $id = $this->sendQuote();

        $this->assertSame(OrderStatus::QuoteSent, $this->orderStatus());
        $this->assertSame(QuoteStatus::Sent, Quote::findOrFail($id)->status);

        Notification::assertSentTo(
            $this->customer,
            OrderActivity::class,
            fn ($notification) => $notification->event === 'quote.sent'
        );

        $this->putJson("/api/v1/admin/quotes/{$id}", $this->payload())->assertStatus(409);
    }

    public function test_clients_never_see_drafts(): void
    {
        $id = $this->createDraft();

        $this->actingAs($this->customer)
            ->getJson("/api/v1/orders/{$this->order->uuid}/quotes")
            ->assertOk()
            ->assertJsonCount(0, 'data');

        $this->actingAs($this->staff)->putJson("/api/v1/admin/quotes/{$id}", $this->payload())->assertOk();
        $this->postJson("/api/v1/admin/quotes/{$id}/send")->assertOk();

        $this->actingAs($this->customer)
            ->getJson("/api/v1/orders/{$this->order->uuid}/quotes")
            ->assertJsonCount(1, 'data');
    }

    public function test_accepting_a_quote_moves_its_amounts_to_the_order(): void
    {
        $id = $this->sendQuote();

        $this->actingAs($this->customer)
            ->postJson("/api/v1/quotes/{$id}/accept", ['note' => 'Looks good'])
            ->assertOk()
            ->assertJsonPath('data.status', 'accepted');

        $order = $this->order->refresh();
        $this->assertSame(OrderStatus::AwaitingPayment, $order->status);
        $this->assertSame(708000, $order->total);
        $this->assertSame(708000, $order->due_amount);
        $this->assertCount(2, $order->items);
    }

    public function test_declining_reopens_the_order_and_a_new_version_copies_the_items(): void
    {
        $id = $this->sendQuote();

        $this->actingAs($this->customer)
            ->postJson("/api/v1/quotes/{$id}/reject", ['note' => 'Too expensive'])
            ->assertOk()
            ->assertJsonPath('data.status', 'rejected');

        $this->assertSame(OrderStatus::QuotePending, $this->orderStatus());

        $v2 = $this->actingAs($this->staff)
            ->postJson("/api/v1/admin/orders/{$this->order->uuid}/quotes")
            ->assertCreated()
            ->assertJsonPath('data.version', 2)
            ->assertJsonCount(2, 'data.items')
            ->json('data.id');

        $this->assertSame($id, Quote::findOrFail($v2)->parent_quote_id);
    }

    public function test_a_newer_version_supersedes_the_one_already_sent(): void
    {
        $v1 = $this->sendQuote();

        $this->actingAs($this->staff)
            ->postJson("/api/v1/admin/orders/{$this->order->uuid}/quotes")
            ->assertCreated();

        $this->assertSame(QuoteStatus::Superseded, Quote::findOrFail($v1)->status);

        $this->actingAs($this->customer)->postJson("/api/v1/quotes/{$v1}/accept")->assertStatus(409);
    }

    public function test_only_the_order_owner_can_answer_a_quote(): void
    {
        $id = $this->sendQuote();

        $this->actingAs($this->client())->postJson("/api/v1/quotes/{$id}/accept")->assertForbidden();
        $this->actingAs($this->staff)->postJson("/api/v1/quotes/{$id}/accept")->assertForbidden();

        $this->assertSame(OrderStatus::QuoteSent, $this->orderStatus());
    }

    public function test_expired_quotes_cannot_be_accepted(): void
    {
        $id = $this->sendQuote();
        Quote::findOrFail($id)->update(['valid_until' => now()->subDay()->toDateString()]);

        $this->actingAs($this->customer)->postJson("/api/v1/quotes/{$id}/accept")->assertStatus(409);

        $this->assertSame(QuoteStatus::Expired, Quote::findOrFail($id)->status);
        $this->assertSame(OrderStatus::QuotePending, $this->orderStatus());
    }

    public function test_the_expire_command_closes_overdue_quotes(): void
    {
        $id = $this->sendQuote();
        Quote::findOrFail($id)->update(['valid_until' => now()->subDay()->toDateString()]);

        $this->artisan('quotes:expire')->assertSuccessful();

        $this->assertSame(QuoteStatus::Expired, Quote::findOrFail($id)->status);
        $this->assertSame(OrderStatus::QuotePending, $this->orderStatus());
    }

    public function test_fixed_price_orders_do_not_use_quotes(): void
    {
        $fixed = $this->submittedOrder($this->customer, $this->fixedService());

        $this->actingAs($this->staff)
            ->postJson("/api/v1/admin/orders/{$fixed->uuid}/quotes")
            ->assertStatus(409);
    }

    public function test_drafts_can_be_deleted_but_sent_quotes_cannot(): void
    {
        $draft = $this->createDraft();
        $this->deleteJson("/api/v1/admin/quotes/{$draft}")->assertNoContent();

        $sent = $this->sendQuote();
        $this->deleteJson("/api/v1/admin/quotes/{$sent}")->assertStatus(409);
    }
}