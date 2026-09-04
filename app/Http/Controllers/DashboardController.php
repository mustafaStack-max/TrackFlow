<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // ──────────────────────────────────────────────
        // 1) قراءة المدة الزمنية المختارة
        // ──────────────────────────────────────────────
        $range = $request->input('range', 'month');
        $customFrom = $request->input('from');
        $customTo = $request->input('to');

        [$since, $until, $periodLabel] = $this->resolveRange($range, $customFrom, $customTo);

        // الفترة السابقة بنفس الطول (للمقارنة)
        [$prevSince, $prevUntil] = $this->previousPeriod($since, $until);

        // ──────────────────────────────────────────────
        // 2) الحسابات
        // ──────────────────────────────────────────────
        $accounts = $user->accounts()->latest()->get();

        // تعبير التاريخ حسب قاعدة البيانات
        $dateExpression = match (DB::connection()->getDriverName()) {
            'pgsql' => "to_char(transactions.transaction_date, 'YYYY-MM-DD')",
            'sqlite' => "date(transactions.transaction_date)",
            'sqlsrv' => "CAST(transactions.transaction_date AS DATE)",
            default => "DATE(transactions.transaction_date)",
        };

        // ── إحصائيات الفترة المختارة ──
        $periodTotals = $user->transactions()
            ->whereBetween('transactions.transaction_date', [$since, $until])
            ->selectRaw("
                transactions.type,
                COALESCE(SUM(transactions.amount), 0) as total,
                COUNT(transactions.id) as tx_count
            ")
            ->groupBy('transactions.type')
            ->get()
            ->keyBy('type');

        $totalExpense = (float) ($periodTotals['expense']->total ?? 0);
        $totalIncome = (float) ($periodTotals['income']->total ?? 0);
        $txCount = (int) $periodTotals->sum('tx_count');

        // ── إحصائيات الفترة السابقة ──
        $prevTotals = $user->transactions()
            ->whereBetween('transactions.transaction_date', [$prevSince, $prevUntil])
            ->selectRaw("
                transactions.type,
                COALESCE(SUM(transactions.amount), 0) as total
            ")
            ->groupBy('transactions.type')
            ->get()
            ->keyBy('type');

        $prevExpense = (float) ($prevTotals['expense']->total ?? 0);
        $prevIncome = (float) ($prevTotals['income']->total ?? 0);

        $pctChange = function ($current, $previous) {
            return $previous > 0
                ? round((($current - $previous) / $previous) * 100, 1)
                : null;
        };

        // ── توقع نهاية الفترة (إذا كانت شهرية) ──
        $predictedExpense = null;
        if ($range === 'month') {
            $daysElapsed = max(Carbon::now()->day, 1);
            $daysInMonth = Carbon::now()->daysInMonth;
            $predictedExpense = $totalExpense > 0
                ? round(($totalExpense / $daysElapsed) * $daysInMonth, 2)
                : 0.0;
        }

        // ──────────────────────────────────────────────
        // 3) السلسلة الزمنية (Series)
        // ──────────────────────────────────────────────
        $seriesRows = $user->transactions()
            ->whereBetween('transactions.transaction_date', [$since, $until])
            ->selectRaw("
                {$dateExpression} as day,
                transactions.type,
                COALESCE(SUM(transactions.amount), 0) as total
            ")
            ->groupBy(DB::raw($dateExpression), 'transactions.type')
            ->get()
            ->groupBy('day');

        $series = [];
        $cumulative = 0;
        $cursor = $since->copy()->startOfDay();
        $end = $until->copy()->endOfDay();

        while ($cursor->lte($end)) {
            $key = $cursor->format('Y-m-d');
            $rows = $seriesRows->get($key, collect());

            $income = (float) $rows->where('type', 'income')->sum('total');
            $expense = (float) $rows->where('type', 'expense')->sum('total');
            $net = $income - $expense;
            $cumulative += $net;

            $series[] = [
                'date' => $key,
                'income' => round($income, 2),
                'expense' => round($expense, 2),
                'net' => round($net, 2),
                'cumulative' => round($cumulative, 2),
            ];

            $cursor->addDay();
        }

        // ──────────────────────────────────────────────
        // 4) توزيع التصنيفات (للفترة المختارة)
        // ──────────────────────────────────────────────
        $categoryBreakdown = $user->transactions()
            ->leftJoin('categories', 'transactions.category_id', '=', 'categories.id')
            ->whereBetween('transactions.transaction_date', [$since, $until])
            ->where('transactions.type', 'expense')
            ->select(
                'transactions.category_id as category_id',
                'categories.name as category_name',
                'categories.color_hex as category_color',
                DB::raw('COALESCE(SUM(transactions.amount), 0) as total'),
                DB::raw('COUNT(transactions.id) as transactions_count'),
                DB::raw('COALESCE(AVG(transactions.amount), 0) as average_amount')
            )
            ->groupBy('transactions.category_id', 'categories.name', 'categories.color_hex')
            ->orderByDesc('total')
            ->get()
            ->map(fn ($row) => [
                'id' => $row->category_id,
                'name' => $row->category_name ?? 'غير مصنف',
                'color_hex' => $row->category_color ?? '#5a8068',
                'total' => round((float) $row->total, 2),
                'count' => (int) $row->transactions_count,
                'avg' => round((float) $row->average_amount, 2),
            ])
            ->values();

        // ──────────────────────────────────────────────
        // 5) توزيع الحسابات (للفترة المختارة)
        // ──────────────────────────────────────────────
        $accountTotals = $user->transactions()
            ->whereBetween('transactions.transaction_date', [$since, $until])
            ->selectRaw("
                transactions.account_id,
                transactions.type,
                COALESCE(SUM(transactions.amount), 0) as total
            ")
            ->groupBy('transactions.account_id', 'transactions.type')
            ->get()
            ->groupBy('account_id');

        $accountBreakdown = $accounts->map(function ($account) use ($accountTotals) {
            $rows = $accountTotals->get($account->id, collect());

            return [
                'id' => $account->id,
                'name' => $account->name,
                'type' => $account->type,
                'color_hex' => $account->color_hex,
                'balance' => round((float) $account->balance, 2),
                'income' => round((float) $rows->where('type', 'income')->sum('total'), 2),
                'expense' => round((float) $rows->where('type', 'expense')->sum('total'), 2),
            ];
        })->values();

// ──────────────────────────────────────────────
// 6) Heatmap — كتبع الفترة المختارة (بحد أقصى 6 أشهر)
// ──────────────────────────────────────────────
$heatSince = $since->copy()->startOfDay();
$heatmapLabel = $periodLabel;

// إذا كانت الفترة طويلة بزاف، نقصوها على 6 أشهر باش تبقى الخريطة مقروءة
$maxWindow = $until->copy()->subMonthsNoOverflow(6)->startOfDay();
if ($heatSince->lt($maxWindow)) {
    $heatSince = $maxWindow;
    $heatmapLabel = 'آخر 6 أشهر';
}

$heatRows = $user->transactions()
    ->whereBetween('transactions.transaction_date', [$heatSince, $until])
    ->selectRaw("
        {$dateExpression} as day,
        transactions.type,
        COALESCE(SUM(transactions.amount), 0) as total
    ")
    ->groupBy(DB::raw($dateExpression), 'transactions.type')
    ->get()
    ->groupBy('day');

$heatmap = [];
$hCursor = $heatSince->copy();
while ($hCursor->lte($until)) {
    $key = $hCursor->format('Y-m-d');
    $rows = $heatRows->get($key, collect());

    $heatmap[] = [
        'date' => $key,
        'expense' => round((float) $rows->where('type', 'expense')->sum('total'), 2),
        'income' => round((float) $rows->where('type', 'income')->sum('total'), 2),
    ];

    $hCursor->addDay();
}

        // ──────────────────────────────────────────────
        // 7) آخر العمليات (للفترة المختارة)
        // ──────────────────────────────────────────────
        $recent = $user->transactions()
            ->with([
                'category' => fn ($q) => $q->withTrashed(),
                'account' => fn ($q) => $q->withTrashed(),
            ])
            ->whereBetween('transactions.transaction_date', [$since, $until])
            ->orderByDesc('transactions.transaction_date')
            ->limit(10)
            ->get()
            ->map(fn ($t) => [
                'id' => $t->id,
                'description' => $t->description,
                'type' => $t->type,
                'account' => $t->account->name ?? '—',
                'category' => $t->category->name ?? 'غير مصنف',
                'category_color' => $t->category->color_hex ?? '#5a8068',
                'date' => $t->transaction_date?->format('d/m/Y'),
                'amount' => round((float) $t->amount, 2),
            ])
            ->values();
        $sankey = $this->buildSankey($user, $since, $until);
        // ──────────────────────────────────────────────
        // 8) إرجاع البيانات
        // ──────────────────────────────────────────────
        return Inertia::render('Dashboard', [
            // المدة المختارة (باش الواجهة تعرفها)
            'range' => $range,
            'customFrom' => $customFrom,
            'customTo' => $customTo,
            'periodLabel' => $periodLabel,
            'heatmapLabel' => $heatmapLabel,  
            'sankey' => $sankey,

            'kpis' => [
                'totalExpense' => round($totalExpense, 2),
                'totalIncome' => round($totalIncome, 2),
                'netPeriod' => round($totalIncome - $totalExpense, 2),
                'txCount' => $txCount,
                'totalWealth' => round((float) $accounts->sum('balance'), 2),
                'accountsCount' => $accounts->count(),
                'prevExpensePct' => $pctChange($totalExpense, $prevExpense),
                'prevIncomePct' => $pctChange($totalIncome, $prevIncome),
                'predictedExpense' => $predictedExpense,
            ],

            'series' => $series,
            'categoryBreakdown' => $categoryBreakdown,
            'accountBreakdown' => $accountBreakdown,
            'accounts' => $accountBreakdown,
            'heatmap' => $heatmap,
            'recent' => $recent,
        ]);
    }

    // ──────────────────────────────────────────────────
    // تحديد التواريخ حسب المدة المختارة
    // ──────────────────────────────────────────────────
    private function resolveRange(string $range, ?string $from, ?string $to): array
    {
        $now = Carbon::now();

        return match ($range) {
            'month' => [
                $now->copy()->startOfMonth(),
                $now->copy()->endOfDay(),
                'هذا الشهر',
            ],
            'lastMonth' => [
                $now->copy()->subMonthNoOverflow()->startOfMonth(),
                $now->copy()->subMonthNoOverflow()->endOfMonth(),
                'الشهر الماضي',
            ],
            '30d' => [
                $now->copy()->subDays(29)->startOfDay(),
                $now->copy()->endOfDay(),
                'آخر 30 يوم',
            ],
            '90d' => [
                $now->copy()->subDays(89)->startOfDay(),
                $now->copy()->endOfDay(),
                'آخر 3 أشهر',
            ],
            '6m' => [
                $now->copy()->subMonthsNoOverflow(6)->startOfDay(),
                $now->copy()->endOfDay(),
                'آخر 6 أشهر',
            ],
            'ytd' => [
                $now->copy()->startOfYear(),
                $now->copy()->endOfDay(),
                'هذه السنة',
            ],
            '365d' => [
                $now->copy()->subDays(364)->startOfDay(),
                $now->copy()->endOfDay(),
                'آخر سنة',
            ],
            'all' => [
                Carbon::create(2020, 1, 1),
                $now->copy()->endOfDay(),
                'كل السجل',
            ],
            'custom' => [
                $from ? Carbon::parse($from)->startOfDay() : $now->copy()->subDays(29)->startOfDay(),
                $to ? Carbon::parse($to)->endOfDay() : $now->copy()->endOfDay(),
                'فترة مخصصة',
            ],
            default => [
                $now->copy()->startOfMonth(),
                $now->copy()->endOfDay(),
                'هذا الشهر',
            ],
        };
    }

    // ──────────────────────────────────────────────────
    // الفترة السابقة بنفس الطول
    // ──────────────────────────────────────────────────
    private function previousPeriod(Carbon $since, Carbon $until): array
    {
        $length = $since->diffInSeconds($until);

        $prevUntil = $since->copy()->subSecond();
        $prevSince = $prevUntil->copy()->subSeconds($length);

        return [$prevSince, $prevUntil];
    }
    // ──────────────────────────────────────────────
// Sankey: الدخل ← الحسابات ← التصنيفات
// ──────────────────────────────────────────────
private function buildSankey($user, $since, $until): array
{
    $txs = $user->transactions()
        ->with(['account:id,name,color_hex', 'category:id,name,color_hex'])
        ->whereBetween('transaction_date', [$since, $until])
        ->get();

    $nodes = [];
    $links = [];

    $addNode = function (string $name, string $color) use (&$nodes) {
        if (!isset($nodes[$name])) {
            $nodes[$name] = ['name' => $name, 'color' => $color];
        }
    };

    $addLink = function (string $source, string $target, float $value) use (&$links) {
        $key = $source . '→' . $target;
        if (!isset($links[$key])) {
            $links[$key] = ['source' => $source, 'target' => $target, 'value' => 0];
        }
        $links[$key]['value'] += $value;
    };

    foreach ($txs as $t) {
        $amount = (float) $t->amount;
        $accountName = $t->account?->name ?? 'حساب مجهول';
        $accountColor = $t->account?->color_hex ?? '#00d4ff';

        if ($t->type === 'income') {
            // ① مصدر الدخل → الحساب
            $source = $t->description ?: 'مداخيل أخرى';
            $addNode($source, '#00e676');
            $addNode($accountName, $accountColor);
            $addLink($source, $accountName, $amount);
        } else {
            // ② الحساب → التصنيف (فين مشات الفلوس)
            $catName = $t->category?->name ?? 'غير مصنف';
            $catColor = $t->category?->color_hex ?? '#ff5c5c';
            $addNode($accountName, $accountColor);
            $addNode($catName, $catColor);
            $addLink($accountName, $catName, $amount);
        }
    }

    return [
        'nodes' => array_values($nodes),
        'links' => array_values(array_filter(
            array_map(fn ($l) => ['source' => $l['source'], 'target' => $l['target'], 'value' => round($l['value'], 2)], $links),
            fn ($l) => $l['value'] > 0
        )),
    ];
}
}