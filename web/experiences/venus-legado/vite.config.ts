import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' → la build funciona servida desde web/experiences/venus-legado/dist/
// sin depender de la raíz del servidor (la home estática enlaza a esa ruta).
export default defineConfig({
  base: './',
  plugins: [react()],
  server: { port: 5178 },
  build: { outDir: 'dist', chunkSizeWarningLimit: 1600 },
})
