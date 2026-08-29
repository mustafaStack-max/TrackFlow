// resources/js/Components/Dashboard/DonutChart.jsx
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { COLORS as C, FONT as F } from './theme';
import { TooltipBox } from './ChartTooltip';
import { EmptyState } from './Panel';

function DonutTooltip({ active, payload }) {
    if (!active || !payload?.length) return null;
    const d = payload[0];
    return <TooltipBox rows={[{ label: d.name, value: d.value, color: d.payload.color_hex || d.payload.color || C.green }]} />;
}

export default function DonutChart({ data = [], centerLabel = 'TOTAL', centerColor = C.green, height = 220 }) {
    const filtered = data.filter((d) => d.total > 0);
    const total = filtered.reduce((s, d) => s + d.total, 0);
    if (!filtered.length) return <EmptyState>// لا توجد بيانات لهذه الفترة //</EmptyState>;

    return (
        <div className="relative" style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie data={filtered} dataKey="total" nameKey="name" innerRadius="68%" outerRadius="92%" paddingAngle={2} stroke={C.card} strokeWidth={2} isAnimationActive={false}>
                        {filtered.map((d, i) => <Cell key={i} fill={d.color_hex || C.green} />)}
                    </Pie>
                    <Tooltip content={<DonutTooltip />} />
                </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className={`${F.mono} text-[1.05rem]`} style={{ color: centerColor }}>{Math.round(total).toLocaleString('ar-MA')}</div>
                <div className={`${F.mono} text-[0.58rem] tracking-[1px]`} style={{ color: C.t4 }}>{centerLabel}</div>
            </div>
        </div>
    );
}
