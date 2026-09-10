import { ChartStatCard } from '@/shared/charts';


export default function FlowStatsRow({ stats = [] }) {
  if (!stats.length) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
      {stats.map((s) => (
        <ChartStatCard
          key={s.key}
          label={s.label}
          value={s.value}
          sub={s.sub}
          color={s.color}
          icon={s.icon}
        />
      ))}
    </div>
  );
}