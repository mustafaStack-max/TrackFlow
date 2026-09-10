
import { LABEL_FNS } from './bucket';
import { dayLabel } from '@/shared/lib/format';
import { average } from '@/shared/lib/utils';

export function projectSeries(points, key, horizon, { minZero = false } = {}) {
  const ys = points.map((p) => p[key] ?? 0);
  const n = ys.length;

  if (n < 2) return Array(horizon).fill(ys[n - 1] ?? 0);

  const xs = ys.map((_, i) => i);
  const xMean = average(xs);
  const yMean = average(ys);

  let num = 0;
  let den = 0;

  xs.forEach((x, i) => {
    num += (x - xMean) * (ys[i] - yMean);
    den += (x - xMean) ** 2;
  });

  const slope = den === 0 ? 0 : num / den;
  const intercept = yMean - slope * xMean;

  return Array.from({ length: horizon }, (_, i) => {
    const v = intercept + slope * (n + i);
    return minZero ? Math.max(0, Math.round(v)) : Math.round(v);
  });
}

export function extendDates(lastDate, granularity, count) {
  const out = [];
  const d = new Date(lastDate);

  for (let i = 1; i <= count; i++) {
    const next = new Date(d);

    if (granularity === 'day') next.setDate(d.getDate() + i);
    else if (granularity === 'week') next.setDate(d.getDate() + i * 7);
    else if (granularity === '15d') next.setDate(d.getDate() + i * 15);
    else if (granularity === 'month') next.setMonth(d.getMonth() + i);
    else if (granularity === 'quarter') next.setMonth(d.getMonth() + i * 3);
    else next.setFullYear(d.getFullYear() + i);

    const iso = next.toISOString().slice(0, 10);

    out.push({
      date: iso,
      label: (LABEL_FNS[granularity] || dayLabel)(iso),
    });
  }

  return out;
}