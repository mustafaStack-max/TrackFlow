<?php

namespace Tests\Feature;

use App\Models\Budget;
use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BudgetCrudTest extends TestCase
{
    use RefreshDatabase;

    public function test_store_creates_budget(): void
    {
        $user = User::factory()->create();
        $cat = Category::factory()->create(['user_id' => $user->id]);

        $res = $this->actingAs($user)->post(route('budgets.store'), [
            'category_id' => $cat->id,
            'amount' => 2000,
            'period' => 'monthly',
            'rollover_enabled' => true,
            'warn_pct' => 80,
            'critical_pct' => 100,
        ]);

        $res->assertRedirect();
        $this->assertDatabaseHas('budgets', [
            'user_id' => $user->id,
            'category_id' => $cat->id,
            'amount' => 2000,
        ]);
    }

    public function test_store_rejects_duplicate_category_budget(): void
    {
        $user = User::factory()->create();
        $cat = Category::factory()->create(['user_id' => $user->id]);
        Budget::factory()->create(['user_id' => $user->id, 'category_id' => $cat->id]);

        $res = $this->actingAs($user)->post(route('budgets.store'), [
            'category_id' => $cat->id,
            'amount' => 2000,
            'period' => 'monthly',
            'rollover_enabled' => false,
            'warn_pct' => 80,
            'critical_pct' => 100,
        ]);

        $res->assertSessionHasErrors('category_id');
    }

    public function test_stranger_cannot_update_budget(): void
    {
        $owner = User::factory()->create();
        $stranger = User::factory()->create();
        $budget = Budget::factory()->create(['user_id' => $owner->id]);

        $res = $this->actingAs($stranger)->put(route('budgets.update', $budget), [
            'amount' => 5000,
            'period' => 'monthly',
            'rollover_enabled' => false,
            'warn_pct' => 80,
            'critical_pct' => 100,
        ]);

        $res->assertStatus(403);
    }

    public function test_validation_requires_critical_gt_warn(): void
    {
        $user = User::factory()->create();
        $cat = Category::factory()->create(['user_id' => $user->id]);

        $res = $this->actingAs($user)->post(route('budgets.store'), [
            'category_id' => $cat->id,
            'amount' => 2000,
            'period' => 'monthly',
            'rollover_enabled' => false,
            'warn_pct' => 90,
            'critical_pct' => 80, // ★ أقل من warn
        ]);

        $res->assertSessionHasErrors('critical_pct');
    }

    public function test_suggest_returns_average_of_last_3_months(): void
    {
        $user = User::factory()->create();
        $cat = Category::factory()->create(['user_id' => $user->id]);
        $account = \App\Models\Account::factory()->create(['user_id' => $user->id]);

        // إنشاء معاملات لآخر 3 أشهر
        foreach ([1, 2, 3] as $i) {
            \App\Models\Transaction::create([
                'user_id' => $user->id,
                'account_id' => $account->id,
                'category_id' => $cat->id,
                'type' => 'expense',
                'amount' => 1000,
                'transaction_date' => now()->subMonths($i)->format('Y-m-15 12:00:00'),
            ]);
        }

        $res = $this->actingAs($user)->getJson(route('budgets.suggest', ['category_id' => $cat->id]));
        $res->assertOk()
            ->assertJson(['suggested' => 1000, 'average' => 1000.0]);
    }
}