# LEGADO · Arquitectura Shopify

Este prototipo estático está construido como espejo 1:1 de un tema Shopify Online Store 2.0.
Cada `<!-- [shopify] … -->` en el HTML marca la sección Liquid equivalente.

---

## 1 · Catálogo

| Concepto | Implementación Shopify |
|---|---|
| Colección monoproducto | `collections/butacas` (manual, 4 productos) |
| Modelos | 1 producto por modelo: `sillon-nordic`, `sillon-venus`, `sillon-baltic`, `sillon-lara` |
| Selector de versión | Sección `version-selector`: enlaza los 4 productos de la colección (no son variantes entre sí — cada modelo tiene precio, media y SEO propios) |

### Opciones de variante (máx. 3 por producto — encajan justas)

| Opción | Valores | Afecta a precio |
|---|---|---|
| `option1 · Tapizado` | Cuero / Lino lavado / Bouclé / Terciopelo | Sí (cuero +180 €, terciopelo +90 €, bouclé +60 €) |
| `option2 · Color` | Carta según tapizado (cognac, tabaco… / crudo, arena…) | No |
| `option3 · Mecanismo` | Según modelo (fijo, relax 1 motor, 2 motores, elevación…) | Sí |

> Color genera variantes inexistentes entre tapizados (p. ej. «Cuero · Crudo»). Se gestionan
> dejando esas combinaciones sin stock/unavailable, o publicando solo las válidas vía API.
> El configurador ya filtra la carta de color por tapizado en cliente.

### Line item properties (no son variantes; personalización sin SKU)

- `properties[Madera de pata]` → Roble / Nogal / Cerezo
- `properties[Configuración]` → JSON del estado del configurador (sala, luz y postura son
  solo presentación; se guardan para contexto del pedido, no afectan a fabricación salvo madera).

### Metafields (namespace `legado`)

| Key | Tipo | Uso |
|---|---|---|
| `legado.claim` | single_line_text | «La línea clara.» |
| `legado.segmento` | single_line_text | Relax modern · Racó de descans · Cura a casa |
| `legado.persona` | multi_line_text | Buyer persona de la ficha |
| `legado.postura` | multi_line_text | Bloque 05 |
| `legado.composicion` | list.single_line_text | Bloque 02 · Materiales |
| `legado.dimensiones` | json | `{ "Alto": "104 cm", … }` |
| `legado.mecanismos` | list.single_line_text | Chips del bloque 05 |
| `legado.config3d` | json | Parámetros del modelo paramétrico del configurador |

### Metaobjects

- `tapizado` (label, origen, descripción, carta de colores con hex) → bloque Acabados + panel del configurador.
- `sala_configurador` (label, descripción, estilo) → chips de sala.
- `faq` (pregunta, respuesta, productos asociados).
- `material_historia` (nombre, origen, imagen) → grid de la página Historia.

---

## 2 · Plantillas y secciones (OS 2.0)

```
templates/
├── index.json            → hero-home · featured-collection · quote-manifesto ·
│                           values · made-in-spain · configurator-teaser · newsletter
├── product.json          → version-selector · product-hero · product-configurator ·
│                           product-materials · product-finishes · product-dimensions ·
│                           product-posture · product-warranty · product-faq · product-contact
└── page.historia.json    → story-hero · story-narrative · story-stats ·
                            story-process · story-materials · story-trust · cta-final
```

Reglas de tema (manual §28, ya respetadas en el prototipo):

1. Una sola CTA por bloque → cada sección expone un único `cta_label/cta_url` en settings.
2. Hero sin texto sobre imagen → el claim es texto real (SEO), la imagen es media aparte.
3. Sello pequeño y siempre → snippet `seal.liquid` en header, footer y firma.
4. Ficha = 7 bloques fijos + configurador → secciones bloqueadas en `product.json` (sin añadir/quitar).
5. Sin pop-ups (newsletter inline, cookies discretas).
6. Tokens en `snippets/design-tokens.liquid` ← copiar variables de `colors_and_type.css`.

### Mapa de archivos del prototipo → tema

| Prototipo | Tema Shopify |
|---|---|
| `colors_and_type.css` | `assets/legado-tokens.css` (fuentes a `assets/` o CDN propia) |
| `css/site.css` | `assets/legado-site.css` |
| `js/main.js` | `assets/legado-motion.js` (defer) |
| `js/products.js` | desaparece → datos desde Liquid (`product`, metafields, metaobjects) |
| `js/configurador.js` | `assets/legado-configurator.js`, montado por la sección `product-configurator` |
| Placeholders `.ph` | `product.media` + `image_tag` con lazy loading |

---

## 3 · Configurador → checkout

Flujo de compra:

1. El usuario configura (modelo, tapizado, color, madera, mecanismo).
2. JS resuelve la variante: `variants.find(v => v.option1 == tapizado && v.option2 == color && v.option3 == mecanismo)`.
3. `POST /cart/add.js` con `{ id: variantId, quantity: 1, properties: { "Madera de pata": …, "Configuración": … } }`.
4. Checkout estándar de Shopify (las properties viajan al pedido y al taller).

El render 3D es cliente puro (Three.js, sin backend): funciona igual en Shopify.
Cuando exista fotografía/renders reales, los modelos paramétricos pueden sustituirse por
GLB por modelo (mismo API del configurador: `setModel`, `applyFabric`…) o por Shopify
`media.model3d` para AR nativo en móvil.

Pendiente para producción: app de presupuesto/depósito si se cobra señal, webhooks de pedido
→ orden de taller, y emails transaccionales con la pauta de cuidado del tapizado elegido.
