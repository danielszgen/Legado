// Seal — circular brand mark.
// Manual §15 defines two operational variants:
//   · Sello completo (bitmap, single official asset received)
//   · Monograma LG (typographic, for favicons / small sizes)
// Use bitmap by default at any size; the typographic fallback (`mode="mono"`)
// is for nav/footer corners and social avatars.
//
// The official bitmap is cocoa-on-cream. To render the "brass on ébano"
// variant (manual §16, sello completo · brass), pass `tone="brass"` —
// an SVG color-matrix knocks out the cream paper and tints the ink to
// dorado #C9A86A, producing a fused foil-stamp look.

// Inject the goldify filter once per document
let __sealFilterInjected = false;
function ensureSealFilter() {
  if (__sealFilterInjected || typeof document === 'undefined') return;
  __sealFilterInjected = true;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '0'); svg.setAttribute('height', '0');
  svg.setAttribute('aria-hidden', 'true');
  svg.style.position = 'absolute';
  svg.innerHTML = `
    <defs>
      <filter id="legado-goldify" color-interpolation-filters="sRGB">
        <feColorMatrix type="matrix" values="
          1 0 0 0 0
          0 1 0 0 0
          0 0 1 0 0
          -3 -3 -3 0 2.4"/>
        <feColorMatrix type="matrix" values="
          0 0 0 0 0.788
          0 0 0 0 0.659
          0 0 0 0 0.416
          0 0 0 1 0"/>
        <feGaussianBlur stdDeviation="0.35"/>
      </filter>
    </defs>`;
  document.body.appendChild(svg);
}

function Seal({ size = 80, mode = 'auto', tone = 'cocoa' }) {
  React.useEffect(() => { ensureSealFilter(); }, []);
  const useBitmap = mode === 'bitmap' || (mode === 'auto' && size >= 90);

  if (useBitmap) {
    // For brass and cream tones, run the bitmap through the goldify filter.
    const filtered = tone === 'brass' || tone === 'cream';
    return (
      <img
        src="../../assets/logo-seal.jpg"
        alt="LEGADO · Sillones para toda la vida"
        style={{
          width: size, height: size,
          display: 'block',
          borderRadius: '50%',
          flexShrink: 0,
          filter: filtered ? 'url(#legado-goldify)' : 'none',
          mixBlendMode: filtered ? 'screen' : 'normal',
          opacity: filtered ? 0.92 : 1,
        }}
      />
    );
  }

  // Monograma LG · constructed equivalent
  const palettes = {
    cocoa: { ring: 'var(--nogal)', text: 'var(--nogal)' },
    brass: { ring: 'var(--dorado)', text: 'var(--dorado)' },
    cream: { ring: 'var(--marfil)', text: 'var(--marfil)' },
  };
  const p = palettes[tone] || palettes.cocoa;

  return (
    <div style={{
      width: size, height: size,
      borderRadius: '50%',
      border: `0.5px solid ${p.ring}`,
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      color: p.text,
    }}>
      <div style={{
        position: 'absolute', inset: size * 0.10,
        borderRadius: '50%',
        border: `0.5px solid ${p.ring}`,
        opacity: 0.55,
      }} />
      <div style={{
        fontFamily: 'var(--font-display)',
        fontStyle: 'italic',
        fontSize: size * 0.42,
        lineHeight: 1,
        letterSpacing: '-0.04em',
        color: p.text,
        position: 'relative',
      }}>LG</div>
    </div>
  );
}

window.Seal = Seal;
