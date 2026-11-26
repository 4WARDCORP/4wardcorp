# Documentación técnica — sitio 4ward Solutions

Referencia para quien mantenga o modifique el sitio. Describe el código tal como está en la versión **`20261126c`** (ver [CAMBIOS.md](CAMBIOS.md)).
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
14. [Seguridad: servidor, tipografía y metadatos](#14-seguridad-servidor-tipografía-y-metadatos)
15. [Versión en inglés](#15-versión-en-inglés)

---

## 1. Arquitectura y orden de carga

- **Página única** (`index.html`) con desplazamiento vertical. La versión en inglés (`en/index.html`) es una copia con los textos en inglés y usa los mismos `styles.css`, `script.js`, `img/` y `fonts/` (§15). El navegador "frena" en cada pantalla (`html { scroll-snap-type: y mandatory }`).
- **Sin dependencias:** no hay frameworks, librerías, compilación ni `package.json`. No hay cargas externas: la tipografía Space Grotesk se sirve desde `fonts/` (§14).
- **Orden de carga de `index.html`:**
  1. Script en línea dentro de `<head>`: mide el alto visible y define `--vh` **antes de pintar** (§4). **Si se modifica, recalcular su hash en `.htaccess` (§14).**
  2. Precarga de las dos tipografías latinas (400 y 700) y `styles.css?v=<versión>`.
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
| 2 | `operaciones` | Operaciones | 2 | `200` (`.operaciones-sequence`) | `makeSpotSequence()` |
| 3 | `crecimiento` | Crecimiento | 2 | `200` (`.crecimiento-sequence`) | `makeSimpleSequence()` |
| 4 | `ia` | IA | 6 | `600` (`.ia-sequence`) | en línea, en el `scroll` |
| 5 | `experiencia` | Experiencia | 5 | `500` (valor base) | en línea, en el `scroll` |
| 6 | `ecosistema` | Ecosistema | 2 | `200` (`.ecosistema-sequence`) | `makeSpotSequence()` |
| — | (pie) | — | 1 | `calc(var(--vh) * 70)` | — |

\* "Inicio" solo aparece en el menú del celular; en escritorio se regresa con el logo (§5).
Todas las alturas de sección son `calc(var(--vh) * N + var(--extra))`. **Paradas totales al recorrer con Av Pág: 24** (1 + 22 escenas + pie).

**Contenido por escena** (la escena 0 es siempre el título sobre fondo blanco, salvo en Experiencia, que usa fondo negro):

| Sección | Escenas 1 en adelante |
|---|---|
| Dilema | 1 Perfil del Equipo (d1) · 2 Retención de Conocimiento (d2) · 3 Enfoque de Ejecución (d3) · 4 Garantía de Red (d4) |
| Operaciones | 1 Mapa `dominio.jpg` con las 4 regiones a la vista (Norte, Bajío, Centro y Sur), rutas desde Centro y 4 tarjetas |
| Crecimiento | 1 Tres tarjetas: Representación Comercial (c1), Integración de Soluciones (c2), Comercialización Tech (c3) |
| IA | 1 Introducción (ia-hero) · 2 Diagrama "Cómo trabaja la IA en tu día a día" · 3 Seis frentes en una pantalla (6 tarjetas con ícono, imagen ia-01…ia-06 y 3 viñetas) · 4 Desarrollos 4ward · 5 Nuestro proceso es simple (con el botón del formulario) |
| Experiencia | 1 Movilidad · SICE (p1) · 2 Suministro · Vista Alegre (p2) · 3 Seguridad · NUCTECH (p3) · 4 Conectividad · ENTELAR (p4) |
| Ecosistema | 1 Maqueta `ecosistema.jpg` con todo a la vista: Capa de IA (cubo central, origen de las rutas), SICE, Vista Alegre, NUCTECH (2 puntos: puerto y tren) y ENTELAR, con sus 4 tarjetas |

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
   - En Operaciones, Crecimiento, Ecosistema e IA se escribe además `data-scene="<escena>"` en la `<section>`, que el CSS usa (por ejemplo, la entrada escalonada de las tarjetas de Crecimiento o el encendido de los frentes, Desarrollos y Proceso de IA).

### 3.3 Los tres motores de escenas

| Motor | Secciones | Particularidades |
|---|---|---|
| En línea dentro del `scroll` | Dilema, IA, Experiencia | El número de escenas sale de la cantidad de `.seq-bg`. **Experiencia tiene el máximo en la constante `PILARES_ULTIMA_ESCENA` (4)** y además activa los cuadros de escritorio (`.is-in` cuando `escena ≥ cuadro + 1`). |
| `makeSimpleSequence(section, track)` | Crecimiento | Fondos y texto por escena; escribe `data-scene`. |
| `makeSpotSequence(section, track)` | Operaciones, Ecosistema | Puntos sobre una imagen (ver abajo). Solo hay 2 fondos: el blanco (escena 0) y la imagen (escenas 1 en adelante). |

**Puntos sobre imagen (`makeSpotSequence`)**

- `.op-stage` (`.eco-stage`) es el lienzo de la imagen: 3:2 en escritorio y 2:3 en celular.
- `.op-spot` es un punto. Atributos:
  - `data-scene`: escena en que se enciende.
  - `data-x` / `data-y`: posición en % del lienzo, en escritorio.
  - `data-xv` / `data-yv`: posición en % en celular (imagen vertical). El cambio ocurre en ≤ 768 px de ancho.
- Estados: `.is-on` (escena actual, con pulso) e `.is-seen` (escenas pasadas: queda visible con su nombre). Hoy, en las dos secciones, todos los puntos tienen `data-scene="1"` y se encienden juntos.
- Foco de luz: el JS centra `.op-shade` en `--fx` / `--fy` (posición del punto activo), pero Operaciones y Ecosistema lo reemplazan en CSS por un foco general fijo (elipse que oscurece las orillas).
- **Operaciones:** una sola escena de mapa; los 4 puntos tienen `data-scene="1"`, así que se encienden juntos.
  - La tarjeta (`.op-card`) vive dentro del punto: `.op-side-r` / `.op-side-l` / `.op-side-b` la ponen a la derecha, a la izquierda o abajo. Aparecen una tras otra con `--delay` (Centro 0.3 s, Norte 0.6 s, Bajío 0.9 s, Sur 1.2 s).
  - **Rutas:** el punto con `.op-hub` (Centro) es el origen. `drawRoutes()` crea dentro de `.op-routes` una `.op-route` por cada otro punto: una barra girada del largo exacto, con 2 puntos de luz `<i>` que la recorren con la animación `flowX` del diagrama de IA. La duración (`--dur`) es proporcional al largo (170 px por segundo, mínimo 1.6 s). Se recalculan con `place()` al cambiar el tamaño.
  - **Foco general:** en Operaciones, `.op-shade` es una elipse fija que deja a la vista la zona de las 4 regiones (no usa `--fx` / `--fy`).
  - La imagen del mapa ya trae sus propias líneas vino (son parte del render); las rutas rectas se suman a ellas a propósito.
  - **Celular:** sin tarjetas; los nombres van sobre el mapa (Bajío a la izquierda y Centro abajo, para que no choquen) y las 4 frases en la lista `.op-list` debajo. Mapa y lista se acomodan como un solo bloque centrado con `fitMobile()` (ver abajo).
- **Ecosistema:** una sola escena de maqueta, con el mismo esquema de Operaciones:
  - El cubo central (`#spot-ia`, `.op-hub`) es el origen de las rutas hacia los 5 puntos (`drawRoutes()`), que coinciden con las líneas vino propias de la imagen. Lleva la etiqueta destacada `.eco-ia-label` ("Capa de IA" y su frase; en celular solo el nombre), siempre visible y con brillo que late (`iaGlow`).
  - Aparición escalonada con `--delay`: etiqueta de IA, SICE (0.6 s), Vista Alegre (0.9 s), NUCTECH (1.2 s) y ENTELAR (1.5 s); cada tarjeta y su línea usan el mismo retraso.
  - **Celular:** nombres al lado de su punto, hacia afuera de la maqueta para que no se junten alrededor del cubo (SICE y ENTELAR a la izquierda, Vista Alegre a la derecha, NUCTECH abajo, Capa de IA arriba del cubo), y lista `.op-list` con textos cortos (versión resumida de las tarjetas). Maqueta y lista se acomodan con `fitMobile()`; en pantallas de 720 px de alto o menos la lista además usa letra más chica.
- **IA, escena 3 (seis frentes):** las 6 tarjetas `.ia-frente` (3 × 2 en escritorio, 1 columna en celular) empiezan apagadas (opacidad y brillo bajos) y se encienden en ola cuando `#ia` tiene `data-scene="3"`: cada encendido dura 2 s (pulso de luz vino `iaEncendido`, borde y ícono vino) y la siguiente tarjeta empieza 0.5 s después (`--t` = 0.2 s + `--i` × 0.5 s). Sin número: el orden no importa. Ícono de línea `.ia-frente-ico` (SVG en el HTML, mismo trazo que el diagrama). En laptops bajas (alto ≤ 720 px) el ícono va al lado del título; en celular solo se ven el título y la primera viñeta.
- **IA, escenas 4 y 5 (Desarrollos y Proceso):** el mismo encendido en ola, con 3 elementos (`--i` 0–2). Con `data-scene="4"` se encienden las tarjetas `.ia-case` (pulso `iaEncendido`, borde vino e ícono `.ia-case-ico` con fondo vino; el ícono reemplaza al número porque las tarjetas no tienen orden; en celular va al lado del título). Con `data-scene="5"` se encienden los pasos `.ia-step`: suben opacidad y brillo, el número `.ia-num` brilla y una línea vino (`.ia-step::after`) recorre el borde inferior. Los números de los pasos se conservan porque sí indican la secuencia. Fuera de su escena, tarjetas y pasos vuelven a quedar apagados.
- **Acomodo en celular (`fitMobile()`, Operaciones y Ecosistema):** la imagen vertical tiene fondo negro arriba y abajo; el atributo `data-contenido="arriba abajo"` del lienzo indica qué parte del alto tiene contenido (Operaciones `0.28 0.68`, Ecosistema `0.22 0.76`). Con eso, el alto de pantalla (`screenH()`) y el alto real de la lista, el JS centra imagen + lista entre el menú (84 px) y el borde inferior (24 px), con 18 px de separación. Escribe en la `<section>` `--map-shift` (desplazamiento del lienzo), `--map-scale` (reducción, solo si no cabe; mínimo 0.6 y máximo 1, o **0.93 en Ecosistema** para que las etiquetas de las orillas —Vista Alegre, Entelar— no se salgan de la pantalla cuando la lista es corta, como en inglés; desde el borde superior; por eso `drawRoutes()` y `drawLines()` miden el lienzo con `offsetWidth/offsetHeight`, su tamaño de diseño, y no con `getBoundingClientRect()`, que ya incluye la reducción) y `--cap-pad` (espacio bajo la lista). El CSS de celular tiene valores fijos de respaldo por si el JS no corre. Se recalcula al cambiar el tamaño, al cargar y cuando termina de cargar la letra. En escritorio no hace nada.
- Las tarjetas (`.eco-card`) están en las esquinas (`.c-tl`, `.c-tr`, `.c-bl`, `.c-br`) y una línea SVG las une a su punto:
  - `<line data-from="X">` se conecta con `#spot-X` y con la tarjeta cuyo `data-for` contiene `X`.
  - `drawLines()` recalcula las líneas al cambiar el tamaño de la ventana.
- **En celular** no hay tarjetas ni líneas de Ecosistema: el texto se ve abajo en `.op-cap` (con su `.op-list`), que en escritorio está oculto (`visibility: hidden`).
- `.is-past` en la `<section>`: cuando el pie de página empieza a subir, desvanece los textos para que no se asomen bajo el menú.

### 3.4 Agregar o quitar una escena (lista de verificación)

1. Agregar o quitar un `.snap-point` en `.snap-grid`.
2. Agregar o quitar su `.seq-bg`. En `makeSpotSequence` no hace falta, porque solo se usan 2 fondos.
3. Agregar o quitar su `.text-slider-item`, en la misma posición.
4. Ajustar el alto de la sección en CSS: `calc(var(--vh) * <N×100> + var(--extra))`. Si la sección usa el valor base de `.sticky-sequence` (500), crear una clase propia, como `.ia-sequence`.
5. Según la sección:
   - **Experiencia:** cambiar también `PILARES_ULTIMA_ESCENA` en `script.js` y los cuadros de escritorio.
   - **Spot:** agregar el `.op-spot` con su `data-scene` y sus 4 coordenadas.
   - **Ecosistema:** además, su `.eco-card` y su `<line>`.
6. Actualizar los comentarios con el mapa de escenas en `index.html` y la tabla del §2 de este documento.
7. Probar el recorrido completo con Av Pág: el número de paradas debe cambiar exactamente en las escenas agregadas o quitadas (hoy son 24).

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
| `.mobile-menu-open` | Celular: al tocar el logo | Menú vertical con "Inicio" + 6 secciones + renglón ES / EN |

**Selector de idioma** (§15): `.lang-switch` en escritorio, arriba a la derecha (portada: `top: 88px`, bajo la fila de enlaces; con `.is-scrolled`: `top: 40px`, a la altura de la píldora; se oculta con `.is-shrunk` y, entre 769 y 1199 px, con `.is-scrolled`, porque no cabe junto a la píldora). En celular se ve solo en la portada; después, `.lang-switch-m` dentro del menú vertical.

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

**Organización de `styles.css`:** un índice al inicio y 15 secciones en el orden de la página (base, elementos comunes, carga, menú, portada, sistema de escenas, una sección por cada parte del sitio, pie, formulario y regreso al inicio). Cada sección tiene primero sus reglas generales y al final sus `@media`, en el orden del §6.4. `script.js` también abre con un índice y está dividido en los mismos bloques del §7.

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
| Menú | `.morph-container`, `.pill-bg`, `.brand-logo-wrapper`, `.logo-color`, `.logo-white`, `.nav-links`, `.nav-left`, `.nav-right`, `.mobile-menu-content`, `.menu-inicio`, estados del §5; idioma: `.lang-switch`, `.lang-switch-m`, `.lang-actual` (idioma de la página), `.lang-sep` |
| Portada | `.hero-section`, `.hero-slider`, `.slide`(`.active`), `.hero-bg-overlay-light`, `.hero-bottom-text`, `.scroll-indicator` |
| Escenas fijas | `.sticky-sequence`, `.sticky-container`, `.snap-grid`, `.snap-point`, `.seq-bg`(`.active`), `.seq-overlay` (capa negra 70 %), `.text-slider-mask`, `.text-slider-track`, `.text-slider-item`, `.bg-picture`, `.is-past` |
| Dilema | Solo clases comunes |
| Operaciones / Ecosistema | `.op-stage`, `.eco-stage`, `.eco-img`, `.op-shade`, `.op-spots`, `.op-spot`, `.eco-dot`, `.op-name`, `.op-card`, `.op-num`, `.op-side-r/-l/-b`, `.op-cap`, `.op-hub` (Centro, origen de las rutas), `.op-routes`, `.op-route`, `.op-list` (lista del celular), `.eco-ia-label` (etiqueta "Capa de IA"), `.eco-lines`, `.eco-card`, `.eco-card-ia`, `.c-tl/-tr/-bl/-br`, `.spot-extra` (punto sin nombre), `.spot-core` (cubo de IA) |
| Crecimiento | `.crec-scene`, `.crec-b-grid`, `.crec-b-card` |
| IA | `.ia-kicker`(`-dark`), `.ia-num`, `.ia-intro`, `.ia-intro-sub`, `.ia-overlay`, seis frentes: `.ia-frentes`, `.ia-frentes-bg`, `.ia-frentes-grid`, `.ia-frente`, `.ia-frente-ico`; diagrama: `.ia-diag`, `.ia-diag-bg`, `.diag-flow`, `.flow-step`(`.is-core`), `.flow-conn`, `.flow-ico`, `.flow-num`, `.ia-diag-msg`; escenas 4–5: `.casos-item`, `.casos-bg`, `.casos-bg-2`, `.ia-cases`, `.v-a`, `.ia-case`, `.ia-case-ico`, `.ia-process-block`, `.ia-process-img`, `.ia-process-content`, `.ia-steps`, `.ia-step`, `.role`, `.role-client`, `.role-4w`, `.proceso-cta` |
| Experiencia | `.pilares-mobile-view`, `.pilares-desktop-view`, `.quadrant-card`(`.is-in`), `.q-top-left/-right`, `.q-bottom-left/-right`, `.quadrant-content`, `.ally-tag`, `.sector-title`, `.sector-title-m`, `.z-background` |
| Pie | `.footer-reveal`, `.footer-content`, `.footer-info`, `.footer-contact`, `.footer-legal`, `.footer-cta` |
| Botón general | `.cta-btn` (vino con flecha →) |
| Formulario | `.contacto-modal`(`.is-open`), `.contacto-fondo`, `.contacto-caja`, `.contacto-cerrar`, `.contacto-form`, `.cf-fila`, `.cf-opc`, `.cf-trampa`, `.cf-aviso`, `.cf-acepta`, `.cf-estado`(`.is-ok`), `.cf-enviar`, `.is-error`, `html.contacto-abierto` (bloquea el scroll de la página) |
| Regreso al inicio | `.btn-subir`(`.is-visible`), `.fundido-inicio`(`.is-on`) |
| Aviso de idioma | `.lang-aviso`(`.is-visible`), `.lang-aviso-botones`, `.lang-aviso-si`, `.lang-aviso-no` (lo crea `script.js` §9) |

### 6.3 Capas (`z-index`)

`#preloader` 100000 › `.contacto-modal` 10000 › `.morph-container` (menú) 9999 › `.fundido-inicio` 9998 › `.lang-aviso` 9500 › `.btn-subir` 9000 › `.content-wrapper` 10 › `.footer-reveal` 1.

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

`script.js` solo expone la constante `LANG`; todo lo demás vive dentro de `DOMContentLoaded` o de las funciones del formulario y del idioma.

| Nombre | Tipo | Qué hace |
|---|---|---|
| `LANG` | constante global | `'en'` si `<html lang="en">`, si no `'es'`. La usan el formulario y el idioma. |
| `screenH()` | función | Alto de una pantalla del sitio: alto del primer `.snap-point`. Si no existe, usa `innerHeight`. |
| `sceneStep(section)` | función | Lo mismo, medido dentro de la sección indicada. |
| `makeSpotSequence(section, track)` | función | Prepara una sección de puntos sobre imagen y devuelve su `onScroll(alto)`. Internas: `place()` (coloca puntos según escritorio o celular), `drawLines()` (líneas SVG de Ecosistema), `drawRoutes()` (rutas con puntos de luz desde `.op-hub`), `fitMobile()` (centra imagen + lista en celular) y `setScene(i)`. |
| `makeSimpleSequence(section, track)` | función | Prepara una sección de fondos con fundido y devuelve su `onScroll(alto)`. |
| `volverInicio()` | función | Fundido a negro, salto a la portada y fundido de regreso (§5). |
| `toggleSubir()` | función | Muestra u oculta `.btn-subir`. |
| `abrir(e)` / `cerrar()` | funciones (formulario) | Abren y cierran la ventana del formulario. Al abrir, guardan `performance.now()` en `abiertoEn` (al enviar, el tiempo transcurrido se escribe en `tiempo`) y recuerdan el foco; al cerrar, lo regresan. En celular no ponen el foco en el primer campo, para no abrir el teclado. |
| `validar()` | función (formulario) | Revisa obligatorios, formato del correo y casilla de aceptación; marca `.is-error`. |
| `respaldoCorreo()` | función (formulario) | Abre `mailto:` con los datos ya escritos cuando no hay PHP. |
| `DESTINO` | constante | Correo que recibe los mensajes del respaldo `mailto:`. |
| `T` | objeto (formulario) | Mensajes y etiquetas del formulario en el idioma de la página (`revisa`, `acepta`, `enviando`, `correo`, `etiquetas` del `mailto:`). |
| `CLAVE` | constante (idioma) | Nombre del dato guardado en `localStorage`: `4w-idioma` (`'es'` o `'en'`). |
| `leer()` / `guardar(v)` | funciones (idioma) | Leen y guardan la preferencia dentro de `try/catch` (en modo privado puede fallar; el sitio funciona igual). |
| `irAlOtro()` | función (idioma) | Guarda el otro idioma y abre la otra versión conservando el `#ancla`. |
| `quitarAlBajar()` | función (idioma) | Quita el aviso de idioma (sin guardar) cuando el visitante baja más del 60 % de la pantalla. |
| `abiertoEn` | variable (formulario) | `performance.now()` al abrir el formulario. Al enviar, `performance.now() - abiertoEn` se escribe en el campo oculto `tiempo` (filtro anti-robots de §8). |
| `PILARES_ULTIMA_ESCENA` | constante | Última escena de Experiencia (4). |

**Eventos registrados:**
- `scroll`, dos veces: escenas y estado del menú.
- `scroll` pasivo: botón ↑.
- `resize`: reacomoda los puntos y las líneas de cada sección con puntos.
- `load`: quita la pantalla de carga y dibuja las líneas.
- Slider de portada: `setInterval` de 4.5 s.
- En el formulario: `click` (abrir y cerrar), `keydown` (Esc cierra), `input` (borra errores) y `submit`.
- Idioma: `click` en los enlaces `[data-lang]`, `load` (muestra el aviso 1.6 s después) y `scroll` pasivo mientras el aviso está a la vista.

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
| `tiempo` | — | — | Milisegundos que el formulario estuvo abierto, medidos en el navegador (`performance.now()`). Si falta o es menor a 3000, se responde "Gracias" sin enviar. |
| `idioma` | — | — | Solo en `en/index.html`, con valor `en`. `enviar.php` responde al visitante en inglés y marca el correo con "(EN)". |

**Sector en inglés:** las opciones de `en/index.html` muestran el texto en inglés pero envían el valor en español (`<option value="Trenes">Rail</option>`), para que el correo llegue igual desde las dos versiones.

**Flujo de envío:**
1. `validar()` en el navegador.
2. `fetch` POST a `enviar.php` (atributo `action` del formulario; en `en/index.html` es `../enviar.php`).
3. Si la respuesta es JSON: se muestra `msg`; si `ok` es verdadero, el formulario se limpia.
4. Si la respuesta no es JSON o falla la red (por ejemplo, GitHub Pages, que no ejecuta PHP), se llama a `respaldoCorreo()`.

**`enviar.php`** (configuración al inicio: `$DESTINO`, `$REMITENTE`, `$LIMITES`, `$MAX_ENLACES`, `$TIEMPO_MIN`). `$EN` es verdadero si llegó `idioma=en`; `t($es, $en)` elige el texto de cada respuesta. El correo para 4ward siempre va en español:
- **Seguridad, en este orden:**
  1. Nunca muestra errores de PHP (`display_errors` en 0) y responde con `Content-Type: application/json`, `nosniff` y `Cache-Control: no-store`.
  2. Solo POST (si no, 405).
  3. Si el navegador manda `Origin`, debe ser el mismo dominio (si no, 403).
  4. Trampa `sitio_web` y `tiempo` mínimo: si fallan, responde "Gracias" sin enviar, para no dar pistas al robot.
  5. `campo()` solo acepta texto (un arreglo como `nombre[]=…` cuenta como vacío). `linea()` quita saltos y caracteres de control de los campos de una línea (evita inyectar encabezados) y recorta al largo máximo; `proceso` conserva saltos de línea.
  6. Correo: `FILTER_VALIDATE_EMAIL` **y** un formato común (letras, números, `._%+-`; sin comillas, comas ni espacios).
  7. Más de `$MAX_ENLACES` (2) enlaces (`http://`, `https://`, `www.`) en el mensaje → 422.
  8. **Límite por conexión** (`$LIMITES`: 3 cada 10 min y 10 cada 24 h) → 429. Guarda un HMAC-SHA256 de la IP (clave aleatoria creada en el servidor, archivo `clave`) con la hora de cada envío, un archivo JSON por IP, en `../formulario-limites/` (fuera de la carpeta pública; si no se puede escribir ahí, en la carpeta temporal del sistema). Archivos con permisos 0600; se borran solos a las 24 h.
- **Validación:** obligatorios y correo inválido → 422; falta la aceptación → 422.
- **Envío:** `mail()` de PHP, en texto plano UTF-8 con *quoted-printable* (ninguna línea pasa de 76 caracteres). Asunto (`Contacto web – <empresa>`, o `Contacto web (EN) – <empresa>` desde la versión en inglés; el cuerpo termina con "Idioma del sitio"), remitente y nombre del visitante van siempre en Base64 por trozos (`encabezado()`), así que comas, comillas o acentos no rompen el encabezado. `Reply-To` lleva el correo del visitante y `-f` el remitente del dominio, para que no caiga en spam.
- **Respuestas:** `{"ok": true|false, "msg": "…"}` con código 200, 403, 405, 422, 429 o 500. `script.js` muestra `msg` en todos los casos con JSON.
- **No usa usuario ni contraseña SMTP, a propósito,** porque el repositorio es público. Si `mail()` no entrega en Hostinger, la alternativa prevista es PHPMailer con SMTP y la configuración en un archivo fuera del repositorio.

### 8.1 Datos repetidos en varios archivos (cambiar en todos)

| Dato | Dónde aparece |
|---|---|
| **Todo texto y toda estructura de la página** | `index.html` y `en/index.html` (§15) |
| Dominio `4wardcorp.com` | `canonical` y `hreflang` de `index.html` y `en/index.html` (§15) |
| Correo `rvertti@4wardcorp.com` | `index.html` y `en/index.html` (pie y aviso del formulario), `script.js` (`DESTINO`), `enviar.php` (`$DESTINO`, `$REMITENTE`), `aviso-de-privacidad.html`, `en/privacy-notice.html` |
| Razón social y domicilio | `index.html` y `en/index.html` (`.cf-aviso`), `aviso-de-privacidad.html`, `en/privacy-notice.html` |
| Contenido del aviso de privacidad | `aviso-de-privacidad.html` (válido) y su resumen `en/privacy-notice.html`: si cambia el aviso, revisar el resumen |
| Mensajes del formulario | `script.js` (`T`, en los dos idiomas) y `enviar.php` (`t()`, en los dos idiomas) |
| Textos de Operaciones y Ecosistema | Dos veces cada uno: en la tarjeta de escritorio (`.op-card` / `.eco-card`) y en la lista del celular (`.op-list`). **En Ecosistema la lista lleva una versión corta**: si cambia el texto de una tarjeta, revisar que la versión corta siga diciendo lo mismo. La frase de "Capa de IA" está en `.eco-ia-label` y en la lista. |
| Textos de Experiencia | Dos veces: `.pilares-mobile-view` y `.pilares-desktop-view` |
| Versión de CSS / JS | Los dos enlaces de `index.html` y los dos de `en/index.html` |
| Declaraciones `@font-face` de Space Grotesk | Inicio de `styles.css`, `<style>` de `aviso-de-privacidad.html` (rutas a `fonts/`) y de `en/privacy-notice.html` (rutas a `../fonts/`) |
| Script en línea de `--vh` | `<head>` de `index.html` y de `en/index.html` (**idéntico**, para que sirva el mismo hash) y su hash `sha256-…` en la regla `script-src` de `.htaccess` (§14) |
| Tiempo mínimo del formulario (3 s) | `$TIEMPO_MIN` en `enviar.php` y el comentario de `abrir()` en `script.js` |

## 9. Imágenes

Optimización usada: 1280×800 o 1536×1024 (horizontal), 1024×1536 (vertical), JPG de 150 KB o menos. Ninguna imagen lleva texto, logotipos ni rostros reconocibles.

**Metadatos:** las imágenes se publican sin EXIF, XMP, IPTC ni comentarios (autoría, fechas, programa de edición, ubicación). Al agregar una imagen, quitárselos sin recomprimir (§14).

| Archivo | Dónde | Estilo |
|---|---|---|
| `h1`–`h3.jpg` | Portada (slider) | Foto |
| `d1`–`d4.jpg` | Dilema, escenas 1–4 (capa negra 70 %) | Foto real |
| `dominio.jpg` / `dominiov.jpg` | Operaciones (escritorio / celular) | Render oscuro de cristal con acento vino |
| `c1`–`c3.jpg` | Crecimiento, fondo de las tarjetas (oscurecido) | Foto real |
| `ia-hero.jpg` | IA, escena 1 | — |
| `ia-01`–`ia-06.jpg` | IA, fondo oscurecido de cada tarjeta de los seis frentes (variable `--img` en el HTML) | — |
| `ia-proceso.jpg` | IA, escena 5 (en `styles.css`) | — |
| `p1`–`p4.jpg` | Experiencia, sectores 1–4 | Foto real |
| `ecosistema.jpg` / `ecosistemav.jpg` | Ecosistema (escritorio / celular) | Render oscuro de cristal con acento vino |
| `logo.png` / `logoc.png` | Menú (a color / blanco) | — |
| `favicon.png`, `apple-touch-icon.png` | Ícono de la pestaña / del iPhone | — |
| `icon.png` | **Sin uso** (§12) | — |

**Recortes en celular:**
- Las fotos de fondo (`background-size: cover`) se recortan en vertical por el centro, así que el sujeto debe ir centrado.
- Operaciones y Ecosistema no se recortan: tienen su propia versión vertical (`…v.jpg`).
- **Si se cambia la imagen de Operaciones o de Ecosistema,** hay que volver a medir las coordenadas `data-x/y/xv/yv` de cada punto y, en la versión vertical, el `data-contenido` del lienzo (filas de la imagen con contenido, como fracción del alto).

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
- **Imágenes en variables CSS en `en/`:** las tarjetas de Crecimiento y de los seis frentes llevan su imagen en `style="--img: url('../img/…')"`. Los navegadores actuales resuelven esa ruta respecto a la página que la declara (`en/`), por eso lleva `../`. Si alguna tarjeta en inglés apareciera sin foto en un navegador, revisar esto primero.
- **iPad Air 2:** llega como máximo a iPadOS 15.8 (Safari 15.6), así que no tiene `cqw` ni `@property`. En horizontal, Ecosistema pierde las tarjetas de texto (pendiente en §12).

## 11. Cómo probar

**Revisión manual mínima de cada cambio:**
1. Recorrer el sitio completo con Av Pág en escritorio. Deben ser 24 paradas; ningún texto debe quedar cortado ni debajo del menú, y cada escena debe cambiar con su transición.
2. Lo mismo en un celular, o en el emulador del navegador con los tamaños del README.
3. Menú: cada enlace lleva al inicio exacto de su sección. Probar también el logo, "Inicio" y el botón ↑.
4. Formulario: abrir, validar vacío, cerrar con Esc y con la ×; en celular no debe hacer zoom al escribir.
5. Edge en Windows.
6. **Las dos versiones:** repetir 1–4 en `en/` y revisar el selector ES / EN, el aviso de idioma (con el navegador en el otro idioma) y que la preferencia se recuerde.

**Pruebas automatizadas** (no están en el repositorio; se hacen con Playwright y Chrome):
- Servir el sitio con `python3 -m http.server` **en el mismo comando** que la prueba.
- Esperar de 1.7 a 2.8 s después de mover el scroll antes de medir, porque las transiciones duran 0.8–0.9 s.
- La tipografía está en `fonts/`, así que las pruebas sin internet ya usan la letra real. Para comparar con una versión anterior a 20261125d (que usaba Google Fonts), interceptar `fonts.googleapis.com` y servir **solo los pesos 400 y 700** del paquete npm `@fontsource/space-grotesk`, que es lo que entregaba Google.
- **Formulario con PHP:** ver README §2. Probar al menos: envío normal (esperar más de 3 s), envío en menos de 3 s ("Gracias." sin correo), correo con comillas o comas (422), más de 2 enlaces (422), más de 3 envíos seguidos (429) y `Origin` de otro dominio (403). Borrar `../formulario-limites/` entre pruebas.
- **`.htaccess`:** probar con Apache y HTTPS (§14).
- **iPhone con barras:** abrir en 430×752 y después cambiar a 430×846. `--vh` debe quedarse en 7.52 px, `--extra` pasar a 94 px y los textos no deben moverse.
- **Windows / Edge:**
  - La escala de pantalla de Windows (125–150 %) reduce mucho el área en CSS: una laptop de 1920×1080 al 150 % deja unos 1280×580 útiles. Probar siempre ese tamaño.
  - Barra de desplazamiento: simularla con 15 px menos de ancho de ventana. **No** forzar `html { overflow-y: scroll }`: con `body { overflow-x: hidden }`, el `body` se vuelve el contenedor de scroll y las escenas fijas dejan de funcionar en la simulación.
- **iPad Air 2:** quitar del CSS las declaraciones con `cqw`, `cqh` y `container-type`.
- **Comparar con una versión anterior:** `git worktree add ../anterior <commit>` y servirla en otro puerto.
- **Si cambia el número de escenas de una sección:** las paradas dejan de coincidir entre versiones; comparar entonces escena por escena las demás secciones (posición de cada `.snap-point` dentro de su sección), que deben quedar idénticas.
- **Cambios que no deben verse (limpieza o reorganización):** comparar las dos versiones con el estilo computado de cada elemento (`getComputedStyle`, incluidos `::before` y `::after`) y una captura en cada una de las 36 paradas, en los 10 tamaños del README, más los estados interactivos (menú abierto, formulario abierto y con errores). Para tener resultados estables: congelar transiciones y animaciones y el slider de portada, y comparar los nombres de propiedades ordenados. Si se mueven reglas de CSS, revisar además los pares de reglas que cambiaron de orden y tienen la misma especificidad, porque ahí puede cambiar cuál gana.

## 12. Deuda técnica y pendientes conocidos

Ninguno de estos puntos afecta lo que hoy ve el visitante, salvo donde se indica.

**Código sin uso:** el código muerto se quitó en la versión `20261125b` (ver CAMBIOS.md). Solo queda `img/icon.png`, que no se usa; no se ha borrado porque las imágenes no se eliminan sin confirmación del responsable del sitio.

**Organización:**
- La lógica de escenas está en 3 motores (§3.3). Dilema, IA y Experiencia podrían usar `makeSimpleSequence()`, pero unificarlos cambia el código que corre en cada scroll: hacerlo solo con la revisión completa del §11.
- Nombres históricos que se conservan para no romper referencias: `pilares` (hoy Experiencia), `v-a` (estilo de las tarjetas de Desarrollos) y `casos` (escenas 4 y 5 de IA).
- 34 atributos `style=""` en `index.html` (casi todos, la imagen de fondo de cada escena) y 7 `!important` en `styles.css`.

**Rendimiento:** `h1.jpg` (419 KB), `h3.jpg` (429 KB), `h2.jpg` (297 KB), `p1.jpg` (293 KB), `p2.jpg` (266 KB) y `p4.jpg` (238 KB) pasan del objetivo de 150 KB. Son las primeras imágenes que se cargan.

**Funcionales:**
- iPad Air 2 en horizontal: Ecosistema sin tarjetas (§10). Propuesta en estudio: medidas de respaldo antes de cada `cqw`.
- Aviso de privacidad: falta el código postal del domicilio y la revisión de un abogado.
- **Migración a Hostinger:**
  - Probar `mail()` con un correo real y los límites del formulario.
  - Revisar que Hostinger aplique el `.htaccess`: que lleguen los encabezados de §14 y que `README.md` responda 403.
  - El encabezado `Server` (versión del servidor) no se puede quitar desde `.htaccess`; depende de Hostinger.
- **Seguridad pendiente:** la CSP y la `Referrer-Policy` podrían adelantarse en GitHub Pages con `<meta>` (sin aprobar).
- **Dos páginas que mantener:** cada cambio de estructura se hace en `index.html` y en `en/index.html` (decisión del responsable del sitio). Si el sitio sigue cambiando mucho, se puede generar `en/index.html` con un script a partir de `index.html` y un archivo de textos.

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
- **Textos en inglés:** inglés de EE. UU., interpretado y no traducido palabra por palabra, directo para un público ejecutivo; la misma voz ("we", hablándole de "you" al visitante). No cambian los nombres propios (SICE, Vista Alegre, NUCTECH, ENTELAR, "Agile Titan", ComprasMX, Bajío) ni la razón social, el domicilio o el correo.
- **Datos:** no se publican cifras, clientes ni alianzas sin confirmación de 4ward.

## 14. Seguridad: servidor, tipografía y metadatos

**`.htaccess` (solo Hostinger; GitHub Pages lo ignora y Jekyll no publica archivos que empiezan con punto):**

| Regla | Para qué |
|---|---|
| `RewriteCond %{HTTP_HOST} ^www\.` → 301 a `https://` sin `www` | Una sola dirección oficial (`4wardcorp.com`); conserva la ruta, por ejemplo `/en/`. Va antes de la regla de HTTPS para que todo llegue en un solo salto |
| `RewriteCond %{HTTPS} off` → 301 a `https://` | Siempre conexión cifrada |
| `Strict-Transport-Security: max-age=31536000` | El navegador recuerda un año que solo se usa HTTPS. Sin `includeSubDomains`, para no afectar subdominios de correo |
| `Content-Security-Policy` | Solo se cargan archivos del propio sitio. `script-src` permite `script.js` y el script en línea de `--vh` por su hash; `style-src` necesita `'unsafe-inline'` por los 34 `style=""` de `index.html` y el `<style>` del aviso; `connect-src 'self'` para el `fetch` a `enviar.php`; `frame-ancestors 'none'` |
| `X-Frame-Options: DENY` | Lo mismo que `frame-ancestors`, para navegadores viejos |
| `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy` | Endurecimiento estándar |
| `Header unset X-Powered-By`, `ServerSignature Off`, `Options -Indexes` | No revelar versiones ni listar carpetas |
| `DirectoryIndex index.html index.php` | La página de inicio es `index.html` aunque en `public_html` quede el `default.php` ("Próximamente") que pone Hostinger al crear el sitio |
| `FilesMatch` → `Require all denied` | Bloquea `.md`, `.yml`, `.log`, `.bak`, `.zip`, `.sh`, `.py`, `.ini` y archivos que empiezan con punto; `.git` responde 404 |

**Hash del script en línea.** Si cambia el script de `<head>` de `index.html` (aunque sea un espacio), el navegador lo bloquea y `--vh` deja de medirse. Recalcular y reemplazar el valor `sha256-…` de `.htaccess`:

```bash
python3 -c "import re,hashlib,base64;s=open('index.html').read();print(base64.b64encode(hashlib.sha256(re.search(r'<script>(.*?)</script>',s,re.S).group(1).encode()).digest()).decode())"
```

**Probar el `.htaccess` localmente:** Apache con `mod_rewrite`, `mod_headers`, `mod_ssl` (certificado de prueba) y `AllowOverride All` sobre la carpeta del repositorio. Revisar con `curl -kI https://localhost/` que lleguen los encabezados, que `README.md` dé 403 y recorrer el sitio en Chrome buscando errores de CSP en la consola. Hostinger usa su propio servidor: verificar de nuevo después de migrar.

**Tipografía:** `fonts/space-grotesk-{latin,latin-ext}-{400,700}-normal.woff2`, del paquete npm `@fontsource/space-grotesk` 5.3.0, con licencia SIL Open Font License en `fonts/OFL.txt` (debe acompañar a los archivos). Se declaran con `@font-face` y `unicode-range` al inicio de `styles.css` y en el `<style>` del aviso. Solo existen los pesos 400 y 700, igual que con Google Fonts: los textos con `font-weight: 500` usan el 400.

**Metadatos de imágenes:** quitarlos sin recomprimir, eliminando de los JPG los segmentos APP1 (EXIF/XMP), APP13 (IPTC/Photoshop) y COM, y de los PNG los bloques `tEXt`, `zTXt`, `iTXt`, `eXIf` y `tIME`. Se conserva el perfil de color (APP2 / `iCCP`). Revisar después que los píxeles sean idénticos y que la imagen no dependa de la orientación EXIF.

## 15. Versión en inglés

**Archivos:** `en/index.html` (página) y `en/privacy-notice.html` (resumen del aviso). No hay CSS, JS ni imágenes propios: se usan los de la raíz.

**Cómo está hecha `en/index.html`:** es una copia de `index.html` con estas diferencias, y nada más:

| Qué | En `index.html` | En `en/index.html` |
|---|---|---|
| Idioma | `<html lang="es">` | `<html lang="en">` (de aquí lo lee `script.js`) |
| Rutas | `styles.css`, `script.js`, `img/…`, `fonts/…`, `enviar.php` | `../styles.css`, `../script.js`, `../img/…` (también en `url('../img/…')` de los `style=""`), `../fonts/…`, `../enviar.php` |
| Aviso de privacidad | `aviso-de-privacidad.html` | `privacy-notice.html` |
| Selector y pie | ES actual; enlace `en/` con `data-lang="en"` | EN actual; enlace `../` con `data-lang="es"` |
| Formulario | — | Campo oculto `idioma=en`; opciones de sector con `value` en español |
| Textos, `alt`, `aria-label`, `title`, `meta description` | Español | Inglés |

**Reglas al cambiar el sitio:**
1. Todo cambio de estructura o diseño en `index.html` se repite igual en `en/index.html` (mismas clases, mismo orden, mismos atributos `data-…`).
2. Todo texto nuevo lleva su versión en inglés, aprobada por 4ward.
3. El script en línea de `<head>` debe ser idéntico en las dos páginas (mismo hash en `.htaccess`).
4. La versión de `styles.css` y `script.js` se sube en las dos páginas.
5. Probar las dos: los textos en inglés tienen otro largo y pueden cortarse o encimarse.

**Idioma del visitante (`script.js` §9):**
- La página abre en el idioma de su dirección: `/` español, `/en/` inglés. No se decide por país.
- Si el visitante ya eligió un idioma (selector, pie o aviso), se guarda en `localStorage` (`4w-idioma`) y en sus siguientes visitas se le lleva a esa versión.
- Si no ha elegido y el primer idioma de su navegador es el de la otra versión, aparece en la portada un aviso para cambiar; no se cambia de página por su cuenta (Google no recomienda redirigir por idioma o ubicación). El aviso aparece una vez por visita y se quita si el visitante baja sin contestar.
- El aviso de privacidad (sección 9) menciona que se guarda el idioma elegido.

**Etiquetas para buscadores** (en el `<head>` de las dos páginas, con la dirección oficial sin `www`): `canonical` apunta a la propia página (`https://4wardcorp.com/` o `https://4wardcorp.com/en/`) y las tres `alternate` son iguales en ambas:

```html
<link rel="alternate" hreflang="es" href="https://4wardcorp.com/">
<link rel="alternate" hreflang="en" href="https://4wardcorp.com/en/">
<link rel="alternate" hreflang="x-default" href="https://4wardcorp.com/">
```

Si cambia el dominio, cambiar estas etiquetas en las dos páginas y la regla de `www` de `.htaccess` (§14).
