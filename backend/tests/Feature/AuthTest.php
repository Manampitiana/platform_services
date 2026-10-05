<?php

namespace Tests\Feature;

use App\Models\User;
use App\Notifications\VerifyEmailCode;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class AuthTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Register/login/logout dia mampiasa session: ilaina ny request avy amin'ny SPA
        $this->withHeader('Origin', 'http://localhost:5173');
    }

    private function registrationData(array $override = []): array
    {
        return array_merge([
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'phone' => '0340000000',
            'password' => 'Str0ng-Pass!1',
            'password_confirmation' => 'Str0ng-Pass!1',
        ], $override);
    }

    public function test_user_can_register_and_receives_a_verification_code(): void
    {
        $this->postJson('/api/v1/register', $this->registrationData())
            ->assertCreated()
            ->assertJsonPath('data.email', 'jane@example.com')
            ->assertJsonPath('data.role', 'client')
            ->assertJsonPath('data.email_verified_at', null);

        $user = User::where('email', 'jane@example.com')->firstOrFail();

        $this->assertAuthenticatedAs($user, 'web');
        Notification::assertSentTo($user, VerifyEmailCode::class);
    }

    public function test_role_cannot_be_set_through_registration(): void
    {
        $this->postJson('/api/v1/register', $this->registrationData(['role' => 'admin']))->assertCreated();

        $this->assertDatabaseHas('users', ['email' => 'jane@example.com', 'role' => 'client']);
    }

    public function test_registration_is_validated(): void
    {
        User::factory()->create(['email' => 'jane@example.com']);

        $this->postJson('/api/v1/register', $this->registrationData(['password_confirmation' => 'different']))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('password');

        $this->postJson('/api/v1/register', $this->registrationData())
            ->assertUnprocessable()
            ->assertJsonValidationErrors('email');
    }

    public function test_user_can_log_in_with_valid_credentials(): void
    {
        $user = User::factory()->create();

        $this->postJson('/api/v1/login', ['email' => $user->email, 'password' => 'password'])
            ->assertOk()
            ->assertJsonPath('data.email', $user->email);

        $this->assertAuthenticatedAs($user, 'web');
    }

    public function test_login_rejects_a_wrong_password(): void
    {
        $user = User::factory()->create();

        $this->postJson('/api/v1/login', ['email' => $user->email, 'password' => 'wrong-password'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('email');

        $this->assertGuest('web');
    }

    public function test_login_is_rate_limited(): void
    {
        $user = User::factory()->create();

        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/v1/login', ['email' => $user->email, 'password' => 'nope'])
                ->assertUnprocessable();
        }

        $this->postJson('/api/v1/login', ['email' => $user->email, 'password' => 'password'])
            ->assertStatus(429);
    }

    public function test_guests_cannot_read_the_current_user(): void
    {
        $this->getJson('/api/v1/me')->assertUnauthorized();
    }

    public function test_user_can_log_out(): void
    {
        $this->actingAs(User::factory()->create())
            ->postJson('/api/v1/logout')
            ->assertNoContent();

        $this->assertGuest('web');
    }

    public function test_password_can_be_reset_with_the_emailed_token_only_once(): void
    {
        $user = User::factory()->create();

        $this->postJson('/api/v1/forgot-password', ['email' => $user->email])->assertOk();

        $token = null;
        Notification::assertSentTo($user, ResetPassword::class, function ($notification) use (&$token) {
            $token = $notification->token;

            return true;
        });

        $payload = [
            'token' => $token,
            'email' => $user->email,
            'password' => 'N3w-Secret-Pass',
            'password_confirmation' => 'N3w-Secret-Pass',
        ];

        $this->postJson('/api/v1/reset-password', $payload)->assertOk();
        $this->assertTrue(Hash::check('N3w-Secret-Pass', $user->refresh()->password));

        // Lany ny token
        $this->postJson('/api/v1/reset-password', $payload)
            ->assertUnprocessable()
            ->assertJsonValidationErrors('email');
    }

    public function test_forgot_password_does_not_reveal_unknown_emails(): void
    {
        $this->postJson('/api/v1/forgot-password', ['email' => 'nobody@example.com'])
            ->assertOk();

        Notification::assertNothingSent();
    }
}