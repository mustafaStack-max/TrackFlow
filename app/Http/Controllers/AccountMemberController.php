<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\User;
use Illuminate\Http\Request;

class AccountMemberController extends Controller
{
    //
    public function store(Request $request, Account $account)
    {
        $validated = $request->validate([
            'user_i'       => 'required|email|exists:users,email',
            'role'        => 'required|in:admin,editor,viewer',
            'spend_limit' => 'nullable|numeric|min:0',
        ]);
        $userToAdd = User::where('id', $validated['user_id'])->first();

        if ($account->members()->where('user_id', $userToAdd->id)->exists()) {
            return back()->with('error', 'هذا المستخدم عضو بالفعل في هذا الحساب!');
        }
        $account->members()->attach($userToAdd->id, [
            'role'        => $validated['role'],
            'spend_limit' => $validated['spend_limit'] ?? null,
        ]);

        return back()->with('success', 'تمت إضافة العضو بنجاح للحساب.');
    }

    public function update(Request $request, Account $account, User $user)
    {

        $validated = $request->validate([
            'role'        => 'required|in:admin,editor,viewer',
            'spend_limit' => 'nullable|numeric|min:0',
        ]);

        $account->members()->updateExistingPivot($user->id, [
            'role'        => $validated['role'],
            'spend_limit' => $validated['spend_limit'] ?? null,
        ]);

        return back()->with('success', 'تم تحديث صلاحيات العضو بنجاح.');
    }

    public function destroy(Account $account, User $user)
    {

        $account->members()->detach($user->id);

        return back()->with('success', 'تم إزالة العضو من الحساب.');
    }
}
