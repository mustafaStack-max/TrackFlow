<?php

namespace Tests\Feature;

use App\Models\Budget;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BudgetPolicyTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_update_and_delete(): void
    {
        $budget = Budget::factory()->create();
        $this->assertTrue($budget->user->can('update', $budget));
        $this->assertTrue($budget->user->can('delete', $budget));
    }

    public function test_stranger_cannot_touch_budget(): void
    {
        $budget = Budget::factory()->create();
        $stranger = User::factory()->create();
        $this->assertFalse($stranger->can('view', $budget));
        $this->assertFalse($stranger->can('update', $budget));
        $this->assertFalse($stranger->can('delete', $budget));
    }
}