import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { RECIPES } from '../three/recipes'
import { graphicsTier, prefersReducedMotion } from '../lib/device'
import FlatStack from './FlatStack'

// El 3D (three.js) se descarga aparte y solo cuando hace falta: la carta aparece al instante.
const BurgerViewer = lazy(() => import('../three/BurgerViewer'))

// true mientras el elemento está cerca de la pantalla. Al alejarse se desmonta su 3D: así nunca hay
// más de 2-3 contextos WebGL vivos (Safari en iPhone limita cuántos puede haber a la vez).
function useNearViewport(ref) {
  const [near, setNear] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!('IntersectionObserver' in window)) return setNear(true)
    const io = new IntersectionObserver(([e]) => setNear(e.isIntersecting), { rootMargin: '250px 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [ref])
  return near
}

export function useGraphicsEnv() {
  const [env, setEnv] = useState(null)
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    const update = () => setEnv({ tier: graphicsTier(), reducedMotion: prefersReducedMotion() })
    update()
    mq?.addEventListener?.('change', update)
    return () => mq?.removeEventListener?.('change', update)
  }, [])
  return env
}

export function hasRecipe(id) {
  return Boolean(RECIPES[id])
}

// Vista previa en la tarjeta: la burger montada girando. Al tocarla se abre el visor a pantalla completa.
export default function BurgerStage({ burger, env, paused, onOpen }) {
  const recipe = RECIPES[burger.id]
  const ref = useRef(null)
  const near = useNearViewport(ref)
  if (!recipe) return null

  return (
    <button ref={ref} type="button" className="viewer" onClick={onOpen} aria-label={`Ver la ${burger.name} en 3D a pantalla completa`}>
      <span className="viewer__bokeh" aria-hidden="true" />
      {env && near && (env.tier === 'off' ? (
        <FlatStack recipe={recipe} exploded={false} />
      ) : (
        <Suspense fallback={<span className="viewer__loading">Encendiendo la plancha…</span>}>
          <BurgerViewer recipe={recipe} tier={env.tier} reducedMotion={env.reducedMotion} paused={paused} />
        </Suspense>
      ))}
      <span className="viewer__hint" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="15" height="15"><path fill="currentColor" d="M4 4h6v2H6v4H4zm10 0h6v6h-2V6h-4zM4 14h2v4h4v2H4zm14 4v-4h2v6h-6v-2z" /></svg>
        Ver en 3D
      </span>
    </button>
  )
}
