import { useMemo } from 'react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { COLORS as C, FONT as F } from '@/shared/lib/theme';
import { fmtAxis, fmtMAD } from '@/shared/lib/format';
import { bucketSeries } from '@/shared/lib/analytics';
import { EmptyState } from '@/shared/ui';
import { ChartStatCard, TooltipBox } from '@/shared/charts';

function TrendTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  const data = payload[0]?.payload;
  if (!data) return null;

  const netColor = data.net >= 0 ? C.green : C.red;

  const rows = [
    { label: 'الدخل', color: C.green, value: data.income },
    { label: 'المصاريف', color: C.red, value: data.expense },
    {
      label: 'الصافي',
      color: netColor,
      raw: `${data.net >= 0 ? '+' : ''}${fmtMAD(data.net)} MAD`,
    },
  ];

  if (data.cumulative !== undefined) {
    rows.push({
      label: 'تراكمي',
      color: C.gold,
      raw: `${fmtMAD(data.cumulative)} MAD`,
    });
  }

  return <TooltipBox title={label} rows={rows} />;
}

export default function TrendChart({ flow = [], granularity = 'day' }) {
  const data = useMemo(() => bucketSeries(flow, granularity), [flow, granularity]);

  const totals = useMemo(() => {
    if (!data.length) return null;

    const totalIncome = data.reduce((s, d) => s + (d.income || 0), 0);
    const totalExpense = data.reduce((s, d) => s + (d.expense || 0), 0);
    const totalNet = totalIncome - totalExpense;

    return { totalIncome, totalExpense, totalNet };
  }, [data]);

  if (!flow || flow.length === 0 || !totals) {
    return <EmptyState>// لا توجد بيانات اتجاهات //</EmptyState>;
  }

  const minNet = Math.min(...data.map((d) => d.net), 0);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-3 gap-3">
        <ChartStatCard
          label="إجمالي الدخل"
          color={C.green}
          value={
            <>
              {fmtMAD(totals.totalIncome)}{' '}
              <span className="text-[0.55rem]">MAD</span>
            </>
          }
        />

        <ChartStatCard
          label="إجمالي المصاريف"
          color={C.red}
          value={
            <>
              {fmtMAD(totals.totalExpense)}{' '}
              <span className="text-[0.55rem]">MAD</span>
            </>
          }
        />

        <ChartStatCard
          label="صافي الفترة"
          color={totals.totalNet >= 0 ? C.green : C.red}
          value={
            <>
              {totals.totalNet >= 0 ? '+' : ''}
              {fmtMAD(totals.totalNet)}{' '}
              <span className="text-[0.55rem]">MAD</span>
            </>
          }
        />
      </div>

      <div className="w-full" style={{ height: 340 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid stroke={C.greenTrace} strokeDasharray="3 3" vertical={false} />

            <XAxis
              dataKey="label"
              tick={{ fill: C.t4, fontFamily: F.mono, fontSize: 10 }}
              axisLine={{ stroke: C.b }}
              tickLine={false}
              interval={data.length > 15 ? Math.ceil(data.length / 8) - 1 : 0}
              minTickGap={18}
            />

            <YAxis
              tick={{ fill: C.t4, fontFamily: F.mono, fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={fmtAxis}
              width={45}
              domain={[minNet < 0 ? 'auto' : 0, 'auto']}
            />

            <Tooltip content={<TrendTooltip />} cursor={{ fill: C.greenTrace }} />

            <ReferenceLine y={0} stroke={C.t4} strokeDasharray="2 2" strokeWidth={1} />

            <Bar
              dataKey="income"
              name="الدخل"
              fill={C.green}
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
              opacity={0.85}
            />

            <Bar
              dataKey="expense"
              name="المصاريف"
              fill={C.red}
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
              opacity={0.85}
            />

            <Line
              type="monotone"
              dataKey="net"
              name="الصافي"
              stroke={C.cyan}
              strokeWidth={2.5}
              dot={{ r: 4, fill: C.cyan, stroke: C.card, strokeWidth: 2 }}
              activeDot={{ r: 6, stroke: C.cyan, strokeWidth: 2, fill: C.card }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div
        className="flex flex-wrap items-center justify-center gap-4 pt-2 border-t"
        style={{ borderColor: C.b }}
      >
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm" style={{ background: C.green, opacity: 0.85 }} />
          <span className={`${F.ar} text-[0.7rem]`} style={{ color: C.t3 }}>الدخل</span>
        </span>

        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm" style={{ background: C.red, opacity: 0.85 }} />
          <span className={`${F.ar} text-[0.7rem]`} style={{ color: C.t3 }}>المصاريف</span>
        </span>

        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5" style={{ background: C.cyan }} />
          <span
            className="w-2 h-2 rounded-full border-2"
            style={{ borderColor: C.cyan, background: C.card }}
          />
          <span className={`${F.ar} text-[0.7rem]`} style={{ color: C.t3 }}>الصافي</span>
        </span>
      </div>
    </div>
  );
}