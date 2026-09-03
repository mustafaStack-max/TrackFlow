<?php

namespace App\Listeners;

use App\Events\TransactionChanged;
use App\Notifications\BudgetAlert;
use App\Services\BudgetService;

class CheckBudgetThresholds
{
    public function __construct(protected BudgetService $service) {}

    public function handle(TransactionChanged $event): void
    {
        $user = $event->transaction->user;
        if (! $user) return;

        $periodKey = now()->format('Y-m');
        $summary = $this->service->buildSummary($user, now());
        $budgets = $user->budgets()->active()->get()->keyBy('id');

        foreach ($summary['items'] as $item) {
            $budget = $budgets->get($item['id']);
            if (! $budget) continue;

            $level = match ($item['status']) {
                'exceeded' => 'critical',
                'warning'  => 'warn',
                default    => 'none',
            };

            if ($level === 'none') continue;

       
            if ($budget->alerted_period === $periodKey) {
                if ($budget->alerted_level === $level) continue;
                if ($budget->alerted_level === 'critical') continue;
            }

            $budget->update([
                'alerted_period' => $periodKey,
                'alerted_level'  => $level,
            ]);

            $user->notify(new BudgetAlert($item['name'], $item, $level));
        }
    }
}