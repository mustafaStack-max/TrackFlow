<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTransactionRequest;
use App\Http\Requests\UpdateTransactionRequest;
use App\Models\Transaction;
use App\Services\TransactionService;
use Exception;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate ;

class TransactionController extends Controller
{
    public function __construct(
        protected TransactionService $transactionService
    )
    {}

    public function index(Request $request)
    {
        $transactions = $request->user()->transactions()->with(['category', 'account'])->latest()->get();

        return Inertia::render('Transactions', [
            'transactions' => $transactions,
            'categories' => $request->user()->categories,
            'accounts' => $request->user()->accounts,
        ]);
    }



public function store(StoreTransactionRequest $request)
{

    try {
        $this->transactionService->create($request->user() ,  $request->validated()) ;
    }catch(Exception $e)
    {
        return redirect()->back()->withErrors(['amount' => $e->getMessage()]) ;
    }

    return redirect()->back()->with([
        'success' => true,
        'message' => 'تم إنشاء المعاملة بنجاح.',
    ]);
}
    public function update(UpdateTransactionRequest $request, Transaction $transaction)
    {
        Gate::authorize('update' , $transaction) ;
        try 
        {
            $this->transactionService->update($transaction ,  $request->validated()) ;
        }catch (Exception $e)
        {
            return redirect()->back()->withErrors(['amount' => $e->getMessage()]) ;
        }

        return redirect()->back()->with([
            'success' => true,
            'message' => 'تم تحديث المعاملة بنجاح.',
        ]);
    }

    public function destroy(Transaction $transaction)
    {
        Gate::authorize('delete' , $transaction) ;
        try
        {
            $this->transactionService->delete($transaction) ;
        }catch(Exception $e)
        {
            return redirect()->back()->withErrors(['amount' => $e->getMessage()]) ;
        }
            
        return redirect()->back()->with([
            'success' => true, 
            'message' => 'تم حذف المعاملة بنجاح.'
        ]);
    }
}