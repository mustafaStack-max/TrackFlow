<?php

namespace App\Services\Agent;

use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiAgentService
{
    protected string $baseUrl;
    protected string $model;
    protected string $apiKey;
    protected int $timeout;

    public function __construct()
    {
        $this->baseUrl = rtrim((string) config('agent.gemini.base_url'), '/');
        $this->model   = (string) config('agent.gemini.model');
        $this->apiKey  = (string) config('agent.gemini.api_key');
        $this->timeout = (int) config('agent.gemini.timeout');

        if ($this->apiKey === '') {
            throw new Exception('مفتاح Gemini API مفقود. أضف GEMINI_API_KEY إلى ملف .env ثم نفّذ php artisan config:clear');
        }
    }

    /* ==================================================
     * ★ دور محادثة بسيط (بدون أدوات)
     * ================================================== */
    public function chat(string $message, ?string $previousInteractionId = null): array
    {
        return $this->send([
            'input' => $message,
            'previous_interaction_id' => $previousInteractionId,
        ]);
    }

    /* ==================================================
     * ★ دور محادثة مع أدوات + حلقة Function Calling
     *
     * $executor: دالة تستقبل (اسم الأداة, الوسائط) وترجع النتيجة كمصفوفة.
     * الحلقة تستمر حتى يعطي النموذج جواباً نهائياً بدون استدعاء أدوات.
     * ================================================== */
    public function chatWithTools(
        string $message,
        array $tools,
        callable $executor,
        ?string $previousInteractionId = null,
        int $maxRounds = 5
    ): array {
        $input = $message;
        $previousId = $previousInteractionId;
        $toolCallsLog = [];
        $reply = null;

        for ($round = 1; $round <= $maxRounds; $round++) {
            $reply = $this->send([
                'input' => $input,
                'tools' => $tools,
                'previous_interaction_id' => $previousId,
            ]);

            $functionCalls = $this->extractFunctionCalls($reply);

            // لا توجد استدعاءات أدوات → هذا هو الجواب النهائي
            if (empty($functionCalls)) {
                break;
            }

            // تنفيذ الأدوات محلياً وتجهيز النتائج للنموذج
            $functionResults = [];
            foreach ($functionCalls as $call) {
                $name = $call['name'];
                $args = $call['arguments'];

                try {
                    $result = $executor($name, $args);
                } catch (Exception $e) {
                    $result = ['error' => $e->getMessage()];
                }

                $toolCallsLog[] = [
                    'name' => $name,
                    'arguments' => $args,
                    'result' => $result,
                ];

                $functionResults[] = [
                    'type' => 'function_result',
                    'name' => $name,
                    'call_id' => $call['id'],
                    'result' => [
                        ['type' => 'text', 'text' => json_encode($result, JSON_UNESCAPED_UNICODE)],
                    ],
                ];
            }

            // الجولة التالية: النتائج كمدخل، مع ربط المحادثة على الخادم
            $input = $functionResults;
            $previousId = $reply['interaction_id'] ?? $previousId;
        }

        $reply['tool_calls_log'] = $toolCallsLog;

        return $reply;
    }

        /* ==================================================
     * ★ محادثة مع صورة (Multimodal)
     * ================================================== */
    public function chatWithImage(
        string $message,
        string $imageBase64,
        string $mimeType,
        ?string $previousInteractionId = null
    ): array {
        // بناء input multimodal: نص + صورة
        $input = [
            ['type' => 'text', 'text' => $message],
            [
                'type' => 'image',
                'data' => $imageBase64,
                'mime_type' => $mimeType,
            ],
        ];

        return $this->send([
            'input' => $input,
            'previous_interaction_id' => $previousInteractionId,
        ]);
    }

    /* ==================================================
     * ★ استخراج بيانات فاتورة من صورة (OCR + AI)
     * يرجع بيانات مهيكلة أو null إذا فشلت
     * ================================================== */
    public function parseReceipt(
        string $imageBase64,
        string $mimeType
    ): ?array {
        $prompt = <<<'PROMPT'
حلل هذه الصورة (فاتورة، إيصال، أو تذكرة) واستخرج البيانات التالية بدقة:

1. amount: المبلغ الإجمالي المدفوع (رقم فقط بدون عملة)
2. currency: العملة إن وُجدت (افتراضي MAD)
3. date: التاريخ بصيغة Y-m-d (إن وُجد)
4. description: وصف مختصر للمشتريات أو الخدمة
5. merchant: اسم المتجر أو المكان
6. type: "expense" دائماً للفواتير

أرجع النتيجة كـ JSON صالح فقط، بدون أي نص إضافي أو markdown.
إذا لم تكن الصورة فاتورة أو لم تستطع قراءتها، أرجع: {"error": "غير قادر على قراءة الفاتورة"}
PROMPT;

        try {
            $reply = $this->chatWithImage(
                message: $prompt,
                imageBase64: $imageBase64,
                mimeType: $mimeType
            );

            $text = trim($reply['text'] ?? '');

            // إزالة أي markdown fences إذا وجدت
            $text = preg_replace('/^```(?:json)?\s*/i', '', $text);
            $text = preg_replace('/\s*```\s*$/', '', $text);

            $data = json_decode($text, true, 512, JSON_THROW_ON_ERROR);

            if (isset($data['error']) || !isset($data['amount'])) {
                return null;
            }

            return [
                'amount' => (float) $data['amount'],
                'currency' => $data['currency'] ?? 'MAD',
                'transaction_date' => $data['date'] ?? now()->format('Y-m-d'),
                'description' => $data['description'] ?? $data['merchant'] ?? 'فاتورة',
                'merchant' => $data['merchant'] ?? null,
                'type' => $data['type'] ?? 'expense',
            ];
        } catch (Exception $e) {
            Log::warning('Failed to parse receipt', ['error' => $e->getMessage()]);
            return null;
        }
    }

    /* ==================================================
     * ★ إرسال الطلب الفعلي إلى Gemini API
     * ================================================== */
    protected function send(array $options): array
    {
        $payload = array_filter([
            'model' => $this->model,
            'input' => $options['input'] ?? null,
            'tools' => $options['tools'] ?? null,
            'previous_interaction_id' => $options['previous_interaction_id'] ?? null,
            'system_instruction' => config('agent.system_instruction'),
        ], fn ($value) => $value !== null);

        $response = Http::withHeaders([
            'x-goog-api-key' => $this->apiKey,
            'Content-Type' => 'application/json',
        ])
            ->timeout($this->timeout)
            ->post("{$this->baseUrl}/interactions", $payload);

        if ($response->failed()) {
            $errorMessage = $response->json('error.message') ?? $response->body();
            Log::error('Gemini API failure', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            throw new Exception('فشل الاتصال بـ Gemini API: ' . $errorMessage);
        }

$data = $response->json();

// استخراج النص من steps إذا كان output_text فارغاً
$text = $data['output_text'] ?? '';
if ($text === '' && ! empty($data['steps'])) {
    foreach ($data['steps'] as $step) {
        if (($step['type'] ?? '') === 'model_output' && ! empty($step['content'])) {
            foreach ($step['content'] as $block) {
                if (($block['type'] ?? '') === 'text' && ! empty($block['text'])) {
                    $text = $block['text'];
                    break 2;
                }
            }
        }
    }
}

return [
    'interaction_id' => $data['id'] ?? null,
    'text' => $text,
    'steps' => $data['steps'] ?? [],
    'status' => $data['status'] ?? 'completed',
    'usage' => $data['usage_metadata'] ?? null,
    'raw' => $data, // للاطلاع على الرد الكامل عند الحاجة
    'tool_calls_log' => [],
];
    }

    /* ==================================================
     * ★ استخراج استدعاءات الأدوات من خطوات الرد
     * ================================================== */
    protected function extractFunctionCalls(array $reply): array
    {
        $calls = [];

        foreach ($reply['steps'] ?? [] as $step) {
            if (($step['type'] ?? '') !== 'function_call') {
                continue;
            }

            $calls[] = [
                'id' => $step['id'] ?? null,
                'name' => $step['name'] ?? null,
                'arguments' => $step['arguments'] ?? [],
            ];
        }

        return array_values(array_filter($calls, fn ($c) => $c['name'] !== null));
    }

    /* ==================================================
     * ★ اختبار سريع للاتصال والمفتاح
     * ================================================== */
    public function ping(): string
    {
        $reply = $this->chat('رد بكلمة واحدة فقط: جاهز');

        return $reply['text'];
    }
}

