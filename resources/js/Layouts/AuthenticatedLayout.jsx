import { Head, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

const MN_SHORT = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

function pad(n) {
    return String(n).padStart(2, '0');
}

/* same three families as the rest of the app */
const F_MONO = "font-['Share_Tech_Mono',monospace]";
const F_HEAD = "font-['Rajdhani',sans-serif]";

/* ── inline icons (1:1 with the original sprite paths) ── */
const IcoLogo = () => (
    <svg width="38" height="38" viewBox="0 0 40 40">
        <polygon points="20,2 37,11 37,29 20,38 3,29 3,11" fill="none" stroke="#00e676" strokeWidth="1.3" />
        <polygon points="20,8 31,14 31,26 20,32 9,26 9,14" fill="none" stroke="#00e676" strokeWidth="0.6" opacity="0.35" />
        <circle cx="20" cy="20" r="4" fill="none" stroke="#00e676" strokeWidth="1.3" />
        <circle cx="20" cy="20" r="1.2" fill="#00e676" />
        <line x1="20" y1="16" x2="20" y2="8" stroke="#00e676" strokeWidth="0.8" opacity="0.5" />
    </svg>
);
const IcoPlus = (p) => (
    <svg width="13" height="13" viewBox="0 0 20 20" {...p}>
        <line x1="10" y1="3" x2="10" y2="17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <line x1="3" y1="10" x2="17" y2="10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
);
const IcoBell = (p) => (
    <svg width="16" height="16" viewBox="0 0 20 20" {...p}>
        <path d="M10 2a6 6 0 016 6c0 3 1 4 2 5H2c1-1 2-2 2-5a6 6 0 016-6z" fill="none" stroke="currentColor" strokeWidth="1.3" />
        <path d="M8 17a2 2 0 004 0" fill="none" stroke="currentColor" strokeWidth="1.3" />
    </svg>
);
const IcoMoon = (p) => (
    <svg width="15" height="15" viewBox="0 0 20 20" {...p}>
        <path d="M17 13A7 7 0 017 3a8 8 0 1010 10z" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
);
const IcoSun = (p) => (
    <svg width="15" height="15" viewBox="0 0 20 20" {...p}>
        <circle cx="10" cy="10" r="4" fill="none" stroke="currentColor" strokeWidth="1.4" />
        <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
            <line x1="10" y1="2" x2="10" y2="4" /><line x1="10" y1="16" x2="10" y2="18" />
            <line x1="2" y1="10" x2="4" y2="10" /><line x1="16" y1="10" x2="18" y2="10" />
            <line x1="4.2" y1="4.2" x2="5.6" y2="5.6" /><line x1="14.4" y1="14.4" x2="15.8" y2="15.8" />
            <line x1="4.2" y1="15.8" x2="5.6" y2="14.4" /><line x1="14.4" y1="5.6" x2="15.8" y2="4.2" />
        </g>
    </svg>
);
const IcoFullscreen = (p) => (
    <svg width="14" height="14" viewBox="0 0 20 20" {...p}>
        <path d="M3 8V3h5M12 3h5v5M17 12v5h-5M8 17H3v-5" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IcoExitFs = (p) => (
    <svg width="14" height="14" viewBox="0 0 20 20" {...p}>
        <path d="M8 3v5H3M12 3v5h5M17 12h-5v5M3 12h5v5" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export default function AuthenticatedLayout({
    children,
    dbOnline = true,
    onAddTransaction,
    onMonthChange,
    onDateRange,
    notifications = [],
    onClearNotifications,
}) {
    const [now, setNow] = useState(new Date());
    const [isLight, setIsLight] = useState(false);
    const [monthValue, setMonthValue] = useState('current');
    const [drOpen, setDrOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [notifDot, setNotifDot] = useState(notifications.length > 0);
    const [preset, setPreset] = useState(null);
    const [drFrom, setDrFrom] = useState('');
    const [drTo, setDrTo] = useState('');
    const drWrapRef = useRef(null);
    const notifRef = useRef(null);

    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);

    useEffect(() => {
        const saved = localStorage.getItem('tf_theme');
        if (saved === 'light') setIsLight(true);
    }, []);

    useEffect(() => {
        const onClick = (e) => {
            if (drWrapRef.current && !drWrapRef.current.contains(e.target)) setDrOpen(false);
            if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
        };
        const onKey = (e) => {
            if (e.key === 'Escape') {
                setDrOpen(false);
                setNotifOpen(false);
            }
        };
        document.addEventListener('click', onClick);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('click', onClick);
            document.removeEventListener('keydown', onKey);
        };
    }, []);

    const timeLabel = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    const dateLabel = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;

    const monthOptions = Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        return { value: `${d.getFullYear()}-${pad(d.getMonth() + 1)}`, label: `${MN_SHORT[d.getMonth()]} ${d.getFullYear()}` };
    });

    const handleMonthSelect = (e) => {
        const v = e.target.value;
        setMonthValue(v);
        if (v === 'custom') {
            setDrOpen(true);
            return;
        }
        const [year, month] = v.split('-').map(Number);
        onMonthChange?.({ year, month });
    };

    const applyPreset = (days) => {
        setPreset(days);
        const to = new Date();
        const from = days === 0 ? new Date(to.getFullYear(), to.getMonth(), 1) : new Date(Date.now() - days * 86400000);
        setDrFrom(from.toISOString().split('T')[0]);
        setDrTo(to.toISOString().split('T')[0]);
    };

    const applyDateRange = () => {
        onDateRange?.({ from: drFrom, to: drTo });
        setDrOpen(false);
    };

    const clearDateRange = () => {
        setDrFrom('');
        setDrTo('');
        setPreset(null);
        setMonthValue('current');
        setDrOpen(false);
    };

    const toggleTheme = () => {
        setIsLight((v) => {
            localStorage.setItem('tf_theme', !v ? 'light' : 'dark');
            return !v;
        });
    };

    const toggleNotifPanel = () => {
        setNotifOpen((v) => {
            if (!v) setNotifDot(false);
            return !v;
        });
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
        else document.exitFullscreen?.();
    };

    return (
        <div className={isLight ? 'min-h-screen bg-[#f0f4f2]' : 'min-h-screen bg-[#040507]'}>
            <Head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@500;600;700&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap"
                    rel="stylesheet"
                />
            </Head>

            {/* TOPBAR */}
            <header
                className={`relative flex items-center justify-between gap-3 h-[58px] px-[22px] sticky top-0 z-[200] backdrop-blur-md border-b ${F_MONO} ` +
                    (isLight ? 'bg-[rgba(240,244,242,0.95)] border-[rgba(0,150,80,0.18)] text-[#00a854]' : 'bg-[rgba(8,12,16,0.95)] border-[rgba(0,230,118,0.13)] text-[#00e676]')
                }
            >
                {/* LOGO */}
                <div className="flex items-center gap-3">
                    <IcoLogo />
                    <div>
                        <div className={`${F_HEAD} text-[1.2rem] font-bold tracking-[4px] ${isLight ? 'text-[#1a2e22]' : 'text-[#e8f5ef]'}`}>
                            TRACK<em className="not-italic text-[#00e676]">FLOW</em>
                        </div>
                        <div className={`${F_MONO} text-[0.58rem] tracking-[2px] hidden sm:block ${isLight ? 'text-[#a8c4b0]' : 'text-[#2d4a38]'}`}>
                            MYSQL // FULL ANALYTICS // v5.0
                        </div>
                    </div>
                </div>

                {/* SYSTEM STATUS */}
                <div className={`hidden md:flex items-center gap-2 text-[0.72rem] tracking-[1.5px] ${isLight ? 'text-[#3a5c45]' : 'text-[#a8c4b0]'}`}>
                    <span className={`w-[7px] h-[7px] rounded-full ${dbOnline ? 'bg-[#00e676] animate-pulse' : 'bg-[#ff3d5a]'}`} style={dbOnline ? { boxShadow: '0 0 10px #00e676' } : undefined} />
                    <span>{timeLabel}</span>
                    <span className="opacity-40">//</span>
                    <span>{dateLabel}</span>
                    <span className="opacity-40">//</span>
                    <span className="font-semibold tracking-[1px]" style={{ color: dbOnline ? '#00e676' : '#ff3d5a' }}>
                        {dbOnline ? 'DB ONLINE' : 'OFFLINE'}
                    </span>
                </div>

                {/* RIGHT ACTIONS */}
                <div className="flex items-center gap-2">
                    {/* MONTH / DATE RANGE */}
                    <div className="relative" ref={drWrapRef}>
                        <select
                            value={monthValue}
                            onChange={handleMonthSelect}
                            className={`hidden sm:block border px-[14px] py-[6px] text-[0.72rem] tracking-[1px] outline-none cursor-pointer ${F_MONO} ` +
                                (isLight ? 'bg-white border-[rgba(0,150,80,0.18)] text-[#007a3d]' : 'bg-[#101820] border-[rgba(0,230,118,0.13)] text-[#00e676]')
                            }
                        >
                            {monthOptions.map((m, i) => (
                                <option key={m.value} value={i === 0 ? 'current' : m.value}>{m.label}</option>
                            ))}
                            <option value="custom">📅 نطاق مخصص...</option>
                        </select>

                        {drOpen && (
                            <div className="absolute left-0 z-[400] mt-2 w-[300px] bg-[#101820] border border-[rgba(0,230,118,0.45)] p-4 shadow-[0_8px_40px_rgba(0,0,0,0.5)]">
                                <div className={`${F_MONO} text-[0.6rem] tracking-[2px] text-[#5a8068] mb-2.5`}>// CUSTOM DATE RANGE</div>
                                <div className="grid grid-cols-2 gap-2.5 mb-3">
                                    <div>
                                        <div className={`${F_MONO} text-[0.6rem] text-[#5a8068] mb-1`}>من تاريخ</div>
                                        <input type="date" value={drFrom} onChange={(e) => setDrFrom(e.target.value)} className="w-full bg-[#0c1117] border border-[rgba(0,230,118,0.13)] px-2.5 py-1.5 text-[#e8f5ef] text-[0.8rem] outline-none focus:border-[rgba(0,230,118,0.45)]" />
                                    </div>
                                    <div>
                                        <div className={`${F_MONO} text-[0.6rem] text-[#5a8068] mb-1`}>إلى تاريخ</div>
                                        <input type="date" value={drTo} onChange={(e) => setDrTo(e.target.value)} className="w-full bg-[#0c1117] border border-[rgba(0,230,118,0.13)] px-2.5 py-1.5 text-[#e8f5ef] text-[0.8rem] outline-none focus:border-[rgba(0,230,118,0.45)]" />
                                    </div>
                                </div>
                                <div className="flex gap-1.5 mb-2.5">
                                    {[{ d: 7, l: '7 أيام' }, { d: 30, l: '30 يوم' }, { d: 90, l: '3 أشهر' }, { d: 0, l: 'هذا الشهر' }].map((p) => (
                                        <button
                                            key={p.d}
                                            type="button"
                                            onClick={() => applyPreset(p.d)}
                                            className={`${F_HEAD} text-[0.7rem] font-semibold px-2.5 py-1 border transition-colors ` +
                                                (preset === p.d ? 'border-[#00e676] text-[#00e676] bg-[rgba(0,230,118,0.07)]' : 'border-[rgba(0,230,118,0.13)] text-[#a8c4b0] hover:border-[rgba(0,230,118,0.45)]')
                                            }
                                        >
                                            {p.l}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <button type="button" onClick={applyDateRange} className={`${F_HEAD} flex-1 border border-[#00e676] text-[#00e676] py-2 text-[0.75rem] font-bold tracking-[2px] uppercase hover:bg-[#00e676] hover:text-[#040507] transition-colors`}>
                                        // تطبيق //
                                    </button>
                                    <button type="button" onClick={clearDateRange} className={`${F_HEAD} border border-[rgba(255,61,90,0.3)] text-[#ff3d5a] px-3 py-2 text-[0.75rem] hover:bg-[rgba(255,61,90,0.1)] transition-colors`}>
                                        ✕
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* NOTIFICATIONS */}
                    <div className="relative" ref={notifRef}>
                        <button
                            type="button"
                            title="الإشعارات"
                            onClick={toggleNotifPanel}
                            className={`relative w-[34px] h-[34px] flex items-center justify-center border transition-colors ` +
                                (isLight ? 'border-[rgba(0,150,80,0.18)] text-[#3a5c45] hover:border-[rgba(0,150,80,0.5)] hover:text-[#00a854]' : 'border-[rgba(0,230,118,0.13)] text-[#a8c4b0] hover:border-[rgba(0,230,118,0.45)] hover:text-[#00e676]')
                            }
                        >
                            <IcoBell />
                            {notifDot && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#ff3d5a] border border-black animate-pulse" />}
                        </button>

                        {notifOpen && (
                            <div className="absolute left-0 z-[400] mt-2 w-64 bg-[#101820] border border-[rgba(0,230,118,0.45)] py-2 text-[0.72rem] shadow-[0_8px_40px_rgba(0,0,0,0.5)]">
                                <div className="flex justify-between items-center border-b border-[rgba(0,230,118,0.13)] px-3 pb-2">
                                    <span className={`${F_HEAD} text-[#00e676] font-bold tracking-[1px]`}>الإشعارات</span>
                                    <button type="button" onClick={() => { onClearNotifications?.(); setNotifDot(false); }} className="text-[#5a8068] text-[0.7rem]">مسح الكل</button>
                                </div>
                                {notifications.length === 0 ? (
                                    <div className={`${F_MONO} text-center py-6 text-[0.68rem] text-[#2d4a38] tracking-[2px]`}>// لا توجد إشعارات //</div>
                                ) : (
                                    notifications.slice(0, 10).map((n, i) => (
                                        <div key={i} className="border-b border-[rgba(0,230,118,0.05)] px-3 py-2 text-[#e8f5ef]/80 last:border-0">
                                            {n.message}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* THEME TOGGLE */}
                    <button
                        type="button"
                        title="تبديل المظهر"
                        onClick={toggleTheme}
                        className={`w-[34px] h-[34px] flex items-center justify-center border transition-colors ` +
                            (isLight ? 'border-[rgba(0,150,80,0.18)] text-[#3a5c45] hover:border-[rgba(0,150,80,0.5)] hover:text-[#00a854]' : 'border-[rgba(0,230,118,0.13)] text-[#a8c4b0] hover:border-[rgba(0,230,118,0.45)] hover:text-[#00e676]')
                        }
                    >
                        {isLight ? <IcoSun /> : <IcoMoon />}
                    </button>

                    {/* FULLSCREEN */}
                    <button
                        type="button"
                        title="ملء الشاشة"
                        onClick={toggleFullscreen}
                        className={`hidden sm:flex w-[34px] h-[34px] items-center justify-center border transition-colors ` +
                            (isLight ? 'border-[rgba(0,150,80,0.18)] text-[#3a5c45] hover:border-[rgba(0,150,80,0.5)] hover:text-[#00a854]' : 'border-[rgba(0,230,118,0.13)] text-[#a8c4b0] hover:border-[rgba(0,230,118,0.45)] hover:text-[#00e676]')
                        }
                    >
                        {document.fullscreenElement ? <IcoExitFs /> : <IcoFullscreen />}
                    </button>

                    {/* LOG TRANSACTION */}
                    <button
                        type="button"
                        onClick={onAddTransaction}
                        className={`${F_HEAD} flex items-center gap-1.5 border border-[#00e676] px-[18px] py-[7px] text-[#00e676] text-[0.82rem] font-bold tracking-[2px] uppercase transition-colors hover:bg-[#00e676] hover:text-[#040507]`}
                    >
                        <IcoPlus />
                        <span className="hidden sm:inline">سجّل عملية</span>
                    </button>
                </div>

                <div className="pointer-events-none absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-[#00e676]/60 to-transparent" />
            </header>

            {/* MAIN CONTENT — the missing piece: real page padding + background */}
            <main className={`p-[22px] flex flex-col gap-5 min-h-[calc(100vh-58px)] ${isLight ? 'bg-[#e4ede8]' : 'bg-[#080c10]'}`}>
                {children}
            </main>
        </div>
    );
}