// resources/js/shared/lib/theme.js
/* ★ الثيم الأصلي كما هو تمامًا + طبقة تخصيص ألوان اختيارية فوقه */

export const FONT = {
    ar: "font-['IBM_Plex_Sans_Arabic',sans-serif]",
    head: "font-['Rajdhani',sans-serif]",
    mono: "font-['Share_Tech_Mono',monospace]",
};

export const AR_MONTHS_SHORT = ['ينا', 'فبر', 'مار', 'أبر', 'ماي', 'يون', 'يول', 'غشت', 'شتن', 'أكت', 'نون', 'دجن'];

const DARK = {
    void: '#070c0a',
    card: '#0d1512',
    card2: '#101a16',
    b: '#1f3a2d',
    bHot: '#2b5843',
    green: '#00e676',
    red: '#ff5c5c',
    purple: '#b388ff',
    gold: '#ffc107',
    cyan: '#00d4ff',
    amber: '#ffb74d',
    t1: '#e8f5ee',
    t2: '#c2d4cb',
    t3: '#8aa79a',
    t4: '#5c7269',
    greenTrace: 'rgba(0,230,118,0.06)',
    greenDim: 'rgba(0,230,118,0.35)',
};

const LIGHT = {
    void: '#eef3f0',
    card: '#ffffff',
    card2: '#f4f8f6',
    b: '#d3e0d9',
    bHot: '#a9c4b7',
    green: '#00994d',
    red: '#d63c3c',
    purple: '#6a3ff0',
    gold: '#b57e00',
    cyan: '#0083ad',
    amber: '#c26a00',
    t1: '#12211a',
    t2: '#2b3d34',
    t3: '#54685f',
    t4: '#7e918a',
    greenTrace: 'rgba(0,153,77,0.07)',
    greenDim: 'rgba(0,153,77,0.35)',
};

let current = 'dark';
try {
    if (localStorage.getItem('tf_theme') === 'light') current = 'light';
} catch (e) { /* ignore */ }
if (typeof document !== 'undefined') document.documentElement.dataset.theme = current;

export function getTheme() { return current; }
export function setTheme(t) {
    current = t;
    try { localStorage.setItem('tf_theme', t); } catch (e) { /* ignore */ }
    if (typeof document !== 'undefined') document.documentElement.dataset.theme = t;
}
export function toggleTheme() { const n = current === 'dark' ? 'light' : 'dark'; setTheme(n); return n; }

/* ─────────────────────────────────────────────────────
   ★ طبقة تخصيص الألوان (اختيارية — افتراضيًا فارغة تمامًا)
   ───────────────────────────────────────────────────── */
const CUSTOM_KEY = 'tf_custom_colors';

/* المفاتيح المسموح للمستخدم بتغييرها من صفحة الإعدادات */
export const CUSTOMIZABLE_KEYS = [
    { key: 'green',  label: 'اللون الأساسي (دخل / نجاح)' },
    { key: 'red',    label: 'لون المصاريف / الخطر' },
    { key: 'cyan',   label: 'اللون الثانوي (سماوي)' },
    { key: 'amber',  label: 'لون التحذير (برتقالي)' },
    { key: 'gold',   label: 'اللون الذهبي' },
    { key: 'purple', label: 'اللون البنفسجي' },
];

/* ★ الافتراضي = ألوان الثيم الداكن الأصلية نفسها */
export function getDefaultColors() {
    return {
        green: DARK.green,
        red: DARK.red,
        cyan: DARK.cyan,
        amber: DARK.amber,
        gold: DARK.gold,
        purple: DARK.purple,
    };
}

let custom = loadCustom();

function loadCustom() {
    try {
        const raw = localStorage.getItem(CUSTOM_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch (e) {
        return {};
    }
}

/** الألوان المعروضة في صفحة الإعدادات (افتراضي + محفوظ) */
export function getCustomColors() {
    return { ...getDefaultColors(), ...custom };
}

/** حفظ التخصيص (يُطبَّق على COLORS فورًا داخل الوحدة) */
export function setCustomColors(colors) {
    const clean = {};
    CUSTOMIZABLE_KEYS.forEach(({ key }) => {
        if (colors[key]) clean[key] = colors[key];
    });
    custom = clean;
    try { localStorage.setItem(CUSTOM_KEY, JSON.stringify(clean)); } catch (e) { /* ignore */ }
}

/** استعادة الألوان الأصلية (حذف أي تخصيص) */
export function resetCustomColors() {
    custom = {};
    try { localStorage.removeItem(CUSTOM_KEY); } catch (e) { /* ignore */ }
}

function hexToRgba(hex, a) {
    let h = String(hex).replace('#', '');
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    const n = parseInt(h, 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

/* ★ كائن حي: أي قراءة لـ C.green ترجع قيمة الثيم الحالي + التخصيص لحظة الرسم */
export const COLORS = new Proxy({}, {
    get: (_, k) => {
        const base = (current === 'dark' ? DARK : LIGHT)[k];
        if (k === 'greenTrace') return custom.green ? hexToRgba(custom.green, current === 'dark' ? 0.06 : 0.07) : base;
        if (k === 'greenDim') return custom.green ? hexToRgba(custom.green, 0.35) : base;
        return custom[k] || base;
    },
});