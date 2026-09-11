import { COLORS as C, FONT as F } from '@/shared/lib/theme';
import { GranularityPicker, RangePicker } from '@/shared/components';
import { IcoDownload } from '@/shared/icons';
import FlowOptionsPanel from './FlowOptionsPanel';

export default function FlowToolbar({
  range = 'month',
  customFrom = null,
  customTo = null,
  onRangeChange,
  granularity = 'auto',
  effectiveGranularity = null,
  onGranularityChange,
  prefs,
  setPrefs,
  onExport,
  canExport = true,
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <RangePicker
        value={range}
        customFrom={customFrom}
        customTo={customTo}
        onChange={onRangeChange}
      />

      <div className="flex flex-wrap items-center gap-2">
        <GranularityPicker
          value={granularity}
          effective={effectiveGranularity}
          onChange={onGranularityChange}
        />

        <FlowOptionsPanel prefs={prefs} setPrefs={setPrefs} />

        <button
          type="button"
          onClick={onExport}
          disabled={!canExport}
          title="تصدير CSV"
          className="flex items-center gap-1.5 px-2.5 py-1 border transition-colors"
          style={{
            borderColor: C.b,
            color: canExport ? C.t3 : C.t4,
            cursor: canExport ? 'pointer' : 'not-allowed',
            opacity: canExport ? 1 : 0.5,
          }}
        >
          <IcoDownload />
          <span className={`${F.ar} text-[0.68rem] font-semibold`}>تصدير</span>
        </button>
      </div>
    </div>
  );
}