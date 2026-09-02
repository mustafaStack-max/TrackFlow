import { useMemo, useRef, useState } from 'react';
import { COLORS as C, FONT as F } from './theme';
import { fmtMAD } from './format';

const MONTHS = ['ينا', 'فبر', 'مار', 'أبر', 'ماي', 'يون', 'يول', 'غشت', 'شتن', 'أكت', 'نون', 'دجن'];
const DAY_ROWS = ['', 'إثنين', '', 'أربعاء', '', 'جمعة', ''];
const GAP = 4;

export default function SpendingHeatmap({ data = [] }) {
    const wrapRef = useRef(null);
    const [tip, setTip] = useState(null);

    const stats = useMemo(() => {
        if (!data.length) return null;
        const totalExpense = data.reduce((s, d) => s + (d.expense || 0), 0);
        const totalIncome = data.reduce((s, d) => s + (d.income || 0), 0);
        const maxExpense = Math.max(...data.map(d => d.expense || 0), 1);
        const maxIncome = Math.max(...data.map(d => d.income || 0), 1);
        const active = data.filter(d => (d.expense || 0) > 0 || (d.income || 0) > 0).length;
        return { totalExpense, totalIncome, maxExpense, maxIncome, active };
    }, [data]);

    const cells = useMemo(() => {
        if (!data.length) return [];
        const lead = new Date(data[0].date + 'T00:00:00').getDay();
        return data.map((d, i) => {
            const pos = lead + i;
            return { ...d, week: Math.floor(pos / 7), row: (pos % 7) + 1 };
        });
    }, [data]);

    const weekCount = cells.length ? cells[cells.length - 1].week + 1 : 0;
    const todayDate = data.length ? data[data.length - 1].date : null;

    const monthLabels = useMemo(() => {
        const labels = new Array(weekCount).fill(null);
        let prevM = -1;
        cells.forEach(c => {
            const dt = new Date(c.date + 'T00:00:00');
            const m = dt.getMonth();
            if (m !== prevM) {
                labels[c.week] = (prevM === -1 || m === 0) ? `${MONTHS[m]} ${dt.getFullYear()}` : MONTHS[m];
                prevM = m;
            }
        });
        return labels;
    }, [cells, weekCount]);

    const empty = 'rgba(148, 163, 184, 0.06)';
    const greenLevels = ['#0e4429', '#006d32', '#26a641', '#39d353'];
    const redLevels   = ['#4b1a1a', '#712424', '#a32e2e', '#ff5c5c'];

    const levelOf = (r, ramp) => ramp[r <= 0.25 ? 0 : r <= 0.5 ? 1 : r <= 0.75 ? 2 : 3];

    const colorFor = (c) => {
        const e = c.expense || 0, g = c.income || 0;
        if (!e && !g) return empty;
        if (e >= g) return levelOf(e / stats.maxExpense, redLevels);
        return levelOf(g / stats.maxIncome, greenLevels);
    };

    const showTip = (e, c) => {
        const r = e.currentTarget.getBoundingClientRect();
        const w = wrapRef.current.getBoundingClientRect();
        setTip({ c, x: r.left - w.left + r.width / 2, y: r.top - w.top });
    };

    if (!data.length || !stats) {
        return <div className="py-10 text-center">
            <div className={`${F.mono} text-[0.7rem] tracking-[2px]`} style={{ color: C.t4 }}>// NO DATA YET //</div>
        </div>;
    }

    // ★ السر هنا: أعمدة نسبية تملأ عرض الأب مهما كان — بدون قياس JS
    const gridCols = `repeat(${weekCount}, minmax(0, 1fr))`;

    return (
        <div ref={wrapRef} className="relative w-full min-w-0">
            {/* Tooltip */}
            {tip && (
                <div className="absolute z-20 pointer-events-none px-2.5 py-1.5 rounded border text-center"
                    style={{ left: tip.x, top: tip.y - 8, transform: 'translate(-50%, -100%)', background: '#0d1117', borderColor: C.b }}>
                    <div className={`${F.ar} text-[0.6rem] mb-0.5`} style={{ color: C.t3 }}>
                        {tip.c.date === todayDate ? 'اليوم — ' : ''}{tip.c.date}
                    </div>
                    <div className={`${F.mono} text-[0.66rem] font-bold whitespace-nowrap`} style={{ color: C.green }}>
                        +{fmtMAD(tip.c.income || 0)}
                    </div>
                    <div className={`${F.mono} text-[0.66rem] font-bold whitespace-nowrap`} style={{ color: C.red }}>
                        -{fmtMAD(tip.c.expense || 0)}
                    </div>
                </div>
            )}

            {/* الرأس */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div className={`${F.ar} text-[0.78rem] flex items-center gap-3`} style={{ color: C.t2 }}>
                    <span>
                        آخر 6 أشهر — دخل:{' '}
                        <span className={`${F.mono} font-bold`} style={{ color: C.green }}>{fmtMAD(stats.totalIncome)}</span>
                    </span>
                    <span>
                        صرف:{' '}
                        <span className={`${F.mono} font-bold`} style={{ color: C.red }}>{fmtMAD(stats.totalExpense)}</span>
                    </span>
                    <span className={`${F.mono} text-[0.6rem]`} style={{ color: C.t4 }}>MAD</span>
                </div>
                <div className={`${F.mono} text-[0.62rem]`} style={{ color: C.t4 }}>
                    {data[0].date} ← <span style={{ color: C.green }}>{todayDate} (اليوم)</span>
                </div>
            </div>

            {/* الشهور — نفس الأعمدة النسبية */}
            <div className="flex mb-1.5" style={{ gap: GAP }}>
                <div className="w-9 shrink-0" />
                <div className="grid flex-1 min-w-0" style={{ gridTemplateColumns: gridCols, columnGap: GAP }}>
                    {monthLabels.map((m, i) => m ? (
                        <div key={i} className={`${F.ar} text-[0.6rem] whitespace-nowrap`} style={{ gridColumn: i + 1, color: C.t3 }}>{m}</div>
                    ) : null)}
                </div>
            </div>

            {/* الأيام + الشبكة — تتمدد لملء الأب */}
            <div className="flex" style={{ gap: GAP }}>
                <div className="grid w-9 shrink-0" style={{ gridTemplateRows: 'repeat(7, 1fr)', rowGap: GAP }}>
                    {DAY_ROWS.map((d, i) => (
                        <div key={i} className={`${F.ar} text-[0.6rem] flex items-center`} style={{ color: C.t3 }}>{d}</div>
                    ))}
                </div>
                <div className="grid flex-1 min-w-0" style={{ gridTemplateColumns: gridCols, gap: GAP }}>
                    {cells.map(c => (
                        <div
                            key={c.date}
                            onMouseEnter={(e) => showTip(e, c)}
                            onMouseLeave={() => setTip(null)}
                            className="w-full cursor-pointer"
                            style={{
                                gridColumn: c.week + 1,
                                gridRow: c.row,
                                aspectRatio: '1 / 1',          // ★ مربعات مثالية بأي عرض
                                backgroundColor: colorFor(c),
                                borderRadius: 4,
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* التذييل */}
            <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
                <div className={`${F.mono} text-[0.62rem]`} style={{ color: C.t3 }}>
                    {stats.active} يوم نشط · {data.length - stats.active} بدون حركة
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <span className={`${F.ar} text-[0.6rem]`} style={{ color: C.t3 }}>إنفاق</span>
                        {redLevels.map((c, i) => (
                            <span key={i} className="w-[10px] h-[10px] rounded-[2px]" style={{ backgroundColor: c }} />
                        ))}
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className={`${F.ar} text-[0.6rem]`} style={{ color: C.t3 }}>إدخال</span>
                        {greenLevels.map((c, i) => (
                            <span key={i} className="w-[10px] h-[10px] rounded-[2px]" style={{ backgroundColor: c }} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}