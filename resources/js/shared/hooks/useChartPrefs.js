import { useCallback, useEffect, useRef, useState } from 'react';
import { readJson, writeJson } from './useLocalStorage';

const PREFS_KEY = 'tf_chart_prefs';

export const CHART_DEFAULTS = {
  granularity: 'auto',
  curveType: 'monotone',
  showPredictions: false,
  showBudgetCeiling: true,
  budgetCeiling: null, // null = حساب تلقائي
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

function mergePrefs(parsed) {
  return {
    ...CHART_DEFAULTS,
    ...(parsed || {}),
    visibleSeries: {
      ...CHART_DEFAULTS.visibleSeries
      ,...(parsed?.visibleSeries || {}),
    },
  };
}

export function readPrefs() {
  return mergePrefs(readJson(PREFS_KEY, null));
}

export default function useChartPrefs() {
  const [prefs, setPrefsState] = useState(readPrefs);
  const timer = useRef(null);

  const setPrefs = useCallback((updater) => {
    setPrefsState((prev) => {
      const next =
        typeof updater === 'function'
          ? updater(prev)
          : mergePrefs({ ...prev, ...updater });

      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => writeJson(PREFS_KEY, next), 300);

      return next;
    });
  }, []);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  return [prefs, setPrefs];
}