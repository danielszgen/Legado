import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useScroll } from '@react-three/drei'
import * as THREE from 'three'
import { easing } from 'maath'
import { BEATS, SEGMENTS } from '../data/beats'
import { publishScroll, easeInOutPower2 } from '../lib/scrollBus'

const posA = new THREE.Vector3()
const posB = new THREE.Vector3()
const tgtA = new THREE.Vector3()
const tgtB = new THREE.Vector3()

/**
 * Interpola posición y target de cámara entre las anclas del storyboard
 * (easing power2.inOut por tramo) según el offset de ScrollControls,
 * con amortiguación para un movimiento lento y elegante.
 */
export function CameraRig() {
  const scroll = useScroll()
  const lookAt = useRef(new THREE.Vector3(...BEATS[0].camTarget))

  useFrame((state, delta) => {
    publishScroll(scroll.offset)

    const p = THREE.MathUtils.clamp(scroll.offset * SEGMENTS, 0, SEGMENTS)
    const i = Math.min(SEGMENTS - 1, Math.floor(p))
    const t = easeInOutPower2(p - i)

    posA.fromArray(BEATS[i].camPos).lerp(posB.fromArray(BEATS[i + 1].camPos), t)
    tgtA.fromArray(BEATS[i].camTarget).lerp(tgtB.fromArray(BEATS[i + 1].camTarget), t)

    // Parallax de ratón muy sutil: la cámara «respira» con quien mira
    posA.x += state.pointer.x * 0.07
    posA.y += state.pointer.y * 0.045

    easing.damp3(state.camera.position, posA, 0.3, delta)
    easing.damp3(lookAt.current, tgtA, 0.3, delta)
    state.camera.lookAt(lookAt.current)
  })

  return null
}
