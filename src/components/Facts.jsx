import { BUSINESS } from '../data/business'

// Tira de avisos fijos bajo la portada: lo que el cliente pregunta siempre.
export default function Facts() {
  return (
    <ul className="facts" aria-label="Información importante">
      <li><strong>Halal:</strong> todas nuestras carnes lo son</li>
      <li><strong>A domicilio</strong> solo en {BUSINESS.deliveryArea}</li>
      <li><strong>Alérgenos:</strong> pregúntanos al llamar</li>
    </ul>
  )
}
