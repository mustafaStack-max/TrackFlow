<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DataExportService
{
    public function buildExportPayload(User $user): array
    {
        return [
            'meta' => [
                'exported_at' => now()->toIso8601String(),
                'app_version' => '1.0.0',
                'user_uuid' => $user->uuid,
            ],

            'profile' => $user->only([
                'username', 'email', 'currency', 'role', 'avatar_url'
            ]),
            

            'accounts' => $user->accounts()->withTrashed()->get()->toArray(),
            'categories' => $user->categories()->withTrashed()->get()->toArray(),
            'transactions' => $user->transactions()->withTrashed()->get()->toArray(),
            'budgets' => $user->budgets()->withTrashed()->get()->toArray(),
            
            'notifications' => DB::table('notifications')
                ->where('notifiable_type', User::class)
                ->where('notifiable_id', $user->id)
                ->get()
                ->map(fn($n) => (array) $n)
                ->toArray(),
        ];
    }
}