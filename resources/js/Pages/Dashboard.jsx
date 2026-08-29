// resources/js/Pages/Dashboard.jsx
import { Head } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

import { COLORS as C, FONT as F } from '@/Components/Dashboard/theme';
import { fmtMAD } from '@/Components/Dashboard/format';
import KpiBox, { MomBadge } from '@/Components/Dashboard/KpiBox';
import Panel from '@/Components/Dashboard/Panel';
import AdvancedFlowChart from '@/Components/Dashboard/AdvancedFlowChart';
import DonutChart from '@/Components/Dashboard/DonutChart';
import RankedBarChart from '@/Components/Dashboard/RankedBarChart';
import AccountBarChart from '@/Components/Dashboard/AccountBarChart';
import SpendingHeatmap from '@/Components/Dashboard/SpendingHeatmap';

/* ── kpi icons ── */
const IcoExpense = (p) => (<svg width="26" height="26" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.3" {...p}><path d="M8 14l-4-4 4-4" strokeLinecap="round" strokeLinejoin="round" /><path d="M4 10h12" strokeLinecap="round" /></svg>);
const IcoIncome = (p) => (<svg width="26" height="26" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.3" {...p}><path d="M12 6l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" /><path d="M16 10H4" strokeLinecap="round" /></svg>);
const IcoScale = (p) => (<svg width="26" height="26" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.3" {...p}><rect x="3" y="4" width="14" height="13" rx="1" /><path d="M7 2v4M13 2v4M3 9h14" strokeLinecap="round" /></svg>);
const IcoTx = (p) => (<svg width="26" height="26" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.3" {...p}><path d="M4 16V8M8 16V10M12 16V5M16 16V11" strokeLinecap="round" /></svg>);
const IcoWallet = (p) => (<svg width="26" height="26" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.3" {...p}><rect x="2" y="5" width="16" height="11" rx="1.5" /><circle cx="14" cy="10.5" r="1.4" fill="currentColor" stroke="none" /></svg>);

export default function Dashboard({
    kpis = {},
    accounts = [],
    series = [],
    categoryBreakdown = [],
    accountBreakdown = [],
    heatmap = [],
    recent = [],
}) {
    const stamp = new Date().toLocaleString('ar-MA', { dateStyle: 'medium', timeStyle: 'short' });

    return (
        <AuthenticatedLayout>
            <Head title="لوحة التحكم" />
            <div dir="rtl" className="flex flex-col gap-5">

                {/* HEADER */}
                <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                        <div className={`${F.head} text-[1.3rem] font-bold tracking-[3px] uppercase`} style={{ color: C.t1 }}>
                            لوحة <em className="not-italic" style={{ color: C.green }}>التحكم</em>
                        </div>
                        <div className={`${F.mono} text-[0.72rem] tracking-[2px] mt-1`} style={{ color: C.t4 }}>
                            // OPERATIONS DASHBOARD // ADVANCED ANALYTICS
                        </div>
                    </div>
                    <div className={`${F.mono} text-[0.68rem] text-left`} style={{ color: C.t3 }}>{stamp}</div>
                </div>

                {/* KPI ROW */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    <KpiBox icon={IcoExpense} color={C.red} tag="ACTIVE" value={`${fmtMAD(kpis.totalExpense)} MAD`}
                        label="إجمالي المصروف" sub={<MomBadge pct={kpis.momExpensePct} invert />}
                        predict={kpis.predictedExpenseEom ? `${fmtMAD(kpis.predictedExpenseEom)} MAD` : null} />
                    <KpiBox icon={IcoIncome} color={C.green} tag="OK" value={`${fmtMAD(kpis.totalIncome)} MAD`}
                        label="إجمالي الدخل" sub={<MomBadge pct={kpis.momIncomePct} />} />
                    <KpiBox icon={IcoScale} color={C.amber} tag="BALANCE" value={`${fmtMAD(kpis.netMonth)} MAD`} label="صافي الشهر" />
                    <KpiBox icon={IcoTx} color={C.cyan} tag="COUNT" value={fmtMAD(kpis.txCount)} label="عدد العمليات" />
                    <KpiBox icon={IcoWallet} color={C.gold} tag="TOTAL" value={`${fmtMAD(kpis.totalWealth)} MAD`}
                        label="الثروة الإجمالية" sub={<span className={`${F.mono} text-[0.62rem]`} style={{ color: C.t3 }}>{kpis.accountsCount || 0} حساب</span>} />
                </div>

                {/* ACCOUNTS QUICK VIEW */}
                {accounts.length > 0 && (
                    <div>
                        <div className={`${F.head} text-[0.82rem] font-bold tracking-[2px] uppercase mb-2.5`} style={{ color: C.green }}>
                            // الحسابات — نظرة سريعة
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {accounts.map((a) => (
                                <Link href={route('accounts.index')} key={a.id}
                                    className="relative block p-3 border overflow-hidden transition-transform duration-150 hover:-translate-y-px"
                                    style={{ background: C.card, borderColor: C.b }}>
                                    <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: a.color_hex || C.green }} />
                                    <div className={`${F.head} text-[0.85rem] font-bold mt-1`} style={{ color: C.t1 }}>{a.name}</div>
                                    <div className="flex items-baseline gap-1.5">
                                        <span className={`${F.mono} text-[1.1rem]`} style={{ color: a.color_hex || C.green }}>{fmtMAD(a.balance)}</span>
                                        <span className={`${F.mono} text-[0.6rem]`} style={{ color: C.t4 }}>MAD</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* ADVANCED FLOW CHART */}
                <AdvancedFlowChart series={series} defaultRange="30d" defaultGranularity="day" />

                {/* CATEGORY BAR + DONUT */}
                <div className="grid lg:grid-cols-[1.4fr_1fr] gap-5">
                    <Panel title="مقارنة الفئات" badge="BAR">
                        <RankedBarChart data={categoryBreakdown} />
                    </Panel>
                    <Panel title="التصنيفات" badge="DONUT">
                        <DonutChart data={categoryBreakdown} centerLabel="TOTAL" />
                    </Panel>
                </div>

                {/* BY ACCOUNT + HEATMAP */}
                <div className="grid lg:grid-cols-2 gap-5">
                    <Panel title="حسب الحساب" badge="BY ACCOUNT">
                        <AccountBarChart data={accountBreakdown} />
                    </Panel>
                    <Panel title="خريطة حرارة الإنفاق" badge="SPENDING HEATMAP">
                        <SpendingHeatmap data={heatmap} />
                    </Panel>
                </div>

                {/* RECENT LOG */}
                <div className="border overflow-hidden" style={{ background: C.card, borderColor: C.b }}>
                    <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: C.b }}>
                        <span className={`${F.head} text-[0.92rem] font-bold`} style={{ color: C.t1 }}>آخر العمليات</span>
                        <span className={`${F.mono} text-[0.6rem] tracking-[1.5px] px-2 py-0.5 border`} style={{ borderColor: C.b, color: C.t3, background: C.greenTrace }}>RECENT LOG</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead>
                                <tr className={`${F.mono} text-[0.62rem] tracking-[1px]`} style={{ background: C.card2, color: C.t3 }}>
                                    <th className="px-4 py-2 font-normal">#</th>
                                    <th className="px-4 py-2 font-normal">الوصف</th>
                                    <th className="px-4 py-2 font-normal">النوع</th>
                                    <th className="px-4 py-2 font-normal">الحساب</th>
                                    <th className="px-4 py-2 font-normal">الفئة</th>
                                    <th className="px-4 py-2 font-normal">التاريخ</th>
                                    <th className="px-4 py-2 font-normal">المبلغ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recent.map((t, i) => (
                                    <tr key={t.id} className="border-t transition-colors hover:bg-[rgba(0,230,118,0.05)]" style={{ borderColor: 'rgba(0,230,118,0.05)' }}>
                                        <td className={`${F.mono} px-4 py-2.5 text-[0.72rem]`} style={{ color: C.t4 }}>{i + 1}</td>
                                        <td className={`${F.ar} px-4 py-2.5 text-[0.78rem]`} style={{ color: C.t2 }}>{t.description || '—'}</td>
                                        <td className={`${F.mono} px-4 py-2.5 text-[0.72rem] font-semibold`} style={{ color: t.type === 'income' ? C.green : C.red }}>
                                            {t.type === 'income' ? 'دخل' : 'مصروف'}
                                        </td>
                                        <td className={`${F.mono} px-4 py-2.5 text-[0.72rem]`} style={{ color: C.cyan }}>{t.account}</td>
                                        <td className="px-4 py-2.5">
                                            <span className={`${F.mono} px-1.5 py-0.5 border text-[0.62rem]`} style={{ color: t.category_color, borderColor: `${t.category_color}44`, background: `${t.category_color}15` }}>
                                                {t.category}
                                            </span>
                                        </td>
                                        <td className={`${F.mono} px-4 py-2.5 text-[0.72rem]`} style={{ color: C.t3 }}>{t.date}</td>
                                        <td className={`${F.mono} px-4 py-2.5 text-[0.72rem] font-semibold`} style={{ color: t.type === 'income' ? C.green : C.red }}>
                                            {t.type === 'income' ? '+' : '-'}{fmtMAD(t.amount)}
                                        </td>
                                    </tr>
                                ))}
                                {recent.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className={`${F.mono} text-center py-8 text-[0.7rem] tracking-[2px]`} style={{ color: C.t4 }}>
                                            // لا توجد عمليات مسجلة بعد //
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}