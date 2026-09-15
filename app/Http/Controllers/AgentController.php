<?php

namespace App\Http\Controllers;

use App\Models\AgentConversation;
use App\Models\AgentMessage;
use App\Models\PendingAction;
use App\Models\User;
use App\Services\Agent\ActionConfirmationService;
use App\Services\Agent\FinancialToolsService;
use App\Services\Agent\GeminiAgentService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class AgentController extends Controller
{
    public function __construct(
        protected GeminiAgentService $gemini,
        protected FinancialToolsService $tools,
        protected ActionConfirmationService $confirmation,
    ) {}

    /* ================================================================
     * عرض قائمة المحادثات + الإجراءات المعلقة
     * ================================================================ */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $conversations = $user->conversations()
            ->with(['lastMessage'])
            ->orderByDesc('updated_at')
            ->get()
            ->map(fn ($conv) => $this->formatConversation($conv));

        return Inertia::render('Agent/Chat', [
            'conversations' => $conversations,
            'pendingActions' => $this->getUserPendingActions($user),
            'activeConversation' => null,
            'messages' => [],
        ]);
    }

    /* ================================================================
     * إنشاء محادثة جديدة + رسالة ترحيبية
     * ================================================================ */
    public function create(Request $request)
    {
        $user = $request->user();

        // إغلاق المحادثات الخاملة
        $user->activeConversations()
            ->where('updated_at', '<', now()->subHours(
                (int) config('agent.conversation.idle_close_hours', 24)
            ))
            ->update(['is_active' => false]);

        $conversation = $user->conversations()->create([
            'title' => 'محادثة جديدة',
            'is_active' => true,
        ]);

        AgentMessage::add($conversation, 'assistant',
            "مرحباً! أنا مساعدك المالي الذكي في TrackFlow. 🤖\n\n" .
            "يمكنني مساعدتك في:\n" .
            "• 💰 تحليل مصاريفك ودخلك\n" .
            "• 📊 متابعة ميزانياتك\n" .
            "• ➕ إضافة معاملات (بموافقتك)\n" .
            "• 🏷️ اقتراح تصنيفات ذكية\n" .
            "• 📈 توقعات مالية مخصصة\n\n" .
            "ماذا تريد أن تعرف عن أموالك اليوم؟"
        );

        return redirect()->route('agent.show', $conversation->uuid);
    }

    /* ================================================================
     * عرض محادثة معينة مع كل رسائلها
     * ================================================================ */
    public function show(Request $request, string $uuid): Response
    {
        $user = $request->user();

        $conversation = $user->conversations()
            ->where('uuid', $uuid)
            ->firstOrFail();

        $messages = $conversation->messages()
            ->orderBy('created_at')
            ->get()
            ->map(fn ($msg) => $this->formatMessage($msg));

        $conversations = $user->conversations()
            ->with(['lastMessage'])
            ->orderByDesc('updated_at')
            ->get()
            ->map(fn ($conv) => $this->formatConversation($conv));

        return Inertia::render('Agent/Chat', [
            'conversations' => $conversations,
            'activeConversation' => [
                'uuid' => $conversation->uuid,
                'title' => $conversation->title,
                'is_active' => $conversation->is_active,
            ],
            'messages' => $messages,
            'pendingActions' => $this->getConversationPendingActions($conversation),
        ]);
    }

    public function chat(Request $request, string $uuid)
    {
        $request->validate([
            'message' => ['required_without:image', 'nullable', 'string', 'max:2000'],
            'image' => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp', 'max:5120'], // 5MB كحد أقصى
        ]);

        $user = $request->user();

        $conversation = $user->conversations()
            ->where('uuid', $uuid)
            ->firstOrFail();

        // بناء محتوى الرسالة للمستخدم (نص + [صورة])
        $userMessageText = $request->message ?? '';
        $hasImage = $request->hasFile('image');
        
        if ($hasImage) {
            $userMessageText = trim($userMessageText . ' [📷 صورة مرفقة]');
        }

        // 1) حفظ رسالة المستخدم
        $userMessage = AgentMessage::add($conversation, 'user', $userMessageText ?: '[صورة]');

        // 2) تحديث عنوان المحادثة إذا كانت أول رسالة
        if ($conversation->messages()->where('role', 'user')->count() === 1) {
            $title = mb_substr($userMessageText ?: 'تحليل صورة', 0, 50);
            if (mb_strlen($userMessageText) > 50) $title .= '...';
            $conversation->update(['title' => $title]);
        }

        try {
            $reply = null;

            // ✅ حالة خاصة: صورة مرفقة → استخراج البيانات
            if ($hasImage) {
                $file = $request->file('image');
                $imageBase64 = base64_encode(file_get_contents($file->getRealPath()));
                $mimeType = $file->getMimeType();

                // استخراج البيانات من الصورة
                $receiptData = $this->gemini->parseReceipt($imageBase64, $mimeType);

                if ($receiptData) {
                    // البيانات المستخرجة → نقترح معاملة
                    $categories = $this->tools->getAvailableCategories($user);
                    $accounts = $this->tools->getAccountBalances($user);
                    
                    // اختيار حساب افتراضي (أول حساب نقدي أو أول حساب متاح)
                    $defaultAccount = collect($accounts['accounts'])
                        ->firstWhere('type', 'cash') 
                        ?? $accounts['accounts'][0] 
                        ?? null;

                    if (!$defaultAccount) {
                        throw new Exception('لا توجد حسابات متاحة. أنشئ حساباً أولاً.');
                    }

                    // اختيار تصنيف افتراضي بناءً على الوصف (استدعاء Gemini مرة أخرى)
                    $suggestedCategoryId = $this->suggestCategoryForDescription(
                        $user,
                        $receiptData['description'],
                        $categories['categories']
                    );

                    // اقتراح المعاملة
                    $proposeResult = $this->proposeAction(
                        $user,
                        $conversation,
                        $userMessage,
                        \App\Models\PendingAction::TYPE_CREATE_TRANSACTION,
                        [
                            'account_id' => $defaultAccount['id'],
                            'category_id' => $suggestedCategoryId,
                            'type' => $receiptData['type'],
                            'amount' => $receiptData['amount'],
                            'description' => $receiptData['description'],
                            'transaction_date' => $receiptData['transaction_date'],
                            'payment_method' => 'cash',
                            'notes' => 'مستخرج تلقائياً من صورة ' . ($receiptData['merchant'] ?? ''),
                        ]
                    );

                    $reply = [
                        'interaction_id' => null,
                        'text' => "📸 **تم تحليل الصورة بنجاح!**\n\n" .
                                  "استخرجت البيانات التالية:\n" .
                                  "- **المبلغ:** {$receiptData['amount']} {$receiptData['currency']}\n" .
                                  "- **التاريخ:** {$receiptData['transaction_date']}\n" .
                                  "- **الوصف:** {$receiptData['description']}\n" .
                                  ($receiptData['merchant'] ? "- **المتجر:** {$receiptData['merchant']}\n" : '') .
                                  "\n💡 أعددت خطة عمل لإضافتها كمعاملة. راجعها أدناه.",
                        'steps' => [],
                        'status' => 'completed',
                        'usage' => null,
                        'tool_calls_log' => [],
                    ];
                } else {
                    $reply = [
                        'interaction_id' => null,
                        'text' => "⚠️ لم أتمكن من قراءة البيانات من الصورة.\n\n" .
                                  "يرجى التأكد من أن الصورة واضحة وتحتوي على فاتورة أو إيصال قابل للقراءة.\n\n" .
                                  "يمكنك أيضاً إدخال البيانات يدوياً.",
                        'steps' => [],
                        'status' => 'completed',
                        'usage' => null,
                        'tool_calls_log' => [],
                    ];
                }
            } else {
                // المحادثة العادية (نص فقط)
                $reply = $this->gemini->chatWithTools(
                    message: $request->message,
                    tools: $this->getToolsSchema(),
                    executor: fn ($name, $args) => $this->executeTool($user, $conversation, $userMessage, $name, $args),
                    previousInteractionId: $conversation->gemini_interaction_id,
                    maxRounds: 5,
                );
            }

            // حفظ interaction_id للمحادثات Stateful
            if (! empty($reply['interaction_id'])) {
                $conversation->update([
                    'gemini_interaction_id' => $reply['interaction_id'],
                ]);
            }

            // حفظ رد الـ Agent
            AgentMessage::add($conversation, 'assistant', $reply['text'] ?? '', [
                'tool_calls' => $reply['tool_calls_log'] ?? [],
                'metadata' => [
                    'interaction_id' => $reply['interaction_id'] ?? null,
                    'has_image' => $hasImage,
                    'status' => $reply['status'] ?? null,
                ],
            ]);

            $conversation->touch();

            return redirect()->back();

        } catch (Exception $e) {
            Log::error('Agent chat failed', [
                'user_id' => $user->id,
                'conversation_id' => $conversation->id,
                'error' => $e->getMessage(),
            ]);

            AgentMessage::add($conversation, 'assistant',
                "⚠️ عذراً، حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى.\n\n" .
                "التفاصيل التقنية: " . $e->getMessage()
            );

            return redirect()->back();
        }
    }

    /* ================================================================
     * اقتراح تصنيف بناءً على الوصف باستخدام Gemini
     * ================================================================ */
    protected function suggestCategoryForDescription(User $user, string $description, array $availableCategories): ?int
    {
        try {
            $categoryList = collect($availableCategories)
                ->map(fn ($c) => "- ID {$c['id']}: {$c['name']}")
                ->implode("\n");

            $prompt = "بناءً على الوصف التالي، اختر أنسب تصنيف من القائمة.\n" .
                      "الوصف: \"{$description}\"\n\n" .
                      "التصنيفات المتاحة:\n{$categoryList}\n\n" .
                      "أرجع فقط ID التصنيف كرقم بدون أي نص إضافي.";

            $reply = $this->gemini->chat($prompt);
            $text = trim($reply['text'] ?? '');
            
            if (preg_match('/\d+/', $text, $matches)) {
                return (int) $matches[0];
            }
        } catch (Exception $e) {
            Log::warning('Failed to suggest category', ['error' => $e->getMessage()]);
        }

        // إذا فشل، أرجع أول تصنيف متاح
        return $availableCategories[0]['id'] ?? null;
    }

    /* ================================================================
     * الموافقة على إجراء معلق (من زر التأكيد في الواجهة)
     * ================================================================ */
    public function approveAction(Request $request, string $token)
    {
        $user = $request->user();

        try {
            // التأكد من أن الإجراء يخص المستخدم الحالي
            $action = PendingAction::where('token', $token)
                ->where('user_id', $user->id)
                ->firstOrFail();

            $result = $this->confirmation->approve($token);

            // إضافة رسالة تأكيد في المحادثة
            if ($action->message && $action->message->conversation) {
                AgentMessage::add($action->message->conversation, 'assistant',
                    "✅ " . ($result['message'] ?? 'تم تنفيذ الإجراء بنجاح.')
                );
            }

            return redirect()->back()->with([
                'success' => true,
                'message' => $result['message'] ?? 'تم التنفيذ بنجاح.',
            ]);

        } catch (Exception $e) {
            return redirect()->back()->with([
                'success' => false,
                'message' => 'فشل التنفيذ: ' . $e->getMessage(),
            ]);
        }
    }

    /* ================================================================
     * رفض إجراء معلق
     * ================================================================ */
    public function rejectAction(Request $request, string $token)
    {
        $user = $request->user();

        try {
            $action = PendingAction::where('token', $token)
                ->where('user_id', $user->id)
                ->firstOrFail();

            $this->confirmation->reject($token);

            if ($action->message && $action->message->conversation) {
                AgentMessage::add($action->message->conversation, 'assistant',
                    "❌ تم إلغاء الإجراء بناءً على طلبك."
                );
            }

            return redirect()->back()->with([
                'success' => true,
                'message' => 'تم إلغاء الإجراء.',
            ]);

        } catch (Exception $e) {
            return redirect()->back()->with([
                'success' => false,
                'message' => 'فشل الإلغاء: ' . $e->getMessage(),
            ]);
        }
    }

    /* ================================================================
     * إغلاق محادثة
     * ================================================================ */
    public function close(Request $request, string $uuid)
    {
        $user = $request->user();

        $conversation = $user->conversations()
            ->where('uuid', $uuid)
            ->firstOrFail();

        $conversation->close();

        return redirect()->route('agent.index')->with([
            'success' => true,
            'message' => 'تم إغلاق المحادثة.',
        ]);
    }

    /* ================================================================
     * حذف محادثة (Soft Delete)
     * ================================================================ */
    public function destroy(Request $request, string $uuid)
    {
        $user = $request->user();

        $conversation = $user->conversations()
            ->where('uuid', $uuid)
            ->firstOrFail();

        $conversation->delete();

        return redirect()->route('agent.index')->with([
            'success' => true,
            'message' => 'تم حذف المحادثة.',
        ]);
    }

    /* ================================================================
     * 🛠️ تنفيذ أداة واحدة (تُستدعى من حلقة Function Calling)
     *
     * الأدوات "للقراءة" تُنفذ مباشرة.
     * الأدوات "التنفيذية" تُنشئ PendingAction وتُرجع token للمستخدم.
     * ================================================================ */
    protected function executeTool(
        $user,
        AgentConversation $conversation,
        AgentMessage $userMessage,
        string $name,
        array $args
    ): array {
        // أدوات القراءة (تنفيذ مباشر)
        return match ($name) {
            'get_financial_summary'     => $this->tools->getFinancialSummary(
                $user,
                $args['range'] ?? '30d',
                $args['from'] ?? null,
                $args['to'] ?? null
            ),
            'get_account_balances'      => $this->tools->getAccountBalances($user),
            'get_top_categories'        => $this->tools->getTopCategories(
                $user,
                $args['range'] ?? '30d',
                (int) ($args['limit'] ?? 5),
                $args['from'] ?? null,
                $args['to'] ?? null
            ),
            'get_budget_status'         => $this->tools->getBudgetStatus($user, $args['month'] ?? null),
            'get_recent_transactions'   => $this->tools->getRecentTransactions($user, (int) ($args['limit'] ?? 10)),
            'get_spending_trend'        => $this->tools->getSpendingTrend($user),
            'get_available_categories'  => $this->tools->getAvailableCategories($user),

            // أدوات الاقتراح (تنشئ PendingAction وتُرجع token)
            'propose_create_transaction' => $this->proposeAction(
                $user, $conversation, $userMessage,
                PendingAction::TYPE_CREATE_TRANSACTION,
                $args
            ),
            'propose_create_category'   => $this->proposeAction(
                $user, $conversation, $userMessage,
                PendingAction::TYPE_CREATE_CATEGORY,
                $args
            ),
            'propose_create_budget'     => $this->proposeAction(
                $user, $conversation, $userMessage,
                PendingAction::TYPE_CREATE_BUDGET,
                $args
            ),

            default => ['error' => "أداة غير معروفة: {$name}"],
        };
    }

    /* ================================================================
     * إنشاء إجراء معلق (PendingAction) وإرجاع ملخصه للـ Agent
     * ================================================================ */
    protected function proposeAction(
        $user,
        AgentConversation $conversation,
        AgentMessage $userMessage,
        string $type,
        array $payload
    ): array {
        try {
            $action = $this->confirmation->propose(
                user: $user,
                actionType: $type,
                payload: $payload,
                messageId: $userMessage->id,
            );

            return [
                'status' => 'proposed',
                'token' => $action->token,
                'action_type' => $type,
                'payload' => $payload,
                'impact_analysis' => $action->impact_analysis,
                'expires_at' => $action->expires_at->toIso8601String(),
                'message' => 'تم إعداد خطة العمل. اعرضها للمستخدم ليختار: تأكيد / تعديل / إلغاء.',
            ];
        } catch (Exception $e) {
            return ['error' => 'فشل إعداد الإجراء: ' . $e->getMessage()];
        }
    }

    /* ================================================================
     * 📐 مخطط الأدوات (Schema) الذي نرسله إلى Gemini
     * ================================================================ */
    protected function getToolsSchema(): array
    {
        return [
            [
                'type' => 'function',
                'name' => 'get_financial_summary',
                'description' => 'جلب ملخص مالي لفترة زمنية (دخل، مصروف، صافي، معدل ادخار).',
                'parameters' => [
                    'type' => 'object',
                    'properties' => [
                        'range' => [
                            'type' => 'string',
                            'description' => 'الفترة: month, 30d, 90d, 6m, ytd, 365d, all, custom',
                        ],
                        'from' => ['type' => 'string', 'description' => 'تاريخ البداية (Y-m-d) عند range=custom'],
                        'to' => ['type' => 'string', 'description' => 'تاريخ النهاية (Y-m-d) عند range=custom'],
                    ],
                ],
            ],
            [
                'type' => 'function',
                'name' => 'get_account_balances',
                'description' => 'جلب أرصدة جميع حسابات المستخدم (بنكية، نقدية، ادخار).',
                'parameters' => ['type' => 'object', 'properties' => (object) []],
            ],
            [
                'type' => 'function',
                'name' => 'get_top_categories',
                'description' => 'جلب أعلى التصنيفات إنفاقاً في فترة محددة.',
                'parameters' => [
                    'type' => 'object',
                    'properties' => [
                        'range' => ['type' => 'string', 'description' => 'الفترة الزمنية'],
                        'limit' => ['type' => 'integer', 'description' => 'عدد التصنيفات (افتراضي 5)'],
                    ],
                ],
            ],
            [
                'type' => 'function',
                'name' => 'get_budget_status',
                'description' => 'جلب حالة الميزانيات الشهرية (المنصرف، المتبقي، نسبة الاستخدام).',
                'parameters' => [
                    'type' => 'object',
                    'properties' => [
                        'month' => ['type' => 'string', 'description' => 'الشهر بصيغة Y-m (مثال: 2026-09)'],
                    ],
                ],
            ],
            [
                'type' => 'function',
                'name' => 'get_recent_transactions',
                'description' => 'جلب آخر N معاملة للمستخدم.',
                'parameters' => [
                    'type' => 'object',
                    'properties' => [
                        'limit' => ['type' => 'integer', 'description' => 'عدد المعاملات (افتراضي 10)'],
                    ],
                ],
            ],
            [
                'type' => 'function',
                'name' => 'get_spending_trend',
                'description' => 'جلب اتجاه الإنفاق لآخر 3 أشهر مع النسبة المئوية للتغيير.',
                'parameters' => ['type' => 'object', 'properties' => (object) []],
            ],
            [
                'type' => 'function',
                'name' => 'get_available_categories',
                'description' => 'جلب قائمة بجميع التصنيفات المتاحة للمستخدم (نظامية + شخصية).',
                'parameters' => ['type' => 'object', 'properties' => (object) []],
            ],
            [
                'type' => 'function',
                'name' => 'propose_create_transaction',
                'description' => 'اقتراح إضافة معاملة جديدة (لا تُنفذ إلا بعد موافقة المستخدم).',
                'parameters' => [
                    'type' => 'object',
                    'properties' => [
                        'account_id' => ['type' => 'integer'],
                        'category_id' => ['type' => 'integer'],
                        'type' => ['type' => 'string', 'enum' => ['expense', 'income']],
                        'amount' => ['type' => 'number'],
                        'description' => ['type' => 'string'],
                        'transaction_date' => ['type' => 'string'],
                        'payment_method' => ['type' => 'string', 'enum' => ['cash', 'card', 'transfer', 'other']],
                        'notes' => ['type' => 'string'],
                    ],
                    'required' => ['account_id', 'category_id', 'type', 'amount', 'transaction_date'],
                ],
            ],
            [
                'type' => 'function',
                'name' => 'propose_create_category',
                'description' => 'اقتراح إنشاء تصنيف شخصي جديد (لا يُنفذ إلا بعد موافقة المستخدم).',
                'parameters' => [
                    'type' => 'object',
                    'properties' => [
                        'name' => ['type' => 'string'],
                        'icon' => ['type' => 'string'],
                        'color_hex' => ['type' => 'string'],
                    ],
                    'required' => ['name'],
                ],
            ],
            [
                'type' => 'function',
                'name' => 'propose_create_budget',
                'description' => 'اقتراح إنشاء ميزانية جديدة (لا تُنفذ إلا بعد موافقة المستخدم).',
                'parameters' => [
                    'type' => 'object',
                    'properties' => [
                        'category_id' => ['type' => 'integer'],
                        'amount' => ['type' => 'number'],
                        'period' => ['type' => 'string', 'enum' => ['weekly', 'monthly', 'yearly']],
                        'rollover_enabled' => ['type' => 'boolean'],
                        'warn_pct' => ['type' => 'number'],
                        'critical_pct' => ['type' => 'number'],
                    ],
                    'required' => ['category_id', 'amount'],
                ],
            ],
        ];
    }

    /* ================================================================
     * تنسيق المحادثة للواجهة
     * ================================================================ */
    protected function formatConversation($conv): array
    {
        return [
            'id' => $conv->id,
            'uuid' => $conv->uuid,
            'title' => $conv->title ?? 'محادثة جديدة',
            'is_active' => $conv->is_active,
            'last_message' => $conv->lastMessage ? [
                'role' => $conv->lastMessage->role,
                'content' => $conv->lastMessage->content,
                'created_at' => $conv->lastMessage->created_at->diffForHumans(),
            ] : null,
            'has_pending_actions' => $conv->hasPendingActions(),
            'updated_at' => $conv->updated_at->diffForHumans(),
        ];
    }

    /* ================================================================
     * تنسيق الرسالة للواجهة
     * ================================================================ */
    protected function formatMessage($msg): array
    {
        return [
            'id' => $msg->id,
            'uuid' => $msg->uuid,
            'role' => $msg->role,
            'content' => $msg->content,
            'tool_calls' => $msg->tool_calls,
            'tool_results' => $msg->tool_results,
            'metadata' => $msg->metadata,
            'created_at' => $msg->created_at->format('Y-m-d H:i:s'),
        ];
    }

    /* ================================================================
     * الإجراءات المعلقة للمستخدم (عامة)
     * ================================================================ */
protected function getUserPendingActions($user): array
{
    return $user->pendingActions()
        ->with(['message.conversation'])
        ->get()
        ->map(fn ($action) => [
            'token' => $action->token,
            'action_type' => $action->action_type,
            'payload' => $action->payload,
            'impact_analysis' => $action->impact_analysis,
            'conversation_uuid' => $action->message?->conversation?->uuid,
            'expires_at' => $action->expires_at->format('Y-m-d H:i:s'),
        ])
        ->values()
        ->all();
}

    /* ================================================================
     * الإجراءات المعلقة في محادثة محددة
     * ================================================================ */
protected function getConversationPendingActions(AgentConversation $conversation): array
{
    return PendingAction::where('user_id', $conversation->user_id)
        ->where('status', PendingAction::STATUS_PENDING)
        ->where('expires_at', '>', now())
        ->whereHas('message', fn ($q) => $q->where('conversation_id', $conversation->id))
        ->get()
        ->map(fn ($action) => [
            'token' => $action->token,
            'action_type' => $action->action_type,
            'payload' => $action->payload,
            'impact_analysis' => $action->impact_analysis,
            'expires_at' => $action->expires_at->format('Y-m-d H:i:s'),
        ])
        ->values()
        ->all();
}
}