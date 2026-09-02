<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        /* ★ withCount: عَدّ عمليات الشهر الحالي لكل تصنيف في استعلام واحد */
        $categories = Category::where(function ($q) use ($user) {
                $q->where('is_system', true)
                  ->orWhere('user_id', $user->id);
            })
            ->withCount(['transactions as usage_count' => function ($q) {
                $q->whereMonth('transaction_date', now()->month)
                  ->whereYear('transaction_date', now()->year);
            }])
            ->orderByDesc('usage_count')
            ->orderBy('name')
            ->get();

        return Inertia::render('categories', [
            'Categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'      => ['required', 'string', 'max:30'],
            'icon'      => ['nullable', 'string', 'max:50'],
            'color_hex' => ['nullable', 'string', 'regex:/^#[0-9a-fA-F]{6}$/'],
        ]);

        $request->user()->categories()->create($validated);

        return redirect()->back()->with([
            'success' => true,
            'message' => 'تم إنشاء التصنيف بنجاح',
        ]);
    }

    public function update(Request $request, Category $category)
    {
        /* ★ حماية: لا يمكن تعديل إلا التصنيفات المخصصة للمستخدم */
        if ($category->user_id !== $request->user()->id) {
            abort(403, 'غير مصرح بتعديل هذا التصنيف');
        }

        $validated = $request->validate([
            'name'      => ['required', 'string', 'max:30'],
            'icon'      => ['nullable', 'string', 'max:50'],
            'color_hex' => ['nullable', 'string', 'regex:/^#[0-9a-fA-F]{6}$/'],
        ]);

        $category->update($validated);

        return redirect()->back()->with([
            'success' => true,
            'message' => 'تم تحديث التصنيف بنجاح',
        ]);
    }

    public function destroy(Request $request, Category $category)
    {
        /* ★ حماية ثلاثية: ملكية + غير نظامي */
        if ($category->is_system) {
            return redirect()->back()->with([
                'success' => false,
                'message' => 'لا يمكن حذف التصنيفات النظامية',
            ]);
        }

        if ($category->user_id !== $request->user()->id) {
            abort(403, 'غير مصرح بحذف هذا التصنيف');
        }

        $category->delete();

        return redirect()->back()->with([
            'success' => true,
            'message' => 'تم حذف التصنيف بنجاح',
        ]);
    }
}