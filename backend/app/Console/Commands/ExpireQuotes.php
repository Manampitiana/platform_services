<?php

namespace App\Console\Commands;

use App\Services\QuoteService;
use Illuminate\Console\Command;

class ExpireQuotes extends Command
{
    protected $signature = 'quotes:expire';

    protected $description = 'Mark sent quotes past their validity date as expired';

    public function handle(QuoteService $quotes): int
    {
        $this->info($quotes->expireAllDue() . ' quote(s) expired.');

        return self::SUCCESS;
    }
}