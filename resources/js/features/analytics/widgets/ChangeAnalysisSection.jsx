
import { COLORS as C, FONT as F } from '@/shared/lib/theme';
import Panel from '@/shared/ui/Panel';
import { fmtMAD } from '@/shared/lib/format';
import ChangeAnalysisTable from './ChangeAnalysisTable';

const DIRECTION_LABELS = {
  up: 'ارتفاع',
  down: 'انخفاض',
  stable: 'مستقر',
};

export default function ChangeAnalysisSection({ data = null }) {
  const color = data ? (data.direction === 'up' ? C.red : C.green) : C.t3;

  return (
    <Panel
      title="لماذا تغيّر صرفك؟"
      badge={data ? DIRECTION_LABELS[data.direction] || 'مستقر' : 'PENDING'}
      right={
        data ? (
          <span
            className={`${F.mono} text-[0.75rem] font-bold px-2 py-0.5 border rounded`}
            style={{
              borderColor: `${color}44`,
              color,
              background: `${color}10`,
            }}
          >
            {Math.abs(data.previousTotal) >= 100 &&
            data.totalChangePct !== null ? (
              <span dir="ltr">
                {`${data.totalChange > 0 ? '+' : ''}${data.totalChangePct}%`}
              </span>
            ) : (
              <span dir="ltr">
                {`${data.totalChange > 0 ? '+' : '-'}${fmtMAD(
                  Math.abs(data.totalChange)
                )} MAD`}
              </span>
            )}
          </span>
        ) : null
      }
    >
      <ChangeAnalysisTable data={data} />
    </Panel>
  );
}