<?php

namespace Tests\Feature;

use App\Models\Account;
use App\Models\Budget;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use App\Notifications\BudgetAlert;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class BudgetAlertTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Account $account;
    protected Category $cat;

    protected function setUp(): void
    {
        parent::setUp();
        Carbon::setTestNow(Carbon::parse('2026-03-15 12:00:00'));
        Notification::fake();

        $this->user = User::factory()->create();
        $this->account = Account::factory()->create(['user_id' => $this->user->id]);
        $this->cat = Category::factory()->create(['user_id' => $this->user->id]);
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow(null);
        parent::tearDown();
    }

    private function spend(float $amount): void
    {
        Transaction::create([
            'user_id' => $this->user->id,
            'account_id' => $this->account->id,
            'category_id' => $this->cat->id,
            'type' => 'expense',
            'amount' => $amount,
            'transaction_date' => now()->format('Y-m-d H:i:s'),
        ]);
    }

    private function budget(): Budget
    {
        return Budget::factory()->create([
            'user_id' => $this->user->id,
            'category_id' => $this->cat->id,
            'amount' => 1000,
            'warn_pct' => 80,
            'critical_pct' => 100,
        ]);
    }

    public function test_no_notification_below_threshold(): void
    {
        $this->budget();
        $this->spend(500); // 50%
        Notification::assertNothingSent();
    }

    public function test_warn_sent_once_and_not_duplicated(): void
    {
        $this->budget();

        $this->spend(850); // 85% → warn
        $this->assertCount(1, Notification::sent($this->user, BudgetAlert::class));

        $this->spend(100); // 95% → نفس المستوى، لا تكرار
        $this->assertCount(1, Notification::sent($this->user, BudgetAlert::class));
    }

    public function test_critical_upgrade_sends_second_notification(): void
    {
        $b = $this->budget();

        $this->spend(850); // warn
        $this->assertCount(1, Notification::sent($this->user, BudgetAlert::class));

        $this->spend(200); // 105% → critical (ترقية)
        $this->assertCount(2, Notification::sent($this->user, BudgetAlert::class));
        $this->assertSame('critical', $b->fresh()->alerted_level);
    }
}