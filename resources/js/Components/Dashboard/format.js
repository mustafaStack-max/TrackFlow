// resources/js/Components/Dashboard/format.js

export function fmtMAD(n, digits = 0) {
    return Number(n || 0).toLocaleString('ar-MA', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

// compact axis label: 12500 -> "12.5K"
export function fmtAxis(n) {
    const v = Number(n || 0);
    const sign = v < 0 ? '-' : '';
    const abs = Math.abs(v);
    return abs >= 1000 ? `${sign}${(abs / 1000).toFixed(1)}K` : `${sign}${abs.toFixed(0)}`;
}

export function fmtPct(n) {
    return `${Math.round(n)}%`;
}
