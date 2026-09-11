import { useMemo } from 'react';
import { COLORS as C } from '@/shared/lib/theme';
import {
  applyRange,
  autoGranularity,
  bucketSeries,
  extendDates,
  projectSeries,
} from '@/shared/lib/analytics';
import { average, round2 } from '@/shared/lib/utils';
import { fmtMAD } from '@/shared/lib/format';
import {
  IcoAvg,
  IcoExpense,
  IcoIncome,
  IcoPeak,
  IcoScale,
} from '@/shared/icons';

const PREDICTION_HORIZON = 3;

export default function useFlowChartData({
  series = [],
  range = 'month',
  custom = null,
  granularity = 'auto',
  prefs = {},
}) {
  return useMemo(() => {
    const ranged = applyRange(series, range, custom);

    const effectiveGranularity =
      granularity === 'auto' ? autoGranularity(ranged.length) : granularity;

    const bucketed = bucketSeries(ranged, effectiveGranularity);

    /* ── التوقعات المستقبلية ── */
    let predictions = [];
    let chartData = bucketed;

    if (prefs.showPredictions && bucketed.length >= 2) {
      const lastDate = bucketed[bucketed.length - 1].date;
      const future = extendDates(
        lastDate,
        effectiveGranularity,
        PREDICTION_HORIZON
      );
      const projNet = projectSeries(bucketed, 'net', PREDICTION_HORIZON);
      const projCum = projectSeries(bucketed, 'cumulative', PREDICTION_HORIZON);

      predictions = future.map((f, i) => ({
        ...f,
        net: projNet[i],
        cumulative: projCum[i],
        income: null,
        expense: null,
        isPrediction: true,
      }));

      chartData = [...bucketed, ...predictions];
    }


    const peaks = { income: null, expense: null };

    bucketed.forEach((b, i) => {
      if (peaks.income === null || b.income > bucketed[peaks.income].income) {
        peaks.income = i;
      }
      if (peaks.expense === null || b.expense > bucketed[peaks.expense].expense) {
        peaks.expense = i;
      }
    });


    const averages = {
      income: round2(average(bucketed.map((b) => b.income))),
      expense: round2(average(bucketed.map((b) => b.expense))),
    };


    const maxExpense = bucketed.reduce((m, b) => Math.max(m, b.expense), 0);
    const budgetCeiling = prefs.budgetCeiling ?? round2(maxExpense * 1.2);


    const totals = bucketed.reduce(
      (acc, b) => ({
        income: acc.income + b.income,
        expense: acc.expense + b.expense,
        net: acc.net + b.net,
      }),
      { income: 0, expense: 0, net: 0 }
    );


    const stats = [
      {
        key: 'income',
        label: 'دخل الفترة',
        value: `${fmtMAD(totals.income)} MAD`,
        color: C.green,
        icon: IcoIncome,
      },
      {
        key: 'expense',
        label: 'مصروف الفترة',
        value: `${fmtMAD(totals.expense)} MAD`,
        color: C.red,
        icon: IcoExpense,
      },
      {
        key: 'net',
        label: 'الصافي',
        value: `${fmtMAD(totals.net)} MAD`,
        color: totals.net >= 0 ? C.green : C.red,
        icon: IcoScale,
      },
      {
        key: 'avgExpense',
        label: 'متوسط المصروف',
        value: `${fmtMAD(averages.expense)} MAD`,
        color: C.cyan,
        icon: IcoAvg,
      },
      {
        key: 'peakExpense',
        label: 'أعلى مصروف',
        value:
          peaks.expense !== null
            ? `${fmtMAD(bucketed[peaks.expense].expense)} MAD`
            : '—',
        sub: peaks.expense !== null ? bucketed[peaks.expense].label : '',
        color: C.red,
        icon: IcoPeak,
      },
      {
        key: 'peakIncome',
        label: 'أعلى دخل',
        value:
          peaks.income !== null
            ? `${fmtMAD(bucketed[peaks.income].income)} MAD`
            : '—',
        sub: peaks.income !== null ? bucketed[peaks.income].label : '',
        color: C.green,
        icon: IcoPeak,
      },
    ];

    return {
      ranged,
      bucketed,
      chartData,
      predictions,
      effectiveGranularity,
      peaks,
      averages,
      budgetCeiling,
      totals,
      stats,
    };
  }, [series, range, custom, granularity, prefs]);
}