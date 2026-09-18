import { useEffect, useMemo, useRef, useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { AnimatePresence } from 'framer-motion';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { COLORS as C, FONT as F } from '@/shared/lib/theme';
import ConversationsSidebar from '@/Components/Agent/ConversationsSidebar';
import ChatComposer from '@/Components/Agent/ChatComposer';
import MessageRow from '@/Components/Agent/MessageRow';
import PendingActionCard from '@/Components/Agent/PendingActionCard';
import { Toast, ThinkingIndicator, DaySeparator, EmptyState } from '@/Components/Agent/ChatFeedback';
import { IcoBot, IcoPlus } from '@/Components/Agent/icons';
import { useToast } from '@/Components/Agent/hooks';

export default function Chat({ conversations = [], activeConversation = null, messages = [], pendingActions = [] }) {
  const [sending, setSending] = useState(false);
  const [busyToken, setBusyToken] = useState(null);
  const [query, setQuery] = useState('');
  const scrollRef = useRef(null);
  const flash = usePage().props.flash || {};
  const [toast, setToast] = useToast(flash);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages.length, sending, pendingActions.length]);

  const filtered = useMemo(
    () => conversations.filter((c) => (c.title || '').includes(query) || (c.last_message?.content || '').includes(query)),
    [conversations, query]
  );

  const handleSend = ({ text, file }) => {
    if (!activeConversation) return;
    setSending(true);
    if (file) {
      const fd = new FormData();
      if (text) fd.append('message', text);
      fd.append('image', file);
      router.post(`/agent/${activeConversation.uuid}/chat`, fd, { preserveScroll: true, forceFormData: true, onFinish: () => setSending(false) });
    } else {
      router.post(`/agent/${activeConversation.uuid}/chat`, { message: text }, { preserveScroll: true, onFinish: () => setSending(false) });
    }
  };

  const newChat = () => router.post('/agent', {}, { preserveScroll: true });
  const approve = (t) => { setBusyToken(t); router.post(`/agent/actions/${t}/approve`, {}, { preserveScroll: true, onFinish: () => setBusyToken(null) }); };
  const reject = (t) => { setBusyToken(t); router.post(`/agent/actions/${t}/reject`, {}, { preserveScroll: true, onFinish: () => setBusyToken(null) }); };

  return (
    <AuthenticatedLayout>
      <Head title="المساعد المالي الذكي" />
      <Toast toast={toast} />
      <div className="flex flex-col gap-3">
        {/* الرأس */}
        <div className="overflow-hidden border" style={{ background: C.card, borderColor: C.b }}>
          <div className="h-0.5 w-full" style={{ background: `linear-gradient(to right, ${C.green}, ${C.cyan}, ${C.green})` }} />
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center border" style={{ borderColor: `${C.green}55`, background: `${C.green}10`, color: C.green, boxShadow: `0 0 16px ${C.green}33` }}>
                <IcoBot width={20} height={20} />
              </div>
              <div>
                <div className={`${F.head} text-[1.05rem] font-bold tracking-[3px] uppercase`} style={{ color: C.t1 }}>
                  المساعد <em className="not-italic" style={{ color: C.green }}>المالي الذكي</em>
                </div>
                <div className={`${F.mono} mt-0.5 flex items-center gap-2 text-[0.58rem] tracking-[2px]`} style={{ color: C.t4 }}>
                  // AI AGENT //
                  <span className="flex items-center gap-1" style={{ color: C.green }}>
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: C.green }} /> GEMINI CONNECTED
                  </span>
                </div>
              </div>
            </div>
            <button type="button" onClick={newChat} className="flex items-center gap-1.5 border px-4 py-2 transition-all hover:brightness-110" style={{ borderColor: C.green, background: C.green, color: C.void, boxShadow: `0 0 16px ${C.green}44` }}>
              <IcoPlus />
              <span className={`${F.ar} text-[0.7rem] font-bold`}>محادثة جديدة</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
          <ConversationsSidebar
            conversations={filtered}
            hasAny={conversations.length > 0}
            activeUuid={activeConversation?.uuid}
            query={query}
            onQueryChange={setQuery}
            onSelect={(uuid) => router.get(`/agent/${uuid}`)}
            onDelete={(uuid) => router.delete(`/agent/${uuid}`)}
          />
          <div className="order-1 flex flex-col border lg:col-span-3 lg:order-2" style={{ borderColor: C.b, background: C.card }}>
            <div ref={scrollRef} className="flex h-[58vh] flex-col gap-4 overflow-y-auto p-4">
              {!activeConversation ? (
                <EmptyState onStart={newChat} />
              ) : (
                <>
                  {messages.map((m, i) => {
                    const prev = messages[i - 1];
                    const sep = !prev || m.created_at?.slice(0, 10) !== prev.created_at?.slice(0, 10);
                    return (
                      <div key={m.uuid} className="flex shrink-0 flex-col gap-4">
                        {sep && <DaySeparator date={m.created_at} />}
                        <MessageRow msg={m} />
                      </div>
                    );
                  })}
                  <AnimatePresence mode="popLayout">
                    {pendingActions.map((a) => (
                      <PendingActionCard key={a.token} action={a} busy={busyToken === a.token} onApprove={() => approve(a.token)} onReject={() => reject(a.token)} />
                    ))}
                  </AnimatePresence>
                  <AnimatePresence>
                    {sending && (
                      <div key="thinking" className="shrink-0">
                        <ThinkingIndicator />
                      </div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>
            <ChatComposer active={!!activeConversation} sending={sending} onSend={handleSend} notify={setToast} />
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}