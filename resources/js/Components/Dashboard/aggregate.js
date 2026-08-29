// resources/js/Components/Dashboard/aggregate.js
import { AR_MONTHS_SHORT } from './theme';

export const RANGE_DEFS = {
    '7d': { label: '7 أيام', days: 7 },
    '30d': { label: '30 يوم', days: 30 },
    '90d': { label: '3 أشهر', days: 90 },
    '180d': { label: '6 أشهر', days: 180 },
    '365d': { label: 'سنة كاملة', days: 365 },
    all: { label: 'كل السجل', days: null },
};

export const GRANULARITY_DEFS = {
    day: { label: 'يومي' },
    week: { label: 'أسبوعي' },
    month: { label: 'شهري' },
    year: { label: 'سنوي' },
};

function dayLabel(dateStr) {
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1}`;
}
function monthLabel(dateStr) {
    const d = new Date(dateStr);
    return `${AR_MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}
function weekKey(dateStr) {
    const d = new Date(dateStr);
    const day = d.getDay();
    const start = new Date(d);
    start.setDate(d.getDate() - day);
    return start.toISOString().slice(0, 10);
}
function monthKey(dateStr) {
    return dateStr.slice(0, 7);
}
function yearKey(dateStr) {
    return dateStr.slice(0, 4);
}

/** Slice the daily series to the requested range window (from the end). */
export function applyRange(series, rangeKey) {
    const def = RANGE_DEFS[rangeKey] ?? RANGE_DEFS['30d'];
    return def.days ? series.slice(-def.days) : series;
}

/** Re-bucket a daily series into day/week/month/year points. */
export function bucketSeries(series, granularity) {
    if (granularity === 'day' || !series.length) {
        return series.map((r) => ({ ...r, label: dayLabel(r.date) }));
    }

    const keyFn = granularity === 'week' ? weekKey : granularity === 'month' ? monthKey : yearKey;
    const labelFn = granularity === 'week' ? dayLabel : granularity === 'year' ? (d) => d.slice(0, 4) : monthLabel;

    const groups = new Map();
    series.forEach((r) => {
        const k = keyFn(r.date);
        if (!groups.has(k)) groups.set(k, { key: k, income: 0, expense: 0, net: 0, cumulative: 0, date: r.date });
        const g = groups.get(k);
        g.income += r.income;
        g.expense += r.expense;
        g.net += r.net;
        g.cumulative = r.cumulative; // last value in the bucket wins (running total)
        g.date = r.date;
    });

    return Array.from(groups.values()).map((g) => ({
        ...g,
        income: Math.round(g.income * 100) / 100,
        expense: Math.round(g.expense * 100) / 100,
        net: Math.round(g.net * 100) / 100,
        label: labelFn(g.date),
    }));
}

export function average(values) {
    const nums = values.filter((v) => typeof v === 'number' && !Number.isNaN(v));
    return nums.length ? nums.reduce((s, v) => s + v, 0) / nums.length : 0;
}

/** Simple least-squares linear regression, projected `horizon` steps ahead. */
export function projectSeries(points, key, horizon, { minZero = false } = {}) {
    const ys = points.map((p) => p[key] ?? 0);
    const n = ys.length;
    if (n < 2) return Array(horizon).fill(ys[n - 1] ?? 0);

    const xs = ys.map((_, i) => i);
    const xMean = average(xs);
    const yMean = average(ys);
    let num = 0, den = 0;
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

/** Extend a series of date buckets forward by `count` steps for the given granularity. */
export function extendDates(lastDate, granularity, count) {
    const out = [];
    const d = new Date(lastDate);
    for (let i = 1; i <= count; i++) {
        const next = new Date(d);
        if (granularity === 'day') next.setDate(d.getDate() + i);
        else if (granularity === 'week') next.setDate(d.getDate() + i * 7);
        else if (granularity === 'month') next.setMonth(d.getMonth() + i);
        else next.setFullYear(d.getFullYear() + i);
        const iso = next.toISOString().slice(0, 10);
        const label = granularity === 'day' || granularity === 'week' ? dayLabel(iso)
            : granularity === 'month' ? monthLabel(iso) : iso.slice(0, 4);
        out.push({ date: iso, label });
    }
    return out;
}
