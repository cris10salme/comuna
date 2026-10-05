import { useRef, useState } from 'react'
import { INGREDIENTS, estimatePrice, recipeFromIds } from '../data/ingredients'
import { BUSINESS } from '../data/business'
import { money, price } from '../lib/format'
import { itemKey, useOrder } from '../lib/order'
import Section from './Section'
import BurgerStage, { useGraphicsEnv } from './BurgerStage'
import BurgerFullscreen from './BurgerFullscreen'
import OrderActions from './OrderActions'

const MAX_INPUT = 300
const EXAMPLES = [
  'Algo dulce y salado a la vez',
  'Mucho queso y mucho bacon',
  'Pollo crujiente con algo de picante',
  'Ahumada y potente, para un hambre seria',
]

function smsText(design, labels, estimate) {
  return [
    `Hola ${BUSINESS.name}, quiero pedir una burger personalizada diseñada en vuestra web:`,
    '',
    `«${design.nombre_creativo}»`,
    `Pan, ${labels.join(', ')}, pan.`,
    '',
    `Precio orientativo: ${money(estimate.price)} (me lo confirmáis).`,
  ].join('\n')
}

export default function Designer() {
  const env = useGraphicsEnv()
  const { add } = useOrder()
  const [antojo, setAntojo] = useState('')
  const [state, setState] = useState({ status: 'idle' }) // idle | loading | done | error
  const [viewerOpen, setViewerOpen] = useState(false)
  const [added, setAdded] = useState(false)
  const resultRef = useRef(null)
  const counter = useRef(0)

  const submit = async (text) => {
    const value = (text ?? antojo).trim()
    if (value.length < 3 || state.status === 'loading') return
    setAntojo(value)
    setState({ status: 'loading' })
    setAdded(false)
    try {
      const res = await fetch('/api/disena', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ antojo: value }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !Array.isArray(data.capas)) {
        setState({ status: 'error', message: data.error || 'No hemos podido diseñarla. Prueba otra vez.' })
        return
      }
      const ids = data.capas.filter((id) => INGREDIENTS[id])
      counter.current += 1
      setState({ status: 'done', design: data, ids, key: counter.current })
      requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
    } catch {
      setState({ status: 'error', message: 'Sin conexión. Revisa tu internet y prueba otra vez.' })
    }
  }

  const done = state.status === 'done'
  const design = done ? state.design : null
  const labels = done ? state.ids.map((id) => INGREDIENTS[id].label) : []
  const estimate = done ? estimatePrice(state.ids) : null
  const burger = done
    ? {
        id: `ia-${state.key}`,
        name: design.nombre_creativo,
        price: estimate.price,
        estimated: true,
        kicker: 'Diseñada con IA',
        ingredients: labels,
        recipe: recipeFromIds(state.ids),
      }
    : null

  const addToOrder = () => {
    add({
      key: itemKey('ia', state.ids),
      name: `Burger «${design.nombre_creativo}»`,
      detail: [labels.join(', '), 'Personalizada · precio orientativo'],
      unitPrice: estimate.price,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1400)
  }

  return (
    <Section
      id="disena"
      kicker="Nuevo — Con IA"
      title="Diseña tu burger"
      note="Cuéntanos qué te apetece y te proponemos una burger solo con ingredientes de nuestra carta."
    >
      <form
        className="ticket designer"
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
      >
        <label className="designer__label" htmlFor="antojo">¿Qué te apetece hoy?</label>
        <textarea
          id="antojo"
          className="designer__input"
          value={antojo}
          maxLength={MAX_INPUT}
          rows={3}
          placeholder="Ej.: algo dulce, con queso de cabra y que cruja"
          onChange={(e) => setAntojo(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              submit()
            }
          }}
        />
        <div className="designer__examples" aria-label="Ejemplos">
          {EXAMPLES.map((ex) => (
            <button key={ex} type="button" className="chip" onClick={() => submit(ex)} disabled={state.status === 'loading'}>
              {ex}
            </button>
          ))}
        </div>
        <button type="submit" className="btn btn--primary btn--block" disabled={state.status === 'loading' || antojo.trim().length < 3}>
          {state.status === 'loading' ? 'Pensando la receta…' : 'Diseñar mi burger'}
        </button>
        {state.status === 'error' && <p className="designer__error" role="alert">{state.message}</p>}
        <p className="designer__fineprint">
          Lo que escribas se envía a un servicio de IA (Anthropic) para crear la receta. No incluyas datos personales.
        </p>
      </form>

      <div ref={resultRef} aria-live="polite">
        {done && (
          <article className="ticket burger designer__result">
            <BurgerStage key={burger.id} burger={burger} env={env} paused={viewerOpen} onOpen={() => setViewerOpen(true)} />
            <div className="ticket__top">
              <span className="ticket__num">Diseñada con IA</span>
              <span className="ticket__tag">Para ti</span>
            </div>
            <h3 className="burger__name">{design.nombre_creativo}</h3>
            <p className="designer__desc">{design.descripcion_breve}</p>
            <ul className="burger__ingredients">
              {labels.map((l, i) => (
                <li key={i}>{l}</li>
              ))}
            </ul>
            <div className="designer__price">
              <span className="ticket__price"><small>≈</small>{price(estimate.price)}<small>€</small></span>
              <small>
                Precio orientativo, como la {estimate.like}. Te lo confirmamos al llamar.
              </small>
            </div>
            <OrderActions text={smsText(design, labels, estimate)} />
            <div className="designer__more">
              <button type="button" className={`btn btn--add ${added ? 'is-added' : ''}`} onClick={addToOrder}>
                {added ? '✓ En tu comanda' : '+ Añadir a mi comanda'}
              </button>
              <button type="button" className="designer__retry" onClick={() => submit()}>
                Otra idea
              </button>
            </div>
          </article>
        )}
      </div>

      {viewerOpen && burger && env && (
        <BurgerFullscreen
          burgers={[burger]}
          index={0}
          onIndex={() => {}}
          env={env}
          selectionLabelOf={() => 'Precio orientativo'}
          onAdd={addToOrder}
          onClose={() => setViewerOpen(false)}
        />
      )}
    </Section>
  )
}
