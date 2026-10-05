// Composición de cada burger con capas del sistema (de abajo arriba).
// Solo ingredientes reales de la carta (src/data/menu.js).
//   label: nombre que se ve en el despiece
//   info:  ficha del ingrediente (solo datos de la carta: nada de pesos, orígenes o calorías inventados)

const HALAL = 'Carne normal o halal, a elegir.'

const bunBottom = { type: 'bunBottom', label: 'Pan', info: 'La base de la burger.' }
const bunTop = { type: 'bunTop', label: 'Pan', info: 'La tapa. Todas nuestras burgers van con patatas fritas.' }

// Doble smash: 2×90 g de vaca madurada (o una de 180 g poco hecha, a elegir)
const smash1 = { type: 'patty', seed: 1, label: 'Smash de vaca madurada', info: `Primera carne: 90 g de vaca madurada, aplastada en la plancha. ${HALAL}` }
const smash2 = { type: 'patty', seed: 2, label: 'Smash de vaca madurada', info: `Segunda carne: otros 90 g. Si la prefieres poco hecha, es una sola de 180 g. ${HALAL}` }

const sauce = (kind, label, info, seed = 1) => ({ type: 'sauce', kind, seed, label, info })
const cheese = (kind, label, info, seed = 1) => ({ type: 'cheese', kind, seed, label, info })

export const RECIPES = {
  'chicken-kroc': [
    bunBottom,
    { type: 'lettuce', label: 'Lechuga', info: 'Lechuga fresca.' },
    { type: 'chicken', seed: 1, label: 'Pollo crujiente', info: `Hamburguesa de pollo crujiente. ${HALAL}` },
    sauce('barbacoa', 'Salsa barbacoa', 'Barbacoa por encima del pollo.'),
    bunTop,
  ],
  'comuna-clasica': [
    bunBottom,
    sauce('comuna', 'Salsa comuna', 'La salsa de la casa.'),
    smash1,
    cheese('cheddar', 'Queso cheddar', 'Fundido sobre la carne recién hecha.'),
    smash2,
    cheese('cheddar', 'Queso cheddar', 'Segunda loncha, también fundida.', 2),
    sauce('comuna', 'Salsa comuna', 'Otra capa de la salsa de la casa.', 3),
    bunTop,
  ],
  esencial: [
    bunBottom,
    { type: 'pickles', label: 'Pepinillo', info: 'En rodajas.' },
    { type: 'onionDiced', label: 'Cebolla picada', info: 'Cebolla fresca picada.' },
    smash1,
    cheese('cheddar', 'Queso cheddar', 'Fundido sobre la carne.'),
    smash2,
    cheese('cheddar', 'Queso cheddar', 'Fundido sobre la segunda carne.', 2),
    sauce('ketchup', 'Ketchup', 'El clásico.', 2),
    sauce('mostaza', 'Mostaza', 'El otro clásico.', 4),
    bunTop,
  ],
  'big-crispy': [
    bunBottom,
    sauce('mayo-bacon', 'Salsa mayo-bacon', 'Mayonesa con sabor a bacon.'),
    { type: 'lettuce', label: 'Lechuga', info: 'Fresca.' },
    { type: 'chicken', seed: 1, label: 'Pollo crujiente', info: `Primera de las dos hamburguesas de pollo crujiente. ${HALAL}` },
    cheese('cheddar', 'Queso cheddar', 'Fundido entre los dos pollos.'),
    { type: 'chicken', seed: 2, label: 'Pollo crujiente', info: `Segunda hamburguesa de pollo crujiente. ${HALAL}` },
    { type: 'bacon', label: 'Bacon', info: 'Tiras de bacon.' },
    { type: 'onionCrispy', label: 'Cebolla crujiente', info: 'Cebolla crujiente por encima.' },
    bunTop,
  ],
  'bliss-bacon': [
    bunBottom,
    sauce('barbacoa', 'Salsa barbacoa', 'Barbacoa en la base.'),
    smash1,
    cheese('ahumado', 'Queso de vaca ahumado', 'Fundido sobre la carne.'),
    smash2,
    cheese('ahumado', 'Queso de vaca ahumado', 'Segunda loncha.', 2),
    { type: 'bacon', label: 'Bacon crujiente', info: 'Tiras de bacon bien crujientes.' },
    sauce('barbacoa', 'Salsa barbacoa', 'Más barbacoa por encima.', 3),
    bunTop,
  ],
  zagora: [
    bunBottom,
    sauce('mayonesa', 'Mayonesa', 'En la base.'),
    smash1,
    cheese('ahumado', 'Queso de vaca ahumado', 'Fundido sobre la carne.'),
    smash2,
    cheese('ahumado', 'Queso de vaca ahumado', 'Segunda loncha.', 2),
    { type: 'onionCrispy', label: 'Cebolla crujiente', info: 'Cebolla crujiente por encima.' },
    sauce('hakimi', 'Salsa Hakimi', 'La salsa Hakimi, por encima de todo.', 3),
    bunTop,
  ],
  dulzona: [
    bunBottom,
    smash1,
    cheese('cabra', 'Queso de cabra', 'Fundido sobre la carne.'),
    smash2,
    { type: 'goatRound', label: 'Rulo de cabra', info: 'Rodajas de rulo de cabra.' },
    { type: 'jam', kind: 'higo', label: 'Mermelada de higo', info: 'El toque dulce de la burger.' },
    bunTop,
  ],
  pecado: [
    bunBottom,
    sauce('comuna', 'Salsa comuna', 'La salsa de la casa.'),
    smash1,
    cheese('cheddar', 'Queso cheddar', 'Fundido sobre la primera carne.'),
    smash2,
    cheese('ahumado', 'Queso ahumado', 'Fundido sobre la segunda carne.', 2),
    { type: 'bacon', label: 'Bacon crujiente', info: 'Tiras de bacon bien crujientes.' },
    { type: 'jam', kind: 'bacon', label: 'Mermelada de bacon', info: 'Bacon en mermelada: dulce y salado.' },
    bunTop,
  ],
  truffaty: [
    bunBottom,
    sauce('mayo-trufa', 'Mayonesa de trufa', 'En la base.'),
    smash1,
    cheese('curado', 'Queso curado viejo', 'Sobre la primera carne.'),
    smash2,
    cheese('curado', 'Queso curado viejo', 'Segunda capa de queso curado.', 2),
    { type: 'onionCaramel', label: 'Cebolla caramelizada', info: 'Cebolla cocinada hasta caramelizar.' },
    sauce('mayo-trufa', 'Mayonesa de trufa', 'Otra capa por encima.', 3),
    bunTop,
  ],
}
