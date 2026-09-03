<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
'navCounts' => fn () => $request->user() ? [
    'accounts' => $request->user()->accounts()->count(),
    'transactions' => $request->user()->transactions()->count(),
] : [],
'navSummary' => fn () => $request->user() ? (function () use ($request) {
    $accounts = $request->user()->accounts()->orderByDesc('balance')->get(['id', 'name', 'balance', 'color_hex']);
    return [
        'totalNetWorth' => (float) $accounts->sum('balance'),
        'accountsCount' => $accounts->count(),
        'accounts' => $accounts,
    ];
})() : null,
'notifications' => $request->user()
    ? $request->user()->notifications()->latest()->take(15)->get()->map(fn ($n) => [
        'id' => $n->id,
        'message' => $n->data['message'] ?? '',
        'level' => $n->data['level'] ?? 'info',
        'created_at' => $n->created_at?->diffForHumans(),
        'read_at' => $n->read_at, 
    ])->all()
    : [],
        ];
    }
}
