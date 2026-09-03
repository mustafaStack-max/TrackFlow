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

export default function AuthenticatedLayout({ children, onAddTransaction }) {
    const { props } = usePage();
    const user = props.auth?.user ?? props.user ?? null;

    const [notifications, setNotifications] = useState(props.notifications ?? []);
    const lastCountRef = useRef(notifications.filter(n => !n.read_at).length);

    const [theme, setTheme] = useState(getTheme());
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [bellShake, setBellShake] = useState(false); // ★ اهتزاز الجرس
    const notifRef = useRef(null);
    const menuRef = useRef(null);
    const searchRef = useRef(null);

    const unreadCount = notifications.filter(n => !n.read_at).length;

    /* ★ صوت تنبيه خفيف عند وصول إشعار جديد */
    const playNotifSound = () => {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.connect(g); g.connect(ctx.destination);
            o.type = 'sine';
            o.frequency.setValueAtTime(880, ctx.currentTime);
            o.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1);
            g.gain.setValueAtTime(0.15, ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
            o.start();
            o.stop(ctx.currentTime + 0.3);
        } catch (e) { /* ignore */ }
    };

    /* ★ طلب إذن browser notifications */
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    /* ★ Polling: فحص إشعارات جديدة كل 30 ثانية */
    useEffect(() => {
        let stopped = false;
        const poll = async () => {
            if (stopped) return;
            try {
                const res = await fetch(route('notifications.index'), {
                    headers: { 'X-Inertia': 'false', 'Accept': 'application/json' },
                    credentials: 'same-origin',
                });
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        const newUnread = data.filter(n => !n.read_at).length;
                        const oldUnread = notifications.filter(n => !n.read_at).length;
                        if (newUnread > oldUnread) {
                            playNotifSound();
                            setBellShake(true);
                            setTimeout(() => setBellShake(false), 1200);
                            // Browser notification
                            if (Notification.permission === 'granted') {
                                const latest = data[0];
                                new Notification('TrackFlow', {
                                    body: latest?.message ?? 'لديك إشعار جديد',
                                    icon: '/favicon.ico',
                                });
                            }
                        }
                        setNotifications(data);
                    }
                }
            } catch (e) { /* ignore */ }
            if (!stopped) setTimeout(poll, 30000);
        };
        const t = setTimeout(poll, 30000);
        return () => { stopped = true; clearTimeout(t); };
    }, [notifications]);

    /* ★ تحديث محلي عند تغيير props.notifications (Inertia navigation) */
    useEffect(() => {
        setNotifications(props.notifications ?? []);
    }, [props.notifications]);

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

    const onToggleTheme = () => {
        const next = toggleTheme();
        setTheme(next);
        window.location.reload();
    };

    /* ★ قراءة كل الإشعارات */
    const clearNotifications = () => {
        router.post(route('notifications.readAll'), {}, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setNotifications(notifications.map(n => ({ ...n, read_at: new Date().toISOString() })));
                setNotifOpen(false);
            },
        });
    };

    /* ★ قراءة إشعار واحد */
    const markAsRead = (id) => {
        router.post(route('notifications.readOne', id), {}, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setNotifications(notifications.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
            },
        });
    };

    const logout = () => { router.post(route('logout')); };
    const displayName = user?.username ?? user?.name ?? 'حسابي';
    const initials = String(displayName).trim().split(/\s+/).slice(0, 2).map((n) => n[0]).join('').toUpperCase() || 'U';
    return (
        <div dir="rtl" className={`${F.ar} min-h-screen`} style={{ background: C.void, color: C.t1 }}>
            <Head title="TrackFlow">
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Rajdhani:wght@500;600;700&family=Share+Tech+Mono&display=swap" rel="stylesheet" />
                {/* ★ Keyframes للاهتزاز */}
                <style>{`
                    @keyframes bellShake {
                        0%, 100% { transform: rotate(0); }
                        15% { transform: rotate(15deg); }
                        30% { transform: rotate(-12deg); }
                        45% { transform: rotate(10deg); }
                        60% { transform: rotate(-8deg); }
                        75% { transform: rotate(5deg); }
                    }
                    .bell-shake { animation: bellShake 0.8s ease-in-out 2; transform-origin: 50% 0; }
                `}</style>
            </Head>

            {sidebarOpen && (
                <button type="button" aria-label="إغلاق" onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 z-[190] bg-black/60 lg:hidden" />
            )}
            <Sidebar mobileOpen={sidebarOpen} onMobileClose={() => setSidebarOpen(false)} />

            <div className="min-h-screen transition-all duration-300 lg:mr-[240px] [.sidebar-collapsed_&]:lg:mr-[68px]">
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

                    <div className="ms-auto flex items-center gap-1">
    {onAddTransaction && (
        <button type="button" onClick={onAddTransaction}
            className="flex h-9 items-center gap-2 rounded-md px-3 transition-all hover:brightness-125"
            style={{ borderColor: `${C.green}44`, border: `1px solid ${C.green}44`, color: C.green, background: C.greenTrace }}>
            <IcoPlus />
            <span className={`${F.ar} hidden sm:inline text-[0.72rem] font-bold`}>تسجيل عملية</span>
        </button>
    )}

    {/* ★ الجرس — أيقونة فقط بدون إطار */}
    <div className="relative" ref={notifRef}>
        <button type="button" aria-label="الإشعارات" title="الإشعارات" onClick={() => setNotifOpen(v => !v)}
            className={`relative flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-white/[0.06] ${bellShake ? 'bell-shake' : ''}`}
            style={{ color: unreadCount > 0 ? C.red : C.t3 }}>
            <IcoBell />
            {unreadCount > 0 && (
                <>
                    <span className="absolute top-0 left-0 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1"
                        style={{ background: C.red, color: '#fff' }}>
                        <span className={`${F.mono} text-[0.55rem] font-bold`}>{unreadCount}</span>
                    </span>
                    <span className="absolute top-0 left-0 h-4 w-4 animate-ping rounded-full" style={{ background: C.red, opacity: 0.35 }} />
                </>
            )}
        </button>

        {/* popover الإشعارات — بدون تغيير */}
        {notifOpen && (
            <div className="absolute left-0 top-11 z-[300] w-[360px] border shadow-2xl" style={{ background: C.card, borderColor: C.bHot }}>
                <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: C.b }}>
                    <div className="flex items-center gap-2">
                        <span className={`${F.mono} text-[0.62rem] tracking-[2px]`} style={{ color: C.green }}>// الإشعارات</span>
                        {unreadCount > 0 && (
                            <span className={`${F.mono} text-[0.55rem] border px-1.5 py-0.5 rounded-sm`}
                                style={{ borderColor: `${C.red}44`, color: C.red, background: `${C.red}0d` }}>
                                {unreadCount} جديد
                            </span>
                        )}
                    </div>
                    {notifications.length > 0 && (
                        <button type="button" onClick={clearNotifications}
                            className={`${F.ar} text-[0.68rem] font-semibold transition-colors hover:text-white`} style={{ color: C.t4 }}>
                            قراءة الكل
                        </button>
                    )}
                </div>
                {notifications.length === 0 ? (
                    <div className="px-6 py-10 text-center">
                        <div className={`${F.ar} text-[0.82rem] font-semibold`} style={{ color: C.t2 }}>لا توجد إشعارات جديدة</div>
                    </div>
                ) : (
                    <div className="max-h-[380px] overflow-y-auto">
                        {notifications.slice(0, 15).map((n) => {
                            const isUnread = !n.read_at;
                            const isCritical = n.level === 'critical';
                            return (
                                <button key={n.id} type="button" onClick={() => isUnread && markAsRead(n.id)}
                                    className="flex w-full gap-2.5 border-b px-4 py-3 text-start transition-colors hover:bg-white/[0.03] last:border-b-0"
                                    style={{ borderColor: C.b, background: isUnread ? `${isCritical ? C.red : C.green}08` : 'transparent' }}>
                                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                                        style={{ background: isCritical ? C.red : (isUnread ? C.green : C.t4) }} />
                                    <div className="min-w-0 flex-1">
                                        <div className={`${F.ar} text-[0.75rem] leading-5`}
                                            style={{ color: isUnread ? C.t1 : C.t3, fontWeight: isUnread ? 600 : 400 }}>
                                            {n.message}
                                        </div>
                                        {n.created_at && <div className={`${F.mono} mt-1 text-[0.58rem]`} style={{ color: C.t4 }}>{n.created_at}</div>}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        )}
    </div>

    {/* ★ الثيم — أيقونة فقط بدون إطار */}
    <button type="button" onClick={onToggleTheme}
        aria-label={theme === 'dark' ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن'}
        className="flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-white/[0.06]"
        style={{ color: theme === 'dark' ? C.amber : C.cyan }}>
        {theme === 'dark' ? <IcoSun /> : <IcoMoon />}
    </button>

    {/* ★ الحساب — بنفس أسلوب الـ Sidebar */}
    <div className="relative" ref={menuRef}>
        <button type="button" onClick={() => setMenuOpen(v => !v)} aria-label="حسابي"
            className="flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-white/[0.06]">
            <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border"
                style={{ borderColor: `${C.green}55`, background: C.greenTrace, color: C.green }}>
                <span className={`${F.mono} text-[0.65rem] font-bold`}>{initials}</span>
                <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border-2"
                    style={{ borderColor: C.void, background: C.green }} />
            </span>
            <span className={`${F.ar} hidden sm:block max-w-[100px] truncate text-[0.75rem] font-semibold`} style={{ color: C.t1 }}>
                {displayName}
            </span>
            <span style={{ color: C.t4 }}><IcoChevron /></span>
        </button>

        {menuOpen && (
            <div className="absolute left-0 top-11 z-[300] w-[230px] border shadow-2xl" style={{ background: C.card, borderColor: C.bHot }}>
                <div className="border-b px-4 py-3" style={{ borderColor: C.b }}>
                    <div className={`${F.ar} text-[0.78rem] font-bold truncate`} style={{ color: C.t1 }}>{displayName}</div>
                    <div className={`${F.mono} text-[0.58rem] truncate mt-0.5`} style={{ color: C.t4 }}>{user?.email ?? '—'}</div>
                </div>
                <div className="p-1.5">
                    {route().has('profile.edit') && (
                        <button type="button" onClick={() => { setMenuOpen(false); router.visit(route('profile.edit')); }}
                            className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-start transition-colors hover:bg-white/[0.05]">
                            <span style={{ color: C.t3 }}><IcoUser /></span>
                            <span className={`${F.ar} text-[0.72rem]`} style={{ color: C.t2 }}>الملف الشخصي</span>
                        </button>
                    )}
                    {route().has('profile.edit') && (
                        <button type="button" onClick={() => { setMenuOpen(false); router.visit(route('profile.edit')); }}
                            className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-start transition-colors hover:bg-white/[0.05]">
                            <span style={{ color: C.t3 }}><IcoGear /></span>
                            <span className={`${F.ar} text-[0.72rem]`} style={{ color: C.t2 }}>إعدادات الحساب</span>
                        </button>
                    )}
                    <div className="my-1.5 border-t" style={{ borderColor: C.b }} />
                    <button type="button" onClick={() => { setMenuOpen(false); logout(); }}
                        className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-start transition-colors hover:bg-white/[0.05]">
                        <span style={{ color: C.red }}><IcoLogout /></span>
                        <span className={`${F.ar} text-[0.72rem]`} style={{ color: C.red }}>تسجيل الخروج</span>
                    </button>
                </div>
            </div>
        )}
    </div>
</div>
                </header>

                <main className="p-4 lg:p-6">
                    <div className="mx-auto w-full max-w-[1600px]">{children}</div>
                </main>
            </div>

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