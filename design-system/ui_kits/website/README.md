# LEGADO · UI Kit · Sitio web (`legado.es`)

Recreación pixel-aware del **mockup de web home (§28 del Manual de Identidad v2.0)**. LEGADO no tiene app ni tienda física — el sitio web es la única superficie de producto.

## Estado

> ⚠ **Recreación de mockup, no de producción.** La web real está en fase Semana 4-6 según la hoja de ruta del propio manual (§32). Cuando exista código en producción, este kit debe re-derivarse de él.

## Pantallas incluidas

| Pantalla | Archivo | Contenido |
|---|---|---|
| Home | `Home.jsx` | Hero claim · 3 piezas hero · manifiesto extracto · newsletter |
| Colección | `Collection.jsx` | Listado editorial completo · filtros por material |
| Ficha de producto | `ProductPage.jsx` | 7 bloques (§28): hero, materiales, dimensiones, postura, garantía, FAQ, contacto |

## Componentes

| Archivo | Función |
|---|---|
| `Seal.jsx` | Sello completo + monograma reducido |
| `Nav.jsx` | Barra superior con sello pequeño |
| `Footer.jsx` | Pie editorial con firma del fundador |
| `Hero.jsx` | Hero claim sin texto sobre imagen |
| `ProductCard.jsx` | Card de pieza · nombre · material · precio |
| `MaterialBlock.jsx` | Bloque material en macro |
| `Manifesto.jsx` | Extracto del manifiesto |
| `NewsletterCard.jsx` | Captura de email pausada |
| `Button.jsx` | Primario (dorado) · secundario (outline) · ghost |

## Reglas de web (§28)

1. **Sello pequeño y siempre** — en nav, footer, firmas. Nunca grande en cuerpo.
2. **Hero sin texto en imagen** — el claim va en texto real (SEO).
3. **Una sola CTA por bloque.**
4. **Cada ficha tiene 7 bloques fijos.** Sin variaciones.
5. **Fotografía pesa más que copy.** Una imagen ocupa el ancho completo.
6. **Sin pop-ups.** Ni newsletter ni cookies que tapen contenido.

## Cómo usar

Abre `index.html` — es la demo navegable que cose Home → Colección → Ficha.

## Modelos de referencia (§28 + §27)

- **Baltic** · 890 € · Cuero cognac
- **Nordic** · 820 € · Lino lavado
- **Venus** · 760 € · Bouclé crudo
