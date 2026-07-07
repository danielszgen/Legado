import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Environment, Lightformer, MeshReflectorMaterial, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import { readScroll } from '../lib/scrollBus'

/**
 * «La casa», sugerida: suelo de madera cálida con reflejo tenue, pared a la
 * izquierda con luz de ventana, niebla cálida al fondo y motas de polvo en el
 * haz de luz. La escena se apaga hacia penumbra de brasa en los beats finales.
 */
export function SceneEnvironment() {
  const keyLight = useRef<THREE.DirectionalLight>(null)
  const ember = useRef<THREE.PointLight>(null)
  const ambient = useRef<THREE.AmbientLight>(null)

  useFrame(() => {
    const p = readScroll().progress
    // De tarde dorada (beats 1–4) a penumbra de brasa (beats 5–7)
    const dusk = THREE.MathUtils.clamp((p - 4.4) / 2.4, 0, 1)
    if (keyLight.current) keyLight.current.intensity = THREE.MathUtils.lerp(3.0, 1.25, dusk)
    if (ambient.current) ambient.current.intensity = THREE.MathUtils.lerp(0.65, 0.34, dusk)
    if (ember.current) ember.current.intensity = THREE.MathUtils.lerp(0.12, 1.5, dusk)
  })

  return (
    <>
      <color attach="background" args={['#0e0b07']} />
      <fog attach="fog" args={['#130d08', 5.2, 12.5]} />

      {/* Luz principal cálida desde la IZQUIERDA (la ventana) */}
      <directionalLight
        ref={keyLight}
        position={[-4.2, 3.1, 1.7]}
        color="#ffd9a3"
        intensity={2.6}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
      />
      <ambientLight ref={ambient} color="#3d2f20" intensity={0.5} />
      {/* Brasa: rescoldo cálido que crece al caer la tarde */}
      <pointLight ref={ember} position={[1.7, 0.45, 1.3]} color="#ff9d5c" intensity={0.12} distance={7} decay={2} />

      {/* Suelo de madera cálida con reflejo tenue */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[26, 26]} />
        <MeshReflectorMaterial
          color="#251811"
          roughness={0.82}
          metalness={0}
          mirror={0.35}
          resolution={512}
          blur={[280, 60]}
          mixBlur={0.9}
          mixStrength={0.5}
          depthScale={0.4}
          minDepthThreshold={0.6}
          maxDepthThreshold={1.4}
        />
      </mesh>

      {/* Pared izquierda, en penumbra */}
      <mesh position={[-3.5, 2.4, -1]} rotation-y={Math.PI / 2}>
        <planeGeometry args={[18, 7.5]} />
        <meshStandardMaterial color="#191008" roughness={1} />
      </mesh>
      {/* Resplandor de ventana sobre la pared */}
      <mesh position={[-3.42, 1.75, 0.5]} rotation-y={Math.PI / 2}>
        <planeGeometry args={[1.5, 2.7]} />
        <meshBasicMaterial color="#ffca87" transparent opacity={0.38} toneMapped={false} />
      </mesh>

      {/* Puerta de entrada (z≈9.3): el hero arranca fuera de la casa y el
          scroll cruza este umbral hacia el rincón del salón. Hueco x −0.1…1.8,
          alto 2.35; la trayectoria hero→beat 1 pasa por su centro. */}
      <group>
        {/* pared de fachada, a ambos lados y sobre el hueco */}
        <mesh position={[-6.55, 3.5, 9.3]}>
          <planeGeometry args={[12.9, 7]} />
          <meshStandardMaterial color="#171009" roughness={1} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[7.4, 3.5, 9.3]}>
          <planeGeometry args={[11.2, 7]} />
          <meshStandardMaterial color="#171009" roughness={1} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0.85, 4.675, 9.3]}>
          <planeGeometry args={[1.9, 4.65]} />
          <meshStandardMaterial color="#171009" roughness={1} side={THREE.DoubleSide} />
        </mesh>
        {/* marco de madera oscura */}
        <mesh position={[-0.1, 1.175, 9.3]}>
          <boxGeometry args={[0.1, 2.4, 0.16]} />
          <meshStandardMaterial color="#2c1c10" roughness={0.6} />
        </mesh>
        <mesh position={[1.8, 1.175, 9.3]}>
          <boxGeometry args={[0.1, 2.4, 0.16]} />
          <meshStandardMaterial color="#2c1c10" roughness={0.6} />
        </mesh>
        <mesh position={[0.85, 2.41, 9.3]}>
          <boxGeometry args={[2.0, 0.12, 0.16]} />
          <meshStandardMaterial color="#2c1c10" roughness={0.6} />
        </mesh>
        {/* luz cálida del salón derramándose por el hueco (visible desde fuera) */}
        <mesh position={[0.85, 1.175, 9.28]}>
          <planeGeometry args={[1.9, 2.35]} />
          <meshBasicMaterial color="#ffbe7d" transparent opacity={0.5} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
        {/* luz de porche: recorta el marco y la fachada desde fuera */}
        <pointLight position={[0.85, 2.3, 10.4]} color="#ffb677" intensity={1.3} distance={6.5} decay={2} />
      </group>

      {/* Motas de polvo flotando en el haz de luz */}
      <Sparkles count={90} scale={[6.5, 3, 7]} position={[-0.4, 1.5, 1]} size={1.7} speed={0.18} opacity={0.32} color="#ffd9a3" noise={0.6} />

      {/* HDRI procedural cálido: ventana grande a la izquierda + rebotes ámbar */}
      <Environment resolution={64} frames={1}>
        <Lightformer form="rect" intensity={2.4} color="#ffdcae" position={[-4, 2.2, 0]} rotation-y={Math.PI / 2} scale={[5, 3, 1]} />
        <Lightformer form="rect" intensity={0.55} color="#c98d5a" position={[3, 3.4, 2]} scale={[4, 2, 1]} />
        <Lightformer form="rect" intensity={0.3} color="#5a3a22" position={[0, 1, -4]} scale={[8, 3, 1]} />
      </Environment>
    </>
  )
}
