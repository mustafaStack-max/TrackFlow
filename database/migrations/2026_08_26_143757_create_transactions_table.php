<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique() ;
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete() ;
            $table->foreignId('category_id')->constrained()->cascadeOnDelete() ;
            $table->foreignId('account_id')->constrained()->cascadeOnDelete() ;

            $table->enum('type' , ['expense','income'])->default('expense');
            $table->string('description' , 255)->nullable() ;
            $table->decimal('amount' , 12,2) ;
            $table->char('currency', 3)->default('MAD') ;
            $table->dateTime('transaction_date') ;
            $table->text('notes')->nullable();
            $table->string('receipt_url')->nullable() ;
            $table->string('location')->nullable() ;
            $table->enum('payment_method' , ['cash','card','transfer','other'] )->default('cash') ;
            $table->json('tags')->nullable() ;

            $table->timestamps();
            $table->softDeletes() ;

            $table->index(['user_id', 'transaction_date']) ;
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
