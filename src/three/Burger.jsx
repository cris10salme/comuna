import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { ContactShadows, Html } from '@react-three/drei'
import { LAYERS } from './layers'

const GAP = 0.44 // separación extra entre capas al desmontar
const STAGGER = 0.055 // retardo entre capas (s)

// Pila de capas con vista explosionada. Cada capa sigue un muelle propio hacia su objetivo
// (0 = montada, 1 = desmontada), con un pequeño retardo escalonado: al desmontar sale primero el
// pan de arriba; al montar, cae primero el de abajo. Si se toca a mitad de animación, el muelle
// simplemente cambia de objetivo, sin saltos.
export default function Burger({ recipe, exploded, quality = 1, reducedMotion = false, onSettled }) {
  const n = recipe.length

  const layout = useMemo(() => {
    let y = 0
    const items = recipe.map((layer, i) => {
      const def = LAYERS[layer.type]
      const item = {
        ...layer,
        def,
        assembledY: y,
        explodedY: y + i * GAP,
        // "Juguete desmontado": cada pieza se ladea y se desplaza un poco, alternando lados
        tiltX: (i % 2 ? 1 : -1) * 0.1 + 0.08, // inclinadas hacia cámara: se ve la cara de cada ingrediente
        tiltZ: ((i * 7) % 3 - 1) * 0.1,
        spin: (i % 2 ? 1 : -1) * 0.5,
      }
      y += def.height
      return item
    })
    const assembledH = y
    const explodedH = y + (n - 1) * GAP
    return { items, assembledH, explodedH }
  }, [recipe, n])

  const spinRef = useRef()
  const stackRef = useRef()
  const shadowRef = useRef()
  const layerRefs = useRef([])
  const labelRefs = useRef([])
  const labelGroupRefs = useRef([])
  const sim = useRef(null)
  if (!sim.current) {
    sim.current = { p: new Float32Array(n), v: new Float32Array(n), goal: new Float32Array(n), switchAt: new Float32Array(n), target: 0, clock: 0, settled: true }
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
    const k = reducedMotion ? 260 : 95
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
    const centre = (assembledH + (explodedH - assembledH) * avg) / 2

    for (let i = 0; i < n; i++) {
      const it = items[i]
      const p = s.p[i]
      const float = reducedMotion ? 0 : Math.sin(t * 1.3 + i * 0.9) * 0.035 * Math.max(0, p)
      const y = it.assembledY + (it.explodedY - it.assembledY) * p + float - centre
      const obj = layerRefs.current[i]
      if (obj) {
        obj.position.y = y
        obj.rotation.x = it.tiltX * p
        obj.rotation.z = it.tiltZ * p
        obj.rotation.y = it.spin * p
      }
      const labelGroup = labelGroupRefs.current[i]
      if (labelGroup) labelGroup.position.y = y + it.def.height * 0.5
      const label = labelRefs.current[i]
      if (label) label.style.opacity = Math.max(0, Math.min(1, (p - 0.55) * 3))
    }

    // Cuando está desmontada se aparta a la izquierda para dejar sitio a las etiquetas
    if (stackRef.current) stackRef.current.position.x = -0.85 * avg
    // Giro lento cuando está montada; casi quieta cuando está desmontada
    if (spinRef.current && !reducedMotion) spinRef.current.rotation.y += dt * (0.35 - 0.27 * avg)
    if (shadowRef.current) shadowRef.current.position.y = -centre - 0.02 - avg * 0.25

    // Cámara: se aleja lo justo para que quepa la pila (y las etiquetas) en el visor
    const cam = state.camera
    const tanHalf = Math.tan((cam.fov * Math.PI) / 360)
    const halfH = (assembledH + (explodedH - assembledH) * avg) / 2 + 0.45
    const halfW = 1.3 + avg * 1.15
    const dist = Math.max(halfH / tanHalf, halfW / (tanHalf * cam.aspect)) * 1.04 + 1.1
    cam.position.set(0, dist * (0.36 - avg * 0.12), dist)
    cam.lookAt(0, -0.05, 0)

    if (!moving && !s.settled) {
      s.settled = true
      onSettled?.()
    }
  })

  return (
    <group>
      <group ref={stackRef}>
        <group ref={spinRef}>
          {layout.items.map((it, i) => {
            const { Component } = it.def
            return (
              <group key={i} ref={(el) => (layerRefs.current[i] = el)}>
                <Component q={quality} kind={it.kind} seed={it.seed} />
              </group>
            )
          })}
        </group>
        {layout.items.map((it, i) => (
          <group key={`l${i}`} position-x={1.3} ref={(el) => (labelGroupRefs.current[i] = el)}>
            <Html zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}>
              <span className="layer-label" ref={(el) => (labelRefs.current[i] = el)} style={{ opacity: 0 }}>
                {it.label}
              </span>
            </Html>
          </group>
        ))}
      </group>
      <ContactShadows
        ref={shadowRef}
        opacity={0.75}
        scale={5}
        blur={2.6}
        far={1.6}
        resolution={quality >= 1 ? 512 : 256}
        color="#000000"
        frames={Infinity}
      />
    </group>
  )
}
