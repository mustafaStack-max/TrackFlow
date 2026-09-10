import { useCallback, useEffect, useState } from 'react';
import { readJson, removeKey, writeJson } from './useLocalStorage';

const RANGE_KEY = 'tf_chart_range';
const CUSTOM_KEY = 'tf_chart_range_custom';

export function readRange() {
  try {
    return localStorage.getItem(RANGE_KEY) || 'month';
  } catch {
    return 'month';
  }
}

export function readCustomRange() {
  return readJson(CUSTOM_KEY, null);
}

export function writeRange(range, custom = null) {
  try {
    localStorage.setItem(RANGE_KEY, range);

    if (range === 'custom' && custom) {
      writeJson(CUSTOM_KEY, custom);
    } else {
      removeKey(CUSTOM_KEY);
    }
  } catch {
    /* تجاهل امتلاء المساحة */
  }
}
export default function useRangeSelection({
  initialRange = 'month',
  initialCustom = null,
  onChange,
} = {}) {
  const [range, setRange] = useState(initialRange);
  const [custom, setCustom] = useState(initialCustom);

  useEffect(() => {
    setRange(initialRange);
  }, [initialRange]);

  useEffect(() => {
    setCustom(initialCustom);
  }, [initialCustom]);

  const change = useCallback(
    (nextRange, nextCustom = null) => {
      setRange(nextRange);
      setCustom(nextCustom);
      writeRange(nextRange, nextCustom);
      onChange?.(nextRange, nextCustom);
    },
    [onChange]
  );

  return { range, custom, change };
}