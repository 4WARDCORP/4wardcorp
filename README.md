# 4ward Solutions — sitio web corporativo

Sitio de una sola página de **4Ward Solutions, S.A. de C.V.** Es HTML, CSS y JavaScript sin dependencias, más un script PHP para el formulario de contacto.

| | |
|---|---|
| **Versión** | `20261125c` (ver [CAMBIOS.md](CAMBIOS.md)) |
| **Publicación actual** | GitHub Pages, rama `main` → <https://4wardcorp.github.io/4wardcorp/> (temporal) |
| **Destino final** | Hostinger, con el dominio propio `4wardcorp.com` |
| **Documentación técnica** | [DOCUMENTACION.md](DOCUMENTACION.md) |
| **Idioma del sitio** | Español (México). La versión en inglés está planeada, no iniciada. |

---

## 1. Estructura del repositorio

```
.
├── index.html                 Página única: portada, 6 secciones, pie, formulario
├── styles.css                 Todos los estilos (sin preprocesador)
├── script.js                  Escenas, menú, regreso al inicio y formulario
├── enviar.php                 Recibe el formulario y lo envía por correo (solo en Hostinger)
├── aviso-de-privacidad.html   Aviso de privacidad integral (estilos propios dentro del archivo)
├── img/                       Imágenes del sitio (ver DOCUMENTACION.md §9)
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
# Abrir http://localhost:8765

# Formulario con PHP, sin mandar correos (el correo se guarda en /tmp/correo.txt)
php -d "sendmail_path=sh -c 'cat > /tmp/correo.txt' sh" -S localhost:8767
# Abrir http://localhost:8767
```

- Sin PHP (o en GitHub Pages) el formulario no falla: abre el correo del visitante con el mensaje ya escrito (ver DOCUMENTACION.md §8).
- La tipografía **Space Grotesk** se descarga de Google Fonts. Sin internet se usa una letra de respaldo y los textos cambian de ancho, así que **no midas el diseño sin conexión**.

**Pantallas mínimas que se revisan en cada cambio** (todo cambio aplica a escritorio **y** celular):

| Tipo | Tamaños (ancho × alto) |
|---|---|
| Escritorio | 1440×900, 1920×1080, 1536×864, 1366×768, 1280×720, 1462×663 y **1280×580** (laptop con la escala de Windows al 150 %: el área útil en CSS es mucho menor que la resolución) |
| Celular | 375×667, 390×844, 428×926, 430×932 |
| Tableta | 768×954, 1024×698 |
| Navegadores reales | Chrome en iPhone y Mac, **Edge en Windows (el más propenso a fallar)**, Firefox en Linux |

El detalle de cómo probar está en DOCUMENTACION.md §11.

## 3. Publicar un cambio

Se publica con un push a `main`; GitHub Pages actualiza el sitio en 2 a 5 minutos.

1. **Respaldo.** Antes de un cambio grande o riesgoso, crear una rama `respaldo-AAAAMMDD<letra>` desde `main`.
2. **Versión.** Si cambió `styles.css` o `script.js`, subir la versión en **los dos** enlaces de `index.html`:
   `styles.css?v=AAAAMMDD<letra>` y `script.js?v=AAAAMMDD<letra>`. La letra cuenta las publicaciones del día (`a`, `b`, `c`…). Sin este paso, los navegadores siguen usando el archivo anterior durante unos 10 minutos.
3. **Documentación.** Registrar el cambio en `CAMBIOS.md` y actualizar `DOCUMENTACION.md` si cambió algo que ahí se describe. Va **en el mismo commit** que el cambio.
4. **Commit y push** a `main`. El mensaje del commit va en español y dice qué cambió y dónde.
5. **Verificar** en línea con `?v=<versión>` al final de la dirección, en celular y en escritorio.

Ramas de respaldo existentes: `respaldo-original` (sitio original) y `respaldo-20261124b` (estado anterior a la medida `--vh`).

## 4. Reglas que no se deben romper

1. **No usar `vh` directo.** Toda altura de pantalla se escribe como `calc(var(--vh) * N)` (DOCUMENTACION.md §4). Con `vh`, el contenido queda bajo la barra del navegador en iPhone.
2. **En JavaScript, el alto de pantalla es `screenH()` / `sceneStep()`**, nunca `window.innerHeight`.
3. **Una escena = un `.snap-point` = un `.seq-bg` = un `.text-slider-item`**, y la altura de la sección se ajusta en CSS. Si una cuenta no coincide, las escenas se desfasan (DOCUMENTACION.md §3.4).
4. **Los cambios entre pantallas se hacen con escenas fijas** (fundido de fondo y texto que sube), no con desplazamiento libre. Es un lineamiento de diseño del sitio.
5. **El repositorio es público: nunca subir contraseñas, tokens ni datos privados.** Si un día se necesita SMTP, la configuración va en un archivo fuera del repo (ya está previsto en `.gitignore`).
6. **No borrar imágenes de `img/`** sin confirmación del responsable del sitio.

## 5. Despliegue en Hostinger (pendiente)

Todavía no se hace. Cuando se haga:

- Subir solo: `index.html`, `styles.css`, `script.js`, `enviar.php`, `aviso-de-privacidad.html` e `img/`. **No subir** los `.md`, `_config.yml`, `.editorconfig` ni `.gitignore`.
- Probar `enviar.php` con un correo real y revisar que no llegue a spam.
- Las tareas abiertas de la migración están en DOCUMENTACION.md §12.

## 6. Propiedad

© 2026 4Ward Solutions, S.A. de C.V. Todos los derechos reservados. El repositorio no tiene licencia de uso: que sea público no autoriza copiar ni reutilizar el código, los textos o las imágenes.
Contacto técnico y comercial: rvertti@4wardcorp.com.
