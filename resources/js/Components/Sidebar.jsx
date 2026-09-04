
import { Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { COLORS as C, FONT as F } from '@/Components/Dashboard/theme';

const NAV_GROUPS = [
    {
        title: 'الرئيسية',
        items: [
            { key: 'dashboard', label: 'لوحة التحكم', routeName: 'dashboard', icon: 'grid' },
            { key: 'transactions', label: 'المعاملات', routeName: 'transactions.index', icon: 'receipt', countKey: 'transactions' },
            { key: 'accounts', label: 'الحسابات', routeName: 'accounts.index', icon: 'wallet', countKey: 'accounts' },
            { key: 'analytics', label: 'التحليلات', routeName: 'analytics.index', icon: 'chart' },
        ],
    },
    {
        title: 'الإدارة المالية',
        items: [
            { key: 'budgets', label: 'الميزانيات', routeName: 'budgets.index', icon: 'card' },
            { key: 'goals', label: 'الأهداف المالية', routeName: 'goals.index', icon: 'target', countKey: 'goals' },
            { key: 'categories', label: 'التصنيفات', routeName: 'categories.index', icon: 'tag' },
            { key: 'audit', label: 'سجل العمليات', routeName: 'audit.index', icon: 'clock' },
        ],
    },
];

/* أيقونات خطية بنفس روح اللوحة */
const ICONS = {
    grid: (p) => (<svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><rect x="3" y="3" width="6" height="8" rx="0.5" /><rect x="11" y="3" width="6" height="4" rx="0.5" /><rect x="11" y="9" width="6" height="8" rx="0.5" /><rect x="3" y="13" width="6" height="4" rx="0.5" /></svg>),
    receipt: (p) => (<svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path d="M5 2v16l2.5-1.5L10 18l2.5-1.5L15 18V2l-2.5 1.5L10 2 7.5 3.5 5 2z" strokeLinejoin="round" /><path d="M8 7h4M8 10.5h4" strokeLinecap="round" /></svg>),
    wallet: (p) => (<svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><rect x="2" y="5" width="16" height="11" rx="1" /><path d="M2 8.5h16" /><circle cx="14.5" cy="12" r="1" fill="currentColor" stroke="none" /></svg>),
    chart: (p) => (<svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path d="M3 17V9M8 17V4M13 17v-6M18 17V7" strokeLinecap="round" /></svg>),
    card: (p) => (<svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><rect x="2" y="4" width="16" height="12" rx="1" /><path d="M2 8h16M5 12.5h4" strokeLinecap="round" /></svg>),
    target: (p) => (<svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><circle cx="10" cy="10" r="7.5" /><circle cx="10" cy="10" r="4" /><circle cx="10" cy="10" r="1" fill="currentColor" stroke="none" /></svg>),
    tag: (p) => (<svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path d="M17.5 10.5l-7 7L3 10V3h7l7.5 7.5z" strokeLinejoin="round" /><circle cx="7" cy="7" r="1.2" fill="currentColor" stroke="none" /></svg>),
    clock: (p) => (<svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><circle cx="10" cy="10" r="7.5" /><path d="M10 6v4l2.5 2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>),
    help: (p) => (<svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><circle cx="10" cy="10" r="7.5" /><path d="M8 8a2 2 0 1 1 2.8 1.8c-.6.3-.8.7-.8 1.4" strokeLinecap="round" /><circle cx="10" cy="13.8" r="0.9" fill="currentColor" stroke="none" /></svg>),
    gear: (p) => (<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><circle cx="10" cy="10" r="2.4" /><path d="M10 2.5v2M10 15.5v2M17.5 10h-2M4.5 10h-2M15.3 4.7l-1.4 1.4M6.1 13.9l-1.4 1.4M15.3 15.3l-1.4-1.4M6.1 6.1L4.7 4.7" strokeLinecap="round" /></svg>),
    collapse: (p) => (<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><path d="M12 4l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>),
    expand: (p) => (<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><path d="M8 4l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>),
    x: (p) => (<svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" /></svg>),
    menu: (p) => (<svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><path d="M3 6h14M3 10h14M3 14h14" strokeLinecap="round" /></svg>),
};

function BrandMark({ collapsed }) {
    return (
        <div className="flex items-center gap-2.5 min-w-0">
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none" className="shrink-0">
                <rect x="1" y="1" width="24" height="24" stroke={C.green} strokeWidth="1.5" />
                <path d="M7 16l4-6 3 4 5-7" stroke={C.green} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {!collapsed && (
                <div className="min-w-0">
                    <div className={`${F.head} text-[1rem] font-bold tracking-[1.5px]`} style={{ color: C.t1 }}>
                        TRACK<span style={{ color: C.green }}>FLOW</span>
                    </div>
                    <div className={`${F.mono} text-[0.52rem] tracking-[2.5px]`} style={{ color: C.t4 }}>FINANCIAL OS</div>
                </div>
            )}
        </div>
    );
}

function SidebarItem({  item, count, collapsed, onNavigate }) {
    const Icon = ICONS[item.icon] || ICONS.grid;
    const exists = route().has(item.routeName);
    const active = exists && route().current(item.routeName);

    if (!exists) {
        return (
            <div title={collapsed ? item.label : undefined}
                className={`flex h-10 items-center gap-3 px-3 opacity-35 ${collapsed ? 'justify-center' : ''}`}>
                <span style={{ color: C.t4 }}><Icon /></span>
                {!collapsed && <span className={`${F.ar} text-[0.78rem] flex-1 truncate`} style={{ color: C.t3 }}>{item.label}</span>}
                {!collapsed && <span className={`${F.mono} text-[0.52rem] tracking-[1px]`} style={{ color: C.t4 }}>SOON</span>}
            </div>
        );
    }

    return (
        <Link href={route(item.routeName)} onClick={onNavigate} title={collapsed ? item.label : undefined}
            className={`relative flex h-10 items-center gap-3 border-r-2 transition-colors duration-150 ${collapsed ? 'justify-center px-0' : 'px-3'} ${!active ? 'hover:bg-white/[0.04]' : ''}`}
            style={{
                color: active ? C.green : C.t3,
                background: active ? C.greenTrace : undefined,
                borderRightColor: active ? C.green : 'transparent',
            }}>
            <span className="shrink-0"><Icon /></span>
            {!collapsed && <span className={`${F.ar} text-[0.8rem] font-medium flex-1 truncate`}>{item.label}</span>}
            {!collapsed && count !== undefined && (
                <span className={`${F.mono} text-[0.6rem] px-1.5 py-0.5 border`}
                    style={{ borderColor: active ? `${C.green}55` : C.b, color: active ? C.green : C.t4 }}>
                    {count}
                </span>
            )}
            {collapsed && count > 0 && (
                <span className="absolute top-1.5 left-1.5 w-1.5 h-1.5" style={{ background: C.green }} />
            )}
        </Link>
    );
}

export default function Sidebar({ auth , mobileOpen = false, onMobileClose }) {
    const { props } = usePage();
    const navCounts = props.navCounts ?? {};
    const user = auth?.user ?? props.auth.user ?? null;
    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        if (localStorage.getItem('tf_sidebar_collapsed') === '1') setCollapsed(true);
    }, []);

    useEffect(() => {
        document.documentElement.classList.toggle('sidebar-collapsed', collapsed);
    }, [collapsed]);

    const initials = String(user?.username ?? 'U').trim().split(/\s+/).slice(0, 2).map((n) => n[0]).join('').toUpperCase() || 'U';
    const profileExists = route().has('profile.edit');

    const Nav = ({ isCollapsed }) => (
        <nav className="flex-1 overflow-y-auto px-2 pb-4">
            {NAV_GROUPS.map((group, gi) => (
                <div key={group.title} className={gi > 0 ? 'mt-6' : 'mt-5'}>
                    {!isCollapsed && (
                        <div className={`${F.mono} text-[0.58rem] tracking-[2px] px-3 mb-1.5`} style={{ color: C.t4 }}>
                            // {group.title}
                        </div>
                    )}
                    <div className="space-y-0.5">
                        {group.items.map((item) => (
                            <SidebarItem key={item.key} item={item}
                                count={item.countKey ? navCounts[item.countKey] : undefined}
                                collapsed={isCollapsed} onNavigate={onMobileClose} />
                        ))}
                    </div>
                </div>
            ))}
        </nav>
    );

    return (
        <>
            {/* DESKTOP */}
            <aside dir="rtl" className={`fixed right-0 top-0 z-[200] hidden h-screen lg:flex flex-col border-l transition-all duration-300 ${collapsed ? 'w-[68px]' : 'w-[240px]'}`}
                style={{ background: C.card, borderColor: C.b }}>
                <div className={`flex h-14 shrink-0 items-center border-b ${collapsed ? 'justify-center px-0' : 'justify-between px-4'}`} style={{ borderColor: C.b }}>
                    <BrandMark collapsed={collapsed} />
                </div>

                <Nav isCollapsed={collapsed} />

                <div className="border-t p-2 space-y-1" style={{ borderColor: C.b }}>
                    <button type="button" title="المساعدة والدعم"
                        className={`flex h-9 w-full items-center gap-3 transition-colors hover:bg-white/[0.04] ${collapsed ? 'justify-center' : 'px-3'}`}
                        style={{ color: C.t3 }}>
                        <ICONS.help />
                        {!collapsed && <span className={`${F.ar} text-[0.75rem]`}>المساعدة والدعم</span>}
                    </button>

                    {profileExists && (
                        <Link href={route('profile.edit')} onClick={onMobileClose}
                            className={`flex items-center gap-2.5 border p-2 transition-colors hover:bg-white/[0.04] ${collapsed ? 'justify-center' : ''}`}
                            style={{ borderColor: C.b, background: C.card2 }}>
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center border"
                                style={{ borderColor: `${C.green}55`, color: C.green, background: C.greenTrace }}>
                                <span className={`${F.mono} text-[0.65rem] font-bold`}>{initials}</span>
                            </span>
                            {!collapsed && (
                                <>
                                    <span className="min-w-0 flex-1">
                                        <span className={`${F.ar} block text-[0.72rem] font-semibold truncate`} style={{ color: C.t1 }}>{user.username ?? 'حسابي'}</span>
                                        <span className={`${F.mono} block text-[0.55rem] truncate`} style={{ color: C.t4 }}>{user?.email ?? '—'}</span>
                                    </span>
                                    <span style={{ color: C.t4 }}><ICONS.gear /></span>
                                </>
                            )}
                        </Link>
                    )}

                    <button type="button"
                        onClick={() => setCollapsed((c) => { localStorage.setItem('tf_sidebar_collapsed', c ? '0' : '1'); return !c; })}
                        className={`flex h-9 w-full items-center gap-3 transition-colors hover:bg-white/[0.04] ${collapsed ? 'justify-center' : 'px-3'}`}
                        style={{ color: C.t4 }}>
                        {collapsed ? <ICONS.expand /> : <ICONS.collapse />}
                        {!collapsed && <span className={`${F.mono} text-[0.6rem] tracking-[1px]`}>طي القائمة</span>}
                    </button>
                </div>
            </aside>

            {/* MOBILE */}
            <aside dir="rtl" className={`fixed right-0 top-0 z-[250] flex h-screen w-[260px] flex-col border-l shadow-2xl transition-transform duration-300 lg:hidden ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`}
                style={{ background: C.card, borderColor: C.b }}>
                <div className="flex h-14 items-center justify-between border-b px-4" style={{ borderColor: C.b }}>
                    <BrandMark collapsed={false} />
                    <button type="button" onClick={onMobileClose} aria-label="إغلاق" className="p-1" style={{ color: C.t3 }}>
                        <ICONS.x />
                    </button>
                </div>
                <Nav isCollapsed={false} />
            </aside>
        </>
    );
}