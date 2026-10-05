import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import Burger from './Burger'
import Studio, { fitDistance } from './Studio'

// Cámara fija de la vista previa: encuadra la burger montada.
function PreviewCamera() {
  useFrame(({ camera }) => {
    const d = fitDistance(camera, 1.35, 1.0) * 1.05 + 1.1
    camera.position.set(0, d * 0.36, d)
    camera.lookAt(0, -0.05, 0)
  })
  return null
}

// Vista previa en la tarjeta de la carta: la burger montada girando despacio. Sin gestos: tocarla
// abre el visor a pantalla completa.
export default function BurgerViewer({ recipe, tier, reducedMotion, paused = false }) {
  const wrapRef = useRef(null)
  const [visible, setVisible] = useState(true)
  const [dpr, setDpr] = useState(tier === 'high' ? 1.75 : 1.25)

  // No gastar batería dibujando cuando la burger no está en pantalla
  useEffect(() => {
    const el = wrapRef.current
    if (!el || !('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: '100px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const shadows = tier === 'high'
  // Con "reducir movimiento" no gira: se dibuja una vez y queda quieta.
  const frameloop = !visible || paused ? 'never' : reducedMotion ? 'demand' : 'always'

  return (
    <div ref={wrapRef} className="viewer__canvas">
      <Canvas
        frameloop={frameloop}
        dpr={dpr}
        shadows={shadows}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ fov: 30, position: [0, 2, 5.4], near: 0.1, far: 80 }}
      >
        <PerformanceMonitor onDecline={() => setDpr(1)} />
        <Studio shadows={shadows} />
        <PreviewCamera />
        <Suspense fallback={null}>
          <Burger recipe={recipe} quality={tier === 'high' ? 1 : 0.55} reducedMotion={reducedMotion} autoRotate />
        </Suspense>
      </Canvas>
    </div>
  )
}
