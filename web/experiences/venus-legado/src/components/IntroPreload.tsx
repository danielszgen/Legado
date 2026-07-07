import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useProgress } from '@react-three/drei'
import { startReveal } from '../lib/introBus'

const BASE = import.meta.env.BASE_URL
const SALON = `${BASE}assets/3d/posters/intro-salon.webp`
const BUTACA = `${BASE}assets/3d/posters/intro-butaca.webp`

type Stage = 'salon' | 'butaca' | 'fade' | 'gone'

/**
 * Precarga cinematográfica (~1 s de imágenes):
 *  1. Vista general del salón (render sección de ladrillo), zoom hacia la butaca.
 *  2. Corte al rincón: la butaca con el mecanismo abierto, el zoom continúa.
 *  3. Fundido transparente al 3D: la cámara ya está clavada en el mismo
 *     encuadre y la butaca cierra su mecanismo mientras viaja al hero.
 * El paso 3 no arranca hasta que el glb está cargado (la imagen 2 aguanta).
 */
export function IntroPreload() {
  const { active, progress } = useProgress()
  const [stage, setStage] = useState<Stage>('salon')
  const [minPassed, setMinPassed] = useState(false)

  useEffect(() => {
    const t1 = window.setTimeout(() => setStage((s) => (s === 'salon' ? 'butaca' : s)), 500)
    const t2 = window.setTimeout(() => setMinPassed(true), 1000)
    // Red de seguridad: si el glb tarda demasiado, revelamos igualmente
    const t3 = window.setTimeout(() => setMinPassed(true), 8000)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      window.clearTimeout(t3)
    }
  }, [])

  useEffect(() => {
    if (stage === 'butaca' && minPassed && progress >= 100 && !active) {
      startReveal()
      setStage('fade')
    }
  }, [stage, minPassed, progress, active])

  return (
    <AnimatePresence>
      {stage !== 'gone' && (
        <motion.div
          className="fixed inset-0 z-50 overflow-hidden bg-ebano"
          animate={{ opacity: stage === 'fade' ? 0 : 1 }}
          transition={{ duration: 0.65, ease: 'easeInOut' }}
          onAnimationComplete={() => {
            if (stage === 'fade') setStage('gone')
          }}
        >
          {/* 1 · Vista general del salón, acercándose a la butaca */}
          <motion.img
            src={SALON}
            alt="Salón LEGADO visto en sección: la butaca Venus junto al ventanal"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ transformOrigin: '58% 55%' }}
            initial={{ scale: 1 }}
            animate={{ scale: 1.18 }}
            transition={{ duration: 1.2, ease: [0.4, 0, 0.6, 1] }}
          />
          {/* 2 · El rincón: la butaca con su mecanismo abierto */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: stage === 'salon' ? 0 : 1 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <motion.img
              src={BUTACA}
              alt="La butaca Venus reclinada, con el mecanismo abierto, junto al ventanal en arco"
              className="absolute inset-0 h-full w-full object-cover"
              style={{ transformOrigin: '55% 58%' }}
              initial={{ scale: 1.05 }}
              animate={{ scale: 1.16 }}
              transition={{ duration: 1.4, ease: [0.3, 0, 0.55, 1] }}
            />
          </motion.div>

          {/* Velo cálido + marca + progreso de carga */}
          <div className="absolute inset-0 bg-gradient-to-t from-ebano/70 via-transparent to-ebano/40" />
          <div className="absolute inset-x-0 bottom-10 flex flex-col items-center gap-3">
            <div className="font-body text-[10px] font-normal uppercase tracking-[0.5em] text-marfil/80">
              Legado
            </div>
            <div className="h-px w-36 overflow-hidden bg-marfil/15">
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
