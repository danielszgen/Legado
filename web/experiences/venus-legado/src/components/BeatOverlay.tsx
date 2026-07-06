import { motion } from 'framer-motion'
import { BEATS, STORY_COUNT, type Beat } from '../data/beats'
import { useActiveBeat } from '../hooks/useActiveBeat'
import { BlurText } from './BlurText'
import { GlassCard, GlassPill, GlassButton } from './LiquidGlass'

const ALIGN_WRAPPER: Record<Beat['align'], string> = {
  left: 'justify-start pl-[5vw] text-left',
  right: 'justify-end pr-[5vw] text-left',
  center: 'justify-center text-center',
}

/** Portada: la entrada desde fuera de la casa — texto grande, sin tarjeta. */
function HeroCard({ beat, active }: { beat: Beat; active: boolean }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center" aria-hidden={!active}>
      <motion.div
        initial={false}
        animate={active ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.8, ease: [0.215, 0.61, 0.355, 1] }}
        className={active ? '' : 'pointer-events-none'}
      >
        <div className="mb-6 font-body text-[11px] font-normal uppercase tracking-[0.5em] text-ambar">
          Legado · Una experiencia
        </div>
        <h1 className="font-heading text-6xl italic leading-[1.05] tracking-tightest text-marfil md:text-8xl">
          <BlurText text={beat.title} active={active} stagger={0.12} />
        </h1>
        <motion.p
          initial={false}
          animate={active ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 16, filter: 'blur(6px)' }}
          transition={{ duration: 0.7, delay: active ? 0.7 : 0, ease: [0.215, 0.61, 0.355, 1] }}
          className="mx-auto mt-6 max-w-md font-body text-sm font-light leading-relaxed text-marfil/65 md:text-base"
        >
          {beat.sub}
        </motion.p>
      </motion.div>
    </div>
  )
}

function BeatCard({ beat, active }: { beat: Beat; active: boolean }) {
  return (
    <div
      className={`absolute inset-x-0 bottom-[8vh] flex px-6 md:bottom-[10vh] ${ALIGN_WRAPPER[beat.align]}`}
      aria-hidden={!active}
    >
      <motion.div
        initial={false}
        animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
        transition={{ duration: 0.7, ease: [0.215, 0.61, 0.355, 1] }}
        className={active ? '' : 'pointer-events-none'}
      >
        <GlassCard className={`max-w-xl p-7 md:p-9 ${beat.align === 'center' ? 'mx-auto' : ''}`}>
          <div className="mb-3 font-body text-[10px] font-normal uppercase tracking-[0.32em] text-ambar/80">
            {String(beat.id).padStart(2, '0')} / {String(STORY_COUNT).padStart(2, '0')}
          </div>

          <h2 className="font-heading text-3xl italic leading-[1.12] tracking-tightest text-marfil md:text-[2.8rem]">
            <BlurText text={beat.title} active={active} />
          </h2>

          <motion.p
            initial={false}
            animate={active ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 16, filter: 'blur(6px)' }}
            transition={{ duration: 0.7, delay: active ? 0.55 : 0, ease: [0.215, 0.61, 0.355, 1] }}
            className="mt-3 max-w-md font-body text-sm font-light leading-relaxed text-marfil/70 md:text-[15px]"
          >
            {beat.sub}
          </motion.p>

          {beat.chips.length > 0 && (
            <motion.div
              initial={false}
              animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
              transition={{ duration: 0.6, delay: active ? 0.85 : 0, ease: [0.215, 0.61, 0.355, 1] }}
              className={`mt-5 flex flex-wrap gap-2.5 ${beat.align === 'center' ? 'justify-center' : ''}`}
            >
              {beat.chips.map((chip) => (
                <GlassPill key={chip}>{chip}</GlassPill>
              ))}
            </motion.div>
          )}

          {beat.cta && (
            <motion.div
              initial={false}
              animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
              transition={{ duration: 0.7, delay: active ? 1.05 : 0, ease: [0.215, 0.61, 0.355, 1] }}
              className="pointer-events-auto mt-8 flex flex-col items-center gap-5"
            >
              <GlassButton href="../../../producto.html?modelo=venus">
                Descúbrelo
                <span aria-hidden="true" className="text-ambar">→</span>
              </GlassButton>
              <a
                href="../../../historia.html"
                className="font-body text-xs font-light uppercase tracking-[0.24em] text-marfil/55 underline decoration-ambar/40 underline-offset-8 transition-colors duration-500 hover:text-ambar"
              >
                Ver la historia
              </a>
            </motion.div>
          )}
        </GlassCard>
      </motion.div>
    </div>
  )
}

/** Capa fija de tarjetas: solo el beat activo es visible. */
export function BeatOverlay() {
  const active = useActiveBeat()
  return (
    <div className="pointer-events-none fixed inset-0 z-20">
      {BEATS.map((beat) =>
        beat.hero ? (
          <HeroCard key={beat.id} beat={beat} active={active === beat.id} />
        ) : (
          <BeatCard key={beat.id} beat={beat} active={active === beat.id} />
        ),
      )}
    </div>
  )
}
