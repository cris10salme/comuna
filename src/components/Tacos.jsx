import { useState } from 'react'
import { HALAL_LABEL, TACOS } from '../data/menu'
import { money, price } from '../lib/format'
import { itemKey, useOrder } from '../lib/order'
import Section from './Section'
import Chips from './Chips'
import HalalToggle from './HalalToggle'

export default function Tacos() {
  const { add } = useOrder()
  const [sizeId, setSizeId] = useState('L')
  const [meats, setMeats] = useState(['Kebab', 'Pollo', 'Tenders'])
  const [sauces, setSauces] = useState([])
  const [gratin, setGratin] = useState(null)
  const [isMenu, setIsMenu] = useState(false)
  const [halal, setHalal] = useState(false)
  const [added, setAdded] = useState(false)

  const size = TACOS.sizes.find((s) => s.id === sizeId)
  const chosenMeats = meats.slice(0, size.meats)
  const total = size.price + (gratin ? TACOS.gratins.price : 0) + (isMenu ? TACOS.menu.price : 0)

  const setMeat = (i, value) => setMeats((m) => m.map((x, j) => (j === i ? value : x)))

  const onAdd = () => {
    const detail = [
      chosenMeats.join(' + '),
      ...(halal ? [HALAL_LABEL] : []),
      sauces.length ? `Salsas: ${sauces.join(', ')}` : 'Sin salsa extra',
      ...(gratin ? [`Gratinado ${gratin.toLowerCase()}`] : []),
      ...(isMenu ? [`Menú (${TACOS.menu.includes})`] : []),
    ]
    add({ key: itemKey(`taco-${sizeId}`, detail), name: `Taco ${sizeId}`, detail, unitPrice: total })
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  return (
    <Section id="tacos" kicker="02 — A tu manera" title="Tacos" note={`${TACOS.note}.`}>
      <div className="tacos">
        <div className="sizes" role="radiogroup" aria-label="Tamaño">
          {TACOS.sizes.map((s) => (
            <button
              key={s.id}
              role="radio"
              aria-checked={s.id === sizeId}
              className={`size ${s.id === sizeId ? 'size--on' : ''}`}
              onClick={() => setSizeId(s.id)}
            >
              <span className="size__id">{s.id}</span>
              <span className="size__meats">{s.meats} {s.meats === 1 ? 'carne' : 'carnes'}</span>
              <span className="size__price">{price(s.price)}€</span>
            </button>
          ))}
        </div>

        <div className="ticket taco-builder">
          <div className="ticket__top">
            <span className="ticket__num">Comanda</span>
            <span className="ticket__tag">Taco {sizeId}</span>
          </div>

          {chosenMeats.map((m, i) => (
            <Chips
              key={i}
              legend={size.meats === 1 ? 'Carne' : `Carne ${i + 1}`}
              options={TACOS.meats}
              value={m}
              onChange={(v) => setMeat(i, v)}
            />
          ))}

          <HalalToggle checked={halal} onChange={setHalal} small />

          <Chips legend="Salsas" options={TACOS.sauces} value={sauces} onChange={setSauces} multiple />

          <Chips
            legend={`Gratinado +${price(TACOS.gratins.price)}€ (opcional)`}
            options={TACOS.gratins.options}
            value={gratin}
            onChange={setGratin}
            optional
          />

          <label className="toggle">
            <input type="checkbox" checked={isMenu} onChange={(e) => setIsMenu(e.target.checked)} />
            <span className="toggle__box" aria-hidden="true" />
            <span>
              <strong>Hazlo menú +{price(TACOS.menu.price)}€</strong>
              <small>Con {TACOS.menu.includes}</small>
            </span>
          </label>

          <div className="ticket__foot">
            <span className="ticket__price">{money(total)}</span>
            <button className={`btn btn--add ${added ? 'is-added' : ''}`} onClick={onAdd}>
              {added ? '✓ Añadido' : '+ Añadir taco'}
            </button>
          </div>
        </div>
      </div>
    </Section>
  )
}
