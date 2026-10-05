import { BUSINESS } from '../data/business'
import { TACOS } from '../data/menu'

const ITEMS = [
  'Doble smash 2×90 g',
  TACOS.note.replace('Todos con', 'Tacos con'),
  'Todas las burgers con patatas',
  `Martes a domingo ${BUSINESS.opens}–${BUSINESS.closes}`,
  `Pedidos al ${BUSINESS.phoneDisplay}`,
]

// Cinta tipo impresora de comandas. El contenido va duplicado para que el bucle sea continuo.
export default function Marquee() {
  const row = ITEMS.map((t) => (
    <span key={t} className="marquee__item">{t}<b aria-hidden="true">✱</b></span>
  ))
  return (
    <div className="marquee" role="note" aria-label={ITEMS.join('. ')}>
      <div className="marquee__track" aria-hidden="true">
        {row}
        {row}
      </div>
    </div>
  )
}
