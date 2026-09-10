import { COLORS as C, FONT as F } from '@/Components/Dashboard/theme';
import { EmptyState, Panel } from '@/shared/ui';
import { fmtMAD } from '@/shared/lib/format';

const COLUMNS = ['#', 'الوصف', 'النوع', 'الحساب', 'الفئة', 'التاريخ', 'المبلغ'];

function TypeCell({ type }) {
  const isIncome = type === 'income';

  return (
    <span
      className={`${F.mono} text-[0.72rem] font-semibold`}
      style={{ color: isIncome ? C.green : C.red }}
    >
      {isIncome ? 'دخل' : 'مصروف'}
    </span>
  );
}

function CategoryCell({ category, color }) {
  return (
    <span
      className={`${F.mono} px-1.5 py-0.5 border text-[0.62rem]`}
      style={{ color, borderColor: `${color}44`, background: `${color}15` }}
    >
      {category}
    </span>
  );
}

function AmountCell({ type, amount }) {
  const isIncome = type === 'income';

  return (
    <span
      className={`${F.mono} text-[0.72rem] font-semibold`}
      style={{ color: isIncome ? C.green : C.red }}
    >
      {isIncome ? '+' : '-'}
      {fmtMAD(amount)}
    </span>
  );
}

export default function RecentTransactionsTable({ recent = [], periodLabel }) {
  return (
    <Panel title="آخر العمليات" badge={periodLabel} bodyClassName="p-0">
      <div className="overflow-x-auto">
        <table className="w-full text-right">
          <thead>
            <tr
              className={`${F.mono} text-[0.62rem] tracking-[1px]`}
              style={{ background: C.card2, color: C.t3 }}
            >
              {COLUMNS.map((col) => (
                <th key={col} className="px-4 py-2 font-normal">
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {recent.map((t, i) => (
              <tr
                key={t.id}
                className="border-t transition-colors hover:bg-[rgba(0,230,118,0.05)]"
                style={{ borderColor: 'rgba(0,230,118,0.05)' }}
              >
                <td
                  className={`${F.mono} px-4 py-2.5 text-[0.72rem]`}
                  style={{ color: C.t4 }}
                >
                  {i + 1}
                </td>

                <td
                  className={`${F.ar} px-4 py-2.5 text-[0.78rem]`}
                  style={{ color: C.t2 }}
                >
                  {t.description || '—'}
                </td>

                <td className="px-4 py-2.5">
                  <TypeCell type={t.type} />
                </td>

                <td
                  className={`${F.mono} px-4 py-2.5 text-[0.72rem]`}
                  style={{ color: C.cyan }}
                >
                  {t.account}
                </td>

                <td className="px-4 py-2.5">
                  <CategoryCell category={t.category} color={t.category_color} />
                </td>

                <td
                  className={`${F.mono} px-4 py-2.5 text-[0.72rem]`}
                  style={{ color: C.t3 }}
                >
                  {t.date}
                </td>

                <td className="px-4 py-2.5">
                  <AmountCell type={t.type} amount={t.amount} />
                </td>
              </tr>
            ))}

            {recent.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length}>
                  <EmptyState>// لا توجد عمليات مسجلة في هذه الفترة //</EmptyState>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}