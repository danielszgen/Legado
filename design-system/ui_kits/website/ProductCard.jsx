// ProductCard — pieza listada. Nombre, material, precio, número.
// Sin descuento, sin "últimas unidades". § 12 y § 14.

const productCardStyles = {
  card: {
    display: 'block',
    textDecoration: 'none',
    color: 'inherit',
    cursor: 'pointer',
    background: 'transparent',
    border: 'none',
    padding: 0,
    width: '100%',
    textAlign: 'left',
    fontFamily: 'inherit',
  },
  imgWrap: { position: 'relative', overflow: 'hidden' },
  no: {
    position: 'absolute', top: 14, right: 16,
    fontFamily: 'var(--font-sans)',
    fontSize: 10.5,
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
    color: 'rgba(244,239,230,0.75)',
    fontVariantNumeric: 'tabular-nums',
  },
  body: {
    padding: '20px 0 4px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: 16,
  },
  left: { display: 'flex', flexDirection: 'column', gap: 4 },
  name: {
    fontFamily: 'var(--font-display)',
    fontSize: 28,
    lineHeight: 1,
    letterSpacing: '-0.01em',
    color: 'var(--marfil)',
  },
  meta: {
    fontFamily: 'var(--font-sans)',
    fontSize: 11.5,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    color: 'var(--dorado)',
  },
  price: {
    fontFamily: 'var(--font-sans)',
    fontSize: 16,
    fontWeight: 500,
    color: 'var(--marfil)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
};

function ProductCard({ piece, index, total, onClick }) {
  return (
    <button style={productCardStyles.card} onClick={onClick}>
      <div style={productCardStyles.imgWrap}>
        <PlaceholderImage tone={piece.tone} ratio="4/5" />
        <span style={productCardStyles.no}>
          Nº {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
      </div>
      <div style={productCardStyles.body}>
        <div style={productCardStyles.left}>
          <div style={productCardStyles.name}>{piece.name}</div>
          <div style={productCardStyles.meta}>{piece.materialLabel}</div>
        </div>
        <div style={productCardStyles.price}>{piece.price.toLocaleString('es-ES')} €</div>
      </div>
    </button>
  );
}

// Catalogue data — manual §28
const LEGADO_CATALOGUE = [
  {
    id: 'baltic', name: 'Baltic',  price: 890,
    materialLabel: 'Cuero · cognac', tone: 'cognac',
    blurb: 'El sillón de lectura. Asiento profundo, respaldo medio, brazos amplios. Pensado para tardes largas.',
    composition: ['Estructura de roble macizo', 'Cuero de Ubrique · curtido vegetal', 'Relleno: pluma de oca y látex natural'],
    dimensions: { Ancho: '82 cm', Fondo: '92 cm', Alto: '94 cm', 'Alto asiento': '44 cm' },
    posture: 'Lectura prolongada · siesta breve · conversación a dos.',
  },
  {
    id: 'nordic', name: 'Nordic',  price: 820,
    materialLabel: 'Lino lavado · arena', tone: 'lino',
    blurb: 'La pieza que se queda en el rincón claro. Líneas limpias, base baja. Para el salón que respira.',
    composition: ['Estructura de fresno claro', 'Lino lavado 100% · Bélgica', 'Relleno: espuma HR + pluma'],
    dimensions: { Ancho: '78 cm', Fondo: '86 cm', Alto: '88 cm', 'Alto asiento': '42 cm' },
    posture: 'Conversación · descanso medio · espacios claros.',
  },
  {
    id: 'venus',  name: 'Venus',   price: 760,
    materialLabel: 'Bouclé · crudo', tone: 'boucle',
    blurb: 'Curva continua, textura cálida. Una sola pieza, mucho carácter. Pieza protagonista de habitación.',
    composition: ['Estructura de haya curvada', 'Bouclé italiano · 360 g/m²', 'Relleno: espuma HR firmeza media'],
    dimensions: { Ancho: '86 cm', Fondo: '88 cm', Alto: '82 cm', 'Alto asiento': '40 cm' },
    posture: 'Lectura ligera · acento decorativo · habitación.',
  },
  {
    id: 'duero',  name: 'Duero',   price: 940,
    materialLabel: 'Cuero · moka', tone: 'moka',
    blurb: 'El sillón de despacho doméstico. Respaldo alto, brazos contenidos. Hecho para sentarse derecho.',
    composition: ['Estructura de nogal macizo', 'Cuero engrasado · moka', 'Costuras visibles en hilo crudo'],
    dimensions: { Ancho: '76 cm', Fondo: '88 cm', Alto: '102 cm', 'Alto asiento': '46 cm' },
    posture: 'Trabajo · lectura derecha · entrevista en casa.',
  },
];

Object.assign(window, { ProductCard, LEGADO_CATALOGUE });
