<?php

namespace App\Services;

use App\Models\Account;
use App\Models\Budget;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DataImportService
{
    public function import(User $user, array $payload): void
    {
        // ✅ تنظيف المفاتيح من المسافات الزائدة
        $payload = $this->normalizeKeys($payload);

        DB::transaction(function () use ($user, $payload) {
            $categoryMap = $this->importCategories($user, $payload['categories'] ?? []);
            $accountMap  = $this->importAccounts($user, $payload['accounts'] ?? []);
            
            $this->importTransactions($user, $payload['transactions'] ?? [], $accountMap, $categoryMap);
            $this->importBudgets($user, $payload['budgets'] ?? [], $categoryMap);
        });
    }

    /**
     * تنظيف جميع المفاتيح في المصفوفة من المسافات الزائدة
     */
    private function normalizeKeys(array $data): array
    {
        $clean = [];
        foreach ($data as $key => $value) {
            $cleanKey = trim((string) $key);
            if (is_array($value)) {
                // إذا كانت مصفوفة رقمية (list)، نطبق التنظيف على كل عنصر
                if (array_is_list($value)) {
                    $clean[$cleanKey] = array_map(fn($item) => is_array($item) ? $this->normalizeKeys($item) : $item, $value);
                } else {
                    $clean[$cleanKey] = $this->normalizeKeys($value);
                }
            } else {
                $clean[$cleanKey] = is_string($value) ? trim($value) : $value;
            }
        }
        return $clean;
    }

    private function importCategories(User $user, array $categories): array
    {
        $map = [];
        
        foreach ($categories as $cat) {
            $cat = $this->normalizeKeys($cat); // حماية إضافية
            $oldId = $cat['id'] ?? null;
            $name = $cat['name'] ?? null;
            $isSystem = (int)($cat['is_system'] ?? 0) === 1; // ✅ تحقق صارم

            if (!$name || !$oldId) continue;

            if ($isSystem) {
                // ✅ التصنيفات النظامية: نبحث عنها في قاعدة البيانات بالاسم
                $systemCat = Category::where('name', $name)
                    ->where('is_system', true)
                    ->first();

                if ($systemCat) {
                    // نربط الـ ID القديم بالـ ID الحقيقي في قاعدة بياناتنا
                    $map[$oldId] = $systemCat->id;
                } else {
                    // التصنيف النظامي غير موجود في قاعدتنا (حالة نادرة)
                    Log::warning("System category not found in DB: {$name}");
                    $map[$oldId] = null;
                }
                continue;
            }

            // ✅ التصنيفات الشخصية: نبحث عنها بالاسم + المستخدم الحالي
            $existing = Category::where('name', $name)
                ->where('user_id', $user->id)
                ->where('is_system', false)
                ->first();

            if ($existing) {
                $existing->update([
                    'icon' => $cat['icon'] ?? $existing->icon,
                    'color_hex' => $cat['color_hex'] ?? $existing->color_hex,
                ]);
                $map[$oldId] = $existing->id;
            } else {
                $newCat = Category::create([
                    'user_id' => $user->id,
                    'name' => $name,
                    'icon' => $cat['icon'] ?? 'default',
                    'color_hex' => $cat['color_hex'] ?? '#00e676',
                    'is_system' => false,
                ]);
                $map[$oldId] = $newCat->id;
            }
        }
        
        return $map;
    }

    private function importAccounts(User $user, array $accounts): array
    {
        $map = [];
        
        foreach ($accounts as $acc) {
            $acc = $this->normalizeKeys($acc);
            $oldId = $acc['id'] ?? null;
            $uuid = $acc['uuid'] ?? null;

            if (!$oldId || !$uuid) continue;

            $existing = Account::where('uuid', $uuid)
                ->where('user_id', $user->id)
                ->first();

            $accountData = [
                'name' => $acc['name'],
                'type' => $acc['type'],
                'balance' => $acc['balance'] ?? 0,
                'currency' => $acc['currency'] ?? 'MAD',
                'color_hex' => $acc['color_hex'] ?? '#00e676',
                'is_active' => $acc['is_active'] ?? true,
            ];

            if ($existing) {
                $existing->update($accountData);
                $map[$oldId] = $existing->id;
            } else {
                $newAcc = Account::create(array_merge($accountData, [
                    'uuid' => $uuid,
                    'user_id' => $user->id,
                ]));
                $map[$oldId] = $newAcc->id;
            }
        }
        
        return $map;
    }

    private function importTransactions(User $user, array $transactions, array $accountMap, array $categoryMap): void
    {
        foreach ($transactions as $tx) {
            $tx = $this->normalizeKeys($tx);
            $oldAccountId = $tx['account_id'] ?? null;
            $oldCategoryId = $tx['category_id'] ?? null;

            $newAccountId = $accountMap[$oldAccountId] ?? null;
            $newCategoryId = $categoryMap[$oldCategoryId] ?? null;

            // ✅ تخطي المعاملة إذا لم نتمكن من ربطها بحساب أو تصنيف صحيح
            if (!$newAccountId || !$newCategoryId) {
                Log::warning("Skipping transaction due to missing relation: " . ($tx['description'] ?? 'unknown'));
                continue;
            }

            $txData = [
                'user_id' => $user->id,
                'account_id' => $newAccountId,
                'category_id' => $newCategoryId,
                'type' => $tx['type'] ?? 'expense',
                'description' => $tx['description'] ?? null,
                'amount' => $tx['amount'] ?? 0,
                'currency' => $tx['currency'] ?? 'MAD',
                'transaction_date' => $tx['transaction_date'] ?? now(),
                'notes' => $tx['notes'] ?? null,
                'receipt_url' => $tx['receipt_url'] ?? null,
                'location' => $tx['location'] ?? null,
                'payment_method' => $tx['payment_method'] ?? 'cash',
                'tags' => $tx['tags'] ?? null,
            ];

            Transaction::updateOrCreate(
                ['uuid' => $tx['uuid']],
                $txData
            );
        }
    }

    private function importBudgets(User $user, array $budgets, array $categoryMap): void
    {
        foreach ($budgets as $budget) {
            $budget = $this->normalizeKeys($budget);
            $oldCategoryId = $budget['category_id'] ?? null;

            // الميزانية قد تكون شاملة (category_id = null)
            $newCategoryId = null;
            if ($oldCategoryId !== null) {
                $newCategoryId = $categoryMap[$oldCategoryId] ?? null;
                if (!$newCategoryId) continue;
            }

            $budgetData = [
                'user_id' => $user->id,
                'category_id' => $newCategoryId,
                'name' => $budget['name'] ?? null,
                'amount' => $budget['amount'] ?? 0,
                'period' => $budget['period'] ?? 'monthly',
                'rollover_enabled' => (bool)($budget['rollover_enabled'] ?? false),
                'warn_pct' => $budget['warn_pct'] ?? 80,
                'critical_pct' => $budget['critical_pct'] ?? 100,
                'starts_at' => $budget['starts_at'] ?? null,
                'ends_at' => $budget['ends_at'] ?? null,
                'is_active' => (bool)($budget['is_active'] ?? true),
            ];

            Budget::updateOrCreate(
                ['uuid' => $budget['uuid']],
                $budgetData
            );
        }
    }
}