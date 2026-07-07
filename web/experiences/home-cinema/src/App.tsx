import { useState } from 'react'
import { Hero } from './components/Hero'
import { Coleccion } from './components/Coleccion'
import { IntroHome } from './components/IntroHome'

export default function App() {
  // El contenido monta cuando la precarga empieza a fundirse: el hero anima
  // su entrada bajo el fundido.
  const [ready, setReady] = useState(false)

  return (
    <main className="bg-ebano font-body text-marfil">
      {ready && (
        <>
          <Hero />
          <Coleccion />
        </>
      )}
      <IntroHome onReveal={() => setReady(true)} />
    </main>
  )
}
