# LEGADO · Home cinematográfica

Capa de diversión para la home: dos secciones fullscreen con liquid glass,
BlurText palabra a palabra y vídeos de fondo con fundidos (FadingVideo).
Estructura del brief «agencia cinematográfica», identidad LEGADO
(ébano/marfil/ámbar, Cormorant Garamond itálica + Inter).

Todo empuja a **ver los modelos** y **abrir el configurador de materiales**:

- **Hero**: navbar pill (Colección / Configurador / Historia / Vive el Venus +
  CTA «Configura tu sillón»), badge «Bajo demanda», titular BlurText, CTAs
  («Configura tu sillón» → `producto.html#configurador`; «Vive el Venus en 3D»
  → experiencia venus-legado), stats glass (4 semanas / 20 años) y trust bar
  con los nombres de los 4 modelos enlazados a su configurador.
- **La colección**: 4 tarjetas glass (foto, precio, tags, claim) → cada una a
  `producto.html?modelo=X#configurador`, y CTA final «Abrir el configurador de
  materiales».

## Arranque

```bash
npm i && npm run dev   # http://localhost:5179
npm run build          # dist/ para servir bajo web/
```

## Notas

- Los vídeos de fondo son los del brief (CloudFront, contenido genérico) con
  etalonaje cálido vía `filter: sepia(...)` para encajar con la marca, y con
  render local de respaldo debajo (si el vídeo no carga, no se nota). Para
  cambiar: constantes `HERO_VIDEO` / `SECTION_VIDEO` en `Hero.tsx` /
  `Coleccion.tsx`.
- Datos de modelos en `src/data/models.ts` (copiados de `web/js/products.js`).
- Los enlaces salen con `../../../` (desde `dist/` hasta la raíz de `web/`).
- Pendiente (siguiente paso acordado): unificar con la precarga + hero 3D de
  `venus-legado`.
