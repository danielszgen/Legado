import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { readScroll, easeInOutPower2 } from '../lib/scrollBus'

// venus-opt.glb: salida de `gltf-transform optimize` (809 KB → 48 KB, meshopt).
// drei decodifica meshopt por defecto. El original queda en web/assets/3d/models/.
const MODEL_URL = `${import.meta.env.BASE_URL}assets/3d/models/venus-opt.glb`

/** Altura normalizada del sillón en unidades de escena (apoyado en y=0) */
const TARGET_HEIGHT = 1.45
/** Orientación de reposo: ligeramente girado hacia la derecha (hacia la sala) */
const REST_ROT_Y = 0.38
/** Beat 2 · base giratoria: girado hacia la ventana/luz de la izquierda */
const LIGHT_ROT_Y = -0.52

export function VenusModel() {
  const swivel = useRef<THREE.Group>(null)
  const lift = useRef<THREE.Group>(null)
  const { scene } = useGLTF(MODEL_URL)

  const { scale, offset } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene)
    const size = new THREE.Vector3()
    const center = new THREE.Vector3()
    box.getSize(size)
    box.getCenter(center)
    // Tamaño real del glb: las cámaras ancla de data/beats.ts están ajustadas
    // a la normalización que sale de aquí (TARGET_HEIGHT sobre y=0).
    console.info('[venus.glb] tamaño real (unidades glTF):', {
      x: +size.x.toFixed(3),
      y: +size.y.toFixed(3),
      z: +size.z.toFixed(3),
    })
    scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        obj.castShadow = true
        obj.receiveShadow = true
      }
    })
    return {
      scale: TARGET_HEIGHT / size.y,
      offset: new THREE.Vector3(-center.x, -box.min.y, -center.z),
    }
  }, [scene])

  useFrame(() => {
    const p = readScroll().progress

    // Beat 3 — «Base giratoria»: gira suavemente hacia la luz
    if (swivel.current) {
      const t = easeInOutPower2(THREE.MathUtils.clamp((p - 2.6) / 0.8, 0, 1))
      swivel.current.rotation.y = THREE.MathUtils.lerp(REST_ROT_Y, LIGHT_ROT_Y, t)
    }

    // Beat 6 — «Relax 2 Motores elevador»: se inclina y eleva para acompañarte
    if (lift.current) {
      const t = THREE.MathUtils.clamp((p - 5.55) / 0.9, 0, 1)
      const pulse = Math.sin(Math.PI * easeInOutPower2(t))
      lift.current.rotation.x = 0.11 * pulse
      lift.current.position.y = 0.07 * pulse
    }
  })

  return (
    <group ref={swivel} rotation-y={REST_ROT_Y}>
      <group ref={lift}>
        <group scale={scale}>
          <primitive object={scene} position={offset} />
        </group>
      </group>
    </group>
  )
}

useGLTF.preload(MODEL_URL)
