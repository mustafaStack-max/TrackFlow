<?php

namespace Tests\Unit;

use App\Models\Account;
use App\Models\Budget;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use App\Services\BudgetService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class BudgetServiceTest extends TestCase
{
    use RefreshDatabase;

    protected BudgetService $service;
    protected User $user;
    protected Account $account;
    protected Category $food;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new BudgetService();

        // ★ تثبيت الزمن قبل أي factory لضمان تناسق الـ timestamps
        Carbon::setTestNow(Carbon::parse('2026-03-15 12:00:00'));

        $this->user = User::factory()->create();
        $this->account = Account::factory()->create(['user_id' => $this->user->id]);
        $this->food = Category::factory()->create([
            'user_id' => $this->user->id,
            'name' => 'food-test',
        ]);
    }

    protected function tearDown(): void
    {
        // ★ تنظيف setTestNow لمنع تلويث الاختبارات التالية
        Carbon::setTestNow(null);
        parent::tearDown();
    }

    private function tx(Category $cat, float $amount, string $date, string $type = 'expense'): Transaction
    {
        $t = Transaction::create([
            'user_id' => $this->user->id,
            'account_id' => $this->account->id,
            'category_id' => $cat->id,
            'type' => $type,
            'amount' => $amount,
            'transaction_date' => $date . ' 12:00:00', // ★ وقت صريح
        ]);
        $this->assertNotNull($t->id, 'Transaction failed to insert');
        return $t;
    }

    public function test_monthly_bounds_handle_month_edges(): void
    {
        [$s, $e] = $this->service->periodBounds('monthly', Carbon::parse('2026-03-10'));
        $this->assertSame('2026-03-01', $s->format('Y-m-d'));
        $this->assertSame('2026-03-31', $e->format('Y-m-d'));
    }

    public function test_previous_month_anchor_avoids_overflow(): void
    {
        $prev = $this->service->previousAnchor('monthly', Carbon::parse('2026-03-31'));
        $this->assertSame('2026-02-28', $prev->format('Y-m-d'));
    }

    public function test_status_thresholds(): void
    {
        $b = Budget::factory()->create([
            'user_id' => $this->user->id,
            'category_id' => $this->food->id,
            'amount' => 1000,
        ]);

        $this->tx($this->food, 500, '2026-03-05');
        $r = $this->service->buildSummary($this->user, now());
        $this->assertSame('ok', $r['items'][0]['status']);

        $this->tx($this->food, 350, '2026-03-06');
        $r = $this->service->buildSummary($this->user, now());
        $this->assertSame('warning', $r['items'][0]['status']);

        $this->tx($this->food, 300, '2026-03-07');
        $r = $this->service->buildSummary($this->user, now());
        $this->assertSame('exceeded', $r['items'][0]['status']);
    }

    public function test_rollover_is_capped_at_base_amount(): void
    {
        Budget::factory()->create([
            'user_id' => $this->user->id,
            'category_id' => $this->food->id,
            'amount' => 1000,
            'rollover_enabled' => true,
        ]);
        $this->tx($this->food, 200, '2026-02-10');

        $r = $this->service->buildSummary($this->user, now());
        // الفائض = 1000 - 200 = 800، أقل من السقف 1000 → يُرحَّل 800
        $this->assertSame(800.0, $r['items'][0]['rollover']);
    }

    public function test_overall_budget_sums_all_categories(): void
    {
        $other = Category::factory()->create([
            'user_id' => $this->user->id,
            'name' => 'other-test',
        ]);
        Budget::factory()->overall()->create([
            'user_id' => $this->user->id,
            'amount' => 5000,
        ]);

        $t1 = $this->tx($this->food, 300, '2026-03-01');
        $t2 = $this->tx($other, 200, '2026-03-02');
        $this->tx($other, 100, '2026-03-03', 'income');

        // ★ assertion تشخيصية: التأكد من أن العمليات الثلاثة موجودة فعلاً
        $this->assertSame(3, Transaction::where('user_id', $this->user->id)->count(),
            'يجب أن يوجد 3 transactions في DB');
        $this->assertSame(2,
            Transaction::where('user_id', $this->user->id)->where('type', 'expense')->count(),
            'يجب أن يوجد 2 expenses فقط');

        $r = $this->service->buildSummary($this->user, now());
        $this->assertSame(500.0, $r['items'][0]['spent']);
    }
}