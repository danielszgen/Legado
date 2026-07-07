import { motion } from 'framer-motion'

interface BlurTextProps {
  text: string
  className?: string
  /** Retardo base antes de la primera palabra (s) */
  delay?: number
}

/**
 * Aparición palabra a palabra: blur(10px)→0, opacity 0→1, y 50→0,
 * disparada al entrar en viewport (threshold 0.1), stagger 100 ms.
 */
export function BlurText({ text, className, delay = 0 }: BlurTextProps) {
  return (
    <span
      className={className}
      style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', rowGap: '0.1em' }}
      aria-label={text}
    >
      {text.split(' ').map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          initial={{ filter: 'blur(10px)', opacity: 0, y: 50 }}
          whileInView={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.7, delay: delay + i * 0.1, ease: 'easeOut' }}
          style={{ display: 'inline-block', marginRight: '0.28em' }}
          aria-hidden="true"
        >
          {word}
        </motion.span>
      ))}
    </span>
  )
}
