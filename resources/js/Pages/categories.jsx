import { useEffect, useMemo, useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { COLORS as C, FONT as F } from '@/Components/Dashboard/theme';

/* ── مكتبة أيقونات SVG حقيقية للتصنيفات ── */
const CAT_ICONS = {
    food:      (p) => (<svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path d="M5 3v14M5 10h2M13 3c1.5 0 3 1.5 3 3.5V10c0 1-.8 1.8-1.8 1.8H13V17" strokeLinecap="round" strokeLinejoin="round"/></svg>),
    shopping:  (p) => (<svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path d="M5 6h10l1 11H4L5 6z" strokeLinejoin="round"/><path d="M7 6a3 3 0 0 1 6 0" strokeLinecap="round"/></svg>),
    transport: (p) => (<svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><rect x="3" y="6" width="14" height="8" rx="1.5"/><circle cx="7" cy="14" r="1.5"/><circle cx="13" cy="14" r="1.5"/><path d="M3 10h14" strokeLinecap="round"/></svg>),
    health:    (p) => (<svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path d="M10 17s-6-4.5-6-8.5a3.5 3.5 0 0 1 6-2.5 3.5 3.5 0 0 1 6 2.5c0 4-6 8.5-6 8.5z" strokeLinejoin="round"/></svg>),
    home:      (p) => (<svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path d="M3 10l7-7 7 7v7a1 1 0 0 1-1 1h-4v-5H8v5H4a1 1 0 0 1-1-1v-7z" strokeLinejoin="round"/></svg>),
    bills:     (p) => (<svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><rect x="3" y="4" width="14" height="12" rx="1"/><path d="M7 8h6M7 11h4" strokeLinecap="round"/></svg>),
    fun:       (p) => (<svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><circle cx="10" cy="10" r="7"/><path d="M7 8h1M12 8h1M7 12s1.5 2 3 2 3-2 3-2" strokeLinecap="round"/></svg>),
    education: (p) => (<svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path d="M2 8l8-4 8 4-8 4-8-4z" strokeLinejoin="round"/><path d="M5 9.5v4.5c0 1 2.2 2 5 2s5-1 5-2V9.5" strokeLinecap="round"/></svg>),
    salary:    (p) => (<svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><rect x="2" y="5" width="16" height="11" rx="1.5"/><path d="M2 9h16" strokeLinecap="round"/><circle cx="14" cy="12.5" r="1" fill="currentColor" stroke="none"/></svg>),
    savings:   (p) => (<svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path d="M3 11c0-3 2-6 7-6s7 3 7 6v1H3v-1z" strokeLinejoin="round"/><circle cx="6" cy="9" r="0.7" fill="currentColor" stroke="none"/><path d="M5 14v2M15 14v2" strokeLinecap="round"/></svg>),
    travel:    (p) => (<svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path d="M10 2l1.5 6h6L12 11l1.5 6L10 13.5 6.5 17 8 11 2.5 8h6z" strokeLinejoin="round"/></svg>),
    gift:      (p) => (<svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><rect x="3" y="8" width="14" height="9" rx="1"/><path d="M10 8v9M3 11.5h14M7 8a2 2 0 1 1 3-3M13 8a2 2 0 1 0-3-3" strokeLinecap="round"/></svg>),
    invest:    (p) => (<svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path d="M3 16V6M7 16V9M11 16V4M15 16v-7" strokeLinecap="round"/><path d="M3 6l4 3 4-5 4 3" strokeLinecap="round" strokeLinejoin="round"/></svg>),
    default:   (p) => (<svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><circle cx="10" cy="10" r="7"/><path d="M10 6v4l3 2" strokeLinecap="round"/></svg>),
};

const ICON_KEYS = Object.keys(CAT_ICONS).filter(k => k !== 'default');

/* أيقونات واجهة المستخدم */
const IcoPlus = (p) => (<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}><path d="M10 4v12M4 10h12" strokeLinecap="round"/></svg>);
const IcoEdit = (p) => (<svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><path d="M14 2l4 4-10 10H4v-4L14 2z" strokeLinejoin="round"/></svg>);
const IcoDel = (p) => (<svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path d="M4 6h12M8 6V4h4v2M5 6l1 11h8l1-11" strokeLinecap="round" strokeLinejoin="round"/></svg>);
const IcoSearch = (p) => (<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><circle cx="9" cy="9" r="6"/><path d="M13.5 13.5L18 18" strokeLinecap="round"/></svg>);
const IcoCheck = (p) => (<svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}><path d="M6 10l2.5 2.5L14 7" strokeLinecap="round" strokeLinejoin="round"/></svg>);
const IcoClose = (p) => (<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}><path d="M5 5l10 10M15 5L5 15" strokeLinecap="round"/></svg>);
const IcoWarn = (p) => (<svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path d="M10 2l8 14H2L10 2z" strokeLinejoin="round"/><path d="M10 8v3M10 14v1" strokeLinecap="round"/></svg>);
const IcoTrend = (p) => (<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path d="M3 15l5-5 3 3 6-7M13 6h4v4" strokeLinecap="round" strokeLinejoin="round"/></svg>);
const IcoShield = (p) => (<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path d="M10 2l7 3v5c0 4-3 7-7 8-4-1-7-4-7-8V5l7-3z" strokeLinejoin="round"/></svg>);
const IcoPalette = (p) => (<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path d="M10 2a8 8 0 1 0 0 16c1.5 0 2-1 2-2s-1-1.5-1-2.5 1-1.5 2.5-1.5H15a3 3 0 0 0 3-3 8 8 0 0 0-8-7z" strokeLinejoin="round"/><circle cx="7" cy="8" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="7" r="1" fill="currentColor" stroke="none"/><circle cx="14" cy="10" r="1" fill="currentColor" stroke="none"/></svg>);

const PALETTE = [
    '#00e676', '#00d4ff', '#ffab00', '#ff3d5a', '#b388ff',
    '#40c4ff', '#ff6d00', '#69f0ae', '#ffd740', '#ea80fc',
    '#00bfa5', '#64ffda', '#ff9100', '#d500f9', '#7c4dff',
];

const FILTERS = {
    all:    { label: 'الكل', icon: null },
    system: { label: 'النظام', icon: <IcoShield /> },
    custom: { label: 'مخصص', icon: <IcoPalette /> },
};

export default function Categories({ Categories = [] }) {
    const { message } = usePage().props;
    const [toast, setToast] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [currentCategoryId, setCurrentCategoryId] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');

    /* ── إحصائيات ── */
    const stats = useMemo(() => {
        const total = Categories.length;
        const system = Categories.filter(c => c.is_system).length;
        const custom = total - system;
        const totalUsage = Categories.reduce((s, c) => s + (c.usage_count || 0), 0);
        const sorted = [...Categories].sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0));
        const top = sorted[0];
        return { total, system, custom, totalUsage, top };
    }, [Categories]);

    /* ── فلترة + بحث ── */
    const filtered = useMemo(() => {
        return Categories.filter(c => {
            if (filter === 'system' && !c.is_system) return false;
            if (filter === 'custom' && c.is_system) return false;
            if (search && !c.name.toLowerCase().includes(search.toLowerCase()) &&
                !(c.icon || '').toLowerCase().includes(search.toLowerCase())) return false;
            return true;
        });
    }, [Categories, filter, search]);

    const topId = stats.top?.id;

    /* ── نموذج الإدخال ── */
    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        name: '',
        icon: 'default',
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
        setModalMode('create');
        reset();
        setData({ name: '', icon: 'default', color_hex: '#00e676' });
        clearErrors();
        setIsModalOpen(true);
    };

    const openEdit = (c) => {
        setModalMode('edit');
        setCurrentCategoryId(c.id);
        setData({ name: c.name, icon: c.icon || 'default', color_hex: c.color_hex || '#00e676' });
        clearErrors();
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (modalMode === 'create') {
            post(route('categories.store'), { onSuccess: () => setIsModalOpen(false) });
        } else {
            put(route('categories.update', currentCategoryId), { onSuccess: () => setIsModalOpen(false) });
        }
    };

    const confirmDeleteAction = () => {
        if (confirmDelete) {
            destroy(route('categories.destroy', confirmDelete.id), {
                onSuccess: () => setConfirmDelete(null),
            });
        }
    };

    const PreviewIcon = CAT_ICONS[data.icon] || CAT_ICONS.default;

    return (
        <AuthenticatedLayout>
            <Head title="إدارة التصنيفات" />
            <div dir="rtl" className="flex flex-col gap-5">

                {/* HEADER */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <div className={`${F.head} text-[1.3rem] font-bold tracking-[3px] uppercase`} style={{ color: C.t1 }}>
                            إدارة <em className="not-italic" style={{ color: C.green }}>التصنيفات</em>
                        </div>
                        <div className={`${F.mono} text-[0.72rem] tracking-[2px] mt-1`} style={{ color: C.t4 }}>
                            // CATEGORIES MANAGEMENT // SYSTEM + CUSTOM
                        </div>
                    </div>
                    <button type="button" onClick={openCreate}
                        className={`${F.head} flex items-center gap-2 border px-3.5 py-2 text-[0.75rem] font-semibold tracking-[1.5px] uppercase transition-colors hover:brightness-125`}
                        style={{ borderColor: `${C.cyan}66`, color: C.cyan, background: `${C.cyan}0d` }}>
                        <IcoPlus /> تصنيف جديد
                    </button>
                </div>

                {/* STATS */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <StatBox label="TOTAL" value={stats.total} sub="تصنيف" color={C.cyan} />
                    <StatBox label="SYSTEM" value={stats.system} sub="محمي" color={C.green} icon={<IcoShield />} />
                    <StatBox label="CUSTOM" value={stats.custom} sub="مخصص" color={C.gold} icon={<IcoPalette />} />
                    <StatBox label="TOP USAGE"
                        value={stats.top ? (stats.top.usage_count || 0) : 0}
                        sub={stats.top ? stats.top.name : '—'} color={C.red} icon={<IcoTrend />} />
                </div>

                {/* TOOLBAR: بحث + فلترة */}
                <div className="flex flex-wrap items-center gap-3 border p-3" style={{ background: C.card, borderColor: C.b }}>
                    <div className="flex flex-1 items-center gap-2 border px-3 py-2 min-w-[220px]" style={{ borderColor: C.b, background: C.card2 }}>
                        <span style={{ color: C.t4 }}><IcoSearch /></span>
                        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                            placeholder="ابحث في التصنيفات..."
                            className={`${F.ar} flex-1 bg-transparent text-[0.78rem] outline-none`}
                            style={{ color: C.t1 }} />
                        {search && (
                            <button type="button" onClick={() => setSearch('')} className="text-slate-500 hover:text-white">
                                <IcoClose />
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-1">
                        {Object.entries(FILTERS).map(([key, def]) => (
                            <button key={key} type="button" onClick={() => setFilter(key)}
                                className={`${F.head} flex items-center gap-1.5 border px-3 py-2 text-[0.7rem] font-semibold tracking-[1px] uppercase transition-colors`}
                                style={filter === key
                                    ? { borderColor: C.green, color: C.void, background: C.green }
                                    : { borderColor: C.b, color: C.t3 }}>
                                {def.icon}
                                {def.label}
                            </button>
                        ))}
                    </div>
                    <div className={`${F.mono} text-[0.6rem] tracking-[1.5px]`} style={{ color: C.t4 }}>
                        {filtered.length} / {Categories.length}
                    </div>
                </div>

                {/* GRID */}
                {filtered.length === 0 ? (
                    <div className="border p-12 text-center" style={{ background: C.card, borderColor: C.b }}>
                        <div className={`${F.mono} text-[0.75rem] tracking-[2px]`} style={{ color: C.t4 }}>
                            {search ? '// لا توجد نتائج مطابقة //' : '// لا توجد تصنيفات في هذا القسم //'}
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {filtered.map((category) => {
                            const color = category.color_hex || C.green;
                            const isSystem = !!category.is_system;
                            const Icon = CAT_ICONS[category.icon] || CAT_ICONS.default;
                            const usage = category.usage_count || 0;
                            const isTop = category.id === topId && usage > 0;
                            return (
                                <div key={category.id}
                                    className="relative overflow-hidden border p-4 transition-all duration-200 hover:-translate-y-px"
                                    style={{ background: C.card, borderColor: C.b }}>
                                    <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: color }} />

                                    <div className="flex items-start justify-between gap-2 mt-1 mb-3">
                                        <div className="flex h-10 w-10 items-center justify-center border shrink-0"
                                            style={{ borderColor: `${color}55`, background: `${color}15`, color }}>
                                            <Icon />
                                        </div>
                                        <div className="flex gap-1.5">
                                            {isSystem ? (
                                                <span className={`${F.mono} text-[0.52rem] tracking-[2px] border px-1.5 py-0.5`}
                                                    style={{ borderColor: `${C.green}44`, color: C.green, background: C.greenTrace }}>
                                                    SYSTEM
                                                </span>
                                            ) : (
                                                <>
                                                    <button type="button" title="تعديل" onClick={() => openEdit(category)}
                                                        className="flex h-7 w-7 items-center justify-center border transition-colors"
                                                        style={{ borderColor: C.b, color: C.t3 }}
                                                        onMouseEnter={e => { e.currentTarget.style.color = C.gold; e.currentTarget.style.borderColor = `${C.gold}66`; }}
                                                        onMouseLeave={e => { e.currentTarget.style.color = C.t3; e.currentTarget.style.borderColor = C.b; }}>
                                                        <IcoEdit />
                                                    </button>
                                                    <button type="button" title="حذف" onClick={() => setConfirmDelete(category)}
                                                        className="flex h-7 w-7 items-center justify-center border transition-colors"
                                                        style={{ borderColor: C.b, color: C.t3 }}
                                                        onMouseEnter={e => { e.currentTarget.style.color = C.red; e.currentTarget.style.borderColor = `${C.red}66`; }}
                                                        onMouseLeave={e => { e.currentTarget.style.color = C.t3; e.currentTarget.style.borderColor = C.b; }}>
                                                        <IcoDel />
                                                    </button>
                                                </>
                                            )}
                                            {isTop && (
                                                <span className={`${F.mono} text-[0.52rem] tracking-[1px] border px-1.5 py-0.5 flex items-center gap-1`}
                                                    style={{ borderColor: `${C.amber}66`, color: C.amber, background: `${C.amber}15` }}>
                                                    <IcoTrend width="10" height="10" /> TOP
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className={`${F.head} text-[0.95rem] font-bold mb-0.5`} style={{ color: C.t1 }}>
                                        {category.name}
                                    </div>
                                    {category.icon && category.icon !== 'default' && (
                                        <div className={`${F.mono} text-[0.6rem] tracking-[1px] uppercase mb-2`} style={{ color }}>
                                            {category.icon}
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between border-t pt-2 mt-2" style={{ borderColor: C.b }}>
                                        <span className={`${F.mono} text-[0.6rem] tracking-[1px]`} style={{ color: C.t4 }}>USAGE</span>
                                        <span className={`${F.mono} text-[0.78rem] font-bold`} style={{ color: C.t1 }}>
                                            {usage}
                                            <span className="text-[0.55rem] font-normal ms-1" style={{ color: C.t4 }}>عملية</span>
                                        </span>
                                    </div>

                                    {/* شريط التقدم — النسبة من أعلى استخدام */}
                                    {stats.top && (
                                        <div className="mt-2 h-1 overflow-hidden" style={{ background: `${color}15` }}>
                                            <div className="h-full transition-all duration-500"
                                                style={{
                                                    width: `${stats.top.usage_count > 0 ? (usage / stats.top.usage_count) * 100 : 0}%`,
                                                    background: color,
                                                }} />
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* بطاقة إضافة جديدة */}
                        <button type="button" onClick={openCreate}
                            className="flex min-h-[180px] flex-col items-center justify-center gap-2.5 border-2 border-dashed transition-colors hover:bg-white/[0.03]"
                            style={{ borderColor: `${C.cyan}55` }}>
                            <span style={{ color: C.cyan, opacity: 0.6 }}><IcoPlus width="24" height="24" /></span>
                            <span className={`${F.head} text-[0.85rem] tracking-[1.5px] uppercase`} style={{ color: C.cyan }}>
                                تصنيف جديد
                            </span>
                            <span className={`${F.mono} text-[0.55rem] tracking-[1px]`} style={{ color: C.t4 }}>
                                + CREATE NEW
                            </span>
                        </button>
                    </div>
                )}

                {/* MODAL (إنشاء / تعديل) */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
                        onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}>
                        <div className="w-full max-w-[460px] border shadow-2xl" style={{ background: C.card, borderColor: C.bHot }}>
                            <div className="flex items-center justify-between border-b px-5 py-3" style={{ borderColor: C.b, background: C.card2 }}>
                                <div className={`${F.head} text-[0.85rem] font-bold tracking-[3px] uppercase flex items-center gap-2.5`} style={{ color: C.green }}>
                                    {modalMode === 'edit' ? <IcoEdit /> : <IcoPalette />}
                                    {modalMode === 'edit' ? `تعديل: ${data.name || '—'}` : 'تصنيف جديد'}
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
                                            {data.name || 'اسم التصنيف'}
                                        </div>
                                        <div className={`${F.mono} text-[0.6rem] tracking-[1px] uppercase truncate mt-0.5`} style={{ color: data.color_hex }}>
                                            {data.icon}
                                        </div>
                                    </div>
                                </div>

                                {/* الاسم */}
                                <div className="flex flex-col gap-1.5">
                                    <label className={`${F.mono} text-[0.6rem] tracking-[2px] uppercase`} style={{ color: C.t4 }}>
                                        // اسم التصنيف
                                    </label>
                                    <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)}
                                        placeholder="مثال: رياضة، صحة، طعام..." required
                                        className={`${F.ar} border px-3 py-2.5 text-[0.82rem] outline-none transition-colors focus:brightness-125`}
                                        style={{ background: C.card2, borderColor: errors.name ? C.red : C.b, color: C.t1 }} />
                                    {errors.name && <div className={`${F.mono} text-[0.65rem]`} style={{ color: C.red }}>{errors.name}</div>}
                                </div>

                                {/* الأيقونة */}
                                <div className="flex flex-col gap-1.5">
                                    <label className={`${F.mono} text-[0.6rem] tracking-[2px] uppercase`} style={{ color: C.t4 }}>
                                        // الأيقونة
                                    </label>
                                    <div className="grid grid-cols-7 gap-1.5 border p-2" style={{ borderColor: C.b, background: C.card2 }}>
                                        {ICON_KEYS.map(key => {
                                            const Ic = CAT_ICONS[key];
                                            const active = data.icon === key;
                                            return (
                                                <button type="button" key={key} title={key} onClick={() => setData('icon', key)}
                                                    className="flex aspect-square items-center justify-center border transition-all"
                                                    style={{
                                                        borderColor: active ? data.color_hex : C.b,
                                                        background: active ? `${data.color_hex}15` : 'transparent',
                                                        color: active ? data.color_hex : C.t3,
                                                    }}>
                                                    <Ic />
                                                </button>
                                            );
                                        })}
                                    </div>
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
                                    style={{ borderColor: `${C.cyan}88`, color: C.cyan, background: `${C.cyan}0d` }}>
                                    {processing ? '// جاري الحفظ...' : modalMode === 'edit' ? '// تحديث //' : '// حفظ //'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* CONFIRM DELETE MODAL */}
                {confirmDelete && (
                    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
                        onClick={(e) => e.target === e.currentTarget && setConfirmDelete(null)}>
                        <div className="w-full max-w-[380px] border shadow-2xl" style={{ background: C.card, borderColor: C.bHot }}>
                            <div className="border-b px-5 py-3" style={{ borderColor: C.b, background: C.card2 }}>
                                <div className={`${F.head} text-[0.82rem] font-bold tracking-[3px] uppercase flex items-center gap-2`} style={{ color: C.red }}>
                                    <IcoWarn /> تأكيد الحذف
                                </div>
                            </div>
                            <div className="p-5">
                                <div className={`${F.ar} text-[0.85rem] leading-6 mb-1`} style={{ color: C.t1 }}>
                                    هل تريد حذف التصنيف:
                                </div>
                                <div className={`${F.head} text-[1.05rem] font-bold mb-3`} style={{ color: confirmDelete.color_hex }}>
                                    {confirmDelete.name}
                                </div>
                                <div className={`${F.ar} text-[0.75rem] border p-2.5 mb-4`} style={{ borderColor: `${C.red}44`, color: C.t3, background: `${C.red}0d` }}>
                                    ⚠️ هذا الإجراء لا يمكن التراجع عنه. العمليات المرتبطة بهذا التصنيف ستبقى لكنها لن تظهر تحت أي فئة.
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
                    {sub && <div className={`${F.ar} text-[0.65rem] mt-0.5 truncate max-w-[120px]`} style={{ color: C.t3 }}>{sub}</div>}
                </div>
                {icon && <span style={{ color, opacity: 0.6 }}>{icon}</span>}
            </div>
        </div>
    );
}