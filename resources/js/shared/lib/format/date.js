import { AR_MONTHS_SHORT } from '@/shared/lib/theme';

const pad2 = (n) => String(n).padStart(2, '0');

export function toIsoDate(date) {
  const d = date instanceof Date ? date : new Date(date);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function todayIso() {
  return toIsoDate(new Date());
}

export function dayLabel(dateStr) {
  const d = new Date(dateStr);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

export function monthLabel(dateStr) {
  const d = new Date(dateStr);
  return `${AR_MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}


export function nowStamp(locale = 'ar-MA') {
  return new Date().toLocaleString(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}