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

## [20261125g] — 2026-11-25

### Corregido
- **Celular, Operaciones y Ecosistema:** el mapa (o la maqueta) y la lista se acomodan como un solo bloque centrado en la pantalla. En pantallas altas ya no queda una franja negra vacía entre la imagen y la lista, y en Ecosistema la lista ya no se encima con el fondo de la maqueta; si no cabe todo, la maqueta se reduce lo justo. Nueva función `fitMobile()` en `script.js` y atributo `data-contenido` en cada lienzo. En escritorio no cambia nada (comparado escena por escena contra 20261125f).

## [20261125f] — 2026-11-25 · commit `72139dc`

### Cambiado
- **Ecosistema** pasa de 6 escenas a 2: el título y la maqueta con todo a la vista, igual que Operaciones. El recorrido completo del sitio baja de 33 a 29 paradas.
  - Desde el cubo central (Capa de IA) salen rutas con puntos de luz hacia SICE, Vista Alegre, NUCTECH (puerto y tren) y ENTELAR; van sobre las líneas vino propias de la maqueta.
  - "Capa de IA" deja de ser una tarjeta: ahora es una etiqueta destacada sobre el cubo, con su frase y un brillo que late.
  - Las 4 tarjetas aparecen una tras otra (SICE, Vista Alegre, NUCTECH y ENTELAR), cada una con su línea, y ya no llevan "01 / 04" (conservan el sector). Foco general fijo.
  - En celular, nombres sobre la maqueta y una lista con versiones cortas de los textos.
  - Código: Ecosistema usa `.op-hub`, `.op-routes`, `.op-list` y la nueva `.eco-ia-label`; se quita la tarjeta `.eco-card-ia`. Las demás secciones no cambian (comparadas escena por escena contra 20261125e en 5 tamaños).

## [20261125e] — 2026-11-25 · commit `1c8cc8c`

### Cambiado
- **Operaciones** pasa de 5 escenas a 2: el título y el mapa con las 4 regiones a la vista. Antes había que avanzar una pantalla por región; el recorrido completo del sitio baja de 36 a 33 paradas.
  - Desde Centro salen rutas hacia Norte, Bajío y Sur, con puntos de luz que viajan por ellas (la misma animación del diagrama "Cómo trabaja la IA en tu día a día"). Centro tiene un punto un poco más grande.
  - Las 4 tarjetas aparecen una tras otra (Centro, Norte, Bajío y Sur) con desvanecido y deslizamiento corto. Son más compactas y ya no llevan "01 / 04".
  - El foco de luz ya no sigue a una región: es un foco general que oscurece las orillas.
  - En celular, los nombres van sobre el mapa y las 4 frases en una lista debajo.
  - Código: `drawRoutes()` en `makeSpotSequence` (`script.js`); clases nuevas `.op-routes`, `.op-route`, `.op-hub`, `.op-side-b` y `.op-list`. Las demás secciones no cambian (comparadas escena por escena contra 20261125d en 5 tamaños).

## [20261125d] — 2026-11-25 · commit `ab359de`

Revisión de seguridad (diagnóstico del 25-nov-2026). Lo visible del sitio no cambia: se comparó contra 20261125c el estilo computado de cada elemento y una captura en las 36 paradas (1440×900, 1280×720, 1462×663, 390×844 y 375×667) y los estados del menú y del formulario.

### Agregado
- `.htaccess` para Hostinger: siempre HTTPS, HSTS, política de contenido (CSP: solo archivos del propio sitio), protección contra mostrar el sitio dentro de otra página, `Referrer-Policy`, `Permissions-Policy`, sin `X-Powered-By`, sin listado de carpetas y bloqueo de `.md`, `.yml`, archivos ocultos y `.git`. GitHub Pages lo ignora (DOCUMENTACION.md §14).
- Tipografía Space Grotesk alojada en el sitio (`fonts/`, pesos 400 y 700, latino y latino extendido, licencia en `fonts/OFL.txt`), con precarga en `index.html`.
- Formulario: límite de envíos por conexión (3 cada 10 min y 10 cada 24 h). Solo se guarda un código irreversible de la IP, fuera de la carpeta pública, y se borra a las 24 h.
- Formulario: se rechazan envíos que vengan de otro sitio (`Origin`) y mensajes con más de 2 enlaces.

### Cambiado
- Formulario: el filtro anti-robots mide en el navegador cuánto tiempo estuvo abierto el formulario (campo `tiempo`, antes `t0` con la hora del equipo). Ya no depende del reloj del visitante y el servidor lo exige.
- `enviar.php`: nombre, asunto y remitente van siempre codificados; el correo del visitante debe tener un formato común (sin comillas ni comas); el mensaje se envía en *quoted-printable* (líneas cortas); solo se aceptan campos de texto; nunca se muestran errores de PHP.
- Aviso de privacidad (sección 9 y fecha): el sitio ya no carga archivos de terceros.

### Corregido
- Un visitante con el reloj de su equipo adelantado veía "Gracias." pero su mensaje se descartaba.
- Un nombre con comas podía agregar direcciones a "Responder a" del correo recibido.

### Eliminado
- Carga de Google Fonts en `styles.css` y `aviso-de-privacidad.html`.
- Metadatos (autoría, fechas y programa de edición) de `d2`, `h1`–`h3`, `p1`, `p2`, `p4`, `logo.png`, `logoc.png` e `icon.png`. Sin recomprimir: los píxeles y el perfil de color son idénticos.

## [20261125c] — 2026-11-25 · commit `b8a073e`

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
