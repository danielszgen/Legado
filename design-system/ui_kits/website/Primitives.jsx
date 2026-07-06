// Primitives — shared building blocks. Loaded first.

const primBtnStyles = {
  primary: {
    fontFamily: 'var(--font-sans)',
    fontSize: 11.5,
    fontWeight: 700,
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
    color: 'var(--ebano)',
    background: 'var(--dorado)',
    padding: '15px 26px',
    border: 'none',
    borderRadius: 2,
    cursor: 'pointer',
    transition: 'opacity .2s ease',
  },
  secondary: {
    fontFamily: 'var(--font-sans)',
    fontSize: 11.5,
    fontWeight: 700,
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
    color: 'var(--marfil)',
    background: 'transparent',
    padding: '14px 25px',
    border: '0.5px solid var(--dorado)',
    borderRadius: 2,
    cursor: 'pointer',
    transition: 'opacity .2s ease, background .2s ease',
  },
  ghost: {
    fontFamily: 'var(--font-sans)',
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
    color: 'var(--dorado)',
    background: 'transparent',
    border: 'none',
    borderBottom: '0.5px solid var(--dorado)',
    padding: '6px 2px',
    cursor: 'pointer',
    transition: 'opacity .2s ease',
    whiteSpace: 'nowrap',
  },
};

function Button({ variant = 'primary', onClick, children, style }) {
  const [hover, setHover] = React.useState(false);
  const base = primBtnStyles[variant];
  const computed = {
    ...base,
    opacity: hover ? 0.7 : 1,
    ...style,
  };
  return (
    <button
      style={computed}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}>
      {children}
    </button>
  );
}

function Eyebrow({ children, color, style }) {
  return (
    <div style={{
      fontFamily: 'var(--font-sans)',
      fontSize: 11,
      fontWeight: 500,
      letterSpacing: '0.28em',
      textTransform: 'uppercase',
      color: color || 'var(--fg2)',
      ...style,
    }}>{children}</div>
  );
}

function Rule({ tone = 'laton', style }) {
  const color = tone === 'laton' ? 'var(--dorado)' : tone === 'cuero' ? 'var(--cuero)' : 'var(--rule)';
  return <hr style={{ border: 0, borderTop: `0.5px solid ${color}`, margin: 0, ...style }} />;
}

// Page corner crosses, § 23 punto 02
function PageMarks({ color = 'rgba(74,50,32,0.5)' }) {
  const mark = (pos) => ({
    position: 'absolute',
    width: 14, height: 14,
    background: `linear-gradient(${color}, ${color}) center/100% 0.5px no-repeat, linear-gradient(${color}, ${color}) center/0.5px 100% no-repeat`,
    ...pos,
  });
  return (
    <>
      <div style={mark({ top: 24, left: 24 })} />
      <div style={mark({ top: 24, right: 24 })} />
      <div style={mark({ bottom: 24, left: 24 })} />
      <div style={mark({ bottom: 24, right: 24 })} />
    </>
  );
}

// Placeholder image — warm gradient suggesting leather / wood interior.
// All images are placeholders pending §32 "Semana 3-4 · fotografía editorial".
function PlaceholderImage({ tone = 'cognac', ratio = '4/5', children, style }) {
  const gradients = {
    cognac:  'radial-gradient(ellipse at 30% 20%, #B97540 0%, #6E4322 60%, #3A2616 100%)',
    tabaco:  'radial-gradient(ellipse at 70% 30%, #7A4B2A 0%, #4A2E1E 70%, #1F140C 100%)',
    moka:    'radial-gradient(ellipse at 30% 80%, #6E4E32 0%, #3A2616 70%, #1A1410 100%)',
    lino:    'radial-gradient(ellipse at 50% 30%, #DCC8A6 0%, #B89466 50%, #7C5A38 100%)',
    boucle:  'radial-gradient(ellipse at 30% 30%, #E6D6B8 0%, #C9A07A 60%, #8A6446 100%)',
    bouclé:  'radial-gradient(ellipse at 30% 30%, #E6D6B8 0%, #C9A07A 60%, #8A6446 100%)',
    terciopelo: 'radial-gradient(ellipse at 70% 20%, #6E2620 0%, #3F1612 60%, #1A0908 100%)',
    nogal:   'radial-gradient(ellipse at 50% 50%, #6E4E32 0%, #3A2616 100%)',
    ambient: 'radial-gradient(ellipse at 70% 30%, #B68455 0%, #6E4E32 40%, #2A1C12 100%)',
  };
  return (
    <div style={{
      aspectRatio: ratio,
      width: '100%',
      background: gradients[tone] || gradients.ambient,
      position: 'relative',
      overflow: 'hidden',
      ...style,
    }}>
      {/* subtle vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 50% 60%, transparent 30%, rgba(26,20,16,0.35) 100%)',
        pointerEvents: 'none',
      }} />
      {/* warm-tone film grain hint */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.04, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(rgba(244,239,230,0.6) 0.5px, transparent 0.5px)',
        backgroundSize: '3px 3px',
      }} />
      {children}
    </div>
  );
}

Object.assign(window, { Button, Eyebrow, Rule, PageMarks, PlaceholderImage });
