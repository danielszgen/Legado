// Manifesto excerpt block.

const manifestoStyles = {
  wrap: {
    background: 'var(--ebano)',
    color: 'var(--marfil)',
    padding: '120px 56px',
    position: 'relative',
  },
  inner: { maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 80, alignItems: 'start' },
  eyebrow: {
    fontFamily: 'var(--font-sans)',
    fontSize: 10.5, fontWeight: 500,
    letterSpacing: '0.32em', textTransform: 'uppercase',
    color: 'var(--dorado)',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 56,
    lineHeight: 1.02,
    letterSpacing: '-0.018em',
    color: 'var(--marfil)',
    marginTop: 18,
  },
  titleEm: { fontStyle: 'italic', color: 'var(--dorado)' },
  list: { display: 'flex', flexDirection: 'column', gap: 14 },
  line: {
    fontFamily: 'var(--font-serif-text)',
    fontSize: 18, lineHeight: 1.55,
    color: 'rgba(244,239,230,0.92)',
    paddingLeft: 24, position: 'relative',
  },
  bullet: {
    position: 'absolute', left: 0, top: 8,
    width: 12, borderTop: '0.5px solid var(--dorado)',
  },
  signature: {
    marginTop: 40,
    fontFamily: 'var(--font-sans)',
    fontSize: 10.5,
    letterSpacing: '0.32em',
    textTransform: 'uppercase',
    color: 'rgba(201,168,106,0.7)',
  },
};

function Manifesto() {
  const lines = [
    'Creemos en las casas que se hacen despacio.',
    'Creemos que un sillón no es un mueble: es un sitio.',
    'Creemos que lo barato sale caro cuando se mide en años.',
    'Creemos que el reposo es un derecho de adulto, no un signo de cansancio.',
    'Creemos en hacer pocas cosas. Y en hacerlas bien.',
  ];
  return (
    <section style={manifestoStyles.wrap}>
      <PageMarks color="rgba(201,168,106,0.4)" />
      <div style={manifestoStyles.inner}>
        <div>
          <div style={manifestoStyles.eyebrow}>— Manifiesto · 2026</div>
          <h2 style={manifestoStyles.title}>
            Lo contrario<br/>del lujo no es<br/>la sencillez.<br/>
            <span style={manifestoStyles.titleEm}>Es la prisa.</span>
          </h2>
          <div style={manifestoStyles.signature}>— Legado · Madrid</div>
        </div>
        <div style={manifestoStyles.list}>
          {lines.map((l, i) => (
            <div key={i} style={manifestoStyles.line}>
              <div style={manifestoStyles.bullet} />
              {l}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

window.Manifesto = Manifesto;
