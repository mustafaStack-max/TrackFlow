import { COLORS as C } from '@/Components/Dashboard/theme';

export default function Switch({
  checked,
  onChange,
  color = C.green,
  disabled = false,
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={onChange}
      className="relative shrink-0 w-9 h-[18px] border transition-colors"
      style={{
        borderColor: checked ? color : C.b,
        background: checked ? `${color}22` : C.card2,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <span
        className="absolute top-[2px] w-3 h-3 transition-all duration-150"
        style={{
          background: checked ? color : C.t4,
          insetInlineStart: checked ? 'calc(100% - 14px)' : '2px',
        }}
      />
    </button>
  );
}