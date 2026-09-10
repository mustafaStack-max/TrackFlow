import { useCallback, useMemo } from 'react';
import { Panel } from '@/shared/ui';
import { useChartPrefs } from '@/shared/hooks';
import { downloadCsv } from '@/shared/lib/utils';

import FlowToolbar from './FlowToolbar';
import FlowStatsRow from './FlowStatsRow';
import FlowChartBody from './FlowChartBody';
import useFlowChartData from './useFlowChartData';

export default function FlowChartSection({
  series = [],
  range = 'month',
  customFrom = null,
  customTo = null,
  onRangeChange,
  periodLabel,
}) {
  const [prefs, setPrefs] = useChartPrefs();

  const custom = useMemo(
    () => (customFrom && customTo ? { from: customFrom, to: customTo } : null),
    [customFrom, customTo]
  );

  const {
    bucketed,
    chartData,
    effectiveGranularity,
    peaks,
    averages,
    budgetCeiling,
    stats,
  } = useFlowChartData({
    series,
    range,
    custom,
    granularity: prefs.granularity,
    prefs,
  });

  const handleGranularityChange = useCallback(
    (g) => setPrefs((p) => ({ ...p, granularity: g })),
    [setPrefs]
  );

  const handleToggleSeries = useCallback(
    (key) =>
      setPrefs((p) => ({
        ...p,
        visibleSeries: { ...p.visibleSeries, [key]: !p.visibleSeries[key] },
      })),
    [setPrefs]
  );

  const handleExport = useCallback(() => {
    const rows = [
      ['الفترة', 'دخل', 'مصروف', 'صافي', 'تراكمي'],
      ...bucketed.map((b) => [
        b.label,
        b.income,
        b.expense,
        b.net,
        b.cumulative,
      ]),
    ];

    downloadCsv(rows, `flow-${range}.csv`);
  }, [bucketed, range]);

  return (
    <Panel title="تحليل التدفق المالي" badge={periodLabel}>
      <div className="flex flex-col gap-4">
        <FlowToolbar
          range={range}
          customFrom={customFrom}
          customTo={customTo}
          onRangeChange={onRangeChange}
          granularity={prefs.granularity}
          effectiveGranularity={effectiveGranularity}
          onGranularityChange={handleGranularityChange}
          prefs={prefs}
          setPrefs={setPrefs}
          onExport={handleExport}
          canExport={bucketed.length > 0}
        />

        <FlowStatsRow stats={stats} />

        <FlowChartBody
          chartData={chartData}
          bucketed={bucketed}
          prefs={prefs}
          peaks={peaks}
          averages={averages}
          budgetCeiling={budgetCeiling}
          onToggleSeries={handleToggleSeries}
        />
      </div>
    </Panel>
  );
}