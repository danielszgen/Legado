import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { readScroll, easeInOutPower2 } from '../lib/scrollBus'
import { introBlend } from '../lib/introBus'

// venus-opt.glb: escaneo 3D real del Venus (Downloads/model.glb, pygltflib)
// optimizado con `gltf-transform optimize … --texture-compress webp`
// (10.99 MB → 1.38 MB, meshopt). El original queda en web/assets/3d/models/.
const MODEL_URL = `${import.meta.env.BASE_URL}assets/3d/models/venus-opt.glb`

/** El escaneo ya es Y-up; su eje largo (z≈1.9) es la profundidad reclinada */
const MODEL_ROTATION: [number, number, number] = [0, 0, 0]

/** Altura normalizada del sillón en unidades de escena (apoyado en y=0).
    El escaneo está reclinado (mecanismo abierto), así que su alto es menor. */
const TARGET_HEIGHT = 1.05
/** Orientación de reposo: ligeramente girado hacia la derecha (hacia la sala) */
const REST_ROT_Y = 0.38
/** Beat 3 · base giratoria: girado hacia la ventana/luz de la izquierda */
const LIGHT_ROT_Y = -0.52

/* Pose de intro (mecanismo abierto): la butaca arranca reclinada y girada
   como en el render del rincón, y se cierra/endereza durante el revelado. */
const INTRO_SWIVEL = 0.5
const INTRO_TILT_X = -0.13
const INTRO_LIFT_Y = 0.035

export function VenusModel() {
  const swivel = useRef<THREE.Group>(null)
  const lift = useRef<THREE.Group>(null)
  const { scene } = useGLTF(MODEL_URL)

  const { scale, offset } = useMemo(() => {
    scene.rotation.set(...MODEL_ROTATION)
    scene.updateMatrixWorld(true)
    const box = new THREE.Box3().setFromObject(scene)
    const size = new THREE.Vector3()
    const center = new THREE.Vector3()
    box.getSize(size)
    box.getCenter(center)
    // Tamaño real del glb (ya enderezado): las cámaras ancla de data/beats.ts
    // están ajustadas a esta normalización (TARGET_HEIGHT sobre y=0).
    console.info('[venus.glb] tamaño real (unidades glTF, Y-up):', {
      x: +size.x.toFixed(3),
      y: +size.y.toFixed(3),
      z: +size.z.toFixed(3),
    })
    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh
      if (mesh.isMesh) {
        mesh.castShadow = true
        mesh.receiveShadow = true
        // El escaneo exporta metallicFactor 1 (se traga la luz): tela mate
        const mat = mesh.material as THREE.MeshStandardMaterial
        if (mat?.isMeshStandardMaterial) {
          mat.metalness = 0
          mat.roughness = 0.92
          mat.envMapIntensity = 1.15
        }
      }
    })
    return {
      scale: TARGET_HEIGHT / size.y,
      offset: new THREE.Vector3(-center.x, -box.min.y, -center.z),
    }
  }, [scene])

  useFrame(() => {
    const p = readScroll().progress
    const b = introBlend()

    // Beat 3 — «Base giratoria»: gira suavemente hacia la luz
    if (swivel.current) {
      const t = easeInOutPower2(THREE.MathUtils.clamp((p - 2.6) / 0.8, 0, 1))
      swivel.current.rotation.y =
        THREE.MathUtils.lerp(REST_ROT_Y, LIGHT_ROT_Y, t) + INTRO_SWIVEL * (1 - b)
    }

    // Beat 6 — «Relax 2 Motores elevador»: se inclina y eleva para acompañarte
    if (lift.current) {
      const t = THREE.MathUtils.clamp((p - 5.55) / 0.9, 0, 1)
      const pulse = Math.sin(Math.PI * easeInOutPower2(t))
      // + pose de intro: reclinada (mecanismo abierto) que se cierra al revelar
      lift.current.rotation.x = 0.11 * pulse + INTRO_TILT_X * (1 - b)
      lift.current.position.y = 0.07 * pulse + INTRO_LIFT_Y * (1 - b)
    }
  })

  return (
    <group ref={swivel} rotation-y={REST_ROT_Y}>
      <group ref={lift}>
        <group scale={scale}>
          <group position={offset}>
            <primitive object={scene} />
          </group>
        </group>
      </group>
    </group>
  )
}

useGLTF.preload(MODEL_URL)
