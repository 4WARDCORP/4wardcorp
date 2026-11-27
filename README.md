# 4ward Solutions — sitio web corporativo

Sitio de una sola página de **4Ward Solutions, S.A. de C.V.**, en español y en inglés. Es HTML, CSS y JavaScript sin dependencias, más un script PHP para el formulario de contacto.

> **Formulario:** solo envía correos desde Hostinger (PHP). Sin PHP (en local con `http.server` o en GitHub Pages) abre el correo del visitante con el mensaje ya escrito.

| | |
|---|---|
| **Versión** | `20261127b` (ver [CAMBIOS.md](CAMBIOS.md)) |
| **Sitio publicado** | Hostinger → <https://4wardcorp.com> (desde `20261126c`; `www.` redirige a la dirección sin `www`) |
| **Repositorio** | Código fuente, historial y documentación. `main` = lo publicado en Hostinger. GitHub Pages (<https://4wardcorp.github.io/4wardcorp/>) fue la publicación temporal y se apaga cuando el dominio está verificado |
| **Documentación técnica** | [DOCUMENTACION.md](DOCUMENTACION.md) |
| **Idiomas** | Español de México (`index.html`) e inglés de EE. UU. (`en/index.html`), con selector ES / EN (DOCUMENTACION.md §15) |

---

## 1. Estructura del repositorio

```
.
├── index.html                 Página única: portada, 6 secciones, pie, formulario
├── styles.css                 Todos los estilos (sin preprocesador)
├── script.js                  Escenas, menú, regreso al inicio y formulario
├── enviar.php                 Recibe el formulario y lo envía por correo (solo en Hostinger)
├── aviso-de-privacidad.html   Aviso de privacidad integral (estilos propios dentro del archivo)
├── en/
│   ├── index.html             Versión en inglés: copia de index.html con los textos en inglés (DOCUMENTACION.md §15)
│   └── privacy-notice.html    Resumen en inglés del aviso; el válido es el español
├── img/                       Imágenes del sitio (ver DOCUMENTACION.md §9)
├── fonts/                     Tipografía Space Grotesk y su licencia (DOCUMENTACION.md §14)
├── .htaccess                  Seguridad del servidor en Hostinger (DOCUMENTACION.md §14)
├── _config.yml                Excluye la documentación de GitHub Pages (no afecta al sitio)
├── .editorconfig              Formato de los archivos (sangría, codificación, fin de línea)
├── .gitignore                 Archivos que nunca se suben (sistema, configuraciones privadas)
├── README.md                  Este archivo
├── DOCUMENTACION.md           Referencia técnica: arquitectura, diccionario, cómo hacer cambios
└── CAMBIOS.md                 Historial de versiones
```

No hay proceso de compilación, gestor de paquetes ni base de datos: lo que está en el repositorio es lo que se publica.

## 2. Probar en local

```bash
# Sitio (sin formulario real)
python3 -m http.server 8765
# Abrir http://localhost:8765 (español) y http://localhost:8765/en/ (inglés)

# Formulario con PHP, sin mandar correos (cada correo se guarda en /tmp/correos/)
mkdir -p /tmp/correos && printf '#!/bin/sh\ncat > /tmp/correos/$(date +%%s%%N).eml\n' > /tmp/guardar-correo.sh && chmod +x /tmp/guardar-correo.sh
php -d "sendmail_path=/tmp/guardar-correo.sh" -S localhost:8767
# Abrir http://localhost:8767
```

- Sin PHP (o en GitHub Pages) el formulario no falla: abre el correo del visitante con el mensaje ya escrito (ver DOCUMENTACION.md §8).
- La tipografía **Space Grotesk** está en `fonts/`: el sitio se ve igual sin internet.
- El formulario limita los envíos por conexión: para repetir pruebas, borrar la carpeta `formulario-limites/` que se crea junto a la del repositorio.

**Pantallas mínimas que se revisan en cada cambio** (todo cambio aplica a escritorio **y** celular):

| Tipo | Tamaños (ancho × alto) |
|---|---|
| Escritorio | 1440×900, 1920×1080, 1536×864, 1366×768, 1280×720, 1462×663 y **1280×580** (laptop con la escala de Windows al 150 %: el área útil en CSS es mucho menor que la resolución) |
| Celular | 375×667, 390×844, 428×926, 430×932 |
| Tableta | 768×954, 1024×698, 820×1180, 1180×820 |
| Celular horizontal | 844×390, 915×412 (se dibuja como laptop de 1280 px, ver DOCUMENTACION §4) |
| Navegadores reales | Chrome en iPhone y Mac, **Edge en Windows (el más propenso a fallar)**, Firefox en Linux |

El detalle de cómo probar está en DOCUMENTACION.md §11.

## 3. Publicar un cambio

**Los cambios se hacen solo en este repositorio, nunca editando archivos directamente en Hostinger:** si se edita allá, la siguiente subida borra ese cambio. Se publica subiendo a Hostinger los archivos del sitio desde `main` (§5).

1. **Respaldo.** Antes de un cambio grande o riesgoso, crear una rama `respaldo-AAAAMMDD<letra>` desde `main`.
2. **Versión.** Si cambió `styles.css` o `script.js`, subir la versión en **los dos** enlaces de `index.html` **y** de `en/index.html`:
   `styles.css?v=AAAAMMDD<letra>` y `script.js?v=AAAAMMDD<letra>`. La letra cuenta las publicaciones del día (`a`, `b`, `c`…). Sin este paso, los navegadores siguen usando el archivo anterior durante unos 10 minutos.
3. **Las dos páginas.** Todo cambio de estructura o de diseño en `index.html` se repite en `en/index.html`, y todo texto nuevo lleva su versión en inglés (DOCUMENTACION.md §15).
4. **Documentación.** Registrar el cambio en `CAMBIOS.md` y actualizar `DOCUMENTACION.md` si cambió algo que ahí se describe. Va **en el mismo commit** que el cambio.
5. **Commit y push** a `main`. El mensaje del commit va en español y dice qué cambió y dónde.
6. **Subir a Hostinger** (§5) y **borrar la caché** del CDN en hPanel.
7. **Verificar** en línea con `?v=<versión>` al final de la dirección, en celular y en escritorio, en español y en inglés.

Ramas de respaldo existentes: `respaldo-original` (sitio original), `respaldo-20261124b` (estado anterior a la medida `--vh`), `respaldo-20261125a` (antes de la limpieza del código) y `respaldo-20261125c` (antes de la revisión de seguridad) y una por publicación desde entonces (la más reciente, `respaldo-20261126b`, antes de la versión en inglés).

## 4. Reglas que no se deben romper

1. **No usar `vh` directo.** Toda altura de pantalla se escribe como `calc(var(--vh) * N)` (DOCUMENTACION.md §4). Con `vh`, el contenido queda bajo la barra del navegador en iPhone.
2. **En JavaScript, el alto de pantalla es `screenH()` / `sceneStep()`**, nunca `window.innerHeight`.
3. **Una escena = un `.snap-point` = un `.seq-bg` = un `.text-slider-item`**, y la altura de la sección se ajusta en CSS. Si una cuenta no coincide, las escenas se desfasan (DOCUMENTACION.md §3.4).
4. **Los cambios entre pantallas se hacen con escenas fijas** (fundido de fondo y texto que sube), no con desplazamiento libre. Es un lineamiento de diseño del sitio.
5. **El repositorio es público: nunca subir contraseñas, tokens ni datos privados.** Si un día se necesita SMTP, la configuración va en un archivo fuera del repo (ya está previsto en `.gitignore`).
6. **No borrar imágenes de `img/`** sin confirmación del responsable del sitio.

## 5. Despliegue en Hostinger

Plan de hosting compartido (Apache/LiteSpeed con PHP), sitio de tipo PHP/HTML. Todo va dentro de la carpeta **`public_html`** del sitio; el archivo `DO_NOT_UPLOAD_HERE` que Hostinger pone un nivel arriba no se toca. El SSL y el CDN se activan desde hPanel.

1. **Armar el paquete** desde `main`, solo con los archivos del sitio:
   ```bash
   zip -r sitio-<versión>.zip index.html styles.css script.js enviar.php aviso-de-privacidad.html .htaccess en img fonts
   ```
   **No subir** los `.md`, `_config.yml`, `.editorconfig` ni `.gitignore`.
2. **Subir** en hPanel → sitio → **Administrador de archivos** → `public_html` → **Subir** el ZIP → **Extraer** ahí mismo (reemplazando los archivos existentes) → borrar el ZIP del servidor.
3. **Borrar caché** en el panel del sitio (el CDN puede servir la versión anterior unos minutos).
4. **Revisar:** las dos versiones de idioma, el formulario con un correo real (que no llegue a spam), los encabezados de seguridad, `README.md` con 403 y la redirección de `www` (DOCUMENTACION.md §14).

La primera subida (`20261126c`) reemplaza la página provisional "Próximamente" de Hostinger.
- Las tareas abiertas de la migración están en DOCUMENTACION.md §12.

## 6. Propiedad

© 2026 4Ward Solutions, S.A. de C.V. Todos los derechos reservados. El repositorio no tiene licencia de uso: que sea público no autoriza copiar ni reutilizar el código, los textos o las imágenes. Excepción: la tipografía de `fonts/` es de sus autores y se distribuye con su propia licencia (`fonts/OFL.txt`).
Contacto técnico y comercial: rvertti@4wardcorp.com.
