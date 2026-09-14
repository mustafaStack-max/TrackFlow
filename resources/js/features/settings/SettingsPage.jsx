// resources/js/features/settings/SettingsPage.jsx
import { useState, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Panel } from '@/shared/ui';
import {
  COLORS as C,
  FONT as F,
  CUSTOMIZABLE_KEYS,
  getCustomColors,
  setCustomColors,
  resetCustomColors,
  getDefaultColors,
  getTheme,
  toggleTheme,
} from '@/shared/lib/theme';

// ==========================================
// 1. تعريف جميع الأيقونات
// ==========================================
const IcoSun = (p) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.8v2.1M12 19.1v2.1M2.8 12h2.1M19.1 12h2.1M5.5 5.5l1.5 1.5M17 17l1.5 1.5M5.5 18.5L7 17M17 7l1.5-1.5" />
  </svg>
);

const IcoMoon = (p) => (
  <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}>
    <path d="M17 12.5A7.5 7.5 0 1 1 7.5 3 6 6 0 0 0 17 12.5z" strokeLinejoin="round" />
  </svg>
);

const IcoReset = (p) => (
  <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}>
    <path d="M3 10a7 7 0 0 1 12.5-4.3M17 10a7 7 0 0 1-12.5 4.3" strokeLinecap="round" />
    <path d="M3 5v5h5M17 15v-5h-5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IcoSave = (p) => (
  <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}>
    <path d="M4 3h10l3 3v11H4V3z" strokeLinejoin="round" />
    <path d="M7 3v4h6V3M7 17v-5h6v5" strokeLinejoin="round" />
  </svg>
);

const IcoDownload = (p) => (
  <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}>
    <path d="M10 3v10M6 9l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4 17h12" strokeLinecap="round" />
  </svg>
);

const IcoUpload = (p) => (
  <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}>
    <path d="M10 17V7M6 11l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4 3h12" strokeLinecap="round" />
  </svg>
);

const IcoAlert = (p) => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}>
    <path d="M10 6v6M10 15v.01" strokeLinecap="round" />
    <path d="M10 2a8 8 0 1 1 0 16 8 8 0 0 1 0-16z" strokeLinejoin="round" />
  </svg>
);

const IcoCheck = (p) => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}>
    <path d="M5 10l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ==========================================
// 2. المكونات الفرعية
// ==========================================
function ColorRow({ item, value, defaultValue, onChange }) {
  const changed = String(value).toLowerCase() !== String(defaultValue).toLowerCase();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 border" style={{ borderColor: C.b, background: C.card2 }}>
      <div className="flex items-center gap-3 min-w-0">
        <span className="w-10 h-10 rounded border shrink-0" style={{ background: value, borderColor: `${value}66` }} />
        <div className="min-w-0">
          <div className={`${F.ar} text-[0.8rem] font-semibold truncate`} style={{ color: C.t1 }}>{item.label}</div>
          <div className={`${F.mono} text-[0.58rem] tracking-[1px]`} style={{ color: C.t4 }}>
            {item.key} · {value}
            {changed && <span style={{ color: C.amber }}> · معدّل</span>}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input type="color" value={value} onChange={(e) => onChange(item.key, e.target.value)} className="h-9 w-12 cursor-pointer border-0 bg-transparent p-0" />
        <input type="text" value={value} onChange={(e) => onChange(item.key, e.target.value)} className={`${F.mono} text-[0.66rem] px-2 py-1.5 border w-24 outline-none`} style={{ background: C.card, borderColor: C.b, color: C.t2 }} />
      </div>
    </div>
  );
}

function Preview({ colors }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {CUSTOMIZABLE_KEYS.map(({ key, label }) => (
        <div key={key} className="border p-3" style={{ borderColor: `${colors[key]}55`, background: `${colors[key]}0d` }}>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className={`${F.ar} text-[0.68rem] font-semibold`} style={{ color: colors[key] }}>{label}</span>
            <span className="w-3 h-3 rounded-full" style={{ background: colors[key] }} />
          </div>
          <div className={`${F.mono} text-[0.6rem]`} style={{ color: C.t3 }}>{colors[key]}</div>
          <div className="mt-2 h-1.5 rounded-full" style={{ background: `${colors[key]}22` }}>
            <div className="h-full rounded-full" style={{ width: '65%', background: colors[key] }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function DataBackupSection() {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState(null);
  const fileInputRef = useRef(null);

  const handleExport = () => {
    setExporting(true);
    window.location.href = '/data/export';
    setTimeout(() => setExporting(false), 2000);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      setImportMessage({ type: 'error', text: 'الملف يجب أن يكون بصيغة JSON' });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setImportMessage({ type: 'error', text: 'حجم الملف يتجاوز 10 ميجابايت' });
      return;
    }

    setImporting(true);
    setImportMessage(null);

    const formData = new FormData();
    formData.append('backup_file', file);

    router.post('/data/import', formData, {
      preserveScroll: true,
      onSuccess: () => {
        setImportMessage({ type: 'success', text: 'تم استيراد البيانات بنجاح!' });
        if (fileInputRef.current) fileInputRef.current.value = '';
      },
      onError: (errors) => {
        setImportMessage({ type: 'error', text: errors.backup_file || 'فشل استيراد البيانات' });
      },
      onFinish: () => {
        setImporting(false);
        setTimeout(() => setImportMessage(null), 5000);
      },
    });
  };

  return (
    <Panel title="النسخ الاحتياطي" badge="BACKUP & IMPORT">
      <div className="flex flex-col gap-3">
        {/* Export Button */}
        <div className="flex items-center justify-between gap-3 p-4 border transition-colors hover:bg-white/[0.03]" style={{ borderColor: C.b, background: C.card2 }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${C.green}15` }}>
              <IcoDownload style={{ color: C.green }} />
            </div>
            <div>
              <div className={`${F.ar} text-[0.82rem] font-semibold`} style={{ color: C.t1 }}>تصدير البيانات</div>
              <div className={`${F.ar} text-[0.68rem] mt-0.5`} style={{ color: C.t4 }}>حمّل نسخة احتياطية كاملة من جميع بياناتك (JSON)</div>
            </div>
          </div>
          <button type="button" onClick={handleExport} disabled={exporting} className="flex items-center gap-2 px-4 py-2 border transition-colors disabled:opacity-50 disabled:cursor-not-allowed" style={{ borderColor: C.green, color: C.void, background: exporting ? C.t4 : C.green }}>
            {exporting ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span className={`${F.ar} text-[0.68rem] font-semibold`}>جاري التحميل...</span></>
            ) : (
              <><IcoDownload /><span className={`${F.ar} text-[0.68rem] font-bold`}>تصدير</span></>
            )}
          </button>
        </div>

        {/* Import Button */}
        <div className="flex items-center justify-between gap-3 p-4 border transition-colors hover:bg-white/[0.03]" style={{ borderColor: C.b, background: C.card2 }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${C.cyan}15` }}>
              <IcoUpload style={{ color: C.cyan }} />
            </div>
            <div>
              <div className={`${F.ar} text-[0.82rem] font-semibold`} style={{ color: C.t1 }}>استيراد البيانات</div>
              <div className={`${F.ar} text-[0.68rem] mt-0.5`} style={{ color: C.t4 }}>استرجع بياناتك من ملف نسخة احتياطية</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input ref={fileInputRef} type="file" accept=".json,application/json" onChange={handleFileChange} className="hidden" />
            <button type="button" onClick={handleImportClick} disabled={importing} className="flex items-center gap-2 px-4 py-2 border transition-colors disabled:opacity-50 disabled:cursor-not-allowed" style={{ borderColor: C.cyan, color: importing ? C.t4 : C.cyan, background: 'transparent' }}>
              {importing ? (
                <><div className="w-4 h-4 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" /><span className={`${F.ar} text-[0.68rem] font-semibold`}>جاري الاستيراد...</span></>
              ) : (
                <><IcoUpload /><span className={`${F.ar} text-[0.68rem] font-bold`}>اختر ملف</span></>
              )}
            </button>
          </div>
        </div>

        {/* Import Message */}
        {importMessage && (
          <div className={`flex items-center gap-2 p-3 border rounded-lg ${importMessage.type === 'success' ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
            {importMessage.type === 'success' ? <IcoCheck style={{ color: C.green }} /> : <IcoAlert style={{ color: C.red }} />}
            <span className={`${F.ar} text-[0.75rem] font-medium`} style={{ color: importMessage.type === 'success' ? C.green : C.red }}>
              {importMessage.text}
            </span>
          </div>
        )}

        {/* Info Box */}
        <div className="flex items-start gap-2 p-3 border rounded-lg" style={{ borderColor: C.amber + '40', background: C.amber + '08' }}>
          <IcoAlert style={{ color: C.amber, marginTop: '2px' }} />
          <div className={`${F.ar} text-[0.7rem]`} style={{ color: C.t3 }}>
            <span style={{ color: C.amber }}>ملاحظة مهمة:</span> عند الاستيراد، سيتم تحديث البيانات الموجودة بدلاً من تكرارها. المعاملات المصدرة سابقاً لن تتكرر، بل سيتم تحديثها فقط.
          </div>
        </div>
      </div>
    </Panel>
  );
}

// ==========================================
// 3. المكون الرئيسي
// ==========================================
export default function SettingsPage() {
  const [colors, setColors] = useState(() => getCustomColors());
  const [theme, setThemeState] = useState(() => getTheme());
  const defaults = getDefaultColors();

  const handleChange = (key, value) => setColors((p) => ({ ...p, [key]: value }));
  const handleSave = () => { setCustomColors(colors); window.location.reload(); };
  const handleReset = () => { resetCustomColors(); window.location.reload(); };
  const handleThemeToggle = () => { toggleTheme(); window.location.reload(); };

  return (
    <AuthenticatedLayout>
      <Head title="الإعدادات" />
      <div className="flex flex-col gap-5">
        {/* HEADER */}
        <div className="border overflow-hidden" style={{ background: C.card, borderColor: C.b }}>
          <div className="px-4 py-3 border-b" style={{ borderColor: C.b }}>
            <div className={`${F.head} text-[1.3rem] font-bold tracking-[3px] uppercase`} style={{ color: C.t1 }}>
              لوحة <em className="not-italic" style={{ color: C.green }}>الإعدادات</em>
            </div>
            <div className={`${F.mono} text-[0.72rem] tracking-[2px] mt-1`} style={{ color: C.t4 }}>
              // SETTINGS // خصص ألوان موقعك وتجربتك
            </div>
          </div>
        </div>

        {/* COLORS */}
        <Panel title="تخصيص الألوان" badge="COLORS">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className={`${F.ar} text-[0.75rem]`} style={{ color: C.t2 }}>اختر ألوانك المفضلة — المعاينة تتحدث فورًا، والحفظ يعمّم الألوان على كل الموقع.</div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={handleReset} className="flex items-center gap-1.5 px-3 py-1.5 border transition-colors hover:bg-white/[0.04]" style={{ borderColor: C.b, color: C.t3 }}>
                  <IcoReset /><span className={`${F.ar} text-[0.68rem] font-semibold`}>استعادة الافتراضي</span>
                </button>
                <button type="button" onClick={handleSave} className="flex items-center gap-1.5 px-3 py-1.5 border transition-colors" style={{ borderColor: C.green, color: C.void, background: C.green }}>
                  <IcoSave /><span className={`${F.ar} text-[0.68rem] font-bold`}>حفظ وتطبيق</span>
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {CUSTOMIZABLE_KEYS.map((item) => (
                <ColorRow key={item.key} item={item} value={colors[item.key]} defaultValue={defaults[item.key]} onChange={handleChange} />
              ))}
            </div>
            <div className="border p-4" style={{ borderColor: C.b, background: C.card2 }}>
              <div className={`${F.mono} text-[0.58rem] tracking-[2px] mb-3`} style={{ color: C.t4 }}>// LIVE PREVIEW</div>
              <Preview colors={colors} />
            </div>
          </div>
        </Panel>

        {/* THEME */}
        <Panel title="المظهر" badge="THEME">
          <div className="flex items-center justify-between gap-3 p-4 border" style={{ borderColor: C.b, background: C.card2 }}>
            <div>
              <div className={`${F.ar} text-[0.88rem] font-bold`} style={{ color: C.t1 }}>الوضع {theme === 'dark' ? 'الداكن' : 'الفاتح'}</div>
              <div className={`${F.ar} text-[0.72rem] mt-1`} style={{ color: C.t3 }}>{theme === 'dark' ? 'مريح للعين في الإضاءة المنخفضة' : 'واضح في الإضاءة العالية'}</div>
            </div>
            <button type="button" onClick={handleThemeToggle} className="flex items-center gap-2 px-4 py-2 border transition-colors hover:bg-white/[0.04]" style={{ borderColor: C.b, color: theme === 'dark' ? C.amber : C.cyan }}>
              {theme === 'dark' ? <IcoSun /> : <IcoMoon />}
              <span className={`${F.ar} text-[0.72rem] font-semibold`}>تفعيل الوضع {theme === 'dark' ? 'الفاتح' : 'الداكن'}</span>
            </button>
          </div>
        </Panel>

        {/* DATA BACKUP & IMPORT */}
        <DataBackupSection />

        {/* ACCOUNT */}
        <Panel title="الحساب" badge="ACCOUNT">
          <div className="flex flex-col gap-2">
            <button type="button" className="flex items-center justify-between gap-3 p-4 border transition-colors hover:bg-white/[0.03]" style={{ borderColor: C.b, background: C.card2 }}>
              <div>
                <div className={`${F.ar} text-[0.82rem] font-semibold`} style={{ color: C.t1 }}>تغيير كلمة المرور</div>
                <div className={`${F.ar} text-[0.68rem] mt-0.5`} style={{ color: C.t4 }}>حدّث كلمة مرور حسابك</div>
              </div>
              <span className={`${F.mono} text-[0.6rem]`} style={{ color: C.t4 }}>←</span>
            </button>
            <button type="button" className="flex items-center justify-between gap-3 p-4 border transition-colors hover:bg-red-500/5" style={{ borderColor: `${C.red}44`, background: `${C.red}08` }}>
              <div>
                <div className={`${F.ar} text-[0.82rem] font-semibold`} style={{ color: C.red }}>حذف الحساب</div>
                <div className={`${F.ar} text-[0.68rem] mt-0.5`} style={{ color: C.t4 }}>حذف نهائي لجميع بياناتك (لا يمكن التراجع)</div>
              </div>
              <span className={`${F.mono} text-[0.6rem]`} style={{ color: C.red }}>←</span>
            </button>
          </div>
        </Panel>
      </div>
    </AuthenticatedLayout>
  );
}