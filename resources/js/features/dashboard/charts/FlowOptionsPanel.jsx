import { useState } from 'react';
import { COLORS as C, FONT as F } from '@/shared/lib/theme';
import { Switch } from '@/shared/ui';
import {
  IcoAvg,
  IcoBrush,
  IcoCeiling,
  IcoChevron,
  IcoCurve,
  IcoDots,
  IcoGear,
  IcoPeak,
  IcoSparkle,
} from '@/shared/icons';

const CURVE_OPTIONS = [
  { value: 'monotone', label: 'ناعم' },
  { value: 'linear', label: 'خطي' },
  { value: 'step', label: 'درجي' },
];

function OptionRow({ icon: Icon, label, checked, onToggle, color = C.green }) {
  return (
    <div
      className="flex items-center justify-between gap-3 px-3 py-2 border"
      style={{ borderColor: C.b, background: C.card2 }}
    >
      <span className="flex items-center gap-2" style={{ color: C.t2 }}>
        <Icon />
        <span className={`${F.ar} text-[0.72rem] font-medium`}>{label}</span>
      </span>

      <Switch checked={checked} onChange={onToggle} color={color} />
    </div>
  );
}

export default function FlowOptionsPanel({ prefs, setPrefs }) {
  const [open, setOpen] = useState(false);

  const toggle = (key) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-2.5 py-1 border transition-colors"
        style={{ borderColor: C.b, color: open ? C.green : C.t3 }}
      >
        <IcoGear />
        <span className={`${F.ar} text-[0.68rem] font-semibold`}>خيارات</span>
        <IcoChevron />
      </button>

      {open && (
        <div
          className="absolute z-30 mt-2 w-64 end-0 border p-3 flex flex-col gap-2 shadow-[0_8px_30px_rgba(0,0,0,0.6)]"
          style={{ background: C.card, borderColor: C.b }}
        >
          <OptionRow
            icon={IcoSparkle}
            label="التوقعات"
            checked={prefs.showPredictions}
            onToggle={() => toggle('showPredictions')}
            color={C.amber}
          />

          <OptionRow
            icon={IcoCeiling}
            label="سقف الميزانية"
            checked={prefs.showBudgetCeiling}
            onToggle={() => toggle('showBudgetCeiling')}
            color={C.red}
          />

          <OptionRow
            icon={IcoAvg}
            label="خطوط المتوسط"
            checked={prefs.showAverageLines}
            onToggle={() => toggle('showAverageLines')}
            color={C.cyan}
          />

          <OptionRow
            icon={IcoBrush}
            label="شريط التكبير"
            checked={prefs.showBrush}
            onToggle={() => toggle('showBrush')}
            color={C.gold}
          />

          <OptionRow
            icon={IcoDots}
            label="نقاط البيانات"
            checked={prefs.showDots}
            onToggle={() => toggle('showDots')}
            color={C.green}
          />

          <OptionRow
            icon={IcoPeak}
            label="إبراز الذروات"
            checked={prefs.showPeaks}
            onToggle={() => toggle('showPeaks')}
            color={C.red}
          />

          <div
            className="flex items-center justify-between gap-3 px-3 py-2 border"
            style={{ borderColor: C.b, background: C.card2 }}
          >
            <span className="flex items-center gap-2" style={{ color: C.t2 }}>
              <IcoCurve />
              <span className={`${F.ar} text-[0.72rem] font-medium`}>
                نوع المنحنى
              </span>
            </span>

            <select
              value={prefs.curveType}
              onChange={(e) =>
                setPrefs((p) => ({ ...p, curveType: e.target.value }))
              }
              className={`${F.ar} text-[0.68rem] px-2 py-1 border outline-none`}
              style={{ background: C.card, borderColor: C.b, color: C.t2 }}
            >
              {CURVE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}