// resources/js/Components/Dashboard/AdvancedFlowChart.jsx
import { useMemo, useState } from 'react';
import { ResponsiveContainer, ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, Brush } from 'recharts';
import { COLORS as C, FONT as F } from './theme';
import { fmtMAD, fmtAxis } from './format';
import { RANGE_DEFS, GRANULARITY_DEFS, applyRange, bucketSeries, average, projectSeries, extendDates } from './aggregate';

export const FLOW_SERIES = [
    { key: 'income', label: 'المداخيل', legendLabel: 'المداخيل', optionLabel: 'منحنى المداخيل (أخضر نيون)', color: C.green },
    { key: 'expense', label: 'المصاريف', legendLabel: 'المصاريف', optionLabel: 'منحنى المصاريف (أحمر وردي)', color: C.red },
    { key: 'net', label: 'صافي الفائض والتدفق', legendLabel: 'صافي الفائض', optionLabel: 'منحنى صافي الفائض والتدفق (بنفسجي)', color: C.purple },
    { key: 'cumulative', label: 'الرصيد التراكمي', legendLabel: 'الرصيد التراكمي', optionLabel: 'منحنى الرصيد التراكمي (ذهبي)', color: C.gold },
];

const CURVE_TYPES = [
    { value: 'monotone', label: 'نسق ناعم (Monotone)' },
    { value: 'linear', label: 'خط مستقيم (Linear)' },
    { value: 'natural', label: 'طبيعي (Natural)' },
    { value: 'step', label: 'متدرج (Step)' },
];

/* ── icons ── */
const IcoChart = (p) => (<svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><path d="M3 17V9M8 17V4M13 17v-7M18 17v-3" strokeLinecap="round" /></svg>);
const IcoGear = (p) => (<svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><circle cx="10" cy="10" r="2.6" /><path d="M10 2v2.4M10 15.6V18M18 10h-2.4M4.4 10H2M15.5 4.5l-1.7 1.7M6.2 13.8l-1.7 1.7M15.5 15.5l-1.7-1.7M6.2 6.2L4.5 4.5" strokeLinecap="round" /></svg>);
const IcoChevron = (p) => (<svg width="10" height="10" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="M4 7l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>);
const IcoSparkle = (p) => (<svg width="9" height="9" viewBox="0 0 20 20" fill="currentColor" {...p}><path d="M10 1l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" /></svg>);

function CustomTooltip({ active, payload, label, visibleSeries, showBudgetCeiling, budgetCeiling }) {
    if (!active || !payload?.length) return null;
    const rows = FLOW_SERIES.filter((s) => visibleSeries[s.key]).map((s) => {
        const actual = payload.find((p) => p.dataKey === s.key && p.value != null);
        const proj = payload.find((p) => p.dataKey === `${s.key}_proj` && p.value != null);
        const entry = actual || proj;
        if (!entry) return null;
        return { ...s, value: entry.value, isProjected: !actual && !!proj };
    }).filter(Boolean);
    if (!rows.length) return null;

    return (
        <div className="border p-3 text-[0.72rem] shadow-[0_8px_30px_rgba(0,0,0,0.6)]" style={{ background: C.card, borderColor: C.bHot }}>
            <div className={`${F.mono} mb-2`} style={{ color: C.t2 }}>{label}</div>
            {rows.map((r) => (
                <div key={r.key} className="flex items-center justify-between gap-6 mb-1 last:mb-0">
                    <span className="flex items-center gap-1.5" style={{ color: C.t2 }}>
                        <span className="w-2 h-2 rounded-full" style={{ background: r.color }} />
                        {r.label}{r.isProjected ? ' (متوقع)' : ''}
                    </span>
                    <span className={F.mono} style={{ color: r.color }}>{fmtMAD(r.value)}</span>
                </div>
            ))}
            {showBudgetCeiling && (
                <div className={`${F.mono} text-[0.65rem] mt-2 pt-2 border-t`} style={{ borderColor: C.b, color: C.red }}>
                    سقف الميزانية: {fmtMAD(budgetCeiling)} MAD
                </div>
            )}
        </div>
    );
}

function CeilingLabel({ viewBox, value }) {
    if (!viewBox) return null;
    const { x, y } = viewBox;
    return (
        <text x={x + 8} y={y - 6} fill={C.red} fontFamily="Share Tech Mono" fontSize="10" fontWeight="700" letterSpacing="0.5">
            سقف الميزانية — {fmtMAD(value)} د.م
        </text>
    );
}

export default function AdvancedFlowChart({
    series = [],
    title = 'مبيان المقارنة وتدفق السيولة المالية',
    subtitle = 'تابع مسار المداخيل مقابل المصاريف في الزمن الحقيقي مع منحنيات النمو والفائض المالي',
    periodLabel,
    defaultRange = '30d',
    defaultGranularity = 'day',
    defaultBudgetCeiling,
}) {
    const [granularity, setGranularity] = useState(defaultGranularity);
    const [range, setRange] = useState(defaultRange);
    const [optionsOpen, setOptionsOpen] = useState(false);
    const [curveType, setCurveType] = useState('monotone');
    const [showPredictions, setShowPredictions] = useState(false);
    const [showBudgetCeiling, setShowBudgetCeiling] = useState(true);
    const [showAverageLines, setShowAverageLines] = useState(false);
    const [showBrush, setShowBrush] = useState(false);
    const [showDots, setShowDots] = useState(false);
    const [visibleSeries, setVisibleSeries] = useState({ income: true, expense: true, net: true, cumulative: true });

    const avgExpenseAll = useMemo(() => average(series.map((s) => s.expense)), [series]);
    const [budgetCeiling, setBudgetCeiling] = useState(
        defaultBudgetCeiling ?? (avgExpenseAll > 0 ? Math.round((avgExpenseAll * 1.3) / 100) * 100 : 8000)
    );

    const toggleSeries = (key) => setVisibleSeries((v) => ({ ...v, [key]: !v[key] }));

    const points = useMemo(() => bucketSeries(applyRange(series, range), granularity), [series, range, granularity]);

    const chartData = useMemo(() => {
        if (!showPredictions || points.length < 3) return points;
        const horizon = Math.min(10, Math.max(3, Math.round(points.length * 0.25)));
        const future = extendDates(points[points.length - 1].date, granularity, horizon);
        const projected = {};
        FLOW_SERIES.forEach((s) => {
            projected[s.key] = projectSeries(points, s.key, horizon, { minZero: s.key === 'income' || s.key === 'expense' });
        });
        const bridgedLast = { ...points[points.length - 1] };
        FLOW_SERIES.forEach((s) => { bridgedLast[`${s.key}_proj`] = bridgedLast[s.key]; });
        const futurePoints = future.map((f, i) => {
            const row = { ...f };
            FLOW_SERIES.forEach((s) => { row[`${s.key}_proj`] = projected[s.key][i]; });
            return row;
        });
        return [...points.slice(0, -1), bridgedLast, ...futurePoints];
    }, [points, showPredictions, granularity]);

    const seriesAverages = useMemo(() => {
        const out = {};
        FLOW_SERIES.forEach((s) => { out[s.key] = average(points.map((p) => p[s.key])); });
        return out;
    }, [points]);

    const footerStats = useMemo(() => {
        const last = points[points.length - 1];
        return { avgIncome: seriesAverages.income, avgExpense: seriesAverages.expense, endBalance: last ? last.cumulative : 0, pointCount: points.length };
    }, [points, seriesAverages]);

    const tickInterval = chartData.length > 11 ? Math.ceil(chartData.length / 9) - 1 : 0;

    return (
        <div className="border overflow-hidden" style={{ background: C.card, borderColor: C.b }}>
            {/* HEAD */}
            <div className="flex flex-wrap items-start justify-between gap-3 px-4 py-3 border-b" style={{ borderColor: C.b }}>
                <div className="flex items-start gap-2.5">
                    <div className="mt-0.5" style={{ color: C.green }}><IcoChart /></div>
                    <div>
                        <div className={`${F.head} text-[0.95rem] font-bold flex items-center gap-2`} style={{ color: C.t1 }}>
                            {title}
                            {showPredictions && (
                                <span className={`${F.mono} flex items-center gap-1 text-[0.55rem] tracking-[1px] px-1.5 py-0.5 border`} style={{ borderColor: C.bHot, color: C.green, background: C.greenTrace }}>
                                    <IcoSparkle /> ذكاء مالي
                                </span>
                            )}
                        </div>
                        <div className={`${F.ar} text-[0.75rem] mt-0.5`} style={{ color: C.t3 }}>
                            {subtitle}
                            {periodLabel && <> — الفترة النشطة: <b style={{ color: C.green }}>{periodLabel}</b></>}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    {Object.entries(GRANULARITY_DEFS).map(([key, def]) => (
                        <button key={key} type="button" onClick={() => setGranularity(key)}
                            className={`${F.head} text-[0.78rem] font-semibold px-3 py-1.5 border transition-colors`}
                            style={granularity === key ? { borderColor: C.t1, color: C.t1, background: C.card2 } : { borderColor: C.b, color: C.t3 }}>
                            {def.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* RANGE ROW */}
            <div className="flex flex-wrap items-center gap-1.5 px-4 py-2.5 border-b" style={{ borderColor: C.b }}>
                {Object.entries(RANGE_DEFS).map(([key, def]) => (
                    <button key={key} type="button" onClick={() => setRange(key)}
                        className={`${F.head} text-[0.72rem] font-semibold px-2.5 py-1 border transition-colors`}
                        style={range === key ? { borderColor: C.green, color: C.void, background: C.green } : { borderColor: C.b, color: C.t2 }}>
                        {def.label}
                    </button>
                ))}
                <div className="flex-1" />
                <button type="button" onClick={() => setOptionsOpen((v) => !v)}
                    className={`${F.head} flex items-center gap-2 text-[0.78rem] font-semibold px-3 py-1.5 border transition-colors`}
                    style={{ borderColor: C.cyan, color: C.cyan }}>
                    <IcoGear /> خيارات العرض والميزات
                    <IcoChevron style={{ transform: optionsOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
                </button>
            </div>

            {/* OPTIONS PANEL */}
            {optionsOpen && (
                <div className="grid md:grid-cols-2 gap-6 px-4 py-4 border-b" style={{ borderColor: C.b }}>
                    <div>
                        <div className={`${F.mono} text-[0.62rem] tracking-[2px] mb-2.5`} style={{ color: C.t3 }}>// الميزات والخطوط المرجعية</div>

                        <div className="flex items-center justify-between mb-3">
                            <label className={`${F.ar} text-[0.8rem]`} style={{ color: C.t2 }} htmlFor="flow-curve">نوع المنحنى</label>
                            <select id="flow-curve" value={curveType} onChange={(e) => setCurveType(e.target.value)}
                                className={`${F.mono} border px-2.5 py-1.5 text-[0.72rem] outline-none`} style={{ background: C.card2, borderColor: C.b, color: C.green }}>
                                {CURVE_TYPES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                            </select>
                        </div>

                        {[
                            { label: 'التوقعات المستقبلية الذكية', badge: true, state: showPredictions, set: setShowPredictions },
                            { label: 'خط سقف الميزانية الشهري', state: showBudgetCeiling, set: setShowBudgetCeiling },
                            { label: 'خطوط المتوسط الحسابي للفترة', state: showAverageLines, set: setShowAverageLines },
                            { label: 'شريط التمرير والتقريب الزمني (Zoom Brush)', state: showBrush, set: setShowBrush },
                            { label: 'إبراز نقاط البيانات والدوائر التفاعلية', state: showDots, set: setShowDots },
                        ].map((o) => (
                            <label key={o.label} className="flex items-center justify-between cursor-pointer mb-2">
                                <span className={`${F.ar} text-[0.8rem] flex items-center gap-2`} style={{ color: C.t2 }}>
                                    {o.label}
                                    {o.badge && (
                                        <span className={`${F.mono} text-[0.55rem] px-1.5 py-0.5 border`} style={{ borderColor: C.bHot, color: C.green, background: C.greenTrace }}>ذكاء مالي</span>
                                    )}
                                </span>
                                <input type="checkbox" checked={o.state} onChange={() => o.set((v) => !v)} className="w-4 h-4 accent-[#00d4ff]" />
                            </label>
                        ))}

                        {showBudgetCeiling && (
                            <div className="mt-2">
                                <div className={`${F.mono} text-[0.68rem] mb-1.5 flex justify-between`} style={{ color: C.amber }}>
                                    <span>حد سقف الميزانية الشهري</span><span>{fmtMAD(budgetCeiling)} MAD</span>
                                </div>
                                <input type="range" min={1000} max={30000} step={500} value={budgetCeiling}
                                    onChange={(e) => setBudgetCeiling(Number(e.target.value))} className="w-full accent-[#ffc107]" />
                            </div>
                        )}
                    </div>

                    <div>
                        <div className={`${F.mono} text-[0.62rem] tracking-[2px] mb-2.5`} style={{ color: C.t3 }}>// الخطوط والمسارات المعروضة</div>
                        <div className="flex flex-col gap-2">
                            {FLOW_SERIES.map((s) => (
                                <label key={s.key} className="flex items-center justify-between cursor-pointer">
                                    <span className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                                        <span className={`${F.ar} text-[0.8rem]`} style={{ color: C.t2 }}>{s.optionLabel}</span>
                                    </span>
                                    <input type="checkbox" checked={visibleSeries[s.key]} onChange={() => toggleSeries(s.key)} className="w-4 h-4 accent-[#00e676]" />
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* LEGEND PILLS */}
            <div className="flex flex-wrap items-center justify-center gap-2 px-4 pt-3">
                {FLOW_SERIES.map((s) => (
                    <button key={s.key} type="button" onClick={() => toggleSeries(s.key)}
                        className={`${F.head} flex items-center gap-1.5 text-[0.78rem] font-semibold px-3 py-1.5 border transition-colors`}
                        style={visibleSeries[s.key] ? { borderColor: s.color, color: s.color, background: `${s.color}11` } : { borderColor: C.b, color: C.t4 }}>
                        <span className="w-2 h-2 rounded-full" style={{ background: visibleSeries[s.key] ? s.color : C.t4 }} />
                        {s.legendLabel}
                    </button>
                ))}
            </div>

            {/* CHART */}
            <div className="px-2 pb-1 pt-2" style={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} margin={{ top: 16, right: 18, left: 4, bottom: 0 }}>
                        <CartesianGrid stroke={C.greenTrace} strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="label" tick={{ fill: C.t4, fontFamily: 'Share Tech Mono', fontSize: 10 }} axisLine={{ stroke: C.b }} tickLine={false} interval={tickInterval} minTickGap={18} />
                        <YAxis tick={{ fill: C.t4, fontFamily: 'Share Tech Mono', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={fmtAxis} width={54} />
                        <Tooltip content={<CustomTooltip visibleSeries={visibleSeries} showBudgetCeiling={showBudgetCeiling} budgetCeiling={budgetCeiling} />} cursor={{ stroke: C.greenDim, strokeDasharray: '3 3' }} />

                        {showBudgetCeiling && (
                            <ReferenceLine y={budgetCeiling} stroke={C.red} strokeDasharray="7 5" strokeWidth={1.4} ifOverflow="extendDomain" label={<CeilingLabel value={budgetCeiling} />} />
                        )}

                        {showAverageLines && FLOW_SERIES.filter((s) => visibleSeries[s.key]).map((s) => (
                            <ReferenceLine key={`avg-${s.key}`} y={seriesAverages[s.key]} stroke={s.color} strokeOpacity={0.45} strokeDasharray="2 4" strokeWidth={1.2} />
                        ))}

                        {FLOW_SERIES.map((s) => visibleSeries[s.key] && (
                            <Line key={s.key} type={curveType} dataKey={s.key} name={s.label} stroke={s.color} strokeWidth={2.1}
                                dot={showDots ? { r: 3, strokeWidth: 1, fill: s.color, stroke: C.card } : false}
                                activeDot={{ r: 5, strokeWidth: 2, stroke: C.card, fill: s.color }}
                                isAnimationActive={false} connectNulls={false} />
                        ))}

                        {showPredictions && FLOW_SERIES.map((s) => visibleSeries[s.key] && (
                            <Line key={`${s.key}_proj`} type={curveType} dataKey={`${s.key}_proj`} name={`${s.label} (متوقع)`} stroke={s.color}
                                strokeWidth={1.8} strokeDasharray="5 5" strokeOpacity={0.65} dot={false}
                                activeDot={{ r: 4, strokeWidth: 1, stroke: C.card, fill: s.color }} isAnimationActive={false} connectNulls={false} />
                        ))}

                        {showBrush && <Brush dataKey="label" height={22} travellerWidth={9} stroke={C.greenDim} fill={C.card2} tickFormatter={() => ''} />}
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            {/* FOOTER STATS */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 px-4 py-3 border-t" style={{ borderColor: C.b }}>
                <span className={`${F.mono} text-[0.62rem] flex items-center gap-1.5`} style={{ color: C.t3 }}>
                    <span className="w-2 h-2 rounded-full" style={{ background: C.green }} />متوسط الدخل: <b style={{ color: C.t1 }}>{fmtMAD(footerStats.avgIncome)} MAD</b>
                </span>
                <span className={`${F.mono} text-[0.62rem] flex items-center gap-1.5`} style={{ color: C.t3 }}>
                    <span className="w-2 h-2 rounded-full" style={{ background: C.red }} />متوسط المصروف: <b style={{ color: C.t1 }}>{fmtMAD(footerStats.avgExpense)} MAD</b>
                </span>
                <span className={`${F.mono} text-[0.62rem] flex items-center gap-1.5`} style={{ color: C.t3 }}>
                    <span className="w-2 h-2 rounded-full" style={{ background: C.gold }} />الرصيد التراكمي الحالي: <b style={{ color: C.t1 }}>{fmtMAD(footerStats.endBalance)} MAD</b>
                </span>
                <span className={`${F.mono} text-[0.62rem]`} style={{ color: C.t4 }}>{footerStats.pointCount} نقطة بيانات</span>
            </div>
        </div>
    );
}
