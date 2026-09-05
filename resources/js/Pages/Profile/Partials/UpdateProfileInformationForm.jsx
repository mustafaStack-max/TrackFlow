import { useEffect, useRef, useState } from 'react';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { COLORS as C, FONT as F } from '@/Components/Dashboard/theme';

const IcoUser = (p) => (<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><circle cx="10" cy="7" r="3.5" /><path d="M3.5 17c.8-3.2 3.4-5 6.5-5s5.7 1.8 6.5 5" strokeLinecap="round" /></svg>);
const IcoMail = (p) => (<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><rect x="3" y="4" width="14" height="12" rx="1.5" /><path d="M3 7l7 5 7-5" strokeLinejoin="round" /></svg>);
const IcoCheck = (p) => (<svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" {...p}><path d="M4 10l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" /></svg>);
const IcoSave = (p) => (<svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path d="M5 2h8l4 4v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" strokeLinejoin="round" /><path d="M7 2v5h5V2M7 13h6" strokeLinecap="round" /></svg>);
const IcoSpark = (p) => (<svg width="11" height="11" viewBox="0 0 20 20" fill="currentColor" {...p}><path d="M10 1l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" /></svg>);
const IcoCamera = (p) => (<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path d="M3 7h3l2-2h4l2 2h3v10H3V7z" strokeLinejoin="round" /><circle cx="10" cy="11.5" r="2.5" /></svg>);
const IcoRole = (p) => (<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path d="M10 2l6 3v5c0 4-2.8 7-6 8.5C6.8 17 4 14 4 10V5l6-3z" strokeLinejoin="round" /><path d="M8 10l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" /></svg>);

const inputCls = `${F.ar} w-full border px-3 py-2.5 text-[0.85rem] outline-none transition-colors focus:border-[rgba(0,230,118,0.5)]`;

export default function UpdateProfileInformation({ mustVerifyEmail, status, className = '' }) {
    const user = usePage().props.auth.user;
    const fileRef = useRef(null);
    const [preview, setPreview] = useState(null);

const { data, setData, post, errors, processing, recentlySuccessful } = useForm({
    username: user.username,
    email: user.email,
    avatar: null,
    _method: 'PATCH',   
});

    /* تنظيف الـ object URL عند التغيير */
    useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

    const onFile = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setData('avatar', file);
        setPreview(URL.createObjectURL(file));
    };

const submit = (e) => {
    e.preventDefault();

    post(route('profile.update'), {
        forceFormData: true,
        preserveScroll: true,
        onSuccess: () => {
            setData('avatar', null);
            setPreview(null);
            if (fileRef.current) fileRef.current.value = '';
        },
    });
};
    const avatarSrc = preview || user.avatar_url || null;
    const displayName = user?.username ?? 'حسابي';
    const initials = String(displayName).trim().split(/\s+/).slice(0, 2).map((n) => n[0]).join('').toUpperCase() || 'U';
    const isAdmin = (user?.role ?? 'user') === 'admin';

    return (
        <section className={className}>
            <div className="border overflow-hidden" style={{ background: C.card, borderColor: C.b }}>
                {/* HEAD */}
                <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: C.b, background: C.card2 }}>
                    <span className="flex h-9 w-9 items-center justify-center rounded-md border"
                        style={{ borderColor: `${C.green}44`, color: C.green, background: C.greenTrace }}>
                        <IcoUser />
                    </span>
                    <div className="flex-1 min-w-0">
                        <div className={`${F.head} text-[0.95rem] font-bold tracking-[2px] uppercase flex items-center gap-2`} style={{ color: C.t1 }}>
                            الملف الشخصي
                        </div>
                        <div className={`${F.ar} text-[0.72rem] mt-0.5`} style={{ color: C.t3 }}>
                            حدّث معلومات الحساب والبريد الإلكتروني ديالك.
                        </div>
                    </div>
                    <span className={`${F.mono} text-[0.55rem] tracking-[1.5px] px-2 py-0.5 border`}
                        style={{ borderColor: C.b, color: C.t3, background: C.greenTrace }}>
                        PROFILE
                    </span>
                </div>

                {/* FORM */}
                <form onSubmit={submit} className="p-5 flex flex-col gap-5">

                    {/* ★★ قسم الصورة الشخصية + الدور ★★ */}
                    <div className="flex items-center gap-4 flex-wrap">
                        <div className="relative">
                            {avatarSrc ? (
                                <img src={avatarSrc} alt="الصورة الشخصية"
                                    className="h-16 w-16 rounded-full object-cover border-2"
                                    style={{ borderColor: C.bHot }} />
                            ) : (
                                <span className="flex h-16 w-16 items-center justify-center rounded-full border-2"
                                    style={{ borderColor: `${C.green}55`, background: C.greenTrace, color: C.green }}>
                                    <span className={`${F.mono} text-[1.1rem] font-bold`}>{initials}</span>
                                </span>
                            )}
                            <button type="button" onClick={() => fileRef.current?.click()} title="تغيير الصورة"
                                className="absolute -bottom-1 -left-1 flex h-7 w-7 items-center justify-center rounded-full border transition-colors hover:brightness-125"
                                style={{ background: C.card2, borderColor: `${C.green}55`, color: C.green }}>
                                <IcoCamera />
                            </button>
                            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
                        </div>

                        <div className="flex-1 min-w-[180px]">
                            <div className={`${F.ar} text-[0.8rem] font-bold`} style={{ color: C.t1 }}>الصورة الشخصية</div>
                            <div className={`${F.ar} text-[0.68rem] mt-0.5`} style={{ color: C.t3 }}>
                                JPG / PNG / WEBP — بحد أقصى 3MB
                            </div>
                            {preview && (
                                <div className={`${F.mono} text-[0.6rem] mt-1`} style={{ color: C.gold }}>
                                    ⚠ صورة جديدة غير محفوظة — اضغط حفظ التغييرات
                                </div>
                            )}
                            {errors.avatar && (
                                <div className={`${F.mono} text-[0.68rem] mt-1`} style={{ color: C.red }}>⚠ {errors.avatar}</div>
                            )}
                        </div>


                    </div>

                    <div className="border-t" style={{ borderColor: C.b }} />

                    {/* USERNAME */}
                    <div>
                        <label htmlFor="username" className={`${F.mono} text-[0.65rem] tracking-[2px] uppercase block mb-1.5 flex items-center gap-1.5`} style={{ color: C.t3 }}>
                            <span style={{ color: C.green }}><IcoUser /></span>
                            // اسم المستخدم
                        </label>
                        <input
                            id="username"
                            type="text"
                            className={inputCls}
                            style={{ background: C.card2, borderColor: errors.username ? C.red : C.b, color: C.t1 }}
                            value={data.username}
                            onChange={(e) => setData('username', e.target.value)}
                            required
                            autoComplete="username"
                            placeholder="مثال: mohammed_alamine"
                        />
                        {errors.username && <div className={`${F.mono} text-[0.68rem] mt-1.5`} style={{ color: C.red }}>⚠ {errors.username}</div>}
                    </div>

                    {/* EMAIL */}
                    <div>
                        <label htmlFor="email" className={`${F.mono} text-[0.65rem] tracking-[2px] uppercase block mb-1.5 flex items-center gap-1.5`} style={{ color: C.t3 }}>
                            <span style={{ color: C.cyan }}><IcoMail /></span>
                            // البريد الإلكتروني
                        </label>
                        <input
                            id="email"
                            type="email"
                            dir="ltr"
                            className={`${inputCls} text-left`}
                            style={{ background: C.card2, borderColor: errors.email ? C.red : C.b, color: C.t1, fontFamily: 'Share Tech Mono' }}
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            autoComplete="email"
                            placeholder="you@example.com"
                        />
                        {errors.email && <div className={`${F.mono} text-[0.68rem] mt-1.5`} style={{ color: C.red }}>⚠ {errors.email}</div>}
                    </div>

                    {/* VERIFY */}
                    {mustVerifyEmail && user.email_verified_at === null && (
                        <div className="border px-4 py-3" style={{ borderColor: `${C.gold}55`, background: `${C.gold}0a` }}>
                            <div className={`${F.ar} text-[0.78rem] leading-6`} style={{ color: C.t2 }}>
                                البريد الإلكتروني غير موثّق بعد.{' '}
                                <Link
                                    href={route('verification.send')}
                                    method="post"
                                    as="button"
                                    className={`${F.ar} font-bold underline underline-offset-2 transition-colors hover:brightness-125`}
                                    style={{ color: C.gold }}>
                                    أعد إرسال رابط التأكيد
                                </Link>
                            </div>
                            {status === 'verification-link-sent' && (
                                <div className={`${F.ar} text-[0.72rem] mt-2 flex items-center gap-1.5`} style={{ color: C.green }}>
                                    <IcoSpark /> تم إرسال رابط تأكيد جديد إلى بريدك.
                                </div>
                            )}
                        </div>
                    )}

                    {/* ACTIONS */}
                    <div className="flex items-center gap-4 pt-2 border-t" style={{ borderColor: C.b }}>
                        <button
                            type="submit"
                            disabled={processing}
                            className={`${F.head} flex items-center gap-2 border px-5 py-2.5 text-[0.8rem] font-bold tracking-[2px] uppercase transition-colors disabled:opacity-40 disabled:cursor-not-allowed`}
                            style={{ borderColor: C.green, color: C.green, background: C.greenTrace }}
                            onMouseEnter={(e) => { if (!processing) { e.currentTarget.style.background = C.green; e.currentTarget.style.color = C.void; } }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = C.greenTrace; e.currentTarget.style.color = C.green; }}>
                            <IcoSave /> حفظ التغييرات
                        </button>

                        <Transition
                            show={recentlySuccessful}
                            enter="transition ease-out duration-300"
                            enterFrom="opacity-0 translate-y-0.5"
                            enterTo="opacity-100 translate-y-0"
                            leave="transition ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className={`${F.mono} flex items-center gap-1.5 text-[0.72rem]`} style={{ color: C.green }}>
                                <IcoCheck /> SAVED · تم الحفظ بنجاح
                            </div>
                        </Transition>
                    </div>
                </form>
            </div>
        </section>
    );
}