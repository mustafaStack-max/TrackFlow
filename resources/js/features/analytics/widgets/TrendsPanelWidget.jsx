import { useMemo, useState } from 'react';
import { COLORS as C } from '@/shared/lib/theme';
import { Panel, ToggleGroup } from '@/shared/ui';
import { GranularityPicker } from '@/shared/components';
import { autoGranularity } from '@/shared/lib/analytics';
import TrendChart from '../charts/TrendChart';
import WealthChart from '../charts/WealthChart';

const VIEW_OPTIONS = [
  { value: 'trends', label: 'التدفقات' },
  { value: 'wealth', label: 'تطور الثروة' },
];

export default function TrendsPanelWidget({
  flow = [],
  wealth = null,
  periodLabel,
}) {
  const [view, setView] = useState('trends');
  const [granularity, setGranularity] = useState('auto');

  const effGranularity = useMemo(() => {
    if (granularity !== 'auto') return granularity;

    const count =
      view === 'trends' ? flow.length : (wealth?.points?.length ?? 0);

    return autoGranularity(count);
  }, [granularity, view, flow.length, wealth]);

  return (
    <Panel
      title={view === 'trends' ? 'التدفقات والاتجاهات' : 'تطور الثروة'}
      badge={periodLabel}
      right={
        <ToggleGroup
          options={VIEW_OPTIONS}
          value={view}
          onChange={setView}
          activeColor={C.gold}
        />
      }
    >
      <div className="flex flex-col gap-4">
        <GranularityPicker
          value={granularity}
          effective={effGranularity}
          onChange={setGranularity}
        />

        {view === 'trends' ? (
          <TrendChart flow={flow} granularity={effGranularity} />
        ) : (
          <WealthChart data={wealth} granularity={effGranularity} />
        )}
      </div>
    </Panel>
  );
}