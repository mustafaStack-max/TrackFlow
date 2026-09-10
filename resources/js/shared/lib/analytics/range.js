const DAY_MS = 86400000;

export const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

export const endOfDay = (d) => {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
};


export const RANGE_DEFS = {
  month: { label: 'هذا الشهر' },
  lastMonth: { label: 'الشهر الماضي' },
  '30d': { label: '30 يوم' },
  '90d': { label: '3 أشهر' },
  '6m': { label: '6 أشهر' },
  ytd: { label: 'هذه السنة' },
  '365d': { label: 'سنة كاملة' },
  all: { label: 'كل السجل' },
  custom: { label: 'مخصص' },
};



/* ═══ حساب حدود فترة معينة ═══ */
export function rangeBounds(series, rangeKey, custom) {
  const now = new Date();
  const last = series.length
    ? startOfDay(series[series.length - 1].date)
    : startOfDay(now);
  const first = series.length ? startOfDay(series[0].date) : last;

  let from = first;
  let to = last;

  if (rangeKey === 'month') {
    from = new Date(now.getFullYear(), now.getMonth(), 1);
  } else if (rangeKey === 'lastMonth') {
    from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    to = new Date(now.getFullYear(), now.getMonth(), 0);
  } else if (rangeKey === 'ytd') {
    from = new Date(now.getFullYear(), 0, 1);
  } else if (rangeKey === 'custom') {
    if (custom?.from) from = startOfDay(custom.from);
    if (custom?.to) to = startOfDay(custom.to);
  } else {
    const days = { '30d': 30, '90d': 90, '6m': 180, '365d': 365 }[rangeKey];
    if (days) from = startOfDay(new Date(last.getTime() - (days - 1) * DAY_MS));
  }

  return { from: startOfDay(from), to: endOfDay(to) };
}

/* ═══ فلترة السلسلة حسب الفترة ═══ */
export function applyRange(series, rangeKey, custom) {
  const { from, to } = rangeBounds(series, rangeKey, custom);
  return series.filter((r) => {
    const d = new Date(r.date);
    return d >= from && d <= to;
  });
}

/* ═══ الفترة السابقة (للمقارنة) ═══ */
export function previousPeriod(series, rangeKey, custom) {
  const { from, to } = rangeBounds(series, rangeKey, custom);
  const len = to.getTime() - from.getTime();
  const prevTo = new Date(from.getTime() - DAY_MS);
  const prevFrom = new Date(prevTo.getTime() - len);
  return series.filter((r) => {
    const d = new Date(r.date);
    return d >= prevFrom && d <= endOfDay(prevTo);
  });
}
