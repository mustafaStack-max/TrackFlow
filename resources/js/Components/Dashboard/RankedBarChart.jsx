// resources/js/Components/Dashboard/RankedBarChart.jsx
import { BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer, Tooltip, CartesianGrid, LabelList } from 'recharts';
import { COLORS as C, FONT as F } from './theme';
import { fmtMAD } from './format';
import { TooltipBox } from './ChartTooltip';
import { EmptyState } from './Panel';

function BarTooltip({ active, payload }) {
    if (!active || !payload?.length) return null;
    const d = payload[0];
    return <TooltipBox rows={[{ label: d.payload.name, value: d.value, color: d.payload.color_hex || C.green }]} />;
}

export default function RankedBarChart({ data = [], height = 190 }) {
    const filtered = data.filter((d) => d.total > 0);
    if (!filtered.length) return <EmptyState>// لا توجد بيانات لهذه الفترة //</EmptyState>;

    return (
        <div style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filtered} layout="vertical" margin={{ top: 4, right: 40, left: 4, bottom: 4 }}>
                    <CartesianGrid stroke={C.greenTrace} horizontal={false} />
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" width={78} tick={{ fill: C.t2, fontFamily: 'IBM Plex Sans Arabic', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<BarTooltip />} cursor={{ fill: C.greenTrace }} />
                    <Bar dataKey="total" radius={[0, 3, 3, 0]} isAnimationActive={false} barSize={14}>
                        {filtered.map((d, i) => <Cell key={i} fill={d.color_hex || C.green} />)}
                        <LabelList dataKey="total" position="right" formatter={(v) => fmtMAD(v)} style={{ fill: C.t3, fontFamily: 'Share Tech Mono', fontSize: 10 }} />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
