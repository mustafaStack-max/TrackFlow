import { useRef, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { COLORS as C, FONT as F } from '@/Components/Dashboard/theme';

const IcoTrash = (p) => (<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><polyline points="4,6 16,6" strokeLinecap="round" /><path d="M8 6V4h4v2" strokeWidth="1.3" strokeLinecap="round" /><path d="M5 6l1 11h8l1-11" strokeLinecap="round" strokeLinejoin="round" /></svg>);
const IcoAlert = (p) => (<svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path d="M10 2l8.5 15H1.5L10 2z" strokeLinejoin="round" /><path d="M10 8v4" strokeLinecap="round" /><circle cx="10" cy="14.5" r=".8" fill="currentColor" stroke="none" /></svg>);
const IcoX = (p) => (<svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" /></svg>);
const IcoDanger = (p) => (<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><circle cx="10" cy="10" r="7" /><path d="M10 7v4M10 13.5v.5" strokeLinecap="round" /></svg>);

const inputCls = `${F.ar} w-full border px-3 py-2.5 text-[0.85rem] outline-none transition-colors focus:border-[rgba(255,92,92,0.5)]`;

export default function DeleteUserForm({ className = '' }) {
    const [confirming, setConfirming] = useState(false);
    const passwordInput = useRef();

    const { data, setData, delete: destroy, processing, errors, reset } = useForm({ password: '' });

    const confirmDeletion = () => setConfirming(true);

    const submit = (e) => {
        e.preventDefault();
        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirming(false);
        reset();
    };

    return (
        <section className={className}>
            <div className="border overflow-hidden" style={{ background: C.card, borderColor: C.b }}>
                {/* HEAD */}
                <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: C.b, background: C.card2 }}>
                    <span className="flex h-9 w-9 items-center justify-center rounded-md border"
                        style={{ borderColor: `${C.red}55`, color: C.red, background: `${C.red}10` }}>
                        <IcoTrash />
                    </span>
                    <div className="flex-1 min-w-0">
                        <div className={`${F.head} text-[0.95rem] font-bold tracking-[2px] uppercase`} style={{ color: C.t1 }}>
                            حذف الحساب
                        </div>
                        <div className={`${F.ar} text-[0.72rem] mt-0.5`} style={{ color: C.t3 }}>
                            بمجرد الحذف، ستُحذف جميع بياناتك نهائيًا.
                        </div>
                    </div>
                    <span className={`${F.mono} text-[0.55rem] tracking-[1.5px] px-2 py-0.5 border`}
                        style={{ borderColor: `${C.red}44`, color: C.red, background: `${C.red}10` }}>
                        DANGER ZONE
                    </span>
                </div>

                <div className="p-4 sm:p-5">
                    <div className={`${F.ar} text-[0.78rem] leading-6`} style={{ color: C.t3 }}>
                        بمجرد حذف حسابك، ستفقد بشكل دائم:
                        <span className={`${F.mono} text-[0.7rem] tracking-[1px]`} style={{ color: C.red }}>
                            {' '}الحسابات · العمليات · الميزانيات · الأهداف · الإعدادات
                        </span>
                        . هذا الإجراء غير قابل للتراجع.
                    </div>
<button
    type="button"
    onClick={confirmDeletion}
    className={`${F.head} mt-5 flex w-full sm:w-auto items-center justify-center gap-2 border px-5 py-2.5 text-[0.8rem] font-bold tracking-[2px] uppercase transition-colors hover:brightness-125`}
    style={{ borderColor: `${C.red}55`, color: C.red, background: `${C.red}0a` }}>
    <IcoTrash /> حذف الحساب نهائيًا
</button>
                </div>
            </div>

            {/* MODAL */}
            {confirming && (
                <div className="fixed inset-0 bg-black/85 backdrop-blur-[6px] z-[1000] flex items-center justify-center p-5"
                    onClick={(e) => e.target === e.currentTarget && closeModal()}>
                    <form onSubmit={submit} className="w-full max-w-[460px] border shadow-[0_0_60px_rgba(255,92,92,0.15)]"
                        style={{ background: C.card, borderColor: `${C.red}55` }}>
                        {/* HEAD */}
                        <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: C.b, background: `${C.red}0a` }}>
                            <span className="flex h-10 w-10 items-center justify-center rounded-md border"
                                style={{ borderColor: `${C.red}55`, color: C.red, background: `${C.red}15` }}>
                                <IcoAlert />
                            </span>
                            <div className="flex-1">
                                <div className={`${F.head} text-[0.95rem] font-bold tracking-[2px] uppercase`} style={{ color: C.red }}>
                                    تأكيد الحذف
                                </div>
                                <div className={`${F.ar} text-[0.7rem] mt-0.5`} style={{ color: C.t3 }}>
                                    هذا الإجراء نهائي ولا يمكن التراجع عنه.
                                </div>
                            </div>
                            <button type="button" onClick={closeModal}
                                className="flex h-8 w-8 items-center justify-center border transition-colors hover:border-[rgba(255,61,90,0.5)] hover:text-[#ff3d5a]"
                                style={{ borderColor: C.b, color: C.t2 }}>
                                <IcoX />
                            </button>
                        </div>

                        <div className="p-5 flex flex-col gap-4">
                            {/* ALERT */}
                            <div className="flex items-start gap-2.5 border px-3.5 py-3" style={{ borderColor: `${C.red}44`, background: `${C.red}0a` }}>
                                <span className="mt-0.5 shrink-0" style={{ color: C.red }}><IcoDanger /></span>
                                <div className={`${F.ar} text-[0.78rem] leading-6`} style={{ color: C.t2 }}>
                                    أدخل كلمة السر الحالية لتأكيد رغبتك في حذف حسابك بشكل نهائي.
                                </div>
                            </div>

                            {/* PASSWORD */}
                            <div>
                                <label htmlFor="delete_password" className={`${F.mono} text-[0.65rem] tracking-[2px] uppercase block mb-1.5`} style={{ color: C.t3 }}>
                                    // كلمة السر
                                </label>
                                <input
                                    id="delete_password"
                                    type="password"
                                    ref={passwordInput}
                                    className={inputCls}
                                    style={{ background: C.card2, borderColor: errors.password ? C.red : C.b, color: C.t1 }}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    autoFocus
                                    placeholder="••••••••"
                                />
                                {errors.password && <div className={`${F.mono} text-[0.68rem] mt-1.5`} style={{ color: C.red }}>⚠ {errors.password}</div>}
                            </div>

                            <div className="flex items-center justify-end gap-2.5 pt-3 border-t" style={{ borderColor: C.b }}>
                                <button type="button" onClick={closeModal}
                                    className={`${F.head} border px-4 py-2.5 text-[0.78rem] font-bold tracking-[2px] uppercase transition-colors`}
                                    style={{ borderColor: C.b, color: C.t2 }}>
                                    إلغاء
                                </button>
                                <button type="submit" disabled={processing}
                                    className={`${F.head} border px-5 py-2.5 text-[0.78rem] font-bold tracking-[2px] uppercase transition-colors disabled:opacity-50`}
                                    style={{ borderColor: C.red, color: C.red, background: `${C.red}0a` }}>
                                    <span className="flex items-center gap-2"><IcoTrash /> حذف الحساب</span>
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}
        </section>
    );
}