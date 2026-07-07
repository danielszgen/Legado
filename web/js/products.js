/* ============================================================
   LEGADO · products.js
   ------------------------------------------------------------
   Modelo de datos espejo de Shopify:
   - Cada sillón = 1 product del catálogo (colección "butacas").
   - options  → opciones de variante Shopify (Tapizado / Color / Mecanismo).
   - metafields → namespace "legado" (dimensiones, segmento, persona…).
   - config   → parámetros del configurador 3D (presentación;
                en Shopify viajan como line item properties).
   ============================================================ */

// —— Tapizados (option1) + cartas de color (option2) ————————————
// Texturas y nombres según manual §20–§22. Todos los tonos cálidos.
const LEGADO_MATERIALES = [
  {
    id: 'cuero', label: 'Cuero', origen: 'Curtido vegetal · Ubrique',
    desc: 'Se patina con los años. Esa es la idea.',
    colores: [
      { id: 'cognac',  label: 'Cognac',  hex: '#B97540' },
      { id: 'tabaco',  label: 'Tabaco',  hex: '#7A4B2A' },
      { id: 'moka',    label: 'Moka',    hex: '#5C4030' },
      { id: 'castano', label: 'Castaño', hex: '#6E4E32' },
    ],
  },
  {
    id: 'lino', label: 'Lino lavado', origen: 'Tejeduría · Valencia',
    desc: 'Caída suave, tacto seco. Mejora con cada lavado.',
    colores: [
      { id: 'crudo',  label: 'Crudo',  hex: '#DCC8A6' },
      { id: 'arena',  label: 'Arena',  hex: '#C9B391' },
      { id: 'oliva',  label: 'Oliva',  hex: '#8A8460' },
      { id: 'piedra', label: 'Piedra', hex: '#A89A86' },
    ],
  },
  {
    id: 'boucle', label: 'Bouclé', origen: 'Lana rizada · Sabadell',
    desc: 'Rizo cerrado, abrigo visual. El favorito del rincón de lectura.',
    colores: [
      { id: 'crudo',  label: 'Crudo',  hex: '#E6D6B8' },
      { id: 'perla',  label: 'Perla',  hex: '#EFE7D8' },
      { id: 'avena',  label: 'Avena',  hex: '#D6C4A4' },
    ],
  },
  {
    id: 'terciopelo', label: 'Terciopelo', origen: 'Algodón · Barcelona',
    desc: 'Brillo bajo, profundidad alta. Para salones que reciben.',
    colores: [
      { id: 'botella', label: 'Verde botella', hex: '#3A4A38' },
      { id: 'burdeos', label: 'Burdeos',       hex: '#5C2630' },
      { id: 'tabaco',  label: 'Tabaco oscuro', hex: '#4A2E1E' },
    ],
  },
];

// —— Maderas de pata (line item property) ————————————————————————
const LEGADO_MADERAS = [
  { id: 'roble',   label: 'Roble natural', hex: '#B98E5A' },
  { id: 'nogal',   label: 'Nogal oscuro',  hex: '#4A3220' },
  { id: 'cerezo',  label: 'Cerezo',        hex: '#8A4A30' },
];

// —— Catálogo · Colección 2026 · 4 piezas ————————————————————————
const LEGADO_CATALOGUE = [
  {
    id: 'nordic',                       // ↔ product.handle = sillon-nordic
    name: 'Nordic',
    claim: 'La línea clara.',
    blurb: 'Silueta escandinava, patas de roble visto. El sillón que ordena un salón sin pedir permiso.',
    price: 820,
    tone: 'lino',
    segment: 'Relax modern',
    persona: 'Elena, 48 · Barcelona · Editora. Compra pocas cosas, pero compra bien.',
    posture: 'Respaldo medio que recoge la zona lumbar sin rigidez. Para leer, conversar y trabajar un rato con el portátil. Si buscas siesta profunda diaria, mira el Lara.',
    mecanismos: ['Fijo', 'Relax manual', 'Relax 1 motor · doble piecero'],
    composition: [
      'Estructura de haya maciza y tablero contrachapado de abedul.',
      'Suspensión de cinchas elásticas italianas cruzadas.',
      'Asiento HR 35 kg/m³ con manta de fibra siliconada.',
      'Patas de roble macizo torneado, acabado al aceite.',
    ],
    dimensions: { Alto: '104 cm', Ancho: '72 cm', Fondo: '80 cm', 'Altura asiento': '46 cm' },
    defaults: { material: 'lino', color: 'crudo', madera: 'roble' },
    config: {
      legStyle: 'wood-tapered', armStyle: 'slim', backHeight: 0.78,
      seatWidth: 1.0, headrest: true, swivel: false, wings: false,
    },
  },
  {
    id: 'venus',
    name: 'Venus',
    claim: 'El giro moderno.',
    blurb: 'Base giratoria y reposacabezas reclinable. Pensado para salones abiertos que se miran desde todas partes.',
    price: 760,
    tone: 'boucle',
    segment: 'Relax modern',
    persona: 'Marc, 39 · Valencia · Arquitecto. Salón abierto: la pieza tiene que funcionar a 360 grados.',
    posture: 'Asiento envolvente con cabezal que acompaña la nuca. Gira hacia la conversación o hacia la ventana. Equilibrado entre tele y lectura.',
    mecanismos: ['Relax giratorio', 'Relax 2 motores', 'Relax 2 motores + elevación'],
    composition: [
      'Estructura de acero y haya con base giratoria de aluminio lacado.',
      'Reposacabezas reclinable con núcleo articulado.',
      'Asiento HR 35 kg/m³, respaldo de fibra hueca canalizada.',
      'Base de plato giratorio con retorno suave.',
    ],
    dimensions: { Alto: '108 cm', Ancho: '76 cm', Fondo: '82 cm', 'Altura asiento': '45 cm' },
    defaults: { material: 'boucle', color: 'crudo', madera: 'nogal' },
    config: {
      legStyle: 'swivel', armStyle: 'curved', backHeight: 0.92,
      seatWidth: 1.02, headrest: true, swivel: true, wings: false,
    },
  },
  {
    id: 'baltic',
    name: 'Baltic',
    claim: 'El rincón propio.',
    blurb: 'Líneas mínimas, cuero que se patina, patas de madera cálida. Hecho para una lámpara, una manta y dos horas de libro.',
    price: 890,
    tone: 'cognac',
    segment: 'Racó de descans',
    persona: 'Carmen, 58 · Girona · Maestra. Quiere un rincón de lectura junto a la ventana.',
    posture: 'Respaldo estructurado con doble piecero: las piernas suben, el libro queda a la distancia justa. La postura de quedarse.',
    mecanismos: ['Relax 1 motor · doble piecero', 'Relax 2 motores · doble piecero'],
    composition: [
      'Estructura de haya maciza de bosque gestionado.',
      'Cuero de curtido vegetal de Ubrique, flor corregida mínima.',
      'Asiento viscoelástico sobre HR 38 kg/m³.',
      'Patas de nogal macizo, acabado a la cera.',
    ],
    dimensions: { Alto: '101 cm', Ancho: '74 cm', Fondo: '78 cm', 'Altura asiento': '47 cm' },
    defaults: { material: 'cuero', color: 'cognac', madera: 'nogal' },
    config: {
      legStyle: 'wood-straight', armStyle: 'block', backHeight: 0.74,
      seatWidth: 1.04, headrest: false, swivel: false, wings: false, tufted: true,
    },
  },
  {
    id: 'lara',
    name: 'Lara',
    claim: 'El que cuida.',
    blurb: 'Laterales envolventes, respaldo alto y motor de elevación. Un sillón que ayuda a levantarse y no parece ortopédico: parece, simplemente, un buen sillón.',
    price: 1190,
    tone: 'tabaco',
    segment: 'Cura a casa',
    persona: 'Antonio, 74 · Zaragoza — y sus hijos, que son quienes lo eligen y lo regalan.',
    posture: 'Respaldo alto que sostiene cabeza y cervicales, asiento más firme en el borde para apoyar la salida. El motor de elevación inclina el sillón entero y acompaña el gesto de ponerse en pie.',
    mecanismos: ['Relax 1 motor · doble piecero', 'Motor elevación · levantapersonas', 'Relax 2 motores', 'Balancín giratorio motorizado'],
    composition: [
      'Estructura reforzada de haya con herrajes de acero.',
      'Mecanismo de elevación con motor silencioso alemán.',
      'Asiento HR 40 kg/m³ de firmeza progresiva.',
      'Tapizado desenfundable en los brazos, fácil de mantener.',
    ],
    dimensions: { Alto: '112 cm', Ancho: '78 cm', Fondo: '84 cm', 'Altura asiento': '49 cm' },
    defaults: { material: 'lino', color: 'arena', madera: 'nogal' },
    config: {
      legStyle: 'hidden', armStyle: 'wrap', backHeight: 1.0,
      seatWidth: 1.06, headrest: true, swivel: false, wings: true, tufted: true,
    },
  },
];

// —— Salas del configurador (presentación) ———————————————————————
const LEGADO_SALAS = [
  { id: 'estudio',      label: 'Estudio',      desc: 'Fondo infinito marfil' },
  { id: 'moderno',      label: 'Moderno',      desc: 'Roble claro, líneas rectas' },
  { id: 'rustico',      label: 'Rústico',      desc: 'Viga, barro y lana' },
  { id: 'mediterraneo', label: 'Mediterráneo', desc: 'Cal, arco y olivo' },
  { id: 'clasico',      label: 'Clásico',      desc: 'Nogal, libros y latón' },
];

const LEGADO_POSTURAS = [
  { id: 'sentado', label: 'Sentado',  back: 0,    foot: 0 },
  { id: 'lectura', label: 'Lectura',  back: 0.18, foot: 0.55 },
  { id: 'relax',   label: 'Relax',    back: 0.38, foot: 1.0 },
  { id: 'siesta',  label: 'Siesta',   back: 0.62, foot: 1.0 },
];

function legadoFormatPrice(n) {
  return n.toLocaleString('es-ES') + ' €';
}

function legadoGetProduct(id) {
  return LEGADO_CATALOGUE.find(p => p.id === id) || LEGADO_CATALOGUE[0];
}

function legadoGetMaterial(id) {
  return LEGADO_MATERIALES.find(m => m.id === id) || LEGADO_MATERIALES[0];
}

window.LEGADO = {
  catalogue: LEGADO_CATALOGUE,
  materiales: LEGADO_MATERIALES,
  maderas: LEGADO_MADERAS,
  salas: LEGADO_SALAS,
  posturas: LEGADO_POSTURAS,
  formatPrice: legadoFormatPrice,
  getProduct: legadoGetProduct,
  getMaterial: legadoGetMaterial,
};
