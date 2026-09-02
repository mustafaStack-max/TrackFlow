// resources/js/Pages/Auth/Login.jsx
import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { COLORS as C, FONT as F } from '@/Components/Dashboard/theme';

/* ── أيقونات ── */
const IcoMail = (p) => (<svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><rect x="2" y="4" width="16" height="12" rx="1.5" /><path d="M2 6l8 5 8-5" strokeLinejoin="round" /></svg>);
const IcoLock = (p) => (<svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><rect x="4" y="8" width="12" height="9" rx="1.5" /><path d="M7 8V6a3 3 0 0 1 6 0v2" strokeLinecap="round" /></svg>);
const IcoEye = (p) => (<svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><path d="M2 10s3-5.5 8-5.5S18 10 18 10s-3 5.5-8 5.5S2 10 2 10z" strokeLinejoin="round" /><circle cx="10" cy="10" r="2.2" /></svg>);
const IcoEyeOff = (p) => (<svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><path d="M4 4l12 12M9.5 5.6c.2 0 .4-.1.5-.1 5 0 8 4.5 8 4.5a15.4 15.4 0 0 1-2.3 2.7M6.2 6.8A13.6 13.6 0 0 0 2 10s3 4.5 8 4.5c1 0 2-.2 2.9-.5" strokeLinecap="round" /><path d="M8.8 8.9a2.2 2.2 0 0 0 3 3" strokeLinecap="round" /></svg>);
const IcoEnter = (p) => (<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}><path d="M12 3H4v14h8M8 10h9M14 6.5L17.5 10 14 13.5" strokeLinecap="round" strokeLinejoin="round" /></svg>);

function Field({ label, icon, error, children }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className={`${F.mono} text-[0.6rem] tracking-[2px]`} style={{ color: C.t4 }}>
                {label}
            </label>
            <div className="relative">
                <span className="absolute top-1/2 -translate-y-1/2 right-3 pointer-events-none" style={{ color: C.t4 }}>
                    {icon}
                </span>
                {children}
            </div>
            {error && <span className={`${F.mono} text-[0.62rem]`} style={{ color: C.red }}>{error}</span>}
        </div>
    );
}

const inputStyle = (hasError) => ({
    background: C.card2,
    borderColor: hasError ? C.red : C.b,
    color: C.t1,
});

const inputFocus = (e) => { e.currentTarget.style.borderColor = C.green; e.currentTarget.style.boxShadow = `0 0 0 1px ${C.green}44`; };
const inputBlur = (e, hasError) => { e.currentTarget.style.borderColor = hasError ? C.red : C.b; e.currentTarget.style.boxShadow = 'none'; };

export default function Login({ status, canResetPassword }) {
    const [showPass, setShowPass] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), { onFinish: () => reset('password') });
    };

    return (
        <GuestLayout>
            <Head title="تسجيل الدخول" />

            {/* ترويسة النموذج */}
            <div className="mb-6">
                <div className={`${F.head} text-[1.15rem] font-bold tracking-[2px]`} style={{ color: C.t1 }}>
                    تسجيل <span style={{ color: C.green }}>الدخول</span>
                </div>
                <div className={`${F.mono} text-[0.58rem] tracking-[2.5px] mt-1`} style={{ color: C.t4 }}>
                    // ACCESS YOUR FINANCIAL TERMINAL
                </div>
            </div>

            {status && (
                <div className={`${F.ar} mb-4 border p-2.5 text-[0.72rem]`}
                    style={{ borderColor: `${C.green}55`, color: C.green, background: C.greenTrace }}>
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="flex flex-col gap-4">
                {/* البريد الإلكتروني */}
                <Field label="// البريد الإلكتروني" icon={<IcoMail />} error={errors.email}>
                    <input
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="you@trackflow.ma"
                        autoFocus
                        dir="ltr"
                        className={`${F.mono} w-full border py-2.5 pr-10 pl-3 text-[0.8rem] text-left outline-none transition-all`}
                        style={inputStyle(errors.email)}
                        onFocus={inputFocus}
                        onBlur={(e) => inputBlur(e, errors.email)}
                    />
                </Field>

                {/* كلمة المرور */}
                <Field label="// كلمة المرور" icon={<IcoLock />} error={errors.password}>
                    <input
                        type={showPass ? 'text' : 'password'}
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder="••••••••"
                        dir="ltr"
                        className={`${F.mono} w-full border py-2.5 pr-10 pl-10 text-[0.8rem] text-left outline-none transition-all`}
                        style={inputStyle(errors.password)}
                        onFocus={inputFocus}
                        onBlur={(e) => inputBlur(e, errors.password)}
                    />
                    <button type="button" onClick={() => setShowPass(v => !v)}
                        aria-label={showPass ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                        className="absolute top-1/2 -translate-y-1/2 left-3 transition-colors"
                        style={{ color: showPass ? C.green : C.t4 }}>
                        {showPass ? <IcoEyeOff /> : <IcoEye />}
                    </button>
                </Field>

                {/* تذكرني + نسيت كلمة المرور */}
                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer select-none" onClick={() => setData('remember', !data.remember)}>
                        <span className="relative inline-block w-9 h-[18px] border transition-colors"
                            style={{ borderColor: data.remember ? C.green : C.b, background: data.remember ? C.greenTrace : C.card2 }}>
                            <span className="absolute top-[2px] w-3 h-3 transition-all"
                                style={{ background: data.remember ? C.green : C.t4, insetInlineStart: data.remember ? 'calc(100% - 14px)' : '2px' }} />
                        </span>
                        <span className={`${F.ar} text-[0.72rem]`} style={{ color: C.t2 }}>تذكرني</span>
                    </label>

                    {canResetPassword && (
                        <Link href={route('password.request')}
                            className={`${F.ar} text-[0.7rem] transition-colors`}
                            style={{ color: C.cyan }}>
                            نسيت كلمة المرور؟
                        </Link>
                    )}
                </div>

                {/* زر الدخول */}
                <button type="submit" disabled={processing}
                    className={`${F.head} mt-1 flex w-full items-center justify-center gap-2 border py-3 text-[0.88rem] font-bold tracking-[3px] uppercase transition-all hover:brightness-125 disabled:opacity-40`}
                    style={{ borderColor: `${C.green}88`, color: C.green, background: C.greenTrace }}>
                    <IcoEnter />
                    {processing ? '// جاري التحقق...' : '// تسجيل الدخول //'}
                </button>

                {/* رابط التسجيل */}
                {route().has('register') && (
                    <div className={`${F.ar} text-center text-[0.72rem]`} style={{ color: C.t4 }}>
                        ليس لديك حساب؟{' '}
                        <Link href={route('register')} className="font-bold transition-colors" style={{ color: C.green }}>
                            أنشئ حسابًا جديدًا
                        </Link>
                    </div>
                )}
            </form>
        </GuestLayout>
    );
}