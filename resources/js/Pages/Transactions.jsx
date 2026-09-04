// resources/js/Pages/Transactions.jsx
import { useEffect, useMemo, useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { COLORS as C, FONT as F } from '@/Components/Dashboard/theme';
import { fmtMAD } from '@/Components/Dashboard/format';

const PAGE_SIZE = 12;
const PAYMENT_METHODS = [
    { value: 'cash', label: 'نقدًا' },
    { value: 'card', label: 'بطاقة' },
    { value: 'transfer', label: 'تحويل' },
    { value: 'other', label: 'أخرى' },
];

/* ── icons ── */
const IcoPlus = (p) => (<svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><line x1="10" y1="3" x2="10" y2="17" strokeLinecap="round" /><line x1="3" y1="10" x2="17" y2="10" strokeLinecap="round" /></svg>);
const IcoEdit = (p) => (<svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.3" {...p}><path d="M14 2l4 4-10 10H4v-4L14 2z" strokeLinejoin="round" /></svg>);
const IcoDel = (p) => (<svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><polyline points="4,6 16,6" strokeLinecap="round" /><path d="M8 6V4h4v2" strokeWidth="1.3" strokeLinecap="round" /><path d="M5 6l1 11h8l1-11" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>);
const IcoSearch = (p) => (<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><circle cx="9" cy="9" r="6" /><line x1="17" y1="17" x2="13.5" y2="13.5" strokeLinecap="round" /></svg>);
const IcoReset = (p) => (<svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path d="M4 10a6 6 0 1 1 2 4.5" strokeLinecap="round" /><path d="M4 14v-4h4" strokeLinecap="round" strokeLinejoin="round" /></svg>);
const IcoChevron = (p) => (<svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="M5 8l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>);
const IcoSliders = (p) => (<svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><path d="M3 6h14M3 10h14M3 14h14" strokeLinecap="round" /><circle cx="8" cy="6" r="1.8" /><circle cx="13" cy="10" r="1.8" /><circle cx="6" cy="14" r="1.8" /></svg>);
const IcoLink = (p) => (<svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path d="M8 12l4-4M7 10l-2 2a2.8 2.8 0 0 0 4 4l2-2M13 10l2-2a2.8 2.8 0 0 0-4-4l-2 2" strokeLinecap="round" strokeLinejoin="round" /></svg>);
const IcoPin = (p) => (<svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path d="M10 18s-6-5.5-6-9.5a6 6 0 0 1 12 0C16 12.5 10 18 10 18z" strokeLinejoin="round" /><circle cx="10" cy="8.5" r="2" /></svg>);
const IcoTag = (p) => (<svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path d="M2 2h8l8 8-8 8-8-8V2z" strokeLinejoin="round" /><circle cx="6.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" /></svg>);
const IcoNote = (p) => (<svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path d="M4 2h9l3 3v13H4V2z" strokeLinejoin="round" /><path d="M7 8h6M7 11h6M7 14h4" strokeLinecap="round" /></svg>);

function fmtDate(iso) {
    const d = new Date(iso);
    const p = (n) => String(n).padStart(2, '0');
    return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
}
function toInputDatetime(iso) {
    const d = iso ? new Date(iso) : new Date();
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

const inputCls = `${F.ar} w-full border px-3 py-2 text-[0.8rem] outline-none transition-colors focus:border-[rgba(0,230,118,0.45)]`;
const inputStyle = { background: C.card2, borderColor: C.b, color: C.t1 };
/* ★ سطر الخطأ الموحّد */
const Err = ({ msg }) => msg ? <div className={`${F.mono} text-[0.68rem] mt-1`} style={{ color: C.red }}>{msg}</div> : null;

export default function Transactions({ transactions = [], categories = [], accounts = [] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [showMore, setShowMore] = useState(false);
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState({ q: '', type: 'all', category: 'all', account: 'all', from: '', to: '' });

    const setFilter = (k, v) => { setFilters((f) => ({ ...f, [k]: v })); setPage(1); };
    const resetFilters = () => { setFilters({ q: '', type: 'all', category: 'all', account: 'all', from: '', to: '' }); setPage(1); };

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        type: 'expense',
        category_id: '',
        account_id: '',
        amount: '',
        description: '',
        transaction_date: toInputDatetime(),
        payment_method: 'cash',
        /* ★ الحقول الإضافية */
        notes: '',
        receipt_url: '',
        location: '',
        tags: '',   // نص في الواجهة → يُحوَّل لمصفوفة عند الإرسال
    });

    /* ★ فتح القسم تلقائيًا إن رجع خطأ من لارافل داخل الحقول الإضافية */
    useEffect(() => {
        if (errors.notes || errors.receipt_url || errors.location || errors.tags) setShowMore(true);
    }, [errors]);

    const extraCount = [data.notes, data.receipt_url, data.location, data.tags]
        .filter((v) => v && String(v).trim() !== '').length;

    const filtered = useMemo(() => {
        return transactions.filter((t) => {
            if (filters.type !== 'all' && t.type !== filters.type) return false;
            if (filters.category !== 'all' && String(t.category_id) !== filters.category) return false;
            if (filters.account !== 'all' && String(t.account_id) !== filters.account) return false;
            if (filters.q && !(t.description || '').toLowerCase().includes(filters.q.toLowerCase())) return false;
            const txDate = new Date(t.transaction_date);
            if (filters.from && txDate < new Date(filters.from)) return false;
            if (filters.to && txDate > new Date(`${filters.to}T23:59:59`)) return false;
            return true;
        });
    }, [transactions, filters]);

    const totals = useMemo(() => {
        const income = filtered.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
        const expense = filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
        return { income, expense, net: income - expense, count: filtered.length };
    }, [filtered]);

    const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const openCreateModal = () => {
        setEditing(null);
        setShowMore(false);
        reset();
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
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (t) => {
        setEditing(t);
        setData({
            type: t.type,
            category_id: t.category_id,
            account_id: t.account_id,
            amount: t.amount,
            description: t.description || '',
            transaction_date: toInputDatetime(t.transaction_date),
            payment_method: t.payment_method || 'cash',
            notes: t.notes || '',
            receipt_url: t.receipt_url || '',
            location: t.location || '',
            /* ★ مصفوفة ← نص للعرض في الحقل */
            tags: Array.isArray(t.tags) ? t.tags.join('، ') : (t.tags ?? ''),
        });
        setShowMore(!!(t.notes || t.receipt_url || t.location || (Array.isArray(t.tags) && t.tags.length)));
        clearErrors();
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        /* ★ الوسوم تُرسل كمصفوفة حقيقية */
        const payload = {
            type: data.type,
            category_id: data.category_id,
            account_id: data.account_id,
            amount: data.amount,
            description: data.description,
            transaction_date: data.transaction_date,
            payment_method: data.payment_method,
            notes: data.notes || null,
            receipt_url: data.receipt_url || null,
            location: data.location || null,
            tags: data.tags
                ? data.tags.split(/[,،]/).map((s) => s.trim()).filter(Boolean)
                : [],
        };
        const opts = { onSuccess: () => setIsModalOpen(false) };
        if (editing) put(route('transactions.update', editing.id), { ...opts, data: payload });
        else post(route('transactions.store'), { ...opts, data: payload });
    };

    const handleDelete = (id) => {
        if (confirm('هل تريد حذف هذه المعاملة؟')) destroy(route('transactions.destroy', id));
    };

    return (
        <AuthenticatedLayout>
            <Head title="إدارة المعاملات" />
            <div dir="rtl" className="flex flex-col gap-5">
                {/* HEADER */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <div className={`${F.head} text-[1.3rem] font-bold tracking-[3px] uppercase`} style={{ color: C.t1 }}>
                            إدارة <em className="not-italic" style={{ color: C.green }}>المعاملات</em>
                        </div>
                        <div className={`${F.mono} text-[0.72rem] tracking-[2px] mt-1`} style={{ color: C.t4 }}>
                            // TRANSACTIONS LEDGER // INCOME + EXPENSE
                        </div>
                    </div>
                    <button type="button" onClick={openCreateModal}
                        className={`${F.head} flex items-center gap-1.5 border px-[16px] py-[7px] text-[0.82rem] font-bold tracking-[1.5px] uppercase transition-colors hover:bg-[#00e676] hover:text-[#040507]`}
                        style={{ borderColor: C.green, color: C.green }}>
                        <IcoPlus /> عملية جديدة
                    </button>
                </div>

                {/* SUMMARY BAR */}
                <div className="border px-5 py-4 flex flex-wrap items-center gap-6" style={{ background: C.card, borderColor: C.b }}>
                    <div>
                        <div className={`${F.mono} text-[0.58rem] tracking-[2px] mb-1`} style={{ color: C.t4 }}>الدخل (المعروض)</div>
                        <div className={`${F.mono} text-[1.15rem]`} style={{ color: C.green }}>{fmtMAD(totals.income)} MAD</div>
                    </div>
                    <div>
                        <div className={`${F.mono} text-[0.58rem] tracking-[2px] mb-1`} style={{ color: C.t4 }}>المصروف (المعروض)</div>
                        <div className={`${F.mono} text-[1.15rem]`} style={{ color: C.red }}>{fmtMAD(totals.expense)} MAD</div>
                    </div>
                    <div>
                        <div className={`${F.mono} text-[0.58rem] tracking-[2px] mb-1`} style={{ color: C.t4 }}>الصافي</div>
                        <div className={`${F.mono} text-[1.15rem]`} style={{ color: totals.net >= 0 ? C.amber : C.red }}>{fmtMAD(totals.net)} MAD</div>
                    </div>
                    <div>
                        <div className={`${F.mono} text-[0.58rem] tracking-[2px] mb-1`} style={{ color: C.t4 }}>عدد العمليات</div>
                        <div className={`${F.mono} text-[1.15rem]`} style={{ color: C.cyan }}>{totals.count}</div>
                    </div>
                </div>

                {/* FILTER TOOLBAR */}
                <div className="border p-4 flex flex-wrap items-end gap-3" style={{ background: C.card, borderColor: C.b }}>
                    <div className="flex-1 min-w-[180px]">
                        <label className={`${F.mono} text-[0.6rem] tracking-[1.5px] block mb-1.5`} style={{ color: C.t3 }}>بحث بالوصف</label>
                        <div className="relative">
                            <span className="absolute top-1/2 right-3 -translate-y-1/2" style={{ color: C.t4 }}><IcoSearch /></span>
                            <input type="text" value={filters.q} onChange={(e) => setFilter('q', e.target.value)}
                                placeholder="مثال: سوبرماركت..." className={`${inputCls} pr-9`} style={inputStyle} />
                        </div>
                    </div>
                    <div className="min-w-[130px]">
                        <label className={`${F.mono} text-[0.6rem] tracking-[1.5px] block mb-1.5`} style={{ color: C.t3 }}>النوع</label>
                        <select value={filters.type} onChange={(e) => setFilter('type', e.target.value)} className={inputCls} style={inputStyle}>
                            <option value="all">الكل</option>
                            <option value="income">دخل</option>
                            <option value="expense">مصروف</option>
                        </select>
                    </div>
                    <div className="min-w-[150px]">
                        <label className={`${F.mono} text-[0.6rem] tracking-[1.5px] block mb-1.5`} style={{ color: C.t3 }}>الفئة</label>
                        <select value={filters.category} onChange={(e) => setFilter('category', e.target.value)} className={inputCls} style={inputStyle}>
                            <option value="all">كل الفئات</option>
                            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="min-w-[150px]">
                        <label className={`${F.mono} text-[0.6rem] tracking-[1.5px] block mb-1.5`} style={{ color: C.t3 }}>الحساب</label>
                        <select value={filters.account} onChange={(e) => setFilter('account', e.target.value)} className={inputCls} style={inputStyle}>
                            <option value="all">كل الحسابات</option>
                            {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                    </div>
                    <div className="min-w-[130px]">
                        <label className={`${F.mono} text-[0.6rem] tracking-[1.5px] block mb-1.5`} style={{ color: C.t3 }}>من تاريخ</label>
                        <input type="date" value={filters.from} onChange={(e) => setFilter('from', e.target.value)} className={inputCls} style={inputStyle} />
                    </div>
                    <div className="min-w-[130px]">
                        <label className={`${F.mono} text-[0.6rem] tracking-[1.5px] block mb-1.5`} style={{ color: C.t3 }}>إلى تاريخ</label>
                        <input type="date" value={filters.to} onChange={(e) => setFilter('to', e.target.value)} className={inputCls} style={inputStyle} />
                    </div>
                    <button type="button" onClick={resetFilters}
                        className={`${F.head} flex items-center gap-1.5 border px-3 py-2 text-[0.75rem] font-semibold transition-colors hover:border-[rgba(255,61,90,0.3)] hover:text-[#ff3d5a]`}
                        style={{ borderColor: C.b, color: C.t3 }}>
                        <IcoReset /> إعادة تعيين
                    </button>
                </div>

                {/* TABLE */}
                <div className="border overflow-hidden" style={{ background: C.card, borderColor: C.b }}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead>
                                <tr className={`${F.mono} text-[0.62rem] tracking-[1px]`} style={{ background: C.card2, color: C.t3 }}>
                                    <th className="px-4 py-2.5 font-normal">#</th>
                                    <th className="px-4 py-2.5 font-normal">الوصف</th>
                                    <th className="px-4 py-2.5 font-normal">النوع</th>
                                    <th className="px-4 py-2.5 font-normal">الفئة</th>
                                    <th className="px-4 py-2.5 font-normal">الحساب</th>
                                    <th className="px-4 py-2.5 font-normal">الدفع</th>
                                    <th className="px-4 py-2.5 font-normal">التاريخ</th>
                                    <th className="px-4 py-2.5 font-normal">المبلغ</th>
                                    <th className="px-4 py-2.5 font-normal">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pageRows.map((t, i) => (
                                    <tr key={t.id} className="border-t transition-colors hover:bg-[rgba(0,230,118,0.05)]" style={{ borderColor: 'rgba(0,230,118,0.05)' }}>
                                        <td className={`${F.mono} px-4 py-2.5 text-[0.72rem]`} style={{ color: C.t4 }}>{(page - 1) * PAGE_SIZE + i + 1}</td>
                                        <td className={`${F.ar} px-4 py-2.5 text-[0.78rem]`} style={{ color: C.t2 }}>{t.description || '—'}</td>
                                        <td className={`${F.mono} px-4 py-2.5 text-[0.72rem] font-semibold`} style={{ color: t.type === 'income' ? C.green : C.red }}>
                                            {t.type === 'income' ? 'دخل' : 'مصروف'}
                                        </td>
                                        <td className="px-4 py-2.5">
                                            <span className={`${F.mono} px-1.5 py-0.5 border text-[0.62rem]`}
                                                style={{ color: t.category?.color_hex || C.t3, borderColor: `${t.category?.color_hex || C.t3}44`, background: `${t.category?.color_hex || C.t3}15` }}>
                                                {t.category?.name || '—'}
                                            </span>
                                        </td>
                                        <td className={`${F.mono} px-4 py-2.5 text-[0.72rem]`} style={{ color: C.cyan }}>{t.account?.name || '—'}</td>
                                        <td className={`${F.mono} px-4 py-2.5 text-[0.68rem]`} style={{ color: C.t3 }}>
                                            {PAYMENT_METHODS.find((p) => p.value === t.payment_method)?.label || t.payment_method}
                                        </td>
                                        <td className={`${F.mono} px-4 py-2.5 text-[0.7rem]`} style={{ color: C.t3 }}>{fmtDate(t.transaction_date)}</td>
                                        <td className={`${F.mono} px-4 py-2.5 text-[0.75rem] font-semibold`} style={{ color: t.type === 'income' ? C.green : C.red }}>
                                            {t.type === 'income' ? '+' : '-'}{fmtMAD(t.amount)}
                                        </td>
                                        <td className="px-4 py-2.5">
                                            <div className="flex gap-1.5">
                                                <button type="button" title="تعديل" onClick={() => openEditModal(t)}
                                                    className="w-[26px] h-[26px] flex items-center justify-center border transition-colors hover:border-[#ffc107] hover:text-[#ffc107] hover:bg-[rgba(255,193,7,0.1)]"
                                                    style={{ borderColor: C.b, color: C.t3 }}>
                                                    <IcoEdit />
                                                </button>
                                                <button type="button" title="حذف" onClick={() => handleDelete(t.id)}
                                                    className="w-[26px] h-[26px] flex items-center justify-center border transition-colors hover:border-[rgba(255,61,90,0.3)] hover:text-[#ff3d5a] hover:bg-[rgba(255,61,90,0.1)]"
                                                    style={{ borderColor: C.b, color: C.t3 }}>
                                                    <IcoDel />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {pageRows.length === 0 && (
                                    <tr>
                                        <td colSpan={9} className={`${F.mono} text-center py-10 text-[0.7rem] tracking-[2px]`} style={{ color: C.t4 }}>
                                            // لا توجد معاملات مطابقة //
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {pageCount > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: C.b }}>
                            <span className={`${F.mono} text-[0.65rem]`} style={{ color: C.t4 }}>
                                صفحة {page} من {pageCount} — {filtered.length} نتيجة
                            </span>
                            <div className="flex gap-1.5">
                                <button type="button" disabled={page === 1} onClick={() => setPage((p) => p - 1)}
                                    className={`${F.mono} px-3 py-1 border text-[0.7rem] transition-colors disabled:opacity-30 disabled:cursor-not-allowed`}
                                    style={{ borderColor: C.b, color: C.t2 }}>السابق</button>
                                <button type="button" disabled={page === pageCount} onClick={() => setPage((p) => p + 1)}
                                    className={`${F.mono} px-3 py-1 border text-[0.7rem] transition-colors disabled:opacity-30 disabled:cursor-not-allowed`}
                                    style={{ borderColor: C.b, color: C.t2 }}>التالي</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* ══ MODAL ══ */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black/85 backdrop-blur-[6px] z-[1000] flex items-center justify-center p-5"
                        onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}>
                        <div className="w-full max-w-[480px] border shadow-[0_0_80px_rgba(0,230,118,0.1)] max-h-[92vh] overflow-y-auto"
                            style={{ background: C.card, borderColor: C.bHot }}>
                            <div className="flex items-center justify-between px-5 py-[15px] border-b sticky top-0 z-10" style={{ borderColor: C.b, background: C.card2 }}>
                                <div className={`${F.head} text-[0.92rem] font-bold tracking-[3px] uppercase`} style={{ color: C.green }}>
                                    {editing ? 'تعديل عملية' : 'عملية جديدة'}
                                </div>
                                <button type="button" onClick={() => setIsModalOpen(false)}
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
                                        <label className={`${F.mono} text-[0.65rem] tracking-[2px] uppercase block mb-1.5`} style={{ color: C.t3 }}>// التاريخ والوقت</label>
                                        <input type="datetime-local" value={data.transaction_date} onChange={(e) => setData('transaction_date', e.target.value)}
                                            className={inputCls} style={{ ...inputStyle, fontFamily: 'Share Tech Mono', borderColor: errors.transaction_date ? C.red : C.b }} required />
                                        <Err msg={errors.transaction_date} />
                                    </div>
                                    <div>
                                        <label className={`${F.mono} text-[0.65rem] tracking-[2px] uppercase block mb-1.5`} style={{ color: C.t3 }}>// طريقة الدفع</label>
                                        <select value={data.payment_method} onChange={(e) => setData('payment_method', e.target.value)} className={inputCls} style={inputStyle}>
                                            {PAYMENT_METHODS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                                        </select>
                                        <Err msg={errors.payment_method} />
                                    </div>
                                </div>

                                {/* ══ ★ زر «مزيد» ══ */}
                                <button type="button" onClick={() => setShowMore(v => !v)}
                                    className="flex w-full items-center justify-between rounded-md border px-3.5 py-2.5 transition-colors"
                                    style={{
                                        borderColor: showMore ? `${C.green}55` : C.b,
                                        background: showMore ? C.greenTrace : C.card2,
                                        color: showMore ? C.green : C.t2,
                                    }}>
                                    <span className="flex items-center gap-2 text-[0.78rem] font-semibold">
                                        <IcoSliders />
                                        خيارات إضافية
                                        {extraCount > 0 && (
                                            <span className={`${F.mono} flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[0.58rem] font-bold`}
                                                style={{ background: C.green, color: C.void }}>
                                                {extraCount}
                                            </span>
                                        )}
                                    </span>
                                    <span className="transition-transform duration-300" style={{ transform: showMore ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                                        <IcoChevron />
                                    </span>
                                </button>

                                {/* ══ ★ الحقول الإضافية القابلة للطي ══ */}
                                <div className="grid transition-all duration-300 ease-out"
                                    style={{ gridTemplateRows: showMore ? '1fr' : '0fr', opacity: showMore ? 1 : 0 }}
                                    aria-hidden={!showMore}>
                                    <div className="overflow-hidden">
                                        <div className="flex flex-col gap-4 rounded-md border p-4" style={{ borderColor: C.b, background: C.card2 }}>
                                            <div className={`${F.mono} text-[0.58rem] tracking-[2px]`} style={{ color: C.t4 }}>
                                                // حقول اختيارية — تُحفظ مع العملية
                                            </div>

                                            {/* ملاحظات */}
                                            <div>
                                                <label className={`${F.ar} flex items-center gap-1.5 text-[0.72rem] font-semibold mb-1.5`} style={{ color: C.t2 }}>
                                                    <span style={{ color: C.t4 }}><IcoNote /></span> ملاحظات
                                                </label>
                                                <textarea value={data.notes} onChange={(e) => setData('notes', e.target.value)}
                                                    rows={2} placeholder="مثال: تفاصيل إضافية عن العملية..."
                                                    className={`${inputCls} resize-none`} style={{ ...inputStyle, borderColor: errors.notes ? C.red : C.b }} />
                                                <Err msg={errors.notes} />
                                            </div>

                                            {/* رابط الفاتورة */}
                                            <div>
                                                <label className={`${F.ar} flex items-center gap-1.5 text-[0.72rem] font-semibold mb-1.5`} style={{ color: C.t2 }}>
                                                    <span style={{ color: C.t4 }}><IcoLink /></span> رابط الفاتورة
                                                </label>
                                                <input type="url" dir="ltr" value={data.receipt_url} onChange={(e) => setData('receipt_url', e.target.value)}
                                                    placeholder="https://..." className={`${inputCls} text-left`}
                                                    style={{ ...inputStyle, fontFamily: 'Share Tech Mono', borderColor: errors.receipt_url ? C.red : C.b }} />
                                                <Err msg={errors.receipt_url} />
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                {/* الموقع */}
                                                <div>
                                                    <label className={`${F.ar} flex items-center gap-1.5 text-[0.72rem] font-semibold mb-1.5`} style={{ color: C.t2 }}>
                                                        <span style={{ color: C.t4 }}><IcoPin /></span> الموقع
                                                    </label>
                                                    <input type="text" value={data.location} onChange={(e) => setData('location', e.target.value)}
                                                        placeholder="مثال: سوق الأحد، أكادير" className={inputCls}
                                                        style={{ ...inputStyle, borderColor: errors.location ? C.red : C.b }} />
                                                    <Err msg={errors.location} />
                                                </div>
                                                {/* الوسوم */}
                                                <div>
                                                    <label className={`${F.ar} flex items-center gap-1.5 text-[0.72rem] font-semibold mb-1.5`} style={{ color: C.t2 }}>
                                                        <span style={{ color: C.t4 }}><IcoTag /></span> وسوم
                                                    </label>
                                                    <input type="text" value={data.tags} onChange={(e) => setData('tags', e.target.value)}
                                                        placeholder="افصل بفاصلة: عمل، ضروري" className={inputCls}
                                                        style={{ ...inputStyle, borderColor: errors.tags ? C.red : C.b }} />
                                                    <Err msg={errors.tags} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button type="submit" disabled={processing}
                                    className={`${F.head} border p-3 text-[0.92rem] font-bold tracking-[3px] uppercase transition-colors w-full disabled:opacity-40 disabled:cursor-not-allowed`}
                                    style={{ borderColor: C.green, color: C.green }}
                                    onMouseEnter={(e) => { if (!processing) { e.currentTarget.style.background = C.green; e.currentTarget.style.color = C.void; } }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.green; }}>
                                    {processing ? '// جاري الحفظ...' : '// حفظ العملية //'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}