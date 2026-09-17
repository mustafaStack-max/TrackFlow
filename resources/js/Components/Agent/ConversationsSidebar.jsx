import { COLORS as C, FONT as F } from '@/shared/lib/theme';
import { IcoSearch, IcoShield, IcoTrash } from './icons';

function ConversationItem({ conv, active, onDelete }) {
  return (
    <div className="group relative border-b transition-colors hover:bg-white/[0.04]" style={{ borderColor: `${C.b}88`, background: active ? `${C.green}10` : 'transparent' }}>
      {active && <span className="absolute bottom-0 right-0 top-0 w-0.5" style={{ background: C.green, boxShadow: `0 0 8px ${C.green}` }} />}
      <button type="button" onClick={() => onSelect(conv.uuid)} className="w-full px-3 py-2.5 pr-4 text-right">
        <div className="flex items-center justify-between gap-2">
          <span className={`${F.ar} truncate text-[0.7rem] font-semibold`} style={{ color: active ? C.green : C.t1 }}>{conv.title}</span>
          <span className={`${F.mono} shrink-0 text-[0.5rem]`} style={{ color: C.t4 }}>{conv.updated_at}</span>
        </div>
        {conv.last_message && (
          <div className={`${F.ar} mt-1 flex items-center gap-1 truncate text-[0.6rem]`} style={{ color: C.t4 }}>
            <span style={{ color: conv.last_message.role === 'user' ? C.cyan : C.green }}>{conv.last_message.role === 'user' ? '←' : '→'}</span>
            {conv.last_message.content}
          </div>
        )}
        {conv.has_pending_actions && (
          <span className={`${F.ar} mt-1.5 inline-flex items-center gap-1 border px-1.5 py-0.5 text-[0.52rem]`} style={{ borderColor: `${C.amber}55`, color: C.amber, background: `${C.amber}0d` }}>
            <IcoShield width={9} height={9} /> بانتظار موافقتك
          </span>
        )}
      </button>
      <button type="button" onClick={() => confirm(`حذف محادثة «${conv.title}» نهائياً؟`) && onDelete(conv.uuid)} className="absolute left-2 top-2 border p-1 opacity-0 transition-opacity hover:bg-red-500/10 group-hover:opacity-100" style={{ borderColor: `${C.red}44`, color: C.red, background: C.card }}>
        <IcoTrash />
      </button>
    </div>
  );
}

export default function ConversationsSidebar({ conversations, hasAny, activeUuid, query, onQueryChange, onSelect, onDelete }) {
  return (
    <div className="order-2 flex flex-col border lg:order-1" style={{ borderColor: C.b, background: C.card }}>
      <div className="border-b p-2" style={{ borderColor: C.b }}>
        <div className="flex items-center gap-2 border px-2 py-1.5" style={{ borderColor: C.b, background: C.card2 }}>
          <span style={{ color: C.t4 }}><IcoSearch /></span>
          <input type="text" value={query} onChange={(e) => onQueryChange(e.target.value)} placeholder="ابحث في محادثاتك..." className={`${F.ar} flex-1 bg-transparent text-[0.68rem] outline-none`} style={{ color: C.t1 }} />
        </div>
      </div>
      <div className={`${F.mono} flex justify-between border-b px-3 py-1.5 text-[0.55rem] tracking-[2px]`} style={{ borderColor: C.b, color: C.t4 }}>
        <span>// CONVERSATIONS</span>
        <span>{conversations.length}</span>
      </div>
      <div className="flex max-h-[52vh] flex-col overflow-y-auto">
        {conversations.length === 0 && (
          <div className={`${F.ar} p-4 text-center text-[0.66rem]`} style={{ color: C.t4 }}>
            {hasAny ? 'لا نتائج مطابقة.' : 'لا توجد محادثات بعد.'}
          </div>
        )}
        {conversations.map((c) => (
          <ConversationItem key={c.uuid} conv={c} active={activeUuid === c.uuid} onSelect={onSelect} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
}