import { LINKS } from '../data/models'
import { ArrowUpRight } from './icons'

const NAV_LINKS = [
  { label: 'Colección', href: LINKS.coleccion },
  { label: 'Configurador', href: LINKS.configurador },
  { label: 'Historia', href: LINKS.historia },
  { label: 'Vive el Venus', href: LINKS.venus3d },
]

export function Navbar() {
  return (
    <nav className="fixed left-0 right-0 top-4 z-50 flex items-center justify-between px-8 lg:px-16">
      <a
        href={LINKS.home}
        className="liquid-glass flex h-12 w-12 items-center justify-center rounded-full"
        aria-label="LEGADO — inicio"
      >
        <span className="font-heading text-2xl italic text-marfil">L</span>
      </a>

      <div className="liquid-glass hidden items-center rounded-full px-1.5 py-1.5 md:flex">
        {NAV_LINKS.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="px-3 py-2 font-body text-sm font-medium text-marfil/90 transition-colors duration-300 hover:text-ambar"
          >
            {link.label}
          </a>
        ))}
        <a
          href={LINKS.configurador}
          className="ml-1 flex items-center gap-1.5 rounded-full bg-marfil px-4 py-2 font-body text-sm font-semibold text-ebano transition-colors duration-300 hover:bg-ambar"
        >
          Configura tu sillón
          <ArrowUpRight className="h-4 w-4" />
        </a>
      </div>

      <div className="h-12 w-12" aria-hidden="true" />
    </nav>
  )
}
