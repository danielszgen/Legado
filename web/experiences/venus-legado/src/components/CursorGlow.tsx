import { useEffect } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

/** Punto de foco cálido que sigue al ratón, muy sutil. Solo con puntero fino. */
export function CursorGlow() {
  const x = useMotionValue(-400)
  const y = useMotionValue(-400)
  const sx = useSpring(x, { stiffness: 55, damping: 18, mass: 0.6 })
  const sy = useSpring(y, { stiffness: 55, damping: 18, mass: 0.6 })

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return
    const onMove = (e: PointerEvent) => {
      x.set(e.clientX - 190)
      y.set(e.clientY - 190)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [x, y])

  return (
    <motion.div
      aria-hidden="true"
      style={{
        x: sx,
        y: sy,
        background: 'radial-gradient(circle, rgba(255,205,140,0.09) 0%, transparent 65%)',
      }}
      className="pointer-events-none fixed left-0 top-0 z-10 h-[380px] w-[380px] mix-blend-screen"
    />
  )
}
