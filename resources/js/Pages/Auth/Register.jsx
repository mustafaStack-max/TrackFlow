import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { COLORS as C, FONT as F } from '@/Components/Dashboard/theme';

/* ── أيقونات ── */
const IcoUser = (p) => (<svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><circle cx="10" cy="7" r="3.5" /><path d="M3.5 17c.8-3.2 3.4-5 6.5-5s5.7 1.8 6.5 5" strokeLinecap="round" /></svg>);
const IcoMail = (p) => (<svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><rect x="2" y="4" width="16" height="12" rx="1.5" /><path d="M2 6l8 5 8-5" strokeLinejoin="round" /></svg>);
const IcoLock = (p) => (<svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><rect x="4" y="8" width="12" height="9" rx="1.5" /><path d="M7 8V6a3 3 0 0 1 6 0v2" strokeLinecap="round" /></svg>);
const IcoEye = (p) => (<svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><path d="M2 10s3-5.5 8-5.5S18 10 18 10s-3 5.5-8 5.5S2 10 2 10z" strokeLinejoin="round" /><circle cx="10" cy="10" r="2.2" /></svg>);
const IcoEyeOff = (p) => (<svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><path d="M4 4l12 12M9.5 5.6c.2 0 .4-.1.5-.1 5 0 8 4.5 8 4.5a15.4 15.4 0 0 1-2.3 2.7M6.2 6.8A13.6 13.6 0 0 0 2 10s3 4.5 8 4.5c1 0 2-.2 2.9-.5" strokeLinecap="round" /><path d="M8.8 8.9a2.2 2.2 0 0 0 3 3" strokeLinecap="round" /></svg>);
const IcoPlus = (p) => (<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}><path d="M10 4v12M4 10h12" strokeLinecap="round" /></svg>);

function Field({ label, icon, error, children }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className={`${F.mono} text-[0.6rem] tracking-[2px]`} style={{ color: C.t4 }}>{label}</label>
            <div className="relative">{children}</div>
            {error && <span className={`${F.mono} text-[0.62rem]`} style={{ color: C.red }}>{error}</span>}
        </div>
    );
}

const inputStyle = (hasError) => ({ background: C.card2, borderColor: hasError ? C.red : C.b, color: C.t1 });
const inputFocus = (e) => { e.currentTarget.style.borderColor = C.green; e.currentTarget.style.boxShadow = `0 0 0 1px ${C.green}44`; };
const inputBlur = (e, hasError) => { e.currentTarget.style.borderColor = hasError ? C.red : C.b; e.currentTarget.style.boxShadow = 'none'; };

export default function Register() {
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        username: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), { onFinish: () => reset('password', 'password_confirmation') });
    };

    /* قوة كلمة المرور */
    const strength = [/.{8,}/, /[A-Zأ-ي]/, /\d/, /[^\W_]/].filter((r) => r.test(data.password)).length;
    const sColor = strength <= 1 ? C.red : strength <= 2 ? C.amber : C.green;
    const sLabel = strength <= 1 ? 'ضعيفة' : strength <= 2 ? 'متوسطة' : 'قوية';

    return (
        <GuestLayout>
            <Head title="إنشاء حساب" />

            {/* ترويسة */}
            <div className="mb-6">
                <div className={`${F.head} text-[1.15rem] font-bold tracking-[2px]`} style={{ color: C.t1 }}>
                    إنشاء <span style={{ color: C.green }}>حساب</span>
                </div>
                <div className={`${F.mono} text-[0.58rem] tracking-[2.5px] mt-1`} style={{ color: C.t4 }}>
                    // START YOUR FINANCIAL JOURNEY
                </div>
            </div>

            <form onSubmit={submit} className="flex flex-col gap-4">
                {/* اسم المستخدم */}
                <Field label="// اسم المستخدم" icon={<IcoUser />} error={errors.username}>
                    <input type="text" value={data.username} onChange={(e) => setData('username', e.target.value)}
                        placeholder="مثال: youssef" autoFocus required
                        className={`${F.ar} w-full border py-2.5 pr-10 pl-3 text-[0.8rem] outline-none transition-all`}
                        style={inputStyle(errors.username)} onFocus={inputFocus} onBlur={(e) => inputBlur(e, errors.username)} />
                    <span className="absolute top-1/2 -translate-y-1/2 right-3 pointer-events-none" style={{ color: C.t4 }}><IcoUser /></span>
                </Field>

                {/* البريد الإلكتروني */}
                <Field label="// البريد الإلكتروني" icon={<IcoMail />} error={errors.email}>
                    <input type="email" dir="ltr" value={data.email} onChange={(e) => setData('email', e.target.value)}
                        placeholder="you@trackflow.ma" required autoComplete="username"
                        className={`${F.mono} w-full border py-2.5 pr-10 pl-3 text-left text-[0.8rem] outline-none transition-all`}
                        style={inputStyle(errors.email)} onFocus={inputFocus} onBlur={(e) => inputBlur(e, errors.email)} />
                    <span className="absolute top-1/2 -translate-y-1/2 right-3 pointer-events-none" style={{ color: C.t4 }}><IcoMail /></span>
                </Field>

                {/* كلمة المرور */}
                <Field label="// كلمة المرور" icon={<IcoLock />} error={errors.password}>
                    <input type={showPass ? 'text' : 'password'} dir="ltr" value={data.password}
                        onChange={(e) => setData('password', e.target.value)} placeholder="••••••••" required autoComplete="new-password"
                        className={`${F.mono} w-full border py-2.5 pr-10 pl-10 text-left text-[0.8rem] outline-none transition-all`}
                        style={inputStyle(errors.password)} onFocus={inputFocus} onBlur={(e) => inputBlur(e, errors.password)} />
                    <span className="absolute top-1/2 -translate-y-1/2 right-3 pointer-events-none" style={{ color: C.t4 }}><IcoLock /></span>
                    <button type="button" onClick={() => setShowPass(v => !v)} aria-label="إظهار كلمة المرور"
                        className="absolute top-1/2 -translate-y-1/2 left-3 transition-colors" style={{ color: showPass ? C.green : C.t4 }}>
                        {showPass ? <IcoEyeOff /> : <IcoEye />}
                    </button>
                    {/* مؤشر القوة */}
                    {data.password && (
                        <div className="absolute top-full mt-1.5 inset-x-0 flex items-center gap-1.5">
                            {[0, 1, 2, 3].map(i => (
                                <span key={i} className="h-[3px] flex-1 rounded-full transition-colors" style={{ background: i < strength ? sColor : C.b }} />
                            ))}
                            <span className={`${F.ar} text-[0.58rem] shrink-0`} style={{ color: sColor }}>{sLabel}</span>
                        </div>
                    )}
                </Field>

                {/* تأكيد كلمة المرور */}
                <Field label="// تأكيد كلمة المرور" icon={<IcoLock />} error={errors.password_confirmation}>
                    <input type={showConfirm ? 'text' : 'password'} dir="ltr" value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)} placeholder="••••••••" required autoComplete="new-password"
                        className={`${F.mono} w-full border py-2.5 pr-10 pl-10 text-left text-[0.8rem] outline-none transition-all`}
                        style={{
                            ...inputStyle(errors.password_confirmation),
                            ...(data.password_confirmation && data.password_confirmation === data.password ? { borderColor: C.green } : {}),
                        }}
                        onFocus={inputFocus} onBlur={(e) => inputBlur(e, errors.password_confirmation)} />
                    <span className="absolute top-1/2 -translate-y-1/2 right-3 pointer-events-none" style={{ color: C.t4 }}><IcoLock /></span>
                    <button type="button" onClick={() => setShowConfirm(v => !v)} aria-label="إظهار التأكيد"
                        className="absolute top-1/2 -translate-y-1/2 left-3 transition-colors" style={{ color: showConfirm ? C.green : C.t4 }}>
                        {showConfirm ? <IcoEyeOff /> : <IcoEye />}
                    </button>
                    {data.password_confirmation && data.password_confirmation === data.password && (
                        <span className={`${F.ar} absolute top-full mt-1 text-[0.58rem]`} style={{ color: C.green }}>✓ كلمتا المرور متطابقتان</span>
                    )}
                </Field>

                {/* زر التسجيل */}
                <button type="submit" disabled={processing}
                    className={`${F.head} mt-2 flex w-full items-center justify-center gap-2 border py-3 text-[0.88rem] font-bold tracking-[3px] uppercase transition-all hover:brightness-125 disabled:opacity-40`}
                    style={{ borderColor: `${C.green}88`, color: C.green, background: C.greenTrace }}>
                    <IcoPlus />
                    {processing ? '// جاري الإنشاء...' : '// إنشاء الحساب //'}
                </button>

                {/* رابط الدخول */}
                <div className={`${F.ar} text-center text-[0.72rem]`} style={{ color: C.t4 }}>
                    لديك حساب بالفعل؟{' '}
                    <Link href={route('login')} className="font-bold transition-colors" style={{ color: C.cyan }}>
                        تسجيل الدخول
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}