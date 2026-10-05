import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import { BUSINESS } from '../data/business'
import { money } from './format'

const STORAGE_KEY = 'lacomuna-pedido-v1'
const OrderContext = createContext(null)

const initial = { items: [], mode: 'recoger', name: '', address: '', open: false }

function reducer(state, action) {
  switch (action.type) {
    case 'add': {
      const existing = state.items.find((i) => i.key === action.item.key)
      const items = existing
        ? state.items.map((i) => (i.key === action.item.key ? { ...i, qty: i.qty + 1 } : i))
        : [...state.items, { ...action.item, qty: 1 }]
      return { ...state, items }
    }
    case 'qty': {
      const items = state.items
        .map((i) => (i.key === action.key ? { ...i, qty: i.qty + action.delta } : i))
        .filter((i) => i.qty > 0)
      return { ...state, items }
    }
    case 'clear':
      return { ...state, items: [] }
    case 'field':
      return { ...state, [action.field]: action.value }
    case 'open':
      return { ...state, open: action.value }
    default:
      return state
  }
}

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    return saved ? { ...initial, ...saved, open: false } : initial
  } catch {
    return initial
  }
}

export function OrderProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, load)

  useEffect(() => {
    try {
      const { open, ...persist } = state
      localStorage.setItem(STORAGE_KEY, JSON.stringify(persist))
    } catch {
      /* modo privado o almacenamiento bloqueado: el pedido vive solo en memoria */
    }
  }, [state])

  const value = useMemo(() => {
    const count = state.items.reduce((n, i) => n + i.qty, 0)
    const total = state.items.reduce((n, i) => n + i.qty * i.unitPrice, 0)
    return {
      ...state,
      count,
      total,
      add: (item) => dispatch({ type: 'add', item }),
      changeQty: (key, delta) => dispatch({ type: 'qty', key, delta }),
      clear: () => dispatch({ type: 'clear' }),
      setField: (field, value) => dispatch({ type: 'field', field, value }),
      setOpen: (value) => dispatch({ type: 'open', value }),
    }
  }, [state])

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
}

export const useOrder = () => useContext(OrderContext)

// Clave estable para agrupar líneas idénticas del pedido.
export const itemKey = (id, detail = []) => [id, ...detail].join('|')

export function orderText({ items, total, mode, name, address }) {
  const lines = [`Hola ${BUSINESS.name}, quiero hacer un pedido:`, '']
  for (const i of items) {
    lines.push(`${i.qty}x ${i.name} – ${money(i.qty * i.unitPrice)}`)
    for (const d of i.detail) lines.push(`   · ${d}`)
  }
  lines.push('', `Total: ${money(total)}`)
  if (mode === 'domicilio') {
    lines.push(`A domicilio: ${address.trim() || '(indico la dirección)'}`)
  } else {
    lines.push('Para recoger en el local')
  }
  if (name.trim()) lines.push(`Nombre: ${name.trim()}`)
  return lines.join('\n')
}
