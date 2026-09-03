import { router } from '@inertiajs/react';
import { COLORS as C, FONT as F } from '@/Components/Dashboard/theme';

const IcoWarn = (p) => (<svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path d="M10 2l8 14H2L10 2z" strokeLinejoin="round" /><path d="M10 8v3M10 14v1" strokeLinecap="round" /></svg>);

export default function ConfirmModal({ budget, onClose }) {
    if (!budget) return null;

    const confirm = () => {
        router.delete(route('budgets.destroy', budget.id), {
            onSuccess: () => onClose(),
            preserveScroll: true,
        });
    };

    return (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="w-full max-w-[400px] border shadow-2xl" style={{ background: C.card, borderColor: C.bHot }}>
                <div className="border-b px-5 py-3" style={{ borderColor: C.b, background: C.card2 }}>
                    <div className={`${F.head} text-[0.82rem] font-bold tracking-[3px] uppercase flex items-center gap-2`} style={{ color: C.red }}>
                        <IcoWarn /> تأكيد الحذف
                    </div>
                </div>
                <div className="p-5">
                    <div className={`${F.ar} text-[0.85rem] leading-6 mb-1`} style={{ color: C.t1 }}>
                        هل تريد حذف ميزانية:
                    </div>
                    <div className={`${F.head} text-[1.05rem] font-bold mb-3`} style={{ color: budget.color }}>
                        {budget.name}
                    </div>
                    <div className={`${F.ar} text-[0.75rem] border p-2.5 mb-4`}
                        style={{ borderColor: `${C.red}44`, color: C.t3, background: `${C.red}0d` }}>
                        ⚠️ هذا الإجراء لا يمكن التراجع عنه. العمليات المرتبطة ستبقى محفوظة.
                    </div>
                    <div className="flex gap-2">
                        <button type="button" onClick={onClose}
                            className={`${F.head} flex-1 border py-2 text-[0.75rem] font-bold tracking-[1.5px] uppercase transition-colors hover:bg-white/[0.04]`}
                            style={{ borderColor: C.b, color: C.t3 }}>
                            إلغاء
                        </button>
                        <button type="button" onClick={confirm}
                            className={`${F.head} flex-1 border py-2 text-[0.75rem] font-bold tracking-[1.5px] uppercase transition-colors hover:brightness-125`}
                            style={{ borderColor: `${C.red}88`, color: C.red, background: `${C.red}0d` }}>
                            حذف نهائي
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}