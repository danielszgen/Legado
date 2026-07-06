# LEGADO · Plan de generación de imágenes fotorrealistas

> **Estado: BLOQUEADO** — la cuenta de fal.ai no tiene saldo («Exhausted balance»).
> Recargar en fal.ai/dashboard/billing (~3 USD cubre todo el plan) y pedir a Claude
> «regenera las imágenes según GENERACION_IMAGENES.md».

**Modelo:** `fal-ai/nano-banana-2/edit` (con referencia Moher) y `fal-ai/nano-banana-2` (text-to-image). ~0,08 USD/imagen · 27 imágenes ≈ 2,2 USD.

**La web ya está cableada:** cada imagen que aparezca en `web/assets/img/` con el nombre
correcto se muestra automáticamente (fallback: gradiente cálido del design system).

## Estilo común (de §19 del manual)

Luz lateral de hora dorada desde una ventana a la IZQUIERDA, atmósfera de 17:00 en otoño,
casa habitada (libros, manta, taza), nunca showroom. Paleta estrictamente cálida (marfil,
crema, caramelo, cognac, nogal, chocolate), sin azules. Persona presente pero nunca el
rostro. Grano fino, 50 mm, poca profundidad de campo. Sin texto ni marcas de agua.

## Referencias del fabricante (descargadas en `assets/ref/`)

| Modelo | Referencia Moher | Retapizado LEGADO |
|---|---|---|
| Nordic | `ref/nordic.png` (…/2024/12/Nordic-1.png) | Lino lavado crudo |
| Venus  | `ref/venus.png` (…/2024/12/Sin-titulo-1-copia.png) | Bouclé crudo · conservar base estrella negra |
| Baltic | `ref/baltic.png` (…/2024/12/Baltic-1.png) | Cuero cognac curtido vegetal · conservar patas madera |
| Lara   | `ref/lara.png` (…/2024/12/Lara.png) | Lino arena |

## Lote A · Butacas (nano-banana-2/edit, 13 imágenes)

Por cada modelo, 3 tomas (4:5, 4:5, 1:1 · 1K · jpeg), siempre con
«CRITICAL: keep the EXACT armchair design from the reference image» + retapizado:

| Archivo destino | Toma |
|---|---|
| `{modelo}-ambiente.jpg` | Sillón completo 3/4 en escena de su buyer persona: Nordic→salón editorial Barcelona; Venus→salón abierto de arquitecto; Baltic→rincón de lectura con lámpara y manta; Lara→salón familiar clásico cálido |
| `{modelo}-persona.jpg` | Presencia humana parcial sin rostro: Nordic→mujer leyendo de espaldas; Venus→piernas cruzadas vista lateral; Baltic→mano con taza sobre el brazo; Lara→mano mayor con manga de punto sobre el brazo ancho |
| `{modelo}-detalle.jpg` | Macro del tapizado con costura, luz rasante desde la izquierda |
| `hero-home.jpg` (4:5) | Baltic en cognac, salón en penumbra cálida al atardecer: paredes chocolate oscuro, lámpara de latón encendida — eje dorado-sobre-ébano |

## Lote B · Salas del configurador (nano-banana-2 t2i, 8 imágenes 16:9 2K)

`sala-{estilo}-{dia|noche}.jpg`. Prompt base: «Empty living room interior, wide shot,
camera at chest height (~1.3 m), LARGE EMPTY wooden floor area in the center foreground
(an armchair will be composited there), furniture only at the edges, window at the LEFT».

- `moderno` — roble claro, paredes greige cálidas, líneas rectas, arte abstracto.
- `rustico` — viga de madera, pared de cal, suelo de barro cocido, cesta y manta de lana.
- `mediterraneo` — cal marfil, arco, olivo en maceta, alfombra de yute, luz intensa.
- `clasico` — boiserie de nogal, librería, lámpara de pie clásica, suelo espiga oscuro.
- Versión `dia`: sol lateral de hora dorada. Versión `noche`: lámparas cálidas encendidas, ventana oscura, penumbra ámbar (sin azules).

## Lote C · Taller y texturas (nano-banana-2 t2i, 6 imágenes)

- `taller-1.jpg` (4:3) y `taller-2.jpg` (4:5): taller de tapicería español, manos de
  artesano grapando lino a estructura de haya, virutas, luz dorada lateral. Sin rostros.
- `tex-cuero.jpg`, `tex-lino.jpg`, `tex-boucle.jpg`, `tex-madera.jpg` (1:1): macros de
  cuero cognac con poro, lino crudo, bouclé rizado crema, veta de roble/nogal aceitado.

## Mapa imagen → uso en la web

| Archivo | Dónde aparece |
|---|---|
| `hero-home.jpg` | Home · hero |
| `{modelo}-ambiente.jpg` | Home · cards colección + Producto · galería 1 |
| `{modelo}-persona.jpg` | Producto · galería 2 · (`nordic-persona` también en Historia) |
| `{modelo}-detalle.jpg` | Producto · galería 3 |
| `venus-ambiente.jpg` | Home · teaser configurador |
| `taller-1.jpg` / `taller-2.jpg` | Home · fabricación / Historia · proceso |
| `tex-*.jpg` | Historia · materiales |
| `sala-*-{dia,noche}.jpg` | Configurador · fondo fotográfico (suelo capta-sombras automático) |
