import { motion, AnimatePresence } from 'framer-motion';
import { COLORS as C, FONT as F } from '@/shared/lib/theme';
import { IcoBot, IcoCheck, IcoX, IcoPlus } from './icons';

/** إشعار عائم أعلى الشاشة */
export function Toast({ toast }) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="fixed left-1/2 top-4 z-50 flex -translate-x-1/2 items-center gap-2 border px-4 py-2.5" style={{ borderColor: toast.success ? `${C.green}66` : `${C.red}66`, background: C.card, boxShadow: `0 0 24px ${toast.success ? C.green : C.red}33` }}>
          <span style={{ color: toast.success ? C.green : C.red }}>{toast.success ? <IcoCheck /> : <IcoX />}</span>
          <span className={`${F.ar} text-[0.7rem] font-semibold`} style={{ color: C.t1 }}>{toast.message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** مؤشر التفكير أثناء معالجة الطلب */
export function ThinkingIndicator() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
      <div className="flex h-8 w-8 animate-pulse items-center justify-center border" style={{ borderColor: `${C.green}55`, background: `${C.green}12`, color: C.green }}>
        <IcoBot />
      </div>
      <div className="flex items-center gap-3 border px-4 py-3" style={{ borderColor: C.b, background: C.card2 }}>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.span key={i} animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.15 }} className="h-1.5 w-1.5 rounded-full" style={{ background: C.green, boxShadow: `0 0 6px ${C.green}` }} />
          ))}
        </div>
        <span className={`${F.ar} text-[0.68rem]`} style={{ color: C.t3 }}>المساعد يحلّل بياناتك ويستشير الأدوات...</span>
      </div>
    </motion.div>
  );
}

/** فاصل بين أيام مختلفة */
export function DaySeparator({ date }) {
  const label = new Date(date).toLocaleDateString('ar-MA', { weekday: 'long', day: 'numeric', month: 'long' });
  return (
    <div className="my-1 flex items-center gap-3">
      <div className="h-px flex-1" style={{ background: `linear-gradient(to left, transparent, ${C.b}, transparent)` }} />
      <span className={`${F.mono} border px-2 py-0.5 text-[0.55rem] tracking-[1px]`} style={{ borderColor: C.b, color: C.t4, background: C.card2 }}>{label}</span>
      <div className="h-px flex-1" style={{ background: `linear-gradient(to right, transparent, ${C.b}, transparent)` }} />
    </div>
  );
}

/** حالة فارغة عند عدم وجود محادثة نشطة */
export function EmptyState({ onStart }) {
  return (
    <div className="m-auto flex flex-col items-center gap-4 text-center">
      <div className="relative">
        <div className="flex h-20 w-20 items-center justify-center border" style={{ borderColor: `${C.green}55`, background: `${C.green}10`, color: C.green, boxShadow: `0 0 40px ${C.green}33` }}>
          <IcoBot width={40} height={40} />
        </div>
        <span className="absolute -right-1.5 -top-1.5 h-3 w-3 animate-ping rounded-full" style={{ background: C.green }} />
      </div>
      <div className={`${F.head} text-[1.3rem] font-bold tracking-[2px]`} style={{ color: C.t1 }}>
        مساعدك المالي <em className="not-italic" style={{ color: C.green, textShadow: `0 0 20px ${C.green}66` }}>الذكي</em>
      </div>
      <p className={`${F.ar} max-w-md text-[0.74rem] leading-relaxed`} style={{ color: C.t3 }}>
        اسألني بأي لغة طبيعية عن أموالك، أو اطلب إضافة معاملة أو إنشاء ميزانية — سأعرض دائماً خطة عمل واضحة قبل أي تنفيذ.
      </p>
      <button type="button" onClick={onStart} className="flex items-center gap-2 border px-6 py-2.5 transition-all hover:brightness-110" style={{ borderColor: C.green, background: C.green, color: C.void, boxShadow: `0 0 24px ${C.green}55` }}>
        <IcoPlus />
        <span className={`${F.ar} text-[0.75rem] font-bold`}>ابدأ محادثتك الأولى</span>
      </button>
    </div>
  );
}