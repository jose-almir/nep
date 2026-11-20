import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// Served from the root of nep.almirdev.com (GitHub Pages custom domain).
export default defineConfig({ plugins: [tailwindcss()] })
