// resources/js/Components/Dashboard/ChartTooltip.jsx
import { COLORS as C, FONT as F } from './theme';
import { fmtMAD } from './format';

/** Generic themed tooltip box. Pass `rows` = [{label, value, color}]. */
export function TooltipBox({ title, rows }) {
    return (
        <div className="border p-3 text-[0.72rem] shadow-[0_8px_30px_rgba(0,0,0,0.6)]" style={{ background: C.card, borderColor: C.bHot }}>
            {title && <div className={`${F.mono} mb-2`} style={{ color: C.t2 }}>{title}</div>}
            {rows.map((r, i) => (
                <div key={i} className="flex items-center justify-between gap-6 mb-1 last:mb-0">
                    <span className="flex items-center gap-1.5" style={{ color: C.t2 }}>
                        <span className="w-2 h-2 rounded-full" style={{ background: r.color }} />
                        {r.label}
                    </span>
                    <span className={F.mono} style={{ color: r.color }}>{fmtMAD(r.value)} MAD</span>
                </div>
            ))}
        </div>
    );
}
