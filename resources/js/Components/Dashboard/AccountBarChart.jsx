// resources/js/Components/Dashboard/AccountBarChart.jsx
import { useMemo, useState } from 'react';
import { COLORS as C, FONT as F } from './theme';
import { fmtMAD } from './format';
import { EmptyState } from './Panel';

const TYPE_LABEL = { cash: 'CASH', bank: 'BANK', card: 'CARD', savings: 'SAVE', other: 'OTHER' };

/* ── شريط قيمة واحد ── */
function BarLine({ value, max, color, sign }) {
    const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
    return (
        <div className="flex items-center gap-2">
            <div className="h-[7px] flex-1 overflow-hidden rounded-full" style={{ background: `${color}14` }}>
                <div className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${pct}%`, background: color }} />
            </div>
            <span className={`${F.mono} text-[0.6rem] w-16 shrink-0 text-left`} style={{ color: value > 0 ? color : C.t4 }}>
                {sign}{fmtMAD(value)}
            </span>
        </div>
    );
}

/* ── ترويسة الصف: نقطة اللون + الاسم + النوع ── */
function RowHead({ a, right }) {
    return (
        <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: a.color_hex || C.green }} />
                <span className={`${F.ar} text-[0.8rem] font-bold truncate`} style={{ color: C.t1 }}>{a.name}</span>
                <span className={`${F.mono} text-[0.52rem] tracking-[1px] border px-1.5 py-0.5 shrink-0`}
                    style={{ borderColor: C.b, color: C.t4 }}>
                    {TYPE_LABEL[a.type] || 'OTHER'}
                </span>
            </div>
            {right}
        </div>
    );
}

export default function AccountBarChart({ data = [] }) {
    const [view, setView] = useState('flow'); // flow | balance

    const totals = useMemo(() => {
        const income = data.reduce((s, a) => s + (a.income || 0), 0);
        const expense = data.reduce((s, a) => s + (a.expense || 0), 0);
        return { income, expense, net: income - expense };
    }, [data]);

    const rows = useMemo(() => {
        if (view === 'flow') {
            const active = data.filter(a => (a.income || 0) + (a.expense || 0) > 0);
            const base = active.length ? active : data;   // ★ إخفاء الحسابات الميتة
            const max = Math.max(...base.map(a => Math.max(a.income || 0, a.expense || 0)), 1);
            return [...base]
                .sort((a, b) => ((b.income || 0) + (b.expense || 0)) - ((a.income || 0) + (a.expense || 0)))
                .map(a => ({ ...a, _max: max }));
        }
        const max = Math.max(...data.map(a => Math.abs(a.balance || 0)), 1);
        return [...data].sort((a, b) => (b.balance || 0) - (a.balance || 0)).map(a => ({ ...a, _max: max }));
    }, [data, view]);

    if (!data.length) return <EmptyState>// لا توجد حسابات بعد //</EmptyState>;

    return (
        <div className="flex flex-col gap-4">
            {/* ★ ترويسة: إجماليات + مبدّل العرض */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-4">
                    <span className={`${F.mono} text-[0.68rem] flex items-center gap-1.5`} style={{ color: C.green }}>
                        <span className="w-2 h-2 rounded-full" style={{ background: C.green }} />+{fmtMAD(totals.income)}
                    </span>
                    <span className={`${F.mono} text-[0.68rem] flex items-center gap-1.5`} style={{ color: C.red }}>
                        <span className="w-2 h-2 rounded-full" style={{ background: C.red }} />-{fmtMAD(totals.expense)}
                    </span>
                    <span className={`${F.mono} text-[0.68rem] font-bold`} style={{ color: totals.net >= 0 ? C.green : C.red }}>
                        صافي: {totals.net >= 0 ? '+' : '-'}{fmtMAD(Math.abs(totals.net))} MAD
                    </span>
                </div>
                <div className="flex border" style={{ borderColor: C.b }}>
                    {[{ k: 'flow', l: 'التدفق' }, { k: 'balance', l: 'الأرصدة' }].map(v => (
                        <button key={v.k} type="button" onClick={() => setView(v.k)}
                            className={`${F.ar} text-[0.65rem] font-semibold px-2.5 py-1 transition-colors`}
                            style={view === v.k ? { background: C.green, color: C.void } : { color: C.t3 }}>
                            {v.l}
                        </button>
                    ))}
                </div>
            </div>

            {/* ★ الصفوف */}
            <div className="flex flex-col gap-3.5">
                {view === 'flow' ? rows.map(a => {
                    const net = (a.income || 0) - (a.expense || 0);
                    return (
                        <div key={a.id}>
                            <RowHead a={a} right={
                                <span className={`${F.mono} text-[0.7rem] font-bold shrink-0`} style={{ color: net >= 0 ? C.green : C.red }}>
                                    {net >= 0 ? '+' : '-'}{fmtMAD(Math.abs(net))}
                                </span>
                            } />
                            <div className="flex flex-col gap-1">
                                <BarLine value={a.income || 0} max={a._max} color={C.green} sign="+" />
                                <BarLine value={a.expense || 0} max={a._max} color={C.red} sign="-" />
                            </div>
                        </div>
                    );
                }) : rows.map(a => {
                    const bal = a.balance || 0;
                    const color = a.color_hex || C.green;
                    const pct = a._max > 0 ? Math.min((Math.abs(bal) / a._max) * 100, 100) : 0;
                    return (
                        <div key={a.id}>
                            <RowHead a={a} right={
                                <span className={`${F.mono} text-[0.72rem] font-bold shrink-0`} style={{ color }}>
                                    {fmtMAD(bal)} <span className="text-[0.55rem] font-normal" style={{ color: C.t4 }}>MAD</span>
                                </span>
                            } />
                            <div className="h-2 overflow-hidden rounded-full" style={{ background: `${color}14` }}>
                                <div className="h-full rounded-full transition-all duration-700 ease-out"
                                    style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}bb)` }} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}