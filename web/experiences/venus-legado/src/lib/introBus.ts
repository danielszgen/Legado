/**
 * Estado de la intro cinematográfica (precarga → revelado del 3D).
 *
 * Fases: 'images' (secuencia de renders, cámara clavada junto a la butaca) →
 * 'reveal' (el overlay se desvanece; cámara y butaca viajan hasta el hero
 * mientras el mecanismo se cierra) → 'done'.
 *
 * introBlend() devuelve 0..1: 0 = pose de intro (cerca de la butaca,
 * mecanismo abierto), 1 = pose normal de scroll. Lo consumen CameraRig y
 * VenusModel en useFrame.
 */

import { easeInOutPower2 } from './scrollBus'

type Phase = 'images' | 'reveal' | 'done'

const REVEAL_MS = 1700

let phase: Phase = 'images'
let revealStart = 0
const doneListeners = new Set<() => void>()

export function startReveal(): void {
  if (phase !== 'images') return
  phase = 'reveal'
  revealStart = performance.now()
}

export function introBlend(): number {
  if (phase === 'images') return 0
  if (phase === 'done') return 1
  const k = (performance.now() - revealStart) / REVEAL_MS
  if (k >= 1) {
    phase = 'done'
    for (const fn of doneListeners) fn()
    return 1
  }
  return easeInOutPower2(Math.max(0, Math.min(1, k)))
}

export function onIntroDone(fn: () => void): () => void {
  if (phase === 'done') fn()
  else doneListeners.add(fn)
  return () => {
    doneListeners.delete(fn)
  }
}
