import { useEffect, useState } from 'react'
import { BUSINESS, telHref } from '../data/business'
import { BURGERS, TACOS } from '../data/menu'
import { price } from '../lib/format'
import { nextServiceLabel } from '../lib/hours'
import { OpenBadge, useOpenStatus } from './Header'

// Palabras que rotan en el titular: lo que se cena aquí (Pecado es una burger real de la carta).
const WORDS = ['Smash.', 'Tacos.', 'Pecado.']

const minBurger = Math.min(...BURGERS.map((b) => b.price))
const minTaco = Math.min(...TACOS.sizes.map((s) => s.price))
const clasica = BURGERS.find((b) => b.id === 'comuna-clasica')

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

function RotatingWord() {
  const [i, setI] = useState(0)
  useEffect(() => {
    if (prefersReducedMotion()) return
    const id = setInterval(() => setI((n) => (n + 1) % WORDS.length), 2200)
    return () => clearInterval(id)
  }, [])
  return (
    <span className="rotator" aria-hidden="true">
      <span key={i} className="rotator__word">{WORDS[i]}</span>
    </span>
  )
}

export default function Hero() {
  useOpenStatus() // re-render cada minuto para que "Esta noche / Mañana" esté al día
  const when = nextServiceLabel()

  return (
    <section className="hero" id="top">
      <div className="hero__glow" aria-hidden="true" />
      <div className="hero__ghost" aria-hidden="true">COMUNA</div>

      <div className="hero__main">
        <OpenBadge />
        <h1 className="hero__title" aria-label={`${when} se cena smash y tacos en La Comuna`}>
          <span className="hero__pre" aria-hidden="true">{when}<br />se cena</span>
          <RotatingWord />
        </h1>
        <p className="hero__lead">
          Doble smash a la plancha y tacos con salsa de queso casera. Llamas, lo preparamos y lo recoges o te
          lo llevamos en Balerma.
        </p>
        <div className="hero__actions">
          <a href={telHref} className="btn btn--primary btn--big">
            Pide ya · {BUSINESS.phoneDisplay}
          </a>
          <a href="#burgers" className="btn btn--ghost btn--big">Ver la carta</a>
        </div>
      </div>

      <aside className="hero__ticket ticket" aria-label="Precios destacados">
        <div className="ticket__top">
          <span className="ticket__num">En la plancha</span>
          <span className="ticket__tag">{BUSINESS.opens}–{BUSINESS.closes}</span>
        </div>
        <dl className="hero__prices">
          <div>
            <dt>Tacos</dt>
            <dd><small>desde</small> {price(minTaco)}€</dd>
          </div>
          <div>
            <dt>Burgers con patatas</dt>
            <dd><small>desde</small> {price(minBurger)}€</dd>
          </div>
          <div className="hero__prices-star">
            <dt>{clasica.name}<span>{clasica.ingredients.join(' · ')}</span></dt>
            <dd>{price(clasica.price)}€</dd>
          </div>
        </dl>
        <p className="hero__ticket-foot">Carne normal o halal · A domicilio en Balerma</p>
      </aside>
    </section>
  )
}
