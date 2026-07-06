/**
 * Puente entre el scroll del Canvas (drei ScrollControls, escrito por
 * CameraRig en useFrame) y la UI DOM fija (overlays, barra de progreso).
 * Estado mutable + suscripción: la UI decide si re-renderiza (cambio de beat)
 * o toca el DOM directamente (progreso por frame), sin re-render global.
 */

import { SEGMENTS } from '../data/beats'

export interface ScrollSnapshot {
  /** Offset global 0..1 */
  offset: number
  /** Progreso en unidades de beat: 0..SEGMENTS */
  progress: number
  /** Beat activo (redondeado) */
  beat: number
}

type Listener = (s: ScrollSnapshot) => void

const state: ScrollSnapshot = { offset: 0, progress: 0, beat: 0 }
const listeners = new Set<Listener>()

export function publishScroll(offset: number): void {
  state.offset = offset
  state.progress = offset * SEGMENTS
  state.beat = Math.max(0, Math.min(SEGMENTS, Math.round(state.progress)))
  for (const fn of listeners) fn(state)
}

export function subscribeScroll(fn: Listener): () => void {
  listeners.add(fn)
  fn(state)
  return () => {
    listeners.delete(fn)
  }
}

export function readScroll(): ScrollSnapshot {
  return state
}

/** Easing power2.inOut (equivalente a gsap power2.inOut) */
export function easeInOutPower2(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}

/** Easing power2.out */
export function easeOutPower2(t: number): number {
  return 1 - (1 - t) * (1 - t)
}
