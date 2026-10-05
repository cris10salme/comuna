# La Comuna Smash & Tacos — web

Vite + React. Carta en `src/data/menu.js` (única fuente de verdad) y datos del local en `src/data/business.js`.

```bash
npm install
npm run dev     # desarrollo
npm run build   # genera dist/
```

Páginas legales en `src/legal.jsx`: buscar `RELLENAR` y completar antes de publicar.

Estado: fase 2 (Comuna Clásica en 3D con vista desmontada). Pendiente: resto de burgers en 3D, "Diseña tu burger con IA", chat y despliegue.

3D: `src/three/` — `layers.jsx` (sistema de capas), `recipes.js` (composición de cada burger), `Burger.jsx` (animación), `BurgerViewer.jsx` (escena y luz). Se carga en diferido; en equipos flojos o sin WebGL se muestra una versión 2D, y con "reducir movimiento" no gira.
