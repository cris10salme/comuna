import { useEffect, useRef } from 'react'
import { money } from '../lib/format'
import { orderText, useOrder } from '../lib/order'
import OrderActions from './OrderActions'

export default function Ticket() {
  const order = useOrder()
  const { open, setOpen, items, total, mode, name, address, setField, changeQty, clear } = order
  const panelRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    document.body.classList.add('no-scroll')
    panelRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.classList.remove('no-scroll')
    }
  }, [open, setOpen])

  if (!open) return null

  return (
    <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="ticket-title">
      <div className="sheet__backdrop" onClick={() => setOpen(false)} />
      <div className="sheet__panel ticket ticket--receipt" ref={panelRef} tabIndex={-1}>
        <div className="receipt__head">
          <h2 id="ticket-title">Tu comanda</h2>
          <button className="sheet__close" onClick={() => setOpen(false)} aria-label="Cerrar">×</button>
        </div>

        {items.length === 0 ? (
          <p className="receipt__empty">Aún no has añadido nada. Mira la carta y pulsa “+ Añadir”.</p>
        ) : (
          <>
            <ul className="receipt__items">
              {items.map((i) => (
                <li key={i.key} className="receipt__item">
                  <div className="receipt__row">
                    <div className="qty">
                      <button onClick={() => changeQty(i.key, -1)} aria-label={`Quitar una ${i.name}`}>−</button>
                      <span>{i.qty}</span>
                      <button onClick={() => changeQty(i.key, 1)} aria-label={`Añadir una ${i.name}`}>+</button>
                    </div>
                    <span className="receipt__name">{i.name}</span>
                    <span className="receipt__amount">{money(i.qty * i.unitPrice)}</span>
                  </div>
                  {i.detail.length > 0 && (
                    <ul className="receipt__detail">
                      {i.detail.map((d) => <li key={d}>{d}</li>)}
                    </ul>
                  )}
                </li>
              ))}
            </ul>

            <div className="receipt__total">
              <span>Total</span>
              <strong>{money(total)}</strong>
            </div>

            <div className="receipt__form">
              <div className="segmented" role="radiogroup" aria-label="Entrega">
                {[['recoger', 'Recoger'], ['domicilio', 'A domicilio']].map(([v, l]) => (
                  <button key={v} role="radio" aria-checked={mode === v} className={mode === v ? 'on' : ''} onClick={() => setField('mode', v)}>
                    {l}
                  </button>
                ))}
              </div>
              {mode === 'domicilio' && (
                <label className="field">
                  <span>Dirección de entrega</span>
                  <input value={address} onChange={(e) => setField('address', e.target.value)} placeholder="Calle, número, piso…" autoComplete="street-address" />
                  <small>Consulta zona y gastos de envío al llamar.</small>
                </label>
              )}
              <label className="field">
                <span>Nombre (opcional)</span>
                <input value={name} onChange={(e) => setField('name', e.target.value)} autoComplete="given-name" />
              </label>
            </div>

            <OrderActions text={orderText(order)} />
            <button className="receipt__clear" onClick={clear}>Vaciar pedido</button>
          </>
        )}
      </div>
    </div>
  )
}
