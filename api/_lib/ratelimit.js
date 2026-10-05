import { createHash } from 'node:crypto'

// Límite de usos para que nadie pueda disparar el gasto de la API.
//
// Con Upstash Redis conectado (Vercel → Storage → Upstash for Redis, que crea las variables
// KV_REST_API_URL / KV_REST_API_TOKEN) el contador es compartido por todas las instancias.
// Sin él, se usa memoria del propio proceso: sirve en local, pero en Vercel cada instancia tiene
// su contador, así que en producción conviene conectar Upstash (el plan gratuito sobra).

const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN

const memory = new Map()

async function incr(key, ttlSeconds) {
  if (REDIS_URL && REDIS_TOKEN) {
    const res = await fetch(`${REDIS_URL}/pipeline`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${REDIS_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify([
        ['INCR', key],
        ['EXPIRE', key, String(ttlSeconds), 'NX'],
      ]),
    })
    if (!res.ok) throw new Error(`Redis ${res.status}`)
    const [first] = await res.json()
    return Number(first.result)
  }
  const now = Date.now()
  const entry = memory.get(key)
  if (!entry || entry.expires < now) {
    memory.set(key, { n: 1, expires: now + ttlSeconds * 1000 })
    return 1
  }
  entry.n += 1
  return entry.n
}

// La IP se guarda resumida (hash con sal), nunca en claro.
export function clientId(request) {
  const ip =
    request.headers.get('x-real-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    'local'
  const salt = process.env.RATE_LIMIT_SALT || 'la-comuna'
  return createHash('sha256').update(salt + ip).digest('hex').slice(0, 24)
}

const num = (v, d) => (Number.isFinite(Number(v)) && Number(v) > 0 ? Number(v) : d)

// Comprueba dos límites: por persona y hora, y un tope global diario (control de coste).
// Devuelve null si se puede seguir, o un mensaje para el cliente si no.
export async function checkLimits(request, scope, perHourDefault) {
  const perHour = num(process.env[`${scope.toUpperCase()}_LIMIT_PER_HOUR`], perHourDefault)
  const perDay = num(process.env.AI_DAILY_LIMIT, 400)
  const hour = Math.floor(Date.now() / 3_600_000)
  const day = new Date().toISOString().slice(0, 10)
  try {
    const [mine, all] = await Promise.all([
      incr(`rl:${scope}:${clientId(request)}:${hour}`, 3600),
      incr(`rl:all:${day}`, 86_400),
    ])
    if (all > perDay) return 'Hoy ya hemos atendido muchas peticiones a la IA. Vuelve mañana o llámanos directamente.'
    if (mine > perHour) return 'Has llegado al límite por ahora. Prueba dentro de un rato o llámanos directamente.'
    return null
  } catch (err) {
    console.error('rate limit', err)
    // Si el contador falla, mejor cortar que gastar sin control
    return 'El servicio no está disponible ahora mismo. Llámanos y te atendemos.'
  }
}
