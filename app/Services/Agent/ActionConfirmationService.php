<?php

namespace App\Services\Agent;

use App\Models\Account;
use App\Models\Budget;
use App\Models\Category;
use App\Models\PendingAction;
use App\Models\User;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ActionConfirmationService
{
    public function __construct(
        protected FinancialToolsService $tools,
    ) {}

    public function propose(
        User $user,
        string $actionType,
        array $payload,
        ?int $messageId = null
    ): PendingAction {
        if (! $this->isValidActionType($actionType)) {
            throw new Exception("نوع إجراء غير مدعوم: {$actionType}");
        }

        $this->validatePayload($actionType, $payload);
        $impact = $this->calculateImpact($user, $actionType, $payload);

        return PendingAction::create([
            'user_id' => $user->id,
            'message_id' => $messageId,
            'action_type' => $actionType,
            'payload' => $payload,
            'impact_analysis' => $impact,
            'status' => PendingAction::STATUS_PENDING,
            'expires_at' => now()->addMinutes(
                (int) config('agent.confirmation.ttl_minutes', 30)
            ),
        ]);
    }

    public function approve(string $token): array
    {
        return DB::transaction(function () use ($token) {
            $action = PendingAction::where('token', $token)
                ->where('status', PendingAction::STATUS_PENDING)
                ->lockForUpdate()
                ->first();

            if (! $action) {
                throw new Exception('الإجراء غير موجود أو تم التعامل معه مسبقاً.');
            }

            if ($action->isExpired()) {
                $action->update(['status' => PendingAction::STATUS_EXPIRED]);
                throw new Exception('انتهت صلاحية هذا الإجراء. أعد المحاولة.');
            }

            $user = $action->user;

            try {
                $result = $this->dispatchExecution($user, $action->action_type, $action->payload);

                if (($result['success'] ?? false) === false) {
                    throw new Exception($result['error'] ?? 'فشل التنفيذ');
                }

                $action->approve();
                $action->markExecuted();

                return [
                    'success' => true,
                    'message' => $result['message'] ?? 'تم تنفيذ الإجراء بنجاح.',
                    'result' => $result,
                ];
            } catch (Exception $e) {
                $action->reject();
                Log::error('Action execution failed', [
                    'token' => $token,
                    'type' => $action->action_type,
                    'error' => $e->getMessage(),
                ]);
                throw $e;
            }
        });
    }

    public function reject(string $token): array
    {
        $action = PendingAction::where('token', $token)
            ->where('status', PendingAction::STATUS_PENDING)
            ->firstOrFail();

        $action->reject();

        return [
            'success' => true,
            'message' => 'تم رفض الإجراء.',
        ];
    }

    public function cleanupExpired(): int
    {
        return PendingAction::where('status', PendingAction::STATUS_PENDING)
            ->where('expires_at', '<=', now())
            ->update(['status' => PendingAction::STATUS_EXPIRED]);
    }

    protected function calculateImpact(User $user, string $type, array $payload): array
    {
        return match ($type) {
            PendingAction::TYPE_CREATE_TRANSACTION => $this->impactOfCreateTransaction($user, $payload),
            PendingAction::TYPE_CREATE_CATEGORY    => $this->impactOfCreateCategory($user, $payload),
            PendingAction::TYPE_CREATE_BUDGET      => $this->impactOfCreateBudget($user, $payload),
            default                                => [],
        };
    }

    protected function impactOfCreateTransaction(User $user, array $payload): array
    {
        $amount = (float) ($payload['amount'] ?? 0);
        $txType = $payload['type'] ?? 'expense';
        $accountId = $payload['account_id'] ?? null;
        $categoryId = $payload['category_id'] ?? null;

        $account = $accountId ? $user->accounts()->find($accountId) : null;
        $category = $categoryId ? Category::find($categoryId) : null;

        $balanceBefore = $account ? (float) $account->balance : 0;
        $balanceAfter = $txType === 'expense'
            ? $balanceBefore - $amount
            : $balanceBefore + $amount;

        $budgetImpact = null;
        if ($category && $txType === 'expense') {
            $budget = Budget::withoutTrashed()
                ->where('user_id', $user->id)
                ->where('category_id', $category->id)
                ->where('period', 'monthly')
                ->where('is_active', true)
                ->first();

            if ($budget) {
                $currentMonth = now()->startOfMonth();
                $spentNow = DB::table('transactions')
                    ->where('user_id', $user->id)
                    ->where('category_id', $category->id)
                    ->where('type', 'expense')
                    ->whereNull('deleted_at')
                    ->where('transaction_date', '>=', $currentMonth)
                    ->sum('amount');

                $spentAfter = $spentNow + $amount;
                $remaining = (float) $budget->amount - $spentAfter;
                $pct = $budget->amount > 0 ? ($spentAfter / (float) $budget->amount) * 100 : 0;

                $budgetImpact = [
                    'budget_name' => $budget->name ?? $category->name,
                    'amount_limit' => (float) $budget->amount,
                    'spent_before' => round($spentNow, 2),
                    'spent_after' => round($spentAfter, 2),
                    'remaining_after' => round($remaining, 2),
                    'percentage_after' => round($pct, 1),
                    'status_after' => $pct >= (float) $budget->critical_pct ? 'exceeded'
                        : ($pct >= (float) $budget->warn_pct ? 'warning' : 'ok'),
                ];
            }
        }

        return [
            'account' => $account ? [
                'name' => $account->name,
                'balance_before' => $balanceBefore,
                'balance_after' => round($balanceAfter, 2),
                'sufficient' => $txType === 'expense' ? $balanceBefore >= $amount : true,
            ] : null,
            'category' => $category ? [
                'name' => $category->name,
                'icon' => $category->icon,
                'color_hex' => $category->color_hex,
            ] : null,
            'budget' => $budgetImpact,
            'transaction' => [
                'type' => $txType,
                'amount' => $amount,
                'date' => $payload['transaction_date'] ?? now()->format('Y-m-d'),
            ],
        ];
    }

    protected function impactOfCreateCategory(User $user, array $payload): array
    {
        $name = $payload['name'] ?? '';
        $exists = Category::where('name', $name)
            ->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)->orWhere('is_system', true);
            })
            ->exists();

        return [
            'action' => 'سيتم إنشاء تصنيف شخصي جديد',
            'category_name' => $name,
            'icon' => $payload['icon'] ?? 'default-icon',
            'color_hex' => $payload['color_hex'] ?? '#00e676',
            'already_exists' => $exists,
            'warning' => $exists ? '⚠️ يوجد تصنيف بنفس الاسم مسبقاً' : null,
        ];
    }

    protected function impactOfCreateBudget(User $user, array $payload): array
    {
        $categoryId = $payload['category_id'] ?? null;
        $category = $categoryId ? Category::find($categoryId) : null;
        $amount = (float) ($payload['amount'] ?? 0);
        $period = $payload['period'] ?? 'monthly';

        $exists = Budget::withoutTrashed()
            ->where('user_id', $user->id)
            ->where('category_id', $categoryId)
            ->where('period', $period)
            ->exists();

        $warnPct = $payload['warn_pct'] ?? 80;
        $criticalPct = $payload['critical_pct'] ?? 100;

        return [
            'action' => 'سيتم إنشاء ميزانية جديدة',
            'category' => $category ? [
                'name' => $category->name,
                'icon' => $category->icon,
                'color_hex' => $category->color_hex,
            ] : null,
            'amount' => $amount,
            'period' => $period,
            'period_label' => match ($period) {
                'weekly'  => 'أسبوعية',
                'yearly'  => 'سنوية',
                default   => 'شهرية',
            },
            'warn_at' => round($amount * $warnPct / 100, 2),
            'critical_at' => round($amount * $criticalPct / 100, 2),
            'already_exists' => $exists,
            'warning' => $exists ? '⚠️ لديك ميزانية نشطة لنفس التصنيف في نفس الفترة' : null,
        ];
    }

    protected function dispatchExecution(User $user, string $type, array $payload): array
    {
        return match ($type) {
            PendingAction::TYPE_CREATE_TRANSACTION => $this->tools->executeCreateTransaction($user, $payload),
            PendingAction::TYPE_CREATE_CATEGORY    => $this->tools->executeCreateCategory($user, $payload),
            PendingAction::TYPE_CREATE_BUDGET      => $this->tools->executeCreateBudget($user, $payload),
            default                                => ['success' => false, 'error' => 'إجراء غير مدعوم'],
        };
    }

    protected function isValidActionType(string $type): bool
    {
        return in_array($type, [
            PendingAction::TYPE_CREATE_TRANSACTION,
            PendingAction::TYPE_CREATE_CATEGORY,
            PendingAction::TYPE_CREATE_BUDGET,
            PendingAction::TYPE_UPDATE_TRANSACTION,
            PendingAction::TYPE_UPDATE_BUDGET,
        ], true);
    }

    protected function validatePayload(string $type, array $payload): void
    {
        match ($type) {
            PendingAction::TYPE_CREATE_TRANSACTION => $this->requireFields($payload, [
                'account_id', 'category_id', 'type', 'amount', 'transaction_date',
            ]),
            PendingAction::TYPE_CREATE_CATEGORY => $this->requireFields($payload, ['name']),
            PendingAction::TYPE_CREATE_BUDGET => $this->requireFields($payload, ['amount']),
            default => null,
        };
    }

    protected function requireFields(array $payload, array $fields): void
    {
        foreach ($fields as $field) {
            if (! isset($payload[$field]) || $payload[$field] === '' || $payload[$field] === null) {
                throw new Exception("الحقل المطلوب مفقود: {$field}");
            }
        }
    }
}