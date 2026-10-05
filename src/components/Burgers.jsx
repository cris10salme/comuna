import { useState } from 'react'
import { BURGERS, BURGER_NOTE, HALAL_LABEL, PATTY_OPTIONS } from '../data/menu'
import { price } from '../lib/format'
import { itemKey, useOrder } from '../lib/order'
import Section from './Section'
import Chips from './Chips'
import HalalToggle from './HalalToggle'

function BurgerCard({ burger, index }) {
  const { add } = useOrder()
  const [patty, setPatty] = useState('smash')
  const [halal, setHalal] = useState(false)
  const [added, setAdded] = useState(false)

  const onAdd = () => {
    const detail = [
      ...(burger.chicken ? [] : [PATTY_OPTIONS.find((p) => p.id === patty).label]),
      ...(halal ? [HALAL_LABEL] : []),
    ]
    add({ key: itemKey(burger.id, detail), name: burger.name, detail, unitPrice: burger.price })
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  return (
    <article className="ticket burger">
      <div className="ticket__top">
        <span className="ticket__num">#{String(index + 1).padStart(2, '0')}</span>
        {burger.tag && <span className="ticket__tag">{burger.tag}</span>}
      </div>
      <h3 className="burger__name">{burger.name}</h3>
      <ul className="burger__ingredients">
        {burger.ingredients.map((ing) => (
          <li key={ing}>{ing}</li>
        ))}
      </ul>
      {!burger.chicken && (
        <Chips legend="Carne" options={PATTY_OPTIONS} value={patty} onChange={setPatty} />
      )}
      <HalalToggle checked={halal} onChange={setHalal} small />
      <div className="ticket__foot">
        <span className="ticket__price">{price(burger.price)}<small>€</small></span>
        <button className={`btn btn--add ${added ? 'is-added' : ''}`} onClick={onAdd}>
          {added ? '✓ Añadida' : '+ Añadir'}
        </button>
      </div>
    </article>
  )
}

export default function Burgers() {
  return (
    <Section id="burgers" kicker="01 — La plancha" title="Burgers" note={`${BURGER_NOTE}. Carne doble smash 2×90 g o poco hecha 180 g, mismo precio.`}>
      <div className="grid">
        {BURGERS.map((b, i) => (
          <BurgerCard key={b.id} burger={b} index={i} />
        ))}
      </div>
    </Section>
  )
}
