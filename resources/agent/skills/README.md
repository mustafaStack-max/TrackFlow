# ترقية عميل TrackFlow إلى مستشار مالي متقدم

حزمة جاهزة للدمج في مشروع Laravel الحالي. تحوّل العميل من «منفّذ أدوات» إلى
مستشار له منهجية تشخيص، وفهم سلوكي، ومهارات تُحمَّل عند الحاجة.

---

## الفكرة المعمارية

المشكلة في `system_instruction` الواحد الضخم: كل رسالة تدفع ثمن كل التعليمات،
والتعليمات المتباعدة تتزاحم فيتجاهل النموذج بعضها، وأي تعديل يتطلب نشراً.

الحل: **مهارات تُحمَّل عند الطلب** (progressive disclosure).

```
system_instruction  (~700 كلمة، ثابت)
        │  يحتوي: الهوية + قاعدة «البيانات قبل الرأي» + فهرس المهارات
        ▼
   load_skill("money-psychology")      ← النموذج يطلبها بنفسه
        │                                أو تُحمَّل مسبقاً بالكلمات المفتاحية
        ▼
resources/agent/skills/*.md            ← ملفات Markdown تعدّلها بلا نشر
```

الفائدة العملية: تكلفة أقل لكل رسالة، دقة أعلى لأن التعليمات النشطة قليلة ومركّزة،
وتعديل سلوك المستشار = تعديل ملف نصي.

---

## محتوى الحزمة

| الملف | الدور |
|-------|-------|
| `config/agent.php` | تعليمات أساسية مختصرة + سجل المهارات + حدود + بيانات السوق المحلية |
| `app/Services/Agent/SkillService.php` | تحميل المهارات، التخمين بالكلمات المفتاحية، تعريف `load_skill` |
| `app/Services/Agent/AgentToolRegistry.php` | تعريفات كل الأدوات + فصل قراءة/كتابة |
| `resources/agent/skills/core-advisor.md` | منهجية التشخيص + مؤشر الصحة المالية + تصنيف نوع المشكلة |
| `resources/agent/skills/money-psychology.md` | أنماط المال، الأنماط السلوكية المستخرجة من البيانات، التدخلات، بروتوكول التحليل النفسي |
| `resources/agent/skills/investing.md` | سلّم الأولويات، فئات الأصول بالمغرب، توزيع الأصول، كشف الاحتيال |
| `resources/agent/skills/wealth-building.md` | رياضيات معدل الادخار، رفع الدخل، سلّم المراحل، تحويل الهدف إلى خطة |
| `resources/agent/skills/debt.md` | ترتيب السداد، عبء الدين، التعامل مع التأخر |
| `resources/agent/skills/reporting.md` | هيكل التقرير الشهري واختيار الرسم البياني |
| `resources/agent/skills/guardrails.md` | حدود الأمان، صياغة عدم اليقين، الخصوصية، مقاومة الحقن |
| `database/migrations/...` | `agent_memories`, `financial_goals`, `goal_contributions`, `behavioral_snapshots`, `agent_reminders` + `occurred_at` + فهارس |

---

## خطوات الدمج

**1.** انسخ الملفات إلى أماكنها المقابلة في المشروع (احتفظ بنسخة من `config/agent.php` القديم).

**2.** شغّل المايجريشن:
```bash
php artisan migrate
php artisan config:clear
```

**3.** أضف `load_skill` والمهارات المخمّنة إلى حلقة الأدوات. في المكان الذي تبني
فيه `$tools` و`$executor` (غالباً في `AgentController` أو خدمة وسيطة):

```php
$skills = app(SkillService::class);

// تحميل مسبق: يوفّر جولة API كاملة في أغلب الحالات
$preloaded = $skills->loadMany($skills->guess($userMessage));
$input = $preloaded
    ? "<loaded_skills>\n{$preloaded}\n</loaded_skills>\n\n{$userMessage}"
    : $userMessage;

$executor = function (string $name, array $args) use ($user, $skills, $message) {

    // 1) أدوات النظام
    if ($name === 'load_skill') {
        return ['skill' => $args['skill'], 'content' => $skills->load($args['skill'])];
    }

    // 2) أي أداة كتابة لا تُنفَّذ — تتحول إلى اقتراح فقط
    if ($name === 'propose_action' || AgentToolRegistry::isWrite($name)) {
        $type    = $args['action_type'] ?? $name;
        $payload = $args['payload'] ?? $args;

        $action = app(ActionConfirmationService::class)
            ->propose($user, $type, $payload, $message->id);

        return [
            'status'          => 'awaiting_user_confirmation',
            'token'           => $action->token,
            'impact_analysis' => $action->impact_analysis,
            'note'            => 'لم يُنفَّذ شيء. اشرح الأثر للمستخدم واطلب تأكيده.',
        ];
    }

    // 3) أدوات القراءة
    if (! AgentToolRegistry::isRead($name)) {
        return ['error' => "أداة غير معروفة: {$name}"];
    }

    return $this->dispatchReadTool($user, $name, $args);
};

$reply = $gemini->chatWithTools(
    message: $input,
    tools: AgentToolRegistry::declarations(),
    executor: $executor,
    previousInteractionId: $conversation->gemini_interaction_id,
    maxRounds: config('agent.limits.max_rounds'),
);
```

**4.** ابنِ الأدوات الجديدة تدريجياً حسب الترتيب أدناه. المهارات تشير إلى أدوات
غير موجودة بعد — وهذا مقبول: النموذج سيحصل على `error` ويشرح للمستخدم أن الميزة
غير متوفرة. لكن كل أداة تبنيها ترفع جودة النصيحة مباشرة.

---

## الأدوات المقترحة — مرتّبة بالأثر ÷ الجهد

### الموجة الأولى (أعلى عائد، أسهل تنفيذ)

| الأداة | لماذا |
|--------|-------|
| `search_transactions` | العميل حالياً أعمى: يرى آخر 10 معاملات فقط. أي سؤال عن تاجر أو معاملة بعينها يفشل. **ابدأ بهذه.** |
| `get_recurring_expenses` | أسهل مكسب فوري للمستخدم: الاشتراكات المنسية. لديك جدول متكررات أصلاً |
| `get_emergency_fund_status` | رقم واحد يحدد كل نصيحة لاحقة (سيولة أم استثمار) |
| `get_cashflow_forecast` | يحوّل العميل من «ماذا حدث» إلى «ماذا سيحدث» — أهم قفزة في القيمة المحسوسة |
| `recall_facts` + `remember_fact` | بدونها كل محادثة تبدأ من الصفر ولا يوجد «مستشار» فعلاً |

### الموجة الثانية (الذكاء الحقيقي)

| الأداة | لماذا |
|--------|-------|
| `analyze_spending_behavior` | قلب التحليل النفسي المالي. تحتاج عمود `occurred_at` (في المايجريشن) |
| `simulate_scenario` | «لو قللت المطاعم 400، متى أصل للهدف؟» — يحوّل النصيحة إلى قرار |
| `get_goal_progress` + `create_goal` | الأهداف كانت في خطتك الأصلية ولم تُربط بالعميل بعد |
| `get_financial_health_score` | رقم واحد يتابعه المستخدم شهرياً = سبب للعودة |
| `detect_anomalies` | كشف الازدواجية والاشتراكات المضاعفة والمبالغ الشاذة |

### الموجة الثالثة

`get_category_drift` · `get_savings_rate_history` · `get_income_stability` ·
`get_debt_overview` · `compare_periods` · `create_chart` · `bulk_categorize` ·
`split_transaction` · `create_reminder` · `create_recurring_rule`

### مقترحات خارج الأدوات

- **تقرير شهري تلقائي** (`php artisan agent:monthly-report`): العميل يبادر بدل
  انتظار السؤال. أقوى ميزة احتفاظ بالمستخدم في تطبيقات كهذه.
- **`behavioral_snapshots` محسوبة ليلاً** بدل حسابها داخل المحادثة — تحليل 6 أشهر
  في الوقت الفعلي سيبطئ الرد بشكل ملحوظ.
- **تصنيف تلقائي للمعاملات** من الوصف (قاعدة + نموذج) مع اقتراح لا تنفيذ.
- **توسيع `parseReceipt`**: بنود الفاتورة سطراً سطراً، لا المجموع فقط.

---

## ملاحظات على الكود الحالي

أشياء لاحظتها أثناء قراءة الملفات، مرتّبة حسب الخطورة:

1. **`chatWithTools` قد ينتهي وحلقة الأدوات لم تُغلق.** إذا استهلك النموذج
   `maxRounds` وهو ما زال يطلب أدوات، يخرج بـ`$reply` يحمل `function_call`
   بلا نص. النتيجة: رد فارغ للمستخدم. أضف بعد الحلقة: إذا كان النص فارغاً
   وهناك استدعاءات معلّقة، أرسل جولة أخيرة بدون `tools` لإجبار جواب نصي.

2. **لا يوجد فصل مفروض بين أدوات القراءة والكتابة في الـ executor.** حالياً
   الأمان يعتمد على أن النموذج «سيلتزم». `AgentToolRegistry::isWrite()` يجعله
   حاجزاً برمجياً لا تعليمة نصية. مهم جداً في تطبيق مالي.

3. **حقن التعليمات عبر البيانات.** `description` و`notes` و`tags` ونص الفاتورة
   المستخرج من الصورة كلها تدخل السياق. إذا استوردت يوماً كشوفات بنكية، وصف
   معاملة يحمل نصاً موجّهاً قد يُقرأ كأمر. غلّفها بوسوم `<user_data>` في
   مخرجات الأدوات — `guardrails.md` يعالج الجانب السلوكي، لكن التغليف هو الحاجز.

4. **`tokens_used` معرّف ولا يُملأ.** `send()` يرجّع `usage` — خزّنه، وإلا لن
   تعرف تكلفتك الحقيقية إلا من فاتورة Google.

5. **`hasPendingActions()`** يستعمل `whereHas` لكل محادثة — N+1 في قائمة
   المحادثات. حوّله إلى `withExists` أو عمود مُخزَّن.

6. **`impactOfCreateTransaction`** يحسب المصروف بـ`sum('amount')` مباشرة من
   `transactions` بينما باقي التطبيق يمر عبر `BudgetService`. خطر تباعد المنطق:
   إن أضفت التحويلات أو المعاملات المستثناة لاحقاً، سيختلف الرقمان. استعمل
   `BudgetService` هنا أيضاً.

7. **لا حد لعدد الرسائل لكل مستخدم.** `config('agent.limits.daily_messages')`
   موجود في الإعدادات الجديدة — اربطه بـ middleware أو RateLimiter.

8. **`executeCreateBudget`** لا يتحقق من أن `category_id` يخص المستخدم، بعكس
   `executeCreateTransaction`. أضف نفس التحقق.

9. **`getRecentTransactions`** يرتّب بـ`transaction_date` فقط — معاملات نفس اليوم
   ترتيبها غير محدد. أضف `->latest('id')` كمعيار ثانٍ.

---

## ملاحظة أخيرة

المهارات مكتوبة لتمنع النموذج من اختراع أرقام سوق من ذاكرة التدريب — لهذا
`config('agent.market_ma')` فارغ عمداً. املأه بأرقام تتحقق منها بنفسك وحدّث
`as_of`، وإلا سيتحدث العميل بالمبادئ فقط (وهذا أفضل من رقم خاطئ بثقة).

ولست مستشاراً مالياً ولا قانونياً — ما في هذه الملفات هيكل منتج وليس استشارة
استثمارية. قبل إطلاق الميزة لمستخدمين حقيقيين، راجع الجانب القانوني لعرض نصائح
مالية في المغرب، وضع تنويهاً ظاهراً في واجهة المحادثة نفسها لا في الشروط فقط.
