<?php

namespace Tests\Feature;

use Tests\TestCase;

class AdminDashboardTest extends TestCase
{
    public function test_dashboard_returns_the_expected_structure_and_figures(): void
    {
        $admin = $this->admin();
        $this->paidOrder($this->client(), $admin);

        $kpi = ['value', 'previous', 'change'];

        $this->actingAs($admin)
            ->getJson('/api/v1/admin/dashboard?days=30')
            ->assertOk()
            ->assertJsonStructure(['data' => [
                'days',
                'kpis' => ['revenue' => $kpi, 'orders' => $kpi, 'completed' => $kpi, 'average_order' => $kpi],
                'series' => ['*' => ['date', 'revenue', 'orders']],
                'counts',
                'actions' => ['payments_to_verify', 'orders_to_review', 'quotes_to_prepare', 'revisions_requested'],
                'recent_orders',
                'activity' => ['*' => ['id', 'order_uuid', 'order_number', 'to_status', 'created_at']],
            ]])
            ->assertJsonPath('data.kpis.revenue.value', 25000)
            ->assertJsonPath('data.kpis.orders.value', 1)
            ->assertJsonCount(30, 'data.series');
    }

    public function test_unsupported_ranges_fall_back_to_thirty_days(): void
    {
        $this->actingAs($this->admin())
            ->getJson('/api/v1/admin/dashboard?days=5')
            ->assertOk()
            ->assertJsonPath('data.days', 30);
    }
}