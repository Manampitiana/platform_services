<?php

namespace Tests\Concerns;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\PaymentMethod;
use App\Models\Service;
use App\Models\User;
use App\Services\OrderService;
use App\Services\PaymentService;
use Illuminate\Http\UploadedFile;

trait CreatesDomain
{
    protected function client(): User
    {
        return User::factory()->create();
    }

    protected function admin(): User
    {
        return User::factory()->admin()->create();
    }

    protected function pdf(string $name = 'document.pdf', int $kb = 100): UploadedFile
    {
        return UploadedFile::fake()->create($name, $kb, 'application/pdf');
    }

    /** POST multipart (fichier) miaraka amin'ny valiny JSON. */
    protected function postForm(string $uri, array $data = [])
    {
        return $this->withHeader('Accept', 'application/json')->post($uri, $data);
    }

    /** CV Design: vidiny raikitra. Basic 15 000 (1 révision), Standard 25 000 (2 révisions). */
    protected function fixedService(): Service
    {
        if ($existing = Service::where('slug', 'cv-design')->first()) {
            return $existing;
        }

        $service = Service::create([
            'name' => 'CV Design',
            'slug' => 'cv-design',
            'icon' => 'cv',
            'short_description' => 'A clean, professional resume.',
            'base_price' => 15000,
            'estimated_days' => 2,
            'revisions_included' => 1,
            'requires_quote' => false,
            'currency' => 'MGA',
            'is_active' => true,
            'is_featured' => true,
        ]);

        $service->packages()->create([
            'name' => 'Basic', 'slug' => 'basic', 'price' => 15000,
            'estimated_days' => 2, 'revisions_included' => 1, 'sort_order' => 0,
        ]);
        $service->packages()->create([
            'name' => 'Standard', 'slug' => 'standard', 'price' => 25000,
            'estimated_days' => 3, 'revisions_included' => 2, 'is_popular' => true, 'sort_order' => 1,
        ]);

        $service->formFields()->createMany([
            ['name' => 'full_name', 'label' => 'Full name', 'type' => 'text', 'is_required' => true, 'sort_order' => 0],
            ['name' => 'cv_language', 'label' => 'CV language', 'type' => 'select', 'is_required' => true,
                'options' => ['English', 'French'], 'sort_order' => 1],
            ['name' => 'photo', 'label' => 'Photo', 'type' => 'file', 'is_required' => false, 'sort_order' => 2],
        ]);

        return $service;
    }

    /** Custom Project: mila devis, tsy manana package. */
    protected function customService(): Service
    {
        if ($existing = Service::where('slug', 'custom-project')->first()) {
            return $existing;
        }

        $service = Service::create([
            'name' => 'Custom Project',
            'slug' => 'custom-project',
            'icon' => 'custom',
            'short_description' => 'Tell us what you need.',
            'base_price' => null,
            'revisions_included' => 0,
            'requires_quote' => true,
            'currency' => 'MGA',
            'is_active' => true,
        ]);

        $service->formFields()->createMany([
            ['name' => 'title', 'label' => 'Project title', 'type' => 'text', 'is_required' => true, 'sort_order' => 0],
            ['name' => 'description', 'label' => 'Description', 'type' => 'textarea', 'is_required' => true, 'sort_order' => 1],
        ]);

        return $service;
    }

    protected function paymentMethod(string $code = 'mvola'): PaymentMethod
    {
        return PaymentMethod::firstOrCreate(['code' => $code], [
            'name' => ucfirst($code),
            'account_name' => 'Digital Hub',
            'account_number' => '034 00 000 00',
            'is_active' => true,
            'sort_order' => 0,
        ]);
    }

    protected function draftOrder(User $user, ?Service $service = null, string $package = 'standard'): Order
    {
        $service ??= $this->fixedService();

        return app(OrderService::class)->createDraft(
            $user,
            $service,
            $service->requires_quote ? null : $package
        );
    }

    /** Commande voafenoina sy alefa. Vidiny raikitra → awaiting_payment; custom → submitted. */
    protected function submittedOrder(User $user, ?Service $service = null, array $brief = []): Order
    {
        $service ??= $this->fixedService();
        $orders = app(OrderService::class);

        $order = $this->draftOrder($user, $service);

        $defaults = $service->requires_quote
            ? ['title' => 'My project', 'description' => 'Please build something for me.']
            : ['full_name' => 'Jane Doe', 'cv_language' => 'English'];

        $orders->saveBrief($order, array_merge($defaults, $brief));

        return $orders->submit($order->refresh(), $user)->refresh();
    }

    protected function paidOrder(User $client, ?User $admin = null, ?Service $service = null): Order
    {
        $admin ??= $this->admin();
        $order = $this->submittedOrder($client, $service);
        $this->paymentMethod();

        $payments = app(PaymentService::class);
        $payment = $payments->create($order, $client, 'mvola', 'REF-123', null);
        $payments->verify($payment, $admin);

        return $order->refresh();
    }

    protected function inProgressOrder(User $client, ?User $admin = null, ?Service $service = null): Order
    {
        $admin ??= $this->admin();
        $order = $this->paidOrder($client, $admin, $service);

        return app(OrderService::class)->changeStatus($order, OrderStatus::InProgress, $admin)->refresh();
    }
}