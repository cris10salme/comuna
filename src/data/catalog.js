// Lista plana de productos pedibles + cálculo de precios. La comparten la web y /api/chat:
// la IA solo puede nombrar productos de esta lista y NUNCA pone precios (los calcula este archivo).
import { BURGERS, DESSERTS, DRINKS, STARTERS, TACOS } from './menu.js'

export const PRODUCTS = [
  ...BURGERS.map((b) => ({ name: b.name, price: b.price, kind: 'burger' })),
  ...TACOS.sizes.map((s) => ({ name: `Taco ${s.id}`, price: s.price, kind: 'taco' })),
  ...STARTERS.map((s) => ({ name: s.name, price: s.price, kind: 'entrante' })),
  ...DESSERTS.map((d) => ({ name: d.name, price: d.price, kind: 'postre' })),
  ...DRINKS.map((d) => ({ name: d.name, price: d.price, kind: 'bebida' })),
]

export const PRODUCT_NAMES = PRODUCTS.map((p) => p.name)
export const GRATIN_OPTIONS = TACOS.gratins.options

// Línea de pedido: { producto, cantidad, menu, gratinado, notas }
// `menu` y `gratinado` solo cuentan en los tacos.
export function linePrice(line) {
  const p = PRODUCTS.find((x) => x.name === line.producto)
  if (!p) return null
  let unit = p.price
  if (p.kind === 'taco') {
    if (line.menu) unit += TACOS.menu.price
    if (line.gratinado && GRATIN_OPTIONS.includes(line.gratinado)) unit += TACOS.gratins.price
  }
  return unit
}

// Limpia el pedido que propone la IA: productos existentes, cantidades 1-20, máximo 15 líneas.
export function sanitizeOrder(lines) {
  if (!Array.isArray(lines)) return []
  return lines
    .filter((l) => l && PRODUCT_NAMES.includes(l.producto))
    .slice(0, 15)
    .map((l) => {
      const isTaco = PRODUCTS.find((p) => p.name === l.producto).kind === 'taco'
      return {
        producto: l.producto,
        cantidad: Math.min(20, Math.max(1, Math.round(Number(l.cantidad) || 1))),
        menu: isTaco && Boolean(l.menu),
        gratinado: isTaco && GRATIN_OPTIONS.includes(l.gratinado) ? l.gratinado : '',
        notas: typeof l.notas === 'string' ? l.notas.trim().slice(0, 140) : '',
      }
    })
}

// Texto de la carta para el asistente (generado desde los datos: si cambia un precio, cambia aquí).
export function cartaText() {
  const eur = (n) => `${n.toFixed(2).replace('.', ',')} €`
  const lines = []
  lines.push('BURGERS (todas con patatas fritas; carne a elegir: doble smash 2x90 g o poco hecha 180 g, mismo precio):')
  for (const b of BURGERS) lines.push(`- ${b.name} — ${eur(b.price)}: ${b.ingredients.join(', ')}`)
  lines.push('', `TACOS (${TACOS.note.toLowerCase()}):`)
  for (const s of TACOS.sizes) lines.push(`- Taco ${s.id} — ${eur(s.price)}: ${s.meats} ${s.meats === 1 ? 'carne' : 'carnes'}`)
  lines.push(`- Carnes: ${TACOS.meats.join(', ')}`)
  lines.push(`- Salsas: ${TACOS.sauces.join(', ')}`)
  lines.push(`- Gratinado +${eur(TACOS.gratins.price)}: ${TACOS.gratins.options.join(', ')}`)
  lines.push(`- Hazlo menú +${eur(TACOS.menu.price)}: con ${TACOS.menu.includes}`)
  lines.push('', 'ENTRANTES:')
  for (const s of STARTERS) lines.push(`- ${s.name} — ${eur(s.price)}${s.halalOption ? ' (opción halal)' : ''}${s.pickSauces ? ` (${s.pickSauces} salsas a elegir entre: ${TACOS.sauces.join(', ')})` : ''}`)
  lines.push('', 'POSTRES:')
  for (const d of DESSERTS) lines.push(`- ${d.name} — ${eur(d.price)}`)
  lines.push('', 'BEBIDAS:')
  for (const d of DRINKS) lines.push(`- ${d.name} — ${eur(d.price)}`)
  return lines.join('\n')
}
