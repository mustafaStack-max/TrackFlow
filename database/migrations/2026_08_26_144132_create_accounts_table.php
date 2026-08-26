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
        Schema::create('accounts', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('user_id')->constrained('users' , 'id')->cascadeOnDelete();

            $table->string('name' , 40) ;
            $table->enum('type' , ['cash','bank','card','savings','other'])->default('cash') ;
            $table->decimal('balance' , 12 , 2)->default(0.00) ;
            $table->char('currency' ,3)->default("MAD") ;
            $table->char('color_hex' , 7)->default('#00e676') ;
            $table->boolean('is_active')->default(true) ;

            $table->timestamps();
            $table->softDeletes() ;
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('accounts');
    }
};
