<?php

namespace Tests\Feature;

use App\Models\ContactMessage;
use App\Notifications\ContactReceived;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class ContactTest extends TestCase
{
    private function payload(array $override = []): array
    {
        return array_merge([
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'subject' => 'General question',
            'message' => 'Hello, I would like to know more about your logo packages.',
        ], $override);
    }

    public function test_a_message_is_stored_and_admins_are_notified(): void
    {
        $admin = $this->admin();

        $this->postJson('/api/v1/contact', $this->payload())->assertCreated();

        $this->assertDatabaseHas('contact_messages', ['email' => 'jane@example.com', 'is_spam' => false]);
        Notification::assertSentTo($admin, ContactReceived::class);
    }

    public function test_a_filled_honeypot_is_kept_as_spam_without_notifying_anyone(): void
    {
        $this->admin();

        $this->postJson('/api/v1/contact', $this->payload(['contact_extra' => 'http://spam.example']))
            ->assertCreated();

        $this->assertDatabaseHas('contact_messages', ['email' => 'jane@example.com', 'is_spam' => true]);
        Notification::assertNothingSent();
    }

    public function test_a_browser_autofilled_honeypot_is_not_treated_as_spam(): void
    {
        $admin = $this->admin();

        // Ny navigateur dia mameno ny champ miafina amin'ny e-mail an'ny mpampiasa
        $this->postJson('/api/v1/contact', $this->payload(['contact_extra' => 'JANE@example.com']))
            ->assertCreated();

        $this->assertDatabaseHas('contact_messages', ['email' => 'jane@example.com', 'is_spam' => false]);
        Notification::assertSentTo($admin, ContactReceived::class);
    }

    public function test_the_form_is_validated(): void
    {
        $this->postJson('/api/v1/contact', $this->payload(['subject' => 'Hack', 'message' => 'short']))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['subject', 'message']);

        $this->assertDatabaseCount('contact_messages', 0);
    }

    public function test_the_form_is_rate_limited(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/v1/contact', $this->payload())->assertCreated();
        }

        $this->postJson('/api/v1/contact', $this->payload())->assertStatus(429);
    }

    public function test_the_inbox_is_for_admins_only_and_hides_spam(): void
    {
        $this->postJson('/api/v1/contact', $this->payload())->assertCreated();
        $this->postJson('/api/v1/contact', $this->payload(['contact_extra' => 'x']))->assertCreated();

        $this->getJson('/api/v1/admin/contact-messages')->assertUnauthorized();
        $this->actingAs($this->client())->getJson('/api/v1/admin/contact-messages')->assertForbidden();

        $this->actingAs($this->admin())
            ->getJson('/api/v1/admin/contact-messages')
            ->assertOk()
            ->assertJsonCount(1, 'data');

        $this->getJson('/api/v1/admin/contact-messages/count')->assertJsonPath('data.open', 1);
        $this->getJson('/api/v1/admin/contact-messages?status=spam')->assertJsonCount(1, 'data');
    }

    public function test_an_admin_can_mark_a_message_as_handled_reopen_it_and_delete_it(): void
    {
        $this->postJson('/api/v1/contact', $this->payload())->assertCreated();
        $message = ContactMessage::firstOrFail();

        $this->actingAs($this->admin());

        $this->postJson("/api/v1/admin/contact-messages/{$message->id}/handle")
            ->assertOk()
            ->assertJsonPath('data.handled_at', fn ($value) => $value !== null);

        $this->getJson('/api/v1/admin/contact-messages?status=open')->assertJsonCount(0, 'data');
        $this->getJson('/api/v1/admin/contact-messages?status=handled')->assertJsonCount(1, 'data');
        $this->getJson('/api/v1/admin/contact-messages/count')->assertJsonPath('data.open', 0);

        $this->postJson("/api/v1/admin/contact-messages/{$message->id}/reopen")
            ->assertOk()
            ->assertJsonPath('data.handled_at', null);

        $this->deleteJson("/api/v1/admin/contact-messages/{$message->id}")->assertNoContent();
        $this->assertDatabaseCount('contact_messages', 0);
    }

    public function test_clients_cannot_manage_contact_messages(): void
    {
        $this->postJson('/api/v1/contact', $this->payload())->assertCreated();
        $id = ContactMessage::firstOrFail()->id;

        $this->actingAs($this->client());

        $this->postJson("/api/v1/admin/contact-messages/{$id}/handle")->assertForbidden();
        $this->deleteJson("/api/v1/admin/contact-messages/{$id}")->assertForbidden();
        $this->assertDatabaseCount('contact_messages', 1);
    }
}