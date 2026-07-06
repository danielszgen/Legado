import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { subscribeScroll } from '../lib/scrollBus'

/** «desliza» con flecha que respira; solo visible al inicio del beat 0. */
export function ScrollHint() {
  const [visible, setVisible] = useState(true)

  useEffect(
    () =>
      subscribeScroll((s) => {
        const next = s.offset < 0.035
        setVisible((prev) => (prev === next ? prev : next))
      }),
    [],
  )

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 1.6, duration: 1.2 } }}
          exit={{ opacity: 0, transition: { duration: 0.5 } }}
          className="pointer-events-none fixed inset-x-0 bottom-6 z-30 flex flex-col items-center gap-2"
        >
          <span className="font-body text-[10px] font-light uppercase tracking-[0.4em] text-marfil/50">
            desliza para entrar
          </span>
          <motion.span
            aria-hidden="true"
            animate={{ y: [0, 7, 0], opacity: [0.35, 0.8, 0.35] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            className="text-ambar/80"
          >
            ↓
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
