import { BUSINESS, instagramUrl } from '../data/business'

export default function Footer() {
  return (
    <footer className="footer">
      <p className="footer__brand">LA COMUNA</p>
      <p>{BUSINESS.fullName} · {BUSINESS.address.locality}, {BUSINESS.address.municipality}</p>
      <p>
        <a href={instagramUrl} target="_blank" rel="noopener">Instagram</a>
        {' · '}Alérgenos: pregunta al llamar al {BUSINESS.phoneDisplay}
      </p>
    </footer>
  )
}
