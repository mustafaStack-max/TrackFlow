import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { COLORS as C, FONT as F } from '@/shared/lib/theme';
import { QUICK_QUESTIONS } from './constants';
import { IcoSend, IcoImage, IcoX } from './icons';

export default function ChatComposer({ active, sending, onSend, notify }) {
  const [input, setInput] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const taRef = useRef(null);

  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 130)}px`;
  }, [input]);

  if (!active) return null;

  const clearImage = () => {
    if (preview) URL.revokeObjectURL(preview);
    setImage(null);
    setPreview(null);
  };

  const pick = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return notify?.({ success: false, message: 'الملف يجب أن يكون صورة' });
    if (file.size > 5 * 1024 * 1024) return notify?.({ success: false, message: 'حجم الصورة يجب أن يكون أقل من 5 ميجابايت' });
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const submit = () => {
    if ((!input.trim() && !image) || sending) return;
    const payload = { text: input.trim(), file: image };
    setInput('');
    clearImage();
    onSend(payload);
  };

  return (
    <>
      <div className="flex gap-1.5 overflow-x-auto border-t px-3 py-2" style={{ borderColor: C.b, background: C.card2 }}>
        {QUICK_QUESTIONS.map((q) => (
          <button key={q} type="button" disabled={sending} onClick={() => { setInput(q); taRef.current?.focus(); }} className={`${F.ar} whitespace-nowrap border px-2.5 py-1 text-[0.6rem] transition-colors hover:bg-white/[0.05] disabled:opacity-40`} style={{ borderColor: C.b, color: C.t3, background: C.card }}>
            {q}
          </button>
        ))}
      </div>

      <div className="border-t p-3" style={{ borderColor: C.b }}>
        <AnimatePresence>
          {preview && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-2 overflow-hidden">
              <div className="flex items-center gap-2 border p-2" style={{ borderColor: C.b, background: C.card2 }}>
                <img src={preview} alt="معاينة" className="h-14 w-14 border object-cover" style={{ borderColor: C.b }} />
                <div className="flex-1">
                  <div className={`${F.ar} text-[0.68rem] font-semibold`} style={{ color: C.t1 }}>📷 صورة مرفقة</div>
                  <div className={`${F.mono} text-[0.55rem]`} style={{ color: C.t4 }}>{(image.size / 1024).toFixed(1)} KB</div>
                </div>
                <button type="button" onClick={clearImage} className="border p-1 hover:bg-red-500/10" style={{ borderColor: `${C.red}44`, color: C.red }}>
                  <IcoX width={10} height={10} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-end gap-2 border p-2" style={{ borderColor: C.b, background: C.card2 }}>
          <label className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center border transition-colors hover:bg-white/[0.05]" style={{ borderColor: C.b, color: C.t3 }} title="رفع صورة فاتورة أو إيصال">
            <IcoImage />
            <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
          </label>
          <textarea
            ref={taRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }}
            placeholder={image ? 'أضف وصفاً اختيارياً للصورة...' : 'اكتب سؤالك المالي هنا...'}
            className={`${F.ar} flex-1 resize-none bg-transparent text-[0.76rem] leading-relaxed outline-none`}
            style={{ color: C.t1 }}
          />
          <button type="button" onClick={submit} disabled={sending || (!input.trim() && !image)} className="flex shrink-0 items-center gap-1.5 border px-4 py-2 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-30" style={{ borderColor: C.green, background: C.green, color: C.void, boxShadow: input.trim() || image ? `0 0 14px ${C.green}55` : 'none' }}>
            <IcoSend />
            <span className={`${F.ar} text-[0.68rem] font-bold`}>إرسال</span>
          </button>
        </div>
        <div className={`${F.mono} mt-1.5 flex justify-between text-[0.5rem]`} style={{ color: C.t4 }}>
          <span>ENTER = SEND // SHIFT+ENTER = NEW LINE // 📷 = RECEIPT SCAN</span>
          <span>{input.length}/2000</span>
        </div>
      </div>
    </>
  );
}