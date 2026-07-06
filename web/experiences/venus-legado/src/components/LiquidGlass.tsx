import type { AnchorHTMLAttributes, HTMLAttributes, ReactNode } from 'react'

/** Utilidades Liquid Glass (tinte cálido LEGADO) */

export function GlassCard({
  children,
  className = '',
  ...rest
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div className={`liquid-glass rounded-2xl ${className}`} {...rest}>
      {children}
    </div>
  )
}

export function GlassPill({ children }: { children: ReactNode }) {
  return (
    <span className="liquid-glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-body text-[11px] font-normal uppercase tracking-[0.18em] text-marfil/90">
      <span className="h-1 w-1 rounded-full bg-ambar" aria-hidden="true" />
      {children}
    </span>
  )
}

export function GlassButton({
  children,
  className = '',
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode }) {
  return (
    <a
      className={`liquid-glass-strong inline-flex items-center gap-3 rounded-full px-9 py-4 font-body text-[13px] font-medium uppercase tracking-[0.22em] text-marfil transition-colors duration-500 hover:text-ambar ${className}`}
      {...rest}
    >
      {children}
    </a>
  )
}
