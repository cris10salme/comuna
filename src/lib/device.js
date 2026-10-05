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

// Nombre de la tarjeta gráfica (si el navegador lo da) para descartar GPUs antiguas conocidas.
function gpuName() {
  try {
    const gl = document.createElement('canvas').getContext('webgl')
    const ext = gl?.getExtension('WEBGL_debug_renderer_info')
    return (ext && gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) || ''
  } catch {
    return ''
  }
}

const WEAK_GPU = /Mali-(4|T6|T7|G3|G5[12])|Adreno \(TM\) (3|4|50)\d|PowerVR|SwiftShader-lite|llvmpipe/i

// Calidad alta por defecto (también en móviles: los actuales pueden de sobra). Solo se baja en
// equipos con poca memoria, pocos núcleos o GPUs antiguas. Además, el visor baja la resolución
// solo si detecta tirones (PerformanceMonitor).
export function graphicsTier() {
  if (typeof window === 'undefined' || !hasWebGL()) return 'off'
  const forced = new URLSearchParams(location.search).get('calidad')
  if (forced === 'alta') return 'high'
  if (forced === 'baja') return 'low'
  const nav = navigator
  const mem = nav.deviceMemory // solo Chrome/Android; Safari no lo da
  const cores = nav.hardwareConcurrency || 4
  if (nav.connection?.saveData) return 'off'
  if ((mem && mem <= 2) || cores <= 2) return 'off'
  const android = /Android/i.test(nav.userAgent)
  if ((mem && mem <= 3) || (android && cores <= 4) || WEAK_GPU.test(gpuName())) return 'low'
  return 'high'
}

// Densidad de píxeles para el lienzo 3D: nítido en pantallas retina sin pasarse (más de 2 no se nota
// y cuesta mucha batería).
export function canvasDpr(tier, max = 2) {
  const dpr = typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1
  return Math.min(dpr, tier === 'high' ? max : 1.25)
}
