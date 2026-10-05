<?php

namespace Database\Seeders;

use App\Models\PaymentMethod;
use Illuminate\Database\Seeder;

class PaymentMethodSeeder extends Seeder
{
    public function run(): void
    {
        $methods = [
            ['mvola', 'MVola', 'Your Business Name', '034 00 000 00', 'Send the amount to this MVola number, then enter the transaction reference.'],
            ['orange_money', 'Orange Money', 'Your Business Name', '032 00 000 00', 'Send the amount to this Orange Money number, then enter the transaction reference.'],
            ['airtel_money', 'Airtel Money', 'Your Business Name', '033 00 000 00', 'Send the amount to this Airtel Money number, then enter the transaction reference.'],
            ['bank_transfer', 'Bank transfer', 'Your Business Name', 'MG00 0000 0000 0000 0000', 'Make a transfer to this account and upload the receipt.'],
        ];

        foreach ($methods as $i => [$code, $name, $account, $number, $instructions]) {
            PaymentMethod::firstOrCreate(['code' => $code], [
                'name' => $name,
                'account_name' => $account,
                'account_number' => $number,
                'instructions' => $instructions,
                'sort_order' => $i,
            ]);
        }
    }
}
