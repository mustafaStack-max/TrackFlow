import { COLORS as C, FONT as F } from '@/shared/lib/theme';
import {
  AnalyticsKpisSkeleton,
  KpiCard,
  MiniStatCard,
  TrendBadge,
} from '@/shared/ui';
import { fmtMAD } from '@/shared/lib/format';
import {
  IcoCategory,
  IcoDaily,
  IcoExpense,
  IcoForecast,
  IcoIncome,
  IcoPercent,
  IcoScale,
  IcoTx,
} from '@/shared/icons';

function SavingsSub({ current, previous }) {
  if (current === null || current === undefined) {
    return (
      <span className={`${F.ar} text-[0.62rem]`} style={{ color: C.amber }}>
        أضف دخلًا لهذه الفترة لحساب معدل الادخار
      </span>
    );
  }

  if (previous === null || previous === undefined) {
    return (
      <span className={`${F.mono} text-[0.62rem]`} style={{ color: C.t4 }}>
        الفترة السابقة: —
      </span>
    );
  }

  const diff = Math.round((current - previous) * 10) / 10;
  const color = diff >= 0 ? C.green : C.red;

  return (
    <span className={`${F.mono} text-[0.62rem]`} style={{ color }}>
      <span dir="ltr">
        {`${diff >= 0 ? '▲' : '▼'} ${Math.abs(diff).toFixed(1)}`}
      </span>{' '}
      نقطة عن الفترة السابقة
    </span>
  );
}

export default function AnalyticsKpisSection({
  overview = null,
  period = {},
  periodLabel = 'آخر 3 أشهر',
}) {
  if (!overview) {
    return <AnalyticsKpisSkeleton />;
  }

  const {
    income = 0,
    expense = 0,
    net = 0,
    txCount = 0,
    savingsRate = null,
    avgDailyExpense = 0,
    projectedExpense = null,
    topCategory = null,
    previous = {},
    changes = {},
  } = overview;

  const savingsColor =
    savingsRate === null
      ? C.t4
      : savingsRate < 0
        ? C.red
        : savingsRate < 10
          ? C.amber
          : savingsRate >= 20
            ? C.green
            : C.cyan;

  let projectedColor = C.t4;
  let projectedSub = 'يظهر غالبًا في فترة الشهر الحالي';

  if (projectedExpense !== null && projectedExpense !== undefined) {
    if (income <= 0) {
      projectedColor = C.amber;
      projectedSub = 'لا يوجد دخل مسجل للمقارنة';
    } else if (projectedExpense > income) {
      projectedColor = C.red;
      projectedSub = 'من المتوقع تجاوز الدخل';
    } else if (projectedExpense > income * 0.9) {
      projectedColor = C.amber;
      projectedSub = 'اقتراب من حدود الدخل';
    } else {
      projectedColor = C.green;
      projectedSub = 'ضمن حدود الدخل';
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <KpiCard
          icon={IcoIncome}
          color={C.green}
          tag={periodLabel}
          value={`${fmtMAD(income)} MAD`}
          label="الدخل"
          sub={
            <TrendBadge
              pct={changes.incomePct}
              base={previous.income ?? 0}
              diff={income - (previous.income ?? 0)}
              label="عن الفترة السابقة"
            />
          }
        />

        <KpiCard
          icon={IcoExpense}
          color={C.red}
          tag={periodLabel}
          value={`${fmtMAD(expense)} MAD`}
          label="المصاريف"
          sub={
            <TrendBadge
              pct={changes.expensePct}
              invert
              base={previous.expense ?? 0}
              diff={expense - (previous.expense ?? 0)}
              label="عن الفترة السابقة"
            />
          }
        />

        <KpiCard
          icon={IcoScale}
          color={net >= 0 ? C.green : C.red}
          tag="NET"
          value={
            <span dir="ltr">
              {`${net >= 0 ? '+' : '-'}${fmtMAD(Math.abs(net))} MAD`}
            </span>
          }
          label="صافي الفترة"
          sub={
            <TrendBadge
              diff={changes.netDiff}
              label="عن الفترة السابقة"
            />
          }
        />

        <KpiCard
          icon={IcoPercent}
          color={savingsColor}
          tag="SAVING"
          value={savingsRate === null ? '—' : `${savingsRate}%`}
          label="معدل الادخار"
          sub={
            <SavingsSub
              current={savingsRate}
              previous={previous.savingsRate}
            />
          }
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MiniStatCard
          icon={IcoDaily}
          color={C.amber}
          label="متوسط الإنفاق اليومي"
          value={`${fmtMAD(avgDailyExpense)} MAD`}
          sub={`محسوب على ${period.days || 0} يوم`}
        />

        <MiniStatCard
          icon={IcoTx}
          color={C.cyan}
          label="عدد العمليات"
          value={fmtMAD(txCount)}
          sub={`الفترة السابقة: ${previous.txCount ?? 0}`}
        />

        <MiniStatCard
          icon={IcoForecast}
          color={projectedColor}
          label="توقع نهاية الشهر"
          value={
            projectedExpense === null || projectedExpense === undefined
              ? '—'
              : `${fmtMAD(projectedExpense)} MAD`
          }
          sub={projectedSub}
        />

        <MiniStatCard
          icon={IcoCategory}
          color={topCategory?.color_hex || C.cyan}
          label="أكثر تصنيف إنفاقًا"
          value={topCategory?.name || '—'}
          sub={
            topCategory
              ? `${fmtMAD(topCategory.total)} MAD · ${topCategory.count} عملية`
              : 'لا توجد مصاريف في هذه الفترة'
          }
        />
      </div>
    </div>
  );
}