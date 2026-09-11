
export const INSIGHT_TYPES = {
  danger: {
    color: '#ff5c5c',
    bg: 'rgba(255, 92, 92, 0.06)',
    border: 'rgba(255, 92, 92, 0.35)',
    label: 'خطر',
    icon: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M10 3l8 13H2L10 3z" strokeLinejoin="round" />
        <path d="M10 9v3M10 14.5v.5" strokeLinecap="round" />
      </svg>
    ),
  },
  warning: {
    color: '#ffb74d',
    bg: 'rgba(255, 183, 77, 0.06)',
    border: 'rgba(255, 183, 77, 0.35)',
    label: 'تحذير',
    icon: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="10" cy="10" r="7" />
        <path d="M10 7v4M10 13.5v.5" strokeLinecap="round" />
      </svg>
    ),
  },
  success: {
    color: '#00e676',
    bg: 'rgba(0, 230, 118, 0.06)',
    border: 'rgba(0, 230, 118, 0.35)',
    label: 'إيجابي',
    icon: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="10" cy="10" r="7" />
        <path d="M7 10l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  info: {
    color: '#00d4ff',
    bg: 'rgba(0, 212, 255, 0.06)',
    border: 'rgba(0, 212, 255, 0.35)',
    label: 'معلومة',
    icon: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="10" cy="10" r="7" />
        <path d="M10 9v4M10 7v.5" strokeLinecap="round" />
      </svg>
    ),
  },
};

/**
 * إرجاع إعداد نوع التوصية مع سقوط آمن إلى "معلومة".
 * @param {string} type
 * @returns {{color:string,bg:string,border:string,label:string,icon:JSX.Element}}
 */
export function insightConfig(type) {
  return INSIGHT_TYPES[type] || INSIGHT_TYPES.info;
}