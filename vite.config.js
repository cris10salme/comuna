import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const page = (name) => resolve(import.meta.dirname, `${name}.html`)

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: page('index'),
        avisoLegal: page('aviso-legal'),
        privacidad: page('privacidad'),
        cookies: page('cookies'),
      },
    },
  },
})
