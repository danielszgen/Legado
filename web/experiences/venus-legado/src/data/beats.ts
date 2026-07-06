/**
 * Hero + los 7 beats narrativos de la experiencia «Vive el Venus».
 *
 * El hero (id 0) arranca FUERA de la casa: la cámara mira la puerta iluminada
 * y, al deslizar, cruza el umbral hacia el rincón del salón donde espera el
 * Venus. Los beats 1–7 son el guion del brief con sus textos exactos.
 *
 * NOTA DE AUTORÍA: el storyboard `3d/storyboards/venus-legado.md` y la ficha
 * `3d/venus-ficha.md` no existen en el repo. Los titulares y chips son los
 * textos exactos del brief; el micro-copy sigue la voz de marca de
 * `web/js/products.js`. Las cámaras ancla están definidas para un modelo
 * normalizado a ~1.45 u de alto apoyado en y=0 (ver VenusModel.tsx, que
 * loguea el tamaño real del glb y aplica esa normalización). La puerta de
 * entrada está en z≈9.3 (SceneEnvironment); el tramo hero→beat 1 la cruza.
 */

export type Vec3 = [number, number, number]

export interface Beat {
  id: number
  /** Titular (en los beats narrativos, exacto del brief) */
  title: string
  /** Micro-copy de apoyo (voz de marca LEGADO) */
  sub: string
  /** Chips de beneficio (pills liquid-glass) */
  chips: string[]
  /** Cámara ancla: posición */
  camPos: Vec3
  /** Cámara ancla: punto de mira */
  camTarget: Vec3
  /** Colocación de la tarjeta de texto */
  align: 'left' | 'right' | 'center'
  /** Portada: texto grande centrado, sin tarjeta ni numeración */
  hero?: boolean
  /** Muestra la CTA final */
  cta?: boolean
}

export const BEATS: Beat[] = [
  {
    id: 0,
    title: 'Vive el Venus',
    sub: 'Una experiencia LEGADO. Entra: la casa ya está encendida.',
    chips: [],
    camPos: [1.6, 1.5, 13.8],
    camTarget: [0.6, 1.15, 9.0],
    align: 'center',
    hero: true,
  },
  {
    id: 1,
    title: 'Hay casas que se recuerdan por una silla.',
    sub: 'Entra despacio. La luz de la tarde ya sabe dónde va.',
    chips: [],
    camPos: [0.7, 1.6, 7.6],
    camTarget: [0, 0.85, 0],
    align: 'center',
  },
  {
    id: 2,
    title: 'Un lugar donde alguien a quien quieres pasa sus mejores horas.',
    sub: 'No es un mueble más: es el sitio de alguien. El suyo.',
    chips: [],
    camPos: [1.9, 1.35, 4.6],
    camTarget: [0, 0.78, 0],
    align: 'left',
  },
  {
    id: 3,
    title: 'Gira hacia la luz, hacia la conversación, hacia quien quieres.',
    sub: 'Sin levantarse, sin esfuerzo. El salón entero, a un gesto.',
    chips: ['Base giratoria'],
    camPos: [2.5, 1.18, 2.9],
    camTarget: [0, 0.7, 0],
    align: 'right',
  },
  {
    id: 4,
    title: 'El respaldo cede contigo. El cabezal encuentra tu nuca.',
    sub: 'Cada lectura, cada siesta, con el apoyo exacto.',
    chips: ['Cabezal reclinable'],
    camPos: [-2.05, 1.7, 2.95],
    camTarget: [0, 0.95, 0.05],
    align: 'left',
  },
  {
    id: 5,
    title: 'Un descanso que también cuida el cuerpo. Calor que abraza.',
    sub: 'Masaje suave y calor envolvente para los días largos.',
    chips: ['Masaje', 'Manta calefactora'],
    camPos: [-1.85, 1.15, 3.0],
    camTarget: [0, 0.65, 0],
    align: 'right',
  },
  {
    id: 6,
    title: 'Y cuando toca levantarse, te acompaña. Con dignidad.',
    sub: 'Dos motores que elevan el asiento hasta ponerte de pie.',
    chips: ['Relax 2 Motores elevador'],
    camPos: [1.4, 1.12, 2.85],
    camTarget: [0, 0.58, 0],
    align: 'left',
  },
  {
    id: 7,
    title: 'Hecho para quedarse. Para acompañar toda una vida.',
    sub: 'Venus, de LEGADO. Hecho bajo demanda en España. Garantía de 20 años.',
    chips: [],
    camPos: [0.3, 1.28, 4.1],
    camTarget: [-0.15, 0.72, 0],
    align: 'center',
    cta: true,
  },
]

/** Número de segmentos de interpolación entre anclas */
export const SEGMENTS = BEATS.length - 1

/** Beats narrativos (sin el hero), para numeración 01/07 */
export const STORY_COUNT = BEATS.filter((b) => !b.hero).length
