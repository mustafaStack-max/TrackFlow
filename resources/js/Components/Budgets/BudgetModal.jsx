import { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { COLORS as C, FONT as F } from '@/Components/Dashboard/theme';
import { fmtMAD } from '@/Components/Dashboard/format';

const IcoClose = (p) => (<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}><path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" /></svg>);
const IcoSparkle = (p) => (<svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor" {...p}><path d="M10 1l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" /></svg>);

export default function BudgetModal({ open, onClose, budget, categories = [] }) {
    const isEdit = !!budget;
    const [suggesting, setSuggesting] = useState(false);
    const [suggestion, setSuggestion] = useState(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        category_id: budget?.is_overall ? '' : (budget?.category_id ?? ''),
        name: budget?.is_overall ? (budget?.name ?? '') : '',
        amount: budget?.amount ?? 2000,
        period: budget?.period ?? 'monthly',
        rollover_enabled: budget?.rollover > 0,
        warn_pct: 80,
        critical_pct: 100,
    });

    useEffect(() => {
        if (!open) return;
        if (budget) {
            setData({
                category_id: budget.is_overall ? '' : (budget.category_id ?? ''),
                name: budget.is_overall ? (budget.name ?? '') : '',
                amount: budget.amount,
                period: budget.period,
                rollover_enabled: budget.rollover > 0,
                warn_pct: 80,
                critical_pct: 100,
            });
        } else {
            reset();
        }
        clearErrors();
        setSuggestion(null);
    }, [open, budget]);

    const fetchSuggestion = async () => {
        if (!data.category_id) return;
        setSuggesting(true);
        try {
            const res = await fetch(`${route('budgets.suggest')}?category_id=${data.category_id}`);
            const j = await res.json();
            setSuggestion(j);
            setData('amount', j.suggested);
        } catch (e) { /* ignore */ }
        setSuggesting(false);
    };

    const submit = (e) => {
        e.preventDefault();
        const payload = {
            ...data,
            category_id: data.category_id || null,
        };
        const opts = { onSuccess: () => onClose(), preserveScroll: true };
        if (isEdit) {
            put(route('budgets.update', budget.id), { ...opts, data: payload });
        } else {
            post(route('budgets.store'), { ...opts, data: payload });
        }
    };

    const selectedCat = categories.find((c) => c.id === Number(data.category_id));

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="w-full max-w-[520px] border shadow-2xl max-h-[90vh] overflow-y-auto"
                style={{ background: C.card, borderColor: C.bHot }}>
                {/* Header */}
                <div className="flex items-center justify-between border-b px-5 py-3" style={{ borderColor: C.b, background: C.card2 }}>
                    <div className={`${F.head} text-[0.85rem] font-bold tracking-[3px] uppercase`} style={{ color: C.green }}>
                        {isEdit ? 'تعديل ميزانية' : 'ميزانية جديدة'}
                    </div>
                    <button type="button" onClick={onClose}
                        className="flex h-7 w-7 items-center justify-center border transition-colors"
                        style={{ borderColor: C.b, color: C.t3 }}
                        onMouseEnter={e => { e.currentTarget.style.color = C.red; e.currentTarget.style.borderColor = `${C.red}66`; }}
                        onMouseLeave={e => { e.currentTarget.style.color = C.t3; e.currentTarget.style.borderColor = C.b; }}>
                        <IcoClose />
                    </button>
                </div>

                <form onSubmit={submit} className="flex flex-col gap-4 p-5">
                    {/* التصنيف */}
                    {!isEdit && (
                        <div className="flex flex-col gap-1.5">
                            <label className={`${F.mono} text-[0.6rem] tracking-[2px] uppercase`} style={{ color: C.t4 }}>
                                // التصنيف
                            </label>
                            <select value={data.category_id}
                                onChange={(e) => { setData('category_id', e.target.value); setSuggestion(null); }}
                                className={`${F.ar} border px-3 py-2.5 text-[0.82rem] outline-none`}
                                style={{ background: C.card2, borderColor: errors.category_id ? C.red : C.b, color: C.t1 }}>
                                <option value="">اختر تصنيفًا...</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                            {errors.category_id && <span className={`${F.mono} text-[0.62rem]`} style={{ color: C.red }}>{errors.category_id}</span>}

                            {data.category_id && (
                                <button type="button" onClick={fetchSuggestion} disabled={suggesting}
                                    className={`${F.mono} mt-1 flex items-center gap-1.5 text-[0.62rem] tracking-[1px] self-start border px-2.5 py-1 transition-colors hover:brightness-125 disabled:opacity-40`}
                                    style={{ borderColor: `${C.amber}66`, color: C.amber, background: `${C.amber}0d` }}>
                                    <IcoSparkle />
                                    {suggesting ? 'جاري الحساب...' : 'اقتراح ذكي (متوسط 3 أشهر)'}
                                </button>
                            )}
                            {suggestion && (
                                <div className={`${F.mono} text-[0.58rem] border p-2`}
                                    style={{ borderColor: `${C.amber}44`, color: C.amber, background: `${C.amber}0d` }}>
                                    آخر 3 أشهر: {suggestion.history.map((v, i) => fmtMAD(v)).join(' · ')} MAD → متوسط: {fmtMAD(suggestion.average)}
                                </div>
                            )}
                        </div>
                    )}

                    {/* اسم الميزانية (للشاملة فقط) */}
                    {!data.category_id && (
                        <div className="flex flex-col gap-1.5">
                            <label className={`${F.mono} text-[0.6rem] tracking-[2px] uppercase`} style={{ color: C.t4 }}>
                                // اسم الميزانية الشاملة
                            </label>
                            <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)}
                                placeholder="مثال: ميزانية المنزل"
                                className={`${F.ar} border px-3 py-2.5 text-[0.82rem] outline-none`}
                                style={{ background: C.card2, borderColor: errors.name ? C.red : C.b, color: C.t1 }} />
                            {errors.name && <span className={`${F.mono} text-[0.62rem]`} style={{ color: C.red }}>{errors.name}</span>}
                        </div>
                    )}

                    {/* الحد */}
                    <div className="flex flex-col gap-1.5">
                        <label className={`${F.mono} text-[0.6rem] tracking-[2px] uppercase`} style={{ color: C.t4 }}>
                            // الحد (MAD)
                        </label>
                        <input type="number" min="1" step="100" value={data.amount}
                            onChange={(e) => setData('amount', e.target.value)}
                            className={`${F.mono} border px-3 py-2.5 text-[1.05rem] outline-none`}
                            style={{ background: C.card2, borderColor: errors.amount ? C.red : C.b, color: selectedCat?.color_hex || C.green }} />
                        {errors.amount && <span className={`${F.mono} text-[0.62rem]`} style={{ color: C.red }}>{errors.amount}</span>}
                    </div>

                    {/* الفترة */}
                    <div className="flex flex-col gap-1.5">
                        <label className={`${F.mono} text-[0.6rem] tracking-[2px] uppercase`} style={{ color: C.t4 }}>
                            // الفترة
                        </label>
                        <div className="grid grid-cols-3 gap-1.5">
                            {[['monthly', 'شهري'], ['weekly', 'أسبوعي'], ['yearly', 'سنوي']].map(([v, l]) => (
                                <button key={v} type="button" onClick={() => setData('period', v)}
                                    className={`${F.ar} border py-2 text-[0.75rem] font-semibold transition-colors`}
                                    style={data.period === v
                                        ? { borderColor: C.green, color: C.void, background: C.green }
                                        : { borderColor: C.b, color: C.t3, background: C.card2 }}>
                                    {l}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Rollover */}
                    <label className="flex items-center justify-between cursor-pointer border p-3"
                        style={{ borderColor: data.rollover_enabled ? `${C.cyan}55` : C.b, background: data.rollover_enabled ? `${C.cyan}0d` : C.card2 }}>
                        <div>
                            <div className={`${F.ar} text-[0.82rem] font-semibold`} style={{ color: C.t1 }}>ترحيل الفائض</div>
                            <div className={`${F.ar} text-[0.65rem] mt-0.5`} style={{ color: C.t4 }}>
                                نقل ما لم تُنفقه إلى الفترة القادمة (بسقف الحد الأساسي)
                            </div>
                        </div>
                        <span className="relative inline-block w-9 h-[18px] border transition-colors"
                            style={{ borderColor: data.rollover_enabled ? C.cyan : C.b, background: data.rollover_enabled ? `${C.cyan}1a` : C.card2 }}>
                            <span className="absolute top-[2px] w-3 h-3 transition-all"
                                style={{ background: data.rollover_enabled ? C.cyan : C.t4, insetInlineStart: data.rollover_enabled ? 'calc(100% - 14px)' : '2px' }} />
                        </span>
                    </label>
                    <input type="hidden" value={data.rollover_enabled ? '1' : '0'}
                        onChange={() => {}} />

                    {/* العتبات */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                            <label className={`${F.mono} text-[0.6rem] tracking-[2px] uppercase`} style={{ color: C.amber }}>
                                // تحذير عند %
                            </label>
                            <input type="number" min="10" max="100" value={data.warn_pct}
                                onChange={(e) => setData('warn_pct', e.target.value)}
                                className={`${F.mono} border px-3 py-2.5 text-[0.85rem] outline-none`}
                                style={{ background: C.card2, borderColor: C.b, color: C.amber }} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className={`${F.mono} text-[0.6rem] tracking-[2px] uppercase`} style={{ color: C.red }}>
                                // حرج عند %
                            </label>
                            <input type="number" min="11" max="200" value={data.critical_pct}
                                onChange={(e) => setData('critical_pct', e.target.value)}
                                className={`${F.mono} border px-3 py-2.5 text-[0.85rem] outline-none`}
                                style={{ background: C.card2, borderColor: errors.critical_pct ? C.red : C.b, color: C.red }} />
                            {errors.critical_pct && <span className={`${F.mono} text-[0.58rem]`} style={{ color: C.red }}>{errors.critical_pct}</span>}
                        </div>
                    </div>

                    <button type="submit" disabled={processing}
                        className={`${F.head} border py-3 text-[0.85rem] font-bold tracking-[3px] uppercase transition-colors hover:brightness-125 disabled:opacity-40`}
                        style={{ borderColor: `${C.green}88`, color: C.green, background: C.greenTrace }}>
                        {processing ? '// جاري الحفظ...' : isEdit ? '// تحديث //' : '// إنشاء //'}
                    </button>
                </form>
            </div>
        </div>
    );
}