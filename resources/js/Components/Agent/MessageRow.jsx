import { memo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';
import { COLORS as C, FONT as F } from '@/shared/lib/theme';
import { MD } from './markdown';
import { IcoBot, IcoUser, IcoCopy, IcoCheck, IcoBolt, IcoChevron } from './icons';

/** مسار الأدوات: شارات قابلة للطي تعرض تفاصيل الاستدعاءات */
const ToolTrail = memo(function ToolTrail({ calls }) {
  const [open, setOpen] = useState(false);
  if (!calls || !calls.length) return null;
  return (
    <div className="mt-2">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex items-center gap-1.5">
        <IcoChevron open={open} style={{ color: C.t4 }} />
        <span className={`${F.mono} text-[0.55rem] tracking-[1px]`} style={{ color: C.t4 }}>
          {calls.length} TOOL{calls.length > 1 ? 'S' : ''}
        </span>
        <span className="flex flex-wrap gap-1">
          {calls.map((tc, i) => (
            <span key={i} className={`${F.mono} flex items-center gap-1 border px-1.5 py-0.5 text-[0.55rem]`} style={{ borderColor: `${C.cyan}33`, color: C.cyan, background: `${C.cyan}0a` }}>
              <IcoBolt /> {tc.name}
            </span>
          ))}
        </span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <pre className={`${F.mono} mt-1.5 max-h-40 overflow-auto whitespace-pre-wrap border p-2 text-[0.58rem] leading-relaxed`} style={{ borderColor: C.b, background: C.card, color: C.t3 }}>
              {JSON.stringify(calls.map((c) => ({ tool: c.name, args: c.arguments })), null, 2)}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

/** فقاعة رسالة واحدة — memo لمنع إعادة رسم الرسائل القديمة */
const MessageRow = memo(function MessageRow({ msg }) {
  const isUser = msg.role === 'user';
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard?.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: 'easeOut' }} className={`group flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className="relative shrink-0">
        <div className="flex h-8 w-8 items-center justify-center border" style={{ borderColor: isUser ? `${C.cyan}55` : `${C.green}55`, background: isUser ? `${C.cyan}12` : `${C.green}12`, color: isUser ? C.cyan : C.green, boxShadow: isUser ? `0 0 10px ${C.cyan}22` : `0 0 10px ${C.green}22` }}>
          {isUser ? <IcoUser /> : <IcoBot />}
        </div>
        {!isUser && <span className="absolute -bottom-0.5 -left-0.5 h-2 w-2 rounded-full border" style={{ background: C.green, borderColor: C.card }} />}
      </div>

      <div className={`flex min-w-0 max-w-[82%] flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`flex items-center gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
          <span className={`${F.mono} text-[0.55rem] tracking-[1.5px]`} style={{ color: isUser ? C.cyan : C.green }}>
            {isUser ? 'أنت' : 'TRACKFLOW AI'}
          </span>
          <span className={`${F.mono} text-[0.52rem]`} style={{ color: C.t4 }}>{msg.created_at?.slice(11, 16)}</span>
        </div>

        <div className="w-full border px-4 py-3" style={{ borderColor: isUser ? `${C.cyan}33` : C.b, background: isUser ? `linear-gradient(135deg, ${C.cyan}12, ${C.cyan}06)` : C.card2, borderRight: isUser ? 'none' : `2px solid ${C.green}55`, borderLeft: isUser ? `2px solid ${C.cyan}55` : 'none' }}>
          {isUser ? (
            <p className={`${F.ar} whitespace-pre-wrap break-words text-[0.8rem] leading-[1.9]`} style={{ color: C.t1 }}>{msg.content}</p>
          ) : (
            <div className="min-w-0">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={MD}>{msg.content || ''}</ReactMarkdown>
            </div>
          )}
        </div>

        {!isUser && <ToolTrail calls={msg.tool_calls} />}

        <button type="button" onClick={copy} className={`${F.mono} flex items-center gap-1 border px-1 py-0.5 text-[0.52rem] opacity-0 transition-opacity group-hover:opacity-100`} style={{ borderColor: C.b, background: C.card, color: copied ? C.green : C.t4 }}>
          {copied ? <IcoCheck width={9} height={9} /> : <IcoCopy />} {copied ? 'نُسخ' : 'نسخ'}
        </button>
      </div>
    </motion.div>
  );
});

export default MessageRow;