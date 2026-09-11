import { COLORS as C, FONT as F } from '@/shared/lib/theme';
import { fmtMAD } from '@/shared/lib/format';
import { insightConfig } from '@/shared/ui';

export default function InsightCard({ insight }) {
  const cfg = insightConfig(insight.type);

  return (
    <div
      className="relative p-3.5 border overflow-hidden transition-transform duration-150 hover:-translate-y-px"
      style={{ borderColor: cfg.border, background: cfg.bg }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background: `linear-gradient(90deg, transparent, ${cfg.color}, transparent)`,
        }}
      />

      <div className="flex items-start gap-3">
        <div
          className="shrink-0 flex items-center justify-center w-9 h-9 rounded border"
          style={{
            color: cfg.color,
            borderColor: `${cfg.color}55`,
            background: `${cfg.color}15`,
          }}
        >
          {cfg.icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`${F.ar} text-[0.88rem] font-bold`}
              style={{ color: C.t1 }}
            >
              {insight.title}
            </span>

            <span
              className={`${F.mono} text-[0.52rem] tracking-[1px] px-1.5 py-0.5 border rounded`}
              style={{
                borderColor: `${cfg.color}55`,
                color: cfg.color,
                background: `${cfg.color}20`,
              }}
            >
              {cfg.label}
            </span>
          </div>

          <p
            className={`${F.ar} text-[0.75rem] leading-relaxed`}
            style={{ color: C.t2 }}
          >
            {insight.message}
          </p>

          {insight.impact > 0 && (
            <div
              className={`${F.mono} text-[0.62rem] mt-2 flex items-center gap-1.5`}
              style={{ color: C.t4 }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: cfg.color }}
              />
              أثر مالي:{' '}
              <span className="font-bold" style={{ color: C.t3 }}>
                {fmtMAD(insight.impact)} MAD
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}