import { COLORS as C, FONT as F } from '@/shared/lib/theme';
import { EmptyState, INSIGHT_TYPES } from '@/shared/ui';
import InsightCard from './InsightCard';

const TYPE_ORDER = ['danger', 'warning', 'success', 'info'];

export default function InsightsWidget({ insights = [] }) {
  if (!insights || insights.length === 0) {
    return <EmptyState>// لا توجد توصيات ذكية //</EmptyState>;
  }

  const counts = insights.reduce((acc, i) => {
    acc[i.type] = (acc[i.type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-4">
      <div
        className="flex flex-wrap items-center gap-2 pb-2 border-b"
        style={{ borderColor: C.b }}
      >
        <span
          className={`${F.mono} text-[0.58rem] tracking-[2px]`}
          style={{ color: C.t4 }}
        >
          ANALYTICS SUMMARY
        </span>

        {TYPE_ORDER.filter((t) => counts[t] > 0).map((t) => {
          const cfg = INSIGHT_TYPES[t];

          return (
            <span
              key={t}
              className={`${F.mono} text-[0.6rem] font-bold px-2 py-0.5 border rounded`}
              style={{
                borderColor: `${cfg.color}66`,
                color: cfg.color,
                background: `${cfg.color}1a`,
              }}
            >
              {counts[t]} {cfg.label}
            </span>
          );
        })}
      </div>

      <div className="flex flex-col gap-3">
        {insights.map((insight, idx) => (
          <InsightCard key={idx} insight={insight} />
        ))}
      </div>

      <div
        className={`${F.mono} text-[0.58rem] tracking-[1px] pt-2 text-center`}
        style={{ color: C.t4 }}
      >
        // التوصيات تعتمد على بيانات الفترة المختارة وتحديث كل تغيير فترة //
      </div>
    </div>
  );
}