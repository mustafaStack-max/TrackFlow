<?php
namespace App\Services;

use App\Models\Account;
use App\Models\Transaction;
use App\Models\User;
use Exception;
use Illuminate\Support\Facades\DB;

class TransactionService {

    public function create (User $user ,array $data) : Transaction
    {
        return DB::transaction(function () use ($user , $data) {
            $account = $user->accounts()->lockForUpdate()->findOrFail($data['account_id']) ;
            $this->applyBalanceChange($account , $data['type'] , $data['amount']) ;
            return $user->transactions()->create($data) ;
        });

        

    }


    public function update (Transaction $transaction , array $data ) 
    {

        return DB::transaction(function () use ($transaction , $data) {
            $user = $transaction->user ;
            $oldAccount = $user->accounts()->lockForUpdate()->findOrFail($transaction->account_id);
            $this->revertBalanceChange($oldAccount, $transaction->type, $transaction->amount);

            $newAccount = $user->accounts()->lockForUpdate()->findOrFail($data['account_id']);
            $this->applyBalanceChange($newAccount, $data['type'], $data['amount']);

            $transaction->update($data) ;
            return $transaction ;

        }) ;
    }


    public function delete (Transaction $transaction) {
        return DB::transaction(function () use ($transaction ) {
            $account = $transaction->user->accounts()->lockForUpdate()->findOrFail($transaction->account_id) ;
            $this->revertBalanceChange($account , $transaction->type , $transaction->amount) ;
            $transaction->delete() ;
        });
    }



    public function applyBalanceChange (Account $account , string $type , float $amount) 
    {
        if($type === 'expense'  )
            {
                if ($account->balance < $amount)
                    {
                       throw new Exception('الرصيد غير كافٍ لإتمام هذه المعاملة.');
                    }else {
                        $account->decrement('balance' , $amount) ;
                    }
                
            }else {
                $account->increment('balance' , $amount ) ;

            }
    }

    public function revertBalanceChange ( Account $account , string $type , float $amount )
    {
        if ($type === 'income') 
            {
                if ($account->balance < $amount)
                    {
                        throw new Exception('تعذر التراجع عن المعاملة؛ رصيد الحساب سيصبح بالسالب.');
                    }
                $account->decrement('balance' , $amount) ;
            }else {
                $account->increment('balance'  , $amount) ;
            }
    }
}