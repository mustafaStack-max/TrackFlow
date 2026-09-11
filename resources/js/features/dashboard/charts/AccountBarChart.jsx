import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { COLORS as C, FONT as F } from '@/shared/lib/theme';
import { fmtAxis, fmtMAD } from '@/shared/lib/format';
import { EmptyState } from '@/shared/ui';
import { TooltipBox } from '@/shared/charts';

function AccountTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  const d = payload[0]?.payload;
  if (!d) return null;

  const net = (d.income || 0) - (d.expense || 0);

  return (
    <TooltipBox
      title={label}
      rows={[
        { label: 'دخل', color: C.green, value: d.income },
        { label: 'مصروف', color: C.red, value: d.expense },
        {
          label: 'صافي',
          color: net >= 0 ? C.green : C.red,
          raw: `${net >= 0 ? '+' : '-'}${fmtMAD(Math.abs(net))} MAD`,
        },
      ]}
    />
  );
}

export default function AccountBarChart({ data = [] }) {
  const rows = (data || [])
    .map((a) => ({
      name: a.name,
      income: a.income ?? 0,
      expense: a.expense ?? 0,
    }))
    .filter((r) => r.income > 0 || r.expense > 0);

  if (!rows.length) {
    return <EmptyState>// لا توجد حركة على الحسابات في هذه الفترة //</EmptyState>;
  }

  const tilted = rows.length > 6;

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full" style={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid stroke={C.greenTrace} strokeDasharray="3 3" vertical={false} />

            <XAxis
              dataKey="name"
              tick={{ fill: C.t4, fontFamily: F.mono, fontSize: 10 }}
              axisLine={{ stroke: C.b }}
              tickLine={false}
              interval={0}
              angle={tilted ? -20 : 0}
              textAnchor={tilted ? 'end' : 'middle'}
              height={tilted ? 60 : 30}
            />

            <YAxis
              tick={{ fill: C.t4, fontFamily: F.mono, fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={fmtAxis}
              width={48}
            />

            <Tooltip content={<AccountTooltip />} cursor={{ fill: C.greenTrace }} />

            <Bar
              dataKey="income"
              name="دخل"
              fill={C.green}
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
              opacity={0.85}
            />

            <Bar
              dataKey="expense"
              name="مصروف"
              fill={C.red}
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
              opacity={0.85}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div
        className="flex flex-wrap items-center justify-center gap-4 pt-2 border-t"
        style={{ borderColor: C.b }}
      >
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm" style={{ background: C.green, opacity: 0.85 }} />
          <span className={`${F.ar} text-[0.7rem]`} style={{ color: C.t3 }}>دخل</span>
        </span>

        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm" style={{ background: C.red, opacity: 0.85 }} />
          <span className={`${F.ar} text-[0.7rem]`} style={{ color: C.t3 }}>مصروف</span>
        </span>
      </div>
    </div>
  );
}