<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DemoClientSeeder extends Seeder
{
    public function run(): void
    {
        if (! app()->isLocal()) {
            return; // tsy mamorona kaonty fitsapana any amin'ny production
        }

        $user = User::firstOrNew(['email' => 'client@digitalhub.test']);

        $user->name = 'Demo Client';
        $user->password = 'password';
        $user->role = 'client';
        $user->email_verified_at = now();
        $user->save();
    }
}