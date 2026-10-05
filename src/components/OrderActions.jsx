import { BUSINESS, smsHref, telHref } from '../data/business'

// Llamar como acción principal; SMS con el pedido ya escrito como plan B.
export default function OrderActions({ text, compact = false }) {
  return (
    <div className={`order-actions ${compact ? 'order-actions--compact' : ''}`}>
      <a href={telHref} className="btn btn--primary btn--block">
        Llamar para pedir · {BUSINESS.phoneDisplay}
      </a>
      <a href={smsHref(text)} className="order-actions__sms">
        ¿No contestan? <strong>Envíalo por SMS</strong>
      </a>
    </div>
  )
}
