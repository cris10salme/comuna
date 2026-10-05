# La Comuna Smash & Tacos — web

Web de La Comuna Smash & Tacos (Balerma, El Ejido). Vite + React + Three.js (React Three Fiber + drei),
con funciones serverless en `/api` para la IA. Pensada para desplegarse en Vercel.

## Qué tiene

- **Carta real** con comanda: el cliente arma el pedido y lo **llama** (tel:) o, si no lo cogen, lo **envía por SMS** ya escrito.
- **Burgers en 3D**: vista previa en cada tarjeta y visor a pantalla completa (girar, zoom, despiece horizontal con la ficha de cada ingrediente).
- **Diseña tu burger con IA** (`/api/disena`) y **asistente de la carta** (`/api/chat`), con Claude Haiku 4.5.
- Páginas legales con datos por rellenar (busca `RELLENAR` en `src/legal.jsx`).

## Estructura

| Ruta | Qué es |
|---|---|
| `src/data/menu.js` | La carta (única fuente de verdad de platos y precios) |
| `src/data/business.js` | Datos del local: teléfono, horario, dirección |
| `src/data/catalog.js` | Productos pedibles y cálculo de precios (lo usa el chat) |
| `src/data/ingredients.js` | Ingredientes de burger para el diseñador IA y precio orientativo |
| `src/three/` | 3D: `layers.jsx` (capas), `recipes.js` (cada burger), `Burger.jsx` (animación), `Studio.jsx` (luz), `BurgerViewer.jsx` (vista previa), `FullscreenScene.jsx` (visor) |
| `api/disena.js`, `api/chat.js` | Funciones serverless que llaman a Claude |
| `api/_lib/` | Límite de usos y utilidades HTTP |

## Desarrollo

```bash
npm install
cp .env.example .env.local   # y rellena ANTHROPIC_API_KEY, o pon AI_MOCK=1 para probar sin gastar
npm run dev                  # web + /api en http://localhost:5173
npm run build                # genera dist/
```

## Despliegue en Vercel (gratis para la demo)

1. Entra en [vercel.com](https://vercel.com) con tu cuenta de GitHub → **Add New… → Project** → importa este repositorio.
2. Vercel detecta Vite solo. No cambies nada de *Build & Output*.
3. En **Environment Variables** añade `ANTHROPIC_API_KEY` (de [console.anthropic.com](https://console.anthropic.com)) y, si quieres, un `RATE_LIMIT_SALT` con cualquier texto aleatorio.
4. **Deploy**. Tendrás una dirección tipo `la-comuna.vercel.app`.
5. Recomendado: **Storage → Create → Upstash for Redis** (plan gratuito) y conéctalo al proyecto. Crea solas las variables
   `KV_REST_API_URL` / `KV_REST_API_TOKEN`, y el límite de usos pasa a ser compartido entre todas las instancias.
   Después, **Redeploy** para que las coja.

Límites por defecto (se cambian con variables, ver `.env.example`): 6 diseños y 30 mensajes de chat por persona y hora,
y 400 peticiones a la IA al día en total.

> El plan gratuito de Vercel (Hobby) es para uso no comercial: vale para enseñar la demo. Si el cliente se queda la web,
> hay que pasar a Vercel Pro o moverla a un hosting que permita uso comercial gratis (p. ej. Netlify). El dominio propio
> se conecta en **Settings → Domains**.

## Pendiente

- Fotos reales de las burgers (opción acordada para más realismo) y logo original.
- Datos legales del titular (`RELLENAR` en `src/legal.jsx`) y tabla de alérgenos si el local la tiene.
