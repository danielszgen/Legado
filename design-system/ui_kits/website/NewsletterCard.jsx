// Newsletter signup — pausada. "Una sola vez al mes." (§30)

const nlStyles = {
  wrap: {
    background: 'var(--cuero)',
    padding: '100px 56px',
    position: 'relative',
  },
  inner: {
    maxWidth: 760, margin: '0 auto',
    display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'flex-start',
  },
  eyebrow: {
    fontFamily: 'var(--font-sans)',
    fontSize: 10.5, fontWeight: 500,
    letterSpacing: '0.32em', textTransform: 'uppercase',
    color: 'var(--dorado)',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 44, lineHeight: 1.05,
    letterSpacing: '-0.015em',
    color: 'var(--marfil)',
    maxWidth: '14ch',
  },
  body: {
    fontFamily: 'var(--font-serif-text)',
    fontSize: 17, lineHeight: 1.55,
    fontStyle: 'italic',
    color: 'rgba(244,239,230,0.85)',
    maxWidth: '50ch',
  },
  form: {
    display: 'flex',
    gap: 0,
    width: '100%',
    maxWidth: 540,
    marginTop: 12,
    borderBottom: '0.5px solid var(--dorado)',
  },
  input: {
    flex: 1,
    fontFamily: 'var(--font-serif-text)',
    fontStyle: 'italic',
    fontSize: 19,
    background: 'transparent',
    border: 'none',
    padding: '12px 0',
    color: 'var(--marfil)',
    outline: 'none',
  },
  send: {
    fontFamily: 'var(--font-sans)',
    fontSize: 11, fontWeight: 700,
    letterSpacing: '0.28em', textTransform: 'uppercase',
    color: 'var(--dorado)',
    background: 'transparent',
    border: 'none',
    padding: '12px 0 12px 20px',
    cursor: 'pointer',
  },
  footnote: {
    fontFamily: 'var(--font-sans)',
    fontSize: 11, letterSpacing: '0.2em',
    textTransform: 'uppercase',
    color: 'rgba(244,239,230,0.45)',
    marginTop: 10,
  },
};

function NewsletterCard() {
  const [v, setV] = React.useState('');
  const [sent, setSent] = React.useState(false);
  return (
    <section style={nlStyles.wrap}>
      <div style={nlStyles.inner}>
        <div style={nlStyles.eyebrow}>— Carta mensual</div>
        <h2 style={nlStyles.title}>Una carta al mes. Sin oferta.</h2>
        <p style={nlStyles.body}>
          Escribimos sobre un material, una pieza y un rincón ajeno.
          Sin descuentos, sin colección nueva. La newsletter es el contrario del descuento.
        </p>
        <form style={nlStyles.form} onSubmit={e => { e.preventDefault(); setSent(true); }}>
          <input
            style={nlStyles.input}
            type="email"
            placeholder="tu@correo.es"
            value={v}
            onChange={e => setV(e.target.value)}
            disabled={sent}
          />
          <button style={nlStyles.send} type="submit">
            {sent ? '✓ Anotada' : 'Suscribirse'}
          </button>
        </form>
        <div style={nlStyles.footnote}>
          Un correo al mes. Te puedes ir cuando quieras.
        </div>
      </div>
    </section>
  );
}

window.NewsletterCard = NewsletterCard;
