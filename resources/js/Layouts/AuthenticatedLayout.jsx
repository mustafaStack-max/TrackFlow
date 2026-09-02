// resources/js/Layouts/AuthenticatedLayout.jsx
import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import Sidebar from '@/Components/Sidebar';
import { COLORS as C, FONT as F, getTheme, toggleTheme } from '@/Components/Dashboard/theme';


const IcoSearch = (p) => (<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><circle cx="9" cy="9" r="6" /><path d="M13.5 13.5L18 18" strokeLinecap="round" /></svg>);
const IcoPlus = (p) => (<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><path d="M10 4v12M4 10h12" strokeLinecap="round" /></svg>);
const IcoBell = (p) => (<svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path d="M5 9a5 5 0 0 1 10 0c0 5 2 6 2 6H3s2-1 2-6" strokeLinejoin="round" /><path d="M8.5 17.5a1.7 1.7 0 0 0 3 0" strokeLinecap="round" /></svg>);
const IcoSun = (p) => (<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><circle cx="10" cy="10" r="3.5" /><path d="M10 1.5v2M10 16.5v2M1.5 10h2M16.5 10h2M4 4l1.4 1.4M14.6 14.6L16 16M4 16l1.4-1.4M14.6 5.4L16 4" strokeLinecap="round" /></svg>);
const IcoMoon = (p) => (<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path d="M17 12.5A7.5 7.5 0 1 1 7.5 3 6 6 0 0 0 17 12.5z" strokeLinejoin="round" /></svg>);
const IcoUser = (p) => (<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><circle cx="10" cy="7" r="3.5" /><path d="M3.5 17c.8-3.2 3.4-5 6.5-5s5.7 1.8 6.5 5" strokeLinecap="round" /></svg>);
const IcoGear = (p) => (<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><circle cx="10" cy="10" r="2.4" /><path d="M10 2.5v2M10 15.5v2M17.5 10h-2M4.5 10h-2M15.3 4.7l-1.4 1.4M6.1 13.9l-1.4 1.4M15.3 15.3l-1.4-1.4M6.1 6.1L4.7 4.7" strokeLinecap="round" /></svg>);
const IcoLogout = (p) => (<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path d="M12 3H4v14h8M8 10h9M14 6.5L17.5 10 14 13.5" strokeLinecap="round" strokeLinejoin="round" /></svg>);
const IcoChevron = (p) => (<svg width="10" height="10" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="M5 8l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>);

export default function AuthenticatedLayout({ children, onAddTransaction, notifications = [], onClearNotifications }) {
    const { props } = usePage();
    const user = props.auth?.user ?? props.user ?? null;
    const [theme, setTheme] = useState(getTheme());
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const notifRef = useRef(null);
    const menuRef = useRef(null);
    const searchRef = useRef(null);

    useEffect(() => {
        const down = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
            if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
        };
        document.addEventListener('mousedown', down);
        return () => document.removeEventListener('mousedown', down);
    }, []);

    useEffect(() => {
        const onKey = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setSearchOpen(true);
                requestAnimationFrame(() => searchRef.current?.focus());
            }
            if (e.key === 'Escape') { setSearchOpen(false); setNotifOpen(false); setMenuOpen(false); }
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, []);

    /* ★ تبديل الثيم: حفظ + إعادة تحميل حتى تقرأ كل المكوّنات اللوحة الجديدة */
    const onToggleTheme = () => {
        const next = toggleTheme();
        setTheme(next);
        window.location.reload();
    };

    const logout = () => { router.post(route('logout')); };

    const initials = String(user?.name ?? 'U').trim().split(/\s+/).slice(0, 2).map((n) => n[0]).join('').toUpperCase() || 'U';

    return (
        <div dir="rtl" className={`${F.ar} min-h-screen`} style={{ background: C.void, color: C.t1 }}>
            <Head title="TrackFlow">
                {/* ★ الخطوط — كانت ناقصة */}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Rajdhani:wght@500;600;700&family=Share+Tech+Mono&display=swap" rel="stylesheet" />
            </Head>

            {sidebarOpen && (
                <button type="button" aria-label="إغلاق" onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 z-[190] bg-black/60 lg:hidden" />
            )}
            <Sidebar mobileOpen={sidebarOpen} onMobileClose={() => setSidebarOpen(false)} />

            <div className="min-h-screen transition-all duration-300 lg:mr-[240px] [.sidebar-collapsed_&]:lg:mr-[68px]">
                {/* HEADER */}
                <header className="sticky top-0 z-[150] flex h-14 items-center gap-3 border-b px-4 lg:px-6 backdrop-blur-md"
                    style={{ borderColor: C.b, background: `${C.card}E6` }}>
                    <button type="button" onClick={() => setSidebarOpen(true)} aria-label="القائمة"
                        className="flex h-9 w-9 items-center justify-center border lg:hidden" style={{ borderColor: C.b, color: C.t3 }}>
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 6h14M3 10h14M3 14h14" strokeLinecap="round" /></svg>
                    </button>

                    <button type="button" onClick={() => { setSearchOpen(true); requestAnimationFrame(() => searchRef.current?.focus()); }}
                        className="hidden md:flex h-9 flex-1 max-w-xl items-center gap-2.5 border px-3 transition-colors hover:bg-white/[0.04]"
                        style={{ borderColor: C.b, background: C.card2 }}>
                        <span style={{ color: C.t4 }}><IcoSearch /></span>
                        <span className={`${F.ar} flex-1 text-start text-[0.72rem]`} style={{ color: C.t4 }}>ابحث عن معاملة، حساب أو تقرير...</span>
                        <kbd className={`${F.mono} text-[0.55rem] tracking-[1px] border px-1.5 py-0.5`} style={{ borderColor: C.b, color: C.t4 }}>CTRL K</kbd>
                    </button>

                    <div className="ms-auto flex items-center gap-2">
                        {onAddTransaction && (
                            <button type="button" onClick={onAddTransaction}
                                className="flex h-9 items-center gap-2 border px-3 transition-all hover:brightness-125"
                                style={{ borderColor: `${C.green}66`, color: C.green, background: C.greenTrace }}>
                                <IcoPlus />
                                <span className={`${F.ar} hidden sm:inline text-[0.72rem] font-bold`}>تسجيل عملية</span>
                            </button>
                        )}

                        {/* إشعارات */}
                        <div className="relative" ref={notifRef}>
                            <button type="button" aria-label="الإشعارات" title="الإشعارات" onClick={() => setNotifOpen(v => !v)}
                                className="relative flex h-9 w-9 items-center justify-center border transition-colors hover:bg-white/[0.05]"
                                style={{ borderColor: C.b, color: C.t3 }}>
                                <IcoBell />
                                {notifications.length > 0 && <span className="absolute -top-1 -left-1 h-2 w-2" style={{ background: C.green }} />}
                            </button>
                            {notifOpen && (
                                <div className="absolute left-0 top-11 z-[300] w-[340px] border shadow-2xl" style={{ background: C.card, borderColor: C.bHot }}>
                                    <div className="flex items-center justify-between border-b px-4 py-2.5" style={{ borderColor: C.b }}>
                                        <span className={`${F.mono} text-[0.62rem] tracking-[2px]`} style={{ color: C.green }}>// الإشعارات</span>
                                        {notifications.length > 0 && (
                                            <button type="button" onClick={() => { onClearNotifications?.(); setNotifOpen(false); }}
                                                className={`${F.mono} text-[0.58rem]`} style={{ color: C.t4 }}>مسح الكل</button>
                                        )}
                                    </div>
                                    {notifications.length === 0 ? (
                                        <div className="px-6 py-8 text-center">
                                            <div className={`${F.mono} text-[0.65rem] tracking-[1px]`} style={{ color: C.t4 }}>// لا توجد إشعارات جديدة //</div>
                                        </div>
                                    ) : (
                                        <div className="max-h-[320px] overflow-y-auto">
                                            {notifications.slice(0, 10).map((n, i) => (
                                                <div key={n.id ?? i} className="flex gap-2.5 border-b px-4 py-3 last:border-b-0" style={{ borderColor: C.b }}>
                                                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0" style={{ background: C.green }} />
                                                    <div className="min-w-0">
                                                        <div className={`${F.ar} text-[0.72rem] leading-5`} style={{ color: C.t2 }}>{n.message}</div>
                                                        {n.created_at && <div className={`${F.mono} mt-1 text-[0.55rem]`} style={{ color: C.t4 }}>{n.created_at}</div>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* ★ الثيم — يعمل فعليًا */}
                        <button type="button" onClick={onToggleTheme}
                            aria-label={theme === 'dark' ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن'}
                            title={theme === 'dark' ? 'الوضع الفاتح' : 'الوضع الداكن'}
                            className="flex h-9 w-9 items-center justify-center border transition-colors hover:bg-white/[0.05]"
                            style={{ borderColor: C.b, color: theme === 'dark' ? C.amber : C.cyan }}>
                            {theme === 'dark' ? <IcoSun /> : <IcoMoon />}
                        </button>

                        {/* ★ قائمة الحساب — تعمل فعليًا */}
                        <div className="relative" ref={menuRef}>
                            <button type="button" onClick={() => setMenuOpen(v => !v)} aria-label="حسابي"
                                className="flex h-9 items-center gap-2 border px-2 transition-colors hover:bg-white/[0.05]"
                                style={{ borderColor: menuOpen ? `${C.green}66` : C.b, background: C.greenTrace }}>
                                <span className="flex h-6 w-6 items-center justify-center border"
                                    style={{ borderColor: `${C.green}55`, color: C.green }}>
                                    <span className={`${F.mono} text-[0.55rem] font-bold`}>{initials}</span>
                                </span>
                                <span className={`${F.ar} hidden sm:block text-[0.7rem] font-semibold max-w-[90px] truncate`} style={{ color: C.t1 }}>
                                    {user?.name ?? 'حسابي'}
                                </span>
                                <span style={{ color: C.t4 }}><IcoChevron /></span>
                            </button>

                            {menuOpen && (
                                <div className="absolute left-0 top-11 z-[300] w-[220px] border shadow-2xl" style={{ background: C.card, borderColor: C.bHot }}>
                                    <div className="border-b px-4 py-3" style={{ borderColor: C.b }}>
                                        <div className={`${F.ar} text-[0.75rem] font-bold truncate`} style={{ color: C.t1 }}>{user?.name ?? '—'}</div>
                                        <div className={`${F.mono} text-[0.58rem] truncate mt-0.5`} style={{ color: C.t4 }}>{user?.email ?? '—'}</div>
                                    </div>
                                    <div className="p-1.5">
                                        {route().has('profile.edit') && (
                                            <button type="button" onClick={() => router.visit(route('profile.edit'))}
                                                className={`flex w-full items-center gap-2.5 px-2.5 py-2 text-start transition-colors hover:bg-white/[0.05]`}>
                                                <span style={{ color: C.t3 }}><IcoUser /></span>
                                                <span className={`${F.ar} text-[0.72rem]`} style={{ color: C.t2 }}>الملف الشخصي</span>
                                            </button>
                                        )}
                                        {route().has('profile.edit') && (
                                            <button type="button" onClick={() => router.visit(route('profile.edit'))}
                                                className="flex w-full items-center gap-2.5 px-2.5 py-2 text-start transition-colors hover:bg-white/[0.05]">
                                                <span style={{ color: C.t3 }}><IcoGear /></span>
                                                <span className={`${F.ar} text-[0.72rem]`} style={{ color: C.t2 }}>إعدادات الحساب</span>
                                            </button>
                                        )}
                                        <div className="my-1.5 border-t" style={{ borderColor: C.b }} />
                                        <button type="button" onClick={logout}
                                            className="flex w-full items-center gap-2.5 px-2.5 py-2 text-start transition-colors hover:bg-white/[0.05]">
                                            <span style={{ color: C.red }}><IcoLogout /></span>
                                            <span className={`${F.ar} text-[0.72rem]`} style={{ color: C.red }}>تسجيل الخروج</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* PAGE */}
                <main className="p-4 lg:p-6">
                    <div className="mx-auto w-full max-w-[1600px]">{children}</div>
                </main>
            </div>

            {/* SEARCH MODAL */}
            {searchOpen && (
                <div className="fixed inset-0 z-[500] flex items-start justify-center bg-black/70 px-4 pt-[12vh]"
                    onMouseDown={(e) => { if (e.target === e.currentTarget) setSearchOpen(false); }}>
                    <div className="w-full max-w-[600px] border shadow-2xl" style={{ background: C.card, borderColor: C.bHot }}>
                        <div className="flex items-center gap-3 border-b px-4" style={{ borderColor: C.b }}>
                            <span style={{ color: C.t4 }}><IcoSearch /></span>
                            <input ref={searchRef} autoFocus type="text" placeholder="ابحث في TrackFlow..."
                                className={`${F.ar} h-12 flex-1 bg-transparent text-[0.8rem] outline-none`} style={{ color: C.t1 }} />
                            <button type="button" onClick={() => setSearchOpen(false)} className={`${F.mono} text-[0.58rem] border px-1.5 py-0.5`} style={{ borderColor: C.b, color: C.t4 }}>ESC</button>
                        </div>
                        <div className="p-4">
                            <div className={`${F.mono} mb-2.5 text-[0.58rem] tracking-[2px]`} style={{ color: C.t4 }}>// وصول سريع</div>
                            <div className="grid gap-2 sm:grid-cols-2">
                                {['آخر المعاملات', 'الحسابات', 'الميزانية الشهرية', 'التحليلات'].map((item) => (
                                    <button key={item} type="button"
                                        className={`${F.ar} border px-3 py-2.5 text-start text-[0.72rem] transition-colors hover:bg-white/[0.04]`}
                                        style={{ borderColor: C.b, color: C.t2, background: C.card2 }}>
                                        {item}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}