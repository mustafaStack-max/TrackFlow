import { COLORS as C, FONT as F } from '@/shared/lib/theme';
import { insightConfig } from './insightConfig';

export default function StatusBanner({ insight = null }) {
  if (!insight) return null;

  const cfg = insightConfig(insight.type);

  return (
    <div
      className="flex items-start gap-3 px-4 py-2.5 border"
      style={{ borderColor: cfg.border, background: cfg.bg }}
    >
      <span className="shrink-0 mt-0.5" style={{ color: cfg.color }}>
        {cfg.icon}
      </span>

      <div className="min-w-0">
        <span
          className={`${F.ar} text-[0.78rem] font-bold`}
          style={{ color: cfg.color }}
        >
          {insight.title}:
        </span>{' '}
        <span className={`${F.ar} text-[0.72rem]`} style={{ color: C.t2 }}>
          {insight.message}
        </span>
      </div>
    </div>
  );
}