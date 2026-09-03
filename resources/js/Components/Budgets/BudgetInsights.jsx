import { COLORS as C, FONT as F } from '@/Components/Dashboard/theme';
import { fmtMAD } from '@/Components/Dashboard/format';

export default function BudgetInsights({ budgets = [], totals = {} }) {
    const cat = budgets.filter(b => !b.is_overall);
    const exceeded = cat.filter(b => b.status === 'exceeded').sort((a, b) => b.pct - a.pct)[0];
    const best = cat.filter(b => b.spent > 0).sort((a, b) => a.pct - b.pct)[0];
    const rolloverTotal = budgets.reduce((s, b) => s + (b.rollover || 0), 0);

    const items = [
        exceeded
            ? { c: C.red, t: 'الأكثر تجاوزًا', d: `«${exceeded.name}» تجاوزت حدّها بنسبة ${exceeded.pct}% — راجع إنفاق هذا التصنيف.` }
            : { c: C.green, t: 'انضباط ممتاز', d: 'لا توجد ميزانيات متجاوزة هذا الشهر — استمر!' },
        best && { c: C.green, t: 'أفضل التزام', d: `«${best.name}» عند ${best.pct}% فقط من حدّها.` },
        (totals.unbudgeted ?? 0) > 0
            ? { c: C.amber, t: 'إنفاق خارج التغطية', d: `${fmtMAD(totals.unbudgeted)} MAD صُرفت دون ميزانية — خصّص لها حدًا.` }
            : { c: C.green, t: 'تغطية كاملة', d: 'كل إنفاقك هذا الشهر داخل ميزانياتك.' },
        rolloverTotal > 0 && { c: C.cyan, t: 'فوائض مُرحّلة', d: `أُضيف ${fmtMAD(rolloverTotal)} MAD من فوائض الفترة الماضية.` },
    ].filter(Boolean);

    return (
        <div className="flex flex-col gap-3">
            {items.map((x, i) => (
                <div key={i} className="rounded-md p-3" style={{ background: `${x.c}0d`, border: `1px solid ${x.c}33` }}>
                    <div className={`${F.ar} flex items-center gap-2 text-[0.78rem] font-bold`} style={{ color: x.c }}>
                        <span className="h-2 w-2 rounded-full" style={{ background: x.c }} /> {x.t}
                    </div>
                    <p className={`${F.ar} mt-1 text-[0.72rem] leading-5`} style={{ color: C.t2 }}>{x.d}</p>
                </div>
            ))}
        </div>
    );
}