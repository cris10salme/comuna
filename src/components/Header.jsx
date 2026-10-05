import { useEffect, useState } from 'react'
import { openStatus } from '../lib/hours'
import { useOrder } from '../lib/order'

const SECTIONS = [
  ['burgers', 'Burgers'],
  ['tacos', 'Tacos'],
  ['entrantes', 'Entrantes'],
  ['postres', 'Postres'],
  ['bebidas', 'Bebidas'],
  ['info', 'Dónde'],
]

export function useOpenStatus() {
  const [status, setStatus] = useState(() => openStatus())
  useEffect(() => {
    const id = setInterval(() => setStatus(openStatus()), 60_000)
    return () => clearInterval(id)
  }, [])
  return status
}

export function OpenBadge() {
  const status = useOpenStatus()
  return (
    <span className={`badge ${status.open ? 'badge--open' : 'badge--closed'}`}>
      <span className="badge__dot" aria-hidden="true" />
      {status.label}
    </span>
  )
}

export default function Header() {
  const { count, setOpen } = useOrder()
  return (
    <header className="header">
      <div className="header__bar">
        <a href="#top" className="logo" aria-label="La Comuna, inicio">
          LA COMUNA<span className="logo__sub">SMASH &amp; TACOS</span>
        </a>
        <button className="header__ticket" onClick={() => setOpen(true)}>
          Mi pedido
          <span className="header__count" aria-label={`${count} productos`}>{count}</span>
        </button>
      </div>
      <nav className="tabs" aria-label="Secciones de la carta">
        {SECTIONS.map(([id, label]) => (
          <a key={id} href={`#${id}`} className="tabs__link">
            {label}
          </a>
        ))}
      </nav>
    </header>
  )
}
