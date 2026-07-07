import { useEffect, useRef, useState, type CSSProperties } from 'react'

interface FadingVideoProps {
  src: string | string[]
  className?: string
  style?: CSSProperties
}

/**
 * Vídeo de fondo con fundidos: entra al cargar (500 ms), se desvanece cuando
 * quedan ≤0.55 s (550 ms) y, al terminar, repite (o avanza si src es lista).
 * Si el vídeo no puede cargar, se queda transparente y se ve la imagen de
 * respaldo que haya debajo.
 */
export function FadingVideo({ src, className, style }: FadingVideoProps) {
  const sources = Array.isArray(src) ? src : [src]
  const [index, setIndex] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const rafRef = useRef(0)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const fade = (from: number, to: number, ms: number, done?: () => void) => {
      cancelAnimationFrame(rafRef.current)
      const start = performance.now()
      const tick = (now: number) => {
        const k = Math.min(1, (now - start) / ms)
        video.style.opacity = String(from + (to - from) * k)
        if (k < 1) rafRef.current = requestAnimationFrame(tick)
        else done?.()
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    let fadingOut = false

    const onLoaded = () => {
      fadingOut = false
      fade(0, 1, 500)
    }
    const onTime = () => {
      if (fadingOut || !video.duration) return
      if (video.duration - video.currentTime <= 0.55) {
        fadingOut = true
        fade(1, 0, 550)
      }
    }
    const onEnded = () => {
      if (sources.length > 1) {
        setIndex((i) => (i + 1) % sources.length)
      } else {
        video.currentTime = 0
        void video.play()
        fadingOut = false
        fade(0, 1, 500)
      }
    }

    video.addEventListener('loadeddata', onLoaded)
    video.addEventListener('timeupdate', onTime)
    video.addEventListener('ended', onEnded)
    return () => {
      cancelAnimationFrame(rafRef.current)
      video.removeEventListener('loadeddata', onLoaded)
      video.removeEventListener('timeupdate', onTime)
      video.removeEventListener('ended', onEnded)
    }
  }, [sources.length, index])

  return (
    <video
      ref={videoRef}
      key={sources[index]}
      src={sources[index]}
      className={className}
      style={{ opacity: 0, ...style }}
      autoPlay
      muted
      playsInline
      preload="auto"
    />
  )
}
