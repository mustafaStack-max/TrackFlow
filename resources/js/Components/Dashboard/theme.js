// resources/js/Components/Dashboard/theme.js
// Single source of truth for the TrackFlow dashboard's colors & fonts.
// Every dashboard component imports from here instead of hardcoding values,
// so the whole set stays visually consistent.

export const COLORS = {
    void: '#040507',
    panel: '#080c10',
    card: '#101820',
    card2: '#141e27',
    card3: '#18242e',

    green: '#00e676',
    greenDim: '#1a5c38',
    greenTrace: 'rgba(0,230,118,0.07)',
    greenGlow: 'rgba(0,230,118,0.18)',

    red: '#ff3d5a',
    redDim: 'rgba(255,61,90,0.1)',
    amber: '#ffc107',
    amberDim: 'rgba(255,193,7,0.1)',
    cyan: '#00d4ff',
    purple: '#b388ff',
    gold: '#ffd700',

    b: 'rgba(0,230,118,0.13)',
    bHot: 'rgba(0,230,118,0.45)',
    bRed: 'rgba(255,61,90,0.3)',

    t1: '#e8f5ef',
    t2: '#a8c4b0',
    t3: '#5a8068',
    t4: '#2d4a38',
};

export const FONT = {
    mono: "font-['Share_Tech_Mono',monospace]",
    head: "font-['Rajdhani',sans-serif]",
    ar: "font-['IBM_Plex_Sans_Arabic',sans-serif]",
};

export const AR_MONTHS_SHORT = ['ينا', 'فبر', 'مار', 'أبر', 'ماي', 'يون', 'يول', 'غشت', 'شتن', 'أكت', 'نون', 'دجن'];
