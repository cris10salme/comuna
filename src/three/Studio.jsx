import { Environment, Lightformer } from '@react-three/drei'

// Iluminación de bodegón: luz principal cálida arriba-izquierda, contraluz que recorta el borde
// (queso y salsa brillan), relleno suave delante y reflejos de "softbox" con Lightformers
// (entorno generado en la GPU, sin descargar HDRIs).
export default function Studio({ shadows }) {
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

// Distancia de cámara para que quepa una caja de semiancho w y semialto h.
export function fitDistance(camera, halfW, halfH) {
  const tanHalf = Math.tan((camera.fov * Math.PI) / 360)
  return Math.max(halfH / tanHalf, halfW / (tanHalf * camera.aspect))
}
