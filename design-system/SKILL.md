---
name: legado-design
description: Use this skill to generate well-branded interfaces, assets and content for LEGADO — a Spanish premium artisan armchair brand ("Sillones para toda la vida · Hecho para quedarse"). Contains the official identity manual v2.0 (2026), the seven-tone palette (Marfil · Beige · Piel · Cuero · Nogal · Ébano · Dorado), DM Serif Display + Inter typography, tone-of-voice rules, the LEGADO seal, and a recreated website UI kit for legado.es. Use for production or for prototypes / mocks / decks.
user-invocable: true
---

# LEGADO · Design Skill

Read `README.md` for full context. Quick orientation:

- `README.md` — strategy, content fundamentals, visual foundations, iconography
- `colors_and_type.css` — drop-in CSS tokens + base styles. Always include this in any LEGADO artifact.
- `assets/` — the seal (`logo-seal.jpg`), brandbook PDF.
- `preview/` — small reference cards for palette, type, components.
- `ui_kits/website/` — full website recreation. Read this before building any new web view.

## Operating principles

1. **Eje principal: dorado sobre ébano.** Default to `data-combo="ebano"` for hero / manifesto / packaging. Default to **heritage claro** (marfil + cuero + dorado) for fichas and web functional pages.
2. **Cero blanco puro, cero negro absoluto.** Always one of the seven brand tones.
3. **DM Serif Display for what the customer remembers. Inter for what the customer needs.**
4. **Composición asimétrica, alineada a la izquierda.** Center only the seal and solemn claims.
5. **Una sola CTA por bloque.**
6. **Sello pequeño y siempre** — in nav, footer, signatures. Never huge in body.
7. **Sin emojis. Sin urgencias. Sin «mejor calidad-precio».** Voice rules in `README.md` are hard.

## How to use

- **For HTML artifacts (slides, mocks, throwaway prototypes)** — copy `colors_and_type.css` and `assets/logo-seal.jpg` into your new folder, link the CSS, and write static HTML using the tokens. Reuse JSX components from `ui_kits/website/` if helpful.
- **For production code** — read `README.md` end-to-end, copy the CSS variables into your tokens file, follow the §28 web rules (7 fixed blocks per ficha, etc).
- **If invoked without guidance** — ask the user what they want to build (slide deck? landing? newsletter? product card?), confirm tone (heritage claro vs ébano), then act as an editorial-craft designer. Default to outputting HTML.

## Pending / open

- Official seal variants (cocoa / brass / cream) — only v1 cocoa bitmap received.
- Editorial photography — placeholder gradients used everywhere.
- Real production codebase — the web is at fase Semana 4-6 of the manual roadmap.
- Iconography — no official set yet; **Lucide** is the temporary CDN substitute.

When in doubt: go back to the **manifesto, the customer archetype (Elena, 48), and the seal.** Most decisions resolve there.
