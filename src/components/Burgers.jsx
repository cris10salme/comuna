import { useState } from 'react'
import { BURGERS, BURGER_NOTE, HALAL_LABEL, PATTY_OPTIONS } from '../data/menu'
import { price } from '../lib/format'
import { itemKey, useOrder } from '../lib/order'
import Section from './Section'
import Chips from './Chips'
import HalalToggle from './HalalToggle'
import BurgerStage, { hasRecipe, useGraphicsEnv } from './BurgerStage'
import BurgerFullscreen from './BurgerFullscreen'

const DEFAULT_SELECTION = { patty: 'smash', halal: false }

const detailFor = (burger, sel) => [
  ...(burger.chicken ? [] : [PATTY_OPTIONS.find((p) => p.id === sel.patty).label]),
  ...(sel.halal ? [HALAL_LABEL] : []),
]

function BurgerCard({ burger, index, selection, onSelect, onAdd, env, viewerOpen, onOpen3D }) {
  const [added, setAdded] = useState(false)
  const handleAdd = () => {
    onAdd()
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  return (
    <article className={`ticket burger ${hasRecipe(burger.id) ? 'burger--3d' : ''}`}>
      {hasRecipe(burger.id) && <BurgerStage burger={burger} env={env} paused={viewerOpen} onOpen={onOpen3D} />}
      <div className="ticket__top">
        <span className="ticket__num">#{String(index + 1).padStart(2, '0')}</span>
      </div>
      <h3 className="burger__name">{burger.name}</h3>
      <ul className="burger__ingredients">
        {burger.ingredients.map((ing) => (
          <li key={ing}>{ing}</li>
        ))}
      </ul>
      {!burger.chicken && (
        <Chips legend="Carne" options={PATTY_OPTIONS} value={selection.patty} onChange={(patty) => onSelect({ patty })} />
      )}
      <HalalToggle checked={selection.halal} onChange={(halal) => onSelect({ halal })} small />
      <div className="ticket__foot">
        <span className="ticket__price">{price(burger.price)}<small>€</small></span>
        <button className={`btn btn--add ${added ? 'is-added' : ''}`} onClick={handleAdd}>
          {added ? '✓ Añadida' : '+ Añadir'}
        </button>
      </div>
    </article>
  )
}

export default function Burgers() {
  const { add } = useOrder()
  const env = useGraphicsEnv()
  // Lo elegido en cada burger (tipo de carne, halal) vive aquí para que el visor 3D lo respete
  const [selections, setSelections] = useState({})
  const [viewerIndex, setViewerIndex] = useState(null)

  const selectionOf = (b) => selections[b.id] || DEFAULT_SELECTION
  const select = (b, patch) => setSelections((s) => ({ ...s, [b.id]: { ...selectionOf(b), ...patch } }))
  const addBurger = (b) => {
    const detail = detailFor(b, selectionOf(b))
    add({ key: itemKey(b.id, detail), name: b.name, detail, unitPrice: b.price })
  }

  const viewerBurgers = BURGERS.filter((b) => hasRecipe(b.id))

  return (
    <Section id="burgers" kicker="01 — La plancha" title="Burgers" note={`${BURGER_NOTE}. Carne doble smash 2×90 g o poco hecha 180 g, mismo precio.`}>
      <div className="grid">
        {BURGERS.map((b, i) => (
          <BurgerCard
            key={b.id}
            burger={b}
            index={i}
            selection={selectionOf(b)}
            onSelect={(patch) => select(b, patch)}
            onAdd={() => addBurger(b)}
            env={env}
            viewerOpen={viewerIndex !== null}
            onOpen3D={() => setViewerIndex(viewerBurgers.findIndex((x) => x.id === b.id))}
          />
        ))}
      </div>
      {viewerIndex !== null && env && (
        <BurgerFullscreen
          burgers={viewerBurgers}
          index={viewerIndex}
          onIndex={setViewerIndex}
          env={env}
          selectionLabelOf={(b) => detailFor(b, selectionOf(b)).join(' · ') || 'Normal'}
          onAdd={addBurger}
          onClose={() => setViewerIndex(null)}
        />
      )}
    </Section>
  )
}
