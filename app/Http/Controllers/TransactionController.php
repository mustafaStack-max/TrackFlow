<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $transactions = $request->user()->transactions()->with(['category', 'account'])->latest()->get();

        return Inertia::render('Transactions', [
            'transactions' => $transactions,
            'categories' => $request->user()->categories,
            'accounts' => $request->user()->accounts,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'account_id' => 'required|exists:accounts,id',
            'type' => 'required|in:expense,income',
            'description' => 'nullable|string|max:255',
            'amount' => 'required|numeric',
            'currency' => 'required|string|size:3',
            'transaction_date' => 'required|date',
            'payment_method' => 'required|in:cash,card,transfer,other',
        ]);

        $validated['uuid'] = Str::uuid();

        $request->user()->transactions()->create($validated);

        return redirect()->back()->with([
            'success' => true,
            'message' => 'تم إنشاء المعاملة بنجاح.',
        ]);
    }

    public function update(Request $request, Transaction $transaction)
    {
        if ($request->user()->id !== $transaction->user_id) {
            abort(403);
        }

        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'account_id' => 'required|exists:accounts,id',
            'type' => 'required|in:expense,income',
            'description' => 'nullable|string|max:255',
            'amount' => 'required|numeric',
            'currency' => 'required|string|size:3',
            'transaction_date' => 'required|date',
            'payment_method' => 'required|in:cash,card,transfer,other',
        ]);

        $transaction->update($validated);

        return redirect()->back()->with([
            'success' => true,
            'message' => 'تم تحديث المعاملة بنجاح.',
        ]);
    }

    public function destroy(Request $request, Transaction $transaction)
    {
        if ($request->user()->id === $transaction->user_id) {
            $transaction->delete();
            
            return redirect()->back()->with([
                'success' => true, 
                'message' => 'تم حذف المعاملة بنجاح.'
            ]);
        }

        abort(403);
    }
}