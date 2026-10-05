export const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  })

// Solo peticiones desde la propia web (frena scripts que reutilicen la función desde otro sitio).
export function sameOrigin(request) {
  const origin = request.headers.get('origin')
  if (!origin) return true // algunos navegadores no la mandan en mismo origen
  try {
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host')
    return new URL(origin).host === host
  } catch {
    return false
  }
}

export async function readJson(request, maxBytes = 4000) {
  const text = await request.text()
  if (text.length > maxBytes) return null
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}
