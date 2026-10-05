// Decide cuánto 3D puede permitirse el dispositivo.
//  'off'  -> sin WebGL, ahorro de datos o equipo muy flojo: versión 2D ligera
//  'low'  -> móvil/equipo modesto: menos geometría, sin sombras dinámicas, dpr 1
//  'high' -> todo
export function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

export function prefersReducedMotion() {
  return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

export function graphicsTier() {
  if (typeof window === 'undefined' || !hasWebGL()) return 'off'
  const nav = navigator
  const mem = nav.deviceMemory // solo Chrome/Android
  const cores = nav.hardwareConcurrency || 4
  if (nav.connection?.saveData) return 'off'
  if ((mem && mem <= 2) || cores <= 2) return 'off'
  const coarse = window.matchMedia?.('(pointer: coarse)').matches
  if (coarse || (mem && mem <= 4) || cores <= 4) return 'low'
  return 'high'
}
