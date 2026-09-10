import { useEffect, useState } from 'react';
import { COLORS as C, FONT as F } from '@/Components/Dashboard/theme';
import { RANGE_DEFS } from '@/Components/Dashboard/aggregate';

export default function RangePicker({
  value = 'month',
  customFrom = null,
  customTo = null,
  onChange,
  className = '',
}) {
  const [customOpen, setCustomOpen] = useState(value === 'custom');
  const [custom, setCustom] = useState({
    from: customFrom || '',
    to: customTo || '',
  });

  useEffect(() => {
    setCustom({ from: customFrom || '', to: customTo || '' });
  }, [customFrom, customTo]);

  useEffect(() => {
    setCustomOpen(value === 'custom');
  }, [value]);

  const canApply = Boolean(custom.from && custom.to);

  const handleClick = (key) => {
    if (key === 'custom') {
      setCustomOpen(true);
      return;
    }
    setCustomOpen(false);
    onChange?.(key, null);
  };

  const applyCustom = () => {
    if (!canApply) return;
    onChange?.('custom', custom);
  };

  return (
    <div
      className={['flex flex-wrap items-center gap-1.5', className]
        .filter(Boolean)
        .join(' ')}
    >
      {Object.entries(RANGE_DEFS).map(([key, def]) => {
        const isActive = value === key || (key === 'custom' && customOpen);
        const isCustom = key === 'custom';

        return (
          <button
            key={key}
            type="button"
            onClick={() => handleClick(key)}
            className={`${F.head} text-[0.72rem] font-semibold px-2.5 py-1 border transition-colors`}
            style={
              isActive
                ? {
                    borderColor: isCustom ? C.amber : C.green,
                    color: C.void,
                    background: isCustom ? C.amber : C.green,
                  }
                : isCustom
                  ? { borderColor: C.amber, color: C.amber }
                  : { borderColor: C.b, color: C.t2 }
            }
          >
            {def.label}
          </button>
        );
      })}

      {customOpen && (
        <div className="w-full flex flex-wrap items-center gap-2 mt-2">
          <input
            type="date"
            value={custom.from}
            max={custom.to || undefined}
            onChange={(e) => setCustom((c) => ({ ...c, from: e.target.value }))}
            className={`${F.mono} text-[0.65rem] px-2 py-1 border outline-none`}
            style={{
              background: C.card2,
              borderColor: C.b,
              color: C.t2,
              colorScheme: 'dark',
            }}
          />

          <span className={`${F.mono} text-[0.6rem]`} style={{ color: C.t4 }}>
            ←
          </span>

          <input
            type="date"
            value={custom.to}
            min={custom.from || undefined}
            onChange={(e) => setCustom((c) => ({ ...c, to: e.target.value }))}
            className={`${F.mono} text-[0.65rem] px-2 py-1 border outline-none`}
            style={{
              background: C.card2,
              borderColor: C.b,
              color: C.t2,
              colorScheme: 'dark',
            }}
          />

          <button
            type="button"
            onClick={applyCustom}
            disabled={!canApply}
            className={`${F.head} text-[0.65rem] font-bold px-3 py-1 border transition-opacity`}
            style={{
              borderColor: C.green,
              color: canApply ? C.green : C.t4,
              opacity: canApply ? 1 : 0.5,
              cursor: canApply ? 'pointer' : 'not-allowed',
            }}
          >
            تطبيق الفترة المخصصة
          </button>
        </div>
      )}
    </div>
  );
}