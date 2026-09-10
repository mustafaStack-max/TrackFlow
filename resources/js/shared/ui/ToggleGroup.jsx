import { COLORS as C, FONT as F } from '@/Components/Dashboard/theme';

export default function ToggleGroup({
  options = [],
  value,
  onChange,
  activeColor = C.green,
  inactiveColor = C.t3,
  className = '',
}) {
  return (
    <div
      className={['flex border', className].filter(Boolean).join(' ')}
      style={{ borderColor: C.b }}
    >
      {options.map((option) => {
        const isActive = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange?.(option.value)}
            className={`${F.ar} text-[0.65rem] font-semibold px-2.5 py-1 transition-colors`}
            style={
              isActive
                ? {
                    background: option.activeColor || activeColor,
                    color: C.void,
                  }
                : { color: inactiveColor }
            }
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}