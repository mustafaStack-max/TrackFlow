<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('budgets', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
   
            $table->foreignId('category_id')->nullable()->constrained('categories')->cascadeOnDelete();
            $table->string('name', 40)->nullable();          
            $table->decimal('amount', 12, 2);             
            $table->enum('period', ['monthly', 'weekly', 'yearly'])->default('monthly');
            $table->boolean('rollover_enabled')->default(false);
            $table->decimal('warn_pct', 5, 2)->default(80);
            $table->decimal('critical_pct', 5, 2)->default(100);
            $table->date('starts_at')->nullable();
            $table->date('ends_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->string('alerted_period', 7)->nullable(); // '2026-03' لمنع تكرار التنبيه
            $table->enum('alerted_level', ['none', 'warn', 'critical'])->default('none');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['user_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('budgets');
    }
};