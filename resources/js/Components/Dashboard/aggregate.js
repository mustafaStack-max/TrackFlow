// resources/js/Components/Dashboard/aggregate.js
import { AR_MONTHS_SHORT } from './theme';

const DAY_MS = 86400000;
const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const endOfDay = (d) => { const x = new Date(d); x.setHours(23, 59, 59, 999); return x; };

/* ★ قوالب الفترات: قصيرة / متوسطة / طويلة / مخصصة */
export const RANGE_DEFS = {
    month:     { label: 'هذا الشهر' },
    lastMonth: { label: 'الشهر الماضي' },
    '30d':     { label: '30 يوم' },
    '90d':     { label: '3 أشهر' },
    '6m':      { label: '6 أشهر' },
    ytd:       { label: 'هذه السنة' },
    '365d':    { label: 'سنة كاملة' },
    all:       { label: 'كل السجل' },
    custom:    { label: 'مخصص' },
};

export const GRANULARITY_DEFS = {
    auto:  { label: 'تلقائي' },
    day:   { label: 'يومي' },
    week:  { label: 'أسبوعي' },
    month: { label: 'شهري' },
    year:  { label: 'سنوي' },
};

function dayLabel(dateStr) { const d = new Date(dateStr); return `${d.getDate()}/${d.getMonth() + 1}`; }
function monthLabel(dateStr) { const d = new Date(dateStr); return `${AR_MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`; }
function weekKey(dateStr) {
    const d = new Date(dateStr);
    const start = new Date(d);
    start.setDate(d.getDate() - d.getDay());
    return start.toISOString().slice(0, 10);
}
const monthKey = (s) => s.slice(0, 7);
const yearKey = (s) => s.slice(0, 4);

/* ★ حدود أي فترة (بما فيها المخصصة) */
export function rangeBounds(series, rangeKey, custom) {
    const now = new Date();
    const last = series.length ? startOfDay(series[series.length - 1].date) : startOfDay(now);
    const first = series.length ? startOfDay(series[0].date) : last;
    let from = first, to = last;

    if (rangeKey === 'month')          { from = new Date(now.getFullYear(), now.getMonth(), 1); }
    else if (rangeKey === 'lastMonth') { from = new Date(now.getFullYear(), now.getMonth() - 1, 1); to = new Date(now.getFullYear(), now.getMonth(), 0); }
    else if (rangeKey === 'ytd')       { from = new Date(now.getFullYear(), 0, 1); }
    else if (rangeKey === 'custom')    {
        if (custom?.from) from = startOfDay(custom.from);
        if (custom?.to) to = startOfDay(custom.to);
    }
    else {
        const days = { '30d': 30, '90d': 90, '6m': 180, '365d': 365 }[rangeKey];
        if (days) from = startOfDay(new Date(last.getTime() - (days - 1) * DAY_MS));
    }
    return { from: startOfDay(from), to: endOfDay(to) };
}

export function applyRange(series, rangeKey, custom) {
    const { from, to } = rangeBounds(series, rangeKey, custom);
    return series.filter((r) => { const d = new Date(r.date); return d >= from && d <= to; });
}

/* ★ الفترة السابقة بنفس الطول (للمقارنة) */
export function previousPeriod(series, rangeKey, custom) {
    const { from, to } = rangeBounds(series, rangeKey, custom);
    const len = to.getTime() - from.getTime();
    const prevTo = new Date(from.getTime() - DAY_MS);
    const prevFrom = new Date(prevTo.getTime() - len);
    return series.filter((r) => { const d = new Date(r.date); return d >= prevFrom && d <= endOfDay(prevTo); });
}

/* ★ تجميع تلقائي حسب كثافة النقاط */
export function autoGranularity(count) {
    if (count <= 45) return 'day';
    if (count <= 140) return 'week';
    if (count <= 420) return 'month';
    return 'year';
}

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
        g.income += r.income; g.expense += r.expense; g.net += r.net;
        g.cumulative = r.cumulative; g.date = r.date;
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

export function projectSeries(points, key, horizon, { minZero = false } = {}) {
    const ys = points.map((p) => p[key] ?? 0);
    const n = ys.length;
    if (n < 2) return Array(horizon).fill(ys[n - 1] ?? 0);
    const xs = ys.map((_, i) => i);
    const xMean = average(xs), yMean = average(ys);
    let num = 0, den = 0;
    xs.forEach((x, i) => { num += (x - xMean) * (ys[i] - yMean); den += (x - xMean) ** 2; });
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
        else if (granularity === 'month') next.setMonth(d.getMonth() + i);
        else next.setFullYear(d.getFullYear() + i);
        const iso = next.toISOString().slice(0, 10);
        out.push({ date: iso, label: granularity === 'day' || granularity === 'week' ? dayLabel(iso) : granularity === 'month' ? monthLabel(iso) : iso.slice(0, 4) });
    }
    return out;
}