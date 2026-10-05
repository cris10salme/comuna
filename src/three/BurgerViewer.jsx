import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, Lightformer, PerformanceMonitor } from '@react-three/drei'
import Burger from './Burger'

// Iluminación de bodegón: luz principal cálida arriba-izquierda, contraluz naranja que recorta el
// borde (queso y salsa brillan), relleno suave delante y reflejos de "softbox" con Lightformers
// (entorno generado en la GPU, sin descargar HDRIs).
function Studio({ shadows }) {
  return (
    <>
      <ambientLight intensity={0.18} color="#ffd9b0" />
      <directionalLight
        position={[-3.5, 5, 3.5]}
        intensity={2.8}
        color="#fff0dc"
        castShadow={shadows}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
        shadow-camera-left={-3}
        shadow-camera-right={3}
        shadow-camera-top={3}
        shadow-camera-bottom={-3}
      />
      <spotLight position={[3.5, 2.5, -4]} intensity={30} angle={0.6} penumbra={0.8} color="#ffa860" />
      <pointLight position={[0, -0.5, 4]} intensity={3} color="#fff1e0" distance={10} />
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={3} color="#fff0de" position={[-3, 3, 3]} scale={[4, 2, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={1.6} color="#ffb27a" position={[4, 1, -3]} scale={[2, 5, 1]} target={[0, 0, 0]} />
        <Lightformer form="ring" intensity={1.5} color="#fff3e2" position={[0, 5, 0]} scale={2} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={0.6} color="#3a1a08" position={[0, -3, 0]} scale={[10, 10, 1]} target={[0, 0, 0]} />
      </Environment>
    </>
  )
}

export default function BurgerViewer({ recipe, exploded, tier, reducedMotion }) {
  const wrapRef = useRef(null)
  const [visible, setVisible] = useState(true)
  const [dpr, setDpr] = useState(tier === 'high' ? 1.75 : 1.25)
  const [animating, setAnimating] = useState(false)

  // No gastar batería dibujando cuando la burger no está en pantalla
  useEffect(() => {
    const el = wrapRef.current
    if (!el || !('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: '100px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => setAnimating(true), [exploded])

  const quality = tier === 'high' ? 1 : 0.55
  const shadows = tier === 'high'
  // Con "reducir movimiento" no hay giro continuo: solo se dibuja mientras dura la transición.
  const frameloop = !visible ? 'never' : reducedMotion && !animating ? 'demand' : 'always'

  return (
    <div ref={wrapRef} className="viewer__canvas">
      <Canvas
        frameloop={frameloop}
        dpr={dpr}
        shadows={shadows}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ fov: 30, position: [0, 1.25, 5.4], near: 0.1, far: 50 }}
      >
        <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(tier === 'high' ? 1.75 : 1.25)} />
        <Studio shadows={shadows} />
        <Suspense fallback={null}>
          <Burger
            recipe={recipe}
            exploded={exploded}
            quality={quality}
            reducedMotion={reducedMotion}
            onSettled={() => setAnimating(false)}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
