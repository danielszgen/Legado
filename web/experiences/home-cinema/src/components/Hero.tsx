import { motion } from 'framer-motion'
import { TinyWorld } from './TinyWorld'
import { BlurText } from './BlurText'
import { Navbar } from './Navbar'
import { MODELS, LINKS } from '../data/models'
import { ArrowUpRight, Play, ClockIcon, ShieldIcon } from './icons'

const blurIn = {
  initial: { filter: 'blur(10px)', opacity: 0, y: 20 },
  animate: { filter: 'blur(0px)', opacity: 1, y: 0 },
}

function Reveal({ delay, className, children }: { delay: number; className?: string; children: React.ReactNode }) {
  return (
    <motion.div {...blurIn} transition={{ duration: 0.8, delay, ease: 'easeOut' }} className={className}>
      {children}
    </motion.div>
  )
}

export function Hero() {
  return (
    <section className="relative h-screen overflow-hidden bg-ebano">
      {/* Fondo oscuro cálido con el salón proyectado como «mundo redondo»
          (efecto insta360) girando despacio en el centro */}
      <div
        className="absolute inset-0 z-0"
        style={{ background: 'radial-gradient(60% 55% at 50% 46%, #1d1409 0%, #120d07 45%, #0b0a08 100%)' }}
      />
      <div className="absolute left-1/2 top-[46%] z-0 -translate-x-1/2 -translate-y-1/2">
        {/* halo ámbar tras el planeta */}
        <div
          className="absolute left-1/2 top-1/2 h-[86vmin] w-[86vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(201,168,106,0.16) 30%, rgba(201,168,106,0.05) 55%, transparent 70%)' }}
        />
        <TinyWorld src="assets/salon-mundo.webp" className="relative h-[78vmin] w-[78vmin]" />
      </div>
      {/* Velo cálido para legibilidad del texto */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-t from-ebano via-ebano/25 to-ebano/55" />

      <div className="relative z-10 flex h-full flex-col">
        <Navbar />

        <div className="flex flex-1 flex-col items-center justify-center px-4 pt-24 text-center">
          <Reveal delay={0.4}>
            <div className="liquid-glass flex items-center gap-3 rounded-full py-1.5 pl-1.5 pr-5">
              <span className="rounded-full bg-marfil px-3 py-1 font-body text-[11px] font-semibold uppercase tracking-wide text-ebano">
                Bajo demanda
              </span>
              <span className="font-body text-xs font-light text-marfil/90 md:text-sm">
                4 piezas · 4 semanas · 20 años de garantía
              </span>
            </div>
          </Reveal>

          <h1 className="mt-6 max-w-3xl">
            <BlurText
              text="Sillones para toda la vida. Hechos para quedarse."
              delay={0.5}
              className="font-heading text-6xl italic leading-[0.95] tracking-[-0.03em] text-marfil md:text-7xl lg:text-[5.5rem]"
            />
          </h1>

          <motion.p
            {...blurIn}
            transition={{ duration: 0.8, delay: 0.8, ease: 'easeOut' }}
            className="mt-4 max-w-2xl font-body text-sm font-light leading-tight text-marfil md:text-base"
          >
            Cuatro modelos hechos bajo demanda en talleres españoles. Madera con nombre, telas con
            origen y mecanismos que cuidan a quien más quieres. Elige el tuyo y hazlo tuyo de verdad:
            tapizado, color y madera.
          </motion.p>

          <Reveal delay={1.1} className="mt-6 flex items-center gap-6">
            <a
              href={LINKS.configurador}
              className="liquid-glass-strong flex items-center gap-2 rounded-full px-5 py-2.5 font-body text-sm font-medium text-marfil transition-colors duration-300 hover:text-ambar"
            >
              Configura tu sillón
              <ArrowUpRight className="h-4 w-4" />
            </a>
            <a
              href={LINKS.venus3d}
              className="flex items-center gap-2 font-body text-sm font-medium text-marfil/90 transition-colors duration-300 hover:text-ambar"
            >
              <Play className="h-4 w-4" />
              Vive el Venus en 3D
            </a>
          </Reveal>

          <Reveal delay={1.3} className="mt-8 flex flex-wrap justify-center gap-4">
            <div className="liquid-glass w-[220px] rounded-[1.25rem] p-5 text-left">
              <ClockIcon className="h-6 w-6 text-ambar" />
              <div className="mt-4 font-heading text-4xl italic leading-none tracking-[-1px] text-marfil">
                4 semanas
              </div>
              <div className="mt-2 font-body text-xs font-light text-marfil/80">
                Del taller a tu salón. Sin stock, sin temporadas.
              </div>
            </div>
            <div className="liquid-glass w-[220px] rounded-[1.25rem] p-5 text-left">
              <ShieldIcon className="h-6 w-6 text-ambar" />
              <div className="mt-4 font-heading text-4xl italic leading-none tracking-[-1px] text-marfil">
                20 años
              </div>
              <div className="mt-2 font-body text-xs font-light text-marfil/80">
                De garantía en estructura y mecanismo.
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal delay={1.4} className="flex flex-col items-center gap-4 pb-8">
          <div className="liquid-glass rounded-full px-5 py-2">
            <span className="font-body text-xs font-light text-marfil/80">
              La colección — cuatro maneras de quedarse
            </span>
          </div>
          <div className="flex gap-12 md:gap-16">
            {MODELS.map((model) => (
              <a
                key={model.id}
                href={model.href}
                className="font-heading text-2xl italic tracking-tight text-marfil/90 transition-colors duration-300 hover:text-ambar md:text-3xl"
              >
                {model.name}
              </a>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
