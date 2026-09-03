<?php

namespace App\Services;

use App\Models\Budget;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class BudgetService
{
  
    public function periodBounds(string $period, Carbon $anchor): array
    {
        return match ($period) {
            'weekly' => [$anchor->copy()->startOfWeek(), $anchor->copy()->endOfWeek()],
            'yearly' => [$anchor->copy()->startOfYear(), $anchor->copy()->endOfYear()],
            default  => [$anchor->copy()->startOfMonth(), $anchor->copy()->endOfMonth()],
        };
    }

    public function previousAnchor(string $period, Carbon $anchor): Carbon
    {
        return match ($period) {
            'weekly' => $anchor->copy()->subWeek(),
            'yearly' => $anchor->copy()->subYearNoOverflow(),
            default  => $anchor->copy()->subMonthNoOverflow(), 
        };
    }


public function spentMap(User $user, Carbon $start, Carbon $end): array
{
    // ★ تواريخ كـ strings صريحة لمنع أي تأثير من Carbon::setTestNow
    $startStr = $start->format('Y-m-d H:i:s');
    $endStr   = $end->format('Y-m-d H:i:s');

    return DB::table('transactions')
        ->where('user_id', $user->id)
        ->where('type', 'expense')
        ->whereNull('deleted_at')
        ->where('transaction_date', '>=', $startStr)
        ->where('transaction_date', '<=', $endStr)
        ->selectRaw('category_id, SUM(amount) as total')
        ->groupBy('category_id')
        ->pluck('total', 'category_id')
        ->map(fn ($v) => (float) $v)
        ->toArray();
}


    public function summarizeBudget(Budget $b, Carbon $anchor, array $currentMap, array $prevMap): array
    {
        [$start, $end] = $this->periodBounds($b->period, $anchor);

        $sum = fn (array $map) => $b->isOverall() ? array_sum($map) : (float) ($map[$b->category_id] ?? 0);

        $spent = $sum($currentMap);

        $rollover = 0.0;
        if ($b->rollover_enabled) {
            $prevLeftover = max(0, (float) $b->amount - $sum($prevMap));
            $rollover = min($prevLeftover, (float) $b->amount);
        }

        $effective = (float) $b->amount + $rollover;
        $remaining = $effective - $spent;
        $pct = $effective > 0 ? ($spent / $effective) * 100 : 0;

        $status = $pct >= (float) $b->critical_pct ? 'exceeded'
            : ($pct >= (float) $b->warn_pct ? 'warning' : 'ok');

        $totalDays = max(1, (int) round($start->diffInDays($end)) + 1);
        $now = now();
        $elapsedDays = max(0, min($totalDays, (int) floor($start->diffInDays($now)) + 1));
        $daysLeft = max(0, $totalDays - $elapsedDays);
        $projected = $elapsedDays > 0 ? ($spent / $elapsedDays) * $totalDays : $spent;

  
        $overrunDate = null;
        if ($remaining <= 0 && $spent > 0) {
            $overrunDate = $now->format('Y-m-d');
        } elseif ($remaining > 0 && $spent > 0 && $elapsedDays > 0) {
            $perDay = $spent / $elapsedDays;
            $date = $now->copy()->addDays((int) floor($remaining / $perDay));
            $overrunDate = $date->lte($end) ? $date->format('Y-m-d') : null;
        }

        return [
            'id' => $b->id,
            'uuid' => $b->uuid,
            'is_overall' => $b->isOverall(),
            'name' => $b->isOverall()
                ? ($b->name ?? 'الميزانية الشاملة')
                : ($b->category?->name ?? 'غير مصنف'),
            'icon' => $b->category?->icon,
            'color' => $b->category?->color_hex ?? '#00e676',
            'period' => $b->period,
            'amount' => (float) $b->amount,
            'rollover' => round($rollover, 2),
            'effective' => round($effective, 2),
            'spent' => round($spent, 2),
            'remaining' => round($remaining, 2),
            'pct' => round($pct, 1),
            'status' => $status,
            'projected' => round($projected, 2),
            'days_left' => $daysLeft,
            'overrun_date' => $overrunDate,
        ];
    }


    public function buildSummary(User $user, Carbon $anchor): array
    {
        $budgets = $user->budgets()->active()->with('category')->get();

       
        $currentMaps = [];
        $prevMaps = [];
        foreach ($budgets->pluck('period')->unique() as $period) {
            [$s, $e] = $this->periodBounds($period, $anchor);
            $currentMaps[$period] = $this->spentMap($user, $s, $e);
            $pa = $this->previousAnchor($period, $anchor);
            [$ps, $pe] = $this->periodBounds($period, $pa);
            $prevMaps[$period] = $this->spentMap($user, $ps, $pe);
        }

        $items = $budgets
            ->map(fn (Budget $b) => $this->summarizeBudget(
                $b, $anchor,
                $currentMaps[$b->period] ?? [],
                $prevMaps[$b->period] ?? []
            ))
            ->sortByDesc('pct')
            ->values();

        $monthMap = $currentMaps['monthly'] ?? [];
        $overallSpent = array_sum($monthMap);

        $catBudgets = $items->filter(fn ($i) => ! $i['is_overall']);
        $budgeted = $catBudgets->sum('effective');
        $spentOnBudgeted = $catBudgets->sum('spent');
        $unbudgeted = max(0, $overallSpent - array_sum(
            $catBudgets->map(fn ($i) => (float) ($monthMap[$this->categoryIdOf($i, $budgets)] ?? 0))->toArray()
        ));

        return [
            'items' => $items,
            'totals' => [
                'spent' => round($overallSpent, 2),
                'budgeted' => round($budgeted, 2),
                'remaining' => round($budgeted - $spentOnBudgeted, 2),
                'unbudgeted' => round($unbudgeted, 2),
            ],
        ];
    }

    private function categoryIdOf(array $item, $budgets): ?int
    {
        return $budgets->firstWhere('id', $item['id'])?->category_id;
    }
}