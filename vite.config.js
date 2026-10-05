import { resolve } from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const page = (name) => resolve(import.meta.dirname, `${name}.html`)

// En local, sirve las funciones de /api con el mismo código que usa Vercel (handlers Web: POST(request)).
// Las variables de .env.local (ANTHROPIC_API_KEY, AI_MOCK…) se pasan a process.env solo en desarrollo.
function localApi() {
  return {
    name: 'local-api',
    configureServer(server) {
      Object.assign(process.env, loadEnv('development', process.cwd(), ''))
      server.middlewares.use(async (req, res, next) => {
        const match = req.url?.match(/^\/api\/([a-z-]+)$/)
        if (!match) return next()
        try {
          const mod = await server.ssrLoadModule(`/api/${match[1]}.js`)
          const handler = mod[req.method]
          if (!handler) {
            res.statusCode = 405
            return res.end()
          }
          const chunks = []
          for await (const c of req) chunks.push(c)
          const request = new Request(`http://${req.headers.host}${req.url}`, {
            method: req.method,
            headers: req.headers,
            body: req.method === 'GET' ? undefined : Buffer.concat(chunks),
          })
          const response = await handler(request)
          res.statusCode = response.status
          response.headers.forEach((v, k) => res.setHeader(k, v))
          res.end(Buffer.from(await response.arrayBuffer()))
        } catch (err) {
          console.error(err)
          res.statusCode = 500
          res.end('Error en la función local')
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), localApi()],
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
