// App — router. SPA between Home, Collection, ProductPage.
// Other routes (materials, about, contact) fall back to Home with a note.

function App() {
  const [route, setRoute] = React.useState({ name: 'home' });
  const go = (r) => {
    setRoute(r);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'instant' });
  };

  let page;
  if (route.name === 'home')              page = <Home go={go} />;
  else if (route.name === 'collection')   page = <Collection go={go} />;
  else if (route.name === 'product')      page = <ProductPage model={route.model} go={go} />;
  else                                    page = <Stub label={route.name} go={go} />;

  return (
    <div className="app">
      <Nav route={route} go={go} />
      {page}
      <Footer go={go} />
    </div>
  );
}

const stubStyles = {
  wrap: { padding: '180px 56px', textAlign: 'center', maxWidth: 720, margin: '0 auto' },
  eyebrow: {
    fontFamily: 'var(--font-sans)', fontSize: 11,
    letterSpacing: '0.32em', textTransform: 'uppercase',
    color: 'var(--dorado)', marginBottom: 18,
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 64, lineHeight: 1.02,
    letterSpacing: '-0.02em',
    color: 'var(--marfil)',
  },
  body: {
    marginTop: 22,
    fontFamily: 'var(--font-serif-text)',
    fontStyle: 'italic',
    fontSize: 19, lineHeight: 1.55,
    color: 'rgba(244,239,230,0.75)',
  },
};

function Stub({ label, go }) {
  const titles = {
    materials: 'Materiales',
    about: 'Sobre nosotros',
    contact: 'Contacto',
  };
  return (
    <div className="page" style={stubStyles.wrap}>
      <div style={stubStyles.eyebrow}>— Sección · {label}</div>
      <h1 style={stubStyles.title}>{titles[label] || label}</h1>
      <p style={stubStyles.body}>
        Esta sección está prevista para fase Semana 4-6 del manual.
        Volverá con fotografía editorial y voz de marca. Sin prisa.
      </p>
      <div style={{ marginTop: 32 }}>
        <Button onClick={() => go({ name: 'home' })}>Volver a casa</Button>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
