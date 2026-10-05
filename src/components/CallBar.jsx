import { BUSINESS, telHref } from '../data/business'
import { money } from '../lib/format'
import { useOrder } from '../lib/order'

// Barra fija inferior (solo móvil): llamar siempre a un toque.
export default function CallBar() {
  const { count, total, setOpen } = useOrder()
  return (
    <div className="callbar">
      <a href={telHref} className="callbar__call" aria-label={`Llamar al ${BUSINESS.phoneDisplay}`}>
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <path fill="currentColor" d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z" />
        </svg>
        Llamar
      </a>
      <button className="callbar__chat" onClick={() => window.dispatchEvent(new Event('open-chat'))} aria-label="¿Qué pido? Abrir el asistente">
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          <path fill="currentColor" d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 4v-4H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm3 6.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm5 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm5 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
        </svg>
      </button>
      <button className="callbar__order" onClick={() => setOpen(true)}>
        {count > 0 ? (
          <>Ver pedido · {count} · {money(total)}</>
        ) : (
          <>Mi pedido</>
        )}
      </button>
    </div>
  )
}
