<?php

use App\Http\Controllers\AccountController;
use App\Http\Controllers\AccountMemberController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TransactionController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', [DashboardController::class, 'index'])->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::get('/accounts' , [AccountController::class , 'index'])->middleware('auth')->name('accounts.index') ;
Route::post('/accounts' , [AccountController::class , 'store'])->middleware('auth')->name('accounts.store') ;
Route::put('/accounts/{account:uuid}' , [AccountController::class , 'update'])->middleware('auth')->name('accounts.update') ;
Route::delete('/accounts/{account:id}' , [AccountController::class , 'destroy'])->middleware('auth')->name('accounts.destroy') ;

Route::get('/categories' , [CategoryController::class , 'index'])->middleware('auth')->name('categories.index') ;
Route::post('/categories' , [CategoryController::class , 'store'])->middleware('auth')->name('categories.store') ;
Route::put('/categories/{category:id}' , [CategoryController::class , 'update'])->middleware('auth')->name('categories.update')  ;
Route::delete('/categories/{category:id}' , [CategoryController::class , 'destroy'])->middleware('auth')->name('categories.destroy')  ;


Route::get('/transactions' , [TransactionController::class , 'index'])->middleware('auth')->name('transactions.index') ;
Route::post('/transactions' , [TransactionController::class , 'store'])->middleware('auth')->name('transactions.store') ;
Route::put('/transactions/{transaction:id}' , [TransactionController::class , 'update'])->middleware('auth')->name('transactions.update')  ;
Route::delete('/transactions/{transaction:id}' , [TransactionController::class , 'destroy'])->middleware('auth')->name('transactions.destroy')  ;




Route::middleware(['auth'])->group(function () {
    

    Route::post('/accounts/{account}/members', [AccountMemberController::class, 'store'])
        ->name('accounts.members.store');

    Route::put('/accounts/{account}/members/{user}', [AccountMemberController::class, 'update'])
        ->name('accounts.members.update');


    Route::delete('/accounts/{account}/members/{user}', [AccountMemberController::class, 'destroy'])
        ->name('accounts.members.destroy');
});

require __DIR__.'/auth.php';