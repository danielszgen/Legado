import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useProgress } from '@react-three/drei'

const POSTER_URL = `${import.meta.env.BASE_URL}assets/3d/posters/venus-poster.webp`

/**
 * Poster de respaldo mientras carga el glb (Suspense mantiene la escena
 * vacía hasta entonces). Se desvanece al completarse la carga.
 */
export function Loader() {
  const { active, progress } = useProgress()
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (progress >= 100 && !active) {
      const t = window.setTimeout(() => setDone(true), 650)
      return () => window.clearTimeout(t)
    }
  }, [progress, active])

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          exit={{ opacity: 0, transition: { duration: 1.1, ease: 'easeInOut' } }}
          className="fixed inset-0 z-50 bg-ebano"
        >
          <img
            src={POSTER_URL}
            alt="Sillón Venus en un salón cálido"
            className="h-full w-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ebano via-ebano/60 to-ebano/30" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
            <div className="font-body text-[11px] font-normal uppercase tracking-[0.5em] text-ambar">
              Legado
            </div>
            <div className="font-heading text-4xl italic tracking-tightest text-marfil md:text-5xl">
              Vive el Venus
            </div>
            <div className="mt-2 h-px w-40 overflow-hidden bg-marfil/15">
              <div
                className="h-full bg-ambar transition-[width] duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
