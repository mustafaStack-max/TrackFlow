import { useMemo } from 'react';
import {
  Area,
  Brush,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { COLORS as C, FONT as F } from '@/Components/Dashboard/theme';
import { ChartLegend, TooltipBox } from '@/shared/charts';
import { fmtAxis } from '@/shared/lib/format';

const SERIES = [
  { key: 'income', label: 'دخل', color: C.green },
  { key: 'expense', label: 'مصروف', color: C.red },
  { key: 'net', label: 'صافي', color: C.amber },
  { key: 'cumulative', label: 'تراكمي', color: C.cyan },
];

function FlowTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  const point = payload[0]?.payload;

  const rows = payload
    .filter((p) => p.value !== null && p.value !== undefined)
    .map((p) => {
      const key = String(p.dataKey);
      const isPred = key.startsWith('pred');
      const baseKey = isPred ? key.slice(4).toLowerCase() : key;
      const meta = SERIES.find((s) => s.key === baseKey);

      return {
        label: (meta?.label || baseKey) + (isPred ? ' (توقع)' : ''),
        color: p.color || p.stroke || p.fill || C.t2,
        value: p.value,
      };
    });

  return (
    <TooltipBox
      title={label}
      rows={rows}
      footer={point?.isPrediction ? 'قيمة متوقعة' : null}
    />
  );
}

export default function FlowChartBody({
  chartData = [],
  bucketed = [],
  prefs = {},
  peaks = { income: null, expense: null },
  averages = { income: 0, expense: 0 },
  budgetCeiling = 0,
  onToggleSeries,
}) {
  const visible = prefs.visibleSeries || {};
  const curve = prefs.curveType || 'monotone';
  const dots = prefs.showDots ? { r: 2 } : false;

  /* دمج مفاتيح التوقعات بحيث تبدأ من آخر نقطة فعلية */
  const data = useMemo(
    () =>
      chartData.map((d, i) => {
        if (i === bucketed.length - 1 || d.isPrediction) {
          return { ...d, predNet: d.net, predCumulative: d.cumulative };
        }
        return { ...d, predNet: null, predCumulative: null };
      }),
    [chartData, bucketed.length]
  );

  const hidden = SERIES.filter((s) => visible[s.key] === false).map(
    (s) => s.key
  );

  return (
    <div className="flex flex-col gap-3">
      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={C.b} vertical={false} />

          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: C.t4, fontFamily: F.mono }}
            axisLine={{ stroke: C.b }}
            tickLine={false}
            minTickGap={24}
          />

          <YAxis
            tick={{ fontSize: 10, fill: C.t4, fontFamily: F.mono }}
            axisLine={false}
            tickLine={false}
            tickFormatter={fmtAxis}
            width={56}
          />

          <Tooltip content={<FlowTooltip />} cursor={{ stroke: C.bHot }} />

          {prefs.showAverageLines && (
            <ReferenceLine
              y={averages.expense}
              stroke={C.red}
              strokeDasharray="4 4"
              strokeWidth={1}
              ifOverflow="extendDomain"
            />
          )}

          {prefs.showAverageLines && (
            <ReferenceLine
              y={averages.income}
              stroke={C.green}
              strokeDasharray="4 4"
              strokeWidth={1}
              ifOverflow="extendDomain"
            />
          )}

          {prefs.showBudgetCeiling && budgetCeiling > 0 && (
            <ReferenceLine
              y={budgetCeiling}
              stroke={C.red}
              strokeDasharray="6 3"
              strokeWidth={1.2}
              ifOverflow="extendDomain"
              label={{
                value: 'سقف الميزانية',
                position: 'insideTopRight',
                fill: C.red,
                fontSize: 9,
                fontFamily: F.ar,
              }}
            />
          )}

          <Area
            type={curve}
            dataKey="cumulative"
            stroke={C.cyan}
            fill={C.cyan}
            fillOpacity={0.12}
            strokeWidth={1.6}
            dot={false}
            hide={visible.cumulative === false}
            isAnimationActive={false}
          />

          <Line
            type={curve}
            dataKey="income"
            stroke={C.green}
            strokeWidth={2}
            dot={dots}
            hide={visible.income === false}
            isAnimationActive={false}
          />

          <Line
            type={curve}
            dataKey="expense"
            stroke={C.red}
            strokeWidth={2}
            dot={dots}
            hide={visible.expense === false}
            isAnimationActive={false}
          />

          <Line
            type={curve}
            dataKey="net"
            stroke={C.amber}
            strokeWidth={1.6}
            dot={dots}
            hide={visible.net === false}
            isAnimationActive={false}
          />

          <Line
            type="monotone"
            dataKey="predNet"
            stroke={C.amber}
            strokeWidth={1.4}
            strokeDasharray="4 4"
            dot={false}
            hide={visible.net === false}
            isAnimationActive={false}
          />

          <Line
            type="monotone"
            dataKey="predCumulative"
            stroke={C.cyan}
            strokeWidth={1.4}
            strokeDasharray="4 4"
            dot={false}
            hide={visible.cumulative === false}
            isAnimationActive={false}
          />

          {prefs.showPeaks && peaks.income !== null && bucketed[peaks.income] && (
            <ReferenceDot
              x={bucketed[peaks.income].label}
              y={bucketed[peaks.income].income}
              r={4}
              fill={C.green}
              stroke={C.card}
            />
          )}

          {prefs.showPeaks && peaks.expense !== null && bucketed[peaks.expense] && (
            <ReferenceDot
              x={bucketed[peaks.expense].label}
              y={bucketed[peaks.expense].expense}
              r={4}
              fill={C.red}
              stroke={C.card}
            />
          )}

          {prefs.showBrush && data.length > 1 && (
            <Brush
              dataKey="label"
              height={20}
              stroke={C.bHot}
              fill={C.card2}
              travellerWidth={8}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>

      <ChartLegend items={SERIES} hidden={hidden} onToggle={onToggleSeries} />
    </div>
  );
}