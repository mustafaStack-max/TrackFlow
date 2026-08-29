// resources/js/Components/Dashboard/SpendingHeatmap.jsx
import { useState } from 'react';
import { COLORS as C, FONT as F } from './theme';
import { fmtMAD } from './format';
import { EmptyState } from './Panel';

export default function SpendingHeatmap({ data = [] }) {
    const [tip, setTip] = useState(null);
    if (!data.length) return <EmptyState>// لا توجد بيانات //</EmptyState>;

    const max = Math.max(1, ...data.map((d) => d.amount));
    const colorFor = (amount) => {
        if (amount <= 0) return C.card3;
        const ratio = amount / max;
        if (ratio > 0.75) return C.red;
        if (ratio > 0.45) return C.amber;
        if (ratio > 0.15) return '#2fae68';
        return C.greenDim;
    };

    const weeks = [];
    for (let i = 0; i < data.length; i += 7) weeks.push(data.slice(i, i + 7));

    return (
        <div className="relative">
            <div className="flex gap-1.5 flex-wrap justify-center mb-3">
                {weeks.map((week, wi) => (
                    <div key={wi} className="flex flex-col gap-1.5">
                        {week.map((d) => (
                            <div
                                key={d.date}
                                onMouseEnter={(e) => setTip({ x: e.clientX, y: e.clientY, text: `${d.date} — ${fmtMAD(d.amount)} MAD` })}
                                onMouseMove={(e) => setTip((t) => t && ({ ...t, x: e.clientX, y: e.clientY }))}
                                onMouseLeave={() => setTip(null)}
                                className="w-6 h-6 flex items-center justify-center border transition-transform duration-150 hover:scale-110 cursor-default"
                                style={{ background: colorFor(d.amount), borderColor: C.b }}
                            >
                                <span className={`${F.mono} text-[0.5rem] opacity-70`} style={{ color: d.amount > 0 ? C.void : C.t4 }}>
                                    {Number(d.date.slice(-2))}
                                </span>
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            <div className="flex items-center justify-center gap-2">
                <span className={`${F.mono} text-[0.58rem]`} style={{ color: C.t4 }}>أقل</span>
                {[C.card3, C.greenDim, '#2fae68', C.amber, C.red].map((c, i) => (
                    <span key={i} className="w-3 h-3" style={{ background: c }} />
                ))}
                <span className={`${F.mono} text-[0.58rem]`} style={{ color: C.t4 }}>أكثر</span>
            </div>

            {tip && (
                <div
                    className={`${F.mono} fixed z-50 px-2.5 py-1.5 text-[0.65rem] border pointer-events-none`}
                    style={{ left: tip.x + 12, top: tip.y - 30, background: C.card, borderColor: C.bHot, color: C.t1 }}
                >
                    {tip.text}
                </div>
            )}
        </div>
    );
}
