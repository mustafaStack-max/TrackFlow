// resources/js/Components/Dashboard/AccountBarChart.jsx
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Legend } from 'recharts';
import { COLORS as C } from './theme';
import { fmtMAD } from './format';
import { TooltipBox } from './ChartTooltip';
import { EmptyState } from './Panel';

function AccTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return <TooltipBox title={label} rows={payload.map((p) => ({ label: p.name, value: p.value, color: p.color }))} />;
}

export default function AccountBarChart({ data = [], height = 190 }) {
    if (!data.length) return <EmptyState>// لا توجد بيانات //</EmptyState>;

    return (
        <div style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 4, bottom: 4 }}>
                    <CartesianGrid stroke={C.greenTrace} horizontal={false} />
                    <XAxis type="number" tickFormatter={fmtMAD} hide />
                    <YAxis type="category" dataKey="name" width={86} tick={{ fill: C.t2, fontFamily: 'IBM Plex Sans Arabic', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<AccTooltip />} cursor={{ fill: C.greenTrace }} />
                    <Legend wrapperStyle={{ fontFamily: 'Share Tech Mono', fontSize: 10, color: C.t2 }} iconType="circle" iconSize={8} />
                    <Bar dataKey="expense" name="مصروف" fill={C.red} fillOpacity={0.8} radius={[0, 3, 3, 0]} barSize={9} isAnimationActive={false} />
                    <Bar dataKey="income" name="دخل" fill={C.green} fillOpacity={0.8} radius={[0, 3, 3, 0]} barSize={9} isAnimationActive={false} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
