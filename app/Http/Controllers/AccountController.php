<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAccountRequest;
use App\Models\Account;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AccountController extends Controller
{
public function index(Request $request)
{
    $userId = $request->user()->id;

    $accounts = Account::where('user_id', $userId)
        ->orWhereHas('members', function ($query) use ($userId) {
            $query->where('user_id', $userId);
        })
        ->with(['user:id,name,email', 'members']) 
        ->latest()
        ->get()
        ->map(function ($account) use ($userId) {
   
            if ($account->user_id === $userId) {
                $account->current_user_role = 'owner';
            } else {
                $member = $account->members->firstWhere('id', $userId);
                $account->current_user_role = $member ? $member->pivot->role : 'viewer';
            }
            return $account;
        });

    return Inertia::render('Accounts', [
        'accounts' => $accounts
    ]);
}
    public function store ( StoreAccountRequest $request)
    {
        $account  = $request->user()->accounts()->create($request->validated()) ;
        return redirect()->back()->with(['success' => true , 'message' => 'account created successfuly']) ;

    }

    public function update (StoreAccountRequest $request , Account $account ) 
    {
        $account = $account->update($request->validated()) ;
        return redirect()->back()->with(['succes' => true , 'message' => 'account update successfuly']) ;
    }

    public function destroy (Request $request ,  Account $account ) 
    {

                $account = $account->delete() ;
                return redirect()->back()->with(['succes' => true , 'message' => 'account deleted successfuly']) ;

    }


}
