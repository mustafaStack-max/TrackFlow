<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        /* ============================================================
         | ذاكرة العميل: ما يتعلمه عن المستخدم ويفيد المحادثات القادمة
         * ============================================================ */
        Schema::create('agent_memories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('key');                 // risk_tolerance, dominant_money_script...
            $table->text('value');
            $table->string('source')->default('agent'); // agent | user
            $table->timestamp('confirmed_at')->nullable(); // أكّدها المستخدم صراحةً
            $table->timestamps();

            $table->unique(['user_id', 'key']);
        });

        /* ============================================================
         | الأهداف المالية
         * ============================================================ */
        Schema::create('financial_goals', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('account_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('type')->default('savings'); // emergency_fund | savings | purchase | debt_payoff | investment
            $table->decimal('target_amount', 15, 2);
            $table->decimal('current_amount', 15, 2)->default(0);
            $table->decimal('monthly_contribution', 15, 2)->nullable();
            $table->date('target_date')->nullable();
            $table->unsignedTinyInteger('priority')->default(3); // 1 = الأعلى
            $table->string('icon')->nullable();
            $table->string('color_hex', 7)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamp('achieved_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['user_id', 'is_active', 'priority']);
        });

        Schema::create('goal_contributions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('goal_id')->constrained('financial_goals')->cascadeOnDelete();
            $table->foreignId('transaction_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('amount', 15, 2);
            $table->date('contributed_at');
            $table->timestamps();

            $table->index(['goal_id', 'contributed_at']);
        });

        /* ============================================================
         | لقطة سلوكية محسوبة دورياً (تجنّب إعادة حساب ثقيل في كل رسالة)
         * ============================================================ */
        Schema::create('behavioral_snapshots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->date('computed_for');            // أول يوم من الشهر
            $table->json('patterns');                // نتائج analyze_spending_behavior
            $table->unsignedTinyInteger('health_score')->nullable();
            $table->json('health_breakdown')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'computed_for']);
        });

        /* ============================================================
         | تذكيرات ينشئها العميل بموافقة المستخدم
         * ============================================================ */
        Schema::create('agent_reminders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('body')->nullable();
            $table->timestamp('remind_at');
            $table->string('context_type')->nullable(); // goal | budget | pending_purchase
            $table->unsignedBigInteger('context_id')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'remind_at', 'sent_at']);
        });

        /* ============================================================
         | تحسينات على الجداول القائمة
         * ============================================================ */

        // وقت المعاملة الفعلي — بدونه لا يمكن كشف الإنفاق الليلي أو أثر الراتب
        Schema::table('transactions', function (Blueprint $table) {
            $table->timestamp('occurred_at')->nullable()->after('transaction_date');
            $table->index(['user_id', 'type', 'transaction_date']);
        });

        // تنظيف الإجراءات المنتهية يمسح جدولاً كاملاً بدون هذا الفهرس
        Schema::table('pending_actions', function (Blueprint $table) {
            $table->index(['status', 'expires_at']);
        });

        // تتبع التكلفة: تعبئة tokens_used بلا فهرس تجعل تقارير الاستهلاك بطيئة
        Schema::table('agent_messages', function (Blueprint $table) {
            $table->index(['created_at']);
        });
    }

    public function down(): void
    {
        Schema::table('agent_messages', fn (Blueprint $t) => $t->dropIndex(['created_at']));
        Schema::table('pending_actions', fn (Blueprint $t) => $t->dropIndex(['status', 'expires_at']));
        Schema::table('transactions', function (Blueprint $t) {
            $t->dropIndex(['user_id', 'type', 'transaction_date']);
            $t->dropColumn('occurred_at');
        });

        Schema::dropIfExists('agent_reminders');
        Schema::dropIfExists('behavioral_snapshots');
        Schema::dropIfExists('goal_contributions');
        Schema::dropIfExists('financial_goals');
        Schema::dropIfExists('agent_memories');
    }
};