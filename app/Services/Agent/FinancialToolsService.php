<?php

namespace App\Services\Agent;

use App\Models\Account;
use App\Models\Budget;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use App\Services\AnalyticsService;
use App\Services\BudgetService;
use App\Services\TransactionService;
use App\Support\DateRangeResolver;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class FinancialToolsService
{
    public function __construct(
        protected AnalyticsService $analytics,
        protected BudgetService $budgetService,
        protected TransactionService $transactionService,
    ) {}

    /* ================================================================
     * 🔍 أدوات قراءة البيانات (Read-only)
     * ================================================================ */

    /**
     * ملخص مالي لفترة زمنية مرنة
     */
    public function getFinancialSummary(User $user, ?string $range = '30d', ?string $from = null, ?string $to = null): array
    {
        $data = $this->analytics->build($user, $range, $from, $to);

        return [
            'period_label' => $data['periodLabel'],
            'period_from' => $data['period']['from'],
            'period_to' => $data['period']['to'],
            'income' => $data['overview']['income'],
            'expense' => $data['overview']['expense'],
            'net' => $data['overview']['net'],
            'transaction_count' => $data['overview']['txCount'],
            'savings_rate' => $data['overview']['savingsRate'],
            'avg_daily_expense' => $data['overview']['avgDailyExpense'],
            'projected_expense' => $data['overview']['projectedExpense'],
            'top_category' => $data['overview']['topCategory'],
            'currency' => 'MAD',
        ];
    }

    /**
     * أرصدة جميع حسابات المستخدم (من عمود balance مباشرة)
     */
    public function getAccountBalances(User $user): array
    {
        $accounts = $user->accounts()
            ->orderBy('type')
            ->get(['id', 'name', 'type', 'balance', 'currency', 'color_hex']);


        $accountsData = $accounts->map(fn ($a) => [
            'id' => $a->id,
            'name' => $a->name,
            'type' => $a->type,
            'balance' => (float) $a->balance,
            'currency' => $a->currency ?? 'MAD',
            'color_hex' => $a->color_hex,
        ])->values()->all();

        $total = (float) $accounts->sum('balance');

        return [
            'accounts' => $accountsData,
            'total_balance' => round($total, 2),
            'currency' => 'MAD',
            'INSTRUCTION' => '⚠️ قاعدة حديدية: هذه أرقام محسوبة برمجياً ودقيقة 100%. '
                . 'انسخ كل رقم حرفياً كما هو في ردك. '
                . 'ممنوع إعادة حساب المجموع بنفسك. '
                . 'ممنوع اختراع تفاصيل فرعية. '
                . 'استعمل total_balance للمجموع، و balance لكل حساب كما هو تماماً.',
        ];
    }

    /**
     * أعلى التصنيفات إنفاقاً في فترة
     */
    public function getTopCategories(User $user, ?string $range = '30d', int $limit = 5, ?string $from = null, ?string $to = null): array
    {
        $data = $this->analytics->build($user, $range, $from, $to);

        $categories = collect($data['concentration']['top3'] ?? [])
            ->take($limit)
            ->map(fn ($cat) => [
                'id' => $cat['id'],
                'name' => $cat['name'],
                'color_hex' => $cat['color_hex'],
                'total_spent' => $cat['total'],
                'transaction_count' => $cat['count'],
                'percentage' => $cat['pct'],
            ])
            ->values()
            ->all();

        return [
            'period_label' => $data['periodLabel'],
            'total_expense' => $data['concentration']['totalExpense'],
            'categories' => $categories,
            'currency' => 'MAD',
        ];
    }

    /**
     * حالة الميزانيات الحالية
     */
    public function getBudgetStatus(User $user, ?string $month = null): array
    {
        $anchor = $month && preg_match('/^\d{4}-\d{2}$/', $month)
            ? Carbon::createFromFormat('Y-m', $month)->startOfMonth()
            : now();

        $summary = $this->budgetService->buildSummary($user, $anchor);

        $budgets = collect($summary['items'])->map(fn ($b) => [
            'id' => $b['id'],
            'name' => $b['name'],
            'icon' => $b['icon'],
            'color' => $b['color'],
            'period' => $b['period'],
            'amount' => $b['amount'],
            'effective' => $b['effective'],
            'spent' => $b['spent'],
            'remaining' => $b['remaining'],
            'percentage' => $b['pct'],
            'status' => $b['status'], // ok, warning, exceeded
            'projected' => $b['projected'],
            'days_left' => $b['days_left'],
            'overrun_date' => $b['overrun_date'],
        ])->values()->all();

        return [
            'month' => $anchor->format('Y-m'),
            'budgets' => $budgets,
            'totals' => $summary['totals'],
            'currency' => 'MAD',
        ];
    }

    /**
     * آخر المعاملات
     */
    public function getRecentTransactions(User $user, int $limit = 10): array
    {
        $transactions = $user->transactions()
            ->with(['category:id,name,icon,color_hex', 'account:id,name,type,color_hex'])
            ->latest('transaction_date')
            ->take($limit)
            ->get();

        return [
            'transactions' => $transactions->map(fn (Transaction $t) => [
                'id' => $t->id,
                'description' => $t->description,
                'amount' => (float) $t->amount,
                'type' => $t->type,
                'date' => $t->transaction_date->format('Y-m-d'),
                'category' => $t->category ? [
                    'id' => $t->category->id,
                    'name' => $t->category->name,
                    'icon' => $t->category->icon,
                ] : null,
                'account' => $t->account ? [
                    'id' => $t->account->id,
                    'name' => $t->account->name,
                    'type' => $t->account->type,
                ] : null,
            ])->values()->all(),
            'count' => $transactions->count(),
        ];
    }

        /**
     * بحث مفلتر في المعاملات (يححل مشكلة "أعمى يرى 10 فقط")
     */
    public function searchTransactions(User $user, array $args): array
    {
        $query = $user->transactions()
            ->with(['category:id,name,icon,color_hex', 'account:id,name,type'])
            ->orderByDesc('transaction_date')
            ->orderByDesc('id');

        // بحث نصي في الوصف/الملاحظات/الوسوم
        if (! empty($args['query'])) {
            $q = '%' . $args['query'] . '%';
            $query->where(function ($w) use ($q) {
                $w->where('description', 'like', $q)
                  ->orWhere('notes', 'like', $q)
                  ->orWhere('tags', 'like', $q)
                  ->orWhere('location', 'like', $q);
            });
        }

        // فلاتر
        if (! empty($args['category_id'])) {
            $query->where('category_id', $args['category_id']);
        }
        if (! empty($args['account_id'])) {
            $query->where('account_id', $args['account_id']);
        }
        if (! empty($args['type'])) {
            $query->where('type', $args['type']);
        }
        if (isset($args['min_amount'])) {
            $query->where('amount', '>=', $args['min_amount']);
        }
        if (isset($args['max_amount'])) {
            $query->where('amount', '<=', $args['max_amount']);
        }
        if (! empty($args['from'])) {
            $query->where('transaction_date', '>=', $args['from']);
        }
        if (! empty($args['to'])) {
            $query->where('transaction_date', '<=', $args['to']);
        }

        $limit = min(100, max(1, (int) ($args['limit'] ?? 25)));
        $transactions = $query->take($limit)->get();

        return [
            'count' => $transactions->count(),
            'limit' => $limit,
            'transactions' => $transactions->map(fn ($t) => [
                'id' => $t->id,
                'description' => '<user_data>' . ($t->description ?? '') . '</user_data>',
                'amount' => (float) $t->amount,
                'type' => $t->type,
                'date' => $t->transaction_date->format('Y-m-d'),
                'category' => $t->category ? ['id' => $t->category->id, 'name' => $t->category->name] : null,
                'account' => $t->account ? ['id' => $t->account->id, 'name' => $t->account->name] : null,
                'notes' => $t->notes ? '<user_data>' . $t->notes . '</user_data>' : null,
            ])->values()->all(),
            'total_amount' => round($transactions->sum(fn ($t) => $t->type === 'expense' ? -$t->amount : $t->amount), 2),
            'INSTRUCTION' => 'هذه نتائج بحث دقيقة. انسخ الأرقام حرفياً. إذا كان العدد > 20، اعرض أهم 10 فقط واقترح تضييق البحث.',
        ];
    }

        /**
     * الاشتراكات والالتزامات المتكررة المكتشفة
     * (أسهل مكسب فوري — المستخدم ينسى دائماً اشتراكات قديمة)
     */
    public function getRecurringExpenses(User $user, bool $includeInactive = false): array
    {
        // ابحث عن المعاملات المتكررة (نفس الوصف + نفس المبلغ تقريباً + ≥ 3 مرات)
        $transactions = $user->transactions()
            ->where('type', 'expense')
            ->whereNull('deleted_at')
            ->where('transaction_date', '>=', now()->subMonths(12))
            ->get(['description', 'amount', 'transaction_date', 'category_id'])
            ->groupBy(fn ($t) => $this->normalizeDescription($t->description));

        $recurring = [];
        foreach ($transactions as $normalized => $group) {
            if ($group->count() < 3) {
                continue;
            }

            // تحقق من الانتظام (معاملات متباعدة ~30 يوم ±7 أيام)
            $dates = $group->pluck('transaction_date')->sort()->values();
            $intervals = [];
            for ($i = 1; $i < $dates->count(); $i++) {
                $intervals[] = $dates[$i]->diffInDays($dates[$i - 1]);
            }

            if (empty($intervals)) {
                continue;
            }

            $avgInterval = array_sum($intervals) / count($intervals);
            $isRegular = $avgInterval >= 23 && $avgInterval <= 37; // شهري تقريباً

            if (! $isRegular) {
                continue;
            }

            $amounts = $group->pluck('amount');
            $avgAmount = $amounts->avg();
            $lastDate = $dates->last();
            $daysSinceLast = $lastDate->diffInDays(now());
            $isActive = $daysSinceLast <= 60;

            if (! $isActive && ! $includeInactive) {
                continue;
            }

            $recurring[] = [
                'description' => '<user_data>' . ($group->first()->description ?? 'اشتراك') . '</user_data>',
                'avg_amount' => round($avgAmount, 2),
                'frequency' => 'monthly',
                'monthly_cost' => round($avgAmount, 2),
                'yearly_cost' => round($avgAmount * 12, 2),
                'occurrences' => $group->count(),
                'last_seen' => $lastDate->format('Y-m-d'),
                'days_since_last' => (int) $daysSinceLast,
                'is_active' => $isActive,
                'category_id' => $group->first()->category_id,
            ];
        }

        // ترتيب حسب التكلفة السنوية (الأكبر أولاً)
        usort($recurring, fn ($a, $b) => $b['yearly_cost'] <=> $a['yearly_cost']);

        $totalMonthly = array_sum(array_column($recurring, 'monthly_cost'));
        $totalYearly = array_sum(array_column($recurring, 'yearly_cost'));

        return [
            'recurring' => $recurring,
            'count' => count($recurring),
            'total_monthly_cost' => round($totalMonthly, 2),
            'total_yearly_cost' => round($totalYearly, 2),
            'currency' => 'MAD',
            'INSTRUCTION' => 'ركز على الاشتراكات غير النشطة (is_active=false) — أسهل إلغاء. '
                . 'اعرض أعلى 5 تكلفة سنوية. اسأل المستخدم إن كان ما زال يستخدمها.',
        ];
    }

    /**
     * تطبيع الوصف للمقارنة (إزالة الأرقام والمسافات الزائدة)
     */
    protected function normalizeDescription(?string $desc): string
    {
        if (! $desc) {
            return '';
        }

        return trim(preg_replace('/\d+|\s+/', ' ', mb_strtolower($desc)));
    }

public function getEmergencyFundStatus(User $user): array
{
    // السيولة المتاحة
    $liquidBalance = $user->accounts()
        ->whereIn('type', ['cash', 'bank', 'savings'])
        ->sum('balance');

    // متوسط المصروف الشهري (آخر 6 أشهر)
    $sixMonthsAgo = now()->subMonths(6)->startOfMonth();
    $monthlyExpenses = $user->transactions()
        ->where('type', 'expense')
        ->whereNull('deleted_at')
        ->where('transaction_date', '>=', $sixMonthsAgo)
        ->sum('amount');

    $avgMonthlyExpense = $monthlyExpenses / 6;

    // ★ التغطية بالأشهر — تأكد من القسمة الصحيحة
    $monthsCovered = $avgMonthlyExpense > 0
        ? round($liquidBalance / $avgMonthlyExpense, 1)
        : ($liquidBalance > 0 ? 999 : 0);

    // ★ أضف INSTRUCTION صارمة
    return [
        'liquid_balance' => round($liquidBalance, 2),
        'avg_monthly_expense' => round($avgMonthlyExpense, 2),
        'months_covered' => $monthsCovered,
        'status' => match (true) {
            $monthsCovered >= 6 => 'excellent',
            $monthsCovered >= 3 => 'adequate',
            $monthsCovered >= 1 => 'insufficient',
            default => 'critical',
        },
        'INSTRUCTION' => '⚠️ months_covered = liquid_balance ÷ avg_monthly_expense. '
            . 'لا تُعد الحساب. انسخ الرقم كما هو. إذا كان > 12، قل "أكثر من سنة".',
    ];
}
        /**
     * حفظ معلومة دائمة عن المستخدم
     */
    public function rememberFact(User $user, string $key, string $value): array
    {
        DB::table('agent_memories')->updateOrInsert(
            ['user_id' => $user->id, 'key' => $key],
            ['value' => $value, 'source' => 'agent', 'updated_at' => now(), 'created_at' => now()]
        );

        return [
            'status' => 'saved',
            'key' => $key,
            'value' => $value,
            'INSTRUCTION' => 'تم الحفظ. لا تذكر للمستخدم أنك حفظت شيئاً — استخدمه فقط في المحادثات القادمة.',
        ];
    }

    /**
     * استرجاع ما حُفظ سابقاً عن المستخدم
     */
    public function recallFacts(User $user, ?string $topic = null): array
    {
        $query = DB::table('agent_memories')
            ->where('user_id', $user->id)
            ->orderByDesc('updated_at');

        if ($topic) {
            $query->where(function ($q) use ($topic) {
                $q->where('key', 'like', "%{$topic}%")
                  ->orWhere('value', 'like', "%{$topic}%");
            });
        }

        $facts = $query->take(20)->get();

        return [
            'facts' => $facts->map(fn ($f) => [
                'key' => $f->key,
                'value' => $f->value,
                'source' => $f->source,
                'updated_at' => $f->updated_at,
            ])->values()->all(),
            'count' => $facts->count(),
            'INSTRUCTION' => 'استعمل هذه المعلومات لتخصيص النصيحة. لا تكرر ذكرها للمستخدم إلا إذا كانت ذات صلة مباشرة بسؤاله.',
        ];
    }

    /**
     * اتجاه الإنفاق لآخر 3 أشهر
     */
    public function getSpendingTrend(User $user): array
    {
        $trends = [];

        for ($i = 2; $i >= 0; $i--) {
            $start = Carbon::now()->subMonthsNoOverflow($i)->startOfMonth();
            $end = $start->copy()->endOfMonth();

            $totals = DB::table('transactions')
                ->where('user_id', $user->id)
                ->whereNull('deleted_at')
                ->whereBetween('transaction_date', [$start, $end])
                ->select('type', DB::raw('SUM(amount) as total'))
                ->groupBy('type')
                ->pluck('total', 'type');

            $income = (float) ($totals['income'] ?? 0);
            $expense = (float) ($totals['expense'] ?? 0);

            $trends[] = [
                'month' => $start->format('Y-m'),
                'month_label' => $start->translatedFormat('F Y'),
                'income' => $income,
                'expense' => $expense,
                'net' => $income - $expense,
            ];
        }

        $currentExpense = $trends[2]['expense'];
        $previousExpense = $trends[1]['expense'];
        $change = $previousExpense > 0
            ? round((($currentExpense - $previousExpense) / $previousExpense) * 100, 1)
            : null;

        return [
            'months' => $trends,
            'trend_direction' => $change === null ? 'no_data' : ($change > 5 ? 'up' : ($change < -5 ? 'down' : 'stable')),
            'expense_change_pct' => $change,
        ];
    }

    /**
     * قائمة التصنيفات المتاحة للمستخدم (نظامية + شخصية)
     */
    public function getAvailableCategories(User $user): array
    {
        $categories = Category::where(function ($q) use ($user) {
            $q->where('is_system', true)->orWhere('user_id', $user->id);
        })
            ->orderByDesc('is_system')
            ->orderBy('name')
            ->get(['id', 'name', 'icon', 'color_hex', 'is_system']);

        return [
            'categories' => $categories->map(fn (Category $c) => [
                'id' => $c->id,
                'name' => $c->name,
                'icon' => $c->icon,
                'color_hex' => $c->color_hex,
                'is_system' => (bool) $c->is_system,
            ])->values()->all(),
        ];
    }

    /* ================================================================
     * 🛠️ أدوات تنفيذ (تُستدعى فقط بعد موافقة المستخدم)
     * ================================================================ */

    /**
     * إنشاء معاملة جديدة
     */
    public function executeCreateTransaction(User $user, array $data): array
    {
        $required = ['category_id', 'account_id', 'type', 'amount', 'transaction_date'];
        foreach ($required as $field) {
            if (! isset($data[$field])) {
                return ['success' => false, 'error' => "الحقل الناقص: {$field}"];
            }
        }

        // التأكد من أن الحساب والتصنيف للمستخدم الحالي
        $account = $user->accounts()->find($data['account_id']);
        if (! $account) {
            return ['success' => false, 'error' => 'الحساب غير موجود أو غير مصرح'];
        }

        $category = Category::where('id', $data['category_id'])
            ->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)->orWhere('is_system', true);
            })
            ->first();

        if (! $category) {
            return ['success' => false, 'error' => 'التصنيف غير موجود أو غير مصرح'];
        }

        try {
            $transaction = $this->transactionService->create($user, [
                'category_id' => $data['category_id'],
                'account_id' => $data['account_id'],
                'type' => $data['type'],
                'amount' => $data['amount'],
                'description' => $data['description'] ?? null,
                'transaction_date' => $data['transaction_date'],
                'payment_method' => $data['payment_method'] ?? 'cash',
                'notes' => $data['notes'] ?? null,
                'location' => $data['location'] ?? null,
                'tags' => $data['tags'] ?? null,
            ]);

            return [
                'success' => true,
                'transaction_id' => $transaction->id,
                'uuid' => $transaction->uuid,
                'new_account_balance' => (float) $account->fresh()->balance,
                'message' => "تم إنشاء المعاملة بنجاح. الرصيد الجديد لـ «{$account->name}»: {$account->fresh()->balance} MAD",
            ];
        } catch (\Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * إنشاء تصنيف شخصي جديد
     */
    public function executeCreateCategory(User $user, array $data): array
    {
        if (empty($data['name'])) {
            return ['success' => false, 'error' => 'اسم التصنيف مطلوب'];
        }

        $exists = Category::where('name', $data['name'])
            ->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)->orWhere('is_system', true);
            })
            ->exists();

        if ($exists) {
            return ['success' => false, 'error' => 'يوجد تصنيف بنفس الاسم مسبقاً'];
        }

        try {
            $category = $user->categories()->create([
                'name' => $data['name'],
                'icon' => $data['icon'] ?? 'default-icon',
                'color_hex' => $data['color_hex'] ?? '#00e676',
                'is_system' => false,
            ]);

            return [
                'success' => true,
                'category_id' => $category->id,
                'name' => $category->name,
                'message' => "تم إنشاء التصنيف «{$category->name}» بنجاح",
            ];
        } catch (\Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * إنشاء ميزانية جديدة
     */
    public function executeCreateBudget(User $user, array $data): array
    {
        if (empty($data['amount']) || $data['amount'] <= 0) {
            return ['success' => false, 'error' => 'مبلغ الميزانية يجب أن يكون موجباً'];
        }

        // التحقق من عدم وجود ميزانية مكررة
        $exists = Budget::withoutTrashed()
            ->where('user_id', $user->id)
            ->where('category_id', $data['category_id'] ?? null)
            ->where('period', $data['period'] ?? 'monthly')
            ->exists();

        if ($exists) {
            return ['success' => false, 'error' => 'لديك بالفعل ميزانية لهذا التصنيف في هذه الفترة'];
        }

        try {
            $budget = Budget::create([
                'user_id' => $user->id,
                'category_id' => $data['category_id'] ?? null,
                'name' => $data['name'] ?? null,
                'amount' => $data['amount'],
                'period' => $data['period'] ?? 'monthly',
                'rollover_enabled' => $data['rollover_enabled'] ?? false,
                'warn_pct' => $data['warn_pct'] ?? 80,
                'critical_pct' => $data['critical_pct'] ?? 100,
                'starts_at' => $data['starts_at'] ?? null,
                'ends_at' => $data['ends_at'] ?? null,
                'is_active' => true,
            ]);

            return [
                'success' => true,
                'budget_id' => $budget->id,
                'uuid' => $budget->uuid,
                'message' => "تم إنشاء الميزانية بنجاح: {$budget->amount} MAD/{$budget->period}",
            ];
        } catch (\Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

public function getTodayDate(): array
{
    $now = now();

    return [
        'iso_date'     => $now->toDateString(),                            // 2025-06-10
        'formatted_ar' => $now->locale('ar')->translatedFormat('l d F Y'), // الثلاثاء 10 يونيو 2025
        'day_of_week'  => $now->locale('ar')->dayName,                     // الثلاثاء
        'month'        => $now->locale('ar')->monthName,                   // يونيو
        'year'         => $now->year,
        'timezone'     => config('app.timezone'),
        'full_iso'     => $now->toIso8601String(),
        'INSTRUCTION'  => 'هذا تاريخ اليوم الرسمي للنظام محسوب برمجياً. استعمل iso_date حرفياً عند تعبئة transaction_date، ولا تخمّن التاريخ بنفسك.',
    ];
}
}
