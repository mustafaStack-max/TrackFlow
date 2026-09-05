// resources/js/Components/Dashboard/useChartPrefs.js
import { useState, useCallback, useEffect, useRef } from 'react';

const PREFS_KEY = 'tf_chart_prefs';
const RANGE_KEY = 'tf_chart_range';
const CUSTOM_KEY = 'tf_chart_range_custom';

/* ═══ الإعدادات الافتراضية ═══ */
export const CHART_DEFAULTS = {
    granularity: 'auto',
    curveType: 'monotone',
    showPredictions: false,
    showBudgetCeiling: true,
    budgetCeiling: null,           // null = حساب تلقائي
    showAverageLines: false,
    showBrush: false,
    showDots: false,
    showPeaks: false,
    visibleSeries: {
        income: true,
        expense: true,
        net: true,
        cumulative: true,
    },
};

/* ═══ قراءة / كتابة الإعدادات ═══ */
export function readPrefs() {
    try {
        const raw = localStorage.getItem(PREFS_KEY);
        if (!raw) return { ...CHART_DEFAULTS };
        const parsed = JSON.parse(raw);
        // دمج عميق لـ visibleSeries
        return {
            ...CHART_DEFAULTS,
            ...parsed,
            visibleSeries: { ...CHART_DEFAULTS.visibleSeries, ...(parsed.visibleSeries || {}) },
        };
    } catch {
        return { ...CHART_DEFAULTS };
    }
}

export function writePrefs(prefs) {
    try {
        localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    } catch { /* quota exceeded — تجاهل */ }
}

/* ═══ قراءة / كتابة المدة الزمنية ═══ */
export function readRange() {
    try { return localStorage.getItem(RANGE_KEY) || 'month'; } catch { return 'month'; }
}
export function writeRange(range, custom = null) {
    try {
        localStorage.setItem(RANGE_KEY, range);
        if (range === 'custom' && custom) {
            localStorage.setItem(CUSTOM_KEY, JSON.stringify(custom));
        } else {
            localStorage.removeItem(CUSTOM_KEY);
        }
    } catch { /* ignore */ }
}
export function readCustomRange() {
    try {
        const raw = localStorage.getItem(CUSTOM_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch { return null; }
}

/* ═══ Hook للإعدادات البصرية (مع debounce) ═══ */
export function useChartPrefs() {
    const [prefs, setPrefsState] = useState(() => readPrefs());
    const timer = useRef(null);

    const setPrefs = useCallback((updater) => {
        setPrefsState((prev) => {
            const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
            if (timer.current) clearTimeout(timer.current);
            timer.current = setTimeout(() => writePrefs(next), 300);
            return next;
        });
    }, []);

    useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

    return [prefs, setPrefs];
}