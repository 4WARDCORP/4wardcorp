# Documentación técnica — sitio 4ward Solutions

Referencia para quien mantenga o modifique el sitio. Describe el código tal como está en la versión **`20261125a`** (commit `67a239b`).
La forma de probar y publicar está en el [README](README.md) y el historial en [CAMBIOS.md](CAMBIOS.md).

**Regla de mantenimiento:** si un cambio contradice algo de este documento, el documento se actualiza en el mismo commit.

## Índice

1. [Arquitectura y orden de carga](#1-arquitectura-y-orden-de-carga)
2. [Mapa del sitio: secciones y escenas](#2-mapa-del-sitio-secciones-y-escenas)
3. [Sistema de escenas fijas](#3-sistema-de-escenas-fijas)
4. [Medidas de pantalla: `--vh`, `--extra` y `cqw`](#4-medidas-de-pantalla---vh---extra-y-cqw)
5. [Navegación y regreso al inicio](#5-navegación-y-regreso-al-inicio)
6. [Diccionario CSS](#6-diccionario-css)
7. [Diccionario JavaScript](#7-diccionario-javascript)
8. [Formulario de contacto y `enviar.php`](#8-formulario-de-contacto-y-enviarphp)
9. [Imágenes](#9-imágenes)
10. [Compatibilidad con navegadores](#10-compatibilidad-con-navegadores)
11. [Cómo probar](#11-cómo-probar)
12. [Deuda técnica y pendientes conocidos](#12-deuda-técnica-y-pendientes-conocidos)
13. [Lineamientos de diseño y contenido](#13-lineamientos-de-diseño-y-contenido)

---

## 1. Arquitectura y orden de carga

- **Página única** (`index.html`) con desplazamiento vertical. El navegador "frena" en cada pantalla (`html { scroll-snap-type: y mandatory }`).
- **Sin dependencias:** no hay frameworks, librerías, compilación ni `package.json`. La única carga externa es la tipografía de Google Fonts (`@import` en la línea 1 de `styles.css` y dentro de `aviso-de-privacidad.html`).
- **Orden de carga de `index.html`:**
  1. Script en línea dentro de `<head>`: mide el alto visible y define `--vh` **antes de pintar** (§4).
  2. `styles.css?v=<versión>`.
  3. Contenido: pantalla de carga, menú, botón ↑, `<main>` con las secciones, `<footer>` y la ventana del formulario.
  4. `script.js?v=<versión>` al final del `<body>`. Todo su código corre en `DOMContentLoaded`, excepto el formulario, que es una función autoejecutable independiente.
- **Pantalla de carga (`#preloader`):** 4 cuadros negros que se abren hacia las esquinas 300 ms después del evento `load` (se agrega la clase `.loaded`).
- **Pie de página "revelado":** el `<footer class="footer-reveal">` está fijo detrás del contenido (`z-index: 1`). `.content-wrapper` deja un margen inferior de 70 pantallas-% (`calc(var(--vh) * 70)`) para que, al llegar al final, el contenido se levante y descubra el pie. Ese freno lo da `.content-wrapper::after`.

## 2. Mapa del sitio: secciones y escenas

Orden en la página (igual al del menú). **"Escena" = una pantalla completa con un mismo fondo y un mismo texto.**

| # | `id` | Menú | Escenas | Alto de la sección (CSS) | Lógica JS |
|---|---|---|---|---|---|
| — | `inicio` | Inicio* | 1 | `calc(var(--vh) * 100)` | slider de portada |
| 1 | `dilema` | Dilema | 5 | `500` (valor base de `.sticky-sequence`) | en línea, en el `scroll` |
| 2 | `operaciones` | Operaciones | 5 | `500` (`.operaciones-sequence`) | `makeSpotSequence()` |
| 3 | `crecimiento` | Crecimiento | 2 | `200` (`.crecimiento-sequence`) | `makeSimpleSequence()` |
| 4 | `ia` | IA | 11 | `1100` (`.ia-sequence`) | en línea, en el `scroll` |
| 5 | `experiencia` | Experiencia | 5 | `500` (valor base) | en línea, en el `scroll` |
| 6 | `ecosistema` | Ecosistema | 6 | `600` (`.ecosistema-sequence`) | `makeSpotSequence()` |
| — | (pie) | — | 1 | `calc(var(--vh) * 70)` | — |

\* "Inicio" solo aparece en el menú del celular; en escritorio se regresa con el logo (§5).
Todas las alturas de sección son `calc(var(--vh) * N + var(--extra))`. **Paradas totales al recorrer con Av Pág: 36** (1 + 34 escenas + pie).

**Contenido por escena** (la escena 0 es siempre el título sobre fondo blanco, salvo en Experiencia, que usa fondo negro):

| Sección | Escenas 1 en adelante |
|---|---|
| Dilema | 1 Perfil del Equipo (d1) · 2 Retención de Conocimiento (d2) · 3 Enfoque de Ejecución (d3) · 4 Garantía de Red (d4) |
| Operaciones | Mapa `dominio.jpg` · 1 Norte · 2 Bajío · 3 Centro · 4 Sur |
| Crecimiento | 1 Tres tarjetas: Representación Comercial (c1), Integración de Soluciones (c2), Comercialización Tech (c3) |
| IA | 1 Introducción (ia-hero) · 2 Diagrama "Cómo trabaja la IA en tu día a día" · 3–8 Frentes 01/06 a 06/06 (ia-01…ia-06) · 9 Desarrollos 4ward · 10 Nuestro proceso es simple (con el botón del formulario) |
| Experiencia | 1 Movilidad · SICE (p1) · 2 Suministro · Vista Alegre (p2) · 3 Seguridad · NUCTECH (p3) · 4 Conectividad · ENTELAR (p4) |
| Ecosistema | Maqueta `ecosistema.jpg` · 1 SICE · 2 Vista Alegre · 3 NUCTECH (2 puntos: puerto y tren) · 4 ENTELAR · 5 Capa de IA (cubo central) |

**Experiencia tiene dos vistas** en el HTML: `.pilares-mobile-view` (celular: fondo y texto por escena) y `.pilares-desktop-view` (escritorio: 4 cuadros que entran desde sus esquinas con la clase `.is-in`, uno por escena). El nombre "pilares" es histórico: la sección se llamaba Pilares.

## 3. Sistema de escenas fijas

### 3.1 Estructura HTML (patrón común)

```html
<section id="seccion" class="sticky-sequence seccion-sequence" data-scene="0">
  <div class="snap-grid">                 <!-- 1 .snap-point por escena: frenos del scroll -->
    <div class="snap-point"></div> …
  </div>
  <div class="sticky-container">         <!-- se queda fijo mientras se recorre la sección -->
    <div class="seq-bg active">…</div>    <!-- 1 fondo por escena; se alternan con fundido -->
    <div class="seq-bg">…</div> …
    <div class="text-slider-mask">        <!-- ventana de 1 pantalla; no recibe clics -->
      <div class="text-slider-track">     <!-- columna de textos que sube 1 pantalla por escena -->
        <div class="text-slider-item">…</div> …   <!-- 1 por escena -->
      </div>
    </div>
  </div>
</section>
```

### 3.2 Cómo funciona

1. La sección mide **N pantallas**. `.snap-grid` tiene N `.snap-point` de una pantalla cada uno, y el navegador frena en cada uno.
2. `.sticky-container` (`position: sticky`) se queda fijo, así que la pantalla no "se desplaza": solo cambia lo de adentro.
3. En cada evento `scroll`, el JS calcula la escena activa:
   `escena = Math.round(-rect.top / sceneStep(sección))`, limitada a `N − 1`. Solo calcula mientras la sección cubre la pantalla, con 2 px de tolerancia: `rect.top <= 2 && rect.bottom >= alto − 2`.
4. Con la escena activa:
   - `.text-slider-track` recibe `translateY(calc(var(--vh) * -<escena>00))` y sube con una transición de 0.8 s.
   - El `.seq-bg` con el mismo índice recibe `.active` y aparece con un fundido de 0.8 s; los demás lo pierden.
   - En Operaciones, Crecimiento y Ecosistema se escribe además `data-scene="<escena>"` en la `<section>`, que el CSS usa (por ejemplo, la entrada escalonada de las tarjetas de Crecimiento).

### 3.3 Los tres motores de escenas

| Motor | Secciones | Particularidades |
|---|---|---|
| En línea dentro del `scroll` | Dilema, IA, Experiencia | El número de escenas sale de la cantidad de `.seq-bg`. **Experiencia tiene el máximo fijo en el código (`> 4`)** y además activa los cuadros de escritorio (`.is-in` cuando `escena ≥ cuadro + 1`). |
| `makeSimpleSequence(section, track)` | Crecimiento | Fondos y texto por escena; escribe `data-scene`. |
| `makeSpotSequence(section, track)` | Operaciones, Ecosistema | Puntos sobre una imagen (ver abajo). Solo hay 2 fondos: el blanco (escena 0) y la imagen (escenas 1 en adelante). |

**Puntos sobre imagen (`makeSpotSequence`)**

- `.op-stage` (`.eco-stage`) es el lienzo de la imagen: 3:2 en escritorio y 2:3 en celular.
- `.op-spot` es un punto. Atributos:
  - `data-scene`: escena en que se enciende.
  - `data-x` / `data-y`: posición en % del lienzo, en escritorio.
  - `data-xv` / `data-yv`: posición en % en celular (imagen vertical). El cambio ocurre en ≤ 768 px de ancho.
- Estados: `.is-on` (escena actual, con pulso) e `.is-seen` (escenas pasadas: queda visible con su nombre).
- Foco de luz: `.op-shade` oscurece todo menos un círculo centrado en `--fx` / `--fy`, que el JS iguala a la posición del punto activo.
- **Operaciones:** la tarjeta de texto (`.op-card`) vive dentro del punto. `.op-side-r` / `.op-side-l` la ponen a la derecha o a la izquierda.
- **Ecosistema:** las tarjetas (`.eco-card`) están en las esquinas (`.c-tl`, `.c-tr`, `.c-bl`, `.c-br`) y una línea SVG las une a su punto:
  - `<line data-from="X">` se conecta con `#spot-X` y con la tarjeta cuyo `data-for` contiene `X`.
  - `drawLines()` recalcula las líneas al cambiar el tamaño de la ventana.
- **En celular** no hay tarjetas ni líneas: el texto de cada escena se ve abajo con `.op-cap`, que en escritorio está oculto (`visibility: hidden`).
- `.is-past` en la `<section>`: cuando el pie de página empieza a subir, desvanece los textos para que no se asomen bajo el menú.

### 3.4 Agregar o quitar una escena (lista de verificación)

1. Agregar o quitar un `.snap-point` en `.snap-grid`.
2. Agregar o quitar su `.seq-bg`. En `makeSpotSequence` no hace falta, porque solo se usan 2 fondos.
3. Agregar o quitar su `.text-slider-item`, en la misma posición.
4. Ajustar el alto de la sección en CSS: `calc(var(--vh) * <N×100> + var(--extra))`. Si la sección usa el valor base de `.sticky-sequence` (500), crear una clase propia, como `.ia-sequence`.
5. Según la sección:
   - **Experiencia:** cambiar también el `4` fijo en `script.js` y los cuadros de escritorio.
   - **Spot:** agregar el `.op-spot` con su `data-scene` y sus 4 coordenadas.
   - **Ecosistema:** además, su `.eco-card` y su `<line>`.
6. Actualizar los comentarios con el mapa de escenas en `index.html` y la tabla del §2 de este documento.
7. Probar el recorrido completo con Av Pág: el número de paradas debe cambiar exactamente en las escenas agregadas o quitadas (hoy son 36).

### 3.5 Botones dentro de una escena

`.text-slider-mask` tiene `pointer-events: none` para no bloquear el scroll. Cualquier elemento que deba recibir clics dentro de una escena necesita `pointer-events: auto`, como ya lo tiene `.text-slider-mask .cta-btn`.

## 4. Medidas de pantalla: `--vh`, `--extra` y `cqw`

**Problema que resuelven:** en iPhone, `100vh` es más alto que el área visible cuando las barras del navegador están a la vista, y el alto visible cambia al hacer scroll. Con `vh`, el contenido quedaba bajo la barra y las escenas "brincaban".

| Variable | Valor | Quién la define |
|---|---|---|
| `--vh` | 1 % del alto visible, en px | Script en el `<head>` de `index.html`. Mientras carga vale `1svh` (o `1vh` en navegadores sin `svh`). |
| `--extra` | `max(0px, 100lvh − var(--vh) * 100)` | CSS. Es lo que crece la pantalla cuando el celular esconde sus barras; en computadora vale 0. |

**Cuándo se vuelve a medir `--vh`:**
- **Computadora:** al cargar y en cada cambio de tamaño de ventana.
- **Celular (`pointer: coarse`):** al cargar y al girar el teléfono (300 ms después de `orientationchange`), o cuando cambia el ancho. **No** se mide si solo cambia el alto (barras del navegador), a propósito.

**Dónde se usa `--extra`:**
- `.sticky-sequence` y `.sticky-container` miden `N * --vh + --extra`.
- `.snap-grid` mide `100% − --extra`: los frenos no cambian.
- `.bg-picture` tiene `padding-bottom: var(--extra)`: la imagen se centra en la parte visible.

**Reglas:**
- **CSS:** usar `calc(var(--vh) * N)`, nunca `Nvh`. Las únicas excepciones son las propias definiciones de `--vh` y `--extra`, y `100dvh` en `.contacto-caja`, como respaldo del alto de la ventana del formulario.
- **JS:** el alto de una pantalla es `screenH()` o `sceneStep(section)` (alto real de un `.snap-point`), no `window.innerHeight`. Las animaciones usan `translateY(calc(var(--vh) * -N00))`.

**`cqw` / `cqh` (medidas de contenedor):**
- **"4WARD SOLUTIONS"** (portada y pie) mide `13.83cqw` en escritorio y `23.4cqw` en celular, relativo a `.hero-bottom-text` / `.footer-content`. Así no se parte en 2 líneas cuando la barra de desplazamiento de Windows le quita ancho a la página. 13.83cqw equivale a 13vw sin barra, porque el contenedor mide 94 % del ancho.
- **Tarjetas de Ecosistema** (`.eco-card`, `.c-*`): miden en `cqw` / `cqh` del lienzo (`.eco-stage`, con `container-type: size`).
- Requieren navegadores recientes (§10).

## 5. Navegación y regreso al inicio

**Estados del menú (`#morph-nav`), que pone `script.js` según el scroll:**

| Clase | Cuándo | Efecto |
|---|---|---|
| (ninguna) | `scrollY ≤ 50` | Logo grande a color en la portada; en escritorio, menú de 3 + 3 enlaces |
| `.is-scrolled` | `scrollY > 50` | Píldora arriba; logo blanco pequeño |
| `.is-shrunk` | Celular: siempre que hay `.is-scrolled`. Escritorio: mientras se desplaza después de la portada (se quita 400 ms después de dejar de moverse). | Píldora mínima: enlaces ocultos y sin clics |
| `.mobile-menu-open` | Celular: al tocar el logo | Menú vertical con "Inicio" + 6 secciones |

**Enlaces del menú:**
- Cada enlace hace un desplazamiento suave al inicio exacto de su sección.
- `#inicio` no se desplaza: llama a `volverInicio()`.

**Regreso al inicio (`volverInicio()`):**
1. Cierra el menú del celular.
2. Pone el fundido negro (`.fundido-inicio.is-on`, 0.35 s).
3. A los 380 ms salta a la portada sin animación (`behavior: 'instant'`).
4. 80 ms después quita el fundido.

Se usa en tres lugares:
- **Logo en escritorio:** con el menú ya encogido.
- **"Inicio"** en el menú del celular.
- **Botón flotante `.btn-subir`:** abajo a la derecha. Aparece (`.is-visible`) al pasar el 60 % de la portada.

## 6. Diccionario CSS

### 6.1 Variables globales (`:root`)

| Variable | Valor | Uso |
|---|---|---|
| `--brand` | `#891425` | Color de marca (vino): acentos, botones, puntos |
| `--bg-dark` / `--bg-white` | `#000` / `#fff` | Fondos |
| `--text-light` / `--text-dark` | `#fff` / `#111` | Texto sobre fondo oscuro / claro |
| `--preloader-color` | `#000` | Cuadros de la pantalla de carga |
| `--vh`, `--extra` | ver §4 | Medidas de pantalla |
| `--fx`, `--fy` | `%` (`@property`) | Centro del foco de luz en Operaciones y Ecosistema |
| `--img` | `url(…)` | Imagen de fondo de cada tarjeta de Crecimiento (en el HTML) |

Otros colores que se repiten sin variable: `#a51a2e` (vino al pasar el cursor), `#e3a3ad` (vino claro: "Inicio", mensajes de error del formulario) y `#c4213a` (brillo de los puntos del diagrama de IA).

### 6.2 Clases por componente

| Componente | Clases principales |
|---|---|
| Base / utilidades | `.edge-title` (títulos grandes en mayúsculas), `.hero-footer-title` ("4WARD SOLUTIONS"), `.text-dark`, `.text-light`, `.seq-desc` (párrafo de escena) |
| Pantalla de carga | `#preloader`, `.quadrant`, `.q-tl/.q-tr/.q-bl/.q-br`, `.loaded` |
| Menú | `.morph-container`, `.pill-bg`, `.brand-logo-wrapper`, `.logo-color`, `.logo-white`, `.nav-links`, `.nav-left`, `.nav-right`, `.mobile-menu-content`, `.menu-inicio`, estados del §5 |
| Portada | `.hero-section`, `.hero-slider`, `.slide`(`.active`), `.hero-bg-overlay-light`, `.hero-bottom-text`, `.scroll-indicator` |
| Escenas fijas | `.sticky-sequence`, `.sticky-container`, `.snap-grid`, `.snap-point`, `.seq-bg`(`.active`), `.seq-overlay` (capa negra 70 %), `.text-slider-mask`, `.text-slider-track`, `.text-slider-item`, `.bg-picture`, `.is-past` |
| Dilema | Solo clases comunes |
| Operaciones / Ecosistema | `.op-stage`, `.eco-stage`, `.eco-img`, `.op-shade`, `.op-spots`, `.op-spot`, `.eco-dot`, `.op-name`, `.op-card`, `.op-num`, `.op-side-r/-l`, `.op-cap`, `.eco-lines`, `.eco-card`, `.eco-card-ia`, `.c-tl/-tr/-bl/-br`, `.spot-extra` (punto sin nombre), `.spot-core` (cubo de IA) |
| Crecimiento | `.crec-scene`, `.crec-b-grid`, `.crec-b-card` |
| IA | `.ia-kicker`(`-dark`), `.ia-num`, `.ia-intro`, `.ia-intro-sub`, `.ia-overlay`, `.ia-scene-num`, `.ia-scene-title`, `.ia-scene-list`; diagrama: `.ia-diag`, `.ia-diag-bg`, `.diag-flow`, `.flow-step`(`.is-core`), `.flow-conn`, `.flow-ico`, `.flow-num`, `.ia-diag-msg`; escenas 9–10: `.casos-item`, `.casos-bg`, `.casos-bg-2`, `.ia-cases`, `.v-a`, `.ia-case`, `.ia-process-block`, `.ia-process-img`, `.ia-process-content`, `.ia-steps`, `.ia-step`, `.role`, `.role-client`, `.role-4w`, `.proceso-cta` |
| Experiencia | `.pilares-mobile-view`, `.pilares-desktop-view`, `.quadrant-card`(`.is-in`), `.q-top-left/-right`, `.q-bottom-left/-right`, `.quadrant-content`, `.ally-tag`, `.sector-title`, `.sector-title-m`, `.z-background` |
| Pie | `.footer-reveal`, `.footer-content`, `.footer-info`, `.footer-contact`, `.footer-legal`, `.footer-cta` |
| Botón general | `.cta-btn` (vino con flecha →) |
| Formulario | `.contacto-modal`(`.is-open`), `.contacto-fondo`, `.contacto-caja`, `.contacto-cerrar`, `.contacto-form`, `.cf-fila`, `.cf-opc`, `.cf-trampa`, `.cf-aviso`, `.cf-acepta`, `.cf-estado`(`.is-ok`), `.cf-enviar`, `.is-error`, `html.contacto-abierto` (bloquea el scroll de la página) |
| Regreso al inicio | `.btn-subir`(`.is-visible`), `.fundido-inicio`(`.is-on`) |

### 6.3 Capas (`z-index`)

`#preloader` 100000 › `.contacto-modal` 10000 › `.morph-container` (menú) 9999 › `.fundido-inicio` 9998 › `.btn-subir` 9000 › `.content-wrapper` 10 › `.footer-reveal` 1.

### 6.4 Puntos de quiebre (`@media`)

| Condición | Significado |
|---|---|
| `max-width: 768px` | **Celular** (diseño vertical). Es el mismo umbral que usa el JS: `window.innerWidth <= 768`. |
| `769px – 1100px` | Tableta o laptop angosta (cuadrículas de 2 columnas) |
| `min-width: 769px and max-height: 820px` | Laptop con pantalla baja (1280×720, 1462×663): bloques compactos |
| `min-width: 769px and min-height: 821px` | Escritorio normal: versión compacta del bloque de Proceso |
| `max-width: 768px and max-height: 720px` | Celular chico (tipo iPhone SE, 375×667) |
| `min-width: 769px and max-height: 700px` | Escritorio muy bajo: título de Proceso más chico |

## 7. Diccionario JavaScript

`script.js` no expone nada global: todo vive dentro de `DOMContentLoaded` o de la función del formulario.

| Nombre | Tipo | Qué hace |
|---|---|---|
| `screenH()` | función | Alto de una pantalla del sitio: alto del primer `.snap-point`. Si no existe, usa `innerHeight`. |
| `sceneStep(section)` | función | Lo mismo, medido dentro de la sección indicada. |
| `makeSpotSequence(section, track)` | función | Prepara una sección de puntos sobre imagen y devuelve su `onScroll(alto)`. Internas: `place()` (coloca puntos según escritorio o celular), `drawLines()` (líneas SVG) y `setScene(i)`. |
| `makeSimpleSequence(section, track)` | función | Prepara una sección de fondos con fundido y devuelve su `onScroll(alto)`. |
| `volverInicio()` | función | Fundido a negro, salto a la portada y fundido de regreso (§5). |
| `toggleSubir()` | función | Muestra u oculta `.btn-subir`. |
| `onScrollParallax()` | función | Mueve las imágenes `.parallax-img` (hoy no hay ninguna: §12). |
| `abrir(e)` / `cerrar()` | funciones (formulario) | Abren y cierran la ventana del formulario. Al abrir, escriben la hora en `t0` y recuerdan el foco; al cerrar, lo regresan. En celular no ponen el foco en el primer campo, para no abrir el teclado. |
| `validar()` | función (formulario) | Revisa obligatorios, formato del correo y casilla de aceptación; marca `.is-error`. |
| `respaldoCorreo()` | función (formulario) | Abre `mailto:` con los datos ya escritos cuando no hay PHP. |
| `DESTINO` | constante | Correo que recibe los mensajes del respaldo `mailto:`. |

**Eventos registrados:**
- `scroll`, tres veces: escenas, estado del menú y parallax. El último usa `requestAnimationFrame`.
- `scroll` pasivo: botón ↑.
- `resize`: reacomoda los puntos y las líneas de cada sección con puntos.
- `load`: quita la pantalla de carga y dibuja las líneas.
- Slider de portada: `setInterval` de 4.5 s.
- En el formulario: `click` (abrir y cerrar), `keydown` (Esc cierra), `input` (borra errores) y `submit`.

## 8. Formulario de contacto y `enviar.php`

**Dónde se abre:** cualquier elemento con la clase `.js-abrir-contacto`. Hoy son dos botones: el de la escena de Proceso en IA y el del pie de página.

**Campos:**

| `name` | Obligatorio | Máx. caracteres | Nota |
|---|---|---|---|
| `nombre` | sí | 120 | |
| `empresa` | sí | 160 | |
| `correo` | sí | 160 | Formato validado en el navegador y con `FILTER_VALIDATE_EMAIL` en PHP |
| `telefono` | no | 40 | |
| `sector` | no | 60 (en PHP) | Lista fija de 6 opciones |
| `proceso` | sí | 3000 | |
| `acepta` | sí | — | Casilla del aviso de privacidad; aparece sin marcar |
| `sitio_web` | — | — | **Trampa para robots**: está oculto; si llega con texto, se responde "Gracias" y no se envía nada |
| `t0` | — | — | Hora en que se abrió el formulario (ms). Si se envía en menos de 3 s, se trata como robot. |

**Flujo de envío:**
1. `validar()` en el navegador.
2. `fetch` POST a `enviar.php` (atributo `action` del formulario).
3. Si la respuesta es JSON: se muestra `msg`; si `ok` es verdadero, el formulario se limpia.
4. Si la respuesta no es JSON o falla la red (por ejemplo, GitHub Pages, que no ejecuta PHP), se llama a `respaldoCorreo()`.

**`enviar.php`** (variables `$DESTINO` y `$REMITENTE` al inicio):
- **Seguridad:**
  - Acepta solo POST (si no, responde 405).
  - Envía los encabezados `Content-Type: application/json` y `X-Content-Type-Options: nosniff`.
  - Quita los saltos de línea de los campos de una línea (`linea()`), lo que evita inyectar encabezados de correo.
  - Recorta cada campo a su largo máximo.
  - Revisa `sitio_web` y `t0`.
- **Validación:** obligatorios y correo inválido → 422; falta la aceptación → 422.
- **Envío:** `mail()` de PHP, en texto plano UTF-8. El asunto va codificado en Base64 (`Contacto web – <empresa>`), `Reply-To` lleva el correo del visitante y `-f` el remitente del dominio, para que no caiga en spam.
- **Respuestas:** `{"ok": true|false, "msg": "…"}` con código 200, 405, 422 o 500.
- **No usa usuario ni contraseña SMTP, a propósito,** porque el repositorio es público. Si `mail()` no entrega en Hostinger, la alternativa prevista es PHPMailer con SMTP y la configuración en un archivo fuera del repositorio.

### 8.1 Datos repetidos en varios archivos (cambiar en todos)

| Dato | Dónde aparece |
|---|---|
| Correo `rvertti@4wardcorp.com` | `index.html` (pie y aviso del formulario), `script.js` (`DESTINO`), `enviar.php` (`$DESTINO`, `$REMITENTE`), `aviso-de-privacidad.html` |
| Razón social y domicilio | `index.html` (`.cf-aviso`), `aviso-de-privacidad.html` |
| Textos de Operaciones y Ecosistema | Dos veces cada uno: en la tarjeta de escritorio (`.op-card` / `.eco-card`) y en el texto de celular (`.op-cap`) |
| Textos de Experiencia | Dos veces: `.pilares-mobile-view` y `.pilares-desktop-view` |
| Versión de CSS / JS | Los dos enlaces de `index.html` |

## 9. Imágenes

Optimización usada: 1280×800 o 1536×1024 (horizontal), 1024×1536 (vertical), JPG de 150 KB o menos. Ninguna imagen lleva texto, logotipos ni rostros reconocibles.

| Archivo | Dónde | Estilo |
|---|---|---|
| `h1`–`h3.jpg` | Portada (slider) | Foto |
| `d1`–`d4.jpg` | Dilema, escenas 1–4 (capa negra 70 %) | Foto real |
| `dominio.jpg` / `dominiov.jpg` | Operaciones (escritorio / celular) | Render oscuro de cristal con acento vino |
| `c1`–`c3.jpg` | Crecimiento, fondo de las tarjetas (oscurecido) | Foto real |
| `ia-hero.jpg` | IA, escena 1 | — |
| `ia-01`–`ia-06.jpg` | IA, frentes 01–06 (capa 60 %) | — |
| `ia-proceso.jpg` | IA, escena 10 (en `styles.css`) | — |
| `p1`–`p4.jpg` | Experiencia, sectores 1–4 | Foto real |
| `ecosistema.jpg` / `ecosistemav.jpg` | Ecosistema (escritorio / celular) | Render oscuro de cristal con acento vino |
| `logo.png` / `logoc.png` | Menú (a color / blanco) | — |
| `favicon.png`, `apple-touch-icon.png` | Ícono de la pestaña / del iPhone | — |
| `icon.png` | **Sin uso** (§12) | — |

**Recortes en celular:**
- Las fotos de fondo (`background-size: cover`) se recortan en vertical por el centro, así que el sujeto debe ir centrado.
- Operaciones y Ecosistema no se recortan: tienen su propia versión vertical (`…v.jpg`).
- **Si se cambia la imagen de Operaciones o de Ecosistema,** hay que volver a medir las coordenadas `data-x/y/xv/yv` de cada punto.

## 10. Compatibilidad con navegadores

| Función | Para qué | Soporte mínimo aproximado | Si no hay soporte |
|---|---|---|---|
| `svh`, `lvh` | `--vh` inicial y `--extra` | Safari 15.4, Chrome 108, Firefox 101 | Se usa `vh`; `--extra` vale 0 |
| `cqw`, `cqh`, `container-type` | "4WARD SOLUTIONS" y tarjetas de Ecosistema | Safari 16, Chrome 105, Firefox 110 | El título usa `13vw` / `22vw`; **las tarjetas de Ecosistema pierden su tamaño y posición** |
| `@property` | Deslizar el foco de luz | Safari 16.4, Chrome 85, Firefox 128 | El foco salta en lugar de deslizarse |
| `backdrop-filter` | Desenfoque del menú, las tarjetas y la ventana | Todos los actuales (Safari con `-webkit-`) | Fondo sin desenfoque |
| `scroll-snap` | Frenos por pantalla | Todos los actuales | — |

Casos conocidos:
- **Edge / Windows:** la barra de desplazamiento ocupa de 15 a 17 px de ancho. Es el navegador más propenso a fallar; revisarlo siempre.
- **iPad Air 2:** llega como máximo a iPadOS 15.8 (Safari 15.6), así que no tiene `cqw` ni `@property`. En horizontal, Ecosistema pierde las tarjetas de texto (pendiente en §12).

## 11. Cómo probar

**Revisión manual mínima de cada cambio:**
1. Recorrer el sitio completo con Av Pág en escritorio. Deben ser 36 paradas; ningún texto debe quedar cortado ni debajo del menú, y cada escena debe cambiar con su transición.
2. Lo mismo en un celular, o en el emulador del navegador con los tamaños del README.
3. Menú: cada enlace lleva al inicio exacto de su sección. Probar también el logo, "Inicio" y el botón ↑.
4. Formulario: abrir, validar vacío, cerrar con Esc y con la ×; en celular no debe hacer zoom al escribir.
5. Edge en Windows.

**Pruebas automatizadas** (no están en el repositorio; se hacen con Playwright y Chrome):
- Servir el sitio con `python3 -m http.server` **en el mismo comando** que la prueba.
- Esperar de 1.7 a 2.8 s después de mover el scroll antes de medir, porque las transiciones duran 0.8–0.9 s.
- Para medir con la tipografía real sin internet, interceptar `fonts.googleapis.com` y servir los `woff2` del paquete npm `@fontsource/space-grotesk`.
- **iPhone con barras:** abrir en 430×752 y después cambiar a 430×846. `--vh` debe quedarse en 7.52 px, `--extra` pasar a 94 px y los textos no deben moverse.
- **Barra de Windows:** quitar `--hide-scrollbars` de Chrome y forzar `html { overflow-y: scroll }`. Sirve para revisar anchos y saltos de línea; el conteo de paradas con la barra visible no es confiable.
- **iPad Air 2:** quitar del CSS las declaraciones con `cqw`, `cqh` y `container-type`.
- **Comparar con una versión anterior:** `git worktree add ../anterior <commit>` y servirla en otro puerto.

## 12. Deuda técnica y pendientes conocidos

Ninguno de estos puntos afecta lo que hoy ve el visitante, salvo donde se indica.

**Código sin uso** (se puede quitar con una prueba de regresión):
- Clases CSS sin elementos en el HTML: `.section-white`, `.parallax-blocks`, `.parallax-card`, `.parallax-image-wrapper`, `.parallax-img`, `.card-text`, `.ecosystem-extended-text`, `.footer-links`, `.ia-section`, `.over-sticky`, `.push-up`, `.responsive-seq-img`, `.op-side-b`, `.op-side-bl`, `.brand-logo` y `.reveal-up`.
- JS sin efecto: el parallax (`onScrollParallax`) y el `IntersectionObserver` de `.reveal-up`, porque no hay elementos con esas clases.
- `@keyframes scroll` no se usa. El `<div class="mouse">` de la portada no tiene estilos, así que no se ve.
- `img/icon.png` no se usa.

**Organización:**
- `styles.css` creció por capas: algunas secciones tienen reglas en varios bloques (el pie de página en unos 6; IA en 3), y el mismo `@media (min-width: 769px) and (max-height: 820px)` aparece 4 veces. Reordenarlo por sección es posible, pero en CSS el orden cambia el resultado: hacerlo en una rama de respaldo y con la revisión completa del §11.
- La lógica de escenas está en 3 motores (§3.3). Dilema, IA y Experiencia podrían usar `makeSimpleSequence()`.
- Nombres históricos: `pilares` (hoy Experiencia), `v-a` (variante A de diseño), `casos` (antigua sección `#ia-casos`).
- 34 atributos `style=""` en `index.html`, casi todos imágenes de fondo, y 7 `!important` en `styles.css`.
- Varios comentarios del código cuentan la historia del cambio ("antes…", "variante B elegida…"). La historia va en `CAMBIOS.md`; los comentarios deberían explicar el porqué actual.

**Rendimiento:** `h1.jpg` (423 KB), `h3.jpg` (432 KB), `h2.jpg` (300 KB), `p1.jpg` (296 KB), `p2.jpg` (269 KB) y `p4.jpg` (242 KB) pasan del objetivo de 150 KB. Son las primeras imágenes que se cargan.

**Funcionales:**
- iPad Air 2 en horizontal: Ecosistema sin tarjetas (§10). Propuesta en estudio: medidas de respaldo antes de cada `cqw`.
- `enviar.php`: si no llega `t0`, el filtro de 3 s no se aplica.
- Aviso de privacidad: falta el código postal del domicilio y la revisión de un abogado.
- **Migración a Hostinger:**
  - Alojar Space Grotesk en el propio servidor y quitar la mención de Google Fonts en la sección 9 del aviso.
  - Probar `mail()` con un correo real.
- **Revisión de seguridad:** pendiente (encabezados del servidor, límites de envío del formulario y otros).
- **Versión en inglés:** planeada como página aparte (`/en/`) después de la migración.

## 13. Lineamientos de diseño y contenido

- **Transiciones:** los cambios entre pantallas se ven como escenas fijas (fundido de fondo y texto que sube), no como desplazamiento de página. Si se agrega contenido, se agrega como escena de una sección existente.
- **Escritorio y celular:** todo cambio se hace y se revisa en los dos.
- **Color:** negro, blanco y un solo acento vino (`--brand`).
- **Tipografía:** Space Grotesk; títulos en mayúsculas con letras juntas.
- **Fotos:**
  - Fotos reales de color natural en Dilema, Crecimiento y Experiencia.
  - Renders oscuros de cristal con acento vino solo en el mapa de Operaciones y la maqueta de Ecosistema.
  - El protagonista es la tecnología (cámaras, sensores, redes, centros de control). Las personas, cuando aparecen, se ven ejecutivas.
  - Sin texto, logotipos ni rostros reconocibles.
- **Textos:** español de México, en voz de 4ward (primera persona del plural) y tuteando al visitante.
- **Datos:** no se publican cifras, clientes ni alianzas sin confirmación de 4ward.
