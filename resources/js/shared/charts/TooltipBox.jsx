import { COLORS as C, FONT as F } from '@/Components/Dashboard/theme';
import { fmtMAD } from '@/shared/lib/format';

export default function TooltipBox({
  title,
  rows = [],
  footer = null,
  showMad = true,
}) {
  return (
    <div
      className="border p-3 text-[0.72rem] shadow-[0_8px_30px_rgba(0,0,0,0.6)]"
      style={{ background: C.card, borderColor: C.bHot }}
    >
      {title && (
        <div
          className={`${F.mono} mb-2 font-bold tracking-[1px]`}
          style={{ color: C.t1 }}
        >
          {title}
        </div>
      )}

      <div className="flex flex-col gap-1">
        {rows.map((row, i) => (
          <div key={i} className="flex items-center justify-between gap-6">
            <span className="flex items-center gap-1.5" style={{ color: C.t2 }}>
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: row.color }}
              />
              {row.label}
            </span>

            <span className={`${F.mono} font-bold`} style={{ color: row.color }}>
              {row.raw ?? `${fmtMAD(row.value)}${showMad ? ' MAD' : ''}`}
            </span>
          </div>
        ))}
      </div>

      {footer && (
        <div
          className={`${F.mono} text-[0.65rem] mt-2 pt-2 border-t`}
          style={{ borderColor: C.b, color: C.t3 }}
        >
          {footer}
        </div>
      )}
    </div>
  );
}