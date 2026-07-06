// Nav — sticky top bar. Sello pequeño y siempre (§28).

const navStyles = {
  bar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '22px 56px',
    background: 'var(--ebano)',
    borderBottom: '0.5px solid rgba(201,168,106,0.2)',
    position: 'sticky', top: 0, zIndex: 50,
  },
  left: { display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' },
  wordmark: {
    fontFamily: 'var(--font-display)',
    fontSize: 22,
    letterSpacing: '0.32em',
    color: 'var(--marfil)',
    textTransform: 'uppercase',
  },
  links: {
    display: 'flex',
    gap: 38,
    fontFamily: 'var(--font-sans)',
    fontSize: 12.5,
    fontWeight: 500,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    color: 'var(--marfil)',
  },
  link: {
    cursor: 'pointer',
    border: 'none',
    background: 'transparent',
    color: 'inherit',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    fontWeight: 'inherit',
    letterSpacing: 'inherit',
    textTransform: 'inherit',
    padding: 0,
    transition: 'opacity .2s ease',
  },
  linkActive: { borderBottom: '0.5px solid var(--dorado)', paddingBottom: 4 },
};

function Nav({ route, go }) {
  const items = [
    { id: 'collection', label: 'Colección' },
    { id: 'materials',  label: 'Materiales' },
    { id: 'about',      label: 'Sobre nosotros' },
    { id: 'contact',    label: 'Contacto' },
  ];
  const isActive = (id) =>
    (id === 'collection' && (route.name === 'collection' || route.name === 'product'));

  return (
    <nav style={navStyles.bar}>
      <div style={navStyles.left} onClick={() => go({ name: 'home' })}>
        <Seal size={40} mode="mono" tone="brass" />
        <span style={navStyles.wordmark}>Legado</span>
      </div>

      <div style={navStyles.links}>
        {items.map(it => (
          <button key={it.id}
                  style={{ ...navStyles.link, ...(isActive(it.id) ? navStyles.linkActive : null) }}
                  onClick={() => go({ name: it.id === 'collection' ? 'collection' : it.id })}
                  onMouseEnter={e => e.currentTarget.style.opacity = 0.55}
                  onMouseLeave={e => e.currentTarget.style.opacity = 1}>
            {it.label}
          </button>
        ))}
      </div>

      <Button variant="primary" onClick={() => go({ name: 'collection' })}>
        Ver la colección
      </Button>
    </nav>
  );
}

window.Nav = Nav;
