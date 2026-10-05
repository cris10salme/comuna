import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { price } from '../lib/format'
import { RECIPES } from '../three/recipes'
import FlatStack from './FlatStack'

const FullscreenScene = lazy(() => import('../three/FullscreenScene'))

const SWIPE_PX = 45 // arrastre mínimo para pasar de ingrediente

// Visor a pantalla completa de una burger: montada se gira con el dedo y se acerca pellizcando;
// en "Despiece" los ingredientes se ponen en fila y se recorren deslizando de lado a lado.
export default function BurgerFullscreen({ burgers, index, onIndex, env, selectionLabelOf, onAdd, onClose }) {
  const burger = burgers[index]
  const recipe = burger.recipe || RECIPES[burger.id]
  const n = recipe.length
  const [mode, setMode] = useState('assembled')
  const [focus, setFocus] = useState(0)
  const [touched, setTouched] = useState(false)
  const [added, setAdded] = useState(false)
  const dragRef = useRef(0)
  const swipe = useRef(null)
  const lastDragAt = useRef(0)
  const openedAt = useRef(0)
  const panelRef = useRef(null)
  const labelEls = useRef([])
  const closeRef = useRef(onClose)
  closeRef.current = onClose

  const exploded = mode !== 'assembled'
  const go = useCallback((i) => setFocus(Math.max(0, Math.min(n - 1, i))), [n])

  // Cambiar de burger: vuelve a verse montada
  const goBurger = (i) => {
    const next = (i + burgers.length) % burgers.length
    onIndex(next)
    setMode('assembled')
    setFocus(0)
  }

  // El botón "atrás" del móvil cierra el visor en vez de salir de la web
  useEffect(() => {
    window.history.pushState({ burgerViewer: true }, '')
    const onPop = () => closeRef.current()
    window.addEventListener('popstate', onPop)
    document.body.classList.add('no-scroll')
    return () => {
      window.removeEventListener('popstate', onPop)
      document.body.classList.remove('no-scroll')
    }
  }, [])

  const close = () => {
    if (window.history.state?.burgerViewer) window.history.back()
    else onClose()
  }

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') close()
      if (exploded && e.key === 'ArrowRight') go(focus + 1)
      if (exploded && e.key === 'ArrowLeft') go(focus - 1)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  })

  useEffect(() => panelRef.current?.focus(), [])

  // Deslizar en el despiece: la cámara sigue al dedo y al soltar salta a la pieza siguiente/anterior
  const onPointerDown = (e) => {
    setTouched(true)
    swipe.current = { x: e.clientX, y: e.clientY, w: e.currentTarget.clientWidth, moved: false, layerTapped: false }
  }
  const onPointerMove = (e) => {
    const s = swipe.current
    if (!s) return
    const dx = e.clientX - s.x
    if (Math.hypot(dx, e.clientY - s.y) > 8) s.moved = true
    if (mode === 'horizontal') dragRef.current = dx / s.w
  }
  const onPointerUp = (e) => {
    const s = swipe.current
    swipe.current = null
    dragRef.current = 0
    if (!s) return
    const dx = e.clientX - s.x
    if (s.moved) lastDragAt.current = performance.now()
    if (mode === 'horizontal') {
      if (dx < -SWIPE_PX) go(focus + 1)
      else if (dx > SWIPE_PX) go(focus - 1)
      return
    }
    // Un toque (sin arrastrar) sobre la burger montada la abre de lado. Si el toque cayó sobre un
    // ingrediente concreto, onLayerTap ya ha elegido cuál enfocar.
    if (!s.moved && !s.layerTapped) {
      openedAt.current = performance.now()
      setFocus(0)
      setMode('horizontal')
    }
  }

  const onLayerTap = (i) => {
    if (swipe.current) swipe.current.layerTapped = true
    // Un arrastre (girar o deslizar) no cuenta como toque
    const now = performance.now()
    // Ni un arrastre ni el mismo toque que acaba de abrir la fila cuentan como "tocar una pieza"
    if (swipe.current?.moved || now - lastDragAt.current < 350 || now - openedAt.current < 400) return
    // Montada: se abre siempre desde el primer ingrediente, en el orden en que se monta.
    // En la fila: tocar una pieza la enfoca.
    if (mode === 'assembled') {
      openedAt.current = now
      setFocus(0)
      setMode('horizontal')
    } else setFocus(i)
  }

  const toggleMode = (m) => {
    setMode(m)
    if (m === 'horizontal') setFocus(0)
  }

  const handleAdd = () => {
    onAdd(burger)
    setAdded(true)
    setTimeout(() => setAdded(false), 1400)
  }

  const hint = exploded
    ? 'Desliza para ver cada ingrediente'
    : 'Toca la burger para abrirla · arrastra para girarla'

  return createPortal(
    <div className="fs" role="dialog" aria-modal="true" aria-label={`${burger.name} en 3D`}>
      <div className="fs__bg" aria-hidden="true">
        <span className="fs__bokeh fs__bokeh--1" />
        <span className="fs__bokeh fs__bokeh--2" />
        <span className="fs__bokeh fs__bokeh--3" />
      </div>

      <header className="fs__top">
        <span className="fs__brand">LA COMUNA <em>3D</em></span>
        <button className="fs__close" onClick={close} aria-label="Cerrar visor">×</button>
      </header>

      <div
        className={`fs__stage ${mode === 'horizontal' ? 'is-row' : ''}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {env.tier === 'off' ? (
          <FlatStack recipe={recipe} exploded={exploded} />
        ) : (
          <Suspense fallback={<span className="viewer__loading">Encendiendo la plancha…</span>}>
            <FullscreenScene
              burgerId={burger.id}
              recipe={recipe}
              mode={mode}
              focus={focus}
              dragRef={dragRef}
              labelEls={labelEls}
              tier={env.tier}
              reducedMotion={env.reducedMotion}
              onLayerTap={onLayerTap}
              onInteract={() => setTouched(true)}
            />
          </Suspense>
        )}
        {env.tier !== 'off' && (
          <div className="fs__labels" aria-hidden="true">
            {recipe.map((l, i) => (
              <span key={i} className="layer-label layer-label--row" ref={(el) => (labelEls.current[i] = el)} style={{ opacity: 0 }}>
                {l.label}
              </span>
            ))}
          </div>
        )}
        <p className={`fs__hint ${touched && !exploded ? 'is-hidden' : ''}`} aria-hidden="true">{hint}</p>
      </div>

      <section className="fs__panel ticket" ref={panelRef} tabIndex={-1} aria-label="Detalles y pedido">
        <div className="fs__head">
          {burgers.length > 1 ? (
            <button className="fs__arrow fs__arrow--small" onClick={() => goBurger(index - 1)} aria-label="Burger anterior">‹</button>
          ) : (
            <span />
          )}
          <div className="fs__title">
            <small>{burger.kicker || `${index + 1} / ${burgers.length}`}</small>
            <h2 className="fs__name" aria-live="polite">{burger.name}</h2>
          </div>
          <span className="fs__price">{burger.estimated && <small>≈</small>}{price(burger.price)}<small>€</small></span>
          {burgers.length > 1 ? (
            <button className="fs__arrow fs__arrow--small" onClick={() => goBurger(index + 1)} aria-label="Burger siguiente">›</button>
          ) : (
            <span />
          )}
        </div>

        <div className="segmented fs__modes" role="radiogroup" aria-label="Vista">
          {[
            ['assembled', 'Montada'],
            ['horizontal', 'Ingredientes'],
          ].map(([m, label]) => (
            <button key={m} role="radio" aria-checked={mode === m} className={mode === m ? 'on' : ''} onClick={() => toggleMode(m)}>
              {label}
            </button>
          ))}
        </div>

        {exploded ? (
          <div className="fs__pager">
            <button className="fs__arrow" onClick={() => go(focus - 1)} disabled={focus === 0} aria-label="Ingrediente anterior">‹</button>
            <div className="fs__current" aria-live="polite">
              <small>Ingrediente {focus + 1} de {n}</small>
              <strong>{recipe[focus].label}</strong>
              <p>{recipe[focus].info}</p>
            </div>
            <button className="fs__arrow" onClick={() => go(focus + 1)} disabled={focus === n - 1} aria-label="Ingrediente siguiente">›</button>
          </div>
        ) : (
          <p className="fs__ingredients">{burger.ingredients.join(' · ')}</p>
        )}

        <div className="fs__order">
          <button className={`btn btn--primary btn--block ${added ? 'is-added' : ''}`} onClick={handleAdd}>
            {added ? '✓ Añadida a tu comanda' : '+ Añadir al pedido'}
          </button>
          <small>{burger.estimated ? 'Precio orientativo: te lo confirmamos al llamar' : `${selectionLabelOf(burger)} · puedes cambiarlo en la carta`}</small>
        </div>
      </section>
    </div>,
    document.body,
  )
}
