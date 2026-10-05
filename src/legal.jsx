import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/archivo-black/latin-400.css'
import '@fontsource-variable/inter/index.css'
import './styles.css'
import { BUSINESS } from './data/business'

// Marcador visible de dato pendiente. Buscar "Fill" antes de publicar: no debe quedar ninguno.
const Fill = ({ children }) => <mark className="fill">[RELLENAR: {children}]</mark>

const a = BUSINESS.address
const domicilio = `${a.street}, ${a.postalCode} ${a.locality}, ${a.municipality} (${a.region})`

const PAGES = {
  'aviso-legal': {
    title: 'Aviso legal',
    body: (
      <>
        <p>
          En cumplimiento del artículo 10 de la Ley 34/2002, de Servicios de la Sociedad de la Información y de
          Comercio Electrónico (LSSI-CE), se informa de los datos del titular de este sitio web:
        </p>
        <ul>
          <li>Titular: <Fill>nombre y apellidos o razón social</Fill></li>
          <li>NIF/CIF: <Fill>NIF o CIF</Fill></li>
          <li>Nombre comercial: {BUSINESS.fullName}</li>
          <li>Domicilio: {domicilio}</li>
          <li>Teléfono: {BUSINESS.phoneDisplay}</li>
          <li>Correo electrónico: <Fill>email de contacto</Fill></li>
          <li>Datos registrales (solo si es sociedad): <Fill>Registro Mercantil, tomo, folio, hoja — o borrar esta línea</Fill></li>
        </ul>
        <h2>Uso del sitio</h2>
        <p>
          Este sitio informa sobre la carta, precios, horario y forma de hacer pedidos. Los pedidos no se
          formalizan en la web: se realizan por llamada telefónica o, como alternativa, por SMS, y se confirman
          con el establecimiento. Los precios mostrados incluyen IVA y pueden cambiar; prevalece el precio
          confirmado al hacer el pedido.
        </p>
        <h2>Alérgenos</h2>
        <p>
          Puedes solicitar la información sobre alérgenos de cualquier plato llamando al {BUSINESS.phoneDisplay}
          antes de hacer tu pedido.
        </p>
        <h2>Propiedad intelectual</h2>
        <p>
          Los textos, diseño y elementos gráficos de este sitio pertenecen a su titular o se usan con permiso.
          No se permite su reproducción sin autorización.
        </p>
      </>
    ),
  },
  privacidad: {
    title: 'Política de privacidad',
    body: (
      <>
        <h2>Responsable</h2>
        <p>
          <Fill>nombre y apellidos o razón social</Fill>, NIF <Fill>NIF o CIF</Fill>, con domicilio en {domicilio}.
          Contacto: <Fill>email de contacto</Fill>.
        </p>
        <h2>Qué datos tratamos y para qué</h2>
        <ul>
          <li>
            <strong>Pedidos por teléfono o SMS:</strong> tu número, nombre y, si pides a domicilio, tu dirección.
            Los usamos solo para preparar y entregar tu pedido. Base legal: ejecución del pedido que solicitas.
          </li>
          <li>
            <strong>Comanda en la web:</strong> los platos que añades se guardan únicamente en tu propio
            navegador para que no se pierdan. No se envían a ningún servidor.
          </li>
          <li>
            <strong>Asistente y “Diseña tu burger con IA”:</strong> el texto que escribas se envía a Anthropic
            (proveedor del modelo de IA Claude) para generar la respuesta. No escribas datos personales en el
            chat. Anthropic actúa como encargado del tratamiento y puede tratar los datos fuera del Espacio
            Económico Europeo <Fill>revisar garantías de transferencia internacional vigentes</Fill>.
          </li>
          <li>
            <strong>Alojamiento:</strong> la web está alojada en Vercel, que registra datos técnicos de acceso
            (como la dirección IP) por seguridad y para limitar el uso abusivo del chat.
          </li>
        </ul>
        <h2>Conservación</h2>
        <p>
          Los datos de pedidos se conservan el tiempo necesario para atenderlos y cumplir obligaciones legales
          <Fill>plazo concreto si se guardan registros</Fill>.
        </p>
        <h2>Tus derechos</h2>
        <p>
          Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad
          escribiendo a <Fill>email de contacto</Fill>. Si no estás conforme, puedes reclamar ante la Agencia
          Española de Protección de Datos (www.aepd.es).
        </p>
      </>
    ),
  },
  cookies: {
    title: 'Política de cookies',
    body: (
      <>
        <p>
          Esta web <strong>no usa cookies de análisis, publicidad ni de terceros</strong>, por eso no te
          mostramos ningún aviso de cookies.
        </p>
        <p>
          Solo guarda en tu navegador (almacenamiento local) los platos de tu comanda, para que no se pierdan si
          cierras la página. Es un almacenamiento técnico necesario para el servicio que pides y puedes
          borrarlo vaciando la comanda o los datos del sitio en tu navegador.
        </p>
      </>
    ),
  },
}

const page = PAGES[document.body.dataset.page]
document.title = `${page.title} · ${BUSINESS.fullName}`

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <main className="legal">
      <a href="/" className="legal__back">← Volver a la carta</a>
      <h1>{page.title}</h1>
      {page.body}
      <nav className="legal__nav">
        <a href="/aviso-legal">Aviso legal</a> · <a href="/privacidad">Privacidad</a> · <a href="/cookies">Cookies</a>
      </nav>
    </main>
  </StrictMode>,
)
