import Panel from '@/shared/ui/Panel';
import RankedBarChart from '../charts/RankedBarChart';
import DonutChart from '../charts/DonutChart';

export default function CategoryBreakdownSection({
  categoryBreakdown = [],
  periodLabel,
}) {
  return (
    <div className="grid lg:grid-cols-[1.4fr_1fr] gap-5">
      <Panel title="مقارنة الفئات" badge={periodLabel}>
        <RankedBarChart data={categoryBreakdown} />
      </Panel>

      <Panel title="التصنيفات" badge={periodLabel}>
        <DonutChart data={categoryBreakdown} centerLabel="TOTAL" />
      </Panel>
    </div>
  );
}