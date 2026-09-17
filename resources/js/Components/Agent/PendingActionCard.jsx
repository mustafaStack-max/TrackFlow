import { motion } from 'framer-motion';
import { COLORS as C, FONT as F } from '@/shared/lib/theme';
import { ACTION_META } from './constants';
import { useMinutesLeft } from './Hooks' ;
import { IcoShield, IcoClock, IcoCheck, IcoX } from './icons';

function ImpactRow({ label, value, tone }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b py-1.5 last:border-b-0" style={{ borderColor: `${C.b}88` }}>
      <span className={`${F.ar} text-[0.66rem]`} style={{ color: C.t3 }}>{label}</span>
      <span className={`${F.ar} text-[0.7rem] font-bold`} style={{ color: tone === 'danger' ? C.red : tone === 'good' ? C.green : C.t1 }}>{value}</span>
    </div>
  );
}

function BudgetBar({ pct, status }) {
  const color = status === 'exceeded' ? C.red : status === 'warning' ? C.amber : C.green;
  return (
    <div className="h-1.5 w-full overflow-hidden" style={{ background: `${color}1a` }}>
      <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, Math.max(2, pct))}%` }} transition={{ duration: 0.7, ease: 'easeOut' }} className="h-full" style={{ background: color, boxShadow: `0 0 10px ${color}99` }} />
    </div>
  );
}

export default function PendingActionCard({ action, busy, onApprove, onReject }) {
  const meta = ACTION_META[action.action_type] || { icon: '⚙️', label: action.action_type };
  const impact = action.impact_analysis || {};
  const payload = action.payload || {};
  const minutesLeft = useMinutesLeft(action.expires_at);
  const urgent = minutesLeft <= 5;

  return (
    <motion.div layout initial={{ opacity: 0, y: 20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.18 } }} transition={{ type: 'spring', stiffness: 280, damping: 26 }} className="relative overflow-hidden border" style={{ borderColor: `${C.amber}55`, background: `linear-gradient(160deg, ${C.amber}0d, ${C.card2} 45%)`, boxShadow: `0 0 24px ${C.amber}12` }}>
      <div className="h-0.5 w-full" style={{ background: `linear-gradient(to right, transparent, ${C.amber}, transparent)` }} />

      <div className="flex flex-col gap-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center border text-[0.95rem]" style={{ borderColor: `${C.amber}55`, background: `${C.amber}14` }}>{meta.icon}</span>
            <div>
              <div className={`${F.ar} flex items-center gap-1.5 text-[0.78rem] font-bold`} style={{ color: C.amber }}>
                <IcoShield /> خطة عمل بانتظار موافقتك
              </div>
              <div className={`${F.ar} mt-0.5 text-[0.62rem]`} style={{ color: C.t3 }}>{meta.label}</div>
            </div>
          </div>
          <span className={`${F.mono} flex items-center gap-1 border px-2 py-1 text-[0.55rem]`} style={{ borderColor: urgent ? `${C.red}66` : `${C.amber}44`, color: urgent ? C.red : C.t3, background: urgent ? `${C.red}0d` : 'transparent' }}>
            <IcoClock /> {minutesLeft > 0 ? `تنتهي بعد ${minutesLeft} دقيقة` : 'انتهت الصلاحية'}
          </span>
        </div>

        {action.action_type === 'create_transaction' && (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="border p-2.5" style={{ borderColor: C.b, background: `${C.card}aa` }}>
              <ImpactRow label="الوصف" value={payload.description || '—'} />
              <ImpactRow label="المبلغ" value={`${payload.amount} MAD ${payload.type === 'expense' ? '(مصروف)' : '(دخل)'}`} tone={payload.type === 'expense' ? 'danger' : 'good'} />
              <ImpactRow label="التاريخ" value={payload.transaction_date || '—'} />
              <ImpactRow label="طريقة الدفع" value={payload.payment_method || 'cash'} />
            </div>
            <div className="flex flex-col gap-2">
              {impact.account && (
                <div className="border p-2.5" style={{ borderColor: C.b, background: `${C.card}aa` }}>
                  <div className={`${F.ar} mb-1.5 text-[0.62rem]`} style={{ color: C.t3 }}>رصيد «{impact.account.name}»</div>
                  <div className="mb-1.5 flex items-center justify-center gap-2">
                    <span className={`${F.mono} text-[0.78rem] font-bold`} style={{ color: C.t2 }}>{impact.account.balance_before}</span>
                    <span style={{ color: C.amber }}>←</span>
                    <span className={`${F.mono} border px-2 py-0.5 text-[0.82rem] font-bold`} style={{ color: impact.account.sufficient === false ? C.red : C.green, borderColor: impact.account.sufficient === false ? `${C.red}55` : `${C.green}55`, background: impact.account.sufficient === false ? `${C.red}0d` : `${C.green}0d` }}>
                      {impact.account.balance_after}
                    </span>
                  </div>
                  {impact.account.sufficient === false && <div className={`${F.ar} text-center text-[0.6rem]`} style={{ color: C.red }}>⚠️ الرصيد غير كافٍ لهذه المعاملة</div>}
                </div>
              )}
              {impact.budget && (
                <div className="border p-2.5" style={{ borderColor: C.b, background: `${C.card}aa` }}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className={`${F.ar} text-[0.62rem]`} style={{ color: C.t3 }}>ميزانية «{impact.budget.budget_name}»</span>
                    <span className={`${F.mono} text-[0.6rem] font-bold`} style={{ color: impact.budget.status_after === 'exceeded' ? C.red : impact.budget.status_after === 'warning' ? C.amber : C.green }}>{impact.budget.percentage_after}%</span>
                  </div>
                  <BudgetBar pct={impact.budget.percentage_after} status={impact.budget.status_after} />
                  <div className={`${F.mono} mt-1.5 flex justify-between text-[0.55rem]`} style={{ color: C.t4 }}>
                    <span>صُرف: {impact.budget.spent_after}</span>
                    <span>الحد: {impact.budget.amount_limit}</span>
                    <span>يتبقى: {impact.budget.remaining_after}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {action.action_type === 'create_category' && (
          <div className="flex flex-wrap items-center gap-3 border p-3" style={{ borderColor: C.b, background: `${C.card}aa` }}>
            <span className="flex h-9 w-9 items-center justify-center border" style={{ borderColor: `${impact.color_hex || '#00e676'}66`, background: `${impact.color_hex || '#00e676'}18` }}>
              <span className="h-4 w-4" style={{ background: impact.color_hex || payload.color_hex || '#00e676' }} />
            </span>
            <div className="flex-1">
              <ImpactRow label="اسم التصنيف" value={impact.category_name || payload.name || '—'} />
              <ImpactRow label="الرمز اللوني" value={impact.color_hex || payload.color_hex || '#00e676'} />
            </div>
            {impact.warning && <div className={`${F.ar} w-full border px-2 py-1 text-[0.62rem]`} style={{ borderColor: `${C.red}55`, color: C.red, background: `${C.red}0d` }}>{impact.warning}</div>}
          </div>
        )}

        {action.action_type === 'create_budget' && (
          <div className="border p-3" style={{ borderColor: C.b, background: `${C.card}aa` }}>
            <ImpactRow label="التصنيف" value={impact.category?.name || 'ميزانية شاملة'} />
            <ImpactRow label="المبلغ" value={`${impact.amount} MAD / ${impact.period_label}`} tone="good" />
            <ImpactRow label="تنبيه تحذيري عند" value={`${impact.warn_at} MAD`} />
            <ImpactRow label="تنبيه حرج عند" value={`${impact.critical_at} MAD`} tone="danger" />
            {impact.warning && <div className={`${F.ar} mt-2 border px-2 py-1 text-[0.62rem]`} style={{ borderColor: `${C.red}55`, color: C.red, background: `${C.red}0d` }}>{impact.warning}</div>}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button type="button" disabled={busy || minutesLeft <= 0} onClick={onApprove} className="flex items-center gap-1.5 border px-4 py-2 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40" style={{ borderColor: C.green, background: C.green, color: C.void, boxShadow: `0 0 16px ${C.green}44` }}>
            {busy ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-black/30 border-t-black" /> : <IcoCheck />}
            <span className={`${F.ar} text-[0.7rem] font-bold`}>تأكيد التنفيذ</span>
          </button>
          <button type="button" disabled={busy} onClick={onReject} className="flex items-center gap-1.5 border px-4 py-2 transition-colors hover:bg-red-500/10 disabled:opacity-40" style={{ borderColor: `${C.red}55`, color: C.red }}>
            <IcoX />
            <span className={`${F.ar} text-[0.7rem] font-semibold`}>إلغاء</span>
          </button>
          <span className={`${F.ar} mr-auto text-[0.6rem]`} style={{ color: C.t4 }}>لن يُنفَّذ أي شيء بدون موافقتك الصريحة.</span>
        </div>
      </div>
    </motion.div>
  );
}