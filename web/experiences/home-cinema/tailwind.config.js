/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        heading: ["'Cormorant Garamond'", 'serif'],
        body: ["'Inter'", 'sans-serif'],
      },
      colors: {
        ebano: '#0b0a08',
        marfil: '#f4efe6',
        ambar: '#c9a86a',
        laton: '#b08d57',
      },
    },
  },
  plugins: [],
}
