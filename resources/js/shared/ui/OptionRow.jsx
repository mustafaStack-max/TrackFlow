import { COLORS as C, FONT as F } from '@/Components/Dashboard/theme';
import Badge from './Badge';
import Switch from './Switch';

export default function OptionRow({
  icon,
  label,
  desc,
  badge,
  checked,
  onChange,
  color = C.green,
  children,
}) {
  return (
    <div
      className="border p-2.5 mb-2 transition-colors"
      style={{
        borderColor: checked ? `${color}55` : C.b,
        background: checked ? `${color}0d` : 'transparent',
      }}
    >
      <div className="flex items-center gap-2.5">
        <span className="shrink-0" style={{ color: checked ? color : C.t4 }}>
          {icon}
        </span>

        <span className="flex-1 min-w-0">
          <span
            className={`${F.ar} text-[0.78rem] font-bold flex items-center gap-2`}
            style={{ color: C.t1 }}
          >
            {label}

            {badge && (
              <Badge
                color={C.green}
                borderColor={C.bHot}
                background={C.greenTrace}
              >
                ذكاء مالي
              </Badge>
            )}
          </span>

          {desc && (
            <span
              className={`${F.ar} text-[0.62rem] block mt-0.5`}
              style={{ color: C.t4 }}
            >
              {desc}
            </span>
          )}
        </span>

        <Switch checked={checked} onChange={onChange} color={color} />
      </div>

      {children}
    </div>
  );
}