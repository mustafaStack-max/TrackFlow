import { useEffect, useState } from 'react';

export function useMinutesLeft(expiresAt) {
  const calc = () => Math.max(0, Math.round((new Date(expiresAt).getTime() - Date.now()) / 60000));
  const [left, setLeft] = useState(calc);
  useEffect(() => {
    const t = setInterval(() => setLeft(calc()), 30000);
    return () => clearInterval(t);
  }, [expiresAt]);
  return left;
}

export function useToast(flash) {
  const [toast, setToast] = useState(null);
  useEffect(() => {
    if (flash?.message) {
      setToast(flash);
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [flash?.message]);
  return [toast, setToast];
}