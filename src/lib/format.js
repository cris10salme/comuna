const eur = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })
export const money = (n) => eur.format(n)
// Formato corto de carta: 6 → "6", 7.5 → "7,50"
export const price = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace('.', ','))
