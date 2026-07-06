# Vive el Venus — experiencia cinematográfica LEGADO

Landing de una sola página con scroll vertical: un hero arranca FUERA de la
casa, mirando la puerta encendida; al deslizar, la cámara cruza el umbral y
avanza hasta el rincón del salón donde espera el Venus, recorriendo 7 beats
narrativos. En cada beat aparecen el titular y los beneficios (base giratoria,
cabezal reclinable, masaje, manta calefactora, elevador), y cierra con
«Hecho para quedarse.»

El modelo placeholder sigue la referencia real `web/assets/ref/venus.png`:
tela gris perla, respaldo alto con cabezal integrado, brazos tipo pala y base
giratoria de aspa metálica negra de 5 radios.

## Arranque

```bash
npm i && npm run dev
```

Dev server en `http://localhost:5178`.

```bash
npm run build   # genera dist/ — la home enlaza a experiences/venus-legado/dist/
```

La home estática (`web/index.html`) enlaza esta experiencia como **«Vive el
Venus»** apuntando a `experiences/venus-legado/dist/index.html`; tras cambiar
código, vuelve a ejecutar `npm run build`.

## Stack

- React + Vite + TypeScript + Tailwind CSS
- Framer Motion (BlurText palabra a palabra, overlays, loader)
- @react-three/fiber + @react-three/drei (`ScrollControls` + `useScroll` atan
  cámara↔scroll; sin GSAP)

## Estructura

| Archivo | Qué hace |
| --- | --- |
| `src/data/beats.ts` | Los 7 beats: titulares exactos, micro-copy, chips y cámaras ancla |
| `src/components/Scene3D.tsx` | Canvas único a pantalla completa + ScrollControls (7 páginas) |
| `src/components/CameraRig.tsx` | Interpola posición/target entre anclas (power2.inOut + damping) |
| `src/components/VenusModel.tsx` | Carga el glb, loguea tamaño real, normaliza escala; giro del beat 2 y elevación del beat 5 |
| `src/components/SceneEnvironment.tsx` | Suelo con reflejo, pared con luz de ventana, niebla cálida, motas, penumbra de brasa |
| `src/components/BeatOverlay.tsx` | Tarjetas liquid-glass por beat, chips y CTA final |
| `src/components/BlurText.tsx` | Aparición blur(10px)→0 + y 30→0, stagger por palabra |
| `src/components/LiquidGlass.tsx` | GlassCard / GlassPill / GlassButton (tinte cálido) |
| `src/components/ReducedMotionStory.tsx` | Variante `prefers-reduced-motion`: secuencia estática con posters |
| `src/index.css` | `.liquid-glass` / `.liquid-glass-strong` (mask-composite xor, tinte marfil) |

## Estado de los assets (importante)

El brief referencia tres fuentes que **no existen en el repo**:
`3d/storyboards/venus-legado.md`, `3d/venus-ficha.md` y
`web/assets/3d/models/venus.glb`.

- **Titulares y chips**: son los textos exactos dictados en el brief.
  El micro-copy de apoyo sigue la voz de marca de `web/js/products.js`.
- **Cámaras ancla**: definidas en `src/data/beats.ts` para el modelo
  normalizado (1.45 u de alto sobre y=0); `VenusModel` loguea el tamaño real
  del glb en consola.
- **Modelo**: `venus.glb` es un placeholder estilizado generado con
  `npm run generate:model` (tools/generate-venus-glb.mjs). Optimizado con
  `npx @gltf-transform/cli optimize … --texture-compress webp`
  (809 KB → 48 KB); la app carga `venus-opt.glb`.
  **Cuando exista el modelo real**, sobrescribe
  `web/assets/3d/models/venus.glb`, repite el optimize y copia el resultado a
  `public/assets/3d/models/venus-opt.glb`. Nada más: escala y centrado son
  automáticos.
- **Posters**: `web/assets/3d/posters/*.webp` generados desde las fotos
  reales del Venus (`web/assets/img/venus-*.jpg`).

## Accesibilidad y rendimiento

- `prefers-reduced-motion: reduce` → sin 3D ni animaciones: los mismos textos
  con posters, scroll nativo.
- Un solo `<Canvas>` (`dpr [1,2]`, `high-performance`); el modelo se monta una
  vez; overlays DOM se actualizan sin re-render por frame (bus de scroll).
- Poster de respaldo durante la carga del glb (Suspense + useProgress).
