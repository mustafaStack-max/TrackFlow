import { useEffect, useMemo, useState } from 'react';
import { COLORS as C, FONT as F } from './theme';
import { fmtMAD } from './format';

export default function RankedBarChart({ data = [] }) {
    const [hoverId, setHoverId] = useState(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const t = requestAnimationFrame(() => setMounted(true));
        return () => cancelAnimationFrame(t);
    }, []);

    // ★ عرض الشريط = النسبة من المجموع (بصري == رقمي، لا تضليل)
    const items = useMemo(() => {
        if (!data.length) return [];
        const total = data.reduce((s, d) => s + d.total, 0);
        return [...data]
            .map(d => ({ ...d, pct: total > 0 ? (d.total / total) * 100 : 0 }))
            .sort((a, b) => b.total - a.total);
    }, [data]);

    const grandTotal = items.reduce((s, d) => s + d.total, 0);
    const top = items[0];

    if (!items.length) {
        return (
            <div className="py-10 text-center">
                <div className={`${F.mono} text-[0.72rem] tracking-[2px]`} style={{ color: C.t4 }}>// NO EXPENSES RECORDED THIS MONTH //</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* ★ رأس من 3 بطاقات بدل الفراغ + جدار النص */}
            <div className="grid grid-cols-3 gap-2 mb-5">
                <div className="px-3 py-2 border" style={{ borderColor: C.b, background: C.card2 || C.card }}>
                    <div className={`${F.mono} text-[0.55rem] tracking-[2px]`} style={{ color: C.t4 }}>GRAND TOTAL</div>
                    <div className={`${F.mono} text-[0.95rem] font-bold mt-0.5`} style={{ color: C.t1 }}>
                        {fmtMAD(grandTotal)} <span className="text-[0.6rem]" style={{ color: C.t4 }}>MAD</span>
                    </div>
                </div>
                <div className="px-3 py-2 border" style={{ borderColor: C.b, background: C.card2 || C.card }}>
                    <div className={`${F.mono} text-[0.55rem] tracking-[2px]`} style={{ color: C.t4 }}>TOP CATEGORY</div>
                    <div className={`${F.ar} text-[0.85rem] font-bold mt-0.5 truncate`} style={{ color: top.color_hex }}>
                        {top.name}
                    </div>
                </div>
                <div className="px-3 py-2 border" style={{ borderColor: C.b, background: C.card2 || C.card }}>
                    <div className={`${F.mono} text-[0.55rem] tracking-[2px]`} style={{ color: C.t4 }}>CATEGORIES</div>
                    <div className={`${F.mono} text-[0.95rem] font-bold mt-0.5`} style={{ color: C.t1 }}>
                        {items.length}
                    </div>
                </div>
            </div>

            {/* الصفوف */}
            <div className="flex flex-col gap-4">
                {items.map((it, idx) => {
                    const isHovered = hoverId === it.id;
                    const isTop = idx === 0;
                    return (
                        <div
                            key={it.id}
                            onMouseEnter={() => setHoverId(it.id)}
                            onMouseLeave={() => setHoverId(null)}
                            className="p-2 -mx-2 rounded transition-colors duration-150"
                            style={{ background: isHovered ? 'rgba(255,255,255,0.03)' : 'transparent' }}
                        >
                            {/* التسمية + القيمة */}
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <span className={`${F.mono} text-[0.62rem] font-bold w-5 shrink-0`} style={{ color: isTop ? C.green : C.t4 }}>
                                        {String(idx + 1).padStart(2, '0')}
                                    </span>
                                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: it.color_hex }} />
                                    <span className={`${F.ar} text-[0.88rem] font-bold truncate`} style={{ color: C.t1 }}>{it.name}</span>
                                    {isTop && (
                                        <span className={`${F.mono} text-[0.52rem] font-bold tracking-[1px] px-1.5 py-0.5 border shrink-0`}
                                            style={{ borderColor: C.green, color: C.green, background: `${C.green}15` }}>
                                            TOP
                                        </span>
                                    )}
                                </div>

                                {/* ★ قيمة أكبر + نسبة بعمود ثابت محاذاة */}
                                <div className="flex items-baseline gap-1.5 shrink-0">
                                    <span className={`${F.mono} text-[1rem] font-bold`} style={{ color: C.t1 }}>{fmtMAD(it.total)}</span>
                                    <span className={`${F.mono} text-[0.58rem]`} style={{ color: C.t4 }}>MAD</span>
                                    <span className={`${F.mono} text-[0.68rem] font-bold w-12 text-left`} style={{ color: it.color_hex }}>
                                        {it.pct.toFixed(1)}%
                                    </span>
                                </div>
                            </div>

                            {/* ★ شريط أسمك (12px) بعرض = النسبة من المجموع */}
                            <div className="h-3 rounded-full overflow-hidden" style={{ background: `${it.color_hex}14` }}>
                                <div
                                    className="h-full rounded-full transition-all duration-700 ease-out"
                                    style={{
                                        width: mounted ? `${it.pct}%` : '0%',
                                        background: `linear-gradient(90deg, ${it.color_hex}, ${it.color_hex}bb)`,
                                        filter: isHovered ? 'brightness(1.25)' : 'none',
                                    }}
                                />
                            </div>

                            {/* ★ عمق المعلومة: عدد العمليات + المتوسط */}
                            {it.count != null && (
                                <div className={`${F.mono} text-[0.58rem] mt-1.5`} style={{ color: C.t4 }}>
                                    {it.count} عملية · متوسط {fmtMAD(it.avg)} MAD للعملية
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* شريط التوزيع — مثبّت أسفل */}
            <div className="mt-auto pt-5">
                <div className={`${F.mono} text-[0.58rem] tracking-[2px] mb-2`} style={{ color: C.t4 }}>DISTRIBUTION</div>
                <div className="flex h-2.5 rounded-full overflow-hidden">
                    {items.map(it => (
                        <div key={it.id} title={`${it.name}: ${fmtMAD(it.total)} (${it.pct.toFixed(1)}%)`}
                            className="transition-opacity duration-150 hover:opacity-80"
                            style={{ width: `${it.pct}%`, backgroundColor: it.color_hex }} />
                    ))}
                </div>
            </div>
        </div>
    );
}