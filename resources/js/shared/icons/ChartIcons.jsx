const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.4,
};

export function IcoChart(props) {
  return (
    <svg width="17" height="17" viewBox="0 0 20 20" {...stroke} {...props}>
      <path d="M3 17V9M8 17V4M13 17v-7M18 17v-3" strokeLinecap="round" />
    </svg>
  );
}

export function IcoGear(props) {
  return (
    <svg width="13" height="13" viewBox="0 0 20 20" {...stroke} {...props}>
      <circle cx="10" cy="10" r="2.6" />
      <path
        d="M10 2v2.4M10 15.6V18M18 10h-2.4M4.4 10H2M15.5 4.5l-1.7 1.7M6.2 13.8l-1.7 1.7M15.5 15.5l-1.7-1.7M6.2 6.2L4.5 4.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IcoChevron(props) {
  return (
    <svg width="10" height="10" viewBox="0 0 20 20" {...stroke} strokeWidth="2" {...props}>
      <path d="M4 7l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IcoSparkle(props) {
  return (
    <svg width="10" height="10" viewBox="0 0 20 20" fill="currentColor" {...props}>
      <path d="M10 1l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" />
    </svg>
  );
}

export function IcoCalendar(props) {
  return (
    <svg width="13" height="13" viewBox="0 0 20 20" {...stroke} {...props}>
      <rect x="3" y="4" width="14" height="13" rx="1.5" />
      <path d="M7 2v4M13 2v4M3 9h14" strokeLinecap="round" />
    </svg>
  );
}

export function IcoDownload(props) {
  return (
    <svg width="13" height="13" viewBox="0 0 20 20" {...stroke} strokeWidth="1.5" {...props}>
      <path d="M10 3v9M6.5 8.5L10 12l3.5-3.5M4 16h12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IcoCeiling(props) {
  return (
    <svg width="15" height="15" viewBox="0 0 20 20" {...stroke} {...props}>
      <path d="M3 5h14" strokeDasharray="3 2" strokeLinecap="round" />
      <path d="M10 9v6M7 12l3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IcoAvg(props) {
  return (
    <svg width="15" height="15" viewBox="0 0 20 20" {...stroke} {...props}>
      <path d="M3 10h14" strokeDasharray="2 2" />
      <path d="M3 13q2.5-7 5 0t5 0 4 0" strokeLinecap="round" />
    </svg>
  );
}

export function IcoBrush(props) {
  return (
    <svg width="15" height="15" viewBox="0 0 20 20" {...stroke} {...props}>
      <circle cx="8.5" cy="8.5" r="4.5" />
      <path d="M12 12l5 5" strokeLinecap="round" />
    </svg>
  );
}

export function IcoDots(props) {
  return (
    <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor" {...props}>
      <circle cx="5" cy="12" r="1.6" />
      <circle cx="10" cy="6" r="1.6" />
      <circle cx="15" cy="10" r="1.6" />
    </svg>
  );
}

export function IcoPeak(props) {
  return (
    <svg width="15" height="15" viewBox="0 0 20 20" {...stroke} {...props}>
      <path d="M3 16l5-9 3 5 2.5-4L17 16z" strokeLinejoin="round" />
    </svg>
  );
}

export function IcoCurve(props) {
  return (
    <svg width="15" height="15" viewBox="0 0 20 20" {...stroke} {...props}>
      <path d="M3 15c4 0 5-9 9-9 2.5 0 3 3 5 3" strokeLinecap="round" />
    </svg>
  );
}