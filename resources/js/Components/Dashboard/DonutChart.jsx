
import { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { COLORS as C, FONT as F } from './theme';
import { fmtMAD } from './format';
import { TooltipBox } from './ChartTooltip';
import { EmptyState } from './Panel';

const OTHER_COLOR = '#5c7269';

function DonutTooltip({ active, payload, total }) {
    if (!active || !payload?.length) return null;
    const d = payload[0];
    const pct = total > 0 ? ((d.value / total) * 100).toFixed(1) : '0.0';
    return (
        <TooltipBox
            title={`${d.name} · ${pct}%${d.payload.count != null ? ` · ${d.payload.count} عملية` : ''}`}
            rows={[{ label: d.name, value: d.value, color: d.payload.color_hex || d.payload.color || C.green }]}
        />
    );
}

export default function DonutChart({ data = [], centerLabel = 'TOTAL', height = 210 }) {
    const [activeIndex, setActiveIndex] = useState(null);

    /* ★ دمج الشرائح الصغيرة (< 4%) في "أخرى" باش ما يولّيش المخطط مضغوط */
    const filtered = useMemo(() => {
        const positive = data.filter((d) => d.total > 0);
        const total = positive.reduce((s, d) => s + d.total, 0);
        if (total <= 0) return [];

        const threshold = total * 0.04;
        const big = positive.filter((d) => d.total >= threshold);
        const small = positive.filter((d) => d.total < threshold);

        if (small.length > 1) {
            big.push({
                id: '__other__',
                name: 'أخرى',
                color_hex: OTHER_COLOR,
                total: small.reduce((s, d) => s + d.total, 0),
                count: small.reduce((s, d) => s + (d.count || 0), 0),
            });
        } else {
            big.push(...small);
        }
        return [...big].sort((a, b) => b.total - a.total);
    }, [data]);

    const total = useMemo(() => filtered.reduce((s, d) => s + d.total, 0), [filtered]);
    const active = activeIndex != null ? filtered[activeIndex] : null;

    if (!filtered.length) return <EmptyState>// لا توجد بيانات لهذه الفترة //</EmptyState>;

    return (
        <div className="flex flex-col gap-4">
            {/* ★ الدونات */}
            <div className="relative" style={{ height }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={filtered}
                            dataKey="total"
                            nameKey="name"
                            innerRadius="68%"
                            outerRadius="92%"
                            paddingAngle={2}
                            stroke={C.card}
                            strokeWidth={2}
                            isAnimationActive={false}
                            onMouseEnter={(_, i) => setActiveIndex(i)}
                            onMouseLeave={() => setActiveIndex(null)}
                        >
                            {filtered.map((d, i) => (
                                <Cell
                                    key={i}
                                    fill={d.color_hex || C.green}
                                    opacity={activeIndex == null || activeIndex === i ? 1 : 0.3}
                                    style={{ transition: 'opacity .15s', cursor: 'pointer', outline: 'none' }}
                                />
                            ))}
                        </Pie>
                        <Tooltip content={<DonutTooltip total={total} />} />
                    </PieChart>
                </ResponsiveContainer>

                {/* ★ المركز التفاعلي: المجموع افتراضيًا، وعند الـ hover يعرض الشريحة */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    {active ? (
                        <>
                            <div className={`${F.ar} text-[0.72rem] font-bold truncate max-w-[45%]`} style={{ color: active.color_hex }}>
                                {active.name}
                            </div>
                            <div className={`${F.mono} text-[1.15rem] leading-none mt-0.5`} style={{ color: C.t1 }}>
                                {fmtMAD(active.total)}
                            </div>
                            <div className={`${F.mono} text-[0.6rem] mt-1`} style={{ color: C.t3 }}>
                                {total > 0 ? ((active.total / total) * 100).toFixed(1) : 0}%
                            </div>
                        </>
                    ) : (
                        <>
                            <div className={`${F.mono} text-[1.15rem] leading-none`} style={{ color: C.t1 }}>
                                {fmtMAD(total)}
                            </div>
                            <div className={`${F.mono} text-[0.55rem] tracking-[1px] mt-1`} style={{ color: C.t4 }}>
                                {centerLabel} · MAD
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* ★ Legend تفصيلي — تفاعلي مع المخطط */}
            <div className="flex flex-col gap-1.5">
                {filtered.map((d, i) => {
                    const pct = total > 0 ? (d.total / total) * 100 : 0;
                    const isActive = activeIndex === i;
                    return (
                        <button
                            key={d.id ?? i}
                            type="button"
                            onMouseEnter={() => setActiveIndex(i)}
                            onMouseLeave={() => setActiveIndex(null)}
                            className="flex items-center gap-2 border px-2 py-1.5 text-start transition-colors"
                            style={{
                                borderColor: isActive ? `${d.color_hex}66` : C.b,
                                background: isActive ? `${d.color_hex}0d` : 'transparent',
                            }}
                        >
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color_hex }} />
                            <span className={`${F.ar} text-[0.72rem] font-semibold flex-1 truncate`} style={{ color: C.t2 }}>
                                {d.name}
                            </span>
                            {d.count != null && (
                                <span className={`${F.mono} text-[0.55rem] shrink-0`} style={{ color: C.t4 }}>
                                    {d.count} عملية
                                </span>
                            )}
                            <span className={`${F.mono} text-[0.68rem] font-bold shrink-0`} style={{ color: C.t1 }}>
                                {fmtMAD(d.total)}
                            </span>
                            <span className={`${F.mono} text-[0.6rem] w-11 text-left shrink-0`} style={{ color: d.color_hex }}>
                                {pct.toFixed(1)}%
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}