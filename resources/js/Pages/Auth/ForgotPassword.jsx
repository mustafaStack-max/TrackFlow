import { Head, Link, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { COLORS as C, FONT as F } from '@/Components/Dashboard/theme';

/* ── أيقونات ── */
const IcoMail = (p) => (<svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><rect x="2" y="4" width="16" height="12" rx="1.5" /><path d="M2 6l8 5 8-5" strokeLinejoin="round" /></svg>);
const IcoSend = (p) => (<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><path d="M18 2L9 11M18 2l-6 16-3-7-7-3 16-6z" strokeLinecap="round" strokeLinejoin="round" /></svg>);
const IcoKey = (p) => (<svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><circle cx="7" cy="10" r="4" /><path d="M11 10h7M15 10v3M18 10v2" strokeLinecap="round" /></svg>);

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({ email: '' });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="استعادة كلمة المرور" />

            {/* أيقونة + ترويسة */}
            <div className="mb-6 text-center">
                <div className="mx-auto mb-4 inline-flex border p-3" style={{ borderColor: `${C.green}55`, background: C.greenTrace, color: C.green }}>
                    <IcoKey />
                </div>
                <div className={`${F.head} text-[1.15rem] font-bold tracking-[2px]`} style={{ color: C.t1 }}>
                    استعادة <span style={{ color: C.green }}>كلمة المرور</span>
                </div>
                <div className={`${F.mono} text-[0.58rem] tracking-[2.5px] mt-1`} style={{ color: C.t4 }}>
                    // PASSWORD RECOVERY
                </div>
            </div>

            {/* الوصف */}
            <p className={`${F.ar} mb-5 border p-3 text-[0.75rem] leading-6`} style={{ borderColor: C.b, color: C.t3, background: C.card2 }}>
                نسيت كلمة المرور؟ لا مشكلة. أدخل بريدك الإلكتروني وسنرسل لك رابطًا آمنًا يتيح لك اختيار كلمة جديدة.
            </p>

            {/* رسالة النجاح */}
            {status && (
                <div className={`${F.ar} mb-4 border p-2.5 text-[0.72rem]`} style={{ borderColor: `${C.green}55`, color: C.green, background: C.greenTrace }}>
                    ✓ {status}
                </div>
            )}

            <form onSubmit={submit} className="flex flex-col gap-4">
                {/* البريد الإلكتروني */}
                <div className="flex flex-col gap-1.5">
                    <label className={`${F.mono} text-[0.6rem] tracking-[2px]`} style={{ color: C.t4 }}>
                        // البريد الإلكتروني
                    </label>
                    <div className="relative">
                        <input type="email" dir="ltr" value={data.email} onChange={(e) => setData('email', e.target.value)}
                            placeholder="you@trackflow.ma" autoFocus required
                            className={`${F.mono} w-full border py-2.5 pr-10 pl-3 text-left text-[0.8rem] outline-none transition-all`}
                            style={{ background: C.card2, borderColor: errors.email ? C.red : C.b, color: C.t1 }}
                            onFocus={(e) => { e.currentTarget.style.borderColor = C.green; e.currentTarget.style.boxShadow = `0 0 0 1px ${C.green}44`; }}
                            onBlur={(e) => { e.currentTarget.style.borderColor = errors.email ? C.red : C.b; e.currentTarget.style.boxShadow = 'none'; }} />
                        <span className="absolute top-1/2 -translate-y-1/2 right-3 pointer-events-none" style={{ color: C.t4 }}>
                            <IcoMail />
                        </span>
                    </div>
                    {errors.email && <span className={`${F.mono} text-[0.62rem]`} style={{ color: C.red }}>{errors.email}</span>}
                </div>

                {/* زر الإرسال */}
                <button type="submit" disabled={processing}
                    className={`${F.head} flex w-full items-center justify-center gap-2 border py-3 text-[0.85rem] font-bold tracking-[3px] uppercase transition-all hover:brightness-125 disabled:opacity-40`}
                    style={{ borderColor: `${C.green}88`, color: C.green, background: C.greenTrace }}>
                    <IcoSend />
                    {processing ? '// جاري الإرسال...' : '// إرسال رابط الاستعادة //'}
                </button>

                {/* العودة للدخول */}
                <div className={`${F.ar} text-center text-[0.72rem]`} style={{ color: C.t4 }}>
                    تذكرت كلمة المرور؟{' '}
                    <Link href={route('login')} className="font-bold transition-colors" style={{ color: C.cyan }}>
                        تسجيل الدخول
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}