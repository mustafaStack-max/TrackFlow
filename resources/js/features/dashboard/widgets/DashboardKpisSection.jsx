import { COLORS as C, FONT as F } from '@/Components/Dashboard/theme';
import { KpiCard, TrendBadge } from '@/shared/ui';
import { fmtMAD } from '@/shared/lib/format';
import {
  IcoExpense,
  IcoIncome,
  IcoScale,
  IcoTx,
  IcoWallet,
} from '@/shared/icons';

export default function DashboardKpisSection({ kpis = {}, periodLabel }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      <KpiCard
        icon={IcoExpense}
        color={C.red}
        tag={periodLabel}
        value={`${fmtMAD(kpis.totalExpense)} MAD`}
        label="إجمالي المصروف"
        sub={<TrendBadge pct={kpis.prevExpensePct} invert />}
        predict={
          kpis.predictedExpense ? `${fmtMAD(kpis.predictedExpense)} MAD` : null
        }
      />

      <KpiCard
        icon={IcoIncome}
        color={C.green}
        tag={periodLabel}
        value={`${fmtMAD(kpis.totalIncome)} MAD`}
        label="إجمالي الدخل"
        sub={<TrendBadge pct={kpis.prevIncomePct} />}
      />

      <KpiCard
        icon={IcoScale}
        color={C.amber}
        tag="BALANCE"
        value={`${fmtMAD(kpis.netPeriod)} MAD`}
        label="صافي الفترة"
      />

      <KpiCard
        icon={IcoTx}
        color={C.cyan}
        tag="COUNT"
        value={fmtMAD(kpis.txCount)}
        label="عدد العمليات"
      />

      <KpiCard
        icon={IcoWallet}
        color={C.gold}
        tag="TOTAL"
        value={`${fmtMAD(kpis.totalWealth)} MAD`}
        label="الثروة الإجمالية"
        sub={
          <span className={`${F.mono} text-[0.62rem]`} style={{ color: C.t3 }}>
            {kpis.accountsCount || 0} حساب
          </span>
        }
      />
    </div>
  );
}