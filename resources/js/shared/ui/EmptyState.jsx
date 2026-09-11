import { COLORS as C, FONT as F } from '@/shared/lib/theme';

export default function EmptyState({
  children = '// لا توجد بيانات //',
  className = '',
}) {
  return (
    <div
      className={[
        F.mono,
        'flex items-center justify-center h-full text-[0.7rem] tracking-[2px] py-10',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ color: C.t4 }}
    >
      {children}
    </div>
  );
}