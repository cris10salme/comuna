import { useState } from 'react'
import { DESSERTS, DRINKS, SAUCES, STARTERS } from '../data/menu'
import { price } from '../lib/format'
import { itemKey, useOrder } from '../lib/order'
import Section from './Section'
import Chips from './Chips'

function AddButton({ onAdd, label = '+' }) {
  const [added, setAdded] = useState(false)
  return (
    <button
      className={`btn btn--mini ${added ? 'is-added' : ''}`}
      aria-label={label}
      onClick={() => {
        onAdd()
        setAdded(true)
        setTimeout(() => setAdded(false), 1000)
      }}
    >
      {added ? '✓' : '+'}
    </button>
  )
}

function Line({ item, detail = [], children, disabled }) {
  const { add } = useOrder()
  return (
    <li className="line">
      <div className="line__row">
        <span className="line__name">{item.name}</span>
        <span className="line__dots" aria-hidden="true" />
        <span className="line__price">{price(item.price)}€</span>
        {disabled ? (
          <button className="btn btn--mini" disabled aria-label={`Añadir ${item.name}`}>+</button>
        ) : (
          <AddButton
            label={`Añadir ${item.name}`}
            onAdd={() => add({ key: itemKey(item.id, detail), name: item.name, detail, unitPrice: item.price })}
          />
        )}
      </div>
      {children}
    </li>
  )
}

function HalalLine({ item }) {
  const [halal, setHalal] = useState(false)
  return (
    <Line item={item} detail={halal ? ['Opción halal'] : []}>
      <label className="toggle toggle--small">
        <input type="checkbox" checked={halal} onChange={(e) => setHalal(e.target.checked)} />
        <span className="toggle__box" aria-hidden="true" />
        <span>Opción halal</span>
      </label>
    </Line>
  )
}

function SaucesLine({ item }) {
  const [sauces, setSauces] = useState([])
  const missing = item.pickSauces - sauces.length
  return (
    <Line item={item} detail={[`Salsas: ${sauces.join(', ')}`]} disabled={missing > 0}>
      <Chips
        legend={missing > 0 ? `Elige ${missing} ${missing === 1 ? 'salsa' : 'salsas'} más` : 'Salsas elegidas'}
        options={SAUCES}
        value={sauces}
        onChange={setSauces}
        multiple
        max={item.pickSauces}
      />
    </Line>
  )
}

export function Starters() {
  return (
    <Section id="entrantes" kicker="03 — Para picar" title="Entrantes">
      <ul className="ticket lines">
        {STARTERS.map((s) =>
          s.halalOption ? <HalalLine key={s.id} item={s} /> : s.pickSauces ? <SaucesLine key={s.id} item={s} /> : <Line key={s.id} item={s} />,
        )}
      </ul>
    </Section>
  )
}

export function DessertsAndDrinks() {
  return (
    <div className="pair">
      <Section id="postres" kicker="04 — Final" title="Postres">
        <ul className="ticket lines">
          {DESSERTS.map((d) => <Line key={d.id} item={d} />)}
        </ul>
      </Section>
      <Section id="bebidas" kicker="05 — Para beber" title="Bebidas">
        <ul className="ticket lines">
          {DRINKS.map((d) => <Line key={d.id} item={d} />)}
        </ul>
      </Section>
    </div>
  )
}
