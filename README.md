# La Comuna Smash & Tacos — web

Vite + React. Carta en `src/data/menu.js` (única fuente de verdad) y datos del local en `src/data/business.js`.

```bash
npm install
npm run dev     # desarrollo
npm run build   # genera dist/
```

Páginas legales en `src/legal.jsx`: buscar `RELLENAR` y completar antes de publicar.

Estado: fase 3 (las 9 burgers en 3D: vista previa en la carta y visor a pantalla completa con despiece horizontal e información de cada ingrediente). Pendiente: "Diseña tu burger con IA", chat y despliegue. Pendiente: resto de burgers en 3D, "Diseña tu burger con IA", chat y despliegue.

3D: `src/three/` — `layers.jsx` (sistema de capas), `recipes.js` (composición de cada burger), `Burger.jsx` (animación), `Studio.jsx` (luz), `BurgerViewer.jsx` (vista previa de la carta), `FullscreenScene.jsx` (visor a pantalla completa: girar, zoom, despiece). Se carga en diferido; en equipos flojos o sin WebGL se muestra una versión 2D, y con "reducir movimiento" no gira.
