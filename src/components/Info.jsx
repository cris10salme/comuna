import { BUSINESS, instagramUrl, telHref } from '../data/business'
import Section from './Section'
import { OpenBadge } from './Header'

export default function Info() {
  const a = BUSINESS.address
  return (
    <Section id="info" kicker="06 — Dónde y cuándo" title="Ven o te lo llevamos">
      <div className="info">
        <div className="ticket info__card">
          <h3>Horario</h3>
          <OpenBadge />
          <table className="hours">
            <tbody>
              <tr><th>Martes a domingo</th><td>{BUSINESS.opens} – {BUSINESS.closes}</td></tr>
              <tr><th>Lunes</th><td>Cerrado</td></tr>
            </tbody>
          </table>
          <p className="info__muted">Servicio a domicilio solo en {BUSINESS.deliveryArea}.</p>
        </div>

        <div className="ticket info__card">
          <h3>Dirección</h3>
          <address>
            {a.street}<br />
            {a.postalCode} {a.locality}, {a.municipality} ({a.region})
          </address>
          <a href={BUSINESS.mapsUrl} target="_blank" rel="noopener" className="btn btn--dark btn--block">Cómo llegar</a>
        </div>

        <div className="ticket info__card">
          <h3>Pedidos</h3>
          <p>Solo por <strong>llamada</strong> (no usamos WhatsApp). Si estamos a tope y no lo cogemos, mándanos el pedido por SMS desde tu comanda.</p>
          <a href={telHref} className="info__phone">{BUSINESS.phoneDisplay}</a>
          <a href={instagramUrl} target="_blank" rel="noopener" className="info__ig">@{BUSINESS.instagram}</a>
        </div>
      </div>
    </Section>
  )
}
