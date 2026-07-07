import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const SALON = 'assets/intro-salon.webp'
const BUTACA = 'assets/intro-butaca.webp'

type Stage = 'salon' | 'butaca' | 'fade' | 'gone'

/**
 * Precarga unificada con la experiencia Venus (~1.4 s): vista general del
 * salón → zoom → corte a la butaca con el mecanismo abierto → fundido al
 * hero del «mundo redondo». onReveal se dispara al empezar el fundido para
 * que el hero anime su entrada debajo.
 */
export function IntroHome({ onReveal }: { onReveal: () => void }) {
  const [stage, setStage] = useState<Stage>('salon')

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onReveal()
      setStage('gone')
      return
    }
    const t1 = window.setTimeout(() => setStage('butaca'), 650)
    const t2 = window.setTimeout(() => {
      onReveal()
      setStage('fade')
    }, 1450)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <AnimatePresence>
      {stage !== 'gone' && (
        <motion.div
          className="fixed inset-0 z-[60] overflow-hidden bg-ebano"
          animate={{ opacity: stage === 'fade' ? 0 : 1 }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
          onAnimationComplete={() => {
            if (stage === 'fade') setStage('gone')
          }}
        >
          <motion.img
            src={SALON}
            alt="Salón LEGADO visto en sección: la butaca Venus junto al ventanal"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ transformOrigin: '58% 55%' }}
            initial={{ scale: 1 }}
            animate={{ scale: 1.18 }}
            transition={{ duration: 1.5, ease: [0.4, 0, 0.6, 1] }}
          />
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
              transition={{ duration: 1.6, ease: [0.3, 0, 0.55, 1] }}
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-ebano/70 via-transparent to-ebano/40" />
          <div className="absolute inset-x-0 bottom-10 flex justify-center">
            <div className="font-body text-[10px] font-normal uppercase tracking-[0.5em] text-marfil/80">
              Legado
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
