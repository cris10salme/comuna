import { useEffect, useRef, useState } from 'react'
import { BUSINESS } from '../data/business'
import { linePrice } from '../data/catalog'
import { money } from '../lib/format'
import { itemKey, useOrder } from '../lib/order'
import OrderActions from './OrderActions'

const STORAGE_KEY = 'lacomuna-chat-v1'
const MAX_INPUT = 500
const GREETING = {
  role: 'assistant',
  content: '¡Hola! Soy el asistente de La Comuna. Dime qué te apetece y te recomiendo, o pregúntame lo que quieras de la carta.',
}
const SUGGESTIONS = ['¿Qué me recomiendas?', 'Algo con pollo crujiente', 'Somos 3, ¿qué pedimos?', '¿Hacéis reparto?']

function load() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY))
    if (saved?.messages?.length) return saved
  } catch {
    /* sin almacenamiento: empezamos de cero */
  }
  return { messages: [GREETING], pedido: [] }
}

const detailOf = (l) => [
  ...(l.notas ? [l.notas] : []),
  ...(l.gratinado ? [`Gratinado ${l.gratinado.toLowerCase()}`] : []),
  ...(l.menu ? ['Menú (patatas y bebida)'] : []),
]

function smsFromOrder(pedido, total) {
  const lines = [`Hola ${BUSINESS.name}, quiero hacer un pedido:`, '']
  for (const l of pedido) {
    lines.push(`${l.cantidad}x ${l.producto} – ${money(l.cantidad * linePrice(l))}`)
    for (const d of detailOf(l)) lines.push(`   · ${d}`)
  }
  lines.push('', `Total: ${money(total)}`, 'Recoger o a domicilio: os lo digo al llamar.')
  return lines.join('\n')
}

export default function ChatAssistant() {
  const [open, setOpen] = useState(false)
  const [chat, setChat] = useState(load)
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const listRef = useRef(null)
  const inputRef = useRef(null)
  const order = useOrder()

  // La barra inferior del móvil abre el chat con este evento
  useEffect(() => {
    const onOpen = () => setOpen(true)
    window.addEventListener('open-chat', onOpen)
    return () => window.removeEventListener('open-chat', onOpen)
  }, [])

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(chat))
    } catch {
      /* modo privado: el chat vive solo en memoria */
    }
  }, [chat])

  useEffect(() => {
    if (!open) return
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [open, chat, busy])

  useEffect(() => {
    if (!open) return
    document.body.classList.add('no-scroll')
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.classList.remove('no-scroll')
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const send = async (text) => {
    const value = (text ?? input).trim().slice(0, MAX_INPUT)
    if (!value || busy) return
    setInput('')
    setError('')
    const messages = [...chat.messages, { role: 'user', content: value }]
    setChat((c) => ({ ...c, messages }))
    setBusy(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // El saludo inicial es solo de la web: no se manda
        body: JSON.stringify({ messages: messages.filter((m) => m !== GREETING) }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || typeof data.respuesta !== 'string') {
        setError(data.error || 'No he podido responder. Prueba otra vez.')
        // Quitamos el mensaje para que pueda reenviarlo sin romper la alternancia
        setChat((c) => ({ ...c, messages: c.messages.slice(0, -1) }))
        setInput(value)
        return
      }
      setChat({ messages: [...messages, { role: 'assistant', content: data.respuesta }], pedido: data.pedido || [] })
    } catch {
      setError('Sin conexión. Revisa tu internet y prueba otra vez.')
      setChat((c) => ({ ...c, messages: c.messages.slice(0, -1) }))
      setInput(value)
    } finally {
      setBusy(false)
      inputRef.current?.focus()
    }
  }

  const reset = () => {
    setChat({ messages: [GREETING], pedido: [] })
    setError('')
  }

  const pedido = chat.pedido.filter((l) => linePrice(l) !== null)
  const total = pedido.reduce((n, l) => n + l.cantidad * linePrice(l), 0)

  const toComanda = () => {
    for (const l of pedido) {
      const detail = detailOf(l)
      for (let i = 0; i < l.cantidad; i++) {
        order.add({ key: itemKey(`chat-${l.producto}`, detail), name: l.producto, detail, unitPrice: linePrice(l) })
      }
    }
    setOpen(false)
    order.setOpen(true)
  }

  return (
    <>
      <button className={`chat-fab ${open ? 'is-hidden' : ''}`} onClick={() => setOpen(true)} aria-label="Abrir el asistente de la carta">
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          <path fill="currentColor" d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 4v-4H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm3 6.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm5 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm5 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
        </svg>
        <span>¿Qué pido?</span>
      </button>

      {open && (
        <div className="chat" role="dialog" aria-modal="true" aria-labelledby="chat-title">
          <div className="chat__backdrop" onClick={() => setOpen(false)} />
          <section className="chat__panel">
            <header className="chat__head">
              <div>
                <h2 id="chat-title">Asistente La Comuna</h2>
                <small>Te ayuda con la carta · funciona con IA</small>
              </div>
              <button className="chat__reset" onClick={reset} disabled={busy}>Nueva</button>
              <button className="sheet__close" onClick={() => setOpen(false)} aria-label="Cerrar asistente">×</button>
            </header>

            <div className="chat__list" ref={listRef} aria-live="polite">
              {chat.messages.map((m, i) => (
                <p key={i} className={`chat__msg chat__msg--${m.role}`}>{m.content}</p>
              ))}
              {busy && (
                <p className="chat__msg chat__msg--assistant chat__typing" aria-label="Escribiendo">
                  <span /><span /><span />
                </p>
              )}
              {chat.messages.length === 1 && !busy && (
                <div className="chat__suggestions">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} className="chip" onClick={() => send(s)}>{s}</button>
                  ))}
                </div>
              )}
              {error && <p className="chat__error" role="alert">{error}</p>}
            </div>

            {pedido.length > 0 && (
              <div className="chat__order ticket">
                <div className="chat__order-head">
                  <strong>Tu pedido</strong>
                  <span>{money(total)}</span>
                </div>
                <ul>
                  {pedido.map((l, i) => (
                    <li key={i}>
                      {l.cantidad}× {l.producto}
                      {detailOf(l).length > 0 && <small> · {detailOf(l).join(' · ')}</small>}
                    </li>
                  ))}
                </ul>
                <OrderActions text={smsFromOrder(pedido, total)} compact />
                <button className="chat__to-comanda" onClick={toComanda}>Pasar a mi comanda</button>
              </div>
            )}

            <form
              className="chat__form"
              onSubmit={(e) => {
                e.preventDefault()
                send()
              }}
            >
              <input
                ref={inputRef}
                value={input}
                maxLength={MAX_INPUT}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe aquí… (sin datos personales)"
                aria-label="Mensaje para el asistente"
                enterKeyHint="send"
                autoComplete="off"
              />
              <button type="submit" disabled={busy || !input.trim()} aria-label="Enviar">
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M3 20l18-8L3 4v6l12 2-12 2z" /></svg>
              </button>
            </form>
          </section>
        </div>
      )}
    </>
  )
}
