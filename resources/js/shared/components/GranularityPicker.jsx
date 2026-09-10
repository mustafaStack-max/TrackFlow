import { COLORS as C, FONT as F } from '@/Components/Dashboard/theme';
import { GRANULARITY_DEFS } from '@/Components/Dashboard/aggregate';

export default function GranularityPicker({
  value = 'auto',
  effective = null,
  onChange,
  activeColor = C.cyan,
  className = '',
}) {
  return (
    <div
      className={['flex flex-wrap items-center gap-1.5', className]
        .filter(Boolean)
        .join(' ')}
    >
      <span
        className={`${F.mono} text-[0.58rem] tracking-[2px]`}
        style={{ color: C.t4 }}
      >
        دقة العرض:
      </span>

      {Object.entries(GRANULARITY_DEFS).map(([key, def]) => {
        const isActive = value === key;

        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange?.(key)}
            className={`${F.head} text-[0.7rem] font-semibold px-2.5 py-1 border transition-colors`}
            style={
              isActive
                ? {
                    borderColor: activeColor,
                    color: C.void,
                    background: activeColor,
                  }
                : { borderColor: C.b, color: C.t3 }
            }
          >
            {def.label}
          </button>
        );
      })}

      {value === 'auto' && effective && GRANULARITY_DEFS[effective] && (
        <span
          className={`${F.mono} text-[0.55rem] ms-1`}
          style={{ color: C.t4 }}
        >
          ({GRANULARITY_DEFS[effective].label})
        </span>
      )}
    </div>
  );
}