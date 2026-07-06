// Footer — editorial pie. Firmada por el fundador, sello pequeño.

const footerStyles = {
  wrap: {
    background: 'var(--ebano)',
    color: 'var(--marfil)',
    padding: '80px 56px 32px',
    position: 'relative',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1.4fr 1fr 1fr 1fr',
    gap: 56,
    maxWidth: 1280,
    margin: '0 auto',
  },
  signature: {
    display: 'flex', flexDirection: 'column', gap: 18,
  },
  wordmark: {
    fontFamily: 'var(--font-display)',
    fontSize: 28,
    letterSpacing: '0.34em',
    color: 'var(--marfil)',
    textTransform: 'uppercase',
  },
  claim: {
    fontFamily: 'var(--font-display)',
    fontStyle: 'italic',
    fontSize: 18,
    color: 'var(--dorado)',
    maxWidth: '24ch',
    lineHeight: 1.35,
  },
  col: { display: 'flex', flexDirection: 'column', gap: 8 },
  colHead: {
    fontFamily: 'var(--font-sans)',
    fontSize: 10.5, fontWeight: 600,
    letterSpacing: '0.28em', textTransform: 'uppercase',
    color: 'var(--dorado)',
    marginBottom: 8,
  },
  link: {
    fontFamily: 'var(--font-sans)',
    fontSize: 14,
    color: 'var(--marfil)',
    opacity: 0.85,
    cursor: 'pointer',
    background: 'none', border: 'none', padding: 0, textAlign: 'left',
  },
  bottom: {
    maxWidth: 1280, margin: '64px auto 0',
    paddingTop: 24,
    borderTop: '0.5px solid rgba(201,168,106,0.25)',
    display: 'flex', justifyContent: 'space-between',
    fontFamily: 'var(--font-sans)', fontSize: 11,
    letterSpacing: '0.22em', textTransform: 'uppercase',
    color: 'rgba(244,239,230,0.55)',
  },
};

function Footer({ go }) {
  const link = (label, onClick) =>
    <button style={footerStyles.link} onClick={onClick}>{label}</button>;

  return (
    <footer style={footerStyles.wrap}>
      <div style={footerStyles.grid}>
        <div style={footerStyles.signature}>
          <Seal size={68} mode="mono" tone="brass" />
          <div style={footerStyles.wordmark}>Legado</div>
          <div style={footerStyles.claim}>Una casa se hace con los muebles que se quedan.</div>
        </div>

        <div style={footerStyles.col}>
          <div style={footerStyles.colHead}>Colección</div>
          {link('Baltic',  () => go({ name: 'product', model: 'baltic' }))}
          {link('Nordic',  () => go({ name: 'product', model: 'nordic' }))}
          {link('Venus',   () => go({ name: 'product', model: 'venus' }))}
          {link('Ver todo',() => go({ name: 'collection' }))}
        </div>

        <div style={footerStyles.col}>
          <div style={footerStyles.colHead}>Casa</div>
          {link('Sobre nosotros', () => go({ name: 'about' }))}
          {link('Materiales',    () => go({ name: 'materials' }))}
          {link('Manifiesto',    () => go({ name: 'about' }))}
          {link('Newsletter',    () => {})}
        </div>

        <div style={footerStyles.col}>
          <div style={footerStyles.colHead}>Contacto</div>
          {link('hola@legado.es', () => {})}
          {link('+34 600 00 00 00', () => {})}
          {link('Atención · L-V 10-19h', () => {})}
        </div>
      </div>

      <div style={footerStyles.bottom}>
        <span>© MMXXVI · Legado · Madrid</span>
        <span>Hecho en España · Documento interno</span>
        <span>Política · Devoluciones · Aviso legal</span>
      </div>
    </footer>
  );
}

window.Footer = Footer;
