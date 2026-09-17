import { COLORS as C, FONT as F } from '@/shared/lib/theme';

const MdHeading = ({ level, children }) => (
  <div className={`${F.ar} flex items-center gap-2 font-bold`} style={{ color: C.t1, fontSize: level <= 2 ? '0.92rem' : '0.84rem', marginTop: '1rem', marginBottom: '0.4rem' }}>
    <span className="w-[3px] shrink-0 self-stretch" style={{ background: C.green, boxShadow: `0 0 8px ${C.green}66` }} />
    <span>{children}</span>
  </div>
);

/** خريطة مكونات react-markdown — ثابتة خارج أي Component للأداء */
export const MD = {
  p: ({ children }) => <p className={`${F.ar} my-2 text-[0.8rem] leading-[1.95]`} style={{ color: C.t2 }}>{children}</p>,
  strong: ({ children }) => <strong className="font-bold" style={{ color: C.t1 }}>{children}</strong>,
  em: ({ children }) => <em style={{ color: C.t2 }}>{children}</em>,
  h1: ({ children }) => <MdHeading level={1}>{children}</MdHeading>,
  h2: ({ children }) => <MdHeading level={2}>{children}</MdHeading>,
  h3: ({ children }) => <MdHeading level={3}>{children}</MdHeading>,
  h4: ({ children }) => <MdHeading level={4}>{children}</MdHeading>,
  ul: ({ children }) => <ul className="my-2 flex flex-col gap-1 list-disc pr-5 marker:text-[color:var(--mk)]" style={{ '--mk': C.green, color: C.t2 }}>{children}</ul>,
  ol: ({ children }) => <ol className="my-2 flex flex-col gap-1 list-decimal pr-5 marker:font-bold marker:text-[color:var(--mk)]" style={{ '--mk': C.green, color: C.t2 }}>{children}</ol>,
  li: ({ children }) => <li className={`${F.ar} text-[0.78rem] leading-[1.9]`}>{children}</li>,
  blockquote: ({ children }) => <blockquote className="my-3 border-r-2 pr-3 italic" style={{ borderColor: C.green, color: C.t3 }}>{children}</blockquote>,
  code: ({ className, children }) =>
    String(className || '').includes('language-') ? (
      <code className={`${F.mono} text-[0.66rem] leading-relaxed`} style={{ color: C.t2 }}>{children}</code>
    ) : (
      <code className={`${F.mono} mx-0.5 border px-1 py-0.5 text-[0.66rem]`} style={{ borderColor: `${C.cyan}44`, background: `${C.cyan}0d`, color: C.cyan }}>{children}</code>
    ),
  pre: ({ children }) => <pre className="my-2 overflow-x-auto border p-2.5" style={{ borderColor: C.b, background: C.card }}>{children}</pre>,
  hr: () => <div className="my-4 h-px" style={{ background: `linear-gradient(to left, transparent, ${C.b}, transparent)` }} />,
  a: ({ href, children }) => <a href={href} target="_blank" rel="noreferrer" className="underline" style={{ color: C.cyan }}>{children}</a>,
  table: ({ children }) => (
    <div className="my-3 overflow-x-auto border" style={{ borderColor: C.b }}>
      <table className="w-full border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead style={{ background: `${C.green}0d` }}>{children}</thead>,
  th: ({ children }) => <th className={`${F.ar} border-b px-3 py-2 text-right text-[0.7rem] font-bold`} style={{ borderColor: C.b, color: C.green }}>{children}</th>,
  td: ({ children }) => <td className={`${F.ar} border-b px-3 py-2 text-[0.72rem]`} style={{ borderColor: `${C.b}66`, color: C.t2 }}>{children}</td>,
};