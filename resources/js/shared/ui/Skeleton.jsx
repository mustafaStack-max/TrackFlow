import { COLORS as C } from '@/shared/lib/theme';

export default function Skeleton({ className = '', style = {} }) {
  return (
    <div
      className={['animate-pulse border', className].filter(Boolean).join(' ')}
      style={{
        background: C.card,
        borderColor: C.b,
        ...style,
      }}
    />
  );
}

export function KpiGridSkeleton({ count = 4, className = 'h-36' }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className={className} />
      ))}
    </div>
  );
}

export function MiniKpiGridSkeleton({ count = 4, className = 'h-24' }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className={className} />
      ))}
    </div>
  );
}

export function AnalyticsKpisSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <KpiGridSkeleton />
      <MiniKpiGridSkeleton />
    </div>
  );
}