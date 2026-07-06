import { useEffect, useState } from 'react'
import { subscribeScroll } from '../lib/scrollBus'

/**
 * Beat activo como estado React: solo re-renderiza cuando cambia el beat,
 * no en cada frame de scroll.
 */
export function useActiveBeat(): number {
  const [beat, setBeat] = useState(0)
  useEffect(
    () =>
      subscribeScroll((s) => {
        setBeat((prev) => (prev === s.beat ? prev : s.beat))
      }),
    [],
  )
  return beat
}
