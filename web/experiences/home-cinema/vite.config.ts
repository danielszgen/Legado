import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' → la build funciona servida desde web/experiences/home-cinema/dist/
export default defineConfig({
  base: './',
  plugins: [react()],
  server: { port: 5179 },
  build: { outDir: 'dist' },
})
