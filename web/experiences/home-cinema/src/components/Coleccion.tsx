import { motion } from 'framer-motion'
import { FadingVideo } from './FadingVideo'
import { BlurText } from './BlurText'
import { MODELS, LINKS, type Model } from '../data/models'
import { ArrowUpRight, SwatchIcon, ArmchairIcon } from './icons'

const SECTION_VIDEO =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_093722_ccfc7ebf-182f-419f-8a62-2dc02db7dd9d.mp4'

function ModelCard({ model, index }: { model: Model; index: number }) {
  return (
    <motion.a
      href={model.href}
      initial={{ filter: 'blur(10px)', opacity: 0, y: 24 }}
      whileInView={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, delay: index * 0.12, ease: 'easeOut' }}
      className="liquid-glass group flex min-h-[420px] flex-col rounded-[1.25rem] p-5"
    >
      <div className="relative overflow-hidden rounded-[0.9rem]">
        <img
          src={model.img}
          alt={`Sillón ${model.name}`}
          loading="lazy"
          className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
        <span className="liquid-glass !absolute right-2 top-2 rounded-full px-3 py-1 font-body text-[11px] text-marfil">
          desde {model.price} €
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {model.tags.map((tag) => (
          <span
            key={tag}
            className="liquid-glass whitespace-nowrap rounded-full px-3 py-1 font-body text-[11px] text-marfil/90"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="flex-1" />

      <div className="mt-5">
        <div className="font-heading text-3xl italic leading-none tracking-[-1px] text-marfil md:text-4xl">
          {model.name}
        </div>
        <p className="mt-2 max-w-[32ch] font-body text-sm font-light leading-snug text-marfil/90">
          <span className="text-ambar">{model.claim}</span> {model.blurb}
        </p>
        <span className="mt-4 inline-flex items-center gap-1.5 font-body text-xs font-medium uppercase tracking-[0.18em] text-marfil/70 transition-colors duration-300 group-hover:text-ambar">
          Elegir materiales
          <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </motion.a>
  )
}

export function Coleccion() {
  return (
    <section id="coleccion" className="relative min-h-screen overflow-hidden bg-ebano">
      <img
        src="assets/coleccion-fondo.webp"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 z-0 h-full w-full object-cover opacity-35"
      />
      <FadingVideo
        src={SECTION_VIDEO}
        className="absolute inset-0 z-0 h-full w-full object-cover"
        style={{ filter: 'sepia(0.55) saturate(0.7) brightness(0.72) hue-rotate(-8deg)' }}
      />
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-ebano/85 via-ebano/60 to-ebano/90" />

      <div className="relative z-10 flex min-h-screen flex-col px-8 pb-10 pt-24 md:px-16 lg:px-20">
        <div className="mb-auto">
          <div className="mb-6 font-body text-sm text-marfil/80">// La colección</div>
          <h2 className="font-heading text-6xl italic leading-[0.9] tracking-[-2px] text-marfil md:text-7xl lg:text-[6rem]">
            <BlurText text="Cuatro piezas," className="!justify-start" />
            <BlurText text="una vida entera" delay={0.25} className="!justify-start" />
          </h2>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {MODELS.map((model, i) => (
            <ModelCard key={model.id} model={model} index={i} />
          ))}
        </div>

        {/* Empuje final al configurador de materiales */}
        <motion.div
          initial={{ filter: 'blur(10px)', opacity: 0, y: 20 }}
          whileInView={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="mt-14 flex flex-col items-center gap-5"
        >
          <div className="flex items-center gap-3 font-body text-xs uppercase tracking-[0.3em] text-marfil/60">
            <SwatchIcon className="h-4 w-4 text-ambar" />
            Cuero de Ubrique · Lino de Valencia · Bouclé · Terciopelo · Roble · Nogal
          </div>
          <a
            href={LINKS.configurador}
            className="liquid-glass-strong flex items-center gap-3 rounded-full px-8 py-3.5 font-body text-sm font-medium uppercase tracking-[0.2em] text-marfil transition-colors duration-300 hover:text-ambar"
          >
            <ArmchairIcon className="h-5 w-5 text-ambar" />
            Abrir el configurador de materiales
            <ArrowUpRight className="h-4 w-4" />
          </a>
          <div className="font-body text-[11px] font-light uppercase tracking-[0.3em] text-marfil/40">
            Legado · Hecho en España · MMXXVI
          </div>
        </motion.div>
      </div>
    </section>
  )
}
