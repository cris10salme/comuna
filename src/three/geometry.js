import * as THREE from 'three'
import { fbm } from './textures'

// Geometrías procedurales de cada ingrediente. Unidades: radio del pan ≈ 1.
// `q` es la calidad (1 = alta, 0.5 = móvil flojo) y escala el número de segmentos.

const seg = (n, q) => Math.max(8, Math.round(n * q))
const smooth = (e0, e1, x) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)))
  return t * t * (3 - 2 * t)
}

// Ruido periódico en el ángulo (sin costura) para bordes irregulares.
const angleNoise = (a, seed, freq = 2) => fbm(Math.cos(a) * freq + 10, Math.sin(a) * freq + 10, seed)

// En un torno la primera y la última columna son los mismos puntos: promediamos sus normales para
// que no se vea una línea de costura.
function weldLatheSeam(geo, profileCount, segments) {
  const n = geo.attributes.normal
  const a = new THREE.Vector3()
  const b = new THREE.Vector3()
  for (let j = 0; j < profileCount; j++) {
    const i0 = j
    const i1 = segments * profileCount + j
    a.fromBufferAttribute(n, i0)
    b.fromBufferAttribute(n, i1)
    a.add(b).normalize()
    n.setXYZ(i0, a.x, a.y, a.z)
    n.setXYZ(i1, a.x, a.y, a.z)
  }
  n.needsUpdate = true
  return geo
}

function perturbRadius(geo, seed, amount, from = 0) {
  const p = geo.attributes.position
  const v = new THREE.Vector3()
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i)
    const r = Math.hypot(v.x, v.z)
    if (r < from) continue
    const k = 1 + (angleNoise(Math.atan2(v.z, v.x), seed) - 0.5) * amount
    p.setXYZ(i, v.x * k, v.y, v.z * k)
  }
  geo.computeVertexNormals()
  return geo
}

// Pan superior: cúpula tipo brioche (superelipse) sobre una base cortada.
export function bunTopGeometry(q = 1, R = 1, H = 0.72) {
  const pts = [new THREE.Vector2(0, 0)]
  const base = 6
  for (let i = 1; i <= base; i++) pts.push(new THREE.Vector2((R * 0.94 * i) / base, 0))
  pts.push(new THREE.Vector2(R * 0.985, 0.015))
  const dome = seg(36, q)
  for (let i = 0; i <= dome; i++) {
    const phi = (i / dome) * (Math.PI / 2)
    // Hombros llenos de brioche que terminan en una elipse pura arriba (sin meseta en la coronilla)
    const e = 0.8 + 0.2 * smooth(0.7, 1.45, phi)
    const x = R * Math.pow(Math.cos(phi), e)
    const y = 0.03 + (H - 0.03) * Math.pow(Math.sin(phi), 0.85 + 0.15 * smooth(0.7, 1.45, phi))
    pts.push(new THREE.Vector2(Math.max(x, 0.0001), y))
  }
  pts[pts.length - 1].x = 0
  const segments = seg(96, q)
  const geo = new THREE.LatheGeometry(pts, segments)
  weldLatheSeam(perturbRadius(geo, 5, 0.05), pts.length, segments)
  // El polo de la cúpula: todas sus copias miran hacia arriba
  const nrm = geo.attributes.normal
  for (let i = 0; i <= segments; i++) nrm.setXYZ(i * pts.length + pts.length - 1, 0, 1, 0)
  return geo
}

// Pan inferior: disco con canto redondeado; la cara de arriba es la miga tostada.
export function bunBottomGeometry(q = 1, R = 1, H = 0.3) {
  const pts = [new THREE.Vector2(0, 0)]
  for (let i = 1; i <= 4; i++) pts.push(new THREE.Vector2((R * 0.9 * i) / 4, 0))
  const corner = seg(10, q)
  for (let i = 0; i <= corner; i++) {
    const a = -Math.PI / 2 + (i / corner) * Math.PI / 2
    pts.push(new THREE.Vector2(R * 0.9 + Math.cos(a) * R * 0.1, 0.1 + Math.sin(a) * 0.1))
  }
  pts.push(new THREE.Vector2(R, H - 0.06))
  pts.push(new THREE.Vector2(R * 0.985, H - 0.015))
  pts.push(new THREE.Vector2(R * 0.95, H))
  for (let i = 1; i <= 6; i++) pts.push(new THREE.Vector2(R * 0.95 * (1 - i / 6) + 0.0001, H + Math.sin((i / 6) * Math.PI / 2) * 0.012))
  pts[pts.length - 1].x = 0
  const segments = seg(96, q)
  const geo = new THREE.LatheGeometry(pts, segments)
  return weldLatheSeam(perturbRadius(geo, 9, 0.04), pts.length, segments)
}

// Carne smash: disco fino, más ancho que el pan, con borde de encaje crujiente (radio muy irregular,
// el canto se adelgaza y se ondula) y superficie con relieve. Los colores de vértice oscurecen el borde.
export function pattyGeometry(q = 1, R = 1.12, H = 0.13, seed = 1) {
  const radial = seg(40, q)
  const around = seg(160, q)
  const positions = []
  const colors = []
  const uvs = []
  const indices = []
  // Recorremos un perfil cerrado: centro superior -> borde -> centro inferior.
  const rings = []
  for (let i = 0; i <= radial; i++) rings.push({ t: i / radial, top: true })
  for (let i = radial; i >= 0; i--) rings.push({ t: i / radial, top: false })

  for (const ring of rings) {
    for (let j = 0; j <= around; j++) {
      const a = (j / around) * Math.PI * 2
      const lace = (angleNoise(a, seed, 3) - 0.5) * 0.22 + (angleNoise(a, seed + 3, 9) - 0.5) * 0.12
      const edge = smooth(0.7, 1, ring.t)
      const r = R * ring.t * (1 + lace * edge)
      const x = Math.cos(a) * r
      const z = Math.sin(a) * r
      // Grosor que cae hacia el borde (el encaje es casi una lámina) + relieve de superficie
      const thick = H * (1 - edge * 0.82)
      const bumps = (fbm(x * 3 + 5, z * 3 + 5, seed + 7) - 0.5) * 0.05 * (1 - edge * 0.5)
      const warp = (angleNoise(a, seed + 11, 4) - 0.5) * 0.06 * edge
      const y = (ring.top ? thick / 2 + bumps : -thick / 2 + bumps * 0.3) + warp
      positions.push(x, y, z)
      uvs.push(x / (R * 2.4) + 0.5, z / (R * 2.4) + 0.5)
      const dark = 1 - edge * 0.45 - (ring.top ? 0 : 0.12)
      colors.push(dark, dark * 0.96, dark * 0.92)
    }
  }
  const row = around + 1
  for (let i = 0; i < rings.length - 1; i++) {
    for (let j = 0; j < around; j++) {
      const a = i * row + j
      const b = a + row
      indices.push(a, a + 1, b, b, a + 1, b + 1)
    }
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geo.setIndex(indices)
  geo.computeVertexNormals()
  return geo
}

// Loncha de queso fundido: cuadrada, apoyada sobre `support` y cayendo por fuera con curva suave.
// `melt` controla cuánto cuelga (0 = queso curado rígido, 1 = cheddar muy fundido).
export function cheeseGeometry(q = 1, { size = 2.0, support = 0.98, melt = 1, seed = 1 } = {}) {
  const geo = new THREE.PlaneGeometry(size, size, seg(64, q), seg(64, q))
  geo.rotateX(-Math.PI / 2)
  const p = geo.attributes.position
  const corner = 1.16 // las esquinas se redondean: el queso fundido no hace picos
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i)
    let z = p.getZ(i)
    let d = Math.hypot(x, z)
    if (d > corner) {
      const k = (corner + (d - corner) * 0.4) / d
      x *= k
      z *= k
      d *= k
    }
    // Borde irregular, como una loncha que se ha ido fundiendo
    const a = Math.atan2(z, x)
    const edgeK = 1 + (angleNoise(a, seed + 4, 3) - 0.5) * 0.08 * smooth(0.8, 1.2, d)
    x *= edgeK
    z *= edgeK
    const over = Math.max(0, d - support)
    const droop = Math.pow(over, 1.35) * 1.6 * melt
    const ripple = (fbm(x * 2 + 3, z * 2 + 3, seed) - 0.5) * 0.025 * melt
    p.setXYZ(i, x, -droop + ripple, z)
  }
  geo.computeVertexNormals()
  return geo
}

// Gota de queso colgando del borde: lágrima (ancha arriba donde se une, redonda abajo).
export function dripGeometry(q = 1) {
  const pts = []
  const n = seg(16, q)
  for (let i = 0; i <= n; i++) {
    const t = i / n // 0 = punta inferior, 1 = arriba
    const r = 0.055 * Math.sin(Math.PI * Math.min(1, t * 1.15)) * (0.55 + 0.45 * t) + (t > 0.9 ? 0.03 * (t - 0.9) * 10 : 0)
    pts.push(new THREE.Vector2(Math.max(0.0001, r), -0.22 + t * 0.24))
  }
  return new THREE.LatheGeometry(pts, seg(14, q))
}

// Charco de salsa o mermelada: disco irregular, ligeramente abombado.
export function blobGeometry(q = 1, { radius = 0.95, height = 0.035, seed = 1, wobble = 0.25 } = {}) {
  // Disco subdividido en anillos (no un abanico de triángulos largos, que hace rayos de luz)
  const geo = new THREE.RingGeometry(0, radius, seg(96, q), seg(18, q))
  geo.rotateX(-Math.PI / 2)
  const p = geo.attributes.position
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i)
    const z = p.getZ(i)
    const d = Math.hypot(x, z) / radius
    const a = Math.atan2(z, x)
    const k = 1 + (angleNoise(a, seed, 3) - 0.5) * wobble * d
    p.setXYZ(i, x * k, height * (1 - d * d) + (fbm(x * 4, z * 4, seed + 2) - 0.5) * height * 0.6, z * k)
  }
  geo.computeVertexNormals()
  return geo
}

// Hoja de lechuga: disco con el borde muy rizado.
export function lettuceGeometry(q = 1, { radius = 1.22, seed = 1 } = {}) {
  const geo = new THREE.RingGeometry(0, radius, seg(180, q), seg(20, q))
  geo.rotateX(-Math.PI / 2)
  const p = geo.attributes.position
  const colors = []
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i)
    const z = p.getZ(i)
    const d = Math.hypot(x, z) / radius
    const a = Math.atan2(z, x)
    // Rizo irregular: varias frecuencias moduladas por ruido, más fuerte en el borde
    const wob = angleNoise(a, seed, 2)
    const ruffle =
      (Math.sin(a * 11 + wob * 9) * 0.05 + Math.sin(a * 23 + wob * 15) * 0.025) * Math.pow(d, 2.2) * (0.6 + wob * 0.8) +
      (fbm(x * 3 + 7, z * 3 + 7, seed + 5) - 0.5) * 0.05
    const k = 1 + (angleNoise(a, seed + 1, 4) - 0.5) * 0.3 * d
    p.setXYZ(i, x * k, ruffle - d * d * 0.06, z * k)
    const g = 0.75 + d * 0.25
    colors.push(0.75 + (1 - d) * 0.25, g, 0.55 + (1 - d) * 0.35)
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  geo.computeVertexNormals()
  return geo
}

// Tira de bacon ondulada.
export function baconGeometry(q = 1, { length = 2.0, width = 0.3, seed = 1 } = {}) {
  const geo = new THREE.PlaneGeometry(length, width, seg(72, q), 4)
  geo.rotateX(-Math.PI / 2)
  const p = geo.attributes.position
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i)
    const z = p.getZ(i)
    const wave = Math.sin(x * 5.5 + seed) * 0.045 + (fbm(x * 3, z * 3, seed) - 0.5) * 0.04
    const curl = -Math.pow(Math.abs(x) / (length / 2), 3) * 0.08
    p.setXYZ(i, x, wave + curl + Math.sin(z * 12) * 0.006, z)
  }
  geo.computeVertexNormals()
  return geo
}

// Puntos repartidos en un disco (para cebolla, pepinillo, etc.). Determinista por semilla.
export function scatter(count, radius, seed = 1, minDist = 0) {
  const out = []
  let s = seed * 9301 + 49297
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
  let guard = 0
  while (out.length < count && guard++ < count * 40) {
    const r = Math.sqrt(rnd()) * radius
    const a = rnd() * Math.PI * 2
    const pt = { x: Math.cos(a) * r, z: Math.sin(a) * r, rot: rnd() * Math.PI * 2, s: 0.75 + rnd() * 0.5, r2: rnd() }
    if (minDist && out.some((o) => Math.hypot(o.x - pt.x, o.z - pt.z) < minDist)) continue
    out.push(pt)
  }
  return out
}
