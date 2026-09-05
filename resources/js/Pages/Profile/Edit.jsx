// resources/js/Pages/Profile/Edit.jsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { COLORS as C, FONT as F } from '@/Components/Dashboard/theme';

const IcoUser = (p) => (<svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><circle cx="10" cy="7" r="3.5" /><path d="M3.5 17c.8-3.2 3.4-5 6.5-5s5.7 1.8 6.5 5" strokeLinecap="round" /></svg>);

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <AuthenticatedLayout>
            <Head title="الملف الشخصي" />

            {/* ★ نفس الـ wrapper ديال Dashboard + Transactions */}
            <div dir="rtl" className="flex flex-col gap-5">

                {/* ★★ HEADER — نفس ستايل باقي الصفحات تمامًا ★★ */}
                <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                        <div className={`${F.head} text-[1.3rem] font-bold tracking-[3px] uppercase flex items-center gap-2.5`} style={{ color: C.t1 }}>
                            <span style={{ color: C.green }}><IcoUser /></span>
                            الملف <em className="not-italic" style={{ color: C.green }}>الشخصي</em>
                        </div>
                        <div className={`${F.mono} text-[0.72rem] tracking-[2px] mt-1`} style={{ color: C.t4 }}>
                            // PROFILE SETTINGS // MANAGE YOUR ACCOUNT
                        </div>
                    </div>
                </div>

                {/* ★ البطاقات: متوسطة + متجاوبة */}
                <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
                    <UpdateProfileInformationForm mustVerifyEmail={mustVerifyEmail} status={status} />
                    <UpdatePasswordForm />
                    <DeleteUserForm />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}