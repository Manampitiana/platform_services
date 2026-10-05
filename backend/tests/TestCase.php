<?php

namespace Tests;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Tests\Concerns\CreatesDomain;

abstract class TestCase extends BaseTestCase
{
    use RefreshDatabase;
    use CreatesDomain;

    protected function setUp(): void
    {
        parent::setUp();

        Notification::fake();
        Storage::fake('local');
        Storage::fake('public');

        // Ny SPA dia "stateful" (session) amin'io domaine io
        config(['sanctum.stateful' => ['localhost:5173']]);
    }
}