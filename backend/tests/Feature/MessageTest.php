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
            'order_id' => $this->order->id,
            'user_id' => $this->staff->id,
            'body' => 'Internal: client is slow to pay',
            'is_internal' => true,
        ]);
        OrderMessage::create([
            'order_id' => $this->order->id,
            'user_id' => $this->staff->id,
            'body' => 'Public reply',
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
            ->filter(fn($notification) => $notification->event === 'message.new');

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

    private function say(User $as, string $body = 'Hello'): int
    {
        return $this->actingAs($as)
            ->postJson("/api/v1/orders/{$this->order->uuid}/messages", ['body' => $body])
            ->assertCreated()
            ->json('data.id');
    }

    public function test_authors_can_delete_a_recent_message_and_its_content_is_hidden(): void
    {
        $id = $this->say($this->customer, 'Oops wrong order');

        $this->deleteJson("/api/v1/orders/{$this->order->uuid}/messages/{$id}")
            ->assertOk()
            ->assertJsonPath('data.is_deleted', true)
            ->assertJsonPath('data.body', null);

        $this->actingAs($this->staff)
            ->getJson("/api/v1/orders/{$this->order->uuid}/messages")
            ->assertJsonPath('data.0.is_deleted', true)
            ->assertJsonPath('data.0.body', null);

        // Voatahiry ho an'ny audit
        $this->assertDatabaseHas('order_messages', ['id' => $id, 'body' => 'Oops wrong order']);
    }

    public function test_authors_cannot_delete_a_message_after_ten_minutes(): void
    {
        $id = $this->say($this->customer);

        $this->travel(11)->minutes();

        $this->deleteJson("/api/v1/orders/{$this->order->uuid}/messages/{$id}")->assertForbidden();
    }

    public function test_nobody_can_delete_someone_elses_message_except_admins(): void
    {
        $fromStaff = $this->say($this->staff, 'Hello Jane');
        $fromCustomer = $this->say($this->customer, 'Hello team');

        $this->actingAs($this->customer)
            ->deleteJson("/api/v1/orders/{$this->order->uuid}/messages/{$fromStaff}")
            ->assertForbidden();

        $this->actingAs($this->client())
            ->deleteJson("/api/v1/orders/{$this->order->uuid}/messages/{$fromCustomer}")
            ->assertForbidden();

        $this->travel(30)->minutes();

        // Admin: modération, na efa lany aza ny 10 minitra
        $this->actingAs($this->staff)
            ->deleteJson("/api/v1/orders/{$this->order->uuid}/messages/{$fromCustomer}")
            ->assertOk();
    }

    public function test_a_message_cannot_be_deleted_twice(): void
    {
        $id = $this->say($this->customer);

        $this->deleteJson("/api/v1/orders/{$this->order->uuid}/messages/{$id}")->assertOk();
        $this->deleteJson("/api/v1/orders/{$this->order->uuid}/messages/{$id}")->assertForbidden();
    }

    public function test_a_message_cannot_be_deleted_through_another_order(): void
    {
        $id = $this->say($this->customer);

        $other = $this->client();
        $otherOrder = $this->submittedOrder($other);

        $this->actingAs($other)
            ->deleteJson("/api/v1/orders/{$otherOrder->uuid}/messages/{$id}")
            ->assertNotFound();
    }

    public function test_deleted_attachments_can_no_longer_be_downloaded(): void
    {
        $id = $this->actingAs($this->customer)
            ->postForm("/api/v1/orders/{$this->order->uuid}/messages", ['attachment' => $this->pdf('spec.pdf')])
            ->assertCreated()
            ->json('data.id');

        $url = "/api/v1/orders/{$this->order->uuid}/messages/{$id}/attachment";

        $this->get($url)->assertOk();
        $this->deleteJson("/api/v1/orders/{$this->order->uuid}/messages/{$id}")->assertOk();
        $this->get($url)->assertNotFound();
    }

    public function test_deleted_messages_are_not_counted_as_unread(): void
    {
        $id = $this->say($this->staff);

        $this->actingAs($this->customer)->getJson('/api/v1/messages/unread')->assertJsonPath('data.total', 1);

        $this->actingAs($this->staff)
            ->deleteJson("/api/v1/orders/{$this->order->uuid}/messages/{$id}")
            ->assertOk();

        $this->actingAs($this->customer)->getJson('/api/v1/messages/unread')->assertJsonPath('data.total', 0);
    }
}
