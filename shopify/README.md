# Plantillas para Shopify

Cada landing envuelta como plantilla de página sin el layout del tema.

- `templates/page.estrellas.liquid` ← `proyector-estrellas/index.html`
- `templates/page.plancha.liquid` ← `plancha-vapor/index.html`

Si cambias una landing, vuelve a generar su plantilla:

```sh
{ printf '{%% layout none %%}{%% raw %%}'; cat proyector-estrellas/index.html; printf '{%% endraw %%}\n'; } > shopify/templates/page.estrellas.liquid
```

En Shopify, la página debe usar la plantilla `page.estrellas` (o `page.plancha`).
