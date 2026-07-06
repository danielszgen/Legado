import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { ScrollControls } from '@react-three/drei'
import { BEATS } from '../data/beats'
import { SceneEnvironment } from './SceneEnvironment'
import { VenusModel } from './VenusModel'
import { CameraRig } from './CameraRig'

/**
 * Un único Canvas a pantalla completa, fijo detrás del contenido.
 * ScrollControls aporta el scroll (7 páginas = beats 0–6) y CameraRig
 * lo traduce a movimiento de cámara; el modelo se monta una sola vez.
 */
export function Scene3D() {
  return (
    <div className="fixed inset-0 z-0">
      <Canvas
        dpr={[1, 2]}
        gl={{ powerPreference: 'high-performance', antialias: true }}
        shadows
        camera={{ fov: 38, near: 0.1, far: 40, position: BEATS[0].camPos }}
      >
        <Suspense fallback={null}>
          <SceneEnvironment />
          <VenusModel />
        </Suspense>
        <ScrollControls pages={BEATS.length} damping={0.24}>
          <CameraRig />
        </ScrollControls>
      </Canvas>
    </div>
  )
}
