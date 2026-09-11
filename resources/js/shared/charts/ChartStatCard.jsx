
import { COLORS as C, FONT as F } from '@/shared/lib/theme';

export default function ChartStatCard({
  label,
  value,
  sub,
  color = C.t1,
  borderColor,
  background,
  icon: Icon,
}) {
  return (
    <div
      className="border p-2.5 min-w-0"
      style={{
        borderColor: borderColor || C.b,
        background: background || C.card2,
      }}
    >
      {label && (
        <div
          className={`${F.mono} text-[0.55rem] tracking-[1px] mb-1 truncate`}
          style={{ color: C.t4 }}
        >
          {label}
        </div>
      )}

      <div className="flex items-center gap-1.5 min-w-0">
        {Icon && (
          <span className="shrink-0" style={{ color }}>
            <Icon />
          </span>
        )}

        <div
          className={`${F.mono} text-[0.9rem] font-bold truncate`}
          style={{ color }}
        >
          {value}
        </div>
      </div>

      {sub && (
        <div
          className={`${F.mono} text-[0.55rem] mt-0.5 truncate`}
          style={{ color: C.t4 }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}