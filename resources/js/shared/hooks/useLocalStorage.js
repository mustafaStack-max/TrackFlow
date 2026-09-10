import { useCallback, useState } from 'react';

export function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}


export function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
  
  }
}

export function removeKey(key) {
  try {
    localStorage.removeItem(key);
  } catch {

  }
}

export default function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => readJson(key, initialValue));

  const set = useCallback(
    (updater) => {
      setValue((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        writeJson(key, next);
        return next;
      });
    },
    [key]
  );

  const reset = useCallback(() => {
    removeKey(key);
    setValue(initialValue);
  }, [key, initialValue]);

  return [value, set, reset];
}