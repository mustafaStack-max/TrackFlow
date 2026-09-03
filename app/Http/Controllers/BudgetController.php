<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use App\Models\Category;
use App\Services\BudgetService;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class BudgetController extends Controller
{
    public function __construct(protected BudgetService $service)
    {
        // ★ لا نستخدم authorizeResource — غير متوافق مع Laravel 11+
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $month = $request->query('month');
        $anchor = $month && preg_match('/^\d{4}-\d{2}$/', $month)
            ? Carbon::createFromFormat('Y-m', $month)->startOfMonth()
            : now();

        $summary = $this->service->buildSummary($user, $anchor);

        return Inertia::render('Budgets', [
            'month' => $anchor->format('Y-m'),
            'budgets' => $summary['items'],
            'totals' => $summary['totals'],
            'categories' => Category::where('user_id', $user->id)
                ->orWhere('is_system', true)
                ->get(['id', 'name', 'icon', 'color_hex'])
                ->map(fn ($c) => [
                    'id' => $c->id,
                    'name' => $c->name,
                    'icon' => $c->icon,
                    'color_hex' => $c->color_hex,
                ]),
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'category_id' => [
                'nullable', 'integer',
                Rule::exists('categories', 'id')->where(fn ($q) => $q->where('user_id', $user->id)->orWhere('is_system', true)),
            ],
            'name' => ['nullable', 'string', 'max:40', 'required_without:category_id'],
            'amount' => ['required', 'numeric', 'min:1', 'max:10000000'],
            'period' => ['required', Rule::in(Budget::PERIODS)],
            'rollover_enabled' => ['required', 'boolean'],
            'warn_pct' => ['required', 'numeric', 'min:10', 'max:100'],
            'critical_pct' => ['required', 'numeric', 'min:11', 'max:200', 'gt:warn_pct'],
        ], [
            'critical_pct.gt' => 'يجب أن تكون نسبة الحرجة أعلى من نسبة التحذير.',
            'amount.min' => 'الحد الأدنى يجب أن يكون 1 MAD على الأقل.',
        ]);

        $exists = Budget::withoutTrashed()
            ->where('user_id', $user->id)
            ->where('category_id', $validated['category_id'] ?? null)
            ->where('period', $validated['period'])
            ->exists();

        if ($exists) {
            return back()->withErrors([
                'category_id' => 'لديك بالفعل ميزانية لهذا التصنيف في هذه الفترة.',
            ])->withInput();
        }

        Budget::create(array_merge($validated, ['user_id' => $user->id]));

        return back()->with('success', 'تم إنشاء الميزانية بنجاح');
    }

    public function update(Request $request, Budget $budget)
    {
        // ★ تحقق الملكية يدويًا (Laravel 11+)
        if ($budget->user_id !== $request->user()->id) {
            abort(403, 'غير مصرح بتعديل هذه الميزانية');
        }

        $validated = $request->validate([
            'name' => ['nullable', 'string', 'max:40'],
            'amount' => ['required', 'numeric', 'min:1', 'max:10000000'],
            'period' => ['required', Rule::in(Budget::PERIODS)],
            'rollover_enabled' => ['required', 'boolean'],
            'warn_pct' => ['required', 'numeric', 'min:10', 'max:100'],
            'critical_pct' => ['required', 'numeric', 'min:11', 'max:200', 'gt:warn_pct'],
        ]);

        $budget->update($validated);

        return back()->with('success', 'تم تحديث الميزانية');
    }

    public function destroy(Request $request, Budget $budget)
    {
        // ★ تحقق الملكية يدويًا (Laravel 11+)
        if ($budget->user_id !== $request->user()->id) {
            abort(403, 'غير مصرح بحذف هذه الميزانية');
        }

        $budget->delete();
        return back()->with('success', 'تم حذف الميزانية');
    }

    /**
     * ★ API للاقتراح الذكي: متوسط آخر 3 أشهر
     * GET /budgets/suggest?category_id=X
     */
    public function suggest(Request $request)
    {
        $validated = $request->validate([
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
        ]);

        $user = $request->user();
        $catId = $validated['category_id'] ?? null;

        $now = now();
        $totals = [];
        for ($i = 1; $i <= 3; $i++) {
            $anchor = $now->copy()->subMonthsNoOverflow($i);
            [$start, $end] = $this->service->periodBounds('monthly', $anchor);

            $total = DB::table('transactions')
                ->where('user_id', $user->id)
                ->where('type', 'expense')
                ->whereNull('deleted_at')
                ->when($catId, fn ($q) => $q->where('category_id', $catId))
                ->where('transaction_date', '>=', $start->format('Y-m-d H:i:s'))
                ->where('transaction_date', '<=', $end->format('Y-m-d H:i:s'))
                ->sum('amount');

            $totals[] = (float) $total;
        }

        $avg = array_sum($totals) / 3;
        $suggested = $avg > 0 ? (int) round($avg / 100) * 100 : 1000;

        return response()->json([
            'suggested' => $suggested,
            'history' => $totals,
            'average' => round($avg, 2),
        ]);
    }
}