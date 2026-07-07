/**
 * La colección LEGADO — datos de web/js/products.js (fuente de verdad de la
 * web estática). Los enlaces llevan al configurador de materiales de cada
 * modelo (producto.html).
 *
 * Esta app se sirve en la RAÍZ del sitio unificado (tools/build-site.sh copia
 * su dist/ sobre la raíz), por eso las rutas son './'. En dev (5179) los
 * enlaces externos 404ean: es esperado.
 */

const ROOT = './'

export interface Model {
  id: string
  name: string
  claim: string
  blurb: string
  price: number
  tags: string[]
  img: string
  href: string
}

export const MODELS: Model[] = [
  {
    id: 'nordic',
    name: 'Nordic',
    claim: 'La línea clara.',
    blurb: 'Silueta escandinava, patas de roble visto. El sillón que ordena un salón sin pedir permiso.',
    price: 820,
    tags: ['Lino lavado', 'Roble visto', 'Relax modern'],
    img: 'assets/nordic.webp',
    href: `${ROOT}producto.html?modelo=nordic#configurador`,
  },
  {
    id: 'venus',
    name: 'Venus',
    claim: 'El giro moderno.',
    blurb: 'Base giratoria y reposacabezas reclinable. Pensado para salones abiertos que se miran desde todas partes.',
    price: 760,
    tags: ['Base giratoria', 'Cabezal reclinable', 'Bouclé'],
    img: 'assets/venus.webp',
    href: `${ROOT}producto.html?modelo=venus#configurador`,
  },
  {
    id: 'baltic',
    name: 'Baltic',
    claim: 'El rincón propio.',
    blurb: 'Líneas mínimas, cuero que se patina, patas de madera cálida. Hecho para una lámpara, una manta y dos horas de libro.',
    price: 890,
    tags: ['Cuero de Ubrique', 'Madera cálida', 'Lectura'],
    img: 'assets/baltic.webp',
    href: `${ROOT}producto.html?modelo=baltic#configurador`,
  },
  {
    id: 'lara',
    name: 'Lara',
    claim: 'El que cuida.',
    blurb: 'Laterales envolventes, respaldo alto y motor de elevación. Ayuda a levantarse y no parece ortopédico: parece un buen sillón.',
    price: 1190,
    tags: ['Motor elevador', 'Respaldo alto', 'Confort'],
    img: 'assets/lara.webp',
    href: `${ROOT}producto.html?modelo=lara#configurador`,
  },
]

export const LINKS = {
  home: `${ROOT}index.html`,
  coleccion: '#coleccion',
  configurador: `${ROOT}producto.html#configurador`,
  historia: `${ROOT}historia.html`,
  venus3d: './experiences/venus-legado/dist/index.html',
}
