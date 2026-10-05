<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Services\EmailVerificationCodeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class EmailVerificationController extends Controller
{
    public function __construct(private EmailVerificationCodeService $codes)
    {
    }

    public function send(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Your email is already verified.']);
        }

        $wait = $this->codes->secondsUntilResend($user);

        if ($wait > 0) {
            return response()->json([
                'message' => "Please wait {$wait} seconds before requesting a new code.",
                'retry_after' => $wait,
            ], 429);
        }

        try {
            $this->codes->send($user);
        } catch (\Throwable $e) {
            report($e);

            return response()->json(['message' => 'We could not send the email. Please try again shortly.'], 503);
        }

        return response()->json([
            'message' => 'Verification code sent.',
            'retry_after' => EmailVerificationCodeService::COOLDOWN_SECONDS,
        ]);
    }

    public function verify(Request $request): UserResource
    {
        $data = $request->validate([
            'code' => ['required', 'digits:6'],
        ]);

        $user = $request->user();
        $this->codes->verify($user, $data['code']);

        return new UserResource($user->refresh());
    }

    /** Raha diso soratra ny e-mail: azo ovaina raha mbola tsy voamarina. */
    public function changeEmail(Request $request): UserResource
    {
        $user = $request->user();

        abort_if($user->hasVerifiedEmail(), 403, 'Use your profile settings to change a verified email.');

        $data = $request->validate([
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
        ]);

        $user->forceFill(['email' => $data['email'], 'email_verified_at' => null])->save();

        try {
            $this->codes->send($user);
        } catch (\Throwable $e) {
            report($e);
        }

        return new UserResource($user->refresh());
    }
}