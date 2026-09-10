import { COLORS as C, FONT as F } from '@/Components/Dashboard/theme';

export default function Badge({
  children,
  color = C.t3,
  borderColor,
  background,
  className = '',
  mono = true,
  rounded = false,
}) {
  return (
    <span
      className={[
        mono ? F.mono : F.ar,
        'text-[0.6rem] tracking-[1.5px] px-2 py-0.5 border',
        rounded ? 'rounded' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        color,
        borderColor: borderColor || `${color}44`,
        background: background || `${color}15`,
      }}
    >
      {children}
    </span>
  );
}