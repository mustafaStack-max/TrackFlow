import { useEffect, useRef, useState } from 'react';

/* ============ Toast ============ */
export function useToast(flash) {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  // عرض رسائل الـ flash القادمة من Inertia
  useEffect(() => {
    const f = flash || {};
    const text = f.success || f.error || f.warning || f.info;
    if (!text) return;
    const type = f.error ? 'error' : f.warning ? 'warning' : f.info ? 'info' : 'success';
    setToast({ type, text });
  }, [flash]);

  // إخفاء تلقائي
  useEffect(() => {
    if (!toast) return undefined;
    timerRef.current = setTimeout(() => setToast(null), 4200);
    return () => clearTimeout(timerRef.current);
  }, [toast]);

  // مُوحِّد الشكل: يقبل نصاً أو كائناً، ويستخدم أيضاً كـ notify من الـ Composer
  const push = (t) => {
    if (!t) return setToast(null);
    if (typeof t === 'string') return setToast({ type: 'success', text: t });
    return setToast(t);
  };

  return [toast, push];
}

/* ============ الدقائق المتبقية قبل انتهاء صلاحية الإجراء ============ */
export function useMinutesLeft(expiresAt) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(id);
  }, []);

  // لا توجد صلاحية محددة => لا تعطّل الزر أبداً
  if (!expiresAt) return Infinity;

  let ms;
  if (typeof expiresAt === 'number') {
    ms = expiresAt;
  } else {
    let s = String(expiresAt).trim().replace(' ', 'T');
    // قصّ الكسور الزائدة عن 3 منازل لأمان أكبر
    s = s.replace(/\.(\d{3})\d*/, '.$1');
    // إذا لم توجد إزاحة زمنية (Z أو ±hh:mm) نفترض أن التاريخ UTC كافتراض السيرفر
    const hasTz = /z$/i.test(s) || /[+-]\d{2}:\d{2}$/.test(s);
    if (!hasTz) s += 'Z';
    ms = Date.parse(s);
  }

  // إذا كان الطابع بالثواني (Unix) نحوّله إلى ميلي ثانية
  if (Number.isFinite(ms) && ms < 1e12) ms *= 1000;
  if (!Number.isFinite(ms) || Number.isNaN(ms)) return Infinity;

  return Math.max(0, Math.ceil((ms - now) / 60000));
}