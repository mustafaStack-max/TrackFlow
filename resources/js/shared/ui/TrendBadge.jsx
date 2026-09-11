import { COLORS as C, FONT as F } from '@/shared/lib/theme';
import { fmtMAD } from '@/shared/lib/format';

const MIN_BASE = 100;

export default function TrendBadge({
  pct = null,
  invert = false,
  base,
  diff,
  label = '',
}) {
  const hasPct = pct !== null && pct !== undefined;
  const baseLarge = base === undefined || Math.abs(base) >= MIN_BASE;

  const suffix = label ? (
    <span className={`${F.ar} font-normal ms-1`} style={{ color: C.t4 }}>
      {label}
    </span>
  ) : null;

  /* 1) نسبة مئوية عندما يكون الأساس كبيرًا */
  if (hasPct && baseLarge) {
    if (pct === 0) {
      return (
        <span className={`${F.mono} text-[0.62rem]`} style={{ color: C.t3 }}>
          — 0%{suffix}
        </span>
      );
    }

    const good = invert ? pct < 0 : pct > 0;

    return (
      <span
        className={`${F.mono} text-[0.62rem] font-bold`}
        style={{ color: good ? C.green : C.red }}
      >
        <span dir="ltr">{`${pct > 0 ? '▲' : '▼'} ${Math.abs(pct)}%`}</span>
        {suffix}
      </span>
    );
  }
  if (diff !== undefined && diff !== null && diff !== 0) {
    const good = invert ? diff < 0 : diff > 0;

    return (
      <span
        className={`${F.mono} text-[0.62rem]`}
        style={{ color: good ? C.green : C.red }}
      >
        <span dir="ltr">{`${diff > 0 ? '+' : '-'}${fmtMAD(Math.abs(diff))} MAD`}</span>
        {suffix}
      </span>
    );
  }

  return null;
}