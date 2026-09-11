import { useEffect, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Panel, StatusBanner } from '@/shared/ui';
import { COLORS as C, FONT as F } from '@/shared/lib/theme';

import AnalyticsHeaderWidget from './widgets/AnalyticsHeaderWidget';
import AnalyticsKpisSection from './widgets/AnalyticsKpisSection';
import ChangeAnalysisSection from './widgets/ChangeAnalysisSection';
import TrendsPanelWidget from './widgets/TrendsPanelWidget';
import ConcentrationWidget from './widgets/ConcentrationWidget';
import InsightsWidget from './widgets/InsightsWidget';

export default function AnalyticsPage({
  range = '90d',
  customFrom = null,
  customTo = null,
  periodLabel = 'آخر 3 أشهر',
  previousPeriodLabel = 'الفترة السابقة',
  period = {},
  overview = null,
  changeAnalysis = null,
  flow = [],
  concentration = null,
  wealth = null,
  insights = [],
}) {

  const [loading, setLoading] = useState(false);

useEffect(() => {
    const removeStart = router.on('start', () => setLoading(true));
    const removeFinish = router.on('finish', () => setLoading(false));

    return () => {
        removeStart();
        removeFinish();
    };
}, []);

  const handleRangeChange = (newRange, newCustom = null) => {
    router.get(
      route('analytics.index'),
      {
        range: newRange,
        from: newCustom?.from || undefined,
        to: newCustom?.to || undefined,
      },
      {
        preserveState: true,
        preserveScroll: true,
        only: [
          'range',
          'customFrom',
          'customTo',
          'periodLabel',
          'previousPeriodLabel',
          'period',
          'overview',
          'changeAnalysis',
          'flow',
          'concentration',
          'wealth',
          'insights',
        ],
      }
    );
  };

  /* ★ أخطر إشارة تظهر أولًا في شريط الحالة */
  const topInsight =
    insights.find((i) => i.type === 'danger') ||
    insights.find((i) => i.type === 'warning') ||
    null;

  const concentrationBadge = concentration
    ? concentration.status === 'high'
      ? 'خطر'
      : concentration.status === 'medium'
        ? 'متوسط'
        : 'صحي'
    : 'PENDING';

  return (
    <AuthenticatedLayout>
      <Head title="التحليلات" />

      <div
        dir="rtl"
        className="flex flex-col gap-5 transition-opacity duration-200"
        style={{
          opacity: loading ? 0.55 : 1,
          pointerEvents: loading ? 'none' : 'auto',
        }}
      >
        <AnalyticsHeaderWidget
          range={range}
          customFrom={customFrom}
          customTo={customTo}
          periodLabel={periodLabel}
          previousPeriodLabel={previousPeriodLabel}
          period={period}
          onRangeChange={handleRangeChange}
        />

        <StatusBanner insight={topInsight} />

        <AnalyticsKpisSection
          overview={overview}
          period={period}
          periodLabel={periodLabel}
        />

        <ChangeAnalysisSection data={changeAnalysis} />

        <TrendsPanelWidget flow={flow} wealth={wealth} periodLabel={periodLabel} />

        <div className="grid lg:grid-cols-2 gap-5">
          <Panel
            title="تركيز المصاريف"
            badge={concentrationBadge}
            right={
              concentration ? (
                <span
                  className={`${F.mono} text-[0.6rem] tracking-[1px]`}
                  style={{ color: C.t4 }}
                >
                  {concentration.categoriesCount} تصنيف
                </span>
              ) : null
            }
          >
            <ConcentrationWidget data={concentration} />
          </Panel>

          <Panel
            title="التوصيات الذكية"
            badge={insights.length > 0 ? `${insights.length} توصية` : 'PENDING'}
            right={
              insights.length > 0 && insights.some((i) => i.type === 'danger') ? (
                <span
                  className={`${F.mono} text-[0.6rem] font-bold tracking-[1px] px-2 py-0.5 border rounded`}
                  style={{
                    borderColor: `${C.red}66`,
                    color: C.red,
                    background: `${C.red}1a`,
                  }}
                >
                  انتبه
                </span>
              ) : null
            }
          >
            <InsightsWidget insights={insights} />
          </Panel>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}