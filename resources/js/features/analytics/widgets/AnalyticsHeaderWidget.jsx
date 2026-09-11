import { COLORS as C, FONT as F } from '@/shared/lib/theme';
import { RangePicker } from '@/shared/components';

export default function AnalyticsHeaderWidget({
  range = '90d',
  customFrom = null,
  customTo = null,
  periodLabel = 'آخر 3 أشهر',
  previousPeriodLabel = 'الفترة السابقة',
  period = {},
  onRangeChange,
}) {
  return (
    <div
      className="border overflow-hidden"
      style={{ background: C.card, borderColor: C.b }}
    >
      <div
        className="flex flex-wrap items-start justify-between gap-3 px-4 py-3 border-b"
        style={{ borderColor: C.b }}
      >
        <div>
          <div
            className={`${F.head} text-[1.3rem] font-bold tracking-[3px] uppercase`}
            style={{ color: C.t1 }}
          >
            لوحة{' '}
            <em className="not-italic" style={{ color: C.green }}>
              التحليلات
            </em>
          </div>

          <div
            className={`${F.mono} text-[0.72rem] tracking-[2px] mt-1`}
            style={{ color: C.t4 }}
          >
            // FINANCIAL ANALYTICS //{' '}
            <span style={{ color: C.green }}>{periodLabel}</span>
          </div>

          <div
            className={`${F.mono} text-[0.62rem] tracking-[1px] mt-1`}
            style={{ color: C.t3 }}
          >
            الفترة: {period.from || '—'} ← {period.to || '—'}
          </div>

          <div
            className={`${F.mono} text-[0.62rem] tracking-[1px] mt-0.5`}
            style={{ color: C.t4 }}
          >
            المقارنة: {period.prevFrom || '—'} ← {period.prevTo || '—'}
          </div>
        </div>

        <div className="text-left">
          <div
            className={`${F.mono} text-[0.6rem] tracking-[1.5px] px-2 py-1 border inline-block`}
            style={{ borderColor: C.b, color: C.t3, background: C.greenTrace }}
          >
            {previousPeriodLabel}
          </div>
        </div>
      </div>

      <div className="px-4 py-2.5">
        <RangePicker
          value={range}
          customFrom={customFrom}
          customTo={customTo}
          onChange={onRangeChange}
        />
      </div>
    </div>
  );
}