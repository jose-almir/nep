import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// Served from almirdev.com/nep (GitHub Pages project site).
export default defineConfig({ base: '/nep/', plugins: [tailwindcss()] })
