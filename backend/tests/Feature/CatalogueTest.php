<?php

namespace Tests\Feature;

use App\Models\Service;
use Tests\TestCase;

class CatalogueTest extends TestCase
{
    public function test_guests_only_see_active_services(): void
    {
        $this->fixedService();
        Service::create([
            'name' => 'Hidden', 'slug' => 'hidden', 'short_description' => 'Not for sale',
            'revisions_included' => 0, 'requires_quote' => false, 'is_active' => false,
        ]);

        $this->getJson('/api/v1/services')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.slug', 'cv-design');

        $this->getJson('/api/v1/services/hidden')->assertNotFound();
    }

    public function test_service_detail_exposes_packages_and_brief_fields_but_no_internal_flags(): void
    {
        $this->fixedService();

        $this->getJson('/api/v1/services/cv-design')
            ->assertOk()
            ->assertJsonCount(2, 'data.packages')
            ->assertJsonCount(3, 'data.form_fields')
            ->assertJsonPath('data.packages.1.slug', 'standard')
            ->assertJsonMissingPath('data.is_active');
    }

    public function test_deleted_services_disappear_from_the_public_catalogue(): void
    {
        $service = $this->fixedService();
        $service->delete();

        $this->getJson('/api/v1/services/cv-design')->assertNotFound();
        $this->getJson('/api/v1/services')->assertOk()->assertJsonCount(0, 'data');
    }
}