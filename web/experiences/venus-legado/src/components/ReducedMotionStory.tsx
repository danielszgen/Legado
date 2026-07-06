import { BEATS, STORY_COUNT } from '../data/beats'
import { GlassCard, GlassPill, GlassButton } from './LiquidGlass'

const STORY_BEATS = BEATS.filter((b) => !b.hero)

const BASE = import.meta.env.BASE_URL
const POSTERS = [
  `${BASE}assets/3d/posters/venus-poster.webp`,
  `${BASE}assets/3d/posters/venus-detalle.webp`,
  `${BASE}assets/3d/posters/venus-persona.webp`,
]

/**
 * Variante para prefers-reduced-motion: sin scroll-3D ni animaciones.
 * Secuencia estática de los beats con las mismas palabras, scroll normal.
 */
export function ReducedMotionStory() {
  return (
    <main className="min-h-screen bg-ebano font-body text-marfil">
      <header className="px-6 pb-4 pt-14 text-center">
        <div className="text-[11px] font-normal uppercase tracking-[0.5em] text-ambar">Legado</div>
        <h1 className="mt-4 font-heading text-5xl italic tracking-tightest">Vive el Venus</h1>
      </header>

      {STORY_BEATS.map((beat, i) => (
        <section key={beat.id} className="mx-auto max-w-3xl px-6 py-14">
          <img
            src={POSTERS[i % POSTERS.length]}
            alt={`Sillón Venus — ${beat.title}`}
            loading={i === 0 ? 'eager' : 'lazy'}
            className="aspect-[16/10] w-full rounded-2xl object-cover"
          />
          <GlassCard className="-mt-14 ml-auto mr-4 max-w-xl p-7 md:mr-10 md:p-9">
            <div className="mb-3 text-[10px] font-normal uppercase tracking-[0.32em] text-ambar/80">
              {String(beat.id).padStart(2, '0')} / {String(STORY_COUNT).padStart(2, '0')}
            </div>
            <h2 className="font-heading text-3xl italic leading-[1.12] tracking-tightest md:text-4xl">
              {beat.title}
            </h2>
            <p className="mt-3 text-sm font-light leading-relaxed text-marfil/70">{beat.sub}</p>
            {beat.chips.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2.5">
                {beat.chips.map((chip) => (
                  <GlassPill key={chip}>{chip}</GlassPill>
                ))}
              </div>
            )}
            {beat.cta && (
              <div className="mt-8 flex flex-col items-start gap-5">
                <GlassButton href="../../../producto.html?modelo=venus">
                  Descúbrelo <span aria-hidden="true" className="text-ambar">→</span>
                </GlassButton>
                <a
                  href="../../../historia.html"
                  className="text-xs font-light uppercase tracking-[0.24em] text-marfil/55 underline decoration-ambar/40 underline-offset-8"
                >
                  Ver la historia
                </a>
              </div>
            )}
          </GlassCard>
        </section>
      ))}

      <footer className="pb-16 pt-4 text-center text-[11px] font-light uppercase tracking-[0.3em] text-marfil/40">
        Hecho para quedarse · LEGADO
      </footer>
    </main>
  )
}
