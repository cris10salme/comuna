import { useMemo } from 'react'
import * as THREE from 'three'
import {
  baconGeometry,
  blobGeometry,
  bunBottomGeometry,
  bunTopGeometry,
  cheeseGeometry,
  dripGeometry,
  lettuceGeometry,
  pattyGeometry,
  scatter,
} from './geometry'
import {
  baconTextures,
  bunBottomTextures,
  bunTopTextures,
  chickenTextures,
  goatRoundTextures,
  pattyTextures,
  pickleTextures,
} from './textures'

// Sistema de capas reutilizable. Cada capa:
//  - es un componente que dibuja el ingrediente centrado en y=0 (su base)
//  - declara `height`: lo que ocupa en la pila montada
// Las recetas (recipes.js) solo combinan capas; aquí no se sabe nada de burgers concretas.

const texSize = (q) => (q >= 1 ? 512 : 256)

export const SAUCE_COLORS = {
  comuna: '#e2853a',
  hakimi: '#b4401c',
  barbacoa: '#4e1b0c',
  ketchup: '#a8170f',
  mostaza: '#d6a118',
  mayonesa: '#f2e6c2',
  'mayo-bacon': '#e3be8f',
  'mayo-trufa': '#d8c69c',
}

export const CHEESES = {
  cheddar: { color: '#f5a01a', melt: 1 },
  ahumado: { color: '#d7822f', melt: 0.85 },
  curado: { color: '#efd38a', melt: 0.25 },
  cabra: { color: '#f5f0e4', melt: 0.6 },
}

export const JAMS = {
  higo: '#4a1a2c',
  bacon: '#4a1a0b',
}

function BunTop({ q }) {
  const geo = useMemo(() => bunTopGeometry(q), [q])
  const tex = bunTopTextures(texSize(q))
  return (
    <mesh geometry={geo} castShadow receiveShadow>
      <meshPhysicalMaterial
        map={tex.map}
        bumpMap={tex.bumpMap}
        bumpScale={2.2}
        roughness={0.46}
        clearcoat={0.6}
        clearcoatRoughness={0.32}
        sheen={0.25}
        sheenColor="#ffb870"
      />
    </mesh>
  )
}

function BunBottom({ q }) {
  const geo = useMemo(() => bunBottomGeometry(q), [q])
  const tex = bunBottomTextures(texSize(q))
  return (
    <mesh geometry={geo} castShadow receiveShadow>
      <meshPhysicalMaterial map={tex.map} bumpMap={tex.bumpMap} bumpScale={3} roughness={0.7} clearcoat={0.2} clearcoatRoughness={0.5} />
    </mesh>
  )
}

function Patty({ q, seed = 1 }) {
  const geo = useMemo(() => pattyGeometry(q, 1.14, 0.2, seed), [q, seed])
  const tex = pattyTextures(texSize(q))
  return (
    <mesh geometry={geo} position-y={0.1} castShadow receiveShadow>
      <meshPhysicalMaterial
        vertexColors
        map={tex.map}
        bumpMap={tex.bumpMap}
        bumpScale={7}
        roughness={0.55}
        clearcoat={0.55}
        clearcoatRoughness={0.32}
      />
    </mesh>
  )
}

function Chicken({ q, seed = 1 }) {
  const geo = useMemo(() => pattyGeometry(q, 1.08, 0.24, seed + 40), [q, seed])
  const tex = chickenTextures(texSize(q))
  return (
    <mesh geometry={geo} position-y={0.12} castShadow receiveShadow>
      <meshStandardMaterial vertexColors map={tex.map} bumpMap={tex.bumpMap} bumpScale={8} roughness={0.7} />
    </mesh>
  )
}

function Cheese({ q, kind = 'cheddar', seed = 1 }) {
  const { color, melt } = CHEESES[kind]
  const geo = useMemo(() => cheeseGeometry(q, { melt, seed }), [q, melt, seed])
  const drip = useMemo(() => dripGeometry(q), [q])
  const mat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color,
        roughness: 0.24,
        clearcoat: 1,
        clearcoatRoughness: 0.06,
        sheen: 0.6,
        sheenColor: new THREE.Color(color).offsetHSL(0, 0.1, 0.12),
        emissive: new THREE.Color(color),
        emissiveIntensity: 0.14, // finge la luz que atraviesa el queso fundido
        side: THREE.DoubleSide,
      }),
    [color],
  )
  return (
    <group rotation-y={seed * 0.9} position-y={0.02}>
      <mesh geometry={geo} material={mat} castShadow receiveShadow />
      {geo.userData.drips.map((v, i) => (
        <mesh key={i} geometry={drip} material={mat} position={[v.x * 0.97, v.y + 0.005, v.z * 0.97]} scale={[1, 0.7 + (i % 3) * 0.25, 1]} castShadow />
      ))}
    </group>
  )
}

function Sauce({ q, kind = 'comuna', seed = 1 }) {
  const geo = useMemo(() => blobGeometry(q, { radius: 1.0, height: 0.035, seed }), [q, seed])
  const color = SAUCE_COLORS[kind]
  const mat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color,
        roughness: 0.14,
        clearcoat: 1,
        clearcoatRoughness: 0.05,
        emissive: new THREE.Color(color),
        emissiveIntensity: 0.05,
        side: THREE.DoubleSide,
      }),
    [color],
  )
  return (
    <group rotation-y={seed}>
      <mesh geometry={geo} material={mat} receiveShadow />
    </group>
  )
}

function Jam({ q, kind = 'higo', seed = 3 }) {
  const geo = useMemo(() => blobGeometry(q, { radius: 0.85, height: 0.06, seed, wobble: 0.35 }), [q, seed])
  const color = JAMS[kind]
  return (
    <mesh geometry={geo} castShadow receiveShadow>
      <meshPhysicalMaterial color={color} roughness={0.08} clearcoat={1} clearcoatRoughness={0.02} side={THREE.DoubleSide} />
    </mesh>
  )
}

function Lettuce({ q, seed = 1 }) {
  const geo = useMemo(() => lettuceGeometry(q, { seed }), [q, seed])
  return (
    <mesh geometry={geo} position-y={0.03} castShadow receiveShadow>
      <meshPhysicalMaterial
        vertexColors
        color="#86b83c"
        roughness={0.42}
        sheen={0.6}
        sheenColor="#e6ffb0"
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

function Bacon({ q, seed = 1 }) {
  const tex = baconTextures(texSize(q))
  const strips = useMemo(
    () => [0, 1, 2].map((i) => ({ geo: baconGeometry(q, { seed: seed + i * 2 }), rot: i * 1.05 + 0.3, y: i * 0.018 })),
    [q, seed],
  )
  return (
    <group position-y={0.03}>
      {strips.map((s, i) => (
        <mesh key={i} geometry={s.geo} rotation-y={s.rot} position-y={s.y} castShadow receiveShadow>
          <meshPhysicalMaterial map={tex.map} bumpMap={tex.bumpMap} bumpScale={3} roughness={0.42} clearcoat={0.5} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  )
}

// Piezas repetidas con InstancedMesh: una sola llamada de dibujo por tipo.
function Scattered({ geometry, material, points, y = 0, tilt = 0, scale = 1, pile = 0 }) {
  const mesh = useMemo(() => {
    const m = new THREE.InstancedMesh(geometry, material, points.length)
    const o = new THREE.Object3D()
    points.forEach((p, i) => {
      // `pile`: las piezas del centro quedan más altas, como un montoncito
      const centre = 1 - Math.min(1, Math.hypot(p.x, p.z) / 0.9)
      o.position.set(p.x, y + p.r2 * 0.02 + centre * pile * (0.5 + p.r2), p.z)
      o.rotation.set((p.r2 - 0.5) * tilt, p.rot, (p.s - 1) * tilt)
      o.scale.setScalar(p.s * scale)
      o.updateMatrix()
      m.setMatrixAt(i, o.matrix)
    })
    m.castShadow = true
    m.receiveShadow = true
    return m
  }, [geometry, material, points, y, tilt, scale, pile])
  return <primitive object={mesh} />
}

function OnionDiced({ q }) {
  const geo = useMemo(() => new THREE.BoxGeometry(0.07, 0.04, 0.06), [])
  const mat = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: '#f1ead6', roughness: 0.25, clearcoat: 0.8, emissive: '#f1ead6', emissiveIntensity: 0.08 }),
    [],
  )
  const pts = useMemo(() => scatter(q >= 1 ? 150 : 90, 0.85, 3), [q])
  return <Scattered geometry={geo} material={mat} points={pts} y={0.025} tilt={0.6} />
}

function OnionCrispy({ q }) {
  // Montón de aros finos y dorados, unos encima de otros
  const geo = useMemo(() => new THREE.TorusGeometry(0.085, 0.017, 5, 12, Math.PI * 1.6), [])
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#c47a2a', roughness: 0.6 }), [])
  const pts = useMemo(() => scatter(q >= 1 ? 170 : 100, 0.85, 7), [q])
  return <Scattered geometry={geo} material={mat} points={pts} y={0.04} tilt={2.8} pile={0.06} />
}

function OnionCaramel({ q }) {
  const geo = useMemo(() => new THREE.TorusGeometry(0.13, 0.028, 6, 16, Math.PI * 1.3), [])
  const mat = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: '#7a3a12', roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.1 }),
    [],
  )
  const pts = useMemo(() => scatter(q >= 1 ? 90 : 60, 0.82, 11), [q])
  return <Scattered geometry={geo} material={mat} points={pts} y={0.035} tilt={1.2} pile={0.05} />
}

function Pickles({ q }) {
  const tex = pickleTextures(256)
  const geo = useMemo(() => new THREE.CylinderGeometry(0.21, 0.21, 0.035, 24), [])
  const mat = useMemo(() => {
    const side = new THREE.MeshPhysicalMaterial({ color: '#3d5a1e', roughness: 0.3, clearcoat: 0.8 })
    const face = new THREE.MeshPhysicalMaterial({ map: tex.map, roughness: 0.2, clearcoat: 1 })
    return [side, face, face]
  }, [tex])
  const pts = useMemo(() => scatter(5, 0.62, 5, 0.4), [])
  return <Scattered geometry={geo} material={mat} points={pts} y={0.02} tilt={0.15} />
}

function GoatRound({ q }) {
  const tex = goatRoundTextures(256)
  const geo = useMemo(() => new THREE.CylinderGeometry(0.3, 0.3, 0.08, 28), [])
  const mat = useMemo(() => {
    const side = new THREE.MeshStandardMaterial({ color: '#ded7c6', roughness: 0.9 })
    const face = new THREE.MeshPhysicalMaterial({ map: tex.map, roughness: 0.55, clearcoat: 0.2 })
    return [side, face, face]
  }, [tex])
  const pts = useMemo(() => scatter(4, 0.5, 13, 0.55), [])
  return <Scattered geometry={geo} material={mat} points={pts} y={0.04} tilt={0.1} />
}

// Registro: tipo de capa -> componente + altura que ocupa en la pila montada.
export const LAYERS = {
  bunBottom: { Component: BunBottom, height: 0.31 },
  bunTop: { Component: BunTop, height: 0.72 },
  patty: { Component: Patty, height: 0.18 },
  chicken: { Component: Chicken, height: 0.24 },
  cheese: { Component: Cheese, height: 0.02 },
  sauce: { Component: Sauce, height: 0.03 },
  jam: { Component: Jam, height: 0.05 },
  lettuce: { Component: Lettuce, height: 0.07 },
  bacon: { Component: Bacon, height: 0.08 },
  onionDiced: { Component: OnionDiced, height: 0.05 },
  onionCrispy: { Component: OnionCrispy, height: 0.07 },
  onionCaramel: { Component: OnionCaramel, height: 0.07 },
  pickles: { Component: Pickles, height: 0.04 },
  goatRound: { Component: GoatRound, height: 0.08 },
}
