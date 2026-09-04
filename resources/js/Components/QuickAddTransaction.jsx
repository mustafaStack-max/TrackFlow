// resources/js/Components/QuickAddTransaction.jsx
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from '@inertiajs/react';
import { COLORS as C, FONT as F } from '@/Components/Dashboard/theme';

const PAYMENT_METHODS = [
    { value: 'cash', label: 'نقدًا' },
    { value: 'card', label: 'بطاقة' },
    { value: 'transfer', label: 'تحويل' },
    { value: 'other', label: 'أخرى' },
];

/* ── icons ── */
const IcoPlus = (p) => (<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><path d="M10 4v12M4 10h12" strokeLinecap="round" /></svg>);
const IcoBolt = (p) => (<svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path d="M11 2L4 11h5l-1 7 7-9h-5l1-7z" strokeLinejoin="round" /></svg>);
const IcoChevron = (p) => (<svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="M5 8l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>);
const IcoSliders = (p) => (<svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><path d="M3 6h14M3 10h14M3 14h14" strokeLinecap="round" /><circle cx="8" cy="6" r="1.8" /><circle cx="13" cy="10" r="1.8" /><circle cx="6" cy="14" r="1.8" /></svg>);
const IcoNote = (p) => (<svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path d="M4 2h9l3 3v13H4V2z" strokeLinejoin="round" /><path d="M7 8h6M7 11h6M7 14h4" strokeLinecap="round" /></svg>);
const IcoLink = (p) => (<svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path d="M8 12l4-4M7 10l-2 2a2.8 2.8 0 0 0 4 4l2-2M13 10l2-2a2.8 2.8 0 0 0-4-4l-2 2" strokeLinecap="round" /></svg>);
const IcoPin = (p) => (<svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path d="M10 18s-6-5.5-6-9.5a6 6 0 0 1 12 0C16 12.5 10 18 10 18z" strokeLinejoin="round" /><circle cx="10" cy="8.5" r="2" /></svg>);
const IcoTag = (p) => (<svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path d="M2 2h8l8 8-8 8-8-8V2z" strokeLinejoin="round" /><circle cx="6.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" /></svg>);

const toInputDatetime = (iso) => {
    const d = iso ? new Date(iso) : new Date();
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

const inputCls = `${F.ar} w-full border px-3 py-2 text-[0.8rem] outline-none transition-colors focus:border-[rgba(0,230,118,0.45)]`;
const inputStyle = { background: C.card2, borderColor: C.b, color: C.t1 };
const Err = ({ msg }) => (msg ? <div className={`${F.mono} text-[0.68rem] mt-1`} style={{ color: C.red }}>{msg}</div> : null);

export default function QuickAddTransaction({ categories = [], accounts = [] }) {
    const [open, setOpen] = useState(false);
    const [showMore, setShowMore] = useState(false);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        type: 'expense',
        category_id: '',
        account_id: '',
        amount: '',
        description: '',
        transaction_date: toInputDatetime(),
        payment_method: 'cash',
        notes: '',
        receipt_url: '',
        location: '',
        tags: '',
    });

    const openModal = () => {
        clearErrors();
        setShowMore(false);
        setData({
            type: 'expense',
            category_id: categories[0]?.id ?? '',
            account_id: accounts[0]?.id ?? '',
            amount: '',
            description: '',
            transaction_date: toInputDatetime(),
            payment_method: 'cash',
            notes: '', receipt_url: '', location: '', tags: '',
        });
        setOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {
            ...data,
            notes: data.notes || null,
            receipt_url: data.receipt_url || null,
            location: data.location || null,
            tags: data.tags ? data.tags.split(/[,،]/).map((s) => s.trim()).filter(Boolean) : [],
        };
        /* ★ preserveState: عند الخطأ النافذة تبقى مفتوحة والأخطاء ظاهرة */
        post(route('transactions.store'), {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => { setOpen(false); reset(); },
        });
    };

    const extraCount = [data.notes, data.receipt_url, data.location, data.tags]
        .filter((v) => v && String(v).trim() !== '').length;

    return (
        <>
            {/* ★ زر الهيدر */}
            <button type="button" onClick={openModal} title="تسجيل عملية سريعة"
                className="flex h-9 items-center gap-2 rounded-md px-3 transition-all hover:brightness-125"
                style={{ border: `1px solid ${C.green}44`, color: C.green, background: C.greenTrace }}>
                <IcoPlus />
                <span className={`${F.ar} hidden sm:inline text-[0.72rem] font-bold`}>عملية سريعة</span>
            </button>

            {/* ★★ النافذة عبر Portal إلى body — وسط الصفحة دائمًا ★★ */}
            {open && createPortal(
                <div className="fixed inset-0 bg-black/85 backdrop-blur-[6px] z-[1000] flex items-center justify-center p-5"
                    onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
                    <div className="w-full max-w-[480px] border shadow-[0_0_80px_rgba(0,230,118,0.1)] max-h-[92vh] overflow-y-auto"
                        style={{ background: C.card, borderColor: C.bHot }}>
                        <div className="flex items-center justify-between px-5 py-[15px] border-b sticky top-0 z-10" style={{ borderColor: C.b, background: C.card2 }}>
                            <div className={`${F.head} text-[0.92rem] font-bold tracking-[3px] uppercase flex items-center gap-2`} style={{ color: C.green }}>
                                <IcoBolt /> عملية سريعة
                            </div>
                            <button type="button" onClick={() => setOpen(false)}
                                className={`${F.mono} w-[30px] h-[30px] flex items-center justify-center border transition-colors hover:border-[rgba(255,61,90,0.3)] hover:text-[#ff3d5a] hover:bg-[rgba(255,61,90,0.1)]`}
                                style={{ borderColor: C.b, color: C.t2 }}>✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
                            {/* TYPE TOGGLE */}
                            <div className="grid grid-cols-2 gap-2">
                                {[{ v: 'expense', l: 'مصروف', c: C.red }, { v: 'income', l: 'دخل', c: C.green }].map((o) => (
                                    <button key={o.v} type="button" onClick={() => setData('type', o.v)}
                                        className={`${F.head} py-2.5 border font-bold text-[0.85rem] transition-colors`}
                                        style={data.type === o.v ? { borderColor: o.c, color: o.c, background: `${o.c}15` } : { borderColor: C.b, color: C.t3 }}>
                                        {o.l}
                                    </button>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={`${F.mono} text-[0.65rem] tracking-[2px] uppercase block mb-1.5`} style={{ color: C.t3 }}>// الفئة</label>
                                    <select value={data.category_id} onChange={(e) => setData('category_id', e.target.value)} className={inputCls} style={inputStyle} required>
                                        <option value="" disabled>اختر فئة</option>
                                        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                    <Err msg={errors.category_id} />
                                </div>
                                <div>
                                    <label className={`${F.mono} text-[0.65rem] tracking-[2px] uppercase block mb-1.5`} style={{ color: C.t3 }}>// الحساب</label>
                                    <select value={data.account_id} onChange={(e) => setData('account_id', e.target.value)} className={inputCls} style={inputStyle} required>
                                        <option value="" disabled>اختر حساب</option>
                                        {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                                    </select>
                                    <Err msg={errors.account_id} />
                                </div>
                            </div>

                            <div>
                                <label className={`${F.mono} text-[0.65rem] tracking-[2px] uppercase block mb-1.5`} style={{ color: C.t3 }}>// المبلغ (MAD)</label>
                                <input type="number" min="0" step="0.01" value={data.amount} onChange={(e) => setData('amount', e.target.value)}
                                    placeholder="0.00" className={inputCls}
                                    style={{ ...inputStyle, fontFamily: 'Share Tech Mono', color: data.type === 'income' ? C.green : C.red, fontSize: '1rem', borderColor: errors.amount ? C.red : C.b }} required />
                                <Err msg={errors.amount} />
                            </div>

                            <div>
                                <label className={`${F.mono} text-[0.65rem] tracking-[2px] uppercase block mb-1.5`} style={{ color: C.t3 }}>// الوصف</label>
                                <input type="text" value={data.description} onChange={(e) => setData('description', e.target.value)}
                                    placeholder="مثال: تسوق أسبوعي..." className={inputCls} style={{ ...inputStyle, borderColor: errors.description ? C.red : C.b }} />
                                <Err msg={errors.description} />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={`${F.mono} text-[0.65rem] tracking-[2px] uppercase block mb-1.5`} style={{ color: C.t3 }}>// التاريخ</label>
                                    <input type="datetime-local" value={data.transaction_date} onChange={(e) => setData('transaction_date', e.target.value)}
                                        className={inputCls} style={{ ...inputStyle, fontFamily: 'Share Tech Mono', borderColor: errors.transaction_date ? C.red : C.b }} required />
                                    <Err msg={errors.transaction_date} />
                                </div>
                                <div>
                                    <label className={`${F.mono} text-[0.65rem] tracking-[2px] uppercase block mb-1.5`} style={{ color: C.t3 }}>// الدفع</label>
                                    <select value={data.payment_method} onChange={(e) => setData('payment_method', e.target.value)} className={inputCls} style={inputStyle}>
                                        {PAYMENT_METHODS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* ★ خيارات إضافية */}
                            <button type="button" onClick={() => setShowMore(v => !v)}
                                className="flex w-full items-center justify-between rounded-md border px-3.5 py-2.5 transition-colors"
                                style={{
                                    borderColor: showMore ? `${C.green}55` : C.b,
                                    background: showMore ? C.greenTrace : C.card2,
                                    color: showMore ? C.green : C.t2,
                                }}>
                                <span className="flex items-center gap-2 text-[0.78rem] font-semibold">
                                    <IcoSliders /> خيارات إضافية
                                    {extraCount > 0 && (
                                        <span className={`${F.mono} flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[0.58rem] font-bold`}
                                            style={{ background: C.green, color: C.void }}>{extraCount}</span>
                                    )}
                                </span>
                                <span className="transition-transform duration-300" style={{ transform: showMore ? 'rotate(180deg)' : 'none' }}>
                                    <IcoChevron />
                                </span>
                            </button>

                            <div className="grid transition-all duration-300 ease-out"
                                style={{ gridTemplateRows: showMore ? '1fr' : '0fr', opacity: showMore ? 1 : 0 }} aria-hidden={!showMore}>
                                <div className="overflow-hidden">
                                    <div className="flex flex-col gap-4 rounded-md border p-4" style={{ borderColor: C.b, background: C.card2 }}>
                                        <div>
                                            <label className={`${F.ar} flex items-center gap-1.5 text-[0.72rem] font-semibold mb-1.5`} style={{ color: C.t2 }}>
                                                <span style={{ color: C.t4 }}><IcoNote /></span> ملاحظات
                                            </label>
                                            <textarea value={data.notes} onChange={(e) => setData('notes', e.target.value)} rows={2}
                                                className={`${inputCls} resize-none`} style={{ ...inputStyle, borderColor: errors.notes ? C.red : C.b }} />
                                            <Err msg={errors.notes} />
                                        </div>
                                        <div>
                                            <label className={`${F.ar} flex items-center gap-1.5 text-[0.72rem] font-semibold mb-1.5`} style={{ color: C.t2 }}>
                                                <span style={{ color: C.t4 }}><IcoLink /></span> رابط الفاتورة
                                            </label>
                                            <input type="url" dir="ltr" value={data.receipt_url} onChange={(e) => setData('receipt_url', e.target.value)}
                                                placeholder="https://..." className={`${inputCls} text-left`}
                                                style={{ ...inputStyle, fontFamily: 'Share Tech Mono', borderColor: errors.receipt_url ? C.red : C.b }} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className={`${F.ar} flex items-center gap-1.5 text-[0.72rem] font-semibold mb-1.5`} style={{ color: C.t2 }}>
                                                    <span style={{ color: C.t4 }}><IcoPin /></span> الموقع
                                                </label>
                                                <input type="text" value={data.location} onChange={(e) => setData('location', e.target.value)}
                                                    className={inputCls} style={{ ...inputStyle, borderColor: errors.location ? C.red : C.b }} />
                                            </div>
                                            <div>
                                                <label className={`${F.ar} flex items-center gap-1.5 text-[0.72rem] font-semibold mb-1.5`} style={{ color: C.t2 }}>
                                                    <span style={{ color: C.t4 }}><IcoTag /></span> وسوم
                                                </label>
                                                <input type="text" value={data.tags} onChange={(e) => setData('tags', e.target.value)}
                                                    placeholder="افصل بفاصلة: عمل، ضروري" className={inputCls}
                                                    style={{ ...inputStyle, borderColor: errors.tags ? C.red : C.b }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button type="submit" disabled={processing}
                                className={`${F.head} border p-3 text-[0.92rem] font-bold tracking-[3px] uppercase transition-colors w-full disabled:opacity-40 disabled:cursor-not-allowed`}
                                style={{ borderColor: C.green, color: C.green }}>
                                {processing ? '// جاري الحفظ...' : '// حفظ العملية //'}
                            </button>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}