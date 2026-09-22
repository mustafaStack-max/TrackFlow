<?php

use App\Http\Controllers\AccountController;
use App\Http\Controllers\AgentController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\BudgetController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DataBackupController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\WelcomeController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

Route::get('/', WelcomeController::class)->name('home');

/*
|--------------------------------------------------------------------------
| Authenticated Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth')->group(function () {

    /*
    |----------------------------------------------------------------------
    | Dashboard
    |----------------------------------------------------------------------
    */

    Route::get('dashboard', [DashboardController::class, 'index'])
        ->middleware('verified')
        ->name('dashboard');

    /*
    |----------------------------------------------------------------------
    | Profile
    |----------------------------------------------------------------------
    */

    Route::controller(ProfileController::class)
        ->prefix('profile')
        ->name('profile.')
        ->group(function () {
            Route::get('/', 'edit')->name('edit');
            Route::patch('/', 'update')->name('update');
            Route::delete('/', 'destroy')->name('destroy');
        });

    /*
    |----------------------------------------------------------------------
    | Budgets
    |----------------------------------------------------------------------
    */

    Route::controller(BudgetController::class)
        ->prefix('budgets')
        ->name('budgets.')
        ->group(function () {
            Route::get('suggest', 'suggest')->name('suggest');
        });

    Route::resource('budgets', BudgetController::class)
        ->except(['create', 'show', 'edit']);

    /*
    |----------------------------------------------------------------------
    | Notifications
    |----------------------------------------------------------------------
    */

    Route::controller(NotificationController::class)
        ->prefix('notifications')
        ->name('notifications.')
        ->group(function () {
            Route::get('/', 'index')->name('index');
            Route::post('read-all', 'readAll')->name('readAll');
            Route::post('{notificationId}/read', 'read')->name('readOne');
        });

    /*
    |----------------------------------------------------------------------
    | Analytics & Settings
    |----------------------------------------------------------------------
    */

    Route::get('analytics', [AnalyticsController::class, 'index'])
        ->name('analytics.index');

    Route::get('settings', [SettingsController::class, 'index'])
        ->name('settings.index');

    /*
    |----------------------------------------------------------------------
    | Data Backup
    |----------------------------------------------------------------------
    */

    Route::controller(DataBackupController::class)
        ->prefix('data')
        ->name('data.')
        ->group(function () {
            Route::get('export', 'export')->name('export');
            Route::post('import', 'import')->name('import');
        });

    /*
    |----------------------------------------------------------------------
    | AI Agent
    |----------------------------------------------------------------------
    */

    Route::controller(AgentController::class)
        ->prefix('agent')
        ->name('agent.')
        ->group(function () {
            Route::get('/', 'index')->name('index');
            Route::post('/', 'create')->name('create');

            Route::get('{agent:uuid}', 'show')->name('show');
            Route::post('{agent:uuid}/chat', 'chat')->name('chat');
            Route::post('{agent:uuid}/close', 'close')->name('close');
            Route::delete('{agent:uuid}', 'destroy')->name('destroy');

            Route::prefix('actions/{token}')->group(function () {
                Route::post('approve', 'approveAction')->name('approve');
                Route::post('reject', 'rejectAction')->name('reject');
            });
        });

    /*
    |----------------------------------------------------------------------
    | Accounts / Categories / Transactions
    |----------------------------------------------------------------------
    */

    Route::resource('accounts', AccountController::class)
        ->only(['index', 'store', 'update', 'destroy'])
        ->scoped(['account' => 'uuid']);

    Route::resource('categories', CategoryController::class)
        ->only(['index', 'store', 'update', 'destroy']);

    Route::resource('transactions', TransactionController::class)
        ->only(['index', 'store', 'update', 'destroy']);
});

require __DIR__ . '/auth.php';