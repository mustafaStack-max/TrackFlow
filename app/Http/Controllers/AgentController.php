<?php

namespace App\Http\Controllers;

use App\Services\Agent\AgentToolRegistry;
use App\Services\Agent\SkillService;
use Illuminate\Support\Facades\RateLimiter;
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
        protected SkillService $skills,
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
            'image'   => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp', 'max:5120'],
        ]);

        $user = $request->user();

        /* ★ حد يومي للرسائل لكل مستخدم */
        $limitKey = 'agent.daily.' . $user->id;
        $dailyMax = (int) config('agent.limits.daily_messages', 120);

        if (RateLimiter::tooManyAttempts($limitKey, $dailyMax)) {
            return redirect()->back()->with([
                'success' => false,
                'message' => 'وصلت إلى الحد اليومي لرسائل المساعد. حاول غداً.',
            ]);
        }
        RateLimiter::hit($limitKey, now()->addDay());

        $conversation = $user->conversations()->where('uuid', $uuid)->firstOrFail();

        $hasImage = $request->hasFile('image');
        $userText = trim((string) $request->message);
        if ($hasImage) {
            $userText = trim($userText . ' [📷 صورة مرفقة]');
        }

        $userMessage = AgentMessage::add($conversation, 'user', $userText ?: '[صورة]');

        if ($conversation->messages()->where('role', 'user')->count() === 1) {
            $base = mb_substr($userText ?: 'تحليل صورة', 0, 50);
            $conversation->update(['title' => $base . (mb_strlen($userText) > 50 ? '...' : '')]);
        }

        try {
            if ($hasImage) {
                $reply = $this->handleReceipt($user, $userMessage, $request->file('image'));
            } else {
                /* ★ تحميل مسبق للمهارات — يوفّر جولة API كاملة في أغلب الحالات */
                $preloaded = $this->skills->loadMany($this->skills->guess($request->message));
                $input = $preloaded
                    ? "<loaded_skills>\n{$preloaded}\n</loaded_skills>\n\n{$request->message}"
                    : $request->message;

                $reply = $this->gemini->chatWithTools(
                    message: $input,
                    tools: AgentToolRegistry::declarations(),
                    executor: $this->buildExecutor($user, $userMessage),
                    previousInteractionId: $conversation->gemini_interaction_id,
                    maxRounds: (int) config('agent.limits.max_rounds', 6),
                );
            }

            if (! empty($reply['interaction_id'])) {
                $conversation->update(['gemini_interaction_id' => $reply['interaction_id']]);
            }

            AgentMessage::add($conversation, 'assistant', $reply['text'] ?? '', [
                'tool_calls'  => $reply['tool_calls_log'] ?? [],
                'tokens_used' => $reply['tokens_used']['total_tokens'] ?? null, // ★ العمود مباشرة
                'metadata'    => [
                    'interaction_id' => $reply['interaction_id'] ?? null,
                    'tokens_used'    => $reply['tokens_used'] ?? null,
                    'has_image'      => $hasImage,
                ],
            ]);

            $conversation->touch();

            return redirect()->back();

        } catch (Exception $e) {
            Log::error('Agent chat failed', [
                'user_id'         => $user->id,
                'conversation_id' => $conversation->id,
                'error'           => $e->getMessage(),
            ]);

            AgentMessage::add($conversation, 'assistant', '⚠️ حدث خطأ أثناء معالجة طلبك. حاول مرة أخرى.');

            return redirect()->back();
        }
    }
        /* ================================================================
     * ★ الـ executor الجديد: حاجز برمجي بين القراءة والكتابة
     * ================================================================ */
    protected function buildExecutor(User $user, AgentMessage $userMessage): callable
    {
        return function (string $name, array $args) use ($user, $userMessage) {
            // 1) أدوات النظام: تحميل مهارة عند الطلب
            if ($name === 'load_skill') {
                return [
                    'skill'   => $args['skill'] ?? null,
                    'content' => $this->skills->load((string) ($args['skill'] ?? '')),
                ];
            }

            // أدوات النظام المبنية
            if ($name === 'remember_fact') {
                return $this->tools->rememberFact(
                    $user,
                    $args['key'] ?? '',
                    $args['value'] ?? ''
                );
            }

            // أدوات نظام غير مبنية بعد
            if (in_array($name, ['create_chart'], true)) {
                return ['error' => 'الأداة غير مبنية بعد — اعتذر باختصار وتابع بدونها.'];
            }

            // 2) ★ الحاجز: أي كتابة (مباشرة أو عبر propose_action) تصبح اقتراحاً فقط
            if ($name === 'propose_action' || AgentToolRegistry::isWrite($name)) {
                $type    = $args['action_type'] ?? $name;
                $payload = $args['payload'] ?? $args;

                try {
                    $action = $this->confirmation->propose($user, $type, $payload, $userMessage->id);

                    return [
                        'status'          => 'awaiting_user_confirmation',
                        'token'           => $action->token,
                        'impact_analysis' => $action->impact_analysis,
                        'note'            => 'لم يُنفَّذ شيء. اشرح الأثر للمستخدم واطلب تأكيده عبر أزرار الواجهة.',
                    ];
                } catch (Exception $e) {
                    return ['error' => $e->getMessage()];
                }
            }

            // 3) أدوات القراءة فقط
            if (! AgentToolRegistry::isRead($name)) {
                return ['error' => "أداة غير معروفة: {$name}"];
            }

            return $this->dispatchReadTool($user, $name, $args);
        };
    }

    /* ================================================================
     * توجيه أدوات القراءة إلى FinancialToolsService
     * (الأدوات غير المبنية بعد ترجع error مهذباً — مقصود ومؤقت)
     * ================================================================ */
    protected function dispatchReadTool(User $user, string $name, array $args): array
    {
        return match ($name) {
            'get_financial_summary'    => $this->tools->getFinancialSummary($user, $args['range'] ?? '30d', $args['from'] ?? null, $args['to'] ?? null),
            'get_account_balances'     => $this->tools->getAccountBalances($user),
            'get_top_categories'       => $this->tools->getTopCategories($user, $args['range'] ?? '30d', (int) ($args['limit'] ?? 5), $args['from'] ?? null, $args['to'] ?? null),
            'get_budget_status'        => $this->tools->getBudgetStatus($user, $args['month'] ?? null),
            'get_recent_transactions'  => $this->tools->getRecentTransactions($user, (int) ($args['limit'] ?? 10)),
            'get_spending_trend'       => $this->tools->getSpendingTrend($user),
            'get_available_categories' => $this->tools->getAvailableCategories($user),
            'search_transactions'      => $this->tools->searchTransactions($user, $args),
            'get_recurring_expenses'   => $this->tools->getRecurringExpenses($user, (bool) ($args['include_inactive'] ?? false)),
            'get_emergency_fund_status' => $this->tools->getEmergencyFundStatus($user),
            'recall_facts'             => $this->tools->recallFacts($user, $args['topic'] ?? null),
            default                    => ['error' => "الأداة «{$name}» غير مبنية بعد. اعتذر للمستخدم باختصار واقترح بديلاً من الأدوات المتاحة."],
        };
    }

    /* ================================================================
     * مسار الفاتورة المصورة (OCR → اقتراح معاملة)
     * ================================================================ */
    protected function handleReceipt(User $user, AgentMessage $userMessage, $file): array
    {
        $imageBase64 = base64_encode(file_get_contents($file->getRealPath()));
        $mimeType    = $file->getMimeType();

        $receipt = $this->gemini->parseReceipt($imageBase64, $mimeType);

        if (! $receipt) {
            return [
                'interaction_id' => null,
                'text'           => "⚠️ لم أتمكن من قراءة بيانات واضحة من الصورة.\n\nتأكد أن الفاتورة ظاهرة بالكامل والإضاءة جيدة، أو أدخل البيانات يدوياً.",
                'tool_calls_log' => [],
                'tokens_used'    => null,
            ];
        }

        $categories     = $this->tools->getAvailableCategories($user);
        $accounts       = $this->tools->getAccountBalances($user);
        $defaultAccount = collect($accounts['accounts'])->firstWhere('type', 'cash') ?? ($accounts['accounts'][0] ?? null);

        if (! $defaultAccount) {
            return [
                'interaction_id' => null,
                'text'           => 'قرأت الفاتورة، لكن لا يوجد حساب مسجل لأربطها به. أنشئ حساباً أولاً ثم أعد الإرسال.',
                'tool_calls_log' => [],
                'tokens_used'    => null,
            ];
        }

        $categoryId = $this->suggestCategoryForDescription($user, $receipt['description'], $categories['categories']);

        try {
            $this->confirmation->propose($user, PendingAction::TYPE_CREATE_TRANSACTION, [
                'account_id'       => $defaultAccount['id'],
                'category_id'      => $categoryId,
                'type'             => $receipt['type'],
                'amount'           => $receipt['amount'],
                'description'      => $receipt['description'],
                'transaction_date' => $receipt['transaction_date'],
                'payment_method'   => 'cash',
                'notes'            => 'مستخرج تلقائياً من صورة' . ($receipt['merchant'] ? ' — ' . $receipt['merchant'] : ''),
            ], $userMessage->id);
        } catch (Exception $e) {
            return [
                'interaction_id' => null,
                'text'           => "قرأت الفاتورة ({$receipt['amount']} MAD) لكن تعذّر إعداد خطة العمل: " . $e->getMessage(),
                'tool_calls_log' => [],
                'tokens_used'    => null,
            ];
        }

        return [
            'interaction_id' => null,
            'text'           => "📸 **تم تحليل الصورة بنجاح!**\n\n"
                . "- **المبلغ:** {$receipt['amount']} {$receipt['currency']}\n"
                . "- **التاريخ:** {$receipt['transaction_date']}\n"
                . "- **الوصف:** {$receipt['description']}\n"
                . ($receipt['merchant'] ? "- **المتجر:** {$receipt['merchant']}\n" : '')
                . "\n💡 أعددت خطة عمل لإضافتها كمعاملة — راجع بطاقة التأكيد أدناه.",
            'tool_calls_log' => [
                ['name' => 'parse_receipt', 'arguments' => ['mime_type' => $mimeType], 'result' => $receipt],
            ],
            'tokens_used' => null,
        ];
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