import { motion, type Variants } from 'framer-motion'

/** power2.out (gsap) ≈ cubic-bezier(0.215, 0.61, 0.355, 1) */
const POWER2_OUT: [number, number, number, number] = [0.215, 0.61, 0.355, 1]

const wordVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
    filter: 'blur(10px)',
    transition: { duration: 0.25, ease: 'easeIn' },
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.75, ease: POWER2_OUT },
  },
}

interface BlurTextProps {
  text: string
  active: boolean
  className?: string
  /** Retardo antes del primer término (s) */
  delay?: number
  /** Stagger entre palabras (s) */
  stagger?: number
}

/**
 * Aparición estilo BlurText: blur(10px)→0, opacity 0→1, y 30→0,
 * palabra a palabra con stagger.
 */
export function BlurText({ text, active, className, delay = 0, stagger = 0.055 }: BlurTextProps) {
  const containerVariants: Variants = {
    hidden: { transition: { staggerChildren: 0.015 } },
    visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
  }

  return (
    <motion.span
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate={active ? 'visible' : 'hidden'}
      aria-label={text}
    >
      {text.split(' ').map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          variants={wordVariants}
          className="inline-block will-change-[transform,filter,opacity]"
          aria-hidden="true"
        >
          {word}
          {' '}
        </motion.span>
      ))}
    </motion.span>
  )
}
