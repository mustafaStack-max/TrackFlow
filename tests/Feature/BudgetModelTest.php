<?php

namespace Tests\Feature;

use App\Models\Budget;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BudgetModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_uuid_is_generated_on_create(): void
    {
        $budget = Budget::factory()->create();
        $this->assertNotNull($budget->uuid);
        $this->assertMatchesRegularExpression('/^[0-9a-f-]{36}$/', $budget->uuid);
    }

    public function test_overall_budget_has_null_category(): void
    {
        $budget = Budget::factory()->overall()->create();
        $this->assertTrue($budget->isOverall());
        $this->assertNull($budget->category_id);
    }

    public function test_casts_are_applied(): void
    {
        $budget = Budget::factory()->create(['amount' => 1500.5, 'rollover_enabled' => true]);
        $this->assertIsBool($budget->rollover_enabled);
        $this->assertSame('1500.50', (string) $budget->amount);
    }

    public function test_budget_soft_deletes(): void
    {
        $budget = Budget::factory()->create();
        $budget->delete();
        $this->assertSoftDeleted('budgets', ['id' => $budget->id]);
    }

    public function test_active_scope(): void
    {
        Budget::factory()->create();
        Budget::factory()->inactive()->create();
        $this->assertSame(1, Budget::active()->count());
    }
}