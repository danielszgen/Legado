import { useEffect, useState } from 'react'
import { onIntroDone } from './lib/introBus'
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion'
import { Scene3D } from './components/Scene3D'
import { BeatOverlay } from './components/BeatOverlay'
import { ProgressBar } from './components/ProgressBar'
import { ScrollHint } from './components/ScrollHint'
import { CursorGlow } from './components/CursorGlow'
import { IntroPreload } from './components/IntroPreload'
import { ReducedMotionStory } from './components/ReducedMotionStory'

export default function App() {
  const reducedMotion = usePrefersReducedMotion()
  // La UI narrativa espera a que la cámara complete el viaje de la intro
  const [introDone, setIntroDone] = useState(false)
  useEffect(() => onIntroDone(() => setIntroDone(true)), [])

  if (reducedMotion) return <ReducedMotionStory />

  return (
    <main className="h-screen w-screen overflow-hidden bg-ebano font-body text-marfil">
      <Scene3D />
      {/* Viñeta cinematográfica sobre el canvas, bajo la UI */}
      <div className="cine-vignette pointer-events-none fixed inset-0 z-10" aria-hidden="true" />
      <CursorGlow />
      {/* La UI narrativa aparece cuando la intro suelta la cámara */}
      {introDone && (
        <>
          <BeatOverlay />
          <ProgressBar />
          <ScrollHint />
        </>
      )}
      {/* Marca fija, vuelta a la home */}
      <a
        href="../../../index.html"
        className="pointer-events-auto fixed left-6 top-5 z-40 font-body text-[11px] font-normal uppercase tracking-[0.5em] text-marfil/70 transition-colors duration-500 hover:text-ambar md:left-10"
      >
        Legado
      </a>
      <IntroPreload />
    </main>
  )
}
