// Composición de cada burger con capas del sistema (de abajo arriba).
// Solo ingredientes reales de la carta (src/data/menu.js). `label` es lo que se ve al desmontar.

export const RECIPES = {
  'comuna-clasica': [
    { type: 'bunBottom', label: 'Pan' },
    { type: 'sauce', kind: 'comuna', label: 'Salsa comuna' },
    { type: 'patty', seed: 1, label: 'Smash 90 g' },
    { type: 'cheese', kind: 'cheddar', seed: 1, label: 'Cheddar' },
    { type: 'patty', seed: 2, label: 'Smash 90 g' },
    { type: 'cheese', kind: 'cheddar', seed: 2, label: 'Cheddar' },
    { type: 'sauce', kind: 'comuna', seed: 3, label: 'Salsa comuna' },
    { type: 'bunTop', label: 'Pan' },
  ],
}
