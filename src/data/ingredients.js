// Catálogo de ingredientes de burger de la carta real. Lo comparten la web y la función /api/disena:
// la IA solo puede elegir ids de esta lista (el esquema JSON la limita), así no inventa ingredientes.
// Sin imports con alias: este archivo también lo carga Node en el servidor.

export const INGREDIENTS = {
  smash: { label: 'Smash de vaca madurada 90 g', group: 'carne', layer: { type: 'patty' } },
  'pollo-crujiente': { label: 'Pollo crujiente', group: 'carne', layer: { type: 'chicken' } },
  cheddar: { label: 'Queso cheddar', group: 'queso', layer: { type: 'cheese', kind: 'cheddar' } },
  'queso-ahumado': { label: 'Queso de vaca ahumado', group: 'queso', layer: { type: 'cheese', kind: 'ahumado' } },
  'queso-cabra': { label: 'Queso de cabra', group: 'queso', layer: { type: 'cheese', kind: 'cabra' } },
  'queso-curado': { label: 'Queso curado viejo', group: 'queso', layer: { type: 'cheese', kind: 'curado' } },
  'rulo-cabra': { label: 'Rulo de cabra', group: 'queso', layer: { type: 'goatRound' } },
  'salsa-comuna': { label: 'Salsa comuna', group: 'salsa', layer: { type: 'sauce', kind: 'comuna' } },
  'salsa-hakimi': { label: 'Salsa Hakimi', group: 'salsa', layer: { type: 'sauce', kind: 'hakimi' } },
  barbacoa: { label: 'Salsa barbacoa', group: 'salsa', layer: { type: 'sauce', kind: 'barbacoa' } },
  ketchup: { label: 'Ketchup', group: 'salsa', layer: { type: 'sauce', kind: 'ketchup' } },
  mostaza: { label: 'Mostaza', group: 'salsa', layer: { type: 'sauce', kind: 'mostaza' } },
  mayonesa: { label: 'Mayonesa', group: 'salsa', layer: { type: 'sauce', kind: 'mayonesa' } },
  'mayo-bacon': { label: 'Salsa mayo-bacon', group: 'salsa', layer: { type: 'sauce', kind: 'mayo-bacon' } },
  'mayo-trufa': { label: 'Mayonesa de trufa', group: 'salsa', layer: { type: 'sauce', kind: 'mayo-trufa' } },
  bacon: { label: 'Bacon crujiente', group: 'extra', layer: { type: 'bacon' } },
  lechuga: { label: 'Lechuga', group: 'extra', layer: { type: 'lettuce' } },
  'cebolla-picada': { label: 'Cebolla picada', group: 'extra', layer: { type: 'onionDiced' } },
  'cebolla-crujiente': { label: 'Cebolla crujiente', group: 'extra', layer: { type: 'onionCrispy' } },
  'cebolla-caramelizada': { label: 'Cebolla caramelizada', group: 'extra', layer: { type: 'onionCaramel' } },
  pepinillo: { label: 'Pepinillo', group: 'extra', layer: { type: 'pickles' } },
  'mermelada-higo': { label: 'Mermelada de higo', group: 'extra', layer: { type: 'jam', kind: 'higo' } },
  'mermelada-bacon': { label: 'Mermelada de bacon', group: 'extra', layer: { type: 'jam', kind: 'bacon' } },
}

export const INGREDIENT_IDS = Object.keys(INGREDIENTS)

// Qué lleva cada burger de la carta (para calcular a cuál se parece una burger diseñada).
// Precios: los de src/data/menu.js; se repiten aquí para que el servidor no dependa del resto de la web.
export const CARTA_BURGERS = [
  { id: 'chicken-kroc', name: 'Chicken Kroc', price: 8.5, ingredients: ['pollo-crujiente', 'lechuga', 'barbacoa'] },
  { id: 'comuna-clasica', name: 'Comuna Clásica', price: 9.9, ingredients: ['smash', 'cheddar', 'salsa-comuna'] },
  { id: 'esencial', name: 'Esencial', price: 10.9, ingredients: ['smash', 'cheddar', 'cebolla-picada', 'pepinillo', 'ketchup', 'mostaza'] },
  { id: 'big-crispy', name: 'Big Crispy', price: 11.5, ingredients: ['pollo-crujiente', 'mayo-bacon', 'lechuga', 'bacon', 'cheddar', 'cebolla-crujiente'] },
  { id: 'bliss-bacon', name: 'Bliss Bacon', price: 11.9, ingredients: ['smash', 'queso-ahumado', 'bacon', 'barbacoa'] },
  { id: 'zagora', name: 'Zagora', price: 12.5, ingredients: ['smash', 'queso-ahumado', 'cebolla-crujiente', 'mayonesa', 'salsa-hakimi'] },
  { id: 'dulzona', name: 'Dulzona', price: 12.5, ingredients: ['smash', 'queso-cabra', 'rulo-cabra', 'mermelada-higo'] },
  { id: 'pecado', name: 'Pecado', price: 12.9, ingredients: ['smash', 'bacon', 'mermelada-bacon', 'cheddar', 'queso-ahumado', 'salsa-comuna'] },
  { id: 'truffaty', name: 'Truffaty', price: 12.9, ingredients: ['smash', 'queso-curado', 'cebolla-caramelizada', 'mayo-trufa'] },
]

export const MAX_LAYERS = 10

// Limpia la lista de capas que devuelve la IA: solo ids conocidos, como mucho MAX_LAYERS, como
// mucho 3 carnes y como mucho 2 veces el mismo ingrediente. Devuelve null si no queda nada utilizable.
export function sanitizeLayers(ids) {
  if (!Array.isArray(ids)) return null
  let meats = 0
  const out = []
  const seen = {}
  for (const id of ids) {
    const ing = INGREDIENTS[id]
    if (!ing) continue
    if (ing.group === 'carne' ? meats >= 3 : (seen[id] || 0) >= 2) continue
    if (ing.group === 'carne') meats++
    seen[id] = (seen[id] || 0) + 1
    out.push(id)
    if (out.length >= MAX_LAYERS) break
  }
  return out.length ? out : null
}

// Precio orientativo: el de la burger de la carta que más se parece (índice de Jaccard sobre los
// ingredientes). En empate, la más cara, para no prometer un precio bajo que luego no sea.
export function estimatePrice(ids) {
  const mine = new Set(ids)
  let best = null
  for (const b of CARTA_BURGERS) {
    const theirs = new Set(b.ingredients)
    const inter = [...mine].filter((x) => theirs.has(x)).length
    const score = inter / new Set([...mine, ...theirs]).size
    if (!best || score > best.score || (score === best.score && b.price > best.burger.price)) best = { burger: b, score }
  }
  return { price: best.burger.price, like: best.burger.name }
}

// Receta 3D (de abajo arriba) a partir de los ids: pan + capas + pan.
export function recipeFromIds(ids) {
  const meatsTotal = ids.filter((id) => INGREDIENTS[id].group === 'carne').length
  let meatN = 0
  return [
    { type: 'bunBottom', label: 'Pan', info: 'La base de la burger.' },
    ...ids.map((id, i) => {
      const ing = INGREDIENTS[id]
      const isMeat = ing.group === 'carne'
      if (isMeat) meatN++
      return {
        ...ing.layer,
        seed: i + 1,
        label: ing.label,
        info: isMeat
          ? `${meatsTotal > 1 ? `Carne ${meatN} de ${meatsTotal}. ` : ''}Normal o halal, a elegir.`
          : `Ingrediente de nuestra carta.`,
      }
    }),
    { type: 'bunTop', label: 'Pan', info: 'La tapa.' },
  ]
}
