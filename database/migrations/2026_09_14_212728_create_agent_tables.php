<?php


use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
   
        Schema::create('agent_conversations', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title')->nullable();
            $table->string('gemini_interaction_id')->nullable(); 
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['user_id', 'is_active', 'updated_at']);
        });


        Schema::create('agent_messages', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('conversation_id')->constrained('agent_conversations')->cascadeOnDelete();
            $table->enum('role', ['user', 'assistant', 'tool']);
            $table->text('content');
            $table->json('tool_calls')->nullable(); 
            $table->json('tool_results')->nullable(); 
            $table->json('metadata')->nullable(); 
            $table->integer('tokens_used')->nullable(); 
            $table->timestamps();
            
            $table->index(['conversation_id', 'created_at']);
        });

   
        Schema::create('pending_actions', function (Blueprint $table) {
            $table->id();
            $table->uuid('token')->unique();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('message_id')->nullable()->constrained('agent_messages')->nullOnDelete();
            $table->string('action_type'); 
            $table->json('payload'); 
            $table->json('impact_analysis')->nullable(); 
            $table->enum('status', ['pending', 'approved', 'rejected', 'expired'])->default('pending');
            $table->timestamp('expires_at');
            $table->timestamp('executed_at')->nullable();
            $table->timestamps();
            
            $table->index(['user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pending_actions');
        Schema::dropIfExists('agent_messages');
        Schema::dropIfExists('agent_conversations');
    }
};