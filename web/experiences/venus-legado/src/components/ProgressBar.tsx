import { useEffect, useRef } from 'react'
import { subscribeScroll } from '../lib/scrollBus'

/** Barra de progreso finísima (ámbar), atada al scroll sin re-renders. */
export function ProgressBar() {
  const bar = useRef<HTMLDivElement>(null)

  useEffect(
    () =>
      subscribeScroll((s) => {
        if (bar.current) bar.current.style.transform = `scaleX(${s.offset})`
      }),
    [],
  )

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-40 h-[2px]">
      <div
        ref={bar}
        className="h-full w-full origin-left bg-gradient-to-r from-laton via-ambar to-ambar"
        style={{ transform: 'scaleX(0)' }}
      />
    </div>
  )
}
