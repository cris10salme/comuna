import * as THREE from 'three'

// Texturas procedurales pintadas en <canvas>: nada de imágenes externas.
// Se cachean por clave para que todas las burgers compartan la misma textura en GPU.

const cache = new Map()

function hash(x, y, seed) {
  let h = x * 374761393 + y * 668265263 + seed * 2147483647
  h = (h ^ (h >>> 13)) * 1274126177
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295
}

function valueNoise(x, y, seed = 1) {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const xf = x - xi
  const yf = y - yi
  const s = (t) => t * t * (3 - 2 * t)
  const a = hash(xi, yi, seed)
  const b = hash(xi + 1, yi, seed)
  const c = hash(xi, yi + 1, seed)
  const d = hash(xi + 1, yi + 1, seed)
  const u = s(xf)
  const v = s(yf)
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
}

export function fbm(x, y, seed = 1, octaves = 4) {
  let sum = 0
  let amp = 0.5
  let freq = 1
  for (let i = 0; i < octaves; i++) {
    sum += amp * valueNoise(x * freq, y * freq, seed + i * 17)
    freq *= 2
    amp *= 0.5
  }
  return sum
}

const lerp = (a, b, t) => a + (b - a) * t
const mix = (c1, c2, t) => [lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t)]
const clamp01 = (t) => Math.min(1, Math.max(0, t))
const smooth = (e0, e1, x) => {
  const t = clamp01((x - e0) / (e1 - e0))
  return t * t * (3 - 2 * t)
}
const hex = (h) => [(h >> 16) & 255, (h >> 8) & 255, h & 255]

// Pinta píxel a píxel con una función (u, v) -> [r, g, b] y opcionalmente un mapa de relieve.
// Para piezas de torno: el ruido se evalúa sobre la posición aproximada en la cúpula (x, z), así no
// hay costura en u ni "rayos" en el polo donde todas las columnas se juntan.
const DOME_START = 0.16
function domeXZ(u, v) {
  const a = u * Math.PI * 2
  const phi = (Math.max(0, v - DOME_START) / (1 - DOME_START)) * (Math.PI / 2)
  const r = Math.cos(phi)
  return [Math.cos(a) * r, Math.sin(a) * r, Math.sin(phi)]
}

const radialBump = (u, v) => {
  const [x, z, h] = domeXZ(u, v)
  const n = 128 + (fbm(x * 7 + 50, z * 7 + h * 3, 99, 3) - 0.5) * 230
  return [n, n, n]
}

function paint(key, size, colorFn, { bump = false, bumpFn } = {}) {
  if (cache.has(key)) return cache.get(key)
  const make = (fn, isColor) => {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = size
    const ctx = canvas.getContext('2d')
    const img = ctx.createImageData(size, size)
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        // v=0 abajo, como en las UV de three.js (el canvas se invierte al subirse a la GPU)
        const [r, g, b] = fn(x / size, 1 - y / size)
        const i = (y * size + x) * 4
        img.data[i] = r
        img.data[i + 1] = g
        img.data[i + 2] = b
        img.data[i + 3] = 255
      }
    }
    ctx.putImageData(img, 0, 0)
    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.anisotropy = 4
    if (isColor) tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }
  const result = { map: make(colorFn, true) }
  if (bump) {
    result.bumpMap = make(
      bumpFn ||
        ((u, v) => {
          const n = fbm(u * 40, v * 40, 99, 3) * 255
          return [n, n, n]
        }),
      false,
    )
  }
  cache.set(key, result)
  return result
}

// Pan superior. UV de torno: v=0 base cortada, v=1 coronilla. u da la vuelta (sin costura visible: ruido periódico en u).
export function bunTopTextures(size) {
  const crumb = hex(0xe2b77a)
  const pale = hex(0xe6b06a)
  const golden = hex(0xb4641f)
  const deep = hex(0x7a3a10)
  return paint(`bunTop${size}`, size, (u, v) => {
    const [x, z, h] = domeXZ(u, v)
    const mottle = fbm(x * 3 + 10, z * 3 + h * 2, 3)
    const speck = fbm(x * 30 + 10, z * 30 + h * 9, 7, 2)
    if (v < 0.16) {
      // Cara cortada: miga tostada en el borde
      const toast = smooth(0.1, 0.16, v)
      let c = mix(crumb, golden, toast * 0.6)
      c = mix(c, [255, 240, 210], (speck - 0.5) * 0.3)
      return c
    }
    const t = smooth(0.16, 0.45, v)
    let c = mix(pale, golden, t)
    c = mix(c, deep, smooth(0.35, 1, v) * 0.7 + (mottle - 0.5) * 0.5)
    c = mix(c, [255, 225, 170], Math.max(0, speck - 0.62) * 1.2)
    return c
  }, { bump: true, bumpFn: radialBump })
}

// Pan inferior: base de corteza y cara superior de miga tostada a la plancha.
export function bunBottomTextures(size) {
  const crust = hex(0xc98a43)
  const crumb = hex(0xe7c48c)
  const toasted = hex(0xb7702e)
  return paint(`bunBottom${size}`, size, (u, v) => {
    const a = u * Math.PI * 2
    const n = fbm(Math.cos(a) * 3 + v * 8, Math.sin(a) * 3, 11)
    if (v > 0.72) {
      // Cara de miga, más tostada hacia el centro
      const t = smooth(0.72, 1, v)
      let c = mix(crumb, toasted, t * 0.7 + (n - 0.5) * 0.6)
      return c
    }
    return mix(crust, hex(0x9c5a22), (n - 0.4) * 0.8)
  }, { bump: true, bumpFn: radialBump })
}

// Carne smash, vista en planta (UV plano). Costra de Maillard con vetas y puntos tostados.
export function pattyTextures(size) {
  const base = hex(0x84492a)
  const crust = hex(0x3b1d0e)
  const caramel = hex(0xa65f2e)
  return paint(`patty${size}`, size, (u, v) => {
    const n = fbm(u * 10, v * 10, 21)
    const fine = fbm(u * 60, v * 60, 23, 2)
    let c = mix(base, crust, smooth(0.35, 0.75, n))
    c = mix(c, caramel, Math.max(0, fine - 0.55) * 1.6)
    return c
  }, { bump: true })
}

// Bacon: franjas de magro y grasa a lo largo de la tira, bien tostado.
export function baconTextures(size) {
  const meat = hex(0x8e2a1c)
  const fat = hex(0xe9c3a0)
  const burnt = hex(0x4a1a0e)
  return paint(`bacon${size}`, size, (u, v) => {
    const band = Math.sin(v * Math.PI * 5 + fbm(u * 4, v * 2, 31) * 3)
    let c = mix(meat, fat, smooth(0.35, 0.8, band))
    const n = fbm(u * 18, v * 6, 33)
    c = mix(c, burnt, smooth(0.45, 0.8, n) * 0.6)
    return c
  }, { bump: true })
}

// Rodaja de pepinillo: piel verde oscura, carne verde clara y anillo de pepitas.
export function pickleTextures(size) {
  const skin = hex(0x3d5a1e)
  const flesh = hex(0xa9b862)
  const seed = hex(0xd8d6a0)
  return paint(`pickle${size}`, size, (u, v) => {
    const dx = u - 0.5
    const dy = v - 0.5
    const r = Math.sqrt(dx * dx + dy * dy) * 2
    const a = Math.atan2(dy, dx)
    let c = mix(flesh, skin, smooth(0.86, 0.95, r))
    const seeds = smooth(0.35, 0.4, r) * (1 - smooth(0.52, 0.58, r)) * smooth(0.2, 0.8, Math.sin(a * 9) * 0.5 + 0.5)
    c = mix(c, seed, seeds * 0.8)
    return mix(c, hex(0x7f8f3a), (fbm(u * 20, v * 20, 41) - 0.5) * 0.4)
  })
}

// Rulo de cabra: interior blanco y corteza enmohecida gris-crema.
export function goatRoundTextures(size) {
  return paint(`goat${size}`, size, (u, v) => {
    const dx = u - 0.5
    const dy = v - 0.5
    const r = Math.sqrt(dx * dx + dy * dy) * 2
    const n = fbm(u * 30, v * 30, 51)
    const inner = mix(hex(0xf6f2e8), hex(0xe8e1d0), n)
    return mix(inner, hex(0xd9d2c0), smooth(0.85, 0.93, r))
  })
}

// Rebozado de pollo crujiente: dorado con relieve fuerte.
export function chickenTextures(size) {
  return paint(`chicken${size}`, size, (u, v) => {
    const n = fbm(u * 14, v * 14, 61)
    const f = fbm(u * 50, v * 50, 63, 2)
    let c = mix(hex(0xd99a45), hex(0x9a5a1c), smooth(0.4, 0.8, n))
    return mix(c, hex(0xf2c27a), Math.max(0, f - 0.6) * 1.5)
  }, { bump: true })
}
