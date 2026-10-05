// Composición de cada burger con capas del sistema (de abajo arriba).
// Solo ingredientes reales de la carta (src/data/menu.js).
//   label: nombre que se ve en el despiece
//   info:  ficha del ingrediente (solo datos de la carta: nada de pesos o calorías inventados)

const HALAL = 'Carne normal o halal, a elegir.'

export const RECIPES = {
  'comuna-clasica': [
    { type: 'bunBottom', label: 'Pan', info: 'La base de la burger.' },
    { type: 'sauce', kind: 'comuna', label: 'Salsa comuna', info: 'La salsa de la casa.' },
    { type: 'patty', seed: 1, label: 'Smash de vaca madurada', info: `Primera carne: 90 g de vaca madurada, aplastada en la plancha. ${HALAL}` },
    { type: 'cheese', kind: 'cheddar', seed: 1, label: 'Queso cheddar', info: 'Fundido sobre la carne recién hecha.' },
    { type: 'patty', seed: 2, label: 'Smash de vaca madurada', info: `Segunda carne: otros 90 g. Si la prefieres poco hecha, es una de 180 g. ${HALAL}` },
    { type: 'cheese', kind: 'cheddar', seed: 2, label: 'Queso cheddar', info: 'Segunda loncha, también fundida.' },
    { type: 'sauce', kind: 'comuna', seed: 3, label: 'Salsa comuna', info: 'Otra capa de la salsa de la casa.' },
    { type: 'bunTop', label: 'Pan', info: 'La tapa. Todas nuestras burgers van con patatas fritas.' },
  ],
}
