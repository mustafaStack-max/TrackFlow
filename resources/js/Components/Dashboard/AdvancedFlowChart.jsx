// resources/js/Components/Dashboard/AdvancedFlowChart.jsx
import { useId, useMemo, useState } from 'react';
import { ResponsiveContainer, ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ReferenceDot, Brush } from 'recharts';
import { COLORS as C, FONT as F } from './theme';
import { fmtMAD, fmtAxis } from './format';
import { RANGE_DEFS, GRANULARITY_DEFS, applyRange, previousPeriod, autoGranularity, bucketSeries, average, projectSeries, extendDates } from './aggregate';

export const FLOW_SERIES = [
    { key: 'income', label: 'المداخيل', legendLabel: 'المداخيل', color: C.green },
    { key: 'expense', label: 'المصاريف', legendLabel: 'المصاريف', color: C.red },
    { key: 'net', label: 'صافي الفائض والتدفق', legendLabel: 'صافي الفائض', color: C.purple },
    { key: 'cumulative', label: 'الرصيد التراكمي', legendLabel: 'الرصيد التراكمي', color: C.gold },
];

const CURVE_TYPES = [
    { value: 'monotone', short: 'ناعم' },
    { value: 'linear', short: 'مستقيم' },
    { value: 'natural', short: 'طبيعي' },
    { value: 'step', short: 'متدرج' },
];

/* ── أيقونات SVG ── */
const IcoChart = (p) => (<svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><path d="M3 17V9M8 17V4M13 17v-7M18 17v-3" strokeLinecap="round" /></svg>);
const IcoGear = (p) => (<svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><circle cx="10" cy="10" r="2.6" /><path d="M10 2v2.4M10 15.6V18M18 10h-2.4M4.4 10H2M15.5 4.5l-1.7 1.7M6.2 13.8l-1.7 1.7M15.5 15.5l-1.7-1.7M6.2 6.2L4.5 4.5" strokeLinecap="round" /></svg>);
const IcoChevron = (p) => (<svg width="10" height="10" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="M4 7l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>);
const IcoSparkle = (p) => (<svg width="10" height="10" viewBox="0 0 20 20" fill="currentColor" {...p}><path d="M10 1l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" /></svg>);
const IcoCalendar = (p) => (<svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><rect x="3" y="4" width="14" height="13" rx="1.5" /><path d="M7 2v4M13 2v4M3 9h14" strokeLinecap="round" /></svg>);
const IcoDownload = (p) => (<svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path d="M10 3v9M6.5 8.5L10 12l3.5-3.5M4 16h12" strokeLinecap="round" strokeLinejoin="round" /></svg>);
const IcoCeiling = (p) => (<svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><path d="M3 5h14" strokeDasharray="3 2" strokeLinecap="round" /><path d="M10 9v6M7 12l3 3 3-3" strokeLinecap="round" strokeLinejoin="round" /></svg>);
const IcoAvg = (p) => (<svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><path d="M3 10h14" strokeDasharray="2 2" /><path d="M3 13q2.5-7 5 0t5 0 4 0" strokeLinecap="round" /></svg>);
const IcoBrush = (p) => (<svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><circle cx="8.5" cy="8.5" r="4.5" /><path d="M12 12l5 5" strokeLinecap="round" /></svg>);
const IcoDots = (p) => (<svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor" {...p}><circle cx="5" cy="12" r="1.6" /><circle cx="10" cy="6" r="1.6" /><circle cx="15" cy="10" r="1.6" /></svg>);
const IcoPeak = (p) => (<svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><path d="M3 16l5-9 3 5 2.5-4L17 16z" strokeLinejoin="round" /></svg>);
const IcoCurve = (p) => (<svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><path d="M3 15c4 0 5-9 9-9 2.5 0 3 3 5 3" strokeLinecap="round" /></svg>);
const IcoTrendUp = (p) => (<svg width="11" height="11" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><path d="M3 15l5-5 3 3 6-7M13 6h4v4" strokeLinecap="round" strokeLinejoin="round" /></svg>);
const IcoTrendDown = (p) => (<svg width="11" height="11" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><path d="M3 5l5 5 3-3 6 7M13 14h4v-4" strokeLinecap="round" strokeLinejoin="round" /></svg>);
const IcoPercent = (p) => (<svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><path d="M4.5 15.5l11-11" strokeLinecap="round" /><circle cx="6.5" cy="6.5" r="2.2" /><circle cx="13.5" cy="13.5" r="2.2" /></svg>);
const IcoCompare = (p) => (<svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><path d="M4 7h10M11 4l3 3-3 3M16 13H6M9 10l-3 3 3 3" strokeLinecap="round" strokeLinejoin="round" /></svg>);
const IcoFlame = (p) => (<svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><path d="M10 3c1 3.5 4.5 4.5 4.5 8.5a4.5 4.5 0 0 1-9 0C5.5 9 7 7.5 8 5.5c.6 1.2 1.6 2 2 2.5.3-1.5.2-3 0-5z" strokeLinejoin="round" /></svg>);

function Switch({ checked, onChange, color = C.green }) {
    return (
        <button type="button" onClick={onChange} className="relative shrink-0 w-9 h-[18px] border transition-colors"
            style={{ borderColor: checked ? color : C.b, background: checked ? `${color}22` : C.card2 }}>
            <span className="absolute top-[2px] w-3 h-3 transition-all duration-150"
                style={{ background: checked ? color : C.t4, insetInlineStart: checked ? 'calc(100% - 14px)' : '2px' }} />
        </button>
    );
}

function OptionRow({ icon, label, desc, badge, checked, onChange, color = C.green, children }) {
    return (
        <div className="border p-2.5 mb-2 transition-colors" style={{ borderColor: checked ? `${color}55` : C.b, background: checked ? `${color}0d` : 'transparent' }}>
            <div className="flex items-center gap-2.5">
                <span className="shrink-0" style={{ color: checked ? color : C.t4 }}>{icon}</span>
                <span className="flex-1 min-w-0">
                    <span className={`${F.ar} text-[0.78rem] font-bold flex items-center gap-2`} style={{ color: C.t1 }}>
                        {label}
                        {badge && <span className={`${F.mono} text-[0.52rem] tracking-[1px] px-1.5 py-0.5 border`} style={{ borderColor: C.bHot, color: C.green, background: C.greenTrace }}>ذكاء مالي</span>}
                    </span>
                    {desc && <span className={`${F.ar} text-[0.62rem] block mt-0.5`} style={{ color: C.t4 }}>{desc}</span>}
                </span>
                <Switch checked={checked} onChange={onChange} color={color} />
            </div>
            {children}
        </div>
    );
}

function StatCard({ icon, label, value, sub, color }) {
    return (
        <div className="border p-2.5" style={{ borderColor: C.b, background: C.card2 || C.card }}>
            <div className="flex items-center gap-1.5 mb-1">
                <span style={{ color }}>{icon}</span>
                <span className={`${F.ar} text-[0.62rem]`} style={{ color: C.t4 }}>{label}</span>
            </div>
            <div className={`${F.mono} text-[0.85rem] font-bold`} style={{ color }}>{value}</div>
            {sub && <div className={`${F.mono} text-[0.55rem] mt-0.5`} style={{ color: C.t4 }}>{sub}</div>}
        </div>
    );
}

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
    const { x, y, width } = viewBox;
    return (
        <text x={x + width - 8} y={y - 6} textAnchor="end" fill={C.red} fontFamily="Share Tech Mono" fontSize="10" fontWeight="700">
            سقف الميزانية — {fmtMAD(value)} MAD
        </text>
    );
}

export default function AdvancedFlowChart({
    series = [],
    title = 'مبيان المقارنة وتدفق السيولة المالية',
    subtitle = 'تابع مسار المداخيل مقابل المصاريف في الزمن الحقيقي مع منحنيات النمو والفائض المالي',
    periodLabel,
    range = 'month',          // ★ المدة المختارة (من الأب)
    customFrom = null,        // ★ للفترة المخصصة
    customTo = null,          // ★ للفترة المخصصة
    onRangeChange,            // ★ callback لتغيير المدة
    defaultGranularity = 'auto',
    defaultBudgetCeiling,
}) {
    const gid = useId().replace(/[^a-zA-Z0-9]/g, '');
    const iso = (d) => d.toISOString().slice(0, 10);
    const [granularity, setGranularity] = useState(defaultGranularity);
    const [custom, setCustom] = useState({ from: customFrom || '', to: customTo || '' });
    const [optionsOpen, setOptionsOpen] = useState(false);
    const [curveType, setCurveType] = useState('monotone');
    const [showPredictions, setShowPredictions] = useState(false);
    const [showBudgetCeiling, setShowBudgetCeiling] = useState(true);
    const [showAverageLines, setShowAverageLines] = useState(false);
    const [showBrush, setShowBrush] = useState(false);
    const [showDots, setShowDots] = useState(false);
    const [showPeaks, setShowPeaks] = useState(false);
    const [visibleSeries, setVisibleSeries] = useState({ income: true, expense: true, net: true, cumulative: true });
    const avgExpenseAll = useMemo(() => average(series.map((s) => s.expense)), [series]);
    const [budgetCeiling, setBudgetCeiling] = useState(
        defaultBudgetCeiling ?? (avgExpenseAll > 0 ? Math.round((avgExpenseAll * 1.3) / 100) * 100 : 8000)
    );

    const toggleSeries = (key) => setVisibleSeries((v) => ({ ...v, [key]: !v[key] }));

    /* ★ Series جايين من السيرفلر مفلترين — ما بقاش applyRange هنا */
    const ranged = series; // ★ البيانات جات مفلترة من الـ Backend

    const effGranularity = granularity === 'auto' ? autoGranularity(ranged.length) : granularity;
    const points = useMemo(() => bucketSeries(ranged, effGranularity), [ranged, effGranularity]);

    /* ★ المقارنة مع الفترة السابقة — جات من الـ Backend في KPIs */
    /* ما بقاش نحسبوها هنا */

    const peaks = useMemo(() => {
        if (!points.length) return {};
        const inc = points.reduce((m, p) => ((p.income || 0) > (m.income || 0) ? p : m), points[0]);
        const exp = points.reduce((m, p) => ((p.expense || 0) > (m.expense || 0) ? p : m), points[0]);
        return { inc: (inc.income || 0) > 0 ? inc : null, exp: (exp.expense || 0) > 0 ? exp : null };
    }, [points]);

    const chartData = useMemo(() => {
        if (!showPredictions || points.length < 3) return points;
        const horizon = Math.min(10, Math.max(3, Math.round(points.length * 0.25)));
        const future = extendDates(points[points.length - 1].date, effGranularity, horizon);
        const projected = {};
        FLOW_SERIES.forEach((s) => { projected[s.key] = projectSeries(points, s.key, horizon, { minZero: s.key === 'income' || s.key === 'expense' }); });
        const bridgedLast = { ...points[points.length - 1] };
        FLOW_SERIES.forEach((s) => { bridgedLast[`${s.key}_proj`] = bridgedLast[s.key]; });
        const futurePoints = future.map((f, i) => {
            const row = { ...f };
            FLOW_SERIES.forEach((s) => { row[`${s.key}_proj`] = projected[s.key][i]; });
            return row;
        });
        return [...points.slice(0, -1), bridgedLast, ...futurePoints];
    }, [points, showPredictions, effGranularity]);

    const seriesAverages = useMemo(() => {
        const out = {};
        FLOW_SERIES.forEach((s) => { out[s.key] = average(points.map((p) => p[s.key])); });
        return out;
    }, [points]);

    const analytics = useMemo(() => {
        if (!points.length) return null;
        const totIncome = points.reduce((s, p) => s + (p.income || 0), 0);
        const totExpense = points.reduce((s, p) => s + (p.expense || 0), 0);
        const savings = totIncome > 0 ? ((totIncome - totExpense) / totIncome) * 100 : 0;
        const half = Math.floor(points.length / 2);
        const h1 = points.slice(0, half).reduce((s, p) => s + (p.net || 0), 0);
        const h2 = points.slice(half).reduce((s, p) => s + (p.net || 0), 0);
        return {
            totIncome, totExpense, savings, trendUp: h2 >= h1,
            pctIncome: totIncome + totExpense > 0 ? (totIncome / (totIncome + totExpense)) * 100 : 50,
            activeDays: points.filter((p) => (p.income || 0) + (p.expense || 0) > 0).length,
        };
    }, [points]);

    const footerStats = useMemo(() => {
        const last = points[points.length - 1];
        return { avgIncome: seriesAverages.income, avgExpense: seriesAverages.expense, endBalance: last ? last.cumulative : 0, pointCount: points.length };
    }, [points, seriesAverages]);

    const tickInterval = chartData.length > 11 ? Math.ceil(chartData.length / 9) - 1 : 0;
    const activeDotFn = (key, color) => (props) => {
        const { cx, cy, payload, index } = props;
        if (cx == null || cy == null || !((payload?.[key] || 0) > 0)) return <g key={`${key}-d${index}`} />;
        return <circle key={`${key}-d${index}`} cx={cx} cy={cy} r={3} fill={color} stroke={C.card} strokeWidth={1} />;
    };

    const exportCsv = () => {
        const rows = [['date', 'income', 'expense', 'net', 'cumulative'], ...points.map((p) => [p.date, p.income, p.expense, p.net, p.cumulative])];
        const blob = new Blob(['\uFEFF' + rows.map((r) => r.join(',')).join('\n')], { type: 'text/csv;charset=utf-8;' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `cashflow-${range}.csv`;
        a.click();
        URL.revokeObjectURL(a.href);
    };

    /* ★ تغيير المدة → نادِ الأب باش يعيد تحميل البيانات */
    const changeRange = (key) => {
        if (key === 'custom') {
            if (!custom.from && series.length) {
                setCustom({ from: iso(new Date(Date.now() - 29 * 86400000)), to: iso(new Date()) });
            }
            onRangeChange?.('custom', custom);
        } else {
            onRangeChange?.(key, null);
        }
    };

    const applyCustom = () => {
        onRangeChange?.('custom', custom);
    };

    const DeltaChip = ({ pct, invert, label }) => {
        if (pct == null) return null;
        const up = pct >= 0;
        const good = invert ? !up : up;
        return (
            <span className={`${F.mono} flex items-center gap-1 text-[0.6rem] px-1.5 py-0.5 border`}
                style={{ borderColor: `${good ? C.green : C.red}55`, color: good ? C.green : C.red, background: `${good ? C.green : C.red}0d` }}>
                {up ? <IcoTrendUp /> : <IcoTrendDown />}
                {label} {Math.abs(pct).toFixed(1)}%
            </span>
        );
    };

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
                            className={`${F.head} text-[0.75rem] font-semibold px-2.5 py-1.5 border transition-colors`}
                            style={granularity === key ? { borderColor: C.t1, color: C.t1, background: C.card2 } : { borderColor: C.b, color: C.t3 }}>
                            {def.label}
                        </button>
                    ))}
                    {granularity === 'auto' && (
                        <span className={`${F.mono} text-[0.55rem] ms-1`} style={{ color: C.t4 }}>({GRANULARITY_DEFS[effGranularity].label})</span>
                    )}
                </div>
            </div>

            {/* ★ RANGE ROW */}
            <div className="flex flex-wrap items-center gap-1.5 px-4 py-2.5 border-b" style={{ borderColor: C.b }}>
                {Object.entries(RANGE_DEFS).map(([key, def]) => key === 'custom' ? (
                    <button key={key} type="button" onClick={() => changeRange(key)}
                        className={`${F.head} flex items-center gap-1.5 text-[0.72rem] font-semibold px-2.5 py-1 border transition-colors`}
                        style={range === key ? { borderColor: C.amber, color: C.void, background: C.amber } : { borderColor: C.amber, color: C.amber }}>
                        <IcoCalendar /> {def.label}
                    </button>
                ) : (
                    <button key={key} type="button" onClick={() => changeRange(key)}
                        className={`${F.head} text-[0.72rem] font-semibold px-2.5 py-1 border transition-colors`}
                        style={range === key ? { borderColor: C.green, color: C.void, background: C.green } : { borderColor: C.b, color: C.t2 }}>
                        {def.label}
                    </button>
                ))}

                {range === 'custom' && (
                    <span className="flex items-center gap-1.5 ms-1">
                        <input type="date" value={custom.from} max={custom.to || undefined}
                            onChange={(e) => setCustom((c) => ({ ...c, from: e.target.value }))}
                            className={`${F.mono} text-[0.65rem] px-2 py-1 border outline-none`}
                            style={{ background: C.card2, borderColor: C.b, color: C.t2, colorScheme: 'dark' }} />
                        <span className={`${F.mono} text-[0.6rem]`} style={{ color: C.t4 }}>←</span>
                        <input type="date" value={custom.to} min={custom.from || undefined}
                            onChange={(e) => setCustom((c) => ({ ...c, to: e.target.value }))}
                            className={`${F.mono} text-[0.65rem] px-2 py-1 border outline-none`}
                            style={{ background: C.card2, borderColor: C.b, color: C.t2, colorScheme: 'dark' }} />
                        <button type="button" onClick={applyCustom}
                            className={`${F.head} text-[0.65rem] font-bold px-2 py-1 border`}
                            style={{ borderColor: C.green, color: C.green }}>
                            تطبيق
                        </button>
                    </span>
                )}

                <div className="flex-1" />
                <button type="button" onClick={exportCsv} title="تصدير CSV للفترة المعروضة"
                    className={`${F.head} flex items-center gap-1.5 text-[0.72rem] font-semibold px-2.5 py-1 border transition-colors`}
                    style={{ borderColor: C.gold, color: C.gold }}>
                    <IcoDownload /> CSV
                </button>
                <button type="button" onClick={() => setOptionsOpen((v) => !v)}
                    className={`${F.head} flex items-center gap-2 text-[0.78rem] font-semibold px-3 py-1.5 border transition-colors`}
                    style={optionsOpen ? { borderColor: C.cyan, color: C.void, background: C.cyan } : { borderColor: C.cyan, color: C.cyan }}>
                    <IcoGear /> خيارات العرض والتحليل
                    <IcoChevron style={{ transform: optionsOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
                </button>
            </div>


            {/* OPTIONS + ANALYTICS */}
            {optionsOpen && (
                <div className="grid md:grid-cols-2 gap-5 px-4 py-4 border-b" style={{ borderColor: C.b }}>
                    <div>
                        <div className={`${F.mono} text-[0.62rem] tracking-[2px] mb-2.5`} style={{ color: C.t3 }}>// الميزات والخطوط المرجعية</div>
                        <div className="flex items-center gap-2.5 mb-3">
                            <span className="flex items-center gap-1.5 shrink-0" style={{ color: C.t2 }}>
                                <IcoCurve /> <span className={`${F.ar} text-[0.78rem]`}>نسق المنحنى</span>
                            </span>
                            <div className="flex border" style={{ borderColor: C.b }}>
                                {CURVE_TYPES.map((c) => (
                                    <button key={c.value} type="button" onClick={() => setCurveType(c.value)}
                                        className={`${F.ar} text-[0.65rem] font-semibold px-2.5 py-1 transition-colors`}
                                        style={curveType === c.value ? { background: C.green, color: C.void } : { color: C.t3 }}>
                                        {c.short}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <OptionRow icon={<IcoSparkle />} label="التوقعات المستقبلية الذكية" desc="إسقاط اتجاه الفترة القادمة بخطوط متقطعة" badge
                            checked={showPredictions} onChange={() => setShowPredictions(v => !v)} color={C.green} />
                        <OptionRow icon={<IcoCeiling />} label="خط سقف الميزانية الشهري" desc="حد الإنفاق الأقصى الآمن"
                            checked={showBudgetCeiling} onChange={() => setShowBudgetCeiling(v => !v)} color={C.red}>
                            {showBudgetCeiling && (
                                <div className="mt-2.5">
                                    <div className={`${F.mono} text-[0.65rem] mb-1.5 flex justify-between`} style={{ color: C.amber }}>
                                        <span>حد السقف</span><span>{fmtMAD(budgetCeiling)} MAD</span>
                                    </div>
                                    <input type="range" min={1000} max={30000} step={500} value={budgetCeiling}
                                        onChange={(e) => setBudgetCeiling(Number(e.target.value))} className="w-full accent-[#ffc107]" />
                                </div>
                            )}
                        </OptionRow>
                        <OptionRow icon={<IcoAvg />} label="خطوط المتوسط الحسابي" desc="متوسط كل منحنى خلال الفترة"
                            checked={showAverageLines} onChange={() => setShowAverageLines(v => !v)} color={C.amber} />
                        <OptionRow icon={<IcoPeak />} label="علامات الذروة" desc="تمييز أعلى نقطة دخل وأعلى إنفاق"
                            checked={showPeaks} onChange={() => setShowPeaks(v => !v)} color={C.gold} />
                        <OptionRow icon={<IcoBrush />} label="التقريب الزمني (Zoom Brush)" desc="شريط تمرير لتحديد نافذة العرض"
                            checked={showBrush} onChange={() => setShowBrush(v => !v)} color={C.cyan} />
                        <OptionRow icon={<IcoDots />} label="نقاط الأيام النشطة" desc="إبراز الأيام ذات الحركة فقط"
                            checked={showDots} onChange={() => setShowDots(v => !v)} color={C.purple} />
                    </div>

                    <div>
                        <div className={`${F.mono} text-[0.62rem] tracking-[2px] mb-2.5`} style={{ color: C.t3 }}>// المقارنة والتحليل</div>
                        {analytics && (
                            <>
                                <div className="border p-2.5 mb-2" style={{ borderColor: C.b }}>
                                    <div className="flex items-center gap-1.5 mb-2">
                                        <span style={{ color: C.cyan }}><IcoCompare /></span>
                                        <span className={`${F.ar} text-[0.72rem] font-bold`} style={{ color: C.t1 }}>دخل مقابل مصروف</span>
                                    </div>
                                    <div className="flex h-2.5 rounded-full overflow-hidden">
                                        <div className="transition-all duration-500" style={{ width: `${analytics.pctIncome}%`, background: C.green }} />
                                        <div className="transition-all duration-500" style={{ width: `${100 - analytics.pctIncome}%`, background: C.red }} />
                                    </div>
                                    <div className={`${F.mono} text-[0.58rem] flex justify-between mt-1.5`}>
                                        <span style={{ color: C.green }}>دخل {analytics.pctIncome.toFixed(0)}%</span>
                                        <span style={{ color: C.red }}>مصروف {(100 - analytics.pctIncome).toFixed(0)}%</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <StatCard icon={<IcoPercent />} label="معدل الادخار" color={analytics.savings >= 0 ? C.green : C.red}
                                        value={`${analytics.savings.toFixed(1)}%`} sub="من إجمالي الدخل" />
                                    <StatCard icon={analytics.trendUp ? <IcoTrendUp /> : <IcoTrendDown />} label="اتجاه الفترة"
                                        color={analytics.trendUp ? C.green : C.red} value={analytics.trendUp ? 'تحسّن' : 'تراجع'} sub="النصف الأخير مقابل الأول" />
                                    <StatCard icon={<IcoPeak />} label="أعلى دخل" color={C.green} value={fmtMAD(peaks.inc?.income || 0)} sub={peaks.inc?.label} />
                                    <StatCard icon={<IcoFlame />} label="أعلى إنفاق" color={C.red} value={fmtMAD(peaks.exp?.expense || 0)} sub={peaks.exp?.label} />
                                </div>
                                <div className={`${F.mono} text-[0.6rem] mt-2`} style={{ color: C.t4 }}>
                                    {analytics.activeDays} نقطة نشطة من {points.length} · دخل {fmtMAD(analytics.totIncome)} · صرف {fmtMAD(analytics.totExpense)} MAD
                                </div>
                            </>
                        )}
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
                        <defs>
                            <linearGradient id={`gInc${gid}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={C.green} stopOpacity={0.16} /><stop offset="100%" stopColor={C.green} stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id={`gExp${gid}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={C.red} stopOpacity={0.14} /><stop offset="100%" stopColor={C.red} stopOpacity={0} />
                            </linearGradient>
                        </defs>
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
                        {showPeaks && peaks.inc && visibleSeries.income && (
                            <ReferenceDot x={peaks.inc.label} y={peaks.inc.income} r={4.5} fill={C.green} stroke={C.card} strokeWidth={2} ifOverflow="discard" />
                        )}
                        {showPeaks && peaks.exp && visibleSeries.expense && (
                            <ReferenceDot x={peaks.exp.label} y={peaks.exp.expense} r={4.5} fill={C.red} stroke={C.card} strokeWidth={2} ifOverflow="discard" />
                        )}
                        {visibleSeries.income && <Area type={curveType} dataKey="income" stroke="none" fill={`url(#gInc${gid})`} isAnimationActive={false} activeDot={false} dot={false} />}
                        {visibleSeries.expense && <Area type={curveType} dataKey="expense" stroke="none" fill={`url(#gExp${gid})`} isAnimationActive={false} activeDot={false} dot={false} />}
                        {FLOW_SERIES.map((s) => visibleSeries[s.key] && (
                            <Line key={s.key} type={curveType} dataKey={s.key} name={s.label} stroke={s.color} strokeWidth={2.1}
                                dot={showDots ? activeDotFn(s.key, s.color) : false}
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

            {/* FOOTER */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 px-4 py-3 border-t" style={{ borderColor: C.b }}>
                <span className={`${F.mono} text-[0.62rem] flex items-center gap-1.5`} style={{ color: C.t3 }}>
                    <span className="w-2 h-2 rounded-full" style={{ background: C.green }} />متوسط الدخل: <b style={{ color: C.t1 }}>{fmtMAD(footerStats.avgIncome)} MAD</b>
                </span>
                <span className={`${F.mono} text-[0.62rem] flex items-center gap-1.5`} style={{ color: C.t3 }}>
                    <span className="w-2 h-2 rounded-full" style={{ background: C.red }} />متوسط المصروف: <b style={{ color: C.t1 }}>{fmtMAD(footerStats.avgExpense)} MAD</b>
                </span>
                <span className={`${F.mono} text-[0.62rem] flex items-center gap-1.5`} style={{ color: C.t3 }}>
                    <span className="w-2 h-2 rounded-full" style={{ background: C.gold }} />الرصيد التراكمي: <b style={{ color: C.t1 }}>{fmtMAD(footerStats.endBalance)} MAD</b>
                </span>
                {analytics && (
                    <span className={`${F.mono} text-[0.62rem] flex items-center gap-1.5`} style={{ color: C.t3 }}>
                        <span style={{ color: analytics.savings >= 0 ? C.green : C.red }}><IcoPercent width={11} height={11} /></span>
                        الادخار: <b style={{ color: analytics.savings >= 0 ? C.green : C.red }}>{analytics.savings.toFixed(1)}%</b>
                    </span>
                )}
                <span className={`${F.mono} text-[0.62rem] ms-auto`} style={{ color: C.t4 }}>{footerStats.pointCount} نقطة · تجميع {GRANULARITY_DEFS[effGranularity].label}</span>
            </div>
        </div>
    );
}