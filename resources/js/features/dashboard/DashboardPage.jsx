// resources/js/features/dashboard/DashboardPage.jsx
import { useCallback } from 'react';
import { router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useRangeSelection } from '@/shared/hooks';

import DashboardHeader from './widgets/DashboardHeader';
import DashboardKpisSection from './widgets/DashboardKpisSection';
import AccountsQuickView from './widgets/AccountsQuickView';
import CategoryBreakdownSection from './widgets/CategoryBreakdownSection';
import FlowAndHeatmapSection from './widgets/FlowAndHeatmapSection';
import RecentTransactionsTable from './widgets/RecentTransactionsTable';
import FlowChartSection from './charts/FlowChartSection';

export default function DashboardPage(props) {
  const {
    series = [],
    kpis = {},
    accounts = [],
    categoryBreakdown = [],
    accountBreakdown = [],
    sankey = {},
    heatmap = [],
    recent = [],
    range: initialRange = 'month',
    customFrom = null,
    customTo = null,
    periodLabel = '',
    heatmapLabel = null,
  } = props;

  const handleRangeChange = useCallback((nextRange, custom) => {
    router.get(
      route('dashboard'),
      {
        range: nextRange,
        from: custom?.from || undefined,
        to: custom?.to || undefined,
      },
      { preserveState: true, preserveScroll: true }
    );
  }, []);

  const { range, custom, change } = useRangeSelection({
    initialRange,
    initialCustom:
      customFrom && customTo ? { from: customFrom, to: customTo } : null,
    onChange: handleRangeChange,
  });

  return (
    <AuthenticatedLayout>
      <div className="flex flex-col gap-5">
        <DashboardHeader periodLabel={periodLabel} />

        <DashboardKpisSection kpis={kpis} periodLabel={periodLabel} />

        <AccountsQuickView accounts={accounts} />

        <FlowChartSection
          series={series}
          range={range}
          customFrom={custom?.from}
          customTo={custom?.to}
          onRangeChange={change}
          periodLabel={periodLabel}
        />

        <CategoryBreakdownSection
          categoryBreakdown={categoryBreakdown}
          periodLabel={periodLabel}
        />

        <FlowAndHeatmapSection
          accountBreakdown={accountBreakdown}
          sankey={sankey}
          heatmap={heatmap}
          periodLabel={periodLabel}
          heatmapLabel={heatmapLabel}
        />

        <RecentTransactionsTable recent={recent} periodLabel={periodLabel} />
      </div>
    </AuthenticatedLayout>
  );
}