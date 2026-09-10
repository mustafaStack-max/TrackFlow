import { COLORS as C, FONT as F } from '@/Components/Dashboard/theme';

export default function TrendBadge({
  pct,
  invert = false,
  label = 'عن الفترة السابقة',
}) {
  if (pct === null || pct === undefined) {
    return null;
  }

  const good = invert ? pct <= 0 : pct >= 0;
  const color = good ? C.green : C.red;

  return (
    <span className={`${F.mono} text-[0.62rem]`} style={{ color }}>
      <span dir="ltr">
        {pct >= 0 ? '▲' : '▼'} {Math.abs(pct)}%
      </span>{' '}
      {label}
    </span>
  );
}