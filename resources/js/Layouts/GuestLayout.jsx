import { Link } from '@inertiajs/react';
import { COLORS as C, FONT as F } from '@/Components/Dashboard/theme';

function BrandMark() {
    return (
        <div className="flex items-center gap-2.5">
            <svg width="32" height="32" viewBox="0 0 26 26" fill="none" className="shrink-0">
                <rect x="1" y="1" width="24" height="24" stroke={C.green} strokeWidth="1.5" />
                <path d="M7 16l4-6 3 4 5-7" stroke={C.green} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div>
                <div className={`${F.head} text-[1.25rem] font-bold tracking-[1.5px]`} style={{ color: C.t1 }}>
                    TRACK<span style={{ color: C.green }}>FLOW</span>
                </div>
                <div className={`${F.mono} text-[0.55rem] tracking-[2.5px]`} style={{ color: C.t4 }}>
                    FINANCIAL OS
                </div>
            </div>
        </div>
    );
}

export default function GuestLayout({ children }) {
    return (
        <div dir="rtl" className={`${F.ar} flex min-h-screen flex-col items-center justify-center p-4`}
            style={{ background: C.void, color: C.t1 }}>
            
            {/* الخلفية: نمط شبكة خفيفة */}
            <div className="fixed inset-0 -z-10 opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(${C.green} 1px, transparent 1px), linear-gradient(90deg, ${C.green} 1px, transparent 1px)`,
                    backgroundSize: '40px 40px',
                }}
            />

            {/* الشعار */}
            <div className="mb-8">
                <Link href="/">
                    <BrandMark />
                </Link>
            </div>

            {/* البطاقة */}
            <div className="w-full max-w-[440px] border shadow-2xl"
                style={{ background: C.card, borderColor: C.b }}>
                
                {/* شريط اللون العلوي */}
                <div className="h-[2px]" style={{ background: `linear-gradient(90deg, ${C.green}, ${C.cyan})` }} />

                {/* المحتوى */}
                <div className="px-8 py-8">
                    {children}
                </div>

                {/* التذييل */}
                <div className="border-t px-8 py-4" style={{ borderColor: C.b, background: C.card2 }}>
                    <div className={`${F.mono} text-[0.6rem] tracking-[2px] text-center`} style={{ color: C.t4 }}>
                        © {new Date().getFullYear()} TRACKFLOW · ALL RIGHTS RESERVED
                    </div>
                </div>
            </div>

            {/* رابط العودة */}
            <div className="mt-6">
                <Link href="/" className={`${F.mono} text-[0.65rem] tracking-[1px] transition-colors`}
                    style={{ color: C.t4 }}
                    onMouseEnter={e => { e.currentTarget.style.color = C.green; }}
                    onMouseLeave={e => { e.currentTarget.style.color = C.t4; }}>
                    ← العودة للرئيسية
                </Link>
            </div>
        </div>
    );
}