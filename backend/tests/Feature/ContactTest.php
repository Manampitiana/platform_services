<?php

namespace Tests\Feature;

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

        $this->assertDatabaseHas('contact_messages', ['email' => 'jane@example.com']);
        Notification::assertSentTo($admin, ContactReceived::class);
    }

    public function test_the_honeypot_is_answered_silently_and_nothing_is_stored(): void
    {
        $this->admin();

        $this->postJson('/api/v1/contact', $this->payload(['website' => 'http://spam.example']))
            ->assertCreated();

        $this->assertDatabaseCount('contact_messages', 0);
        Notification::assertNothingSent();
    }

    public function test_the_form_is_validated(): void
    {
        $this->postJson('/api/v1/contact', $this->payload(['subject' => 'Hack', 'message' => 'short']))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['subject', 'message']);
    }

    public function test_the_form_is_rate_limited(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/v1/contact', $this->payload())->assertCreated();
        }

        $this->postJson('/api/v1/contact', $this->payload())->assertStatus(429);
    }
}