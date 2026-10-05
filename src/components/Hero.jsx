import { BUSINESS, telHref } from '../data/business'
import { OpenBadge } from './Header'

export default function Hero() {
  return (
    <section className="hero" id="top">
      <OpenBadge />
      <div className="hero__titlewrap">
        <h1 className="hero__title">
          <span>Smash</span>
          <span className="hero__amp">&amp;</span>
          <span>Tacos</span>
        </h1>
        <div className="hero__stamp" aria-hidden="true">
          <span>Pedidos</span>
          <strong>por teléfono</strong>
          <span>{BUSINESS.phoneDisplay}</span>
        </div>
      </div>
      <p className="hero__lead">
        Burgers de doble smash y tacos con salsa de queso casera. De martes a domingo, en el local o a
        domicilio en Balerma.
      </p>
      <div className="hero__actions">
        <a href="#burgers" className="btn btn--primary">Ver la carta</a>
        <a href={telHref} className="btn btn--ghost">Llamar · {BUSINESS.phoneDisplay}</a>
      </div>
    </section>
  )
}
