import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { COLORS as C, FONT as F, AR_MONTHS_SHORT } from '@/Components/Dashboard/theme';
import { fmtMAD } from '@/Components/Dashboard/format';
import BudgetModal from '@/Components/Budgets/BudgetModal';
import ConfirmModal from '@/Components/Budgets/ConfirmModal';
import BudgetVsActual from '@/Components/Budgets/BudgetVsActual';
import BudgetInsights from '@/Components/Budgets/BudgetInsights';

const IcoPlus = (p) => (<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}><path d="M10 4v12M4 10h12" strokeLinecap="round" /></svg>);
const IcoEdit = (p) => (<svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><path d="M14 2l4 4-10 10H4v-4L14 2z" strokeLinejoin="round" /></svg>);
const IcoDel = (p) => (<svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path d="M4 6h12M8 6V4h4v2M5 6l1 11h8l1-11" strokeLinecap="round" strokeLinejoin="round" /></svg>);

const STATUS = {
    ok: { label: 'ضمن الحد', color: C.green },
    warning: { label: 'اقتراب', color: C.amber },
    exceeded: { label: 'تجاوز', color: C.red },
};

const shiftMonth = (ym, delta) => {
    const [y, m] = ym.split('-').map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};
const monthLabel = (ym) => {
    const [y, m] = ym.split('-').map(Number);
    return `${AR_MONTHS_SHORT[m - 1]} ${y}`;
};

function BudgetCard({ b, onEdit, onDelete }) {
    const st = STATUS[b.status];
    const width = Math.min(b.pct, 100);
    return (
        <div className="relative overflow-hidden border p-4 transition-all duration-200 hover:-translate-y-px"
            style={{ background: C.card, borderColor: C.b }}>
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: b.color }} />
            <div className="flex items-start justify-between gap-2 mt-1 mb-3">
                <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: b.color }} />
                    <span className={`${F.ar} text-[0.85rem] font-bold truncate`} style={{ color: C.t1 }}>{b.name}</span>
                    {b.rollover > 0 && (
                        <span className={`${F.mono} text-[0.52rem] tracking-[1px] border px-1.5 py-0.5 shrink-0`}
                            style={{ borderColor: `${C.cyan}55`, color: C.cyan, background: `${C.cyan}0d` }}>
                            +{fmtMAD(b.rollover)} مُرحَّل
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                    <button type="button" title="تعديل" onClick={() => onEdit(b)}
                        className="flex h-7 w-7 items-center justify-center border transition-colors"
                        style={{ borderColor: C.b, color: C.t3 }}
                        onMouseEnter={e => { e.currentTarget.style.color = C.gold; e.currentTarget.style.borderColor = `${C.gold}66`; }}
                        onMouseLeave={e => { e.currentTarget.style.color = C.t3; e.currentTarget.style.borderColor = C.b; }}>
                        <IcoEdit />
                    </button>
                    <button type="button" title="حذف" onClick={() => onDelete(b)}
                        className="flex h-7 w-7 items-center justify-center border transition-colors"
                        style={{ borderColor: C.b, color: C.t3 }}
                        onMouseEnter={e => { e.currentTarget.style.color = C.red; e.currentTarget.style.borderColor = `${C.red}66`; }}
                        onMouseLeave={e => { e.currentTarget.style.color = C.t3; e.currentTarget.style.borderColor = C.b; }}>
                        <IcoDel />
                    </button>
                </div>
            </div>
            <div className="h-2 overflow-hidden rounded-full mb-2" style={{ background: `${st.color}14` }}>
                <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${width}%`, background: `linear-gradient(90deg, ${b.color}, ${st.color})` }} />
            </div>
            <div className="flex items-baseline justify-between mb-1">
                <span className={`${F.mono} text-[0.85rem] font-bold`} style={{ color: C.t1 }}>
                    {fmtMAD(b.spent)} <span className="text-[0.55rem] font-normal" style={{ color: C.t4 }}>/ {fmtMAD(b.effective)}</span>
                </span>
                <span className={`${F.mono} text-[0.75rem] font-bold border px-2 py-0.5`}
                    style={{ borderColor: `${st.color}55`, color: st.color, background: `${st.color}0d` }}>
                    {b.pct}%
                </span>
            </div>
            <div className={`${F.mono} text-[0.6rem] flex justify-between`} style={{ color: C.t3 }}>
                <span>متبقي: {fmtMAD(Math.max(0, b.remaining))}</span>
                <span>{b.days_left} يوم</span>
            </div>
            {b.overrun_date ? (
                <div className={`${F.ar} text-[0.65rem] mt-2 border p-1.5`}
                    style={{ borderColor: `${C.red}44`, color: C.red, background: `${C.red}0d` }}>
                    ⚠ يُتوقع تجاوز الحد — راقب إنفاقك
                </div>
            ) : b.projected > 0 && (
                <div className={`${F.mono} text-[0.6rem] mt-2`} style={{ color: C.t4 }}>
                    توقع نهاية الفترة: ~{fmtMAD(b.projected)}
                </div>
            )}
        </div>
    );
}

export default function Budgets({ month, budgets = [], totals = {}, categories = [] }) {
    const { flash } = usePage().props;
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleting, setDeleting] = useState(null);

    const go = (m) => router.get(route('budgets.index'), { month: m }, { preserveState: false });
    const openCreate = () => { setEditing(null); setModalOpen(true); };
    const openEdit = (b) => { setEditing(b); setModalOpen(true); };

    return (
        <AuthenticatedLayout>
            <Head title="الميزانيات" />
            <div dir="rtl" className="flex flex-col gap-6">

                {/* ★ HEADER هادئ — بدون أخضر صارخ */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className={`${F.ar} text-[1.35rem] font-bold`} style={{ color: C.t1 }}>الميزانيات</h1>
                        <p className={`${F.ar} mt-1 text-[0.82rem]`} style={{ color: C.t3 }}>
                            خطّط إنفاقك وراقب التزامك شهرًا بشهر
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* تنقّل الأشهر — محايد */}
                        <div className="flex items-center overflow-hidden rounded-md border" style={{ borderColor: C.b }}>
                            <button type="button" onClick={() => go(shiftMonth(month, 1))}
                                className="px-3 py-2 text-[0.85rem] transition-colors hover:bg-white/[0.05]" style={{ color: C.t3 }}>‹</button>
                            <span className="px-4 py-2 text-[0.82rem] font-semibold" style={{ color: C.t1, background: C.card2 }}>
                                {monthLabel(month)}
                            </span>
                            <button type="button" onClick={() => go(shiftMonth(month, -1))}
                                className="px-3 py-2 text-[0.85rem] transition-colors hover:bg-white/[0.05]" style={{ color: C.t3 }}>›</button>
                        </div>
                        {/* زر واحد مصمت */}
                        <button type="button" onClick={openCreate}
                            className="flex items-center gap-2 rounded-md px-4 py-2.5 text-[0.82rem] font-bold transition-all hover:brightness-110"
                            style={{ background: C.green, color: C.void }}>
                            <IcoPlus /> ميزانية جديدة
                        </button>
                    </div>
                </div>

                {/* TOAST */}
                {flash?.success && (
                    <div className={`${F.ar} border p-2.5 text-[0.75rem]`}
                        style={{ borderColor: `${C.green}55`, color: C.green, background: C.greenTrace }}>
                        ✓ {flash.success}
                    </div>
                )}

                {/* ★ STATS — حاوية واحدة، أرقام بيضاء، لون في النقاط فقط */}
                <div className="grid grid-cols-2 overflow-hidden rounded-lg border md:grid-cols-4"
                    style={{ background: C.card, borderColor: C.b }}>
                    {[
                        { l: 'إجمالي الحدود', v: totals.budgeted, dot: C.cyan },
                        { l: 'إنفاق الفترة', v: totals.spent, dot: C.red },
                        { l: 'المتبقي', v: totals.remaining, dot: C.green },
                        { l: 'خارج الميزانيات', v: totals.unbudgeted, dot: C.amber },
                    ].map((x, i) => (
                        <div key={x.l} className="p-4" style={{ borderInlineStart: i ? `1px solid ${C.b}` : undefined }}>
                            <div className="flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full" style={{ background: x.dot }} />
                                <span className={`${F.ar} text-[0.75rem]`} style={{ color: C.t4 }}>{x.l}</span>
                            </div>
                            <div className="mt-1.5 flex items-baseline gap-1.5">
                                <span className={`${F.mono} text-[1.2rem] font-bold`} style={{ color: C.t1 }}>{fmtMAD(x.v ?? 0)}</span>
                                <span className={`${F.mono} text-[0.6rem]`} style={{ color: C.t4 }}>MAD</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CARDS / EMPTY */}
                {budgets.length === 0 ? (
                    <div className="border-2 border-dashed p-14 text-center" style={{ borderColor: `${C.b}80` }}>
                        <div className={`${F.mono} text-[0.75rem] tracking-[2px]`} style={{ color: C.t4 }}>
                            // لا توجد ميزانيات نشطة في {monthLabel(month)} //
                        </div>
                        <button type="button" onClick={openCreate}
                            className="mt-4 inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-[0.82rem] font-bold transition-all hover:brightness-110"
                            style={{ background: C.green, color: C.void }}>
                            <IcoPlus /> أنشئ أول ميزانية
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                        {budgets.map((b) => (
                            <BudgetCard key={b.id} b={b} onEdit={openEdit} onDelete={setDeleting} />
                        ))}
                    </div>
                )}

{budgets.length > 0 && (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-lg p-5" style={{ background: C.card }}>
            <div className="mb-4 flex items-center justify-between">
                <h2 className={`${F.ar} text-[0.95rem] font-bold`} style={{ color: C.t1 }}>الميزانية مقابل الإنفاق</h2>
                <span className={`${F.mono} text-[0.58rem] tracking-[1px] border px-2 py-0.5`}
                    style={{ borderColor: C.b, color: C.t3, background: C.card2 }}>BUDGET vs ACTUAL</span>
            </div>
            <BudgetVsActual budgets={budgets} />
        </div>
        <div className="rounded-lg p-5" style={{ background: C.card }}>
            <div className="mb-4 flex items-center justify-between">
                <h2 className={`${F.ar} text-[0.95rem] font-bold`} style={{ color: C.t1 }}>رؤى الشهر</h2>
                <span className={`${F.mono} text-[0.58rem] tracking-[1px] border px-2 py-0.5`}
                    style={{ borderColor: C.b, color: C.t3, background: C.card2 }}>INSIGHTS</span>
            </div>
            <BudgetInsights budgets={budgets} totals={totals} />
        </div>
    </div>
)}

                <BudgetModal open={modalOpen} onClose={() => setModalOpen(false)} budget={editing} categories={categories} />
                <ConfirmModal budget={deleting} onClose={() => setDeleting(null)} />
            </div>
        </AuthenticatedLayout>
    );
}