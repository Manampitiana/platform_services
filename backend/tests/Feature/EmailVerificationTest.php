<?php

namespace Tests\Feature;

use App\Models\EmailVerificationCode;
use App\Models\User;
use App\Notifications\VerifyEmailCode;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class EmailVerificationTest extends TestCase
{
    private function sendCode(User $user): string
    {
        $this->actingAs($user)->postJson('/api/v1/email/send-code')->assertOk();

        $code = null;
        Notification::assertSentTo($user, VerifyEmailCode::class, function ($notification) use (&$code) {
            $code = $notification->code;

            return true;
        });

        return $code;
    }

    public function test_unverified_users_are_blocked_from_the_application_api(): void
    {
        $user = User::factory()->unverified()->create();

        $this->actingAs($user)
            ->getJson('/api/v1/orders')
            ->assertForbidden()
            ->assertJsonPath('code', 'email_unverified');
    }

    public function test_unverified_admins_are_blocked_too(): void
    {
        $admin = User::factory()->admin()->unverified()->create();

        $this->actingAs($admin)
            ->getJson('/api/v1/admin/dashboard')
            ->assertForbidden()
            ->assertJsonPath('code', 'email_unverified');
    }

    public function test_unverified_users_can_still_read_their_profile_and_the_public_catalogue(): void
    {
        $this->fixedService();
        $user = User::factory()->unverified()->create();

        $this->actingAs($user)->getJson('/api/v1/me')->assertOk();
        $this->getJson('/api/v1/services')->assertOk();
    }

    public function test_correct_code_verifies_the_email_and_opens_the_api(): void
    {
        $user = User::factory()->unverified()->create();
        $code = $this->sendCode($user);

        $this->postJson('/api/v1/email/verify-code', ['code' => $code])
            ->assertOk()
            ->assertJsonPath('data.email', $user->email);

        $this->assertTrue($user->refresh()->hasVerifiedEmail());
        $this->getJson('/api/v1/orders')->assertOk();
    }

    public function test_wrong_code_is_rejected_and_attempts_are_counted(): void
    {
        $user = User::factory()->unverified()->create();
        $code = $this->sendCode($user);
        $wrong = $code === '000000' ? '111111' : '000000';

        $this->postJson('/api/v1/email/verify-code', ['code' => $wrong])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('code');

        $this->assertSame(1, EmailVerificationCode::where('user_id', $user->id)->value('attempts'));
        $this->assertFalse($user->refresh()->hasVerifiedEmail());
    }

    public function test_code_is_locked_after_five_wrong_attempts(): void
    {
        $user = User::factory()->unverified()->create();
        $code = $this->sendCode($user);
        $wrong = $code === '000000' ? '111111' : '000000';

        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/v1/email/verify-code', ['code' => $wrong])->assertUnprocessable();
        }

        // Na ny code marina aza dia lavina
        $this->postJson('/api/v1/email/verify-code', ['code' => $code])->assertUnprocessable();
        $this->assertFalse($user->refresh()->hasVerifiedEmail());
    }

    public function test_expired_code_is_rejected(): void
    {
        $user = User::factory()->unverified()->create();
        $code = $this->sendCode($user);

        EmailVerificationCode::where('user_id', $user->id)->update(['expires_at' => now()->subMinute()]);

        $this->postJson('/api/v1/email/verify-code', ['code' => $code])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('code');
    }

    public function test_code_must_be_six_digits(): void
    {
        $user = User::factory()->unverified()->create();

        $this->actingAs($user)
            ->postJson('/api/v1/email/verify-code', ['code' => 'abc'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('code');
    }

    public function test_a_code_sent_to_someone_else_is_useless(): void
    {
        $owner = User::factory()->unverified()->create();
        $other = User::factory()->unverified()->create();
        $code = $this->sendCode($owner);

        $this->actingAs($other)
            ->postJson('/api/v1/email/verify-code', ['code' => $code])
            ->assertUnprocessable();

        $this->assertFalse($other->refresh()->hasVerifiedEmail());
    }

    public function test_resending_too_quickly_is_throttled(): void
    {
        $user = User::factory()->unverified()->create();

        $this->actingAs($user)->postJson('/api/v1/email/send-code')->assertOk();

        $this->postJson('/api/v1/email/send-code')
            ->assertStatus(429)
            ->assertJsonStructure(['message', 'retry_after']);
    }

    public function test_unverified_user_can_correct_a_mistyped_email(): void
    {
        $user = User::factory()->unverified()->create(['email' => 'typo@exmaple.com']);

        $this->actingAs($user)
            ->postJson('/api/v1/email/change', ['email' => 'right@example.com'])
            ->assertOk()
            ->assertJsonPath('data.email', 'right@example.com');

        Notification::assertSentTo($user->refresh(), VerifyEmailCode::class);
    }

    public function test_email_change_rejects_taken_addresses_and_verified_users(): void
    {
        User::factory()->create(['email' => 'taken@example.com']);
        $unverified = User::factory()->unverified()->create();
        $verified = User::factory()->create();

        $this->actingAs($unverified)
            ->postJson('/api/v1/email/change', ['email' => 'taken@example.com'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('email');

        $this->actingAs($verified)
            ->postJson('/api/v1/email/change', ['email' => 'new@example.com'])
            ->assertForbidden();
    }
}