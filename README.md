# LEGADO · Sillones para toda la vida

> Prototipo web e-commerce monoproducto premium + análisis estratégico de marca.
> Hecho para quedarse.

## Qué hay aquí

| Carpeta / archivo | Contenido |
|---|---|
| [`ANALISIS.md`](ANALISIS.md) | Análisis de marca, mercado (matriz de segmentos) y selección producto × buyer persona |
| [`web/`](web/) | Prototipo estático espejo de Shopify OS 2.0: Home, ficha de producto con **configurador 3D** e Historia |
| [`web/SHOPIFY.md`](web/SHOPIFY.md) | Arquitectura Shopify: variantes, metafields, metaobjects, secciones y flujo de checkout |
| [`web/GENERACION_IMAGENES.md`](web/GENERACION_IMAGENES.md) | Plan de fotografía editorial (pendiente de generación/producción) |
| [`design-system/`](design-system/) | Design system oficial LEGADO v2.0 (tokens, fuentes, brandbook, UI kits) |
| [`tools/`](tools/) | Scripts de proceso de imagen (PowerShell + System.Drawing) |

## Ver la web

Cualquier servidor estático sirve. Con Node instalado:

```bash
npx http-server web -p 4173
# → http://localhost:4173
```

La ficha de producto (`producto.html?modelo=nordic|venus|baltic|lara`) incluye el
configurador 3D: giro 360º, 5 escenarios (4 salas fotográficas reales día/noche +
estudio marfil), posturas de reclinado y tapizados con precio en vivo.

## Créditos de imagen

- Packshots de producto: [Moher Mobiliario](https://mohermobiliario.com) (Yecla) — referencia industrial del prototipo.
- Panorámicas de salas: [Poly Haven](https://polyhaven.com) (CC0).
- La fotografía editorial de marca está pendiente (§32 del manual de identidad); los huecos usan placeholders del design system.

---

Marca, textos y design system: proyecto LEGADO · interno y confidencial.
