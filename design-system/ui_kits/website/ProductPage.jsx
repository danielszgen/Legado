// ProductPage — ficha de modelo. 7 bloques fijos (§28).
//  1. Hero      2. Materiales   3. Dimensiones
//  4. Postura   5. Garantía     6. FAQ
//  7. Contacto

const ppStyles = {
  back: {
    padding: '24px 56px',
    maxWidth: 1440, margin: '0 auto',
  },
  // -------- 1. Hero
  hero: {
    padding: '0 56px 80px',
    maxWidth: 1440, margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: 64,
    alignItems: 'center',
  },
  heroImg: { position: 'relative' },
  heroSeal: {
    position: 'absolute', bottom: 24, right: 24,
  },
  heroText: { display: 'flex', flexDirection: 'column', gap: 22 },
  heroNo: {
    fontFamily: 'var(--font-sans)',
    fontSize: 11, letterSpacing: '0.28em',
    textTransform: 'uppercase',
    color: 'var(--dorado)',
    fontVariantNumeric: 'tabular-nums',
  },
  heroName: {
    fontFamily: 'var(--font-display)',
    fontSize: 96, lineHeight: 0.92,
    letterSpacing: '-0.025em',
    color: 'var(--marfil)',
    margin: 0,
  },
  heroBlurb: {
    fontFamily: 'var(--font-serif-text)',
    fontStyle: 'italic',
    fontSize: 21, lineHeight: 1.5,
    color: 'rgba(244,239,230,0.82)',
    maxWidth: '34ch',
  },
  heroMeta: {
    display: 'flex', gap: 28, alignItems: 'baseline',
    marginTop: 8,
    flexWrap: 'wrap',
  },
  heroPrice: {
    fontFamily: 'var(--font-display)',
    fontSize: 36,
    color: 'var(--marfil)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  heroEnvio: {
    fontFamily: 'var(--font-sans)',
    fontSize: 11, letterSpacing: '0.22em',
    textTransform: 'uppercase',
    color: 'var(--dorado)',
    whiteSpace: 'nowrap',
  },

  // shared block
  block: {
    padding: '80px 56px',
    maxWidth: 1440, margin: '0 auto',
    borderTop: '0.5px solid rgba(201,168,106,0.2)',
  },
  blockGrid: {
    display: 'grid', gridTemplateColumns: '260px 1fr', gap: 56,
    alignItems: 'start',
  },
  blockNo: {
    fontFamily: 'var(--font-sans)',
    fontSize: 11, letterSpacing: '0.32em',
    color: 'var(--dorado)',
    textTransform: 'uppercase',
    fontVariantNumeric: 'tabular-nums',
    marginBottom: 8,
  },
  blockTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 32, lineHeight: 1,
    color: 'var(--marfil)',
    letterSpacing: '-0.01em',
  },
  blockBody: { fontFamily: 'var(--font-serif-text)', fontSize: 17, lineHeight: 1.6, color: 'rgba(244,239,230,0.85)' },

  // -------- 2. Materiales
  matsRows: { display: 'flex', flexDirection: 'column', gap: 0 },
  matRow: {
    display: 'grid', gridTemplateColumns: '120px 1fr',
    padding: '20px 0',
    borderTop: '0.5px solid rgba(201,168,106,0.2)',
    fontFamily: 'var(--font-serif-text)',
    fontSize: 17, color: 'var(--marfil)',
  },
  matLabel: {
    fontFamily: 'var(--font-sans)',
    fontSize: 10.5, letterSpacing: '0.24em',
    textTransform: 'uppercase',
    color: 'var(--dorado)',
    paddingTop: 4,
  },
  matRowLast: { borderBottom: '0.5px solid rgba(201,168,106,0.2)' },

  // -------- 3. Dimensiones
  dimsWrap: { display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 64, alignItems: 'center' },
  dimsList: { display: 'flex', flexDirection: 'column' },
  dimRow: {
    display: 'flex', justifyContent: 'space-between',
    padding: '18px 0',
    borderTop: '0.5px solid rgba(201,168,106,0.2)',
  },
  dimLabel: {
    fontFamily: 'var(--font-sans)',
    fontSize: 11, letterSpacing: '0.24em',
    textTransform: 'uppercase',
    color: 'var(--dorado)',
  },
  dimVal: {
    fontFamily: 'var(--font-display)',
    fontSize: 22,
    color: 'var(--marfil)',
    fontVariantNumeric: 'tabular-nums',
  },

  // -------- 5. Garantía / 6. FAQ shared
  faq: { display: 'flex', flexDirection: 'column' },
  faqItem: {
    padding: '20px 0',
    borderTop: '0.5px solid rgba(201,168,106,0.2)',
    cursor: 'pointer',
  },
  faqQ: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
    fontFamily: 'var(--font-display)',
    fontSize: 22, color: 'var(--marfil)',
    letterSpacing: '-0.005em',
  },
  faqMark: {
    fontFamily: 'var(--font-sans)',
    fontSize: 18, color: 'var(--dorado)',
    marginLeft: 16,
  },
  faqA: {
    marginTop: 10,
    fontFamily: 'var(--font-serif-text)',
    fontSize: 16, lineHeight: 1.6,
    color: 'rgba(244,239,230,0.75)',
    maxWidth: '64ch',
  },

  // -------- 7. Contacto
  contactWrap: {
    background: 'var(--cuero)',
    padding: '90px 56px',
  },
  contactInner: {
    maxWidth: 1100, margin: '0 auto',
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64,
  },
  contactSig: { display: 'flex', flexDirection: 'column', gap: 18 },
  contactQuote: {
    fontFamily: 'var(--font-display)',
    fontStyle: 'italic',
    fontSize: 28, lineHeight: 1.3,
    color: 'var(--marfil)',
    maxWidth: '24ch',
  },
  contactAttr: {
    fontFamily: 'var(--font-sans)',
    fontSize: 11, letterSpacing: '0.28em',
    textTransform: 'uppercase',
    color: 'var(--dorado)',
  },
  contactForm: { display: 'flex', flexDirection: 'column', gap: 18 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  fieldLabel: {
    fontFamily: 'var(--font-sans)',
    fontSize: 10.5, fontWeight: 500,
    letterSpacing: '0.24em', textTransform: 'uppercase',
    color: 'var(--dorado)',
  },
  fieldInput: {
    fontFamily: 'var(--font-serif-text)',
    fontSize: 17, color: 'var(--marfil)',
    background: 'transparent', border: 'none',
    borderBottom: '0.5px solid var(--dorado)',
    padding: '8px 0', outline: 'none',
  },
};

function FAQItem({ q, a, open, onClick }) {
  return (
    <div style={ppStyles.faqItem} onClick={onClick}>
      <div style={ppStyles.faqQ}>
        <span>{q}</span>
        <span style={ppStyles.faqMark}>{open ? '−' : '+'}</span>
      </div>
      {open && <div style={ppStyles.faqA}>{a}</div>}
    </div>
  );
}

function ProductPage({ model, go }) {
  const piece = LEGADO_CATALOGUE.find(p => p.id === model) || LEGADO_CATALOGUE[0];
  const idx = LEGADO_CATALOGUE.indexOf(piece);
  const [openFaq, setOpenFaq] = React.useState(0);

  const faqs = [
    { q: '¿Cuánto tarda?', a: 'Cuatro semanas desde el pedido. No tenemos stock — cada sillón se hace cuando lo pides.' },
    { q: '¿Cómo lo enviáis?', a: 'Transporte propio en península. Subida hasta tu salón incluida. Retiramos el embalaje.' },
    { q: '¿Puedo devolverlo?', a: 'Treinta días desde la entrega. Sin preguntas. Coste de devolución a nuestro cargo si la pieza viene con tara.' },
    { q: '¿Y si el cuero envejece?', a: 'Se patina. Esa es la idea. Te enviamos pauta de cuidado y aceite hidratante con la pieza.' },
  ];

  return (
    <div className="page">
      {/* Volver */}
      <div style={ppStyles.back}>
        <Button variant="ghost" onClick={() => go({ name: 'collection' })}>
          ← Volver a la colección
        </Button>
      </div>

      {/* 1 · HERO */}
      <section style={ppStyles.hero}>
        <div style={ppStyles.heroImg}>
          <PlaceholderImage tone={piece.tone} ratio="5/6" />
          <div style={ppStyles.heroSeal}>
            <Seal size={64} mode="mono" tone="brass" />
          </div>
        </div>
        <div style={ppStyles.heroText}>
          <div style={ppStyles.heroNo}>
            Nº {String(idx + 1).padStart(2, '0')} / {String(LEGADO_CATALOGUE.length).padStart(2, '0')}
            &nbsp;·&nbsp; Edición 2026
          </div>
          <h1 style={ppStyles.heroName}>{piece.name}</h1>
          <p style={ppStyles.heroBlurb}>{piece.blurb}</p>
          <div style={ppStyles.heroMeta}>
            <div style={ppStyles.heroPrice}>{piece.price.toLocaleString('es-ES')} €</div>
            <div style={ppStyles.heroEnvio}>Hecho en 4 semanas · Envío incluido</div>
          </div>
          <div style={{ marginTop: 18 }}>
            <Button onClick={() => {}}>Encargar el {piece.name}</Button>
          </div>
        </div>
      </section>

      {/* 2 · MATERIALES */}
      <section style={ppStyles.block}>
        <div style={ppStyles.blockGrid}>
          <div>
            <div style={ppStyles.blockNo}>02 · Materiales</div>
            <h3 style={ppStyles.blockTitle}>Lo que toca tu mano.</h3>
          </div>
          <div style={ppStyles.matsRows}>
            {piece.composition.map((line, i) => (
              <div key={i} style={{ ...ppStyles.matRow, ...(i === piece.composition.length - 1 ? ppStyles.matRowLast : null) }}>
                <span style={ppStyles.matLabel}>Cap. {String(i + 1).padStart(2, '0')}</span>
                <span>{line}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3 · DIMENSIONES */}
      <section style={ppStyles.block}>
        <div style={ppStyles.blockGrid}>
          <div>
            <div style={ppStyles.blockNo}>03 · Dimensiones</div>
            <h3 style={ppStyles.blockTitle}>Para que entre por la puerta.</h3>
          </div>
          <div style={ppStyles.dimsWrap}>
            <div style={ppStyles.dimsList}>
              {Object.entries(piece.dimensions).map(([k, v]) => (
                <div key={k} style={ppStyles.dimRow}>
                  <span style={ppStyles.dimLabel}>{k}</span>
                  <span style={ppStyles.dimVal}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ position: 'relative' }}>
              <ChairDiagram />
            </div>
          </div>
        </div>
      </section>

      {/* 4 · POSTURA */}
      <section style={ppStyles.block}>
        <div style={ppStyles.blockGrid}>
          <div>
            <div style={ppStyles.blockNo}>04 · Postura</div>
            <h3 style={ppStyles.blockTitle}>Para qué se sienta uno aquí.</h3>
          </div>
          <div style={ppStyles.blockBody}>
            <p>{piece.posture}</p>
            <p style={{ color: 'var(--fg2)', fontStyle: 'italic' }}>
              No prometemos ergonomía con lenguaje médico. Si lo necesitas, te recomendamos un especialista.
            </p>
          </div>
        </div>
      </section>

      {/* 5 · GARANTÍA */}
      <section style={ppStyles.block}>
        <div style={ppStyles.blockGrid}>
          <div>
            <div style={ppStyles.blockNo}>05 · Garantía</div>
            <h3 style={ppStyles.blockTitle}>Veinte años. Sin letra pequeña.</h3>
          </div>
          <div style={ppStyles.blockBody}>
            <p>
              Estructura: <b>20 años</b>. Tapicería y relleno: <b>5 años</b>. Si se rompe, lo arreglamos.
              Si no se puede, te damos uno nuevo. Si tampoco, te devolvemos el dinero. En ese orden.
            </p>
          </div>
        </div>
      </section>

      {/* 6 · FAQ */}
      <section style={ppStyles.block}>
        <div style={ppStyles.blockGrid}>
          <div>
            <div style={ppStyles.blockNo}>06 · Preguntas</div>
            <h3 style={ppStyles.blockTitle}>Lo que casi todos preguntan.</h3>
          </div>
          <div style={ppStyles.faq}>
            {faqs.map((f, i) => (
              <FAQItem key={i} q={f.q} a={f.a} open={openFaq === i}
                       onClick={() => setOpenFaq(openFaq === i ? -1 : i)} />
            ))}
          </div>
        </div>
      </section>

      {/* 7 · CONTACTO */}
      <section style={ppStyles.contactWrap}>
        <div style={ppStyles.contactInner}>
          <div style={ppStyles.contactSig}>
            <div style={ppStyles.blockNo}>07 · Hablamos</div>
            <p style={ppStyles.contactQuote}>
              «Antes de comprar un sillón se piensa una semana. Si quieres pensar en voz alta, escríbeme.»
            </p>
            <div style={ppStyles.contactAttr}>— Daniel L. · Fundador · hola@legado.es</div>
          </div>
          <form style={ppStyles.contactForm} onSubmit={e => e.preventDefault()}>
            <div style={ppStyles.field}>
              <label style={ppStyles.fieldLabel}>Tu nombre</label>
              <input style={ppStyles.fieldInput} placeholder="Elena Vidal" />
            </div>
            <div style={ppStyles.field}>
              <label style={ppStyles.fieldLabel}>Email</label>
              <input style={ppStyles.fieldInput} placeholder="tu@correo.es" />
            </div>
            <div style={ppStyles.field}>
              <label style={ppStyles.fieldLabel}>Pregunta sobre el {piece.name}</label>
              <input style={ppStyles.fieldInput} placeholder="¿El cuero llega ya patinado…?" />
            </div>
            <div style={{ marginTop: 8 }}>
              <Button>Enviar pregunta</Button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}

// Simple line-art chair silhouette for the dimensions block — placeholder.
function ChairDiagram() {
  return (
    <svg viewBox="0 0 240 240" width="100%" style={{ maxWidth: 240, display: 'block', marginLeft: 'auto' }}>
      <g stroke="var(--marfil)" strokeWidth="0.6" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.85">
        <path d="M50 60 Q60 40 90 38 L150 38 Q180 40 190 60 L190 150 Q190 165 175 165 L65 165 Q50 165 50 150 Z"/>
        <path d="M70 165 L65 215 M170 165 L175 215"/>
        <path d="M50 110 L40 110 L40 175 M190 110 L200 110 L200 175"/>
      </g>
      <g stroke="var(--dorado)" strokeWidth="0.4" strokeDasharray="2 3">
        <line x1="40" y1="225" x2="200" y2="225"/>
        <line x1="40" y1="225" x2="40" y2="220"/>
        <line x1="200" y1="225" x2="200" y2="220"/>
        <line x1="222" y1="38" x2="222" y2="215"/>
        <line x1="218" y1="38" x2="222" y2="38"/>
        <line x1="218" y1="215" x2="222" y2="215"/>
      </g>
      <text x="120" y="237" textAnchor="middle"
        style={{ font: '9px "Inter", sans-serif', letterSpacing: '0.2em', textTransform: 'uppercase' }}
        fill="var(--dorado)">Ancho</text>
      <text x="232" y="130" textAnchor="middle" transform="rotate(90 232 130)"
        style={{ font: '9px "Inter", sans-serif', letterSpacing: '0.2em', textTransform: 'uppercase' }}
        fill="var(--dorado)">Alto</text>
    </svg>
  );
}

window.ProductPage = ProductPage;
