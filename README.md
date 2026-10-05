# La Comuna Smash & Tacos — web

Vite + React. Carta en `src/data/menu.js` (única fuente de verdad) y datos del local en `src/data/business.js`.

```bash
npm install
npm run dev     # desarrollo
npm run build   # genera dist/
```

Páginas legales en `src/legal.jsx`: buscar `RELLENAR` y completar antes de publicar.

Estado: fase 4 (las 9 burgers en 3D + "Diseña tu burger con IA"). Pendiente: chat, optimización móvil y despliegue.

## Diseña tu burger con IA

- `api/disena.js`: función serverless que llama a Claude (`claude-haiku-4-5`) con salida estructurada.
  La lista de ingredientes va como `enum` en el esquema JSON, así que la IA no puede inventar ninguno.
- `src/data/ingredients.js`: catálogo de ingredientes de la carta, saneado de capas y precio orientativo
  (el de la burger de la carta más parecida; lo calcula el código, nunca la IA).
- `api/_lib/ratelimit.js`: límite por persona y hora + tope global diario. Con Upstash Redis es compartido.
- Variables de entorno: ver `.env.example`. La API key solo existe en el servidor.
- En local: `npm run dev` sirve también `/api`. Con `AI_MOCK=1` en `.env.local` responde sin gastar.

3D: `src/three/` — `layers.jsx` (sistema de capas), `recipes.js` (composición de cada burger), `Burger.jsx` (animación), `Studio.jsx` (luz), `BurgerViewer.jsx` (vista previa de la carta), `FullscreenScene.jsx` (visor a pantalla completa: girar, zoom, despiece). Se carga en diferido; en equipos flojos o sin WebGL se muestra una versión 2D, y con "reducir movimiento" no gira.
