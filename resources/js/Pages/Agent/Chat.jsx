import { useEffect, useRef, useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { COLORS as C, FONT as F } from '@/shared/lib/theme';

/* ========== الأيقونات ========== */
const IcoSend = (p) => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}>
    <path d="M17 3L3 10l5 2 2 5 7-14z" strokeLinejoin="round" />
  </svg>
);
const IcoBot = (p) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}>
    <rect x="5" y="8" width="14" height="10" rx="2" />
    <path d="M12 8V5M9 13h.01M15 13h.01M9.5 16h5" strokeLinecap="round" />
  </svg>
);
const IcoUser = (p) => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}>
    <circle cx="10" cy="6.5" r="3" />
    <path d="M4 16.5c1.2-3 3.4-4.5 6-4.5s4.8 1.5 6 4.5" strokeLinecap="round" />
  </svg>
);
const IcoPlus = (p) => (
  <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
    <path d="M10 4v12M4 10h12" strokeLinecap="round" />
  </svg>
);
const IcoCheck = (p) => (
  <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
    <path d="M5 10l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IcoX = (p) => (
  <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
    <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
  </svg>
);
const IcoTrash = (p) => (
  <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}>
    <path d="M4 6h12M8 6V4h4v2M6 6l1 11h6l1-11" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ========== تسميات أنواع الإجراءات ========== */
const ACTION_LABELS = {
  create_transaction: '➕ إضافة معاملة جديدة',
  create_category: '🏷️ إنشاء تصنيف جديد',
  create_budget: '📊 إنشاء ميزانية جديدة',
  update_transaction: '✏️ تعديل معاملة',
  update_budget: '✏️ تعديل ميزانية',
};

/* ========== أسئلة سريعة ========== */
const QUICK_QUESTIONS = [
  'كم صرفت هذا الشهر؟',
  'ما هي أعلى 3 تصنيفات إنفاقاً؟',
  'هل أنا ضمن الميزانية؟',
  'أعطني ملخصاً مالياً لآخر 3 أشهر',
  'اقترح لي ميزانية للطعام',
  'أضف مصروف قهوة بـ 25 درهم',
];

/* ========== فقاعة رسالة ========== */
function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border"
        style={{
          borderColor: isUser ? `${C.cyan}55` : `${C.green}55`,
          background: isUser ? `${C.cyan}15` : `${C.green}15`,
          color: isUser ? C.cyan : C.green,
        }}
      >
        {isUser ? <IcoUser /> : <IcoBot />}
      </div>

      <div className={`max-w-[75%] flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className="px-3 py-2 border whitespace-pre-wrap break-words"
          style={{
            borderColor: isUser ? `${C.cyan}44` : C.b,
            background: isUser ? `${C.cyan}0d` : C.card2,
            color: C.t1,
          }}
        >
          <span className={`${F.ar} text-[0.8rem] leading-relaxed`}>{msg.content}</span>
        </div>

        {msg.tool_calls && msg.tool_calls.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {msg.tool_calls.map((tc, i) => (
              <span
                key={i}
                className={`${F.mono} text-[0.55rem] px-1.5 py-0.5 border`}
                style={{ borderColor: C.b, color: C.t4, background: C.card }}
              >
                🔧 {tc.name}
              </span>
            ))}
          </div>
        )}

        <span className={`${F.mono} text-[0.55rem]`} style={{ color: C.t4 }}>
          {msg.created_at}
        </span>
      </div>
    </div>
  );
}

/* ========== بطاقة خطة العمل ========== */
function PendingActionCard({ action, busy, onApprove, onReject }) {
  const impact = action.impact_analysis || {};
  const payload = action.payload || {};

  return (
    <div className="border p-3 flex flex-col gap-3" style={{ borderColor: `${C.amber}66`, background: `${C.amber}0a` }}>
      <div className="flex items-center justify-between gap-2">
        <span className={`${F.ar} text-[0.8rem] font-bold`} style={{ color: C.amber }}>
          ⚠️ خطة عمل بانتظار موافقتك: {ACTION_LABELS[action.action_type] || action.action_type}
        </span>
        <span className={`${F.mono} text-[0.55rem]`} style={{ color: C.t4 }}>
          تنتهي خلال: {action.expires_at}
        </span>
      </div>

      {action.action_type === 'create_transaction' && (
        <div className="flex flex-col gap-1.5">
          <Row label="الوصف" value={payload.description || '—'} />
          <Row label="المبلغ" value={`${payload.amount} MAD (${payload.type === 'expense' ? 'مصروف' : 'دخل'})`} />
          <Row label="التاريخ" value={payload.transaction_date || '—'} />
          {impact.account && (
            <Row
              label={`رصيد «${impact.account.name}»`}
              value={`${impact.account.balance_before} ← ${impact.account.balance_after} MAD`}
              danger={impact.account.sufficient === false}
            />
          )}
          {impact.budget && (
            <Row
              label={`ميزانية «${impact.budget.budget_name}»`}
              value={`سيُصرف ${impact.budget.spent_after} من ${impact.budget.amount_limit} (${impact.budget.percentage_after}%)`}
              danger={impact.budget.status_after === 'exceeded'}
            />
          )}
        </div>
      )}

      {action.action_type === 'create_category' && (
        <div className="flex flex-col gap-1.5">
          <Row label="الاسم" value={impact.category_name || payload.name} />
          <Row label="اللون" value={impact.color_hex || payload.color_hex || '#00e676'} />
          {impact.warning && <Row label="تحذير" value={impact.warning} danger />}
        </div>
      )}

      {action.action_type === 'create_budget' && (
        <div className="flex flex-col gap-1.5">
          <Row label="التصنيف" value={impact.category?.name || 'شاملة'} />
          <Row label="المبلغ" value={`${impact.amount} MAD / ${impact.period_label}`} />
          <Row label="تنبيه عند" value={`${impact.warn_at} MAD (${payload.warn_pct || 80}%)`} />
          <Row label="حرج عند" value={`${impact.critical_at} MAD (${payload.critical_pct || 100}%)`} />
          {impact.warning && <Row label="تحذير" value={impact.warning} danger />}
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={onApprove}
          className="flex items-center gap-1.5 px-3 py-1.5 border transition-colors disabled:opacity-50"
          style={{ borderColor: C.green, background: C.green, color: C.void }}
        >
          <IcoCheck />
          <span className={`${F.ar} text-[0.68rem] font-bold`}>تأكيد التنفيذ</span>
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onReject}
          className="flex items-center gap-1.5 px-3 py-1.5 border transition-colors hover:bg-red-500/10 disabled:opacity-50"
          style={{ borderColor: `${C.red}66`, color: C.red }}
        >
          <IcoX />
          <span className={`${F.ar} text-[0.68rem] font-semibold`}>إلغاء</span>
        </button>
      </div>
    </div>
  );
}

function Row({ label, value, danger }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className={`${F.ar} text-[0.68rem]`} style={{ color: C.t3 }}>{label}:</span>
      <span className={`${F.ar} text-[0.7rem] font-semibold`} style={{ color: danger ? C.red : C.t1 }}>
        {value}
      </span>
    </div>
  );
}

/* ========== الصفحة الرئيسية ========== */
export default function Chat({ conversations = [], activeConversation = null, messages = [], pendingActions = [] }) {
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [busyToken, setBusyToken] = useState(null);
  const scrollRef = useRef(null);
  const taRef = useRef(null);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [toast, setToast] = useState(null);

  const flash = usePage().props.flash || {};

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, sending, pendingActions.length]);

  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 130) + 'px';
  }, [input]);

  useEffect(() => {
    if (flash?.message) {
      setToast(flash);
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [flash?.message]);

  const submit = (e) => {
    e?.preventDefault();
    
    if (!image) {
      const text = input.trim();
      if (!text || sending || !activeConversation) return;
      setInput('');
      setSending(true);
      router.post(`/agent/${activeConversation.uuid}/chat`, { message: text }, {
        preserveScroll: true,
        onFinish: () => setSending(false),
      });
      return;
    }
    
    submitWithImage();
  };

  const newChat = () => router.post('/agent', {}, { preserveScroll: true });

  const approve = (token) => {
    setBusyToken(token);
    router.post(`/agent/actions/${token}/approve`, {}, {
      preserveScroll: true,
      onFinish: () => setBusyToken(null),
    });
  };

  const handleImageSelect = (file) => {
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setToast({ success: false, message: 'الملف يجب أن يكون صورة' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setToast({ success: false, message: 'حجم الصورة يجب أن يكون أقل من 5 ميجابايت' });
      return;
    }

    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImage(null);
    setImagePreview(null);
  };

  const submitWithImage = () => {
    if ((!input.trim() && !image) || sending || !activeConversation) return;
    
    const formData = new FormData();
    if (input.trim()) formData.append('message', input.trim());
    if (image) formData.append('image', image);

    setInput('');
    removeImage();
    setSending(true);

    router.post(`/agent/${activeConversation.uuid}/chat`, formData, {
      preserveScroll: true,
      forceFormData: true,
      onFinish: () => setSending(false),
    });
  };

  const reject = (token) => {
    setBusyToken(token);
    router.post(`/agent/actions/${token}/reject`, {}, {
      preserveScroll: true,
      onFinish: () => setBusyToken(null),
    });
  };

  return (
    <AuthenticatedLayout>
      <Head title="المساعد المالي الذكي" />

      {/* Toast Notification */}
      {toast && (
        <div
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 border flex items-center gap-2"
          style={{
            borderColor: toast.success ? `${C.green}66` : `${C.red}66`,
            background: C.card,
            boxShadow: `0 0 24px ${toast.success ? C.green : C.red}33`,
          }}
        >
          <span style={{ color: toast.success ? C.green : C.red }}>
            {toast.success ? <IcoCheck /> : <IcoX />}
          </span>
          <span className={`${F.ar} text-[0.7rem] font-semibold`} style={{ color: C.t1 }}>
            {toast.message}
          </span>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {/* HEADER */}
        <div className="border overflow-hidden" style={{ background: C.card, borderColor: C.b }}>
          <div className="px-4 py-3 border-b flex flex-wrap items-center justify-between gap-3" style={{ borderColor: C.b }}>
            <div>
              <div className={`${F.head} text-[1.2rem] font-bold tracking-[3px] uppercase`} style={{ color: C.t1 }}>
                المساعد <em className="not-italic" style={{ color: C.green }}>المالي الذكي</em>
              </div>
              <div className={`${F.mono} text-[0.68rem] tracking-[2px] mt-1`} style={{ color: C.t4 }}>
                // AI AGENT // محللك ومستشارك المالي الشخصي
              </div>
            </div>
            <button
              type="button"
              onClick={newChat}
              className="flex items-center gap-1.5 px-3 py-1.5 border transition-colors"
              style={{ borderColor: C.green, background: C.green, color: C.void }}
            >
              <IcoPlus />
              <span className={`${F.ar} text-[0.68rem] font-bold`}>محادثة جديدة</span>
            </button>
          </div>
        </div>

        {/* FLASH MESSAGE */}
        {flash.message && (
          <div
            className="px-3 py-2 border"
            style={{
              borderColor: flash.success ? `${C.green}55` : `${C.red}55`,
              background: flash.success ? `${C.green}0d` : `${C.red}0d`,
              color: flash.success ? C.green : C.red,
            }}
          >
            <span className={`${F.ar} text-[0.75rem] font-semibold`}>{flash.message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* SIDEBAR */}
          <div className="border flex flex-col" style={{ borderColor: C.b, background: C.card }}>
            <div className={`${F.mono} text-[0.58rem] tracking-[2px] px-3 py-2 border-b`} style={{ borderColor: C.b, color: C.t4 }}>
              // CONVERSATIONS
            </div>
            <div className="flex flex-col max-h-[60vh] overflow-y-auto">
              {conversations.length === 0 && (
                <div className={`${F.ar} text-[0.7rem] p-3`} style={{ color: C.t4 }}>
                  لا توجد محادثات بعد. ابدأ محادثتك الأولى!
                </div>
              )}
              {conversations.map((c) => (
                <button
                  key={c.uuid}
                  type="button"
                  onClick={() => router.get(`/agent/${c.uuid}`)}
                  className="text-right px-3 py-2 border-b transition-colors hover:bg-white/[0.04]"
                  style={{
                    borderColor: C.b,
                    background: activeConversation?.uuid === c.uuid ? `${C.green}12` : 'transparent',
                  }}
                >
                  <div className={`${F.ar} text-[0.72rem] font-semibold truncate`} style={{ color: C.t1 }}>
                    {c.title}
                  </div>
                  {c.last_message && (
                    <div className={`${F.ar} text-[0.6rem] truncate mt-0.5`} style={{ color: C.t4 }}>
                      {c.last_message.content}
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-1">
                    <span className={`${F.mono} text-[0.52rem]`} style={{ color: C.t4 }}>{c.updated_at}</span>
                    {c.has_pending_actions && (
                      <span className={`${F.ar} text-[0.55rem] px-1 border`} style={{ color: C.amber, borderColor: `${C.amber}55` }}>
                        بانتظار موافقة
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {activeConversation && (
              <div className="p-2 border-t flex items-center justify-between gap-2" style={{ borderColor: C.b }}>
                <span className={`${F.ar} text-[0.6rem] truncate`} style={{ color: C.t3 }}>
                  {activeConversation.title}
                </span>
                <button
                  type="button"
                  onClick={() => confirm('حذف هذه المحادثة نهائياً؟') && router.delete(`/agent/${activeConversation.uuid}`)}
                  className="p-1.5 border transition-colors hover:bg-red-500/10"
                  style={{ borderColor: `${C.red}44`, color: C.red }}
                >
                  <IcoTrash />
                </button>
              </div>
            )}
          </div>

          {/* CHAT AREA */}
          <div className="lg:col-span-3 border flex flex-col" style={{ borderColor: C.b, background: C.card }}>
            <div ref={scrollRef} className="flex flex-col gap-4 p-4 h-[55vh] overflow-y-auto">
              {!activeConversation && (
                <div className="m-auto text-center flex flex-col items-center gap-3">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center border"
                    style={{ borderColor: `${C.green}55`, background: `${C.green}10`, color: C.green }}
                  >
                    <IcoBot width={32} height={32} />
                  </div>
                  <div className={`${F.ar} text-[0.9rem] font-bold`} style={{ color: C.t1 }}>
                    مرحباً بك في مساعدك المالي الذكي
                  </div>
                  <div className={`${F.ar} text-[0.72rem] max-w-md`} style={{ color: C.t3 }}>
                    اسألني عن مصاريفك، ميزانياتك، أو اطلب مني إضافة معاملة — سأعرض عليك خطة عمل واضحة قبل أي تنفيذ.
                  </div>
                  <button
                    type="button"
                    onClick={newChat}
                    className="flex items-center gap-1.5 px-4 py-2 border transition-colors"
                    style={{ borderColor: C.green, background: C.green, color: C.void }}
                  >
                    <IcoPlus />
                    <span className={`${F.ar} text-[0.72rem] font-bold`}>ابدأ محادثة جديدة</span>
                  </button>
                </div>
              )}

              {activeConversation && messages.map((m) => (
                <MessageBubble key={m.uuid} msg={m} />
              ))}

              {pendingActions.map((a) => (
                <PendingActionCard
                  key={a.token}
                  action={a}
                  busy={busyToken === a.token}
                  onApprove={() => approve(a.token)}
                  onReject={() => reject(a.token)}
                />
              ))}

              {sending && (
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center border"
                    style={{ borderColor: `${C.green}55`, background: `${C.green}10`, color: C.green }}
                  >
                    <IcoBot />
                  </div>
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: C.green }} />
                    <span className="w-2 h-2 rounded-full animate-bounce [animation-delay:120ms]" style={{ background: C.green }} />
                    <span className="w-2 h-2 rounded-full animate-bounce [animation-delay:240ms]" style={{ background: C.green }} />
                  </div>
                  <span className={`${F.ar} text-[0.68rem]`} style={{ color: C.t3 }}>
                    المساعد يحلل بياناتك...
                  </span>
                </div>
              )}
            </div>

            {activeConversation && (
              <div className="px-3 py-2 border-t flex flex-wrap gap-1.5" style={{ borderColor: C.b }}>
                {QUICK_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    disabled={sending}
                    onClick={() => { setInput(q); taRef.current?.focus(); }}
                    className={`${F.ar} text-[0.62rem] px-2 py-1 border transition-colors hover:bg-white/[0.05] disabled:opacity-50`}
                    style={{ borderColor: C.b, color: C.t3, background: C.card2 }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {activeConversation && (
              <div className="p-3 border-t" style={{ borderColor: C.b }}>
                {imagePreview && (
                  <div className="mb-2 flex items-start gap-2 p-2 border" style={{ borderColor: C.b, background: C.card2 }}>
                    <img
                      src={imagePreview}
                      alt="معاينة"
                      className="w-16 h-16 object-cover border"
                      style={{ borderColor: C.b }}
                    />
                    <div className="flex-1">
                      <div className={`${F.ar} text-[0.68rem] font-semibold`} style={{ color: C.t1 }}>
                        📷 صورة مرفقة
                      </div>
                      <div className={`${F.mono} text-[0.55rem]`} style={{ color: C.t4 }}>
                        {(image.size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeImage}
                      className="p-1 border hover:bg-red-500/10"
                      style={{ borderColor: `${C.red}44`, color: C.red }}
                    >
                      <IcoX width={10} height={10} />
                    </button>
                  </div>
                )}

                <div className="flex items-end gap-2 border p-2" style={{ borderColor: C.b, background: C.card2 }}>
                  <label
                    className="flex items-center justify-center w-9 h-9 border cursor-pointer hover:bg-white/[0.05] transition-colors shrink-0"
                    style={{ borderColor: C.b, color: C.t3 }}
                    title="رفع صورة فاتورة أو إيصال"
                  >
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <rect x="3" y="3" width="14" height="14" rx="1.5" />
                      <circle cx="7" cy="7" r="1.5" />
                      <path d="M3 13l4-4 3 3 2-2 5 5" strokeLinejoin="round" />
                    </svg>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => handleImageSelect(e.target.files?.[0])}
                    />
                  </label>

                  <textarea
                    ref={taRef}
                    rows={1}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }}
                    placeholder={image ? "أضف وصفاً اختيارياً للصورة..." : "اكتب سؤالك أو ارفع صورة فاتورة..."}
                    className={`${F.ar} text-[0.76rem] flex-1 bg-transparent outline-none resize-none leading-relaxed`}
                    style={{ color: C.t1 }}
                  />
                  <button
                    type="button"
                    onClick={submit}
                    disabled={sending || (!input.trim() && !image)}
                    className="flex items-center gap-1.5 px-4 py-2 border transition-all hover:brightness-110 disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                    style={{ borderColor: C.green, background: C.green, color: C.void, boxShadow: (input.trim() || image) ? `0 0 14px ${C.green}55` : 'none' }}
                  >
                    <IcoSend />
                    <span className={`${F.ar} text-[0.68rem] font-bold`}>إرسال</span>
                  </button>
                </div>
                <div className={`${F.mono} text-[0.5rem] mt-1.5 flex justify-between`} style={{ color: C.t4 }}>
                  <span>ENTER = SEND // 📷 = RECEIPT SCAN</span>
                  <span>{input.length}/2000</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}