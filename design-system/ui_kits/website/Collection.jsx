// Collection — listado editorial completo. 4 piezas.

const collectionStyles = {
  hero: {
    padding: '90px 56px 70px',
    maxWidth: 1440, margin: '0 auto',
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56,
    alignItems: 'end',
    borderBottom: '0.5px solid rgba(201,168,106,0.2)',
  },
  eyebrow: {
    fontFamily: 'var(--font-sans)',
    fontSize: 11, letterSpacing: '0.32em',
    textTransform: 'uppercase', fontWeight: 500,
    color: 'var(--dorado)',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 72, lineHeight: 1,
    letterSpacing: '-0.02em',
    color: 'var(--marfil)',
    marginTop: 14,
  },
  lede: {
    fontFamily: 'var(--font-serif-text)',
    fontStyle: 'italic',
    fontSize: 19, lineHeight: 1.55,
    color: 'rgba(244,239,230,0.78)',
    maxWidth: '46ch',
  },
  filters: {
    padding: '24px 56px',
    maxWidth: 1440, margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '0.5px solid rgba(201,168,106,0.2)',
  },
  chips: { display: 'flex', gap: 10 },
  chip: {
    fontFamily: 'var(--font-sans)',
    fontSize: 11, fontWeight: 500,
    letterSpacing: '0.18em', textTransform: 'uppercase',
    padding: '7px 14px',
    borderRadius: 999,
    border: '0.5px solid rgba(201,168,106,0.4)',
    background: 'transparent',
    color: 'rgba(244,239,230,0.75)',
    cursor: 'pointer',
  },
  chipActive: {
    background: 'var(--dorado)',
    color: 'var(--ebano)',
    borderColor: 'var(--dorado)',
  },
  sort: {
    fontFamily: 'var(--font-sans)',
    fontSize: 11, letterSpacing: '0.22em',
    textTransform: 'uppercase',
    color: 'var(--dorado)',
  },
  grid: {
    padding: '60px 56px 100px',
    maxWidth: 1440, margin: '0 auto',
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 36,
  },
};

function Collection({ go }) {
  const filters = ['Todo', 'Cuero', 'Lino', 'Bouclé'];
  const [filter, setFilter] = React.useState('Todo');

  const filtered = filter === 'Todo'
    ? LEGADO_CATALOGUE
    : LEGADO_CATALOGUE.filter(p => p.materialLabel.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="page">
      <section style={collectionStyles.hero}>
        <div>
          <div style={collectionStyles.eyebrow}>— Colección · 2026</div>
          <h1 style={collectionStyles.title}>Pocas piezas.<br/>Defendidas una a una.</h1>
        </div>
        <p style={collectionStyles.lede}>
          Crecemos a piezas y categorías nuevas sólo cuando cada una puede mantener el mismo estándar. Hoy son cuatro.
        </p>
      </section>

      <div style={collectionStyles.filters}>
        <div style={collectionStyles.chips}>
          {filters.map(f => (
            <button
              key={f}
              style={{ ...collectionStyles.chip, ...(f === filter ? collectionStyles.chipActive : null) }}
              onClick={() => setFilter(f)}>
              {f}
            </button>
          ))}
        </div>
        <div style={collectionStyles.sort}>Orden · alfabético</div>
      </div>

      <section style={collectionStyles.grid}>
        {filtered.map((piece, i) => (
          <ProductCard
            key={piece.id}
            piece={piece}
            index={i}
            total={filtered.length}
            onClick={() => go({ name: 'product', model: piece.id })}
          />
        ))}
      </section>
    </div>
  );
}

window.Collection = Collection;
