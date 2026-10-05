<?php

namespace Tests\Feature;

use App\Models\PaymentMethod;
use App\Models\ServicePackage;
use App\Services\PaymentService;
use Tests\TestCase;

class AdminCatalogueTest extends TestCase
{
    private function servicePayload(array $override = []): array
    {
        return array_merge([
            'name' => 'CV Design', 'slug' => 'cv-design', 'short_description' => 'Updated',
            'base_price' => 20000, 'revisions_included' => 1,
            'requires_quote' => false, 'is_active' => true, 'is_featured' => true,
        ], $override);
    }

    public function test_a_price_change_shows_up_in_the_public_catalogue(): void
    {
        $service = $this->fixedService();

        $this->actingAs($this->admin())
            ->patchJson("/api/v1/admin/services/{$service->id}", $this->servicePayload())
            ->assertOk();

        $this->getJson('/api/v1/services/cv-design')->assertJsonPath('data.base_price', 20000);
    }

    public function test_service_slugs_are_unique(): void
    {
        $this->fixedService();

        $this->actingAs($this->admin())
            ->postJson('/api/v1/admin/services', $this->servicePayload(['name' => 'Another']))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('slug');
    }

    public function test_deleting_a_service_hides_it_but_orders_keep_their_service(): void
    {
        $client = $this->client();
        $order = $this->submittedOrder($client);
        $service = $this->fixedService();

        $this->actingAs($this->admin())->deleteJson("/api/v1/admin/services/{$service->id}")->assertNoContent();

        $this->getJson('/api/v1/services/cv-design')->assertNotFound();

        $this->actingAs($client)
            ->getJson("/api/v1/orders/{$order->uuid}")
            ->assertOk()
            ->assertJsonPath('data.service.name', 'CV Design');
    }

    public function test_packages_used_by_orders_cannot_be_deleted(): void
    {
        $service = $this->fixedService();
        $this->submittedOrder($this->client(), $service); // utilise "standard"

        $standard = ServicePackage::where('slug', 'standard')->firstOrFail();
        $basic = ServicePackage::where('slug', 'basic')->firstOrFail();

        $this->actingAs($this->admin())->deleteJson("/api/v1/admin/packages/{$standard->id}")->assertStatus(409);
        $this->deleteJson("/api/v1/admin/packages/{$basic->id}")->assertOk();
    }

    public function test_only_one_package_can_be_popular(): void
    {
        $this->fixedService(); // "standard" no popular

        $basic = ServicePackage::where('slug', 'basic')->firstOrFail();

        $this->actingAs($this->admin())
            ->patchJson("/api/v1/admin/packages/{$basic->id}", [
                'name' => 'Basic', 'price' => 15000, 'revisions_included' => 1,
                'is_popular' => true, 'is_active' => true, 'features' => [],
            ])
            ->assertOk();

        $this->assertFalse(ServicePackage::where('slug', 'standard')->firstOrFail()->is_popular);
        $this->assertTrue($basic->refresh()->is_popular);
    }

    public function test_brief_fields_are_validated_and_replaced_as_a_whole(): void
    {
        $service = $this->fixedService();
        $this->actingAs($this->admin());

        $this->putJson("/api/v1/admin/services/{$service->id}/form-fields", [
            'fields' => [['name' => 'style', 'label' => 'Style', 'type' => 'select']],
        ])->assertUnprocessable()->assertJsonValidationErrors('fields.0.options');

        $this->putJson("/api/v1/admin/services/{$service->id}/form-fields", [
            'fields' => [['name' => 'Bad Name', 'label' => 'Bad', 'type' => 'text']],
        ])->assertUnprocessable()->assertJsonValidationErrors('fields.0.name');

        $this->putJson("/api/v1/admin/services/{$service->id}/form-fields", [
            'fields' => [['name' => 'company', 'label' => 'Company', 'type' => 'text', 'is_required' => true]],
        ])->assertOk()->assertJsonCount(1, 'data.form_fields');

        $this->getJson('/api/v1/services/cv-design')->assertJsonCount(1, 'data.form_fields');
    }

    public function test_clients_only_see_active_payment_methods(): void
    {
        $this->paymentMethod('mvola');
        $this->paymentMethod('cash');
        PaymentMethod::where('code', 'cash')->update(['is_active' => false]);

        $this->actingAs($this->client())
            ->getJson('/api/v1/payment-methods')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.code', 'mvola');
    }

    public function test_admin_can_edit_an_account_number_without_touching_the_code(): void
    {
        $method = $this->paymentMethod('mvola');

        $this->actingAs($this->admin())
            ->patchJson("/api/v1/admin/payment-methods/{$method->id}", [
                'code' => 'hacked', 'name' => 'MVola', 'account_number' => '034 11 111 11', 'is_active' => true,
            ])
            ->assertOk()
            ->assertJsonPath('data.account_number', '034 11 111 11')
            ->assertJsonPath('data.code', 'mvola');
    }

    public function test_methods_used_by_payments_cannot_be_deleted(): void
    {
        $client = $this->client();
        $used = $this->paymentMethod('mvola');
        $unused = $this->paymentMethod('cash');
        $order = $this->submittedOrder($client);
        app(PaymentService::class)->create($order, $client, 'mvola', 'REF-1', null);

        $this->actingAs($this->admin());

        $this->deleteJson("/api/v1/admin/payment-methods/{$used->id}")->assertStatus(409);
        $this->deleteJson("/api/v1/admin/payment-methods/{$unused->id}")->assertNoContent();
    }
}