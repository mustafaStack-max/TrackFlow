<?php

namespace App\Events;

use App\Models\Transaction;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TransactionChanged
{
    use Dispatchable, SerializesModels;

    public function __construct(public Transaction $transaction) {}
    protected $listen = [
    \App\Events\TransactionChanged::class => [\App\Listeners\CheckBudgetThresholds::class],
];
}