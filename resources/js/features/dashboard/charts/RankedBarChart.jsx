import { useMemo } from 'react';
import { COLORS as C, FONT as F } from '@/shared/lib/theme';
import { fmtMAD } from '@/shared/lib/format';
import { EmptyState } from '@/shared/ui';

export default function RankedBarChart({ data = [] }) {
  const { sorted, grandTotal, maxVal } = useMemo(() => {
    const filtered = (data || []).filter((d) => d && d.total > 0);
    const s = [...filtered].sort((a, b) => b.total - a.total);
    const gt = s.reduce((sum, d) => sum + d.total, 0);
    return { sorted: s, grandTotal: gt, maxVal: s.length ? s[0].total : 0 };
  }, [data]);

  if (!sorted.length) {
    return <EmptyState>// لا توجد تصنيفات //</EmptyState>;
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div className={`${F.mono} text-[0.6rem] tracking-[2px]`} style={{ color: C.t4 }}>
        TOP {sorted.length} CATEGORIES
      </div>

      {sorted.map((cat, idx) => {
        const pct = grandTotal > 0 ? (cat.total / grandTotal) * 100 : 0;
        const barPct = maxVal > 0 ? (cat.total / maxVal) * 100 : 0;
        const rankColor = idx === 0 ? C.gold : idx === 1 ? '#c0c0c0' : idx === 2 ? '#cd7f32' : C.t4;

        return (
          <div
            key={cat.id || cat.name}
            className="relative flex items-center gap-3 p-3 border transition-colors"
            style={{ borderColor: C.b, background: C.card }}
          >
            <div
              className={`${F.mono} text-[1.4rem] font-bold shrink-0 w-7 text-center`}
              style={{ color: rankColor }}
            >
              {String(idx + 1).padStart(2, '0')}
            </div>

            <div
              className="w-1 h-10 rounded-full shrink-0"
              style={{ background: cat.color_hex }}
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2 mb-1">
                <span
                  className={`${F.ar} text-[0.88rem] font-bold truncate`}
                  style={{ color: C.t1 }}
                >
                  {cat.name}
                </span>

                <span
                  className={`${F.mono} text-[0.95rem] font-bold shrink-0`}
                  style={{ color: C.t1 }}
                >
                  {fmtMAD(cat.total)}
                  <span className={`${F.mono} text-[0.55rem] ms-1`} style={{ color: C.t4 }}>
                    MAD
                  </span>
                </span>
              </div>

              <div
                className="h-1.5 rounded-full overflow-hidden"
                style={{ background: `${cat.color_hex}14` }}
              >
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${barPct}%`,
                    background: `linear-gradient(90deg, ${cat.color_hex}, ${cat.color_hex}bb)`,
                  }}
                />
              </div>

              <div
                className={`${F.mono} text-[0.58rem] mt-1 flex items-center gap-3`}
                style={{ color: C.t3 }}
              >
                <span>
                  <span dir="ltr">{pct.toFixed(1)}%</span> من الإجمالي
                </span>
                <span>·</span>
                <span>{cat.count ?? 0} عملية</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}