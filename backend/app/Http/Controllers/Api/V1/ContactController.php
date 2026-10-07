<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\ContactRequest;
use App\Models\ContactMessage;
use App\Models\User;
use App\Notifications\ContactReceived;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;

class ContactController extends Controller
{
    private const THANKS = 'Thank you! We will get back to you shortly.';

    public function store(ContactRequest $request): JsonResponse
    {
        $honeypot = trim((string) $request->input('contact_extra'));

        // Mitovy amin'ny e-mail ny honeypot → autofill avy amin'ny navigateur, tsy robot
        $autofilled = $honeypot !== '' && strcasecmp($honeypot, (string) $request->input('email')) === 0;
        $spam = $honeypot !== '' && ! $autofilled;

        $message = ContactMessage::create([
            ...$request->safe()->only(['name', 'email', 'subject', 'message']),
            'is_spam' => $spam,
            'ip_address' => $request->ip(),
            'user_agent' => Str::limit((string) $request->userAgent(), 255, ''),
        ]);

        if (! $spam) {
            $admins = User::where('role', 'admin')->get();

            if ($admins->isNotEmpty()) {
                try {
                    Notification::send($admins, new ContactReceived($message));
                } catch (\Throwable $e) {
                    report($e); // voatahiry ihany ny hafatra na diso aza ny e-mail
                }
            }
        }

        return response()->json(['message' => self::THANKS], 201);
    }
}