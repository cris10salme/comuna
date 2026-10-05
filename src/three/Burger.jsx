import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import { LAYERS } from './layers'

export const ROW_SPACING = 2.7 // distancia entre piezas en el despiece horizontal
const GAP = 0.44 // separación extra entre capas en el despiece vertical
const STAGGER = 0.055 // retardo entre capas (s)
const TAU = Math.PI * 2
const tmp = new THREE.Vector3()

// Posición de cada capa en el despiece horizontal: en fila, en el orden en que se monta la burger
// (pan de abajo a la izquierda, pan de arriba a la derecha).
export const rowX = (i, n) => (i - (n - 1) / 2) * ROW_SPACING

// Pila de capas que se monta y desmonta.
//   mode: 'assembled' | 'vertical' | 'horizontal'
// Cada capa sigue un muelle propio hacia su objetivo (0 = montada, 1 = desmontada) con un pequeño
// retardo escalonado; si se cambia a mitad de animación, el muelle cambia de objetivo sin saltos.
// La cámara NO se toca aquí: la controla el visor que use este componente.
export default function Burger({
  recipe,
  mode = 'assembled',
  focus = 0,
  quality = 1,
  reducedMotion = false,
  autoRotate = false,
  labelEls, // ref a un array de elementos DOM (fuera del canvas) que se colocan sobre cada capa
  onSettled,
  onLayerTap,
}) {
  const n = recipe.length
  const exploded = mode !== 'assembled'
  const lastExplodedMode = useRef(mode === 'assembled' ? 'vertical' : mode)
  if (exploded) lastExplodedMode.current = mode

  const layout = useMemo(() => {
    let y = 0
    const items = recipe.map((layer, i) => {
      const def = LAYERS[layer.type]
      const item = {
        ...layer,
        def,
        assembledY: y,
        explodedY: y + i * GAP,
        tiltX: (i % 2 ? 1 : -1) * 0.1 + 0.08,
        tiltZ: (((i * 7) % 3) - 1) * 0.1,
        spin: (i % 2 ? 1 : -1) * 0.5,
        rowX: rowX(i, n),
      }
      y += def.height
      return item
    })
    return { items, assembledH: y, explodedH: y + (n - 1) * GAP }
  }, [recipe, n])

  const spinRef = useRef()
  const shadowRef = useRef()
  const layerRefs = useRef([])
  const sim = useRef(null)
  if (!sim.current) {
    sim.current = {
      p: new Float32Array(n),
      v: new Float32Array(n),
      goal: new Float32Array(n),
      switchAt: new Float32Array(n),
      selfSpin: new Float32Array(n),
      target: 0,
      clock: 0,
      settled: true,
    }
  }

  useEffect(() => {
    const s = sim.current
    s.target = exploded ? 1 : 0
    s.settled = false
    for (let i = 0; i < n; i++) {
      // Desmontar: de arriba abajo. Montar: de abajo arriba.
      const order = exploded ? n - 1 - i : i
      s.switchAt[i] = s.clock + (reducedMotion ? 0 : order * STAGGER)
    }
  }, [exploded, n, reducedMotion])

  useFrame((state, delta) => {
    const s = sim.current
    const dt = Math.min(delta, 1 / 30)
    s.clock += dt
    const k = reducedMotion ? 260 : 90
    const c = reducedMotion ? 2 * Math.sqrt(k) : 11.5 // con movimiento: ligeramente elástico
    let avg = 0
    let moving = false
    for (let i = 0; i < n; i++) {
      if (s.clock >= s.switchAt[i]) s.goal[i] = s.target
      const acc = k * (s.goal[i] - s.p[i]) - c * s.v[i]
      s.v[i] += acc * dt
      s.p[i] += s.v[i] * dt
      if (Math.abs(s.v[i]) > 0.002 || Math.abs(s.goal[i] - s.p[i]) > 0.002) moving = true
      avg += s.p[i]
    }
    avg /= n

    const { items, assembledH, explodedH } = layout
    const t = state.clock.elapsedTime
    const horizontal = lastExplodedMode.current === 'horizontal'
    const centre = horizontal ? assembledH / 2 : (assembledH + (explodedH - assembledH) * avg) / 2

    for (let i = 0; i < n; i++) {
      const it = items[i]
      const p = s.p[i]
      const pc = Math.max(0, Math.min(1, p))
      const float = reducedMotion ? 0 : Math.sin(t * 1.3 + i * 0.9) * 0.035 * pc
      const obj = layerRefs.current[i]
      const baseY = it.assembledY - centre
      let x = 0
      let y
      let rotX
      let rotZ
      let rotY
      if (horizontal) {
        // Salta en arco hasta su sitio en la fila y se inclina hacia la cámara para enseñar su cara
        x = it.rowX * p
        y = baseY * (1 - p) + (-it.def.height / 2) * p + Math.sin(pc * Math.PI) * 0.7 + float
        rotX = 0.55 * p
        rotZ = 0
        const isFocus = i === focus
        if (!reducedMotion) s.selfSpin[i] += dt * (isFocus ? 0.45 : 0.15) * pc
        rotY = s.selfSpin[i]
      } else {
        y = baseY + i * GAP * p + float
        rotX = it.tiltX * p
        rotZ = it.tiltZ * p
        rotY = it.spin * p
        s.selfSpin[i] *= 1 - Math.min(1, dt * 4)
      }
      if (obj) {
        obj.position.set(x, y, 0)
        obj.rotation.set(rotX, rotY, rotZ)
        // La pieza enfocada en el despiece horizontal se ve un poco más grande
        const sc = horizontal ? 1 + (i === focus ? 0.12 : -0.08) * pc : 1
        obj.scale.setScalar(obj.scale.x + (sc - obj.scale.x) * Math.min(1, dt * 8))
      }
      const label = labelEls?.current?.[i]
      if (label) {
        // Proyectamos el ancla de la etiqueta a píxeles de pantalla
        if (horizontal) tmp.set(it.rowX, -1.05, 0)
        else tmp.set(1.3, y + it.def.height * 0.5, 0)
        tmp.project(state.camera)
        const px = (tmp.x * 0.5 + 0.5) * state.size.width
        const py = (-tmp.y * 0.5 + 0.5) * state.size.height
        label.style.transform = horizontal ? `translate(${px}px, ${py}px) translate(-50%, 0)` : `translate(${px}px, ${py}px) translate(0, -50%)`
        const vis = Math.max(0, Math.min(1, (p - 0.55) * 3))
        label.style.opacity = horizontal ? vis * (i === focus ? 1 : 0.45) : vis
        label.dataset.focus = horizontal && i === focus ? 'true' : 'false'
      }
    }

    // Giro lento (solo en la vista previa de la carta). Al desmontar vuelve de cara a la cámara.
    if (spinRef.current) {
      const r = spinRef.current.rotation
      if (autoRotate && !reducedMotion && avg < 0.5) r.y += dt * 0.35
      else if (avg > 0.01) r.y += ((Math.round(r.y / TAU) * TAU) - r.y) * Math.min(1, dt * 5)
    }
    if (shadowRef.current) {
      shadowRef.current.position.y = horizontal ? -0.95 : -centre - 0.02 - avg * 0.25
    }

    if (!moving && !s.settled) {
      s.settled = true
      onSettled?.()
    }
  })

  const rowWidth = n * ROW_SPACING + 2

  return (
    <group>
      <group ref={spinRef}>
        {layout.items.map((it, i) => {
          const { Component } = it.def
          return (
            <group
              key={i}
              ref={(el) => (layerRefs.current[i] = el)}
              onClick={
                onLayerTap
                  ? (e) => {
                      e.stopPropagation()
                      onLayerTap(i)
                    }
                  : undefined
              }
            >
              <Component q={quality} kind={it.kind} seed={it.seed} />
            </group>
          )
        })}
      </group>
      <ContactShadows
        ref={shadowRef}
        opacity={0.7}
        scale={lastExplodedMode.current === 'horizontal' ? [rowWidth, 5] : 5}
        blur={2.6}
        far={1.6}
        resolution={quality >= 1 ? 1024 : 512}
        color="#000000"
        frames={Infinity}
      />
    </group>
  )
}
