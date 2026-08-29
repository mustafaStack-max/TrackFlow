<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $rangeDays = (int) $request->integer('range', 90); // how many days of history to ship to the front-end
        $since = Carbon::now()->subDays($rangeDays)->startOfDay();

        $accounts = $user->accounts()->latest()->get();
        $categories = $user->categories()->orWhere('is_system', true)->get();

        $transactions = $user->transactions()
            ->with(['category:id,name,color_hex', 'account:id,name'])
            ->where('transaction_date', '>=', $since)
            ->orderByDesc('transaction_date')
            ->get();

        $monthStart = Carbon::now()->startOfMonth();
        $lastMonthStart = Carbon::now()->subMonthNoOverflow()->startOfMonth();
        $lastMonthEnd = Carbon::now()->subMonthNoOverflow()->endOfMonth();

        $thisMonthTx = $transactions->filter(fn ($t) => Carbon::parse($t->transaction_date)->gte($monthStart));
        $lastMonthTx = $user->transactions()
            ->whereBetween('transaction_date', [$lastMonthStart, $lastMonthEnd])
            ->get();

        $totalExpenseMonth = (float) $thisMonthTx->where('type', 'expense')->sum('amount');
        $totalIncomeMonth = (float) $thisMonthTx->where('type', 'income')->sum('amount');
        $lastMonthExpense = (float) $lastMonthTx->where('type', 'expense')->sum('amount');
        $lastMonthIncome = (float) $lastMonthTx->where('type', 'income')->sum('amount');

        $momExpensePct = $lastMonthExpense > 0
            ? round((($totalExpenseMonth - $lastMonthExpense) / $lastMonthExpense) * 100, 1)
            : null;
        $momIncomePct = $lastMonthIncome > 0
            ? round((($totalIncomeMonth - $lastMonthIncome) / $lastMonthIncome) * 100, 1)
            : null;

        $daysElapsed = max(Carbon::now()->day, 1);
        $daysInMonth = Carbon::now()->daysInMonth;
        $predictedExpenseEom = round(($totalExpenseMonth / $daysElapsed) * $daysInMonth, 2);

        // ── daily cashflow series (income / expense / net / cumulative) ──
        $byDay = $transactions->groupBy(fn ($t) => Carbon::parse($t->transaction_date)->format('Y-m-d'));
        $series = [];
        $cursor = $since->copy();
        $cumulative = 0;
        $today = Carbon::now()->endOfDay();
        while ($cursor->lte($today)) {
            $key = $cursor->format('Y-m-d');
            $dayTx = $byDay->get($key, collect());
            $income = (float) $dayTx->where('type', 'income')->sum('amount');
            $expense = (float) $dayTx->where('type', 'expense')->sum('amount');
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

        // ── category breakdown (this month, expenses only) ──
        $categoryBreakdown = $thisMonthTx->where('type', 'expense')
            ->groupBy('category_id')
            ->map(function ($rows) {
                $cat = $rows->first()->category;
                return [
                    'id' => $rows->first()->category_id,
                    'name' => $cat->name ?? 'غير مصنف',
                    'color_hex' => $cat->color_hex ?? '#5a8068',
                    'total' => round((float) $rows->sum('amount'), 2),
                ];
            })
            ->sortByDesc('total')
            ->values();

        // ── account breakdown (this month, income vs expense) ──
        $accountBreakdown = $accounts->map(function ($acc) use ($thisMonthTx) {
            $rows = $thisMonthTx->where('account_id', $acc->id);
            return [
                'id' => $acc->id,
                'name' => $acc->name,
                'color_hex' => $acc->color_hex,
                'income' => round((float) $rows->where('type', 'income')->sum('amount'), 2),
                'expense' => round((float) $rows->where('type', 'expense')->sum('amount'), 2),
            ];
        })->values();

        // ── spending heatmap: last 35 days, daily expense total ──
        $heatmap = [];
        $hCursor = Carbon::now()->subDays(34)->startOfDay();
        while ($hCursor->lte($today)) {
            $key = $hCursor->format('Y-m-d');
            $dayTx = $byDay->get($key, collect());
            $heatmap[] = [
                'date' => $key,
                'amount' => round((float) $dayTx->where('type', 'expense')->sum('amount'), 2),
            ];
            $hCursor->addDay();
        }

        // ── recent log ──
        $recent = $transactions->take(10)->map(fn ($t) => [
            'id' => $t->id,
            'description' => $t->description,
            'type' => $t->type,
            'account' => $t->account->name ?? '—',
            'category' => $t->category->name ?? '—',
            'category_color' => $t->category->color_hex ?? '#5a8068',
            'date' => Carbon::parse($t->transaction_date)->format('d/m/Y'),
            'amount' => (float) $t->amount,
        ])->values();

        return Inertia::render('Dashboard', [
            'kpis' => [
                'totalExpense' => round($totalExpenseMonth, 2),
                'totalIncome' => round($totalIncomeMonth, 2),
                'netMonth' => round($totalIncomeMonth - $totalExpenseMonth, 2),
                'txCount' => $thisMonthTx->count(),
                'totalWealth' => round((float) $accounts->sum('balance'), 2),
                'accountsCount' => $accounts->count(),
                'momExpensePct' => $momExpensePct,
                'momIncomePct' => $momIncomePct,
                'predictedExpenseEom' => $predictedExpenseEom,
            ],
            'accounts' => $accounts,
            'series' => $series,
            'categoryBreakdown' => $categoryBreakdown,
            'accountBreakdown' => $accountBreakdown,
            'heatmap' => $heatmap,
            'recent' => $recent,
        ]);
    }
}