import { useEffect, useMemo, useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { COLORS as C, FONT as F } from '@/Components/Dashboard/theme';

/* ── أيقونات SVG لأنواع الحسابات ── */
const ACC_ICONS = {
    cash: (p) => (
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}>
            <rect x="2" y="5" width="16" height="11" rx="1.5" />
            <circle cx="10" cy="10.5" r="2.5" />
            <path d="M2 8.5h3M15 8.5h3" strokeLinecap="round" />
        </svg>
    ),
    bank: (p) => (
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}>
            <path d="M10 2L2 7h16L10 2z" strokeLinejoin="round" />
            <path d="M3 8v8M7 8v8M11 8v8M15 8v8M17 8v8M2 16h16" strokeLinecap="round" />
        </svg>
    ),
    card: (p) => (
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}>
            <rect x="1" y="4" width="18" height="13" rx="1.5" />
            <path d="M1 8h18" strokeWidth="2" />
            <circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" />
            <circle cx="8" cy="12" r="1" fill="currentColor" stroke="none" />
        </svg>
    ),
    savings: (p) => (
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}>
            <rect x="3" y="5" width="14" height="11" rx="1" />
            <path d="M6 5V3.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5V5" />
            <path d="M10 8v5M7.5 10.5h5" strokeLinecap="round" />
        </svg>
    ),
    other: (p) => (
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}>
            <rect x="3" y="3" width="14" height="14" rx="1" />
            <circle cx="7" cy="7" r="1" fill="currentColor" stroke="none" />
            <circle cx="13" cy="7" r="1" fill="currentColor" stroke="none" />
            <circle cx="7" cy="13" r="1" fill="currentColor" stroke="none" />
            <circle cx="13" cy="13" r="1" fill="currentColor" stroke="none" />
            <circle cx="10" cy="10" r="1" fill="currentColor" stroke="none" />
        </svg>
    ),
};

const ACC_TYPES = [
    { value: 'cash', label: 'CASH', labelAr: 'نقدي' },
    { value: 'bank', label: 'BANK', labelAr: 'بنكي' },
    { value: 'card', label: 'CARD', labelAr: 'بطاقة' },
    { value: 'savings', label: 'SAVE', labelAr: 'ادخار' },
    { value: 'other', label: 'OTHER', labelAr: 'آخر' },
];

const FILTERS = {
    all: { label: 'الكل' },
    cash: { label: 'نقدي' },
    bank: { label: 'بنكي' },
    card: { label: 'بطاقة' },
    savings: { label: 'ادخار' },
    other: { label: 'آخر' },
};

const PALETTE = [
    '#00e676', '#00d4ff', '#ffab00', '#ff3d5a', '#b388ff',
    '#40c4ff', '#ff6d00', '#69f0ae', '#ffd740', '#ea80fc',
    '#00bfa5', '#64ffda', '#ff9100', '#d500f9', '#7c4dff',
];

/* أيقونات واجهة المستخدم */
const IcoPlus = (p) => (<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}><path d="M10 4v12M4 10h12" strokeLinecap="round"/></svg>);
const IcoEdit = (p) => (<svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><path d="M14 2l4 4-10 10H4v-4L14 2z" strokeLinejoin="round"/></svg>);
const IcoDel = (p) => (<svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path d="M4 6h12M8 6V4h4v2M5 6l1 11h8l1-11" strokeLinecap="round" strokeLinejoin="round"/></svg>);
const IcoSearch = (p) => (<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><circle cx="9" cy="9" r="6"/><path d="M13.5 13.5L18 18" strokeLinecap="round"/></svg>);
const IcoClose = (p) => (<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}><path d="M5 5l10 10M15 5L5 15" strokeLinecap="round"/></svg>);
const IcoCheck = (p) => (<svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}><path d="M6 10l2.5 2.5L14 7" strokeLinecap="round" strokeLinejoin="round"/></svg>);
const IcoWarn = (p) => (<svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path d="M10 2l8 14H2L10 2z" strokeLinejoin="round"/><path d="M10 8v3M10 14v1" strokeLinecap="round"/></svg>);
const IcoWallet = (p) => (<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><rect x="2" y="5" width="16" height="11" rx="1.5"/><path d="M2 8.5h16"/><circle cx="14.5" cy="12" r="1" fill="currentColor" stroke="none"/></svg>);
const IcoTrendUp = (p) => (<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path d="M3 15l5-5 3 3 6-7M13 6h4v4" strokeLinecap="round" strokeLinejoin="round"/></svg>);
const IcoTrendDown = (p) => (<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path d="M3 5l5 5 3-3 6 7M13 14h4v-4" strokeLinecap="round" strokeLinejoin="round"/></svg>);

function fmt(n) {
    return Number(n || 0).toLocaleString('ar-MA', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

export default function Accounts({ accounts = [] }) {
    const { message } = usePage().props;
    const [toast, setToast] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');

    /* ── إحصائيات ── */
    const stats = useMemo(() => {
        const total = accounts.length;
        const totalBalance = accounts.reduce((s, a) => s + parseFloat(a.balance || 0), 0);
        const totalIncome = accounts.reduce((s, a) => s + parseFloat(a.total_income || 0), 0);
        const totalExpense = accounts.reduce((s, a) => s + parseFloat(a.total_expense || 0), 0);
        const net = totalIncome - totalExpense;
        const byType = {};
        ACC_TYPES.forEach(t => { byType[t.value] = accounts.filter(a => a.type === t.value).length; });
        const richest = [...accounts].sort((a, b) => parseFloat(b.balance || 0) - parseFloat(a.balance || 0))[0];
        const avgBalance = total > 0 ? totalBalance / total : 0;
        return { total, totalBalance, totalIncome, totalExpense, net, byType, richest, avgBalance };
    }, [accounts]);

    /* ── فلترة + بحث ── */
    const filtered = useMemo(() => {
        return accounts.filter(a => {
            if (filter !== 'all' && a.type !== filter) return false;
            if (search && !a.name.toLowerCase().includes(search.toLowerCase()) &&
                !(a.type || '').toLowerCase().includes(search.toLowerCase())) return false;
            return true;
        });
    }, [accounts, filter, search]);

    /* ── نموذج الإدخال ── */
    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        name: '',
        type: 'cash',
        balance: '0.00',
        color_hex: '#00e676',
    });

    useEffect(() => {
        if (message) {
            setToast(message);
            const t = setTimeout(() => setToast(null), 2800);
            return () => clearTimeout(t);
        }
    }, [message]);

    const openCreate = () => {
        setEditingAccount(null);
        reset();
        setData({ name: '', type: 'cash', balance: '0.00', color_hex: '#00e676' });
        clearErrors();
        setIsModalOpen(true);
    };

    const openEdit = (account) => {
        setEditingAccount(account);
        setData({
            name: account.name,
            type: account.type,
            balance: account.balance,
            color_hex: account.color_hex || '#00e676',
        });
        clearErrors();
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingAccount) {
            put(route('accounts.update', editingAccount.uuid), {
                onSuccess: () => setIsModalOpen(false),
            });
        } else {
            post(route('accounts.store'), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        }
    };

    const confirmDeleteAction = () => {
        if (confirmDelete) {
            destroy(route('accounts.destroy', confirmDelete.id), {
                onSuccess: () => setConfirmDelete(null),
            });
        }
    };

    const PreviewIcon = ACC_ICONS[data.type] || ACC_ICONS.other;

    return (
        <AuthenticatedLayout>
            <Head title="إدارة الحسابات" />
            <div dir="rtl" className="flex flex-col gap-5">

                {/* HEADER */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <div className={`${F.head} text-[1.3rem] font-bold tracking-[3px] uppercase`} style={{ color: C.t1 }}>
                            إدارة <em className="not-italic" style={{ color: C.green }}>الحسابات</em>
                        </div>
                        <div className={`${F.mono} text-[0.72rem] tracking-[2px] mt-1`} style={{ color: C.t4 }}>
                            // ACCOUNTS MANAGEMENT // ADD · EDIT · MONITOR
                        </div>
                    </div>
                    <button type="button" onClick={openCreate}
                        className={`${F.head} flex items-center gap-2 border px-3.5 py-2 text-[0.75rem] font-semibold tracking-[1.5px] uppercase transition-colors hover:brightness-125`}
                        style={{ borderColor: `${C.green}66`, color: C.green, background: C.greenTrace }}>
                        <IcoPlus /> حساب جديد
                    </button>
                </div>

                {/* STATS */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <StatBox label="TOTAL NET WORTH" value={fmt(stats.totalBalance)} sub="MAD" color={C.gold} icon={<IcoWallet />} />
                    <StatBox label="TOTAL INCOME" value={`+${fmt(stats.totalIncome)}`} sub="MAD" color={C.green} icon={<IcoTrendUp />} />
                    <StatBox label="TOTAL EXPENSE" value={`-${fmt(stats.totalExpense)}`} sub="MAD" color={C.red} icon={<IcoTrendDown />} />
                    <StatBox label="ACCOUNTS" value={stats.total} sub="حساب نشط" color={C.cyan} />
                </div>

                {/* TOOLBAR: بحث + فلترة */}
                <div className="flex flex-wrap items-center gap-3 border p-3" style={{ background: C.card, borderColor: C.b }}>
                    <div className="flex flex-1 items-center gap-2 border px-3 py-2 min-w-[220px]" style={{ borderColor: C.b, background: C.card2 }}>
                        <span style={{ color: C.t4 }}><IcoSearch /></span>
                        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                            placeholder="ابحث في الحسابات..."
                            className={`${F.ar} flex-1 bg-transparent text-[0.78rem] outline-none`}
                            style={{ color: C.t1 }} />
                        {search && (
                            <button type="button" onClick={() => setSearch('')} style={{ color: C.t4 }}>
                                <IcoClose />
                            </button>
                        )}
                    </div>
                    <div className="flex flex-wrap items-center gap-1">
                        {Object.entries(FILTERS).map(([key, def]) => {
                            const count = key === 'all' ? stats.total : (stats.byType[key] || 0);
                            return (
                                <button key={key} type="button" onClick={() => setFilter(key)}
                                    className={`${F.head} flex items-center gap-1.5 border px-3 py-2 text-[0.7rem] font-semibold tracking-[1px] uppercase transition-colors`}
                                    style={filter === key
                                        ? { borderColor: C.green, color: C.void, background: C.green }
                                        : { borderColor: C.b, color: C.t3 }}>
                                    {def.label}
                                    <span className={`${F.mono} text-[0.55rem] opacity-70`}>({count})</span>
                                </button>
                            );
                        })}
                    </div>
                    <div className={`${F.mono} text-[0.6rem] tracking-[1.5px]`} style={{ color: C.t4 }}>
                        {filtered.length} / {accounts.length}
                    </div>
                </div>

                {/* GRID */}
                {filtered.length === 0 ? (
                    <div className="border p-12 text-center" style={{ background: C.card, borderColor: C.b }}>
                        <div className={`${F.mono} text-[0.75rem] tracking-[2px]`} style={{ color: C.t4 }}>
                            {search ? '// لا توجد نتائج مطابقة //' : '// لا توجد حسابات في هذا القسم //'}
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                        {filtered.map((account) => {
                            const rb = parseFloat(account.balance || 0);
                            const inc = parseFloat(account.total_income || 0);
                            const exp = parseFloat(account.total_expense || 0);
                            const txCount = account.tx_count || 0;
                            const color = account.color_hex || C.green;
                            const TypeIcon = ACC_ICONS[account.type] || ACC_ICONS.other;
                            const typeInfo = ACC_TYPES.find(t => t.value === account.type) || ACC_TYPES[4];

                            return (
                                <div key={account.uuid || account.id}
                                    className="relative overflow-hidden border p-4 transition-all duration-200 hover:-translate-y-px"
                                    style={{ background: C.card, borderColor: C.b }}>
                                    <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: color }} />

                                    <div className="flex items-start justify-between gap-2 mt-1 mb-3">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div className="flex h-10 w-10 items-center justify-center border shrink-0"
                                                style={{ borderColor: `${color}55`, background: `${color}15`, color }}>
                                                <TypeIcon />
                                            </div>
                                            <div className="min-w-0">
                                                <div className={`${F.head} text-[0.95rem] font-bold truncate`} style={{ color: C.t1 }}>
                                                    {account.name}
                                                </div>
                                                <span className={`${F.mono} text-[0.55rem] tracking-[2px] border px-1.5 py-0.5 inline-block mt-0.5`}
                                                    style={{ color, borderColor: `${color}55`, background: `${color}15` }}>
                                                    {typeInfo.label}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex gap-1.5 shrink-0">
                                            <button type="button" title="تعديل" onClick={() => openEdit(account)}
                                                className="flex h-7 w-7 items-center justify-center border transition-colors"
                                                style={{ borderColor: C.b, color: C.t3 }}
                                                onMouseEnter={e => { e.currentTarget.style.color = C.gold; e.currentTarget.style.borderColor = `${C.gold}66`; }}
                                                onMouseLeave={e => { e.currentTarget.style.color = C.t3; e.currentTarget.style.borderColor = C.b; }}>
                                                <IcoEdit />
                                            </button>
                                            <button type="button" title="حذف" onClick={() => setConfirmDelete(account)}
                                                className="flex h-7 w-7 items-center justify-center border transition-colors"
                                                style={{ borderColor: C.b, color: C.t3 }}
                                                onMouseEnter={e => { e.currentTarget.style.color = C.red; e.currentTarget.style.borderColor = `${C.red}66`; }}
                                                onMouseLeave={e => { e.currentTarget.style.color = C.t3; e.currentTarget.style.borderColor = C.b; }}>
                                                <IcoDel />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-baseline gap-2 mb-3">
                                        <span className={`${F.mono} text-[1.8rem] font-bold tracking-tight`} style={{ color, textShadow: `0 0 20px ${color}33` }}>
                                            {fmt(rb)}
                                        </span>
                                        <span className={`${F.mono} text-[0.65rem]`} style={{ color: C.t4 }}>MAD</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 mb-3">
                                        <div className="border p-2" style={{ borderColor: C.b, background: C.card2 }}>
                                            <div className={`${F.mono} text-[0.55rem] tracking-[1px] uppercase mb-0.5`} style={{ color: C.t4 }}>↑ INCOME</div>
                                            <div className={`${F.mono} text-[0.85rem] font-bold`} style={{ color: C.green }}>
                                                +{fmt(inc)}
                                            </div>
                                        </div>
                                        <div className="border p-2" style={{ borderColor: C.b, background: C.card2 }}>
                                            <div className={`${F.mono} text-[0.55rem] tracking-[1px] uppercase mb-0.5`} style={{ color: C.t4 }}>↓ EXPENSE</div>
                                            <div className={`${F.mono} text-[0.85rem] font-bold`} style={{ color: C.red }}>
                                                -{fmt(exp)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between border-t pt-2" style={{ borderColor: C.b }}>
                                        <span className={`${F.mono} text-[0.6rem] tracking-[1px]`} style={{ color: C.t4 }}>
                                            {txCount} عملية
                                        </span>
                                        <span className={`${F.mono} text-[0.6rem] tracking-[1px]`} style={{ color: C.t4 }}>
                                            {typeInfo.labelAr}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}

                        {/* بطاقة إضافة جديدة */}
                        <button type="button" onClick={openCreate}
                            className="flex min-h-[220px] flex-col items-center justify-center gap-2.5 border-2 border-dashed transition-colors hover:bg-white/[0.03]"
                            style={{ borderColor: `${C.green}55` }}>
                            <span style={{ color: C.green, opacity: 0.6 }}><IcoPlus width="24" height="24" /></span>
                            <span className={`${F.head} text-[0.85rem] tracking-[1.5px] uppercase`} style={{ color: C.green }}>
                                حساب جديد
                            </span>
                            <span className={`${F.mono} text-[0.55rem] tracking-[1px]`} style={{ color: C.t4 }}>
                                CASH · BANK · CARD · SAVINGS
                            </span>
                        </button>
                    </div>
                )}

                {/* MODAL (إنشاء / تعديل) */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
                        onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}>
                        <div className="w-full max-w-[500px] border shadow-2xl max-h-[90vh] overflow-y-auto" style={{ background: C.card, borderColor: C.bHot }}>
                            <div className="flex items-center justify-between border-b px-5 py-3" style={{ borderColor: C.b, background: C.card2 }}>
                                <div className={`${F.head} text-[0.85rem] font-bold tracking-[3px] uppercase flex items-center gap-2.5`} style={{ color: C.green }}>
                                    {editingAccount ? <IcoEdit /> : <IcoWallet />}
                                    {editingAccount ? `تعديل: ${editingAccount.name}` : 'حساب جديد'}
                                </div>
                                <button type="button" onClick={() => setIsModalOpen(false)}
                                    className="flex h-7 w-7 items-center justify-center border transition-colors"
                                    style={{ borderColor: C.b, color: C.t3 }}
                                    onMouseEnter={e => { e.currentTarget.style.color = C.red; e.currentTarget.style.borderColor = `${C.red}66`; }}
                                    onMouseLeave={e => { e.currentTarget.style.color = C.t3; e.currentTarget.style.borderColor = C.b; }}>
                                    <IcoClose />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5">
                                {/* معاينة حية */}
                                <div className="flex items-center gap-3 border p-3" style={{ borderColor: C.b, background: C.card2 }}>
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center border"
                                        style={{ borderColor: `${data.color_hex}66`, background: `${data.color_hex}15`, color: data.color_hex }}>
                                        <PreviewIcon />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className={`${F.head} text-[0.95rem] font-bold truncate`} style={{ color: C.t1 }}>
                                            {data.name || 'اسم الحساب'}
                                        </div>
                                        <div className={`${F.mono} text-[0.6rem] tracking-[2px] uppercase truncate mt-0.5`} style={{ color: data.color_hex }}>
                                            {data.type}
                                        </div>
                                    </div>
                                    <div className={`${F.mono} text-[1.1rem] font-bold`} style={{ color: data.color_hex }}>
                                        {fmt(data.balance || 0)}
                                    </div>
                                </div>

                                {/* الاسم */}
                                <div className="flex flex-col gap-1.5">
                                    <label className={`${F.mono} text-[0.6rem] tracking-[2px] uppercase`} style={{ color: C.t4 }}>
                                        // اسم الحساب
                                    </label>
                                    <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)}
                                        placeholder="مثال: CIH Bank, Cash Wallet..." required
                                        className={`${F.ar} border px-3 py-2.5 text-[0.82rem] outline-none transition-colors focus:brightness-125`}
                                        style={{ background: C.card2, borderColor: errors.name ? C.red : C.b, color: C.t1 }} />
                                    {errors.name && <div className={`${F.mono} text-[0.65rem]`} style={{ color: C.red }}>{errors.name}</div>}
                                </div>

                                {/* نوع الحساب */}
                                <div className="flex flex-col gap-1.5">
                                    <label className={`${F.mono} text-[0.6rem] tracking-[2px] uppercase`} style={{ color: C.t4 }}>
                                        // نوع الحساب
                                    </label>
                                    <div className="grid grid-cols-5 gap-1.5">
                                        {ACC_TYPES.map((t) => {
                                            const Icon = ACC_ICONS[t.value];
                                            const active = data.type === t.value;
                                            return (
                                                <button type="button" key={t.value} onClick={() => setData('type', t.value)}
                                                    className="border px-1 py-2.5 text-center transition-all"
                                                    style={{
                                                        borderColor: active ? data.color_hex : C.b,
                                                        background: active ? `${data.color_hex}15` : C.card2,
                                                        color: active ? data.color_hex : C.t3,
                                                    }}>
                                                    <div className="flex justify-center mb-1">
                                                        <Icon />
                                                    </div>
                                                    <div className={`${F.mono} text-[0.55rem] tracking-[1px]`}>
                                                        {t.label}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* الرصيد */}
                                <div className="flex flex-col gap-1.5">
                                    <label className={`${F.mono} text-[0.6rem] tracking-[2px] uppercase`} style={{ color: C.t4 }}>
                                        // الرصيد الابتدائي (MAD)
                                    </label>
                                    <input type="number" min="0" step="0.01" placeholder="0.00"
                                        value={data.balance} onChange={(e) => setData('balance', e.target.value)}
                                        className={`${F.mono} border px-3 py-2.5 text-[1.05rem] outline-none transition-colors focus:brightness-125`}
                                        style={{ background: C.card2, borderColor: C.b, color: data.color_hex }} />
                                </div>

                                {/* اللون */}
                                <div className="flex flex-col gap-1.5">
                                    <label className={`${F.mono} text-[0.6rem] tracking-[2px] uppercase`} style={{ color: C.t4 }}>
                                        // اللون
                                    </label>
                                    <div className="flex flex-wrap gap-2 border p-3" style={{ borderColor: C.b, background: C.card2 }}>
                                        {PALETTE.map(c => (
                                            <button type="button" key={c} title={c} onClick={() => setData('color_hex', c)}
                                                className="h-8 w-8 border-2 transition-all hover:scale-110"
                                                style={{
                                                    background: c,
                                                    borderColor: data.color_hex === c ? C.t1 : 'transparent',
                                                    transform: data.color_hex === c ? 'scale(1.1)' : undefined,
                                                }} />
                                        ))}
                                    </div>
                                    <input type="text" value={data.color_hex} onChange={(e) => setData('color_hex', e.target.value)}
                                        className={`${F.mono} mt-1 border px-3 py-1.5 text-[0.7rem] uppercase outline-none`}
                                        style={{ background: C.card2, borderColor: C.b, color: data.color_hex }} />
                                </div>

                                <button type="submit" disabled={processing}
                                    className={`${F.head} border p-3 text-[0.85rem] font-bold tracking-[3px] uppercase transition-colors hover:brightness-125 disabled:opacity-40`}
                                    style={{ borderColor: `${C.green}88`, color: C.green, background: C.greenTrace }}>
                                    {processing ? '// جاري الحفظ...' : editingAccount ? '// تحديث //' : '// حفظ //'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* CONFIRM DELETE MODAL */}
                {confirmDelete && (
                    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
                        onClick={(e) => e.target === e.currentTarget && setConfirmDelete(null)}>
                        <div className="w-full max-w-[400px] border shadow-2xl" style={{ background: C.card, borderColor: C.bHot }}>
                            <div className="border-b px-5 py-3" style={{ borderColor: C.b, background: C.card2 }}>
                                <div className={`${F.head} text-[0.82rem] font-bold tracking-[3px] uppercase flex items-center gap-2`} style={{ color: C.red }}>
                                    <IcoWarn /> تأكيد الحذف
                                </div>
                            </div>
                            <div className="p-5">
                                <div className={`${F.ar} text-[0.85rem] leading-6 mb-1`} style={{ color: C.t1 }}>
                                    هل تريد حذف الحساب:
                                </div>
                                <div className={`${F.head} text-[1.05rem] font-bold mb-3`} style={{ color: confirmDelete.color_hex }}>
                                    {confirmDelete.name}
                                </div>
                                <div className={`${F.ar} text-[0.75rem] border p-2.5 mb-4`} style={{ borderColor: `${C.red}44`, color: C.t3, background: `${C.red}0d` }}>
                                    ⚠️ هذا الإجراء لا يمكن التراجع عنه. جميع المعاملات المرتبطة بهذا الحساب ستبقى لكنها لن تُحتسب في الإجماليات.
                                </div>
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => setConfirmDelete(null)}
                                        className={`${F.head} flex-1 border py-2 text-[0.75rem] font-bold tracking-[1.5px] uppercase transition-colors hover:bg-white/[0.04]`}
                                        style={{ borderColor: C.b, color: C.t3 }}>
                                        إلغاء
                                    </button>
                                    <button type="button" onClick={confirmDeleteAction}
                                        className={`${F.head} flex-1 border py-2 text-[0.75rem] font-bold tracking-[1.5px] uppercase transition-colors hover:brightness-125`}
                                        style={{ borderColor: `${C.red}88`, color: C.red, background: `${C.red}0d` }}>
                                        حذف نهائي
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TOAST */}
                {toast && (
                    <div className="fixed bottom-6 left-1/2 z-[3000] flex -translate-x-1/2 items-center gap-2.5 border px-5 py-2.5 shadow-2xl"
                        style={{ background: C.card, borderColor: C.green }}>
                        <span style={{ color: C.green }}><IcoCheck /></span>
                        <span className={`${F.mono} text-[0.78rem] tracking-[1.5px]`} style={{ color: C.green }}>{toast}</span>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}

/* ── مكون إحصائية صغير ── */
function StatBox({ label, value, sub, color, icon }) {
    return (
        <div className="relative overflow-hidden border p-3" style={{ background: C.card, borderColor: C.b }}>
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: color }} />
            <div className="flex items-start justify-between gap-2 mt-1">
                <div>
                    <div className={`${F.mono} text-[0.58rem] tracking-[2px]`} style={{ color: C.t4 }}>{label}</div>
                    <div className={`${F.mono} text-[1.4rem] font-bold mt-1`} style={{ color }}>{value}</div>
                    {sub && <div className={`${F.mono} text-[0.6rem] mt-0.5`} style={{ color: C.t3 }}>{sub}</div>}
                </div>
                {icon && <span style={{ color, opacity: 0.6 }}>{icon}</span>}
            </div>
        </div>
    );
}