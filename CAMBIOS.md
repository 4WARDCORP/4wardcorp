# Historial de cambios

Todos los cambios relevantes del sitio se registran aquí, del más reciente al más antiguo.
Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/). La versión es la misma que llevan los enlaces `styles.css?v=` y `script.js?v=` de `index.html`: `AAAAMMDD` + una letra por publicación del día.

**Cómo registrar un cambio:**
1. Mientras no se publique, anotarlo en **Sin publicar**.
2. Al publicar, convertir ese bloque en la nueva versión, con la fecha y el commit.
3. Clasificar cada línea en:
   - **Agregado:** algo nuevo.
   - **Cambiado:** algo que ya existía y se modificó.
   - **Corregido:** un error.
   - **Eliminado:** algo que se quitó.
4. Escribir qué cambió desde el punto de vista del visitante y, si aplica, dónde está en el código.

---

## [Sin publicar]

_(Nada pendiente.)_

## [20261125c] — 2026-11-25

### Corregido
- IA, escena "Nuestro proceso es simple": en pantallas de escritorio muy bajas (700 px de alto o menos, como una laptop con la escala de Windows al 150 %), el botón del formulario quedaba cortado a la mitad. Ahora, en esas pantallas, los textos y espacios del bloque se ajustan al alto y el botón cabe completo (`@media (min-width: 769px) and (max-height: 700px)` de la sección IA en `styles.css`). Error anterior a la reorganización.

## [20261125b] — 2026-11-25 · commit `8048b1d`

Limpieza y organización del código. **El sitio se ve y se comporta igual**: se comparó contra la versión anterior el estilo computado de cada elemento y una captura en las 36 paradas, en 10 tamaños de pantalla, más los estados del menú y del formulario.

### Cambiado
- `styles.css` reordenado por sección, en el orden de la página:
  - índice al inicio;
  - cada sección con sus `@media` al final, siempre en el mismo orden;
  - IA dividida por escenas.
- `script.js` dividido en bloques numerados, con índice al inicio. La última escena de Experiencia es ahora la constante `PILARES_ULTIMA_ESCENA`.
- Los comentarios que contaban la historia del cambio ("antes…", "variante B elegida…") ahora explican para qué sirve cada parte.
- `.footer-contact a` pasa a `.footer-info.footer-contact a` para conservar el mismo resultado con el nuevo orden.

### Eliminado
- **CSS sin uso:**
  - Clases sin elementos en la página: `.section-white`, `.parallax-*`, `.card-text`, `.ecosystem-extended-text`, `.footer-links`, `.reveal-up`, `.ia-section`, `.over-sticky`, `.push-up`, `.responsive-seq-img`, `.op-side-b`, `.op-side-bl` y `.brand-logo`.
  - La regla `.is-scrolled .morph-container`, que no podía aplicarse a ningún elemento.
  - `@keyframes scroll`.
- **JS sin efecto:** el parallax y el `IntersectionObserver` de `.reveal-up`.
- **HTML:** el `<div class="mouse">` vacío de la portada.

## Documentación — 2026-11-25 (el sitio no cambia; la versión sigue en `20261125a`)

### Agregado
- Documentación del repositorio:
  - `README.md`: qué es el sitio, cómo probarlo, cómo publicarlo y las reglas que no se deben romper.
  - `DOCUMENTACION.md`: referencia técnica y diccionario de clases, variables y funciones.
  - `CAMBIOS.md`: este historial.
- `_config.yml`: evita que GitHub Pages publique la documentación como páginas del sitio.
- `.editorconfig`: formato común de los archivos.
- `.gitignore`: evita subir archivos del sistema y configuraciones privadas.

## [20261125a] — 2026-11-25 · commit `67a239b`

### Agregado
- Regreso al inicio desde tres lugares:
  - el logo del menú, en escritorio;
  - "Inicio" en el menú del celular;
  - un botón flotante ↑ abajo a la derecha (`.btn-subir`).
- Los tres usan `volverInicio()`: fundido a negro, salto a la portada y fundido de regreso.

### Corregido
- En celular, el menú encogido ya no bloquea los toques en la esquina inferior derecha (`.is-shrunk .nav-links { pointer-events: none }`).

## [20261124e] — 2026-11-24 · commit `209a053`

### Cambiado
- "Desarrollos 4ward" y "Nuestro proceso es simple" pasan a ser las escenas 9 y 10 de la sección IA, con la misma transición que las demás. Se elimina la sección aparte `#ia-casos`.

## [20261124d] — 2026-11-24 · commit `18e7274`

### Corregido
- En celular, cuando el navegador esconde sus barras, la última escena de cada sección llega hasta abajo con su propio fondo (variable `--extra`). Antes se veía una franja de la sección siguiente.

## [20261124c] — 2026-11-24 · commit `52844db`

### Cambiado
- Todas las escenas se miden con el alto visible real de la pantalla (variable `--vh`) en lugar de `vh`.

### Corregido
- En iPhone con las barras de Chrome visibles, la portada se ve completa.
- El cambio de IA 03/06 a 04/06 ya se anima.

## [20261124b] — 2026-11-24 · commit `9374250`

### Agregado
- Formulario de contacto "Platiquemos de tu proceso" (botón en Proceso y en el pie), con `enviar.php` para Hostinger y respaldo `mailto:` en GitHub Pages.
- Página `aviso-de-privacidad.html` y aviso simplificado dentro del formulario.

### Cambiado
- Fotos nuevas: c1, c2, c3, d1, d3 y d4.
- Correo de contacto corregido a `rvertti@4wardcorp.com`.

### Corregido
- Portada en laptops con pantalla baja: el logo ya no tapa "Haz scroll para continuar".

## [20261124a] — 2026-11-24 · commit `579f3fe`

### Agregado
- Versión en los enlaces de CSS y JS (`?v=`) para que los navegadores no usen archivos viejos.

### Corregido
- "4WARD SOLUTIONS" ya no se parte en 2 líneas en Edge/Windows (tamaño en `cqw`).

## Antes del control de versiones — 2026-11-24

Rediseño del sitio original, en orden cronológico. Commits `4df0e38` a `1a1a923`.

- Sección **Experiencia** (antes "Pilares") con las 4 alianzas, y nueva sección **IA Aplicada**: encabezado, 6 frentes, Desarrollos 4ward y Proceso.
- IA convertida en escenas fijas, como el resto del sitio.
- **Ecosistema:** maqueta pentagonal de cristal con cada alianza señalada en su zona y etiquetas en vino.
- **Operaciones:** mapa de cristal con las 4 regiones señaladas en su punto.
- **Crecimiento:** portada blanca y 3 tarjetas que entran escalonadas; ajustes para celular chico y grande.
- Menú: lleva al inicio exacto de cada sección. Las tarjetas de Operaciones quedan al lado de su punto.
- Experiencia: un cuadro completo por movimiento. Nueva foto de Seguridad (p3).
- Pie de página con contacto real y legible; ícono y título de la pestaña.
- IA: escena "Cómo trabaja la IA en tu día a día". En Dilema, el cambio de escena ocurre a mitad del movimiento.
- Escenas calculadas con la altura real de cada parada.

## Sitio original — 2026-08-27 a 2026-09-05

Primera versión, subida manualmente a GitHub. Se conserva en la rama `respaldo-original` (commit `395ea74`).
