<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAccountRequest;
use App\Models\Account;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AccountController extends Controller
{
    public function index (Request $request)
    {
        return Inertia::render('Accounts' , [ "accounts" =>$request->user()->accounts()->latest()->get() ]) ;
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
