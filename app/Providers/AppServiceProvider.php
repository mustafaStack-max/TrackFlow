<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use App\Events\TransactionChanged;
use App\Listeners\CheckBudgetThresholds;
use Illuminate\Support\Facades\Event;


class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
        Event::listen(TransactionChanged::class, CheckBudgetThresholds::class);
    }
}
