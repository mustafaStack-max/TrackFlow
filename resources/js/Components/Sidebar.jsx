// resources/js/Components/Sidebar.jsx
import { useEffect, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { COLORS as C, FONT as F } from '@/Components/Dashboard/theme';
import { fmtMAD } from '@/Components/Dashboard/format';
import DonutChart from '@/Components/Dashboard/DonutChart';

/* ── icons ── */
const IcoGrid = (p) => (<svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><rect x="2" y="2" width="7" height="7" rx="1" /><rect x="11" y="2" width="7" height="7" rx="1" /><rect x="2" y="11" width="7" height="7" rx="1" /><rect x="11" y="11" width="7" height="7" rx="1" /></svg>);
const IcoDatabase = (p) => (<svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><ellipse cx="10" cy="5" rx="7" ry="2.6" /><path d="M3 5v4.5c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6V5" /><path d="M3 9.5V14c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6V9.5" /></svg>);
const IcoSwap = (p) => (<svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><path d="M3 7h11M14 7l-3-3M14 7l-3 3" strokeLinecap="round" strokeLinejoin="round" /><path d="M17 13H6M6 13l3-3M6 13l3 3" strokeLinecap="round" strokeLinejoin="round" /></svg>);
const IcoLineChart = (p) => (<svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><path d="M2 15l5-6 4 3 6-8" strokeLinecap="round" strokeLinejoin="round" /><path d="M2 17h16" strokeLinecap="round" /></svg>);
const IcoGauge = (p) => (<svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><circle cx="10" cy="10" r="7.5" /><path d="M10 10l3.2-3.2" strokeLinecap="round" /><circle cx="10" cy="10" r="1.1" fill="currentColor" stroke="none" /></svg>);
const IcoStar = (p) => (<svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.3" {...p}><path d="M10 2l2.2 5.4L18 8l-4.4 3.8L15 18l-5-3.3L5 18l1.4-6.2L2 8l5.8-.6z" strokeLinejoin="round" /></svg>);
const IcoCompass = (p) => (<svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><circle cx="10" cy="10" r="7.5" /><path d="M13 7l-2 5-4 1 2-5z" strokeLinejoin="round" /></svg>);
const IcoTransfer = (p) => (<svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><path d="M2 6.5h16M14 2.5l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" /><path d="M18 13.5H2M6 9.5l-4 4 4 4" strokeLinecap="round" strokeLinejoin="round" /></svg>);
const IcoClock = (p) => (<svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><circle cx="10" cy="10" r="7.5" /><path d="M10 6v4l2.6 1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>);
const IcoTarget = (p) => (<svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><circle cx="10" cy="10" r="7.5" /><circle cx="10" cy="10" r="4" /><circle cx="10" cy="10" r="0.9" fill="currentColor" stroke="none" /></svg>);
const IcoTag = (p) => (<svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><path d="M2 2h7l9 9-7 7-9-9V2z" strokeLinejoin="round" /><circle cx="6" cy="6" r="1.1" fill="currentColor" stroke="none" /></svg>);
const IcoDoc = (p) => (<svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><path d="M5 2h7l3 3v13H5z" strokeLinejoin="round" /><path d="M8 9h4M8 12h4M8 15h2" strokeLinecap="round" /></svg>);
const IcoChevron = (p) => (<svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" {...p}><path d="M7.5 4.5l6 5.5-6 5.5" strokeLinecap="round" strokeLinejoin="round" /></svg>);

const NAV_GROUPS = [
    {
        title: 'الرئيسية',
        items: [
            { key: 'dashboard', label: 'لوحة التحكم', icon: IcoGrid, routeName: 'dashboard' },
            { key: 'accounts', label: 'الحسابات', icon: IcoDatabase, routeName: 'accounts.index', countKey: 'accounts', badgeColor: C.cyan },
            { key: 'transactions', label: 'المعاملات', icon: IcoSwap, routeName: 'transactions.index', countKey: 'transactions', badgeColor: C.green },
            { key: 'categories', label: 'إدارة التصنيفات', icon: IcoTag, routeName: 'categories.index' },
        ],
    },
    {
        title: 'أدوات متقدمة',
        items: [
            { key: 'budgets', label: 'الميزانات', icon: IcoLineChart, routeName: 'budgets.index' },
            { key: 'budget', label: 'الميزانية', icon: IcoGauge, routeName: 'budget.index' },
            { key: 'insights', label: 'الرؤى التحليلية', icon: IcoStar, routeName: 'insights.index' },
            { key: 'freedom', label: 'الحرية المالية', icon: IcoCompass, routeName: 'financial-freedom.index' },
            { key: 'transfer', label: 'تحويل بين الحسابات', icon: IcoTransfer, routeName: 'transfers.create' },
            { key: 'subscriptions', label: 'الاشتراكات والفواتير', icon: IcoClock, routeName: 'subscriptions.index', countKey: 'subscriptions', badgeColor: C.purple },
            { key: 'goals', label: 'الأهداف المالية', icon: IcoTarget, routeName: 'goals.index', countKey: 'goals', badgeColor: C.amber },
            { key: 'audit', label: 'سجل العمليات', icon: IcoDoc, routeName: 'audit.index' },
        ],
    },
];

const HEADER_H = 58;

const SCROLL_CLS =
    '[&::-webkit-scrollbar]:w-[5px] ' +
    '[&::-webkit-scrollbar-track]:bg-transparent ' +
    '[&::-webkit-scrollbar-thumb]:bg-[rgba(0,230,118,0.22)] ' +
    '[&::-webkit-scrollbar-thumb:hover]:bg-[rgba(0,230,118,0.45)] ' +
    '[&::-webkit-scrollbar-thumb]:rounded-full ' +
    '[scrollbar-width:thin] [scrollbar-color:rgba(0,230,118,0.22)_transparent]';

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const navCounts = usePage().props.navCounts ?? {};
    const summary = usePage().props.navSummary ?? null;

    useEffect(() => {
        const saved = localStorage.getItem('tf_sidebar_collapsed');
        if (saved === '1') setCollapsed(true);
    }, []);

    const toggle = () => {
        setCollapsed((v) => {
            localStorage.setItem('tf_sidebar_collapsed', !v ? '1' : '0');
            return !v;
        });
    };

    return (
        <div
            className="relative shrink-0 self-start transition-[width] duration-300 ease-in-out"
            style={{ width: collapsed ? 68 : 236, height: `calc(100vh - ${HEADER_H}px)`, position: 'sticky', top: HEADER_H }}
        >
            <aside
                className="flex flex-col h-full border-r overflow-hidden select-none"
                style={{ background: C.card, borderColor: C.b, boxShadow: '6px 0 24px rgba(0,0,0,0.35)' }}
            >
                {/* NAV + WIDGET */}
                <div className={`flex-1 overflow-y-auto flex flex-col py-3 ${SCROLL_CLS}`}>
                    {NAV_GROUPS.map((group, gi) => (
                        <div key={group.title} className={gi > 0 ? 'mt-2 pt-3 border-t' : ''} style={gi > 0 ? { borderColor: C.b } : undefined}>
                            {!collapsed && (
                                <div className={`${F.mono} text-[0.58rem] tracking-[2.5px] px-4 pb-2 text-right`} style={{ color: C.t4 }}>
                                    // {group.title}
                                </div>
                            )}
                            <nav className="flex flex-col gap-1 w-full px-0">
                                {group.items.map((item) => {
                                    const Icon = item.icon;
                                    const exists = route().has(item.routeName);
                                    const active = exists && route().current(item.routeName.replace(/\.\w+$/, '.*'));
                                    const count = item.countKey ? navCounts[item.countKey] : undefined;

                                    const rowClass = `${F.head} group relative flex items-center transition-all duration-150 w-full ${
                                        collapsed
                                            ? 'justify-center h-10 py-2'
                                            : 'justify-between px-4 py-2.5 text-[0.82rem] font-semibold'
                                    }`;

                                    const content = (
                                        <>
                                            <span className={`flex items-center ${collapsed ? 'justify-center' : 'gap-2.5 min-w-0'}`}>
                                                <span className="relative shrink-0 flex items-center justify-center">
                                                    <Icon />
                                                    {collapsed && count > 0 && (
                                                        <span
                                                            className="absolute -top-1 -right-1 w-2 h-2 rounded-full ring-2"
                                                            style={{ background: item.badgeColor || C.green, ringColor: C.card }}
                                                        />
                                                    )}
                                                </span>
                                                {!collapsed && (
                                                    <span className="whitespace-nowrap overflow-hidden text-ellipsis text-right">
                                                        {item.label}
                                                    </span>
                                                )}
                                            </span>
                                            {!collapsed && (
                                                exists ? (
                                                    count !== undefined && (
                                                        <span
                                                            className={`${F.mono} text-[0.65rem] font-bold px-1.5 py-0.5 rounded-sm shrink-0`}
                                                            style={{
                                                                color: active ? C.void : item.badgeColor,
                                                                background: active ? 'rgba(4,5,7,0.15)' : `${item.badgeColor}1f`,
                                                            }}
                                                        >
                                                            {count}
                                                        </span>
                                                    )
                                                ) : (
                                                    <span className={`${F.mono} text-[0.55rem] tracking-[1px] shrink-0 opacity-70`} style={{ color: C.t4 }}>
                                                        قريبًا
                                                    </span>
                                                )
                                            )}
                                        </>
                                    );

                                    if (!exists) {
                                        return (
                                            <div
                                                key={item.key}
                                                title={collapsed ? item.label : undefined}
                                                className={`${rowClass} cursor-not-allowed opacity-40`}
                                                style={{ color: C.t3 }}
                                            >
                                                {content}
                                            </div>
                                        );
                                    }

                                    return (
                                        <Link
                                            key={item.key}
                                            href={route(item.routeName)}
                                            title={collapsed ? item.label : undefined}
                                            className={rowClass}
                                            style={
                                                active
                                                    ? { color: C.void, background: C.green, boxShadow: `0 2px 14px ${C.greenGlow}` }
                                                    : { color: C.t2 }
                                            }
                                            onMouseEnter={(e) => {
                                                if (!active) e.currentTarget.style.background = C.greenTrace;
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!active) e.currentTarget.style.background = 'transparent';
                                            }}
                                        >
                                            {!active && !collapsed && (
                                                <span
                                                    className="absolute right-0 top-1/2 -translate-y-1/2 h-0 w-[3px] rounded-r transition-all duration-150 group-hover:h-[60%]"
                                                    style={{ background: C.green }}
                                                />
                                            )}
                                            {content}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>
                    ))}

                    {!collapsed && <NetWorthWidget summary={summary} />}
                </div>
            </aside>

            {/* FLOATING COLLAPSE HANDLE */}
            <button
                type="button"
                onClick={toggle}
                title={collapsed ? 'توسيع الشريط' : 'طي الشريط'}
                className="absolute z-30 flex items-center justify-center w-7 h-7 rounded-full border transition-all duration-200 hover:scale-110"
                style={{
                    top: '50%',
                    right: 0,
                    transform: 'translateY(-50%)',
                    background: C.card2,
                    borderColor: C.bHot,
                    color: C.green,
                    boxShadow: '0 0 0 3px rgba(4,5,7,0.6)',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = `0 0 14px ${C.greenGlow}, 0 0 0 3px rgba(4,5,7,0.6)`;
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(4,5,7,0.6)';
                }}
            >
                <IcoChevron style={{ transform: collapsed ? 'none' : 'rotate(180deg)', transition: 'transform .25s' }} />
            </button>
        </div>
    );
}

function NetWorthWidget({ summary }) {
    if (!summary || !summary.accounts?.length) return null;

    const donutData = summary.accounts.map((a) => ({
        name: a.name,
        total: Number(a.balance) || 0,
        color_hex: a.color_hex || C.green,
    }));

    return (
        <div className="mt-auto border-t px-3.5 pt-3.5 pb-4" style={{ borderColor: C.b }}>
            <div className={`${F.mono} text-[0.58rem] tracking-[2.5px] mb-2.5 text-right`} style={{ color: C.t4 }}>
                // الفترة الإجمالية
            </div>

            <div className="text-center mb-2">
                <div className={`${F.mono} text-[0.55rem] tracking-[1.5px] mb-1`} style={{ color: C.t4 }}>
                    TOTAL NET WORTH
                </div>
                <div className={`${F.mono} text-[1.15rem] leading-none`} style={{ color: C.gold, textShadow: `0 0 18px ${C.gold}55` }}>
                    MAD {fmtMAD(summary.totalNetWorth)}
                </div>
                <div className={`${F.mono} text-[0.58rem] mt-1`} style={{ color: C.t3 }}>
                    {summary.accountsCount ?? summary.accounts.length} حساب نشط
                </div>
            </div>

            <div className="-mx-2">
                <DonutChart data={donutData} height={100} centerLabel="" centerColor={C.gold} />
            </div>

            <div className="flex flex-col gap-1.5 mt-1">
                {summary.accounts.map((a) => (
                    <div key={a.id} className="flex items-center justify-between gap-2">
                        <span className={`${F.ar} text-[0.72rem] truncate`} style={{ color: C.t2 }}>
                            {a.name}
                        </span>
                        <span className={`${F.mono} text-[0.72rem] font-semibold shrink-0`} style={{ color: a.color_hex || C.green }}>
                            {fmtMAD(a.balance)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}