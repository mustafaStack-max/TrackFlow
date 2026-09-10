
import { lazy, Suspense, useState } from 'react';
import { COLORS as C, FONT as F } from '@/Components/Dashboard/theme';
import { Panel, ToggleGroup } from '@/shared/ui';
import AccountBarChart from '@/Components/Dashboard/AccountBarChart';
import SpendingHeatmap from '@/Components/Dashboard/SpendingHeatmap';

const MoneyFlowSankey = lazy(() =>
  import('@/Components/Dashboard/MoneyFlowSankey')
);

const VIEW_OPTIONS = [
  { value: 'accounts', label: 'حسب الحساب' },
  { value: 'sankey', label: 'فين مشات الفلوس' },
];

function SankeyFallback() {
  return (
    <div
      className={`${F.mono} text-center py-16 text-[0.7rem] tracking-[2px]`}
      style={{ color: C.t4 }}
    >
      // تحميل خريطة التدفق… //
    </div>
  );
}

export default function FlowAndHeatmapSection({
  accountBreakdown = [],
  sankey = {},
  heatmap = [],
  periodLabel,
  heatmapLabel = null,
}) {
  const [view, setView] = useState('accounts');

  return (
    <div className="grid lg:grid-cols-[1.4fr_1fr] gap-5">
      <Panel
        title="الحسابات وتدفق الأموال"
        badge={periodLabel}
        right={
          <ToggleGroup options={VIEW_OPTIONS} value={view} onChange={setView} />
        }
      >
        {view === 'accounts' ? (
          <AccountBarChart data={accountBreakdown} />
        ) : (
          <Suspense fallback={<SankeyFallback />}>
            <MoneyFlowSankey
              nodes={sankey.nodes ?? []}
              links={sankey.links ?? []}
            />
          </Suspense>
        )}
      </Panel>

      <Panel title="خريطة حرارة الإنفاق" badge={heatmapLabel || periodLabel}>
        <SpendingHeatmap
          data={heatmap}
          periodLabel={heatmapLabel || periodLabel}
        />
      </Panel>
    </div>
  );
}