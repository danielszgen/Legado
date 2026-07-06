# LEGADO · Design System

> **Sillones para toda la vida.**
> Hecho para quedarse.

Sistema de diseño derivado del **Manual de Identidad de Marca v2.0 (2026)** de LEGADO. Documento interno y confidencial.

---

## ¿Qué es LEGADO?

Una marca española de **sillones premium hechos bajo demanda**. Sin stock, sin temporadas, sin showroom. Vende online sillones diseñados para acompañar las próximas dos décadas de una casa — no las próximas dos temporadas.

- **Idea madre** — Una casa se hace con los muebles que se quedan.
- **Promesa** — Diseñamos sillones para durar veinte años, no cuatro.
- **Filosofía** — Lo contrario del lujo no es la sencillez. Es la prisa.
- **Cliente arquetipo** — Elena, 48, Barcelona. Edita libros. Casa terminada. Compra pocas cosas, pero compra bien.
- **Modelos hero** — Baltic · Nordic · Venus
- **Fundador** — Daniel L. · `hola@legado.es`

### Producto
Una sola línea de negocio: **web e-commerce editorial** en `legado.es`. Sin app, sin tienda física. La marca es la prueba emocional del precio premium porque el cliente no puede tocar el producto antes de comprar.

---

## Fuentes (sources)

| Fuente | Estado | Detalle |
|---|---|---|
| `uploads/MERGED.jpg` | ✓ recibido | Logo seal — copiado a `assets/logo-seal.jpg` |
| `uploads/LEGADO_brandbook_v2.pdf` | ✓ recibido | 35 páginas. Copiado a `assets/brandbook_v2.pdf` |
| Codebase / Figma | ✗ no entregado | El producto está en fase pre-build (manual §32 "Semana 4-6 · Web v1") |
| Fotografía editorial | ✗ no entregada | Manual §32 "Semana 3-4 · Hero piece Baltic + Nordic" |

> **Nota** — Las UI kits son recreaciones del *mockup* que aparece en el manual (§28 "Web home", §29 "Redes sociales", §30 "Newsletter") porque no existe producción real todavía. Cuando llegue la web real, este kit debe re-derivarse del código.

---

## Índice del proyecto

```
.
├── README.md                ← este archivo
├── SKILL.md                 ← invocable como skill de Claude / Claude Code
├── colors_and_type.css      ← tokens CSS + base styles
├── assets/                  ← logo, brandbook PDF, imágenes
│   ├── logo-seal.jpg
│   └── brandbook_v2.pdf
├── fonts/                   ← Cormorant Garamond (10 TTF) + Inter (18 OTF)
├── brandbook/               ← presentación 18 slides 1920×1080 (dorado sobre ébano)
│   ├── index.html
│   └── deck-stage.js
├── preview/                 ← cards del Design System tab
│   ├── color-*.html
│   ├── type-*.html
│   ├── component-*.html
│   └── ...
└── ui_kits/
    └── website/             ← legado.es — recreación del mockup §28 en combo ébano
        ├── README.md
        ├── index.html
        ├── Home.jsx
        ├── ProductPage.jsx
        ├── Collection.jsx
        ├── Seal.jsx
        ├── Nav.jsx
        ├── Footer.jsx
        └── ...
```

---

## CONTENT FUNDAMENTALS · Tono de voz

Cómo escribimos. Reglas del manual §11–§14.

### Personalidad

> Cálido, **no almibarado** · Editorial, **no publicitario** · Pausado, **no aburrido** · Adulto, **no envejecido** · Concreto, **no técnico** · Confiado, **no arrogante** · Atento, **no servil** · Honesto, **no ingenuo**.

### Reglas

1. **Frases cortas. Sin adornos.** Adjetivos sólo cuando aportan información.
2. **Primera persona del plural, sin abusar.** «Hacemos sillones» mejor que «Nosotros, en Legado, fabricamos…».
3. **Concreto antes que abstracto.** «Cuatro semanas» mejor que «rápido». «Cuero de Ubrique» mejor que «materiales nobles».
4. **Hablamos del cliente, no de nosotros.** Cada frase debería poder empezar por «tú» aunque no lo haga.
5. **Nunca alarmamos.** No urgencias, no «últimas unidades», no descuentos como gancho.
6. **Castellano de adulto.** Sin anglicismos innecesarios, sin tutearle el oído al cliente.

### Lo que SÍ

- Hablamos de **duración**, no de tendencia.
- Detallamos **materiales con nombre y origen** («cuero de Ubrique», «roble macizo de Soria»).
- Decimos **cuándo un modelo no encaja**.
- Mostramos el sillón **dentro de una casa real**.

### Lo que NO

- **Urgencias** · cuentas atrás · «stock limitado».
- **Mejor calidad-precio** · «al mejor precio».
- **Lenguaje médico** para hablar de ergonomía.
- «Artesanía» sin proceso real detrás.
- **Emojis en comunicación oficial.**
- Sillón **flotando sobre fondo blanco**.

### Ejemplo canónico (manual §11)

> «Lo hacemos cuando lo pides. Tarda cuatro semanas. Es así por una razón.»

*Tres frases. Cero adornos. Una explicación clara. Una pequeña promesa.*

### Claims aprobados (manual §31, jerarquía decreciente)

1. **Sillones para toda la vida.** *(claim del sello)*
2. **Hecho para quedarse.** *(claim secundario)*
3. Una casa se hace con los muebles que se quedan.
4. El reposo es un derecho de adulto.
5. Pocas piezas. Defendidas una a una.
6. Lo hacemos cuando lo pides. Por eso dura.
7. Comprar bien una vez.

---

## VISUAL FOUNDATIONS

### Paleta cromática · 7 tonos (manual §16)

Siete tonos. **Cero blanco puro, cero negro absoluto.** Todos cálidos. Eje principal: **dorado sobre ébano**.

| Token | Hex | Nombre | Uso |
|---|---|---|---|
| `--marfil` | `#F4EFE6` | Marfil | Fondo claro. Sustituye al blanco. |
| `--beige` | `#E8DDC8` | Beige | Superficies claras secundarias. |
| `--piel` | `#C9A07A` | Piel | Acento cálido medio. |
| `--cuero` | `#6E4E32` | Cuero | Tono medio oscuro. Texturas. |
| `--nogal` | `#4A3220` | Nogal | Profundidad. Acentos extra-oscuros. |
| `--ebano` | `#1A1410` | Ébano | Fondo principal. Donde va el dorado. |
| `--dorado` | `#C9A86A` | Dorado | Acento principal. Logo, foil, capitulares. |

### Combinaciones aprobadas · §17 «Color en uso»

Tres y solo tres combinaciones. Cualquier otra está fuera del sistema.

| Combo | Distribución | Cuándo |
|---|---|---|
| **Dorado sobre ébano** | 60 % ébano · 30 % marfil · 10 % dorado | Eje principal. Cabeceras, manifiesto, packaging. |
| **Heritage claro** | 60 % marfil · 30 % cuero · 10 % dorado | Web funcional, fichas de producto. |
| **Cuero profundo** | 55 % medios · 30 % nogal · 15 % piel | Fotografía táctil, social. |

### Tipografía · §18

Dos voces. **Serif para lo que el cliente recuerda. Sans para lo que el cliente necesita.**

| Voz | Familia | Uso |
|---|---|---|
| Editorial | **Cormorant Garamond** *(local, 10 TTFs)* | Titulares, manifiesto, claims, citas. Italic para énfasis. Pesos 300–700 disponibles, default 500 en headings. |
| Servicio | **Inter** *(local, 18 OTFs)* | Navegación, fichas, FAQ, formularios, microcopy. Regular cuerpo · Medium labels · Bold solo CTAs. |

> ⚠ **Estado de fuentes** — ambas familias están **instaladas localmente** en `fonts/`. El cliente ha optado por *Cormorant Garamond* (alternativa al DM Serif Display que el manual nombra como recomendación principal). Esta familia es más clásica y refinada, más cercana al feel «editorial heritage» del manifiesto. Los headings llevan peso 500 por defecto porque Cormorant Regular es más fino que DM Serif Display Regular.

### Sistema visual · §23

Elementos recurrentes que cosen el sistema:

1. **El sello siempre presente.** Grande en cabeceras, pequeño en firma. Nunca recortado. Área de respeto: 25 % del diámetro.
2. **Marcas de página.** Cuatro pequeñas crucetas en las esquinas. Estilo libro editorial. (clase utilidad: `.page-marks`)
3. **Capitular en latón.** Inicial en serif italic, color dorado. Marca el inicio de una idea. (clase: `.dropcap`)
4. **Rule fina.** 0.4 a 0.8 pt en latón. Nunca decorativa: separa o subraya.
5. **Numeración.** Sans pequeña, pares de cifras. Da sensación de colección breve. («Nº 00184 / 2026»)
6. **Composición asimétrica.** Casi todo alineado a la izquierda. El centrado se reserva para momentos solemnes (sello, claim hero, manifiesto).

### Estilo fotográfico · §19

- **Luz lateral, hora dorada.** Nunca cenital ni flash. Atmósfera de 17:00 en otoño.
- **Casa habitada.** Libros, manta, taza, gafas. Nada de showroom.
- **Tres planos por modelo** — hero ambiental · 3/4 con figura humana parcial · detalle de textura.
- **Persona presente, no protagonista.** Manos, hombro, espalda. Nunca rostro entero.
- **Paleta tonal cálida.** Eliminar azules fríos, plásticos, brillos electrónicos.

### Texturas (§20–§22)

- **Cueros** — cognac, tabaco, moka, castaño.
- **Tejidos** — bouclé, lino lavado, terciopelo.
- **Maderas** — nogal oscuro (raíz), roble natural, castaño, cerezo.
- **Latones** — siempre **patinados**, nunca brillantes, nunca dorado nuevo.

### Backgrounds & superficies

- **Fondos** — siempre uno de los siete tonos. Nunca blanco puro (`#FFF`) ni negro absoluto (`#000`).
- **Sin gradientes** que no sean foto. La marca no usa degradados de UI.
- **Sin patrones repetidos.** La calidez la aporta el papel, el cuero y la madera reales.
- **Imagen full-bleed** preferida sobre carrousels. Una imagen ocupa el ancho completo (§28).

### Bordes y radios

- **Casi todo recto.** Heritage editorial.
- `--radius-sm: 2px` · `--radius-md: 3px` · `--radius-lg: 6px` (máximo).
- `--radius-pill` reservado para tags/chips pequeños.
- Bordes: **0.5 px en color rule o latón.** Nunca gruesos.

### Sombras

- Suaves, cálidas, sensación de **«presión sobre papel»**.
- Nunca con tinte azul. Nunca duras.
- Token base `--shadow-card`: dos capas, una hairline + una difusa larga.

### Animación y estados

- **Fades cortos.** 200 ms, ease-out.
- **Sin bounces, sin spring exagerado.** La marca es pausada.
- **Hover** — opacidad a 0.6, o cambio sutil de tono (sin agrandar elementos).
- **Press** — opacidad 1 + ligero `--shadow-press` interior. **Nunca shrink.**
- **Sin parallax, sin scroll-jacking.** El cliente lee, no juega.

### Layout

- **Composición asimétrica, alineada a la izquierda.** Solo el sello y los claims solemnes se centran.
- **Contenedor principal** — `--container: 1200px`.
- **Columna de texto** — `--container-text: 720px` (62 ch).
- **Una sola CTA por bloque.** Nunca tres botones del mismo color compitiendo (§28).
- **Hero sin texto en imagen.** El claim va en texto real, mejor SEO.

### Transparencia y blur

Casi nunca. La marca es objeto, no cristal. Solo aceptable:

- Overlay sutil sobre foto para legibilidad (`rgba(26,20,16, 0.35)` máx).
- **Sin glassmorphism.**

---

## ICONOGRAPHY

El manual **no define una librería de iconos**. La marca es deliberadamente baja en iconografía — confía en tipografía, fotografía y el sello.

### Cuándo usar iconos

- **Microcopy funcional** — envío, devolución, garantía, materiales.
- **Trazo fino**, monoline, redondeado suave. **Sin relleno sólido.**
- **Color: `--cuero` o `--nogal`** sobre fondos claros. **Nunca dorados** (el dorado es solo del sello).
- Tamaño base **20 px** con stroke 1.5 px.

### Recomendación CDN

Hasta que la marca tenga set propio, **usar [Lucide](https://lucide.dev)** (línea, monoline, 1.5 px) — encaja con el tono editorial y no compite con el sello. Cargar solo los iconos necesarios.

> ⚠ **Sustitución flagged** — Lucide es nuestra elección, no la del manual. Reemplazar cuando se defina un set propio.

### Emoji

**Nunca en comunicación oficial.** Regla explícita §13.

### Caracteres tipográficos como ornamento

Sí, con moderación:

- `·` (middle dot) como separador entre metadatos: «Cuero · cognac · Hecho en España».
- `—` (em dash) para énfasis en frases cortas.
- `❦` (fleuron) **no usado**. La ornamentación oficial es el sello y las crucetas de página.
- Numeración tipo **«Carta n.º 04»** o **«Nº 00184 / 2026»** — pares de cifras, manual §23.

### El sello como marca gráfica

El sello es **el único «icono» con alta carga visual** que tiene la marca. Tres variantes oficiales:

1. **Sello completo · cocoa** — sobre fondos cream. Uso principal.
2. **Sello completo · brass** — sobre fondos chocolate / cuero oscuro.
3. **Sello completo · cream** — negativo sobre fondos oscuros. Foil dorado opcional.
4. **Monograma LG** — solo para favicons, social avatars, marcado discreto.

> Asset disponible: `assets/logo-seal.jpg` (versión cocoa sobre marfil). **Versiones brass y cream pendientes de entrega.**

---

## Cómo usar este sistema

### En HTML estático

```html
<link rel="stylesheet" href="colors_and_type.css">
<body data-combo="ebano">
  <h1 class="claim">Sillones para toda la vida.</h1>
  <p class="lede">Hechos bajo demanda en España.</p>
</body>
```

### Tokens en CSS

```css
.card {
  background: var(--marfil-2);
  border: var(--border-laton);
  color: var(--fg1);
  padding: var(--space-6);
}
```

### Cambiar combinación cromática

```html
<section data-combo="ebano">…contenido sobre fondo oscuro…</section>
<section data-combo="cuero">…contenido sobre cuero…</section>
<section>…heritage claro por defecto…</section>
```

---

## CAVEATS

1. **Fuentes** — **ambas familias instaladas localmente** en `fonts/`: Cormorant Garamond (10 TTFs, pesos 300–700 + italics) e Inter (18 OTFs, **familia completa Thin→Black + italics**, pesos 100/200β/300β/400/500/600/700/800/900). El cliente eligió Cormorant Garamond como serif editorial (alternativa oficial al DM Serif Display del manual §18). Si en algún momento se licencian Tiempos Headline o Söhne, reemplazar las @font-face en `colors_and_type.css`.
2. **Solo tenemos el sello v1** (cocoa sobre cream). Las tres variantes oficiales (cocoa, brass, cream) están **«pendientes de incrustar»** según el propio manual §15. Hemos usado la única versión disponible en todos los mockups.
3. **No hay fotografía real.** Los UI kits usan placeholders de tonos cálidos donde irían las hero images. Sustituir al recibirlas.
4. **No hay código fuente del producto.** La web aún no está construida (manual §32, fase Semana 4-6). Los UI kits son recreaciones del mockup §28, no del producto en producción.
5. **Iconografía:** Lucide es una sustitución por defecto. Si LEGADO encarga un set propio, reemplazar.
