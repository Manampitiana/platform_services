<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\UpdatePasswordRequest;
use App\Http\Requests\Api\V1\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use App\Http\Requests\Api\V1\UpdateAvatarRequest;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function update(UpdateProfileRequest $request): UserResource
    {
        $user = $request->user();
        $user->fill($request->validated());

        $emailChanged = $user->isDirty('email');
        if ($emailChanged) {
            $user->email_verified_at = null;
        }

        $user->save();

        if ($emailChanged) {
            $user->sendEmailVerificationNotification();
        }

        return new UserResource($user);
    }

    public function updateAvatar(UpdateAvatarRequest $request): UserResource
    {
        $user = $request->user();
        $old = $user->avatar_path;

        $user->avatar_path = $request->file('avatar')->store('avatars', 'public');
        $user->save();

        // Fafana ny sary taloha mba tsy hanangona fichier foana
        if ($old) {
            Storage::disk('public')->delete($old);
        }

        return new UserResource($user);
    }

    public function destroyAvatar(Request $request): UserResource
    {
        $user = $request->user();

        if ($user->avatar_path) {
            Storage::disk('public')->delete($user->avatar_path);
            $user->avatar_path = null;
            $user->save();
        }

        return new UserResource($user);
    }

    public function updatePassword(UpdatePasswordRequest $request): JsonResponse
    {
        $request->user()->update(['password' => $request->validated('password')]);

        return response()->json(['message' => 'Password updated.']);
    }
}
