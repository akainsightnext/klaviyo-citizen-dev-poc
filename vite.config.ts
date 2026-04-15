import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: process.env.GITHUB_PAGES === 'true' ? '/klaviyo-citizen-dev-poc/' : '/',
  plugins: [
    tailwindcss(),
    react(),
  ],
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '.manus.computer',
      '.manus.space',
      'klaviyodev.sbs',
      'www.klaviyodev.sbs',
    ],
  },
})
