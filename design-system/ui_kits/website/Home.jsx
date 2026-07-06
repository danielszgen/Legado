// Home — landing. Mockup §28.
// Reglas: hero sin texto en imagen, una sola CTA por bloque, sello pequeño y siempre.

const homeStyles = {
  hero: {
    padding: '110px 56px 90px',
    background: 'var(--ebano)',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 56,
    alignItems: 'center',
    maxWidth: 1440, margin: '0 auto',
    position: 'relative',
  },
  heroLeft: { display: 'flex', flexDirection: 'column', gap: 26 },
  heroEyebrow: {
    fontFamily: 'var(--font-sans)',
    fontSize: 11, fontWeight: 500,
    letterSpacing: '0.32em', textTransform: 'uppercase',
    color: 'var(--dorado)',
  },
  heroClaim: {
    fontFamily: 'var(--font-display)',
    fontSize: 92,
    lineHeight: 0.96,
    letterSpacing: '-0.022em',
    color: 'var(--marfil)',
    margin: 0,
  },
  heroClaimEm: { fontStyle: 'italic', color: 'var(--dorado)' },
  heroLede: {
    fontFamily: 'var(--font-serif-text)',
    fontStyle: 'italic',
    fontSize: 22,
    lineHeight: 1.5,
    color: 'rgba(244,239,230,0.78)',
    maxWidth: '34ch',
    marginTop: 4,
  },
  heroCta: { marginTop: 14, display: 'flex', alignItems: 'center', gap: 28 },
  heroHint: {
    fontFamily: 'var(--font-sans)',
    fontSize: 11, letterSpacing: '0.22em',
    textTransform: 'uppercase',
    color: 'rgba(201,168,106,0.55)',
  },
  heroImage: { position: 'relative' },

  section: {
    padding: '90px 56px',
    maxWidth: 1440, margin: '0 auto',
  },
  sectionHead: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'baseline', marginBottom: 48,
    paddingBottom: 18,
    borderBottom: '0.5px solid rgba(201,168,106,0.25)',
  },
  sectionTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 44, lineHeight: 1,
    letterSpacing: '-0.015em',
    color: 'var(--marfil)',
  },
  sectionMeta: {
    fontFamily: 'var(--font-sans)',
    fontSize: 11, letterSpacing: '0.28em',
    textTransform: 'uppercase',
    color: 'var(--dorado)',
    fontVariantNumeric: 'tabular-nums',
  },
  grid3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 44,
  },

  values: {
    background: 'var(--nogal)',
    padding: '90px 56px',
  },
  valuesInner: {
    maxWidth: 1280, margin: '0 auto',
    display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 32,
  },
  valueCol: {
    display: 'flex', flexDirection: 'column', gap: 12,
    paddingTop: 18,
    borderTop: '0.5px solid var(--dorado)',
  },
  valueN: {
    fontFamily: 'var(--font-sans)',
    fontSize: 11, letterSpacing: '0.22em',
    color: 'var(--dorado)',
    fontVariantNumeric: 'tabular-nums',
  },
  valueT: {
    fontFamily: 'var(--font-display)',
    fontSize: 26, lineHeight: 1.05,
    color: 'var(--marfil)',
  },
  valueD: {
    fontFamily: 'var(--font-serif-text)',
    fontSize: 14.5, lineHeight: 1.55,
    color: 'rgba(244,239,230,0.7)',
  },

  proof: {
    padding: '90px 56px',
    background: 'var(--ebano)',
    borderTop: '0.5px solid rgba(201,168,106,0.2)',
    borderBottom: '0.5px solid rgba(201,168,106,0.2)',
  },
  proofInner: {
    maxWidth: 1100, margin: '0 auto',
    display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 64,
    alignItems: 'center',
  },
  proofText: {
    fontFamily: 'var(--font-display)',
    fontStyle: 'italic',
    fontSize: 32, lineHeight: 1.3,
    color: 'var(--marfil)',
    maxWidth: '24ch',
  },
  proofAttr: {
    marginTop: 22,
    fontFamily: 'var(--font-sans)',
    fontSize: 11, letterSpacing: '0.28em',
    textTransform: 'uppercase',
    color: 'var(--dorado)',
  },
};

function Home({ go }) {
  const featured = LEGADO_CATALOGUE.slice(0, 3);
  const values = [
    { n: '01', t: 'Herencia',      d: 'Piezas pensadas para envejecer contigo y pasar a la siguiente generación.' },
    { n: '02', t: 'Artesanía',     d: 'Materiales nobles y procesos cuidadosos. Hechos para durar.' },
    { n: '03', t: 'Confort',       d: 'Ergonomía pensada para el día a día real. Sentarse bien no es lujo.' },
    { n: '04', t: 'Sostenibilidad',d: 'Made-to-order. Sin stock acumulado, sin ciclos de moda.' },
    { n: '05', t: 'Hogar',         d: 'Trabajamos sobre la idea de hacer hogar, no de vender muebles.' },
  ];

  return (
    <div className="page">
      {/* HERO — texto a la izquierda, imagen a la derecha. Sin texto sobre imagen. */}
      <section style={homeStyles.hero}>
        <div style={homeStyles.heroLeft}>
          <div style={homeStyles.heroEyebrow}>— Desde MMXXVI · Hecho en España</div>
          <h1 style={homeStyles.heroClaim}>
            Sillones para<br/>
            <span style={homeStyles.heroClaimEm}>toda la vida.</span>
          </h1>
          <p style={homeStyles.heroLede}>
            Hechos bajo demanda en talleres españoles. Sin stock, sin temporadas. Cada sillón existe cuando alguien lo elige.
          </p>
          <div style={homeStyles.heroCta}>
            <Button onClick={() => go({ name: 'collection' })}>Ver la colección</Button>
            <span style={homeStyles.heroHint}>4 piezas · 4 semanas de espera</span>
          </div>
        </div>
        <div style={homeStyles.heroImage}>
          <PlaceholderImage tone="ambient" ratio="5/6" />
        </div>
      </section>

      {/* COLECCIÓN — 3 piezas hero */}
      <section style={homeStyles.section}>
        <div style={homeStyles.sectionHead}>
          <h2 style={homeStyles.sectionTitle}>La colección</h2>
          <div style={homeStyles.sectionMeta}>04 piezas · 2026</div>
        </div>
        <div style={homeStyles.grid3}>
          {featured.map((piece, i) => (
            <ProductCard
              key={piece.id}
              piece={piece}
              index={i}
              total={LEGADO_CATALOGUE.length}
              onClick={() => go({ name: 'product', model: piece.id })}
            />
          ))}
        </div>
      </section>

      <Manifesto />

      {/* VALORES */}
      <section style={homeStyles.values}>
        <div style={homeStyles.valuesInner}>
          {values.map(v => (
            <div key={v.n} style={homeStyles.valueCol}>
              <div style={homeStyles.valueN}>{v.n}</div>
              <div style={homeStyles.valueT}>{v.t}</div>
              <div style={homeStyles.valueD}>{v.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PROOF — voz de marca */}
      <section style={homeStyles.proof}>
        <div style={homeStyles.proofInner}>
          <Seal size={180} mode="bitmap" tone="brass" />
          <div>
            <div style={homeStyles.proofText}>
              «Lo hacemos cuando lo pides. Tarda cuatro semanas. Es así por una razón.»
            </div>
            <div style={homeStyles.proofAttr}>— Daniel L. · Fundador</div>
          </div>
        </div>
      </section>

      <NewsletterCard />
    </div>
  );
}

window.Home = Home;
