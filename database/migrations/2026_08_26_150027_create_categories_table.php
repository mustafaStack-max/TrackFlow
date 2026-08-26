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
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete() ;

            $table->string('name' , 20 ) ;
            $table->string('icon')->default('default-icon') ;
            $table->char('color_hex' ,7)->default('#00e676') ;
            $table->boolean('is_system')->default(false) ;
            
            $table->timestamps();
            $table->softDeletes() ;
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
