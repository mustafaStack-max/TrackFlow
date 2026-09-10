
export function fmtMAD(n, digits = 0) {
  return Number(n || 0).toLocaleString('ar-MA', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function fmtAxis(n) {
  const v = Number(n || 0);
  const sign = v < 0 ? '-' : '';
  const abs = Math.abs(v);

  if (abs >= 1_000_000) {
    return `${sign}${(abs / 1_000_000).toFixed(1)}M`;
  }

  if (abs >= 1_000) {
    return `${sign}${(abs / 1_000).toFixed(1)}K`;
  }

  return `${sign}${abs.toFixed(0)}`;
}


export function fmtPct(n) {
  return `${Math.round(n)}%`;
}