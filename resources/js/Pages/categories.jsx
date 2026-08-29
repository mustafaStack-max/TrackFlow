import { useEffect, useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const COLORS = ['#00e676', '#00d4ff', '#ffab00', '#ff3d5a', '#b388ff', '#40c4ff', '#ff6d00', '#69f0ae', '#ffd740', '#ea80fc'];

/* ── inline icons (1:1 with the original sprite paths) ── */
const IcoCatDefault = (p) => (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.3" {...p}>
        <circle cx="10" cy="10" r="7" />
    </svg>
);
const IcoCatSymbol = (p) => (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.3" {...p}>
        <rect x="2" y="2" width="7" height="7" rx="1" />
        <rect x="11" y="2" width="7" height="7" rx="1" />
        <rect x="2" y="11" width="7" height="7" rx="1" />
        <path d="M14.5 11v7M11 14.5h7" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
);
const IcoEdit = (p) => (
    <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.3" {...p}>
        <path d="M14 2l4 4-10 10H4v-4L14 2z" strokeLinejoin="round" />
    </svg>
);
const IcoDel = (p) => (
    <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}>
        <polyline points="4,6 16,6" strokeLinecap="round" />
        <path d="M8 6V4h4v2" strokeWidth="1.3" strokeLinecap="round" />
        <path d="M5 6l1 11h8l1-11" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IcoPlus = (p) => (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}>
        <line x1="10" y1="3" x2="10" y2="17" strokeLinecap="round" />
        <line x1="3" y1="10" x2="17" y2="10" strokeLinecap="round" />
    </svg>
);
const IcoCheck = (p) => (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}>
        <path d="M6 10l2.5 2.5L14 7" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="10" cy="10" r="8" />
    </svg>
);

/* same three families as the rest of the app — make sure they're loaded once
   (Share Tech Mono / Rajdhani / IBM Plex Sans Arabic), no separate stylesheet needed here */
const F_MONO = "font-['Share_Tech_Mono',monospace]";
const F_HEAD = "font-['Rajdhani',sans-serif]";
const F_AR = "font-['IBM_Plex_Sans_Arabic',sans-serif]";

export default function Categories({ Categories = [] }) {
    const { message } = usePage().props;
    const [toastMessage, setToastMessage] = useState(null);
    const [toastVisible, setToastVisible] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [currentCategoryId, setCurrentCategoryId] = useState(null);

    const totalCategories = Categories.length;
    const systemCategories = Categories.filter((c) => c.is_system).length;
    const customCategories = Categories.filter((c) => !c.is_system).length;

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        name: '',
        icon: 'Category',
        color_hex: '#00e676',
    });

    useEffect(() => {
        if (message) {
            setToastMessage(message);
            setToastVisible(true);
            const hide = setTimeout(() => setToastVisible(false), 2700);
            const clear = setTimeout(() => setToastMessage(null), 3000);
            return () => {
                clearTimeout(hide);
                clearTimeout(clear);
            };
        }
    }, [message]);

    const openCreateModal = () => {
        setModalMode('create');
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (category) => {
        setModalMode('edit');
        setCurrentCategoryId(category.id);
        setData({
            name: category.name,
            icon: category.icon || '',
            color_hex: category.color_hex || '#00e676',
        });
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

    const handleDelete = (id) => {
        if (confirm('هل أنت متأكد من رغبتك في حذف هذا التصنيف؟')) {
            destroy(route('categories.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="إدارة التصنيفات" />
            <div dir="rtl" className="">
                {/* HEADER */}
                <div className="flex items-start justify-between mb-[18px]">
                    <div>
                        <div className={`${F_HEAD} text-[1.3rem] font-bold tracking-[3px] uppercase text-[#e8f5ef]`}>
                            إدارة <em className={`${F_HEAD} not-italic text-[#00e676]`}>التصنيفات</em>
                        </div>
                        <div className={`${F_MONO} text-[0.72rem] text-[#2d4a38] tracking-[2px] mt-1`}>
                            // CATEGORIES MANAGEMENT // SYSTEM + CUSTOM
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={openCreateModal}
                        className={`${F_HEAD} flex items-center gap-1.5 bg-transparent border border-[#00d4ff] px-[13px] py-[5px] text-[#00d4ff] text-[0.75rem] font-semibold tracking-[1.5px] uppercase cursor-pointer transition-colors duration-150 hover:bg-[rgba(0,212,255,0.08)]`}
                    >
                        <IcoPlus /> تصنيف جديد
                    </button>
                </div>

                {/* STATS BAR */}
                <div className="bg-[#101820] border border-[rgba(0,230,118,0.13)] px-5 py-[18px] mb-[22px] flex flex-wrap justify-between items-center gap-4">
                    <div className="flex gap-8 flex-wrap">
                        <div>
                            <div className={`${F_MONO} text-[0.6rem] tracking-[2px] text-[#2d4a38] uppercase mb-1`}>TOTAL</div>
                            <div className={`${F_MONO} text-[1.3rem] text-[#00d4ff]`}>{totalCategories}</div>
                        </div>
                        <div>
                            <div className={`${F_MONO} text-[0.6rem] tracking-[2px] text-[#2d4a38] uppercase mb-1`}>SYSTEM</div>
                            <div className={`${F_MONO} text-[1.1rem] text-[#00e676]`}>{systemCategories}</div>
                        </div>
                        <div>
                            <div className={`${F_MONO} text-[0.6rem] tracking-[2px] text-[#2d4a38] uppercase mb-1`}>CUSTOM</div>
                            <div className={`${F_MONO} text-[1.1rem] text-[#ffc107]`}>{customCategories}</div>
                        </div>
                    </div>
                    <div className="text-left">
                        <div className={`${F_MONO} text-[0.6rem] tracking-[3px] text-[#2d4a38] uppercase mb-1`}>ACTIVE STATUS</div>
                        <div className={`${F_HEAD} text-[1.2rem] font-black text-[#00e676] tracking-[2px]`}>ONLINE</div>
                    </div>
                </div>

                {/* CATEGORIES GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {Categories.map((category) => {
                        const color = category.color_hex || '#00e676';
                        const isSystem = !!category.is_system;
                        return (
                            <div
                                key={category.id}
                                className="bg-[#101820] border border-[rgba(0,230,118,0.13)] p-4 relative overflow-hidden transition-all duration-200 hover:border-[rgba(0,230,118,0.45)] hover:-translate-y-px"
                            >
                                <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: color }} />

                                <div className="flex justify-between items-start mb-[10px] mt-1">
                                    <div
                                        className="w-[38px] h-[38px] flex items-center justify-center border"
                                        style={{ borderColor: `${color}44`, background: `${color}15`, color }}
                                    >
                                        <IcoCatDefault />
                                    </div>

                                    <div className="flex gap-1.5">
                                        {!isSystem ? (
                                            <>
                                                <button
                                                    type="button"
                                                    title="تعديل"
                                                    onClick={() => openEditModal(category)}
                                                    className="bg-transparent border border-[rgba(0,230,118,0.13)] text-[#5a8068] w-[26px] h-[26px] flex items-center justify-center cursor-pointer transition-all duration-150 hover:border-[#ffc107] hover:text-[#ffc107] hover:bg-[rgba(255,193,7,0.1)]"
                                                >
                                                    <IcoEdit />
                                                </button>
                                                <button
                                                    type="button"
                                                    title="حذف"
                                                    onClick={() => handleDelete(category.id)}
                                                    className="bg-transparent border border-[rgba(0,230,118,0.13)] text-[#5a8068] w-[26px] h-[26px] flex items-center justify-center cursor-pointer transition-all duration-150 hover:border-[rgba(255,61,90,0.3)] hover:text-[#ff3d5a] hover:bg-[rgba(255,61,90,0.1)]"
                                                >
                                                    <IcoDel />
                                                </button>
                                            </>
                                        ) : (
                                            <span className={`${F_MONO} text-[0.55rem] tracking-[2px] px-1.5 py-0.5 bg-[rgba(0,230,118,0.07)] border border-[rgba(0,230,118,0.13)] text-[#5a8068]`}>
                                                SYSTEM
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className={`${F_HEAD} text-[0.92rem] font-bold text-[#e8f5ef] mb-[3px]`}>{category.name}</div>
                                {category.icon && (
                                    <div className={`${F_MONO} text-[0.68rem] mt-1`} style={{ color }}>
                                        {category.icon}
                                    </div>
                                )}
                                <div className={`${F_MONO} text-[0.68rem] text-[#a8c4b0] mt-1.5`}>
                                    {category.usage_count || 0} عملية هذا الشهر
                                </div>
                            </div>
                        );
                    })}

                    {/* ADD NEW CATEGORY */}
                    <div
                        onClick={openCreateModal}
                        className="bg-[#101820] border-2 border-dashed p-4 flex flex-col items-center justify-center gap-2.5 cursor-pointer transition-colors duration-200 min-h-[140px]"
                        style={{ borderColor: 'rgba(0,212,255,0.3)' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,212,255,0.06)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                        <IcoPlus width="26" height="26" style={{ color: '#00d4ff', opacity: 0.6 }} />
                        <div className={`${F_HEAD} text-[0.92rem] text-[#5a8068]`}>تصنيف جديد</div>
                    </div>
                </div>

                {/* MODAL */}
                {isModalOpen && (
                    <div
                        className="fixed inset-0 bg-black/85 backdrop-blur-[6px] z-[1000] flex items-center justify-center p-5"
                        onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}
                    >
                        <div className="bg-[#101820] border border-[rgba(0,230,118,0.45)] w-full max-w-[420px] relative shadow-[0_0_80px_rgba(0,230,118,0.1)]">
                            <div className="flex items-center justify-between px-5 py-[15px] border-b border-[rgba(0,230,118,0.13)] bg-[#141e27]">
                                <div className={`${F_HEAD} text-[0.92rem] font-bold tracking-[3px] uppercase text-[#00e676] flex items-center gap-2.5`}>
                                    {modalMode === 'edit' ? <IcoEdit /> : <IcoCatSymbol />}
                                    {modalMode === 'edit' ? `تعديل: ${data.name}` : 'تصنيف جديد'}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className={`${F_MONO} bg-transparent border border-[rgba(0,230,118,0.13)] text-[#a8c4b0] w-[30px] h-[30px] flex items-center justify-center cursor-pointer text-base transition-all duration-150 hover:border-[rgba(255,61,90,0.3)] hover:text-[#ff3d5a] hover:bg-[rgba(255,61,90,0.1)]`}
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className={`${F_MONO} text-[0.65rem] tracking-[2px] uppercase text-[#5a8068]`}>// اسم التصنيف</label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="مثال: رياضة، صحة..."
                                        required
                                        className={`${F_AR} bg-[#0c1117] border border-[rgba(0,230,118,0.13)] px-[13px] py-2.5 text-[#e8f5ef] text-[0.82rem] outline-none transition-colors duration-200 w-full focus:border-[rgba(0,230,118,0.45)] focus:shadow-[0_0_12px_rgba(0,230,118,0.07)]`}
                                    />
                                    {errors.name && <div className={`${F_MONO} text-[#ff3d5a] text-[0.7rem]`}>{errors.name}</div>}
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className={`${F_MONO} text-[0.65rem] tracking-[2px] uppercase text-[#5a8068]`}>// الاسم الإنجليزي (كأيقونة)</label>
                                    <input
                                        type="text"
                                        value={data.icon}
                                        onChange={(e) => setData('icon', e.target.value.toUpperCase())}
                                        placeholder="e.g. SHOPPING"
                                        className={`${F_MONO} bg-[#0c1117] border border-[rgba(0,230,118,0.13)] px-[13px] py-2.5 text-[#e8f5ef] text-[0.8rem] uppercase outline-none transition-colors duration-200 w-full focus:border-[rgba(0,230,118,0.45)] focus:shadow-[0_0_12px_rgba(0,230,118,0.07)]`}
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className={`${F_MONO} text-[0.65rem] tracking-[2px] uppercase text-[#5a8068]`}>// اللون</label>
                                    <div className="flex gap-2 flex-wrap">
                                        {COLORS.map((c) => (
                                            <button
                                                type="button"
                                                key={c}
                                                title={c}
                                                onClick={() => setData('color_hex', c)}
                                                style={{ background: c }}
                                                className={
                                                    'w-[26px] h-[26px] rounded-full cursor-pointer border-2 transition-all duration-150 p-0 hover:scale-[1.15] ' +
                                                    (data.color_hex === c ? 'border-[#e8f5ef] scale-[1.15]' : 'border-transparent hover:border-[#e8f5ef]')
                                                }
                                            />
                                        ))}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className={`${F_HEAD} bg-transparent border border-[#00d4ff] p-3 text-[#00d4ff] text-[0.92rem] font-bold tracking-[3px] uppercase cursor-pointer transition-colors duration-300 w-full hover:enabled:bg-[#00d4ff] hover:enabled:text-[#040507] hover:enabled:shadow-[0_0_30px_rgba(0,212,255,0.25)] disabled:opacity-40 disabled:cursor-not-allowed`}
                                >
                                    {processing ? '// جاري الحفظ...' : '// حفظ التصنيف //'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* TOAST */}
                {toastMessage && (
                    <div
                        className={
                            `fixed bottom-[22px] left-1/2 -translate-x-1/2 bg-[#101820] border border-[#00e676] text-[#00e676] px-[22px] py-[11px] z-[3000] flex items-center gap-2.5 whitespace-nowrap shadow-[0_0_30px_rgba(0,230,118,0.2)] transition-transform duration-300 ` +
                            (toastVisible ? 'translate-y-0' : 'translate-y-[70px]')
                        }
                    >
                        <IcoCheck />
                        <span className={`${F_MONO} text-[0.82rem] tracking-[1.5px]`}>{toastMessage}</span>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}