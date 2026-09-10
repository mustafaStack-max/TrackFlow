const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.3,
};

export function IcoIncome(props) {
  return (
    <svg width="24" height="24" viewBox="0 0 20 20" {...stroke} {...props}>
      <path d="M12 6l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 10H4" strokeLinecap="round" />
    </svg>
  );
}

export function IcoExpense(props) {
  return (
    <svg width="24" height="24" viewBox="0 0 20 20" {...stroke} {...props}>
      <path d="M8 14l-4-4 4-4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 10h12" strokeLinecap="round" />
    </svg>
  );
}

export function IcoScale(props) {
  return (
    <svg width="24" height="24" viewBox="0 0 20 20" {...stroke} {...props}>
      <rect x="3" y="4" width="14" height="13" rx="1" />
      <path d="M7 2v4M13 2v4M3 9h14" strokeLinecap="round" />
    </svg>
  );
}

export function IcoTx(props) {
  return (
    <svg width="24" height="24" viewBox="0 0 20 20" {...stroke} {...props}>
      <path d="M4 16V8M8 16V10M12 16V5M16 16V11" strokeLinecap="round" />
    </svg>
  );
}

export function IcoWallet(props) {
  return (
    <svg width="24" height="24" viewBox="0 0 20 20" {...stroke} {...props}>
      <rect x="2" y="5" width="16" height="11" rx="1.5" />
      <circle cx="14" cy="10.5" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IcoPercent(props) {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" {...stroke} {...props}>
      <path d="M4.5 15.5l11-11" strokeLinecap="round" />
      <circle cx="6.5" cy="6.5" r="2.2" />
      <circle cx="13.5" cy="13.5" r="2.2" />
    </svg>
  );
}

export function IcoDaily(props) {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" {...stroke} {...props}>
      <rect x="3" y="4" width="14" height="13" rx="1.5" />
      <path d="M7 2v4M13 2v4M3 9h14" strokeLinecap="round" />
    </svg>
  );
}

export function IcoForecast(props) {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" {...stroke} {...props}>
      <path d="M3 15l5-5 3 3 6-7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 6h4v4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IcoCategory(props) {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" {...stroke} {...props}>
      <circle cx="10" cy="10" r="7" />
      <path d="M10 3v7l5 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IcoFlame(props) {
  return (
    <svg width="15" height="15" viewBox="0 0 20 20" {...stroke} {...props}>
      <path
        d="M10 3c1 3.5 4.5 4.5 4.5 8.5a4.5 4.5 0 0 1-9 0C5.5 9 7 7.5 8 5.5c.6 1.2 1.6 2 2 2.5.3-1.5.2-3 0-5z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IcoCompare(props) {
  return (
    <svg width="15" height="15" viewBox="0 0 20 20" {...stroke} {...props}>
      <path d="M4 7h10M11 4l3 3-3 3M16 13H6M9 10l-3 3 3 3" strokeLinecap="round" />
    </svg>
  );
}

export function IcoTrendUp(props) {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" {...stroke} strokeWidth="1.8" {...props}>
      <path d="M3 15l5-5 3 3 6-7M13 6h4v4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IcoTrendDown(props) {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" {...stroke} strokeWidth="1.8" {...props}>
      <path d="M3 5l5 5 3-3 6 7M13 14h4v-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}