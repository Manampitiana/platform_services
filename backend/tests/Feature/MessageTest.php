<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\OrderMessage;
use App\Models\User;
use App\Notifications\OrderActivity;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class MessageTest extends TestCase
{
    private User $staff;
    private User $customer;
    private Order $order;

    protected function setUp(): void
    {
        parent::setUp();

        $this->staff = $this->admin();
        $this->customer = $this->client();
        $this->order = $this->submittedOrder($this->customer);
    }

    public function test_owner_and_admin_can_talk_on_an_order(): void
    {
        $this->actingAs($this->customer)
            ->postJson("/api/v1/orders/{$this->order->uuid}/messages", ['body' => 'Hello team'])
            ->assertCreated()
            ->assertJsonPath('data.is_mine', true);

        $this->actingAs($this->staff)
            ->postJson("/api/v1/orders/{$this->order->uuid}/messages", ['body' => 'Hello Jane'])
            ->assertCreated();

        $this->actingAs($this->customer)
            ->getJson("/api/v1/orders/{$this->order->uuid}/messages")
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_an_empty_message_is_rejected(): void
    {
        $this->actingAs($this->customer)
            ->postJson("/api/v1/orders/{$this->order->uuid}/messages", [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('body');
    }

    public function test_draft_orders_are_not_open_for_messages(): void
    {
        $draft = $this->draftOrder($this->customer);

        $this->actingAs($this->customer)
            ->postJson("/api/v1/orders/{$draft->uuid}/messages", ['body' => 'Hi'])
            ->assertForbidden();
    }

    public function test_internal_notes_are_hidden_from_clients(): void
    {
        OrderMessage::create([
            'order_id' => $this->order->id, 'user_id' => $this->staff->id,
            'body' => 'Internal: client is slow to pay', 'is_internal' => true,
        ]);
        OrderMessage::create([
            'order_id' => $this->order->id, 'user_id' => $this->staff->id, 'body' => 'Public reply',
        ]);

        $this->actingAs($this->customer)
            ->getJson("/api/v1/orders/{$this->order->uuid}/messages")
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.body', 'Public reply');

        $this->actingAs($this->staff)
            ->getJson("/api/v1/orders/{$this->order->uuid}/messages")
            ->assertJsonCount(2, 'data');
    }

    public function test_unread_counts_follow_the_reading_of_messages(): void
    {
        $this->actingAs($this->staff)
            ->postJson("/api/v1/orders/{$this->order->uuid}/messages", ['body' => 'Hello'])
            ->assertCreated();

        // Ny hafatrao manokana dia tsy isaina
        $this->actingAs($this->staff)->getJson('/api/v1/messages/unread')->assertJsonPath('data.total', 0);

        $this->actingAs($this->customer)
            ->getJson('/api/v1/messages/unread')
            ->assertOk()
            ->assertJsonPath('data.total', 1)
            ->assertJsonPath("data.orders.{$this->order->uuid}", 1);

        // Mamaky ny hafatra → lasa "lu"
        $this->getJson("/api/v1/orders/{$this->order->uuid}/messages")->assertOk();

        $this->getJson('/api/v1/messages/unread')->assertJsonPath('data.total', 0);
    }

    public function test_a_burst_of_client_messages_sends_a_single_email_to_admins(): void
    {
        $this->actingAs($this->customer);

        foreach (['One', 'Two', 'Three'] as $body) {
            $this->postJson("/api/v1/orders/{$this->order->uuid}/messages", ['body' => $body])->assertCreated();
        }

        $sent = Notification::sent($this->staff, OrderActivity::class)
            ->filter(fn ($notification) => $notification->event === 'message.new');

        $this->assertCount(1, $sent);
    }

    public function test_attachments_are_private_to_the_conversation(): void
    {
        $id = $this->actingAs($this->customer)
            ->postForm("/api/v1/orders/{$this->order->uuid}/messages", ['attachment' => $this->pdf('spec.pdf')])
            ->assertCreated()
            ->assertJsonPath('data.has_attachment', true)
            ->json('data.id');

        $url = "/api/v1/orders/{$this->order->uuid}/messages/{$id}/attachment";

        $this->actingAs($this->client())->get($url)->assertForbidden();
        $this->actingAs($this->customer)->get($url)->assertOk();
        $this->actingAs($this->staff)->get($url)->assertOk();
    }
}