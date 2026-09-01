import { useEffect, useMemo, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { COLORS as C, FONT as F } from '@/Components/Dashboard/theme';
import { fmtMAD } from '@/Components/Dashboard/format';
import DonutChart from '@/Components/Dashboard/DonutChart';

/* ── Legacy TrackFlow icon set, converted to React/SVG ── */
const IcoGrid = p => <svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><rect x="2" y="2" width="7" height="7" rx="1"/><rect x="11" y="2" width="7" height="7" rx="1"/><rect x="2" y="11" width="7" height="7" rx="1"/><rect x="11" y="11" width="7" height="7" rx="1"/></svg>;
const IcoDatabase = p => <svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><ellipse cx="10" cy="5" rx="7" ry="2.6"/><path d="M3 5v4.5c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6V5"/><path d="M3 9.5V14c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6V9.5"/></svg>;
const IcoSwap = p => <svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><path d="M3 7h11M14 7l-3-3M14 7l-3 3" strokeLinecap="round" strokeLinejoin="round"/><path d="M17 13H6M6 13l3-3M6 13l3 3" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const IcoChart = p => <svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><path d="M2 16.5V4M2 16.5h16" strokeLinecap="round"/><path d="m5 13 3-4 3 2 5-6" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const IcoGauge = p => <svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><circle cx="10" cy="10" r="7.5"/><path d="M10 10l3.2-3.2" strokeLinecap="round"/><circle cx="10" cy="10" r="1.1" fill="currentColor" stroke="none"/></svg>;
const IcoStar = p => <svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.3" {...p}><path d="M10 2l2.2 5.4L18 8l-4.4 3.8L15 18l-5-3.3L5 18l1.4-6.2L2 8l5.8-.6z" strokeLinejoin="round"/></svg>;
const IcoCompass = p => <svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><circle cx="10" cy="10" r="7.5"/><path d="M13 7l-2 5-4 1 2-5z" strokeLinejoin="round"/></svg>;
const IcoTransfer = p => <svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><path d="M2 6.5h16M14 2.5l4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/><path d="M18 13.5H2M6 9.5l-4 4 4 4" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const IcoClock = p => <svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><circle cx="10" cy="10" r="7.5"/><path d="M10 6v4l2.6 1.6" strokeLinecap="round"/></svg>;
const IcoTarget = p => <svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><circle cx="10" cy="10" r="7.5"/><circle cx="10" cy="10" r="4"/><circle cx="10" cy="10" r=".9" fill="currentColor" stroke="none"/></svg>;
const IcoTag = p => <svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><path d="M2 2h7l9 9-7 7-9-9V2z" strokeLinejoin="round"/><circle cx="6" cy="6" r="1.1" fill="currentColor" stroke="none"/></svg>;
const IcoDoc = p => <svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><path d="M5 2h7l3 3v13H5z" strokeLinejoin="round"/><path d="M8 9h4M8 12h4M8 15h2" strokeLinecap="round"/></svg>;
const IcoUser = p => <svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><circle cx="10" cy="6.5" r="3"/><path d="M4 17c.8-3 2.8-4.5 6-4.5s5.2 1.5 6 4.5" strokeLinecap="round"/></svg>;
const IcoSettings = p => <svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.35" {...p}><path d="M8.3 2.8h3.4l.6 2a5.5 5.5 0 0 1 1.3.8l2-.6 1.7 3-1.5 1.4a5.7 5.7 0 0 1 0 1.6l1.5 1.4-1.7 3-2-.6a5.5 5.5 0 0 1-1.3.8l-.6 2H8.3l-.6-2a5.5 5.5 0 0 1-1.3-.8l-2 .6-1.7-3 1.5-1.4a5.7 5.7 0 0 1 0-1.6L2.7 8l1.7-3 2 .6a5.5 5.5 0 0 1 1.3-.8l.6-2Z" strokeLinejoin="round"/><circle cx="10" cy="10.2" r="2.1"/></svg>;
const IcoChevron = p => <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" {...p}><path d="M7.5 4.5l6 5.5-6 5.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;

const NAV_GROUPS = [
    {
        title: 'NAVIGATION',
        items: [
            { key: 'dashboard', label: 'لوحة التحكم', icon: IcoGrid, routeName: 'dashboard' },
            { key: 'accounts', label: 'الحسابات', icon: IcoDatabase, routeName: 'accounts.index', countKey: 'accounts', badgeColor: C.cyan },
            { key: 'transactions', label: 'المعاملات', icon: IcoSwap, routeName: 'transactions.index', countKey: 'transactions', badgeColor: C.green },
            { key: 'analytics', label: 'التحليلات', icon: IcoChart, routeName: 'analytics.index' },
        ],
    },
    {
        title: 'TOOLS',
        items: [
            { key: 'budgets', label: 'الميزانيات', icon: IcoChart, routeName: 'budgets.index' },
            { key: 'budget', label: 'الميزانية', icon: IcoGauge, routeName: 'budget.index' },
            { key: 'insights', label: 'الرؤى التحليلية', icon: IcoStar, routeName: 'insights.index' },
            { key: 'freedom', label: 'الحرية المالية', icon: IcoCompass, routeName: 'financial-freedom.index' },
            { key: 'transfer', label: 'تحويل بين الحسابات', icon: IcoTransfer, routeName: 'transfers.create' },
            { key: 'subscriptions', label: 'الاشتراكات والفواتير', icon: IcoClock, routeName: 'subscriptions.index', countKey: 'subscriptions', badgeColor: C.purple },
            { key: 'goals', label: 'الأهداف المالية', icon: IcoTarget, routeName: 'goals.index', countKey: 'goals', badgeColor: C.amber },
            { key: 'categories', label: 'إدارة التصنيفات', icon: IcoTag, routeName: 'categories.index' },
            { key: 'audit', label: 'سجل العمليات', icon: IcoDoc, routeName: 'audit.index' },
        ],
    },
];

const HEADER_H = 58;
const SCROLL_CLS =
    '[&::-webkit-scrollbar]:w-[5px] [&::-webkit-scrollbar-track]:bg-transparent ' +
    '[&::-webkit-scrollbar-thumb]:bg-[rgba(0,230,118,0.22)] ' +
    '[&::-webkit-scrollbar-thumb:hover]:bg-[rgba(0,230,118,0.45)] ' +
    '[&::-webkit-scrollbar-thumb]:rounded-full [scrollbar-width:thin] ' +
    '[scrollbar-color:rgba(0,230,118,0.22)_transparent]';

export default function Sidebar() {
    const { props } = usePage();
    const navCounts = props.navCounts ?? {};
    const summary = props.navSummary ?? null;
    const user = props.auth?.user ?? props.user ?? null;

    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        if (localStorage.getItem('tf_sidebar_collapsed') === '1') setCollapsed(true);
    }, []);

    const toggle = () => setCollapsed(v => {
        const next = !v;
        localStorage.setItem('tf_sidebar_collapsed', next ? '1' : '0');
        return next;
    });

    const profileExists = route().has('profile.edit');
    const initials = useMemo(() => {
        const value = String(user?.name ?? 'U').trim();
        return value.split(/\s+/).filter(Boolean).slice(0, 2).map(x => x[0]).join('').toUpperCase() || 'U';
    }, [user?.name]);

    return (
        <div
            className="relative shrink-0 self-start transition-[width] duration-300 ease-in-out"
            style={{ width: collapsed ? 68 : 256, height: `calc(100vh - ${HEADER_H}px)`, position: 'sticky', top: HEADER_H }}
        >
            <aside
                className="flex h-full flex-col overflow-hidden border-r select-none"
                style={{ background: C.deep ?? C.card, borderColor: C.b, boxShadow: '8px 0 28px rgba(0,0,0,.34)' }}
            >
                <div className={`${SCROLL_CLS} flex flex-1 flex-col overflow-y-auto py-3`}>
                    {NAV_GROUPS.map((group, gi) => (
                        <div key={group.title} className={gi > 0 ? 'mt-2 border-t pt-3' : ''} style={gi > 0 ? { borderColor: C.b } : undefined}>
                            {!collapsed && (
                                <div className={`${F.mono} px-4 pb-2 pt-1 text-right text-[0.58rem] uppercase tracking-[3px]`} style={{ color: C.t4 }}>
                                    // {group.title}
                                </div>
                            )}

                            <nav className="flex w-full flex-col gap-1">
                                {group.items.map(item => {
                                    const Icon = item.icon;
                                    const exists = route().has(item.routeName);
                                    const active = exists && route().current(item.routeName);
                                    const count = item.countKey ? navCounts[item.countKey] : undefined;

                                    const row = `${F.head} group relative flex w-full items-center transition-all duration-150 ${
                                        collapsed ? 'h-10 justify-center px-2' : 'justify-between px-4 py-2.5 text-[0.82rem] font-semibold'
                                    }`;

                                    const content = (
                                        <>
                                            <span className={`flex items-center ${collapsed ? 'justify-center' : 'min-w-0 gap-2.5'}`}>
                                                <span className="relative flex shrink-0 items-center justify-center">
                                                    <Icon />
                                                    {collapsed && count > 0 && (
                                                        <span
                                                            className="absolute -right-1 -top-1 h-2 w-2 rounded-full ring-2"
                                                            style={{ background: item.badgeColor || C.green, '--tw-ring-color': C.deep }}
                                                        />
                                                    )}
                                                </span>
                                                {!collapsed && <span className="truncate text-right whitespace-nowrap">{item.label}</span>}
                                            </span>

                                            {!collapsed && exists && count !== undefined && (
                                                <span
                                                    className={`${F.mono} shrink-0 rounded-sm px-1.5 py-0.5 text-[0.65rem] font-bold`}
                                                    style={{ color: active ? C.void : item.badgeColor, background: active ? 'rgba(4,5,7,.15)' : `${item.badgeColor}1f` }}
                                                >
                                                    {count}
                                                </span>
                                            )}

                                            {!collapsed && !exists && (
                                                <span className={`${F.mono} shrink-0 text-[0.55rem] opacity-60`} style={{ color: C.t4 }}>قريبًا</span>
                                            )}
                                        </>
                                    );

                                    if (!exists) {
                                        return (
                                            <div key={item.key} title={collapsed ? item.label : undefined} className={`${row} cursor-not-allowed opacity-40`} style={{ color: C.t3 }}>
                                                {content}
                                            </div>
                                        );
                                    }

                                    return (
                                        <Link
                                            key={item.key}
                                            href={route(item.routeName)}
                                            title={collapsed ? item.label : undefined}
                                            className={row}
                                            style={active ? { color: C.void, background: C.green, boxShadow: `0 2px 14px ${C.greenGlow}` } : { color: C.t2 }}
                                            onMouseEnter={e => { if (!active) { e.currentTarget.style.background = C.greenTrace; e.currentTarget.style.color = C.green2 ?? C.green; } }}
                                            onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.t2; } }}
                                        >
                                            {!active && !collapsed && (
                                                <span className="absolute right-0 top-1/2 h-0 w-[3px] -translate-y-1/2 rounded-r transition-all duration-150 group-hover:h-[60%]" style={{ background: C.green }} />
                                            )}
                                            {active && (
                                                <span className="absolute right-0 top-1/2 h-[60%] w-[3px] -translate-y-1/2 rounded-r" style={{ background: C.void }} />
                                            )}
                                            {content}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>
                    ))}

                    {!collapsed && (
                        <div className="mt-3 border-t pt-3" style={{ borderColor: C.b }}>
                            <div className={`${F.mono} px-4 pb-2 text-right text-[0.58rem] tracking-[3px]`} style={{ color: C.t4 }}>// الثروة الإجمالية</div>
                            <NetWorthWidget summary={summary} />

                            <div className="my-2 border-t" style={{ borderColor: C.b }} />
                            <div className={`${F.mono} px-4 pb-2 text-right text-[0.58rem] tracking-[3px]`} style={{ color: C.t4 }}>// الحسابات</div>
                            <AccountMiniList accounts={summary?.accounts ?? []} />
                            <BudgetMeter summary={summary} />
                        </div>
                    )}
                </div>

                <ProfileLink user={user} initials={initials} collapsed={collapsed} exists={profileExists} />
            </aside>

            <button
                type="button"
                onClick={toggle}
                title={collapsed ? 'توسيع الشريط' : 'طي الشريط'}
                className="absolute z-30 flex h-7 w-7 items-center justify-center rounded-full border transition-all duration-200 hover:scale-110"
                style={{ top: '50%', right: 0, transform: 'translateY(-50%)', background: C.card2, borderColor: C.bHot, color: C.green, boxShadow: '0 0 0 3px rgba(4,5,7,.62)' }}
            >
                <IcoChevron style={{ transform: collapsed ? 'none' : 'rotate(180deg)', transition: 'transform .25s' }} />
            </button>
        </div>
    );
}

function NetWorthWidget({ summary }) {
    if (!summary) return null;
    const accounts = Array.isArray(summary.accounts) ? summary.accounts : [];
    const total = Number(summary.totalNetWorth ?? 0) || 0;

    const donutData = accounts.map(a => ({
        name: a.name,
        total: Number(a.real_balance ?? a.balance ?? 0) || 0,
        color_hex: a.color_hex || C.green,
    }));

    return (
        <div className="mx-3 border p-3.5" style={{ borderColor: 'rgba(255,215,0,.25)', background: 'linear-gradient(135deg,rgba(255,215,0,.045),rgba(0,230,118,.028))' }}>
            <div className="mb-1.5 flex items-center justify-between">
                <span className={`${F.mono} text-[0.55rem] tracking-[2px]`} style={{ color: C.t4 }}>TOTAL NET WORTH</span>
                <span className={`${F.mono} border px-1.5 py-0.5 text-[0.52rem]`} style={{ color: C.gold, borderColor: 'rgba(255,215,0,.14)', background: 'rgba(255,215,0,.08)' }}>LIVE</span>
            </div>
            <div className={`${F.mono} text-[1.35rem] leading-none tracking-[-1px]`} style={{ color: C.gold, textShadow: `0 0 20px ${C.gold}45` }}>
                {fmtMAD(total)} <span className="text-[0.62rem]">MAD</span>
            </div>
            <div className={`${F.mono} mt-1 text-[0.58rem]`} style={{ color: C.t3 }}>{summary.accountsCount ?? accounts.length} حساب نشط</div>

            {accounts.length > 0 && (
                <>
                    <div className="-mx-3 my-1"><DonutChart data={donutData} height={105} centerLabel="" centerColor={C.gold} /></div>
                    <div className="flex flex-col gap-1.5">
                        {accounts.slice(0, 4).map(a => (
                            <div key={a.id} className="flex items-center justify-between gap-2">
                                <span className={`${F.ar} min-w-0 truncate text-[0.7rem]`} style={{ color: C.t2 }}>{a.name}</span>
                                <span className={`${F.mono} shrink-0 text-[0.7rem] font-semibold`} style={{ color: a.color_hex || C.green }}>{fmtMAD(a.real_balance ?? a.balance ?? 0)}</span>
                            </div>
                        ))}
                    </div>
                    {accounts.length > 4 && <div className={`${F.mono} mt-2 text-right text-[0.55rem]`} style={{ color: C.t4 }}>+{accounts.length - 4} حسابات أخرى</div>}
                </>
            )}
        </div>
    );
}

function AccountMiniList({ accounts = [] }) {
    if (!accounts.length) return <div className={`${F.mono} mx-3 px-2 py-2 text-center text-[0.58rem]`} style={{ color: C.t4 }}>لا توجد حسابات</div>;

    return (
        <div className="flex flex-col gap-1.5 px-3">
            {accounts.slice(0, 5).map(a => {
                const balance = Number(a.real_balance ?? a.balance ?? 0) || 0;
                const href = route().has('accounts.show') ? route('accounts.show', a.id) : route('accounts.index');

                return (
                    <Link
                        key={a.id}
                        href={href}
                        className="group border px-2.5 py-2 transition-all duration-150"
                        style={{ borderColor: C.b, background: C.card }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = C.bHot; e.currentTarget.style.background = C.card2; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = C.b; e.currentTarget.style.background = C.card; }}
                    >
                        <div className="mb-1 flex items-center justify-between gap-2">
                            <span className={`${F.head} truncate text-[0.76rem] font-semibold`} style={{ color: C.t1 }}>{a.name}</span>
                            <span className={`${F.mono} text-[0.55rem] uppercase`} style={{ color: C.t4 }}>{a.type ?? 'ACCOUNT'}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                            <span className={`${F.mono} text-[0.72rem] font-semibold`} style={{ color: a.color_hex || C.green }}>
                                {fmtMAD(balance)} <span className="text-[0.52rem]" style={{ color: C.t4 }}>MAD</span>
                            </span>
                            <span className="h-[2px] w-14 overflow-hidden" style={{ background: C.card3 }}>
                                <span className="block h-full" style={{ width: `${Math.min(Math.max(Number(a.utilization ?? 0), 0), 100)}%`, background: a.color_hex || C.green }} />
                            </span>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}

function BudgetMeter({ summary }) {
    const spent = Number(summary?.monthlyExpense ?? summary?.spent ?? 0) || 0;
    const budget = Number(summary?.monthlyBudget ?? summary?.budget ?? 0) || 0;
    if (!budget && !spent) return null;

    const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
    const tone = pct >= 90 ? C.red : pct >= 75 ? C.amber : C.green;

    return (
        <div className="mx-3 mt-2 border p-3" style={{ borderColor: C.b, background: C.card }}>
            <div className="mb-1.5 flex items-center justify-between">
                <span className={`${F.mono} text-[0.6rem]`} style={{ color: C.t2 }}>الميزانية الشهرية</span>
                <span className={`${F.mono} text-[0.65rem] font-semibold`} style={{ color: tone }}>{Math.round(pct)}%</span>
            </div>
            <div className="mb-1 h-[5px] overflow-hidden" style={{ background: C.card3 }}>
                <div className="h-full transition-all duration-700" style={{ width: `${pct}%`, background: `repeating-linear-gradient(90deg,${tone} 0,${tone} 4px,transparent 4px,transparent 7px)` }} />
            </div>
            <div className={`${F.mono} text-[0.58rem]`} style={{ color: C.t3 }}>{fmtMAD(spent)} / {fmtMAD(budget)} MAD</div>
        </div>
    );
}

function ProfileLink({ user, initials, collapsed, exists }) {
    const content = (
        <>
            <span className="relative flex shrink-0 items-center justify-center">
                {user?.avatar ? (
                    <img src={user.avatar} alt={user.name ?? 'Profile'} className="h-9 w-9 border object-cover" style={{ borderColor: C.bHot }} />
                ) : (
                    <span className="flex h-9 w-9 items-center justify-center border" style={{ color: C.green, borderColor: C.bHot, background: C.greenTrace }}>
                        <span className={`${F.mono} text-[0.72rem] font-bold`}>{initials}</span>
                    </span>
                )}
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2" style={{ background: C.green, borderColor: C.deep, boxShadow: `0 0 8px ${C.green}` }} />
            </span>

            {!collapsed && (
                <span className="min-w-0 flex-1 text-right">
                    <span className={`${F.mono} block text-[0.52rem] uppercase tracking-[1.8px]`} style={{ color: C.t4 }}>ACCOUNT</span>
                    <span className={`${F.ar} mt-0.5 block truncate text-[0.76rem] font-semibold`} style={{ color: C.t1 }}>{user?.name ?? 'حسابي الشخصي'}</span>
                    {user?.email && <span className={`${F.mono} mt-0.5 block truncate text-[0.52rem]`} style={{ color: C.t4 }}>{user.email}</span>}
                </span>
            )}

            {!collapsed && <span className="flex h-7 w-7 shrink-0 items-center justify-center border" style={{ borderColor: C.b, color: C.t3 }}><IcoSettings width={13} height={13} /></span>}
            {collapsed && <IcoUser width={14} height={14} />}
        </>
    );

    const common = `group flex w-full items-center gap-2.5 border-t px-3 py-3 transition-all duration-150 ${collapsed ? 'justify-center' : ''}`;
    const style = { borderColor: C.b, background: C.card, color: C.t2 };

    if (!exists) {
        return <div title={collapsed ? user?.name ?? 'حسابي الشخصي' : undefined} className={`${common} cursor-not-allowed opacity-70`} style={style}>{content}</div>;
    }

    return (
        <Link
            href={route('profile.edit')}
            title={collapsed ? user?.name ?? 'حسابي الشخصي' : undefined}
            className={common}
            style={style}
            onMouseEnter={e => { e.currentTarget.style.background = C.greenTrace; e.currentTarget.style.borderColor = C.bHot; e.currentTarget.style.color = C.green2 ?? C.green; }}
            onMouseLeave={e => { e.currentTarget.style.background = C.card; e.currentTarget.style.borderColor = C.b; e.currentTarget.style.color = C.t2; }}
        >
            {content}
        </Link>
    );
}