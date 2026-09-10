import { COLORS as C, FONT as F } from '@/Components/Dashboard/theme';
import { nowStamp } from '@/shared/lib/format';

export default function DashboardHeader({ periodLabel }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-2">
      <div>
        <div
          className={`${F.head} text-[1.3rem] font-bold tracking-[3px] uppercase`}
          style={{ color: C.t1 }}
        >
          لوحة{' '}
          <em className="not-italic" style={{ color: C.green }}>
            التحكم
          </em>
        </div>

        <div
          className={`${F.mono} text-[0.72rem] tracking-[2px] mt-1`}
          style={{ color: C.t4 }}
        >
          // OPERATIONS DASHBOARD //{' '}
          <span style={{ color: C.green }}>{periodLabel}</span>
        </div>
      </div>

      <div
        className={`${F.mono} text-[0.68rem] text-left`}
        style={{ color: C.t3 }}
      >
        {nowStamp()}
      </div>
    </div>
  );
}