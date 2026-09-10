import { COLORS as C, FONT as F } from '@/Components/Dashboard/theme';

export default function SectionTitle({
  children,
  color = C.green,
  className = '',
}) {
  return (
    <div
      className={[
        F.head,
        'text-[0.82rem] font-bold tracking-[2px] uppercase mb-2.5',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ color }}
    >
      {children}
    </div>
  );
}