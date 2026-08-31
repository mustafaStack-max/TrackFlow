import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const COLORS = ['#00e676', '#00d4ff', '#ffab00', '#ff3d5a', '#b388ff', '#40c4ff', '#ff6d00', '#69f0ae', '#ffd740', '#ea80fc'];

const ACCOUNT_TYPES = [
    { value: 'cash', label: 'CASH' },
    { value: 'bank', label: 'BANK' },
    { value: 'card', label: 'CARD' },
    { value: 'savings', label: 'SAVE' },
    { value: 'other', label: 'OTHER' },
];

const MEMBER_ROLES = [
    { value: 'viewer', label: 'مشاهد (Viewer)' },
    { value: 'editor', label: 'محرر (Editor)' },
    { value: 'admin', label: 'مدير (Admin)' },
];

/* ── inline icons ── */
const IcoAccCash = (p) => (
    <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.3" {...p}>
        <rect x="2" y="5" width="16" height="11" rx="1.5" />
        <circle cx="10" cy="10.5" r="2.5" strokeWidth="1.2" />
        <line x1="2" y1="8.5" x2="5" y2="8.5" strokeWidth="1.2" />
        <line x1="15" y1="8.5" x2="18" y2="8.5" strokeWidth="1.2" />
    </svg>
);
const IcoAccBank = (p) => (
    <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.3" {...p}>
        <path d="M2 8h16M3 8V16M17 8V16M5 8V16M9 8V16M13 8V16M2 16h16" strokeLinecap="round" />
        <path d="M10 2L2 7h16z" strokeLinejoin="round" />
    </svg>
);
const IcoAccCard = (p) => (
    <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.3" {...p}>
        <rect x="1" y="4" width="18" height="13" rx="1.5" />
        <line x1="1" y1="8" x2="19" y2="8" strokeWidth="1.8" />
        <circle cx="5" cy="12" r="1.2" fill="currentColor" opacity="0.6" stroke="none" />
        <circle cx="8.5" cy="12" r="1.2" fill="currentColor" opacity="0.6" stroke="none" />
    </svg>
);
const IcoAccSavings = (p) => (
    <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.3" {...p}>
        <path d="M4 5h12a1 1 0 011 1v9a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1z" />
        <path d="M6 5V3.5a.5.5 0 01.5-.5h7a.5.5 0 01.5.5V5" strokeWidth="1.2" />
        <line x1="10" y1="8" x2="10" y2="13" strokeLinecap="round" />
        <line x1="7.5" y1="10.5" x2="12.5" y2="10.5" strokeLinecap="round" />
    </svg>
);
const IcoAccOther = (p) => (
    <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.3" {...p}>
        <rect x="3" y="3" width="14" height="14" rx="1" />
        <circle cx="7" cy="7" r="1.2" fill="currentColor" stroke="none" />
        <circle cx="13" cy="7" r="1.2" fill="currentColor" stroke="none" />
        <circle cx="7" cy="13" r="1.2" fill="currentColor" stroke="none" />
        <circle cx="13" cy="13" r="1.2" fill="currentColor" stroke="none" />
        <circle cx="10" cy="10" r="1.2" fill="currentColor" stroke="none" />
    </svg>
);
const ICONS_BY_TYPE = { cash: IcoAccCash, bank: IcoAccBank, card: IcoAccCard, savings: IcoAccSavings, other: IcoAccOther };

const IcoAccGeneric = (p) => (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.3" {...p}>
        <ellipse cx="10" cy="5" rx="8" ry="3" />
        <path d="M2 5v5c0 1.66 3.58 3 8 3s8-1.34 8-3V5" />
        <path d="M2 10v5c0 1.66 3.58 3 8 3s8-1.34 8-3v-5" />
    </svg>
);
const IcoEdit = (p) => (
    <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.3" {...p}>
        <path d="M14 2l4 4-10 10H4v-4L14 2z" strokeLinejoin="round" />
    </svg>
);
const IcoDel = (p) => (
    <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}>
        <polyline points="4,6 16,6" strokeLinecap="round" />
        <path d="M8 6V4h4v2" strokeWidth="1.3" strokeLinecap="round" />
        <path d="M5 6l1 11h8l1-11" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IcoUsers = (p) => (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.3" {...p}>
        <path d="M7 10a3 3 0 100-6 3 3 0 000 6zM13 10a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
        <path d="M2 17a5 5 0 0110 0M11 17a4.5 4.5 0 018 0" />
    </svg>
);

function fmt(n) {
    return Number(n || 0).toLocaleString('ar-MA', { minimumFractionDigits: 0 });
}

const F_MONO = "font-['Share_Tech_Mono',monospace]";
const F_HEAD = "font-['Rajdhani',sans-serif]";
const F_AR = "font-['IBM_Plex_Sans_Arabic',sans-serif]";

export default function Accounts({ accounts = [] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState(null);
    const [membersModalAccountId, setMembersModalAccountId] = useState(null);

    const membersModalAccount = accounts.find((a) => a.id === membersModalAccountId || a.uuid === membersModalAccountId) || null;

    const totalNetWorth = accounts.reduce((acc, curr) => acc + parseFloat(curr.balance || 0), 0);
    const totalIncome = accounts.reduce((acc, curr) => acc + parseFloat(curr.total_income || 0), 0);
    const totalExpense = accounts.reduce((acc, curr) => acc + parseFloat(curr.total_expense || 0), 0);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        name: '',
        type: 'cash',
        balance: '0.00',
        color_hex: '#00e676',
    });

    const memberForm = useForm({
        user_id: '',
        role: 'viewer',
        spend_limit: '',
    });

    const openCreateModal = () => {
        setEditingAccount(null);
        reset();
        setIsModalOpen(true);
    };

    const openEditModal = (account) => {
        setEditingAccount(account);
        setData({
            name: account.name,
            type: account.type,
            balance: account.balance,
            color_hex: account.color_hex || '#00e676',
        });
        setIsModalOpen(true);
    };

    const openMembersModal = (account) => {
        setMembersModalAccountId(account.id);
        memberForm.reset();
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

    const handleDelete = (id) => {
        if (confirm('هل تريد تعطيل هذا الحساب؟')) {
            destroy(route('accounts.destroy', id));
        }
    };

    const handleAddMember = (e) => {
        e.preventDefault();
        if (!membersModalAccount) return;

        memberForm.post(route('accounts.members.store', membersModalAccount.id), {
            onSuccess: () => {
                memberForm.reset();
            },
        });
    };

    const handleRemoveMember = (userId) => {
        if (confirm('هل أنت تأكد من إزالة هذا العضو؟')) {
            destroy(route('accounts.members.destroy', [membersModalAccount.id, userId]));
        }
    };

    return (
        <AuthenticatedLayout>
            <div dir="rtl">
                {/* HEADER */}
                <div className="flex items-start justify-between mb-[18px]">
                    <div>
                        <div className={`${F_HEAD} text-[1.3rem] font-bold tracking-[3px] uppercase text-[#e8f5ef]`}>
                            إدارة <em className={`${F_HEAD} not-italic text-[#00e676]`}>الحسابات</em>
                        </div>
                        <div className={`${F_MONO} text-[0.72rem] text-[#2d4a38] tracking-[2px] mt-1`}>
                            // ACCOUNTS MANAGEMENT // ADD · EDIT · MEMBERS · MONITOR
                        </div>
                    </div>
                </div>

                {/* TOTAL SUMMARY BAR */}
                <div className="bg-gradient-to-br from-[rgba(255,215,0,0.06)] to-[rgba(0,230,118,0.04)] border border-[rgba(255,215,0,0.2)] px-[22px] py-[18px] flex items-center gap-[30px] flex-wrap mb-[22px]">
                    <div>
                        <div className={`${F_MONO} text-[0.6rem] tracking-[3px] text-[#2d4a38] mb-[5px]`}>TOTAL NET WORTH</div>
                        <div className={`${F_MONO} text-[2rem] text-[#ffd700] tracking-[-1px] [text-shadow:0_0_25px_rgba(255,215,0,0.4)]`}>
                            {fmt(totalNetWorth)} MAD
                        </div>
                    </div>
                    <div className="w-px h-[50px] bg-[rgba(255,215,0,0.15)]" />
                    <div className="flex gap-5 flex-wrap">
                        <div>
                            <div className={`${F_MONO} text-[0.58rem] tracking-[2px] text-[#2d4a38] mb-1`}>TOTAL INCOME</div>
                            <div className={`${F_MONO} text-[1.1rem] text-[#00e676]`}>{fmt(totalIncome)} MAD</div>
                        </div>
                        <div>
                            <div className={`${F_MONO} text-[0.58rem] tracking-[2px] text-[#2d4a38] mb-1`}>TOTAL EXPENSE</div>
                            <div className={`${F_MONO} text-[1.1rem] text-[#ff3d5a]`}>{fmt(totalExpense)} MAD</div>
                        </div>
                        <div>
                            <div className={`${F_MONO} text-[0.58rem] tracking-[2px] text-[#2d4a38] mb-1`}>ACCOUNTS</div>
                            <div className={`${F_MONO} text-[1.1rem] text-[#00d4ff]`}>{accounts.length}</div>
                        </div>
                    </div>
                </div>

                {/* ACCOUNT GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[14px]">
                    {accounts.map((account) => {
                        const rb = parseFloat(account.balance || 0);
                        const inc = parseFloat(account.total_income || 0);
                        const exp = parseFloat(account.total_expense || 0);
                        const usagePct = exp > 0 ? Math.min((exp / Math.max(rb, 1)) * 100, 100) : 0;
                        const color = account.color_hex || '#00e676';
                        const TypeIco = ICONS_BY_TYPE[account.type] || IcoAccOther;
                        const membersCount = account.members?.length || 0;

                        // الصلاحيات والمالك
                        const role = account.current_user_role || 'owner';
                        const isOwnerOrAdmin = role === 'owner' || role === 'admin';
                        const canEdit = role === 'owner' || role === 'admin' || role === 'editor';
                        const ownerName = account.user?.name || account.user?.email || 'حساب شخصي';

                        return (
                            <div
                                key={account.uuid}
                                className="bg-[#101820] border border-[rgba(0,230,118,0.13)] p-5 relative overflow-hidden transition-[border-color,transform] duration-200 hover:border-[rgba(0,230,118,0.45)] hover:-translate-y-0.5 flex flex-col justify-between"
                            >
                                <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: color }} />

                                <div>
                                    {/* شريط معلومات المالك والصلاحية */}
                                    <div className="flex justify-between items-center mb-3 pb-2 border-b border-[rgba(255,255,255,0.06)]">
                                        <div className={`${F_MONO} text-[0.63rem] text-[#5a8068] truncate max-w-[60%]`}>
                                            المالك: <span className="text-[#e8f5ef] font-semibold">{ownerName}</span>
                                        </div>
                                        <span className={`${F_MONO} text-[0.58rem] px-2 py-0.5 border uppercase tracking-[1px] font-bold ${
                                            role === 'owner' ? 'border-[#00e676]/40 text-[#00e676] bg-[#00e676]/10' :
                                            role === 'admin' ? 'border-[#ffd700]/40 text-[#ffd700] bg-[#ffd700]/10' :
                                            role === 'editor' ? 'border-[#00d4ff]/40 text-[#00d4ff] bg-[#00d4ff]/10' :
                                            'border-[#a8c4b0]/40 text-[#a8c4b0] bg-[#a8c4b0]/10'
                                        }`}>
                                            {role === 'owner' ? 'المالك' : role === 'admin' ? 'مدير' : role === 'editor' ? 'محرر' : 'مشاهد'}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-start mb-[14px]">
                                        <div>
                                            <div className={`${F_HEAD} text-[1.05rem] font-bold text-[#e8f5ef] tracking-[.5px] flex items-center gap-1.5`}>
                                                <TypeIco width="15" height="15" style={{ color }} />
                                                <span>{account.name}</span>
                                            </div>
                                            <div
                                                className={`${F_MONO} inline-block mt-1 text-[0.62rem] tracking-[2px] uppercase px-2 py-0.5 border`}
                                                style={{ color, borderColor: `${color}44`, background: `${color}11` }}
                                            >
                                                {(account.type || 'other').toUpperCase()}
                                            </div>
                                        </div>
                                        
                                        {/* الأزرار المحمية حسب الصلاحية */}
                                        <div className="flex gap-1.5">
                                            {isOwnerOrAdmin && (
                                                <button
                                                    type="button"
                                                    title="الأعضاء المشاركون"
                                                    onClick={() => openMembersModal(account)}
                                                    className="bg-transparent border border-[rgba(0,212,255,0.25)] text-[#00d4ff] px-2 h-[30px] flex items-center gap-1.5 cursor-pointer transition-all duration-150 hover:border-[#00d4ff] hover:bg-[rgba(0,212,255,0.1)]"
                                                >
                                                    <IcoUsers />
                                                    <span className={`${F_MONO} text-[0.68rem] font-bold`}>{membersCount}</span>
                                                </button>
                                            )}

                                            {canEdit && (
                                                <button
                                                    type="button"
                                                    title="تعديل"
                                                    onClick={() => openEditModal(account)}
                                                    className="bg-transparent border border-[rgba(0,230,118,0.13)] text-[#5a8068] w-[30px] h-[30px] flex items-center justify-center cursor-pointer transition-all duration-150 hover:border-[#ffc107] hover:text-[#ffc107] hover:bg-[rgba(255,193,7,0.1)]"
                                                >
                                                    <IcoEdit />
                                                </button>
                                            )}

                                            {isOwnerOrAdmin && (
                                                <button
                                                    type="button"
                                                    title="حذف"
                                                    onClick={() => handleDelete(account.id)}
                                                    className="bg-transparent border border-[rgba(0,230,118,0.13)] text-[#5a8068] w-[30px] h-[30px] flex items-center justify-center cursor-pointer transition-all duration-150 hover:border-[rgba(255,61,90,0.3)] hover:text-[#ff3d5a] hover:bg-[rgba(255,61,90,0.1)]"
                                                >
                                                    <IcoDel />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-baseline gap-2 mb-[14px]">
                                        <div className={`${F_MONO} text-[2rem] font-normal tracking-[-1.5px]`} style={{ color, textShadow: `0 0 20px ${color}44` }}>
                                            {fmt(rb)}
                                        </div>
                                        <div className={`${F_MONO} text-[0.75rem] text-[#5a8068]`}>MAD</div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 mb-[14px]">
                                        <div className="bg-[#141e27] px-[10px] py-2">
                                            <div className={`${F_MONO} text-[0.6rem] text-[#5a8068] tracking-[1px] uppercase mb-[3px]`}>↑ دخل</div>
                                            <div className={`${F_MONO} text-[0.9rem] font-semibold text-[#00e676]`}>+{inc.toFixed(0)}</div>
                                        </div>
                                        <div className="bg-[#141e27] px-[10px] py-2">
                                            <div className={`${F_MONO} text-[0.6rem] text-[#5a8068] tracking-[1px] uppercase mb-[3px]`}>↓ مصروف</div>
                                            <div className={`${F_MONO} text-[0.9rem] font-semibold text-[#ff3d5a]`}>-{exp.toFixed(0)}</div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className={`${F_MONO} text-[0.62rem] text-[#2d4a38] tracking-[1px] mb-[5px]`}>
                                        {account.tx_count || 0} عملية // {usagePct.toFixed(0)}% استخدام
                                    </div>
                                    <div className="h-1 bg-[#18242e]">
                                        <div className="h-full transition-[width] duration-700 ease-out" style={{ width: `${usagePct}%`, background: color }} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* ADD NEW ACCOUNT */}
                    <div
                        onClick={openCreateModal}
                        className="bg-[#101820] border-2 border-dashed border-[rgba(0,230,118,0.13)] p-5 flex flex-col items-center justify-center gap-2.5 cursor-pointer transition-colors duration-200 hover:border-[#00e676] hover:bg-[rgba(0,230,118,0.07)] min-h-[260px]"
                    >
                        <div className={`${F_MONO} text-[2rem] opacity-40 text-[#a8c4b0]`}>+</div>
                        <div className={`${F_HEAD} text-[0.92rem] text-[#5a8068] tracking-[1px]`}>إضافة حساب جديد</div>
                        <div className={`${F_MONO} text-[0.65rem] text-[#2d4a38]`}>BANK · CASH · CARD · SAVINGS</div>
                    </div>
                </div>

                {/* ACCOUNT CREATE/EDIT MODAL */}
                {isModalOpen && (
                    <div
                        className="fixed inset-0 bg-black/85 backdrop-blur-[6px] z-[1000] flex items-center justify-center p-5"
                        onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}
                    >
                        <div className="bg-[#101820] border border-[rgba(0,230,118,0.45)] w-full max-w-[500px] relative shadow-[0_0_80px_rgba(0,230,118,0.1)]">
                            <div className="flex items-center justify-between px-5 py-[15px] border-b border-[rgba(0,230,118,0.13)] bg-[#141e27]">
                                <div className={`${F_HEAD} text-[0.92rem] font-bold tracking-[3px] uppercase text-[#00e676] flex items-center gap-2.5`}>
                                    {editingAccount ? <IcoEdit /> : <IcoAccGeneric />}
                                    {editingAccount ? `تعديل: ${editingAccount.name}` : 'حساب جديد'}
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
                                    <label className={`${F_MONO} text-[0.65rem] tracking-[2px] uppercase text-[#5a8068]`}>// اسم الحساب</label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="مثال: CIH Bank..."
                                        required
                                        className={`${F_AR} bg-[#0c1117] border border-[rgba(0,230,118,0.13)] px-[13px] py-2.5 text-[#e8f5ef] text-[0.82rem] outline-none transition-colors duration-200 w-full focus:border-[rgba(0,230,118,0.45)] focus:shadow-[0_0_12px_rgba(0,230,118,0.07)]`}
                                    />
                                    {errors.name && <div className={`${F_MONO} text-[#ff3d5a] text-[0.7rem]`}>{errors.name}</div>}
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className={`${F_MONO} text-[0.65rem] tracking-[2px] uppercase text-[#5a8068]`}>// نوع الحساب</label>
                                    <div className="grid grid-cols-5 gap-1.5">
                                        {ACCOUNT_TYPES.map((t) => {
                                            const Ico = ICONS_BY_TYPE[t.value];
                                            const active = data.type === t.value;
                                            return (
                                                <div
                                                    key={t.value}
                                                    onClick={() => setData('type', t.value)}
                                                    className={
                                                        'border px-1 py-2.5 cursor-pointer text-center transition-all duration-150 ' +
                                                        (active
                                                            ? 'border-[#00e676] bg-[rgba(0,230,118,0.07)]'
                                                            : 'border-[rgba(0,230,118,0.13)] bg-[#141e27] hover:border-[rgba(0,230,118,0.45)]')
                                                    }
                                                >
                                                    <div className={`flex justify-center mb-1 text-[1.4rem] ${active ? 'text-[#00e676]' : 'text-[#a8c4b0]'}`}>
                                                        <Ico width="22" height="22" />
                                                    </div>
                                                    <div className={`${F_MONO} text-[0.6rem] tracking-[1px] ${active ? 'text-[#00e676]' : 'text-[#5a8068]'}`}>
                                                        {t.label}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className={`${F_MONO} text-[0.65rem] tracking-[2px] uppercase text-[#5a8068]`}>// الرصيد الابتدائي (MAD)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={data.balance}
                                        onChange={(e) => setData('balance', e.target.value)}
                                        className={`${F_MONO} bg-[#0c1117] border border-[rgba(0,230,118,0.13)] px-[13px] py-2.5 text-[#00e676] text-[1.05rem] outline-none transition-colors duration-200 w-full focus:border-[rgba(0,230,118,0.45)] focus:shadow-[0_0_12px_rgba(0,230,118,0.07)]`}
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
                                    className={`${F_HEAD} bg-transparent border border-[#00e676] p-3 text-[#00e676] text-[0.92rem] font-bold tracking-[3px] uppercase cursor-pointer transition-colors duration-300 w-full hover:enabled:bg-[#00e676] hover:enabled:text-[#040507] hover:enabled:shadow-[0_0_30px_rgba(0,230,118,0.18)] disabled:opacity-40 disabled:cursor-not-allowed`}
                                >
                                    {processing ? '// جاري الحفظ...' : '// حفظ الحساب //'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* MEMBERS MANAGEMENT MODAL */}
                {membersModalAccount && (
                    <div
                        className="fixed inset-0 bg-black/85 backdrop-blur-[6px] z-[1000] flex items-center justify-center p-5"
                        onClick={(e) => e.target === e.currentTarget && setMembersModalAccountId(null)}
                    >
                        <div className="bg-[#101820] border border-[#00d4ff] w-full max-w-[550px] relative shadow-[0_0_80px_rgba(0,212,255,0.1)]">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between px-5 py-[15px] border-b border-[rgba(0,212,255,0.2)] bg-[#141e27]">
                                <div className={`${F_HEAD} text-[0.92rem] font-bold tracking-[3px] uppercase text-[#00d4ff] flex items-center gap-2`}>
                                    <IcoUsers />
                                    الأعضاء المشاركون: {membersModalAccount.name}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setMembersModalAccountId(null)}
                                    className={`${F_MONO} bg-transparent border border-[rgba(0,212,255,0.2)] text-[#a8c4b0] w-[30px] h-[30px] flex items-center justify-center cursor-pointer text-base transition-all duration-150 hover:border-[#ff3d5a] hover:text-[#ff3d5a] hover:bg-[rgba(255,61,90,0.1)]`}
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="p-5 flex flex-col gap-5">
                                {/* Form: Add New Member */}
                                <form onSubmit={handleAddMember} className="bg-[#141e27] border border-[rgba(0,212,255,0.15)] p-4 flex flex-col gap-3">
                                    <div className={`${F_MONO} text-[0.65rem] tracking-[2px] uppercase text-[#00d4ff]`}>
                                        // دعوة عضو جديد (INVITE MEMBER)
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <input
                                            type="text"
                                            placeholder="   ID المستخدم..."
                                            value={memberForm.data.user_id}
                                            onChange={(e) => memberForm.setData('user_id', e.target.value)}
                                            required
                                            className={`${F_AR} bg-[#0c1117] border border-[rgba(0,212,255,0.2)] px-[13px] py-2 text-[#e8f5ef] text-[0.82rem] outline-none focus:border-[#00d4ff]`}
                                        />
                                        {memberForm.errors.user_id && (
                                            <div className={`${F_MONO} text-[#ff3d5a] text-[0.68rem]`}>{memberForm.errors.user_id}</div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <select
                                                value={memberForm.data.role}
                                                onChange={(e) => memberForm.setData('role', e.target.value)}
                                                className={`${F_AR} bg-[#0c1117] border border-[rgba(0,212,255,0.2)] px-2 py-2 text-[#e8f5ef] text-[0.78rem] outline-none w-full`}
                                            >
                                                {MEMBER_ROLES.map((r) => (
                                                    <option key={r.value} value={r.value} className="bg-[#101820]">
                                                        {r.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <input
                                                type="number"
                                                placeholder="حد الإنفاق (اختياري)"
                                                value={memberForm.data.spend_limit}
                                                onChange={(e) => memberForm.setData('spend_limit', e.target.value)}
                                                className={`${F_MONO} bg-[#0c1117] border border-[rgba(0,212,255,0.2)] px-[10px] py-2 text-[#00e676] text-[0.8rem] outline-none w-full`}
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={memberForm.processing}
                                        className={`${F_HEAD} bg-transparent border border-[#00d4ff] py-2 text-[#00d4ff] text-[0.82rem] font-bold tracking-[2px] uppercase cursor-pointer hover:enabled:bg-[#00d4ff] hover:enabled:text-[#040507] disabled:opacity-40`}
                                    >
                                        {memberForm.processing ? '// جاري الإضافة...' : '+ إضافة العضو'}
                                    </button>
                                </form>

                                {/* List: Existing Members */}
                                <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
                                    <div className={`${F_MONO} text-[0.65rem] tracking-[2px] uppercase text-[#5a8068]`}>
                                        // قائمة الأعضاء (MEMBERS LIST)
                                    </div>

                                    {(!membersModalAccount.members || membersModalAccount.members.length === 0) ? (
                                        <div className={`${F_MONO} text-[0.75rem] text-[#2d4a38] text-center py-4 border border-dashed border-[rgba(0,230,118,0.1)]`}>
                                            لا يوجد أعضاء مشاركون في هذا الحساب حالياً
                                        </div>
                                    ) : (
                                        membersModalAccount.members.map((m) => (
                                            <div
                                                key={m.id}
                                                className="bg-[#141e27] border border-[rgba(0,230,118,0.1)] px-3 py-2.5 flex items-center justify-between"
                                            >
                                                <div>
                                                    <div className={`${F_AR} text-[0.85rem] text-[#e8f5ef] font-semibold`}>
                                                        {m.username || m.name || m.email}
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className={`${F_MONO} text-[0.6rem] uppercase tracking-[1px] px-1.5 py-0.2 border border-[#00d4ff]/30 text-[#00d4ff] bg-[#00d4ff]/10`}>
                                                            {m.pivot?.role || 'viewer'}
                                                        </span>
                                                        {m.pivot?.spend_limit && (
                                                            <span className={`${F_MONO} text-[0.6rem] text-[#ffd700]`}>
                                                                حد الإنفاق: {fmt(m.pivot.spend_limit)} MAD
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveMember(m.id)}
                                                    className="bg-transparent border border-[rgba(255,61,90,0.2)] text-[#ff3d5a] w-[26px] h-[26px] flex items-center justify-center cursor-pointer hover:bg-[rgba(255,61,90,0.15)]"
                                                    title="إزالة العضو"
                                                >
                                                    <IcoDel />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}