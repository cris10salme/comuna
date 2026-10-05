// Carta real de La Comuna. Única fuente de verdad: la usan la web, el 3D y la IA.
// No añadir ingredientes ni precios que no estén en la carta del local.

export const SAUCES = ['Argelina', 'Marocaine', 'Ketchup', 'Mayonesa', 'Cheddar', 'Yogur', 'Barbacoa']

export const TACOS = {
  note: 'Todos con salsa de queso casera',
  sizes: [
    { id: 'M', meats: 1, price: 6 },
    { id: 'L', meats: 2, price: 7.5 },
    { id: 'XL', meats: 3, price: 9 },
  ],
  meats: ['Kebab', 'Pollo', 'Carne picada', 'Tenders'],
  sauces: SAUCES,
  gratins: { price: 2, options: ['Mozzarella', 'Cheddar', 'Rulo de cabra'] },
  menu: { price: 2.5, includes: 'patatas y bebida' },
}

export const PATTY_OPTIONS = [
  { id: 'smash', label: 'Doble smash 2×90 g' },
  { id: 'poco', label: 'Poco hecha 180 g' },
]

export const BURGERS = [
  {
    id: 'chicken-kroc',
    name: 'Chicken Kroc',
    price: 8.5,
    ingredients: ['Pollo crujiente', 'Lechuga', 'Salsa barbacoa'],
    chicken: true,
  },
  {
    id: 'comuna-clasica',
    name: 'Comuna Clásica',
    price: 9.9,
    ingredients: ['Doble smash de vaca madurada (2×90 g)', 'Queso cheddar', 'Salsa comuna'],
  },
  {
    id: 'esencial',
    name: 'Esencial',
    price: 10.9,
    ingredients: ['Doble smash', 'Cheddar', 'Cebolla picada', 'Pepinillo', 'Ketchup', 'Mostaza'],
  },
  {
    id: 'big-crispy',
    name: 'Big Crispy',
    price: 11.5,
    ingredients: [
      'Doble hamburguesa de pollo crujiente',
      'Salsa mayo-bacon',
      'Lechuga',
      'Bacon',
      'Cheddar',
      'Cebolla crujiente',
    ],
    chicken: true,
  },
  {
    id: 'bliss-bacon',
    name: 'Bliss Bacon',
    price: 11.9,
    ingredients: ['Doble smash', 'Queso de vaca ahumado', 'Bacon crujiente', 'Salsa barbacoa'],
  },
  {
    id: 'zagora',
    name: 'Zagora',
    price: 12.5,
    ingredients: ['Doble smash', 'Queso de vaca ahumado', 'Cebolla crujiente', 'Mayonesa', 'Salsa Hakimi'],
  },
  {
    id: 'dulzona',
    name: 'Dulzona',
    price: 12.5,
    ingredients: ['Doble smash', 'Queso de cabra', 'Rulo de cabra', 'Mermelada de higo'],
  },
  {
    id: 'pecado',
    name: 'Pecado',
    price: 12.9,
    ingredients: [
      'Doble smash',
      'Bacon crujiente',
      'Mermelada de bacon',
      'Cheddar',
      'Queso ahumado',
      'Salsa comuna',
    ],
  },
  {
    id: 'truffaty',
    name: 'Truffaty',
    price: 12.9,
    ingredients: ['Doble smash', 'Queso curado viejo', 'Cebolla caramelizada', 'Mayonesa de trufa'],
  },
]

export const BURGER_NOTE = 'Todas con patatas fritas'

export const STARTERS = [
  { id: 'patatas-queso-bacon', name: 'Patatas queso y bacon', price: 8.5, halalOption: true },
  { id: 'pollo-crujiente', name: 'Pollo crujiente', price: 6 },
  { id: 'tequenos', name: 'Tequeños', price: 7 },
  { id: 'patatas-4-salsas', name: 'Patatas con 4 salsas', price: 7.5, pickSauces: 4 },
]

export const DESSERTS = [
  { id: 'tarta-queso', name: 'Tarta de queso', price: 5 },
  { id: 'tarta-queso-lotus', name: 'Tarta de queso y lotus', price: 6 },
]

export const DRINKS = [
  { id: 'refresco', name: 'Refresco', price: 2 },
  { id: 'cerveza', name: 'Cerveza', price: 2.5 },
  { id: 'agua', name: 'Agua', price: 1.5 },
]
