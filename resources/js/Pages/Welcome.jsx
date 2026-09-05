import { Head, Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { COLORS as C, FONT as F } from '@/Components/Dashboard/theme';

/* ── بيانات ── */
const FEATURES = [
    { t: 'لوحة واحدة شاملة', d: 'حساباتك ومداخيلك ومصاريفك وميزانياتك في مكانٍ واحد مترابط.', i: 'M3 3h6v6H3zM11 3h6v6h-6zM3 11h6v6H3zM11 11h6v6h-6z' },
    { t: 'تحليلات فورية', d: 'مبيانات واضحة تكشف أنماطك المالية لحظة بلحظة، دون تعقيد.', i: 'M3 17V9M8 17V4M13 17v-7M18 17v-3' },
    { t: 'توقعات ذكية', d: 'تقديرات مدروسة لمسارك القادم تساعدك على الاستعداد لا المفاجأة.', i: 'M3 15l5-5 3 3 6-7M13 6h4v4' },
    { t: 'ميزانيات منضبطة', d: 'سقوف إنفاق واضحة تنبّهك قبل تجاوز حدودك.', i: 'M10 3l7 12H3l7-12zM10 8v3M10 13.5v.5' },
    { t: 'خصوصية كاملة', d: 'بياناتك ملكك وحدك: تُحفظ بأمان وتُصدَّر متى شئت.', i: 'M10 2l7 3v5c0 4-3 7-7 8-4-1-7-4-7-8V5l7-3zM7.5 10l2 2 3.5-4' },
    { t: 'تجربة عربية أنيقة', d: 'واجهة عربية متقنة التفاصيل، تُريح العين وتُصفّي الذهن.', i: 'M10 4a6 6 0 1 0 6 6M10 7a3 3 0 1 0 3 3M10 10h.01M4 4l12 12' },
];
const STEPS = [
    { n: '01', t: 'أنشئ حسابك', d: 'سجّل في أقل من دقيقة وأضف حساباتك: نقدي، بنكي، بطاقة أو ادخار.' },
    { n: '02', t: 'سجّل عملياتك', d: 'أضف مداخيلك ومصاريفك بتصنيفات واضحة وألوان تميّزها للوهلة الأولى.' },
    { n: '03', t: 'عِش بوضوح', d: 'تابع لوحتك، افهم أنماطك، وقرّر خطواتك القادمة بأرقامٍ موثوقة.' },
];
const WHY = [
    'رؤية موحّدة لكل حساباتك في شاشة واحدة',
    'تنبيهات ذكية قبل تجاوز ميزانيتك',
    'تقارير شهرية تلخّص قصتك المالية',
    'تصدير بياناتك بصيغة CSV في أي وقت',
];
const DIST = [['سكن', 45, C.gold], ['طعام', 30, C.red], ['نقل', 25, C.cyan]];
const QUOTES = [
    { q: 'أول مرة أفهم أين يذهب راتبي فعلًا. بساطة اللوحة تجعل المتابعة عادة يومية ممتعة.', n: 'يوسف العلوي', r: 'مطوّر برمجيات' },
    { q: 'واجهة عربية أنيقة تشبه أدوات المحترفين، لكن بدون أي تعقيد.', n: 'سلمى بناني', r: 'مصممة منتجات' },
    { q: 'التوقعات الذكية نبهتني قبل تجاوز ميزانيتي بشهر كامل.', n: 'كريم الفاسي', r: 'محلل مالي' },
];
const BARS = [[42, 22], [58, 30], [36, 18], [70, 40], [52, 26], [64, 34], [48, 20], [80, 44], [60, 30], [72, 38], [56, 26], [88, 48]];

/* ── أدوات صغيرة ── */
const Ico = ({ d, s = 20, c = C.green }) => (
    <svg width={s} height={s} viewBox="0 0 20 20" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
);
function Reveal({ children, delay = 0, className = '' }) {
    const ref = useRef(null); const [on, setOn] = useState(false);
    useEffect(() => { const io = new IntersectionObserver(([e]) => e.isIntersecting && setOn(true), { threshold: 0.12 }); if (ref.current) io.observe(ref.current); return () => io.disconnect(); }, []);
    return <div ref={ref} className={`${className} transition-all duration-700 ease-out`} style={{ opacity: on ? 1 : 0, transform: on ? 'none' : 'translateY(22px)', transitionDelay: `${delay}ms` }}>{children}</div>;
}
const Over = ({ children }) => <div className={`${F.mono} mb-3 text-[0.6rem] tracking-[3px]`} style={{ color: C.green }}>{children}</div>;
const H2 = ({ over, title, sub }) => (
    <Reveal className="mx-auto mb-12 max-w-2xl text-center">
        <Over>{over}</Over>
        <h2 className="text-2xl font-bold leading-snug md:text-3xl" style={{ color: C.t1 }}>{title}</h2>
        {sub && <p className="mt-3 text-[0.9rem] leading-7" style={{ color: C.t3 }}>{sub}</p>}
    </Reveal>
);
const btn = `${F.ar} inline-flex items-center justify-center gap-2 border px-6 py-3 text-[0.85rem] font-semibold transition-all duration-200`;

export default function Welcome({ auth }) {
    return (
        <div dir="rtl" className={`${F.ar} min-h-screen`} style={{ background: C.void, color: C.t1 }}>
            <Head title="TrackFlow — وضوحٌ مالي كامل" />

            {/* NAV */}
            <header className="sticky top-0 z-40 border-b" style={{ borderColor: C.b, background: `${C.void}d9`, backdropFilter: 'blur(10px)' }}>
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
<div className="flex items-center gap-2.5">
    <svg width="30" height="30" viewBox="0 0 96 96" fill="none" style={{ color: C.green }}>
        <g stroke="currentColor" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M26 70 L48 48 L70 70" opacity="0.35" />
            <path d="M26 52 L48 30 L70 52" opacity="0.7" />
            <path d="M38 30 L48 20 L58 30" />
        </g>
    </svg>
    <span className={`${F.head} text-[1rem] font-bold tracking-[1.5px]`}>
        TRACK<span style={{ color: C.green }}>FLOW</span>
    </span>
</div>
                    <nav className="flex items-center gap-2">
                        {auth?.user
                            ? <Link href={route('dashboard')} className={btn} style={{ borderColor: `${C.green}66`, color: C.green, background: C.greenTrace }}>لوحة التحكم</Link>
                            : <>
                                <Link href={route('login')} className={btn} style={{ borderColor: 'transparent', color: C.t2 }}>تسجيل الدخول</Link>
                                <Link href={route('register')} className={`${btn} hover:brightness-110`} style={{ borderColor: C.green, background: C.green, color: C.void }}>ابدأ مجانًا</Link>
                            </>}
                    </nav>
                </div>
            </header>

            {/* HERO */}
            <section className="relative mx-auto max-w-6xl px-6 pb-24 pt-20 text-center md:pt-28"
                style={{ background: `radial-gradient(900px 320px at 50% -80px, ${C.green}0d, transparent)` }}>
                <Reveal></Reveal>
                <Reveal delay={50} className="mb-8 flex justify-center">
    <div className="relative inline-flex items-center justify-center">
        {/* توهج خلفي */}
        <div className="absolute inset-0 blur-2xl opacity-30" 
            style={{ background: `radial-gradient(circle, ${C.green}, transparent 70%)` }} />
        <svg width="72" height="72" viewBox="0 0 96 96" fill="none" 
            className="relative"
            style={{ color: C.green, filter: `drop-shadow(0 0 20px ${C.green}55)` }}>
            <g stroke="currentColor" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M26 70 L48 48 L70 70" opacity="0.35" />
                <path d="M26 52 L48 30 L70 52" opacity="0.7" />
                <path d="M38 30 L48 20 L58 30" />
            </g>
        </svg>
    </div>
</Reveal>
                <Reveal delay={100}>
                    <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold leading-[1.3] md:text-5xl md:leading-[1.3]" style={{ color: C.t1 }}>
                        أموالك بوضوحٍ تام،<br /><span style={{ color: C.green }}>وقراراتك بثقةٍ كاملة</span>
                    </h1>
                </Reveal>
                <Reveal delay={200}>
                    <p className="mx-auto mt-5 max-w-xl text-[0.95rem] leading-8" style={{ color: C.t3 }}>
                        TrackFlow يجمع حساباتك ومداخيلك ومصاريفك في لوحة واحدة أنيقة، لتعرف دائمًا أين تقف وإلى أين تتجه.
                    </p>
                </Reveal>
                <Reveal delay={300} className="mt-8 flex justify-center gap-3">
                    <Link href={route('register')} className={`${btn} hover:brightness-110`} style={{ borderColor: C.green, background: C.green, color: C.void }}>أنشئ حسابك مجانًا</Link>
                    <Link href={route('login')} className={`${btn} hover:border-[color:var(--x)]`} style={{ borderColor: C.b, color: C.t2 }}>استعرض اللوحة</Link>
                </Reveal>

                {/* معاينة المنتج */}
                <Reveal delay={400} className="mx-auto mt-16 max-w-4xl">
                    <div className="border shadow-2xl" style={{ borderColor: C.bHot, background: C.card }}>
                        <div className="flex items-center justify-between border-b px-5 py-3" style={{ borderColor: C.b }}>
                            <span className="text-[0.8rem] font-semibold" style={{ color: C.t1 }}>نظرة عامة — هذا الشهر</span>
                            <span className={`${F.mono} text-[0.55rem] tracking-[2px] px-2 py-0.5 border`} style={{ borderColor: `${C.green}44`, color: C.green, background: C.greenTrace }}>مباشر</span>
                        </div>
                        <div className="grid gap-3 p-5 sm:grid-cols-3">
                            {[['إجمالي الدخل', '+2,450', C.green], ['إجمالي المصاريف', '-860', C.red], ['صافي الشهر', '+1,590', C.gold]].map(([l, v, c]) => (
                                <div key={l} className="border p-4 text-right" style={{ borderColor: C.b, background: C.card2 }}>
                                    <div className={`${F.mono} text-[0.55rem] tracking-[2px]`} style={{ color: C.t4 }}>{l}</div>
                                    <div className={`${F.head} mt-1.5 text-xl font-bold`} style={{ color: c }}>{v} <span className="text-[0.6rem] font-normal" style={{ color: C.t4 }}>MAD</span></div>
                                </div>
                            ))}
                        </div>
                        <div className="px-5 pb-5">
                            <div className="flex h-32 items-end gap-2 border p-4" style={{ borderColor: C.b, background: C.card2 }}>
                                {BARS.map(([a, b], i) => (
                                    <div key={i} className="flex h-full flex-1 items-end gap-[3px]">
                                        <div className="w-full rounded-t-[2px]" style={{ height: `${a}%`, background: C.green, opacity: 0.85 }} />
                                        <div className="w-full rounded-t-[2px]" style={{ height: `${b}%`, background: C.red, opacity: 0.5 }} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </Reveal>
            </section>

            {/* أرقام */}
            <section className="border-y" style={{ borderColor: C.b, background: C.card }}>
                <div className="mx-auto grid max-w-6xl grid-cols-2 md:grid-cols-4">
                    {[['365', 'يوم من التحليل'], ['4', 'منحنيات حيّة'], ['12', 'قالب فترة'], ['100%', 'خصوصية بياناتك']].map(([v, l], i) => (
                        <div key={l} className="p-7 text-center" style={{ borderInlineStart: i ? `1px solid ${C.b}` : 'none' }}>
                            <div className={`${F.head} text-2xl font-bold`} style={{ color: C.green }}>{v}</div>
                            <div className="mt-1 text-[0.75rem]" style={{ color: C.t3 }}>{l}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* الميزات */}
            <section className="mx-auto max-w-6xl px-6 py-24">
                <H2 over="// الميزات" title="كل ما تحتاجه، لا أكثر" sub="ست قدرات جوهرية صيغت بعناية لتغطي دورة مالك كاملة — من الدخل إلى القرار." />
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {FEATURES.map((f, i) => (
                        <Reveal key={f.t} delay={i * 80} className="group border p-6 transition-all duration-200 hover:-translate-y-0.5" >
                            <div className="mb-4 inline-flex border p-2.5 transition-colors" style={{ borderColor: C.b, background: C.card2 }}>
                                <Ico d={f.i} />
                            </div>
                            <h3 className="text-[0.95rem] font-bold" style={{ color: C.t1 }}>{f.t}</h3>
                            <p className="mt-2 text-[0.78rem] leading-6" style={{ color: C.t3 }}>{f.d}</p>
                        </Reveal>
                    ))}
                </div>
            </section>

            {/* الخطوات */}
            <section className="border-y py-24" style={{ borderColor: C.b, background: C.card }}>
                <div className="mx-auto max-w-6xl px-6">
                    <H2 over="// كيف يعمل" title="ثلاث خطوات تفصلك عن الوضوح" />
                    <div className="grid gap-3 md:grid-cols-3">
                        {STEPS.map((s, i) => (
                            <Reveal key={s.n} delay={i * 120} className="border p-7" style={{}}>
                                <div className={`${F.head} text-3xl font-bold`} style={{ color: `${C.green}4d` }}>{s.n}</div>
                                <h3 className="mt-4 text-[0.95rem] font-bold" style={{ color: C.t1 }}>{s.t}</h3>
                                <p className="mt-2 text-[0.78rem] leading-6" style={{ color: C.t3 }}>{s.d}</p>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* لماذا */}
            <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-24 lg:grid-cols-2">
                <Reveal>
                    <Over>// لماذا TrackFlow</Over>
                    <h2 className="text-2xl font-bold leading-snug md:text-3xl" style={{ color: C.t1 }}>صُمم ليمنحك سكينةَ من يعرف أرقامه</h2>
                    <ul className="mt-7 space-y-4">
                        {WHY.map(t => (
                            <li key={t} className="flex items-center gap-3 text-[0.85rem]" style={{ color: C.t2 }}>
                                <Ico d="M4 10l4 4 8-9" s={16} /> {t}
                            </li>
                        ))}
                    </ul>
                </Reveal>
                <Reveal delay={150} className="border p-6" style={{}}>
                    <div className="mb-5 flex items-center justify-between">
                        <span className="text-[0.85rem] font-semibold" style={{ color: C.t1 }}>توزيع الإنفاق</span>
                        <span className={`${F.mono} text-[0.55rem] tracking-[2px]`} style={{ color: C.t4 }}>هذا الشهر</span>
                    </div>
                    <div className="space-y-5">
                        {DIST.map(([l, p, c]) => (
                            <div key={l}>
                                <div className="mb-1.5 flex justify-between text-[0.72rem]">
                                    <span style={{ color: C.t2 }}>{l}</span>
                                    <span className={F.mono} style={{ color: c }}>{p}%</span>
                                </div>
                                <div className="h-1.5 overflow-hidden rounded-full" style={{ background: `${c}14` }}>
                                    <div className="h-full rounded-full" style={{ width: `${p}%`, background: c }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </Reveal>
            </section>

            {/* شهادات */}
            <section className="mx-auto max-w-6xl px-6 pb-24">
                <H2 over="// شهادات" title="قالوا عن TrackFlow" />
                <div className="grid gap-3 md:grid-cols-3">
                    {QUOTES.map((q, i) => (
                        <Reveal key={q.n} delay={i * 100} className="flex flex-col border p-6">
                            <p className="flex-1 text-[0.82rem] leading-7" style={{ color: C.t2 }}>“{q.q}”</p>
                            <div className="mt-5 border-t pt-4" style={{ borderColor: C.b }}>
                                <div className="text-[0.8rem] font-bold" style={{ color: C.t1 }}>{q.n}</div>
                                <div className={`${F.mono} mt-0.5 text-[0.58rem]`} style={{ color: C.t4 }}>{q.r}</div>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="mx-auto max-w-3xl px-6 pb-24">
                <Reveal className="border p-10 text-center md:p-14" style={{}}>
                    <div className="h-[2px] mx-auto mb-8 w-16" style={{ background: C.green }} />
                    <h2 className="text-2xl font-bold md:text-3xl" style={{ color: C.t1 }}>جاهزٌ لوضوحٍ ماليٍّ حقيقي؟</h2>
                    <p className="mx-auto mt-4 max-w-md text-[0.88rem] leading-7" style={{ color: C.t3 }}>
                        انضم مجانًا اليوم — أول لوحة لك على بعد دقيقة، وبدون بطاقة بنكية.
                    </p>
                    <div className="mt-8 flex justify-center gap-3">
                        <Link href={route('register')} className={`${btn} hover:brightness-110`} style={{ borderColor: C.green, background: C.green, color: C.void }}>ابدأ الآن</Link>
                        <Link href={route('login')} className={btn} style={{ borderColor: C.b, color: C.t2 }}>لديّ حساب</Link>
                    </div>
                    <div className={`${F.mono} mt-6 text-[0.58rem] tracking-[2px]`} style={{ color: C.t4 }}>مجاني · بدون بطاقة · إلغاء بأي وقت</div>
                </Reveal>
            </section>

            <footer className="border-t py-8" style={{ borderColor: C.b }}>
                <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 md:flex-row">
                    <span className="flex items-center gap-2">
    <svg width="22" height="22" viewBox="0 0 96 96" fill="none" style={{ color: C.green }}>
        <g stroke="currentColor" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M26 70 L48 48 L70 70" opacity="0.35" />
            <path d="M26 52 L48 30 L70 52" opacity="0.7" />
            <path d="M38 30 L48 20 L58 30" />
        </g>
    </svg>
    <span className={`${F.head} text-[0.8rem] font-bold tracking-[1.5px]`}>
        TRACK<span style={{ color: C.green }}>FLOW</span>
    </span>
</span>
                    <span className={`${F.mono} text-[0.58rem] tracking-[2px]`} style={{ color: C.t4 }}>© {new Date().getFullYear()} · صُنع بعناية من أجل وضوحك المالي</span>
                </div>
            </footer>
        </div>
    );
}