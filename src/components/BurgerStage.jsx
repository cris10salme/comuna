import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { RECIPES } from '../three/recipes'
import { graphicsTier, prefersReducedMotion } from '../lib/device'
import FlatStack from './FlatStack'
import BurgerFullscreen from './BurgerFullscreen'

// El 3D (three.js) se descarga aparte y solo cuando hace falta: la carta aparece al instante.
const BurgerViewer = lazy(() => import('../three/BurgerViewer'))

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

// Vista previa en la tarjeta. Al tocarla se abre el visor a pantalla completa.
export default function BurgerStage({ burger, selectionLabel, onAdd }) {
  const recipe = RECIPES[burger.id]
  const env = useGraphicsEnv()
  const ref = useRef(null)
  const near = useNearViewport(ref)
  const [open, setOpen] = useState(false)

  if (!recipe) return null

  return (
    <>
      <button
        ref={ref}
        type="button"
        className="viewer"
        onClick={() => setOpen(true)}
        aria-label={`Ver la ${burger.name} en 3D a pantalla completa`}
      >
        <span className="viewer__bokeh" aria-hidden="true" />
        {env && near && (env.tier === 'off' ? (
          <FlatStack recipe={recipe} exploded={false} />
        ) : (
          <Suspense fallback={<span className="viewer__loading">Encendiendo la plancha…</span>}>
            <BurgerViewer recipe={recipe} tier={env.tier} reducedMotion={env.reducedMotion} paused={open} />
          </Suspense>
        ))}
        <span className="viewer__hint" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="15" height="15"><path fill="currentColor" d="M4 4h6v2H6v4H4zm10 0h6v6h-2V6h-4zM4 14h2v4h4v2H4zm14 4v-4h2v6h-6v-2z" /></svg>
          Ver en 3D
        </span>
      </button>
      {open && env && (
        <BurgerFullscreen
          burger={burger}
          recipe={recipe}
          env={env}
          selectionLabel={selectionLabel}
          onAdd={onAdd}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
