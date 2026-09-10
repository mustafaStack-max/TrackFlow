import { Link } from '@inertiajs/react';
import { COLORS as C, FONT as F } from '@/Components/Dashboard/theme';
import { SectionTitle } from '@/shared/ui';
import { fmtMAD } from '@/shared/lib/format';

export default function AccountsQuickView({ accounts = [] }) {
  if (!accounts.length) return null;

  return (
    <div>
      <SectionTitle>// الحسابات — نظرة سريعة</SectionTitle>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {accounts.map((a) => {
          const type = String(a.type || 'other').toLowerCase();
          const icon = `/storage/icons/${type}.svg`;
          const color = a.color_hex || C.green;

          return (
            <Link
              href={route('accounts.index')}
              key={a.id}
              className="relative block p-3 border overflow-hidden transition-transform duration-150 hover:-translate-y-px"
              style={{ background: C.card, borderColor: C.b }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-[2px]"
                style={{ background: color }}
              />

              <div className="flex items-center gap-2">
                <img
                  src={icon}
                  alt={type}
                  className="w-6 h-6 shrink-0"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/storage/icons/other.svg';
                  }}
                />

                <span
                  className={`${F.mono} text-[0.62rem] font-bold tracking-[2px] uppercase truncate`}
                  style={{ color: C.t2 }}
                >
                  {type}
                </span>
              </div>

              <div
                className={`${F.head} text-[0.85rem] font-bold mt-2 truncate`}
                style={{ color: C.t1 }}
              >
                {a.name}
              </div>

              <div className="flex items-baseline gap-1 mt-0.5">
                <span
                  className={`${F.mono} text-[1.05rem] font-bold`}
                  style={{ color }}
                >
                  {fmtMAD(a.balance)}
                </span>
                <span className={`${F.mono} text-[0.55rem]`} style={{ color: C.t4 }}>
                  MAD
                </span>
              </div>

              <div className="flex items-center gap-2.5 mt-1.5">
                <span
                  className={`${F.mono} text-[0.65rem] font-bold`}
                  style={{ color: C.green }}
                >
                  {fmtMAD(a.income ?? 0)}+
                </span>
                <span
                  className={`${F.mono} text-[0.65rem] font-bold`}
                  style={{ color: C.red }}
                >
                  {fmtMAD(a.expense ?? 0)}-
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}