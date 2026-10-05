import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { RECIPES } from '../three/recipes'
import { graphicsTier, prefersReducedMotion } from '../lib/device'

// El 3D (three.js) se descarga aparte y solo cuando hace falta: la carta aparece al instante.
const BurgerViewer = lazy(() => import('../three/BurgerViewer'))

const LAYER_COLORS = {
  bunBottom: '#c98a43',
  bunTop: '#b8661f',
  patty: '#4a2412',
  chicken: '#c98a3a',
  cheese: '#f39a1e',
  sauce: '#e2853a',
  jam: '#4a1a2c',
  lettuce: '#86b83c',
  bacon: '#8e2a1c',
  onionDiced: '#efe6cf',
  onionCrispy: '#b86b22',
  onionCaramel: '#7a3a12',
  pickles: '#5d7a2a',
  goatRound: '#efe9db',
}

// Versión ligera sin WebGL: la misma idea de capas con CSS.
function FlatStack({ recipe, exploded }) {
  const layers = [...recipe].reverse()
  return (
    <div className={`flatstack ${exploded ? 'is-exploded' : ''}`}>
      {layers.map((l, i) => (
        <div key={i} className={`flatstack__layer flatstack__layer--${l.type}`} style={{ '--c': LAYER_COLORS[l.type], '--i': i }}>
          <span className="flatstack__label">{l.label}</span>
        </div>
      ))}
    </div>
  )
}

// true cuando el elemento está cerca de la pantalla (y se queda en true): ahí empieza la descarga.
function useNearViewport(ref) {
  const [near, setNear] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || near) return
    if (!('IntersectionObserver' in window)) return setNear(true)
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: '250px 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [ref, near])
  return near
}

export function hasRecipe(id) {
  return Boolean(RECIPES[id])
}

export default function BurgerStage({ burgerId, name }) {
  const recipe = RECIPES[burgerId]
  const [exploded, setExploded] = useState(false)
  const [env, setEnv] = useState(null)
  const ref = useRef(null)
  const near = useNearViewport(ref)

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    const update = () => setEnv({ tier: graphicsTier(), reducedMotion: prefersReducedMotion() })
    update()
    mq?.addEventListener?.('change', update)
    return () => mq?.removeEventListener?.('change', update)
  }, [])

  if (!recipe) return null

  return (
    <button
      ref={ref}
      type="button"
      className="viewer"
      onClick={() => setExploded((e) => !e)}
      aria-pressed={exploded}
      aria-label={`${exploded ? 'Montar' : 'Desmontar'} la ${name} para ver sus capas`}
    >
      <span className="viewer__bokeh" aria-hidden="true" />
      {env && near && (env.tier === 'off' ? (
        <FlatStack recipe={recipe} exploded={exploded} />
      ) : (
        <Suspense fallback={<span className="viewer__loading">Encendiendo la plancha…</span>}>
          <BurgerViewer recipe={recipe} exploded={exploded} tier={env.tier} reducedMotion={env.reducedMotion} />
        </Suspense>
      ))}
      <span className="viewer__hint" aria-hidden="true">
        {exploded ? 'Toca para montarla' : 'Toca para desmontarla'}
      </span>
    </button>
  )
}
