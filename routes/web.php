<?php

use App\Http\Controllers\AccountController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProfileController;
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

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::get('/accounts' , [AccountController::class , 'index'])->middleware('auth') ;
Route::post('/accounts' , [AccountController::class , 'store'])->middleware('auth')->name('accounts.store') ;
Route::put('/accounts/{account:uuid}' , [AccountController::class , 'update'])->middleware('auth')->name('accounts.update') ;
Route::delete('/accounts/{account:id}' , [AccountController::class , 'destroy'])->middleware('auth')->name('accounts.destroy') ;

Route::get('/categories' , [CategoryController::class , 'index'])->middleware('auth') ;
Route::post('/categories' , [CategoryController::class , 'store'])->middleware('auth')->name('categories.store') ;
Route::put('/categories/{category:id}' , [CategoryController::class , 'update'])->middleware('auth')->name('categories.update')  ;
Route::delete('/categories/{category:id}' , [CategoryController::class , 'destroy'])->middleware('auth')->name('categories.destroy')  ;

require __DIR__.'/auth.php';
