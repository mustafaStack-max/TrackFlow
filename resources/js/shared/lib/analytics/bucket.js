import { AR_MONTHS_SHORT } from '@/shared/lib/theme';
import { dayLabel, monthLabel } from '@/shared/lib/format';

export const GRANULARITY_DEFS = {
  auto: { label: 'تلقائي' },
  day: { label: 'يومي' },
  week: { label: 'أسبوعي' },
  '15d': { label: 'نصف شهري' },
  month: { label: 'شهري' },
  quarter: { label: 'ربع سنوي' },
  year: { label: 'سنوي' },
};

export function autoGranularity(count) {
  if (count <= 45) return 'day';
  if (count <= 140) return 'week';
  if (count <= 420) return 'month';
  return 'year';
}
function weekKey(dateStr) {
  const d = new Date(dateStr);
  const start = new Date(d);
  start.setDate(d.getDate() - d.getDay());
  return start.toISOString().slice(0, 10);
}

const monthKey = (s) => s.slice(0, 7);
const yearKey = (s) => s.slice(0, 4);

function halfMonthKey(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate() <= 15 ? 'A' : 'B'}`;
}

function quarterKey(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-Q${Math.floor(d.getMonth() / 3) + 1}`;
}

function halfMonthLabel(dateStr) {
  const d = new Date(dateStr);
  const half = d.getDate() <= 15 ? '1-15' : '16-31';
  return `${half} ${AR_MONTHS_SHORT[d.getMonth()]}`;
}

function quarterLabel(dateStr) {
  const d = new Date(dateStr);
  return `ر${Math.floor(d.getMonth() / 3) + 1} ${d.getFullYear()}`;
}

const KEY_FNS = {
  week: weekKey,
  '15d': halfMonthKey,
  month: monthKey,
  quarter: quarterKey,
  year: yearKey,
};

export const LABEL_FNS = {
  week: dayLabel,
  '15d': halfMonthLabel,
  month: monthLabel,
  quarter: quarterLabel,
  year: (s) => s.slice(0, 4),
};

const round2 = (n) => Math.round(n * 100) / 100;

export function bucketSeries(series, granularity) {
  if (granularity === 'day' || !series.length) {
    return series.map((r) => ({ ...r, label: dayLabel(r.date) }));
  }

  const keyFn = KEY_FNS[granularity] || monthKey;
  const labelFn = LABEL_FNS[granularity] || monthLabel;
  const groups = new Map();

  series.forEach((r) => {
    const k = keyFn(r.date);

    if (!groups.has(k)) {
      groups.set(k, {
        key: k,
        income: 0,
        expense: 0,
        net: 0,
        cumulative: 0,
        date: r.date,
      });
    }

    const g = groups.get(k);
    g.income += r.income;
    g.expense += r.expense;
    g.net += r.net;
    g.cumulative = r.cumulative;
    g.date = r.date;
  });

  return Array.from(groups.values()).map((g) => ({
    ...g,
    income: round2(g.income),
    expense: round2(g.expense),
    net: round2(g.net),
    label: labelFn(g.date),
  }));
}

export function bucketStocks(points, granularity, keys) {
  if (!points.length) return [];

  if (granularity === 'day') {
    return points.map((p) => ({ ...p, label: dayLabel(p.date) }));
  }

  const keyFn = KEY_FNS[granularity] || monthKey;
  const labelFn = LABEL_FNS[granularity] || monthLabel;
  const groups = new Map();

  points.forEach((p) => {
    groups.set(keyFn(p.date), p);
  });

  return Array.from(groups.values()).map((p) => {
    const out = { key: keyFn(p.date), date: p.date, label: labelFn(p.date) };

    keys.forEach((k) => {
      out[k] = p[k];
    });

    return out;
  });
}