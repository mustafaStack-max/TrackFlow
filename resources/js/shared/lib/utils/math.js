export function pctChange(current, previous, minBase = 0) {
  if (previous === null || previous === undefined) return null;
  if (Math.abs(previous) < minBase) return null;
  return Math.round(((current - previous) / Math.abs(previous)) * 1000) / 10;
}
export function round2(n) {
  return Math.round((Number(n) || 0) * 100) / 100;
}
export function average(values) {
  const nums = values.filter((v) => typeof v === 'number' && !Number.isNaN(v));
  return nums.length ? nums.reduce((s, v) => s + v, 0) / nums.length : 0;
}