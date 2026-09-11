import { COLORS as C, FONT as F } from '@/shared/lib/theme';

export default function MiniStatCard({
  icon: Icon,
  label,
  value,
  sub,
  color = C.t1,
}) {
  return (
    <div
      className="relative p-3 border overflow-hidden transition-transform duration-150 hover:-translate-y-px"
      style={{
        background: C.card2,
        borderColor: C.b,
      }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        }}
      />

      <div className="flex items-center justify-between gap-2 mb-2">
        <span
          className={`${F.ar} text-[0.68rem] font-medium`}
          style={{ color: C.t3 }}
        >
          {label}
        </span>

        {Icon && <Icon style={{ color }} />}
      </div>

      <div
        className={`${F.mono} text-[0.95rem] font-bold truncate`}
        style={{ color }}
      >
        {value}
      </div>

      {sub && (
        <div
          className={`${F.mono} text-[0.6rem] mt-1`}
          style={{ color: C.t4 }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}