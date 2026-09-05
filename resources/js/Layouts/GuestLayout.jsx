import { Link } from '@inertiajs/react';
import { COLORS as C, FONT as F } from '@/Components/Dashboard/theme';

/* ★★ شعار ASCENT الجديد — القمم الثلاث ★★ */
function BrandMark() {
    return (
        <div className="flex flex-col items-center gap-4">
            {/* الشعار مع توهج */}
            <div className="relative flex h-20 w-20 items-center justify-center">
                {/* توهج خلفي */}
                <div className="absolute inset-0 blur-2xl opacity-40"
                    style={{ background: `radial-gradient(circle, ${C.green}, transparent 70%)` }} />
                <svg width="76" height="76" viewBox="0 0 96 96" fill="none" className="relative"
                    style={{ color: C.green, filter: `drop-shadow(0 0 18px ${C.green}55)` }}>
                    <g stroke="currentColor" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M26 70 L48 48 L70 70" opacity="0.35" />
                        <path d="M26 52 L48 30 L70 52" opacity="0.7" />
                        <path d="M38 30 L48 20 L58 30" />
                    </g>
                </svg>
            </div>
            {/* Wordmark */}
            <div className="text-center">
                <div className={`${F.head} text-[1.35rem] font-bold tracking-[2px]`} style={{ color: C.t1 }}>
                    TRACK<span style={{ color: C.green }}>FLOW</span>
                </div>
                <div className={`${F.mono} text-[0.58rem] tracking-[3px] mt-1`} style={{ color: C.t4 }}>
                    // FINANCIAL OS
                </div>
            </div>
        </div>
    );
}

export default function GuestLayout({ children }) {
    return (
        <div dir="rtl" className={`${F.ar} flex min-h-screen flex-col items-center justify-center p-4`}
            style={{ background: C.void, color: C.t1 }}>

            {/* ★ الخلفية: شبكة خفيفة + توهج علوي (مثل Welcome) */}
            <div className="fixed inset-0 -z-10"
                style={{
                    background: `
                        radial-gradient(900px 400px at 50% -80px, ${C.green}0d, transparent),
                        radial-gradient(600px 300px at 20% 80%, ${C.cyan}08, transparent)
                    `,
                }} />
            <div className="fixed inset-0 -z-10 opacity-[0.035]"
                style={{
                    backgroundImage: `linear-gradient(${C.green} 1px, transparent 1px), linear-gradient(90deg, ${C.green} 1px, transparent 1px)`,
                    backgroundSize: '40px 40px',
                }}
            />

            {/* الشعار */}
            <Link href="/" className="mb-8 block transition-transform hover:scale-[1.02]">
                <BrandMark />
            </Link>

            {/* البطاقة */}
            <div className="w-full max-w-[440px] border shadow-2xl"
                style={{ background: C.card, borderColor: C.bHot }}>

                {/* شريط اللون العلوي */}
                <div className="h-[2px]" style={{ background: `linear-gradient(90deg, ${C.green}, ${C.cyan}, ${C.green})` }} />

                {/* المحتوى */}
                <div className="px-8 py-8">
                    {children}
                </div>

                {/* التذييل */}
                <div className="border-t px-8 py-4" style={{ borderColor: C.b, background: C.card2 }}>
                    <div className="flex items-center justify-center gap-3">
                        {/* شعار صغير في التذييل */}
                        <svg width="16" height="16" viewBox="0 0 96 96" fill="none" style={{ color: C.green }}>
                            <g stroke="currentColor" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M26 70 L48 48 L70 70" opacity="0.35" />
                                <path d="M26 52 L48 30 L70 52" opacity="0.7" />
                                <path d="M38 30 L48 20 L58 30" />
                            </g>
                        </svg>
                        <span className={`${F.mono} text-[0.58rem] tracking-[2px]`} style={{ color: C.t4 }}>
                            © {new Date().getFullYear()} TRACKFLOW · ALL RIGHTS RESERVED
                        </span>
                    </div>
                </div>
            </div>

            {/* رابط العودة */}
            <div className="mt-6">
                <Link href="/"
                    className={`${F.mono} flex items-center gap-2 text-[0.65rem] tracking-[1px] transition-colors`}
                    style={{ color: C.t4 }}
                    onMouseEnter={e => { e.currentTarget.style.color = C.green; }}
                    onMouseLeave={e => { e.currentTarget.style.color = C.t4; }}>
                    <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M13 5l-6 5 6 5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    العودة للرئيسية
                </Link>
            </div>
        </div>
    );
}