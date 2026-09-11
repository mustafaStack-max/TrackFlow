import { useMemo } from 'react';
import { COLORS as C, FONT as F } from '@/shared/lib/theme';
import { fmtMAD } from '@/shared/lib/format';
import { EmptyState } from '@/shared/ui';

export default function DonutChart({ data = [], centerLabel = 'TOTAL' }) {
  const { slices, grandTotal } = useMemo(() => {
    const filtered = (data || []).filter((d) => d && d.total > 0);
    const gt = filtered.reduce((s, d) => s + d.total, 0);

    if (!filtered.length || gt === 0) return { slices: [], grandTotal: 0 };

    let startAngle = 0;
    const arr = filtered.map((d) => {
      const pct = (d.total / gt) * 100;
      const angle = (d.total / gt) * 360;
      const slice = { ...d, pct, startAngle, endAngle: startAngle + angle };
      startAngle += angle;
      return slice;
    });

    return { slices: arr, grandTotal: gt };
  }, [data]);

  if (!slices.length) {
    return <EmptyState>// لا توجد تصنيفات //</EmptyState>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative flex items-center justify-center" style={{ height: 220 }}>
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {slices.map((s, i) => {
            const r = 80;
            const cx = 100;
            const cy = 100;
            const startRad = ((s.startAngle - 90) * Math.PI) / 180;
            const endRad = ((s.endAngle - 90) * Math.PI) / 180;
            const x1 = cx + r * Math.cos(startRad);
            const y1 = cy + r * Math.sin(startRad);
            const x2 = cx + r * Math.cos(endRad);
            const y2 = cy + r * Math.sin(endRad);
            const largeArc = s.endAngle - s.startAngle > 180 ? 1 : 0;

            return (
              <path
                key={i}
                d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`}
                fill={s.color_hex}
                stroke={C.card}
                strokeWidth={2}
              />
            );
          })}

          <circle cx="100" cy="100" r="55" fill={C.card} />
        </svg>

        <div className="absolute text-center">
          <div className={`${F.mono} text-[0.6rem] tracking-[2px]`} style={{ color: C.t4 }}>
            {centerLabel}
          </div>
          <div className={`${F.mono} text-[1.3rem] font-bold`} style={{ color: C.t1 }}>
            {fmtMAD(grandTotal)}
          </div>
          <div className={`${F.mono} text-[0.6rem]`} style={{ color: C.t4 }}>
            MAD
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        {slices.map((s, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-2 px-2 py-1.5 border-b last:border-b-0"
            style={{ borderColor: C.b }}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-sm shrink-0"
                style={{ background: s.color_hex }}
              />
              <span
                className={`${F.ar} text-[0.75rem] font-medium truncate`}
                style={{ color: C.t2 }}
              >
                {s.name}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className={`${F.mono} text-[0.7rem]`} style={{ color: C.t3 }}>
                {fmtMAD(s.total)}
              </span>
              <span
                className={`${F.mono} text-[0.6rem] font-bold px-1.5 py-0.5 border rounded`}
                style={{
                  borderColor: `${s.color_hex}44`,
                  color: s.color_hex,
                  background: `${s.color_hex}15`,
                }}
              >
                <span dir="ltr">{s.pct.toFixed(1)}%</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}