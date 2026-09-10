import { COLORS as C, FONT as F } from '@/Components/Dashboard/theme';
import Badge from './Badge';

export default function KpiCard({
  icon: Icon,
  color = C.green,
  tag,
  value,
  label,
  sub,
  predict,
}) {
  return (
    <div
      className="relative p-4 overflow-hidden border transition-transform duration-150 hover:-translate-y-px"
      style={{
        background: C.card,
        borderColor: C.b,
      }}
    >
      <div
        className="absolute bottom-0 left-0 right-0 h-[2px]"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        }}
      />

      <div className="flex items-start justify-between mb-3">
        {Icon && <Icon style={{ color }} />}

        {tag && <Badge color={color}>{tag}</Badge>}
      </div>

      <div
        className={`${F.mono} text-[1.55rem] leading-none mb-1`}
        style={{
          color,
          textShadow: `0 0 20px ${color}55`,
        }}
      >
        {value}
      </div>

      {sub && <div className="mb-1">{sub}</div>}

      <div
        className={`${F.ar} text-[0.8rem] font-medium`}
        style={{ color: C.t2 }}
      >
        {label}
      </div>

      {predict && (
        <div
          className="flex items-center gap-1.5 mt-1.5 pt-1.5 border-t"
          style={{ borderColor: C.greenTrace }}
        >
          <span
            className={`${F.mono} text-[0.6rem]`}
            style={{ color: C.amber }}
          >
            {predict}
          </span>

          <span
            className={`${F.mono} text-[0.55rem] tracking-[1px]`}
            style={{ color: C.t4 }}
          >
            متوقع نهاية الشهر
          </span>
        </div>
      )}
    </div>
  );
}