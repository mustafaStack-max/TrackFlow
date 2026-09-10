import { COLORS as C, FONT as F } from '@/Components/Dashboard/theme';

export default function ChartLegend({
  items = [],
  hidden = [],
  onToggle,
  className = '',
}) {
  return (
    <div
      className={[
        'flex flex-wrap items-center justify-center gap-2',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {items.map((item) => {
        const off = hidden.includes(item.key);

        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onToggle?.(item.key)}
            className={`${F.head} flex items-center gap-1.5 text-[0.72rem] font-semibold px-2.5 py-1 border transition-colors`}
            style={
              off
                ? { borderColor: C.b, color: C.t4 }
                : {
                    borderColor: item.color,
                    color: item.color,
                    background: `${item.color}11`,
                  }
            }
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: off ? C.t4 : item.color }}
            />
            {item.label}
          </button>
        );
      })}
    </div>
  );
}