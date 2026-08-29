// resources/js/Components/Dashboard/Panel.jsx
import { COLORS as C, FONT as F } from './theme';

export default function Panel({ title, badge, right, children, bodyClassName = '' }) {
    return (
        <div className="border overflow-hidden" style={{ background: C.card, borderColor: C.b }}>
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: C.b }}>
                <div className={`${F.head} text-[0.92rem] font-bold flex items-center gap-2`} style={{ color: C.t1 }}>
                    {title}
                </div>
                <div className="flex items-center gap-2">
                    {right}
                    {badge && (
                        <span className={`${F.mono} text-[0.6rem] tracking-[1.5px] px-2 py-0.5 border`} style={{ borderColor: C.b, color: C.t3, background: C.greenTrace }}>
                            {badge}
                        </span>
                    )}
                </div>
            </div>
            <div className={`p-4 ${bodyClassName}`}>{children}</div>
        </div>
    );
}

export function EmptyState({ children = '// لا توجد بيانات //' }) {
    return (
        <div className={`${F.mono} flex items-center justify-center h-full text-[0.7rem] tracking-[2px] py-10`} style={{ color: C.t4 }}>
            {children}
        </div>
    );
}
