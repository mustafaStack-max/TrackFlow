<?php

namespace App\Services\Agent;

/**
 * سجل الأدوات: مكان واحد لتعريف كل أداة + تصنيفها قراءة/كتابة.
 *
 * الفصل بين READ و WRITE ليس تنظيمياً فقط — هو حاجز أمان:
 * أدوات WRITE لا تُنفَّذ أبداً مباشرة، بل تمر إجبارياً عبر
 * ActionConfirmationService::propose() ثم موافقة المستخدم.
 */
class AgentToolRegistry
{
    /** أدوات القراءة — تُنفَّذ فوراً بلا موافقة */
    public const READ_TOOLS = [
        'get_financial_summary',
        'get_account_balances',
        'get_top_categories',
        'get_budget_status',
        'get_recent_transactions',
        'get_spending_trend',
        'get_available_categories',
        // ★ المقترحة
        'search_transactions',
        'get_cashflow_forecast',
        'get_recurring_expenses',
        'detect_anomalies',
        'get_category_drift',
        'get_savings_rate_history',
        'get_emergency_fund_status',
        'get_income_stability',
        'get_debt_overview',
        'get_goal_progress',
        'analyze_spending_behavior',
        'get_financial_health_score',
        'simulate_scenario',
        'compare_periods',
        'recall_facts',
    ];

    /** أدوات الكتابة — تمر عبر propose_action فقط */
    public const WRITE_TOOLS = [
        'create_transaction',
        'create_category',
        'create_budget',
        'update_budget',
        'update_transaction',
        // ★ المقترحة
        'create_goal',
        'update_goal',
        'contribute_to_goal',
        'create_recurring_rule',
        'bulk_categorize',
        'split_transaction',
        'cancel_subscription',
        'create_reminder',
    ];

    /** أدوات النظام — لا تلمس بيانات مالية */
    public const SYSTEM_TOOLS = [
        'load_skill',
        'remember_fact',
        'create_chart',
    ];

    public static function isWrite(string $tool): bool
    {
        return in_array($tool, self::WRITE_TOOLS, true);
    }

    public static function isRead(string $tool): bool
    {
        return in_array($tool, self::READ_TOOLS, true);
    }

    /**
     * تعريفات الأدوات المرسلة إلى Gemini.
     * ملاحظة: عدّل شكل المصفوفة ليطابق ما يقبله endpoint الذي تستعمله
     * (بعض الإصدارات تتوقع function_declarations مغلّفة).
     */
    public static function declarations(): array
    {
        return array_merge(
            [app(SkillService::class)->toolDeclaration()],
            self::readDeclarations(),
            self::writeDeclarations(),
            self::systemDeclarations(),
        );
    }

    /* ============================================================ */

    protected static function readDeclarations(): array
    {
        return [
            self::fn('get_financial_summary', 'ملخص مالي (دخل، مصروف، صافي، معدل ادخار) لفترة.', [
                'range' => self::enum(['7d', '30d', '90d', 'month', 'year', 'custom'], 'الفترة، الافتراضي 30d'),
                'from'  => self::str('تاريخ البداية Y-m-d عند range=custom'),
                'to'    => self::str('تاريخ النهاية Y-m-d عند range=custom'),
            ]),
            self::fn('get_account_balances', 'أرصدة كل الحسابات والمجموع.'),
            self::fn('get_top_categories', 'أعلى التصنيفات إنفاقاً في فترة.', [
                'range' => self::str('الفترة، الافتراضي 30d'),
                'limit' => self::int('عدد التصنيفات، الافتراضي 5'),
            ]),
            self::fn('get_budget_status', 'حالة الميزانيات: المصروف، المتبقي، النسبة، التوقع.', [
                'month' => self::str('الشهر بصيغة Y-m، الافتراضي الشهر الحالي'),
            ]),
            self::fn('get_recent_transactions', 'آخر المعاملات المسجلة.', [
                'limit' => self::int('العدد، الافتراضي 10'),
            ]),
            self::fn('get_spending_trend', 'اتجاه الدخل والمصروف لآخر 3 أشهر.'),
            self::fn('get_available_categories', 'التصنيفات المتاحة (نظامية + شخصية) مع معرّفاتها.'),

            /* ----------------- ★ الأدوات المقترحة ----------------- */
            self::fn('search_transactions', 'بحث مفلتر في المعاملات. استعملها قبل أي سؤال عن معاملة بعينها أو تاجر بعينه.', [
                'query'       => self::str('نص للبحث في الوصف/الملاحظات/الوسوم'),
                'category_id' => self::int('تصفية بتصنيف'),
                'account_id'  => self::int('تصفية بحساب'),
                'type'        => self::enum(['income', 'expense'], 'النوع'),
                'min_amount'  => self::num('حد أدنى للمبلغ'),
                'max_amount'  => self::num('حد أقصى للمبلغ'),
                'from'        => self::str('من تاريخ Y-m-d'),
                'to'          => self::str('إلى تاريخ Y-m-d'),
                'limit'       => self::int('الافتراضي 25، الأقصى 100'),
            ]),
            self::fn('get_cashflow_forecast', 'توقع الرصيد اليومي للأيام القادمة اعتماداً على الالتزامات المتكررة ومتوسط الإنفاق. يرجّع تاريخ نفاد السيولة إن وُجد.', [
                'days' => self::int('أفق التوقع بالأيام، الافتراضي 30'),
            ]),
            self::fn('get_recurring_expenses', 'الاشتراكات والالتزامات المتكررة المكتشفة، مع التكلفة الشهرية والسنوية وتاريخ آخر ظهور.', [
                'include_inactive' => self::bool('تضمين ما توقف منذ أكثر من 60 يوماً'),
            ]),
            self::fn('detect_anomalies', 'معاملات شاذة مقارنة بالسلوك المعتاد (مبلغ غير مألوف، تصنيف غير معتاد، تكرار مفاجئ، احتمال ازدواجية).', [
                'range' => self::str('الفترة، الافتراضي 30d'),
            ]),
            self::fn('get_category_drift', 'تغيّر حصة كل تصنيف من إجمالي المصروف عبر الأشهر — لكشف العادات الجديدة الصامتة.', [
                'months' => self::int('عدد الأشهر للمقارنة، الافتراضي 6'),
            ]),
            self::fn('get_savings_rate_history', 'معدل الادخار الشهري عبر الزمن مع المتوسط والاتجاه.', [
                'months' => self::int('الافتراضي 12'),
            ]),
            self::fn('get_emergency_fund_status', 'تغطية صندوق الطوارئ بالأشهر: السيولة المتاحة ÷ متوسط المصروف الشهري.'),
            self::fn('get_income_stability', 'استقرار الدخل: عدد المصادر، الانحراف المعياري، أدنى شهر، نسبة أكبر مصدر. مهمة للدخل غير المنتظم.', [
                'months' => self::int('الافتراضي 6'),
            ]),
            self::fn('get_debt_overview', 'ملخص الديون والأقساط: الرصيد المتبقي، القسط، التكلفة، المدة، نسبة عبء الدين من الدخل.'),
            self::fn('get_goal_progress', 'تقدّم الأهداف المالية: المدخر، المتبقي، المطلوب شهرياً، وهل التاريخ المستهدف ما زال واقعياً.', [
                'goal_id' => self::int('هدف محدد، أو اتركه فارغاً لكل الأهداف'),
            ]),
            self::fn('analyze_spending_behavior', 'تحليل سلوكي: أثر الراتب، الإنفاق الليلي، نهاية الأسبوع، تسريب المبالغ الصغيرة، العناقيد العاطفية، تضخم نمط الحياة، فجوات التسجيل. استعملها قبل أي تحليل نفسي مالي.', [
                'months' => self::int('الافتراضي 6'),
            ]),
            self::fn('get_financial_health_score', 'مؤشر الصحة المالية من 100 بأبعاده الخمسة وأضعف بُعد.'),
            self::fn('simulate_scenario', 'محاكاة «ماذا لو»: أثر تغيير على الرصيد ومعدل الادخار وتاريخ بلوغ الأهداف.', [
                'changes' => [
                    'type'        => 'array',
                    'description' => 'قائمة التغييرات المفترضة',
                    'items'       => [
                        'type'       => 'object',
                        'properties' => [
                            'kind'        => self::enum(['income_change', 'expense_change', 'category_cap', 'one_time', 'monthly_saving'], 'نوع التغيير'),
                            'category_id' => self::int('عند تغيير تصنيف بعينه'),
                            'amount'      => self::num('المبلغ الشهري أو المفرد بالدرهم'),
                        ],
                    ],
                ],
                'months' => self::int('أفق المحاكاة بالأشهر، الافتراضي 12'),
            ]),
            self::fn('compare_periods', 'مقارنة فترتين متساويتين في الطول عبر كل المؤشرات والتصنيفات.', [
                'period_a_from' => self::str('Y-m-d'),
                'period_a_to'   => self::str('Y-m-d'),
                'period_b_from' => self::str('Y-m-d'),
                'period_b_to'   => self::str('Y-m-d'),
            ]),
            self::fn('recall_facts', 'استرجاع ما حُفظ سابقاً عن المستخدم (أهدافه، تحمّله للمخاطرة، أنماطه، ما جرّبه). استدعها في بداية أي محادثة تحليلية.', [
                'topic' => self::str('موضوع للتصفية، اتركه فارغاً لكل شيء'),
            ]),
        ];
    }

    protected static function writeDeclarations(): array
    {
        return [
            self::fn('propose_action', 'اقترح إجراءً يغيّر البيانات. لا ينفّذ شيئاً — يعرض على المستخدم بطاقة تأكيد مع تحليل الأثر. هذه هي الطريقة الوحيدة لأي كتابة.', [
                'action_type' => self::enum(self::WRITE_TOOLS, 'نوع الإجراء المطلوب'),
                'payload'     => [
                    'type'        => 'object',
                    'description' => 'حقول الإجراء. استعمل معرّفات حقيقية من أدوات القراءة، لا تخترعها.',
                ],
                'reason' => self::str('جملة واحدة تشرح للمستخدم لماذا تقترح هذا'),
            ]),
        ];
    }

    protected static function systemDeclarations(): array
    {
        return [
            self::fn('remember_fact', 'احفظ معلومة دائمة عن المستخدم تفيد المحادثات القادمة. لا تحفظ بيانات حساسة ولا أرقام يمكن حسابها من قاعدة البيانات.', [
                'key'   => self::str('مفتاح قصير، مثل: risk_tolerance / dominant_money_script / tried_interventions'),
                'value' => self::str('القيمة بصياغة مختصرة'),
            ]),
            self::fn('create_chart', 'أرجِع مواصفة رسم بياني ليعرضه التطبيق داخل المحادثة.', [
                'type'   => self::enum(['line', 'bar', 'grouped_bar', 'pie', 'progress'], 'نوع الرسم'),
                'title'  => self::str('عنوان يتضمن الفترة'),
                'labels' => ['type' => 'array', 'items' => ['type' => 'string'], 'description' => 'تسميات المحور الأفقي'],
                'series' => [
                    'type'  => 'array',
                    'items' => [
                        'type'       => 'object',
                        'properties' => [
                            'name'   => self::str('اسم السلسلة'),
                            'values' => ['type' => 'array', 'items' => ['type' => 'number']],
                        ],
                    ],
                ],
            ]),
        ];
    }

    /* ---------------- مساعدات بناء الـ schema ---------------- */

    protected static function fn(string $name, string $description, array $properties = [], array $required = []): array
    {
        return [
            'type'        => 'function',
            'name'        => $name,
            'description' => $description,
            'parameters'  => [
                'type'       => 'object',
                'properties' => (object) $properties,
                'required'   => $required,
            ],
        ];
    }

    protected static function str(string $d): array  { return ['type' => 'string',  'description' => $d]; }
    protected static function int(string $d): array  { return ['type' => 'integer', 'description' => $d]; }
    protected static function num(string $d): array  { return ['type' => 'number',  'description' => $d]; }
    protected static function bool(string $d): array { return ['type' => 'boolean', 'description' => $d]; }

    protected static function enum(array $values, string $d): array
    {
        return ['type' => 'string', 'enum' => array_values($values), 'description' => $d];
    }
}