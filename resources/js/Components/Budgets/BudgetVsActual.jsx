import { COLORS as C, FONT as F } from '@/Components/Dashboard/theme';
import { fmtMAD } from '@/Components/Dashboard/format';

const STATUS_COLOR = { ok: C.green, warning: C.amber, exceeded: C.red };

export default function BudgetVsActual({ budgets = [] }) {
    const rows = budgets.filter(b => !b.is_overall);

    if (rows.length === 0) {
        return (
            <div className={`${F.ar} py-10 text-center text-[0.8rem]`} style={{ color: C.t4 }}>
                لا توجد ميزانيات تصنيفات لعرض المقارنة
            </div>
        );
    }

    const max = Math.max(...rows.map(b => Math.max(b.effective, b.spent)), 1);

    return (
        <div className="flex flex-col gap-5">
            {/* Legend */}
            <div className="flex items-center gap-5">
                <span className="flex items-center gap-1.5">
                    <span className="h-2 w-4 rounded-sm" style={{ background: `${C.cyan}66` }} />
                    <span className={`${F.ar} text-[0.7rem]`} style={{ color: C.t3 }}>الحد الفعّال</span>
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="h-2 w-4 rounded-sm" style={{ background: C.green }} />
                    <span className={`${F.ar} text-[0.7rem]`} style={{ color: C.t3 }}>الإنفاق الفعلي</span>
                </span>
            </div>

            {rows.map(b => (
                <div key={b.id}>
                    <div className="mb-1.5 flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                            <span className="h-2 w-2 rounded-full shrink-0" style={{ background: b.color }} />
                            <span className={`${F.ar} truncate text-[0.8rem] font-bold`} style={{ color: C.t1 }}>{b.name}</span>
                        </div>
                        <span className={`${F.mono} text-[0.7rem] font-bold`} style={{ color: STATUS_COLOR[b.status] }}>
                            {b.pct}%
                        </span>
                    </div>

                    {/* شريطا المقارنة */}
                    <div className="flex flex-col gap-1">
                        <div className="h-[7px] overflow-hidden rounded-full" style={{ background: `${C.cyan}14` }}>
                            <div className="h-full rounded-full"
                                style={{ width: `${(b.effective / max) * 100}%`, background: `${C.cyan}66` }} />
                        </div>
                        <div className="h-[7px] overflow-hidden rounded-full" style={{ background: `${STATUS_COLOR[b.status]}14` }}>
                            <div className="h-full rounded-full transition-all duration-700"
                                style={{ width: `${Math.min((b.spent / max) * 100, 100)}%`, background: STATUS_COLOR[b.status] }} />
                        </div>
                    </div>

                    <div className={`${F.mono} mt-1 flex justify-between text-[0.6rem]`} style={{ color: C.t4 }}>
                        <span>الحد: {fmtMAD(b.effective)}</span>
                        <span>صُرف: {fmtMAD(b.spent)}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}