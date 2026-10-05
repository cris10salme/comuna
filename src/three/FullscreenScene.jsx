import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, PerformanceMonitor } from '@react-three/drei'
import * as THREE from 'three'
import Burger, { rowX, ROW_SPACING } from './Burger'
import Studio, { fitDistance } from './Studio'

const ease = (dt, speed = 5) => 1 - Math.exp(-dt * speed)

// Mueve la cámara según el modo:
//  - montada: la controla OrbitControls (girar con el dedo, pellizcar para zoom). Al volver del
//    despiece, primero vuela a su sitio y después se devuelve el control.
//  - despiece: travelling lateral hasta la pieza enfocada, siguiendo al dedo mientras se arrastra.
function Rig({ mode, focus, dragRef, n, controlsRef, reducedMotion }) {
  const { camera } = useThree()
  const handingBack = useRef(false)
  const look = useRef(new THREE.Vector3())

  useEffect(() => {
    if (mode === 'assembled') handingBack.current = true
    if (controlsRef.current) controlsRef.current.enabled = false
  }, [mode, controlsRef])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 30)
    const k = reducedMotion ? 1 : ease(dt, 4.5)
    const controls = controlsRef.current
    if (mode === 'horizontal') {
      // Cuántas piezas caben a lo ancho: ~1,5 en móvil vertical, más en pantallas anchas
      const visible = Math.min(n, Math.max(1.3, camera.aspect * 1.75))
      const d = fitDistance(camera, (visible * ROW_SPACING) / 2, 1.7)
      // dragRef: arrastre actual del dedo en fracción del ancho de pantalla
      const x = rowX(focus, n) - (dragRef.current || 0) * visible * ROW_SPACING
      const clampX = Math.min(rowX(n - 1, n), Math.max(rowX(0, n), x))
      camera.position.lerp(new THREE.Vector3(clampX, d * 0.2, d), k)
      look.current.lerp(new THREE.Vector3(clampX, -0.15, 0), k)
      camera.lookAt(look.current)
      return
    }
    if (handingBack.current) {
      const d = fitDistance(camera, 1.45, 1.1) + 1.2
      const home = new THREE.Vector3(0, d * 0.36, d)
      camera.position.lerp(home, k)
      look.current.lerp(new THREE.Vector3(0, 0, 0), k)
      camera.lookAt(look.current)
      if (camera.position.distanceTo(home) < 0.05) {
        handingBack.current = false
        if (controls) {
          controls.target.set(0, 0, 0)
          controls.enabled = true
          controls.update()
        }
      }
    }
  })
  return null
}

export default function FullscreenScene({ burgerId, recipe, mode, focus, dragRef, labelEls, tier, reducedMotion, onLayerTap, onInteract }) {
  const controlsRef = useRef()
  const [dpr, setDpr] = useState(tier === 'high' ? 2 : 1.5)
  const n = recipe.length
  const shadows = tier === 'high'

  return (
    <Canvas
      dpr={dpr}
      shadows={shadows}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ fov: 32, position: [0, 3, 9], near: 0.1, far: 120 }}
    >
      <PerformanceMonitor onDecline={() => setDpr(1.25)} />
      <Studio shadows={shadows} />
      <Rig key={burgerId} mode={mode} focus={focus} dragRef={dragRef} n={n} controlsRef={controlsRef} reducedMotion={reducedMotion} />
      <OrbitControls
        ref={controlsRef}
        enabled={false}
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.8}
        minDistance={3.2}
        maxDistance={14}
        minPolarAngle={Math.PI * 0.18}
        maxPolarAngle={Math.PI * 0.62}
        autoRotate={!reducedMotion && mode === 'assembled'}
        autoRotateSpeed={0.9}
        onStart={onInteract}
      />
      <Suspense fallback={null}>
        <Burger
          key={burgerId}
          recipe={recipe}
          mode={mode}
          focus={focus}
          quality={tier === 'high' ? 1 : 0.7}
          reducedMotion={reducedMotion}
          labelEls={labelEls}
          onLayerTap={onLayerTap}
        />
      </Suspense>
    </Canvas>
  )
}
