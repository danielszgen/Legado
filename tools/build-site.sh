#!/usr/bin/env bash
# Ensambla el sitio LEGADO unificado en dist-site/:
#   raíz          → home cinematográfica (web/experiences/home-cinema/dist)
#   home clásica  → /home-clasica.html (la antigua web/index.html)
#   resto de web/ → producto.html, historia.html, assets, js, css…
#   experiencia   → /experiences/venus-legado/dist/
# Deploy: vercel deploy --cwd dist-site
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/dist-site"

echo "→ build venus-legado"
(cd "$ROOT/web/experiences/venus-legado" && npm run build) >/dev/null

echo "→ build home-cinema"
(cd "$ROOT/web/experiences/home-cinema" && npm run build) >/dev/null

echo "→ ensamblando $OUT"
rm -rf "$OUT"
mkdir -p "$OUT"
rsync -a \
  --exclude 'experiences/*/node_modules' \
  --exclude 'experiences/*/src' \
  --exclude 'experiences/*/tools' \
  --exclude 'experiences/*/public' \
  --exclude 'experiences/home-cinema/dist' \
  --exclude 'experiences/*/*.json' \
  --exclude 'experiences/*/*.js' \
  --exclude 'experiences/*/*.ts' \
  --exclude 'experiences/*/index.html' \
  --exclude 'experiences/*/README.md' \
  --exclude 'experiences/*/tsconfig.tsbuildinfo' \
  --exclude '.vercel' \
  --exclude '.vercelignore' \
  "$ROOT/web/" "$OUT/"

# La home clásica queda accesible; la raíz pasa a ser la cinematográfica
cp "$ROOT/web/index.html" "$OUT/home-clasica.html"
rsync -a "$ROOT/web/experiences/home-cinema/dist/" "$OUT/"

echo "✓ sitio en $OUT"
