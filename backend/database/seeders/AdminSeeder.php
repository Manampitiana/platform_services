<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::firstOrNew([
            'email' => env('ADMIN_EMAIL', 'admin@digitalhub.mg'),
        ]); 

        $admin->name = 'Administrator';
        $admin->password = env('ADMIN_PASSWORD', 'admin123');
        $admin->role = 'admin';
        $admin->email_verified_at = now();
        $admin->save();
    }
}
