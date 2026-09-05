import { useRef } from 'react';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { COLORS as C, FONT as F } from '@/Components/Dashboard/theme';

const IcoLock = (p) => (<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><rect x="4" y="9" width="12" height="8" rx="1.5" /><path d="M7 9V6a3 3 0 0 1 6 0v3" strokeLinecap="round" /></svg>);
const IcoShield = (p) => (<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path d="M10 2l6 2v5c0 4-2.8 7-6 8.5C6.8 16 4 13 4 9V4l6-2z" strokeLinejoin="round" /><path d="M7 10l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" /></svg>);
const IcoCheck = (p) => (<svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" {...p}><path d="M4 10l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" /></svg>);
const IcoSave = (p) => (<svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path d="M5 2h8l4 4v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" strokeLinejoin="round" /><path d="M7 2v5h5V2M7 13h6" strokeLinecap="round" /></svg>);

const inputCls = `${F.ar} w-full border px-3 py-2.5 text-[0.85rem] outline-none transition-colors focus:border-[rgba(0,230,118,0.5)]`;

export default function UpdatePasswordForm({ className = '' }) {
    const passwordInput = useRef();
    const { data, setData, put, errors, processing, recentlySuccessful, reset } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (err) => {
                if (err.password) passwordInput.current?.focus();
            },
        });
    };

    return (
        <section className={className}>
            <div className="border overflow-hidden" style={{ background: C.card, borderColor: C.b }}>
                {/* HEAD */}
                <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: C.b, background: C.card2 }}>
                    <span className="flex h-9 w-9 items-center justify-center rounded-md border"
                        style={{ borderColor: `${C.amber}55`, color: C.amber, background: `${C.amber}10` }}>
                        <IcoShield />
                    </span>
                    <div className="flex-1 min-w-0">
                        <div className={`${F.head} text-[0.95rem] font-bold tracking-[2px] uppercase`} style={{ color: C.t1 }}>
                            تحديث كلمة السر
                        </div>
                        <div className={`${F.ar} text-[0.72rem] mt-0.5`} style={{ color: C.t3 }}>
                            تأكد أن كلمة السر الجديدة طويلة وآمنة (8 أحرف على الأقل).
                        </div>
                    </div>
                    <span className={`${F.mono} text-[0.55rem] tracking-[1.5px] px-2 py-0.5 border`}
                        style={{ borderColor: C.b, color: C.t3, background: `${C.amber}10` }}>
                        SECURITY
                    </span>
                </div>

                <form onSubmit={submit} className="p-5 flex flex-col gap-5">
                    {/* CURRENT */}
                    <div>
                        <label htmlFor="current_password" className={`${F.mono} text-[0.65rem] tracking-[2px] uppercase block mb-1.5 flex items-center gap-1.5`} style={{ color: C.t3 }}>
                            <span style={{ color: C.t4 }}><IcoLock /></span>
                            // كلمة السر الحالية
                        </label>
                        <input
                            id="current_password"
                            type="password"
                            className={inputCls}
                            style={{ background: C.card2, borderColor: errors.current_password ? C.red : C.b, color: C.t1 }}
                            value={data.current_password}
                            onChange={(e) => setData('current_password', e.target.value)}
                            autoComplete="current-password"
                        />
                        {errors.current_password && <div className={`${F.mono} text-[0.68rem] mt-1.5`} style={{ color: C.red }}>⚠ {errors.current_password}</div>}
                    </div>

                    {/* NEW */}
                    <div>
                        <label htmlFor="password" className={`${F.mono} text-[0.65rem] tracking-[2px] uppercase block mb-1.5 flex items-center gap-1.5`} style={{ color: C.t3 }}>
                            <span style={{ color: C.green }}><IcoLock /></span>
                            // كلمة السر الجديدة
                        </label>
                        <input
                            id="password"
                            type="password"
                            ref={passwordInput}
                            className={inputCls}
                            style={{ background: C.card2, borderColor: errors.password ? C.red : C.b, color: C.t1 }}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            autoComplete="new-password"
                        />
                        {errors.password && <div className={`${F.mono} text-[0.68rem] mt-1.5`} style={{ color: C.red }}>⚠ {errors.password}</div>}
                    </div>

                    {/* CONFIRM */}
                    <div>
                        <label htmlFor="password_confirmation" className={`${F.mono} text-[0.65rem] tracking-[2px] uppercase block mb-1.5 flex items-center gap-1.5`} style={{ color: C.t3 }}>
                            <span style={{ color: C.cyan }}><IcoLock /></span>
                            // تأكيد كلمة السر
                        </label>
                        <input
                            id="password_confirmation"
                            type="password"
                            className={inputCls}
                            style={{ background: C.card2, borderColor: errors.password_confirmation ? C.red : C.b, color: C.t1 }}
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            autoComplete="new-password"
                        />
                        {errors.password_confirmation && <div className={`${F.mono} text-[0.68rem] mt-1.5`} style={{ color: C.red }}>⚠ {errors.password_confirmation}</div>}
                    </div>

                    <div className="flex items-center gap-4 pt-2 border-t" style={{ borderColor: C.b }}>
                        <button
                            type="submit"
                            disabled={processing}
                            className={`${F.head} flex items-center gap-2 border px-5 py-2.5 text-[0.8rem] font-bold tracking-[2px] uppercase transition-colors disabled:opacity-40 disabled:cursor-not-allowed`}
                            style={{ borderColor: C.green, color: C.green, background: C.greenTrace }}
                            onMouseEnter={(e) => { if (!processing) { e.currentTarget.style.background = C.green; e.currentTarget.style.color = C.void; } }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = C.greenTrace; e.currentTarget.style.color = C.green; }}>
                            <IcoSave /> تحديث كلمة السر
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
                                <IcoCheck /> PASSWORD UPDATED
                            </div>
                        </Transition>
                    </div>
                </form>
            </div>
        </section>
    );
}