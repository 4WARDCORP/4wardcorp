/* ==========================================================================
   4ward Solutions — script.js
   Comportamiento del sitio. Sin dependencias. Referencia completa: DOCUMENTACION.md (§3, §5, §7, §8).

   ÍNDICE
   1. Pantalla de carga
   2. Portada: slider de fotos y título que se desvanece
   3. Medidas de pantalla (screenH / sceneStep)
   4. Motores de escenas fijas
      4.1 makeSpotSequence  — puntos sobre imagen (Operaciones, Ecosistema)
      4.2 makeSimpleSequence — fondos con fundido (Crecimiento)
      4.3 Escenas de Dilema, IA y Experiencia (en el scroll)
   5. Menú: estados al hacer scroll
   6. Regresar al inicio y saltar a una sección con fundido (logo, menú y botón ↑)
   7. Enlaces del menú (usan el salto con fundido del §6)
   8. Formulario de contacto (función independiente)
   9. Idioma: selector ES / EN, preferencia guardada y aviso "View this site in English?" (al final del archivo)

   REGLAS
   - El alto de una pantalla se mide con screenH() / sceneStep(), nunca con window.innerHeight.
   - Las animaciones usan translateY(calc(var(--vh) * -N00)) para coincidir con el CSS.
   - "Celular" = window.innerWidth <= 768 (mismo umbral que el CSS).
   - El mismo archivo sirve a index.html (español) y en/index.html (inglés): el idioma se lee de <html lang>.
   ========================================================================== */

const LANG = document.documentElement.lang === 'en' ? 'en' : 'es';

document.addEventListener('DOMContentLoaded', () => {

    /* ----------------------------------------------------------------------
       1. PANTALLA DE CARGA
       Los 4 cuadros negros se abren 300 ms después de que carga todo (clase .loaded).
       ---------------------------------------------------------------------- */
    window.addEventListener('load', () => {
        setTimeout(() => {
            document.getElementById('preloader').classList.add('loaded');
        }, 300);
    });

    /* ----------------------------------------------------------------------
       2. PORTADA
       Slider: cambia la foto activa cada 4.5 s (fundido en CSS: .slide.active).
       El título #hero-title sube y se desvanece en el scroll (ver sección 4.3).
       ---------------------------------------------------------------------- */
    const slides = document.querySelectorAll('.slide');
    if (slides.length > 0) {
        let currentSlide = 0;
        setInterval(() => {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        }, 4500);
    }

    const heroTitle = document.getElementById('hero-title');

    /* ----------------------------------------------------------------------
       3. MEDIDAS DE PANTALLA
       Alto de una escena = alto real de un .snap-point (calc(var(--vh) * 100) en el CSS).
       No usar window.innerHeight: en iPhone, con la barra del navegador a la vista, es menor
       que el alto de una escena y el error se acumula escena por escena.
       ---------------------------------------------------------------------- */
    function screenH() {
        const sp = document.querySelector('.snap-point');
        const h = sp ? sp.getBoundingClientRect().height : 0;
        return h > 0 ? h : window.innerHeight;
    }
    function sceneStep(section) {
        const sp = section.querySelector('.snap-point');
        const h = sp ? sp.getBoundingClientRect().height : 0;
        return h > 0 ? h : window.innerHeight;
    }

    /* Pantallas táctiles: 250 ms después del último movimiento se considera que la pantalla quedó quieta y se
       vuelve a calcular la escena de cada sección (respaldo por si el navegador no termina exactamente en un freno). */
    const TACTIL = window.matchMedia('(pointer: coarse)').matches;
    const PANTALLA_QUIETA = 250;
    let pantallaQuieta = false, tiempoQuieta = 0, dedosAbajo = 0;
    if (TACTIL) {
        const esperarQuieta = () => {
            clearTimeout(tiempoQuieta);
            tiempoQuieta = setTimeout(() => {
                if (dedosAbajo > 0) return;           // con el dedo en la pantalla no se cambia de escena
                pantallaQuieta = true;
                window.dispatchEvent(new Event('scroll'));
                pantallaQuieta = false;
            }, PANTALLA_QUIETA);
        };
        window.addEventListener('scroll', () => { if (!pantallaQuieta) esperarQuieta(); }, { passive: true });
        window.addEventListener('touchstart', e => { dedosAbajo = e.touches.length; }, { passive: true });
        const soltar = e => { dedosAbajo = e.touches.length; if (!dedosAbajo) esperarQuieta(); };
        window.addEventListener('touchend', soltar, { passive: true });
        window.addEventListener('touchcancel', soltar, { passive: true });
    }

    /* Escena que debe mostrar una sección según dónde está:
       - cubre la pantalla → la escena que marca el scroll;
       - ya quedó arriba (se pasó hacia abajo) → su última escena;
       - todavía está abajo (no se ha llegado) → la escena 0;
       - entra o sale (cubre solo una parte) → null: no se cambia a medio camino.
       Así, al regresar hacia arriba (o después de un salto del menú) cada sección ya espera en la escena
       correcta y no "rebobina" sus escenas al aparecer. */
    function escenaDe(section, rect, alto, ultima) {
        if (rect.top <= 2 && rect.bottom >= alto - 2) {
            const paso = sceneStep(section), pos = Math.max(0, -rect.top), k = Math.round(pos / paso);
            // Pantallas táctiles: la escena cambia solo cuando la pantalla queda quieta en su freno (o deja de
            // moverse, ver PANTALLA_QUIETA). Mientras el dedo arrastra a medio camino no cambia: si el navegador
            // regresa a la escena donde estaba, el contenido no "parpadea" ni "rebobina".
            if (TACTIL && !pantallaQuieta && Math.abs(pos - k * paso) > 3) return null;
            return Math.min(ultima, k);
        }
        if (rect.bottom <= 0) return ultima;
        if (rect.top >= alto) return 0;
        return null;
    }
    // Mueve el contenido a su escena; fuera de pantalla, sin animación (para que no se vea un rebobinado)
    function moverTrack(track, index, fuera) {
        if (!track) return;
        if (fuera) track.style.transition = 'none';
        track.style.transform = `translateY(calc(var(--vh) * -${index * 100}))`;
        if (fuera) { void track.offsetHeight; track.style.transition = ''; }
    }

    /* ----------------------------------------------------------------------
       4.1 ESCENAS CON PUNTOS SOBRE UNA IMAGEN (Operaciones y Ecosistema)
       Escena 0: título sobre blanco. Escenas 1+: se enciende el punto de esa escena (.is-on),
       su tarjeta y su línea; los anteriores quedan visibles con su nombre (.is-seen).
       Atributos del HTML: data-scene (escena), data-x/data-y (escritorio), data-xv/data-yv (celular),
       data-for (tarjeta ↔ puntos) y data-from (línea → #spot-<id>).
       Devuelve onScroll(alto) para llamarla desde el scroll.
       ---------------------------------------------------------------------- */
    function makeSpotSequence(section, track) {
        const stage = section.querySelector('.op-stage');
        const bgs = section.querySelectorAll(':scope > .sticky-container > .seq-bg');
        const spots = section.querySelectorAll('.op-spot');
        const cards = section.querySelectorAll('.eco-card');
        const svg = section.querySelector('.eco-lines');
        const lines = svg ? svg.querySelectorAll('line') : [];
        const routes = section.querySelector('.op-routes');
        const hub = section.querySelector('.op-hub');
        const count = section.querySelectorAll('.snap-point').length;
        let current = -1;

        // Operaciones: una ruta recta de Centro (.op-hub) a cada región, con 2 puntos de luz que la recorren.
        // Cada ruta es una barra girada; los puntos usan la misma animación flowX del diagrama de IA.
        function drawRoutes() {
            if (!routes || !hub || !stage) return;
            // Tamaño de diseño del lienzo (offsetWidth/Height), no el visible: en celular el lienzo puede estar
            // reducido con scale() y las rutas viven dentro de él, así que ya se reducen junto con la imagen.
            const sr = { width: stage.offsetWidth, height: stage.offsetHeight };
            const pos = el => [parseFloat(el.style.left) / 100 * sr.width, parseFloat(el.style.top) / 100 * sr.height];
            const [hx, hy] = pos(hub);
            routes.innerHTML = '';
            spots.forEach(spot => {
                if (spot === hub) return;
                const [x, y] = pos(spot);
                const len = Math.hypot(x - hx, y - hy);
                const route = document.createElement('span');
                route.className = 'op-route';
                route.style.left = hx + 'px';
                route.style.top = hy + 'px';
                route.style.width = len + 'px';
                route.style.transform = `rotate(${Math.atan2(y - hy, x - hx)}rad)`;
                // Misma velocidad en todas las rutas (~170 px/s), sin bajar de 1.6 s
                route.style.setProperty('--dur', Math.max(1.6, len / 170).toFixed(2) + 's');
                route.innerHTML = '<i></i><i></i>';
                routes.appendChild(route);
            });
        }

        // Une cada tarjeta con su punto: la línea sale del borde de la tarjeta más cercano al punto
        function drawLines() {
            if (!svg || !stage) return;
            const sr = { width: stage.offsetWidth, height: stage.offsetHeight };   // tamaño de diseño (ver drawRoutes)
            svg.setAttribute('viewBox', `0 0 ${sr.width} ${sr.height}`);
            lines.forEach(line => {
                const spot = section.querySelector('#spot-' + line.dataset.from);
                const card = Array.from(cards).find(c => c.dataset.for.split(' ').includes(line.dataset.from));
                if (!spot || !card) return;
                const px = parseFloat(spot.style.left) / 100 * sr.width;
                const py = parseFloat(spot.style.top) / 100 * sr.height;
                const cl = card.offsetLeft, ct = card.offsetTop, cw = card.offsetWidth, ch = card.offsetHeight;
                const cx = Math.min(Math.max(px, cl), cl + cw);
                const cy = Math.min(Math.max(py, ct), ct + ch);
                line.setAttribute('x1', cx); line.setAttribute('y1', cy);
                line.setAttribute('x2', px); line.setAttribute('y2', py);
            });
        }

        // Celular: acomoda la imagen y la lista (.op-list) como un solo bloque centrado bajo el menú.
        // data-contenido="arriba abajo" del lienzo dice qué parte de la imagen vertical tiene contenido
        // (fracciones del alto); el resto es fondo negro. Escribe --map-shift (cuánto se mueve el lienzo),
        // --map-scale (reducción si no cabe) y --cap-pad (espacio bajo la lista), que solo usa el CSS de celular.
        const list = section.querySelector('.op-list');
        function fitMobile() {
            if (!stage || !list || !stage.dataset.contenido) return;
            if (window.innerWidth > 768) {
                ['--map-shift', '--map-scale', '--cap-pad'].forEach(v => section.style.removeProperty(v));
                return;
            }
            const [fTop, fBottom] = stage.dataset.contenido.split(' ').map(Number);
            const h = screenH();
            const stageH = stage.offsetHeight;
            const stageTop = (h - stageH) / 2;              // el lienzo está centrado en la pantalla
            const menu = 84, margen = 24, espacio = 18;     // alto del menú, margen inferior y separación imagen–lista
            // Si no cabe todo, la imagen se reduce (--map-scale, desde su borde superior) lo justo para que quepa
            const disponible = h - menu - margen - espacio - list.offsetHeight;
            // Ecosistema: tope de 0.93 para que las etiquetas de las orillas (Vista Alegre, Entelar) no se salgan
            // de la pantalla cuando la lista es corta (en inglés, a 360 px, la maqueta crecía al 100 %)
            const tope = section.id === 'ecosistema' ? 0.93 : 1;
            const escala = Math.max(0.6, Math.min(tope, disponible / ((fBottom - fTop) * stageH)));
            const contenido = (fBottom - fTop) * stageH * escala;
            const bloque = contenido + espacio + list.offsetHeight;
            const libre = h - menu - margen - bloque;
            const inicio = menu + Math.max(0, libre / 2);
            section.style.setProperty('--map-scale', escala.toFixed(3));
            section.style.setProperty('--map-shift', (inicio - (stageTop + fTop * stageH * escala)) + 'px');
            section.style.setProperty('--cap-pad', Math.max(margen, h - (inicio + bloque)) + 'px');
        }

        // Coloca los puntos según la imagen visible (horizontal en escritorio, vertical en celular)
        function place() {
            const vertical = window.innerWidth <= 768;
            spots.forEach(spot => {
                spot.style.left = (vertical ? spot.dataset.xv : spot.dataset.x) + '%';
                spot.style.top = (vertical ? spot.dataset.yv : spot.dataset.y) + '%';
            });
            drawLines();
            drawRoutes();
            fitMobile();
            if (current >= 0) { const c = current; current = -1; setScene(c); }
        }

        function setScene(index, fuera) {
            if (index === current) return;
            current = index;
            section.dataset.scene = index;
            moverTrack(track, index, fuera);
            // Solo 2 fondos: 0 = blanco (título), 1 = imagen (todas las demás escenas)
            bgs.forEach((bg, idx) => bg.classList.toggle('active', idx === Math.min(index, 1)));
            let focus = null;
            section.querySelectorAll('.op-spot, .eco-card, .eco-lines line').forEach(el => {
                const n = Number(el.dataset.scene);
                el.classList.toggle('is-on', n === index);
                el.classList.toggle('is-seen', n < index);
                if (n === index && !focus && el.classList.contains('op-spot')) focus = el;
            });
            // El foco de luz (.op-shade) se centra en el punto activo
            if (stage && focus) {
                stage.style.setProperty('--fx', focus.style.left);
                stage.style.setProperty('--fy', focus.style.top);
            }
        }

        place();
        window.addEventListener('resize', place);
        window.addEventListener('load', () => { drawLines(); drawRoutes(); fitMobile(); });
        if (document.fonts) document.fonts.ready.then(fitMobile);   // la lista cambia de alto cuando carga la letra

        return function onScroll(windowHeight) {
            const rect = section.getBoundingClientRect();
            // Al pasar el final de la sección (sube el pie de página), los textos se desvanecen
            section.classList.toggle('is-past', rect.bottom < windowHeight - 2);
            // Una escena por pantalla, alineada con los .snap-point (tolerancia de 2 px por decimales)
            const index = escenaDe(section, rect, windowHeight, count - 1);
            if (index !== null) setScene(index, rect.bottom <= 0 || rect.top >= windowHeight);
        };
    }

    /* ----------------------------------------------------------------------
       4.2 ESCENAS SIMPLES (Crecimiento)
       Un fondo por escena con fundido y contenido que sube una pantalla por escena.
       Escribe data-scene en la sección (el CSS lo usa para la entrada de las tarjetas).
       ---------------------------------------------------------------------- */
    function makeSimpleSequence(section, track) {
        const bgs = section.querySelectorAll(':scope > .sticky-container > .seq-bg');
        const count = section.querySelectorAll('.snap-point').length;
        let current = -1;
        return function onScroll(windowHeight) {
            const rect = section.getBoundingClientRect();
            const index = escenaDe(section, rect, windowHeight, count - 1);
            if (index === null || index === current) return;
            current = index;
            section.dataset.scene = index;
            moverTrack(track, index, rect.bottom <= 0 || rect.top >= windowHeight);
            bgs.forEach((bg, idx) => bg.classList.toggle('active', idx === index));
        };
    }

    /* ----------------------------------------------------------------------
       4.3 ESCENAS EN EL SCROLL
       Orden de cálculo = orden de la página. Dilema, IA y Experiencia usan la lógica en línea:
       escena = Math.round(-rect.top / alto de escena), limitada a la última.
       ---------------------------------------------------------------------- */
    const sequenceSectionDilema = document.getElementById('dilema');
    const dilemaTrack = document.getElementById('dilema-text-track');
    const dilemaBgs = sequenceSectionDilema ? sequenceSectionDilema.querySelectorAll('.seq-bg') : [];

    const sequenceSectionOperaciones = document.getElementById('operaciones');
    const operacionesTrack = document.getElementById('operaciones-text-track');

    const sequenceSectionCrecimiento = document.getElementById('crecimiento');

    const sequenceSectionIA = document.getElementById('ia');
    const iaTrack = document.getElementById('ia-text-track');
    const iaBgs = sequenceSectionIA ? sequenceSectionIA.querySelectorAll('.seq-bg') : [];

    // Experiencia (el id del track conserva el nombre anterior de la sección: "pilares")
    const sequenceSectionPilares = document.getElementById('experiencia');
    const pilaresTrack = document.getElementById('pilares-text-track');
    const pilaresBgs = sequenceSectionPilares ? sequenceSectionPilares.querySelectorAll('.pilares-mobile-view .seq-bg') : [];
    const pilaresDesktopCards = document.querySelectorAll('.pilares-desktop-view .quadrant-card');
    const PILARES_ULTIMA_ESCENA = 4; // escena 0 = título; 1–4 = un sector cada una

    const sequenceSectionEcosistema = document.getElementById('ecosistema');
    const ecosistemaTrack = document.getElementById('ecosistema-text-track');

    const crecimientoScroll = sequenceSectionCrecimiento
        ? makeSimpleSequence(sequenceSectionCrecimiento, document.getElementById('crecimiento-text-track')) : null;
    const operacionesScroll = sequenceSectionOperaciones ? makeSpotSequence(sequenceSectionOperaciones, operacionesTrack) : null;
    const ecosistemaScroll = sequenceSectionEcosistema ? makeSpotSequence(sequenceSectionEcosistema, ecosistemaTrack) : null;

    let escenaDilema = -1, escenaIA = -1, escenaPilares = -1;   // última escena aplicada a cada sección
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        const windowHeight = screenH();

        // Portada: el título sube más rápido que el scroll y se desvanece a media pantalla
        if (heroTitle && currentScrollY < windowHeight) {
            heroTitle.style.transform = `translateY(-${currentScrollY * 0.8}px)`;
            heroTitle.style.opacity = 1 - (currentScrollY / (windowHeight * 0.5));
        }

        if (sequenceSectionDilema) {
            const rect = sequenceSectionDilema.getBoundingClientRect();
            const activeIndex = escenaDe(sequenceSectionDilema, rect, windowHeight, dilemaBgs.length - 1);
            if (activeIndex !== null && activeIndex !== escenaDilema) {
                escenaDilema = activeIndex;
                moverTrack(dilemaTrack, activeIndex, rect.bottom <= 0 || rect.top >= windowHeight);
                dilemaBgs.forEach((bg, idx) => bg.classList.toggle('active', idx === activeIndex));
            }
        }

        if (operacionesScroll) operacionesScroll(windowHeight);
        if (crecimientoScroll) crecimientoScroll(windowHeight);

        if (sequenceSectionIA) {
            const rect = sequenceSectionIA.getBoundingClientRect();
            const activeIndex = escenaDe(sequenceSectionIA, rect, windowHeight, iaBgs.length - 1);
            if (activeIndex !== null && activeIndex !== escenaIA) {
                escenaIA = activeIndex;
                moverTrack(iaTrack, activeIndex, rect.bottom <= 0 || rect.top >= windowHeight);
                iaBgs.forEach((bg, idx) => bg.classList.toggle('active', idx === activeIndex));
                sequenceSectionIA.dataset.scene = activeIndex;   // el CSS enciende las tarjetas de los frentes en la escena 3
            }
        }

        if (sequenceSectionPilares) {
            const rect = sequenceSectionPilares.getBoundingClientRect();
            const activeIndex = escenaDe(sequenceSectionPilares, rect, windowHeight, PILARES_ULTIMA_ESCENA);
            if (activeIndex !== null && activeIndex !== escenaPilares) {
                escenaPilares = activeIndex;
                moverTrack(pilaresTrack, activeIndex, rect.bottom <= 0 || rect.top >= windowHeight);
                // Celular: un fondo por escena. Escritorio: los cuadros entran uno por escena y se quedan.
                pilaresBgs.forEach((bg, idx) => bg.classList.toggle('active', idx === activeIndex));
                pilaresDesktopCards.forEach((card, index) => card.classList.toggle('is-in', activeIndex >= index + 1));
            }
        }

        if (ecosistemaScroll) ecosistemaScroll(windowHeight);
    });

    /* ----------------------------------------------------------------------
       5. MENÚ: ESTADOS AL HACER SCROLL (#morph-nav)
       .is-scrolled  → píldora arriba (scrollY > 50).
       .is-shrunk    → píldora mínima. Celular: siempre fuera de la portada.
                       Escritorio: solo mientras se desplaza después de la portada (se quita 400 ms después).
       ---------------------------------------------------------------------- */
    const morphNav = document.getElementById('morph-nav');
    const brandLogoWrapper = document.querySelector('.brand-logo-wrapper');
    let isScrollingTimeout;

    window.addEventListener('scroll', () => {
        const heroHeight = screenH();
        const isMobile = window.innerWidth <= 768;

        if (window.scrollY > 50) {
            morphNav.classList.add('is-scrolled');
            if (isMobile) {
                morphNav.classList.add('is-shrunk');
            } else {
                if (window.scrollY > heroHeight - 150) {
                    morphNav.classList.add('is-shrunk');
                    clearTimeout(isScrollingTimeout);
                    isScrollingTimeout = setTimeout(() => {
                        morphNav.classList.remove('is-shrunk');
                    }, 400);
                } else {
                    morphNav.classList.remove('is-shrunk');
                }
            }
        } else {
            morphNav.classList.remove('is-scrolled');
            morphNav.classList.remove('is-shrunk');
            morphNav.classList.remove('mobile-menu-open');
        }
    });

    /* ----------------------------------------------------------------------
       6. REGRESAR AL INICIO Y SALTAR A UNA SECCIÓN
       saltarA(top): fundido a negro (.fundido-inicio, 0.35 s), salto directo (sin recorrer las escenas
       intermedias) y fundido de regreso. volverInicio() = saltarA(0).
       Se usa desde: logo (escritorio), "Inicio" y enlaces del menú (§7) y botón flotante ↑.
       ---------------------------------------------------------------------- */
    const fundido = document.querySelector('.fundido-inicio');
    let saltando = false;
    function saltarA(top) {
        morphNav.classList.remove('mobile-menu-open');
        if (!fundido) { window.scrollTo({ top, behavior: 'instant' }); return; }
        if (saltando) return;
        saltando = true;
        fundido.classList.add('is-on');
        setTimeout(() => {
            window.scrollTo({ top, behavior: 'instant' });
            setTimeout(() => { fundido.classList.remove('is-on'); saltando = false; }, 80);
        }, 380);
    }
    function volverInicio() { saltarA(0); }

    // Botón flotante ↑: visible después del 60 % de la portada
    const btnSubir = document.querySelector('.btn-subir');
    if (btnSubir) {
        btnSubir.addEventListener('click', volverInicio);
        const toggleSubir = () => btnSubir.classList.toggle('is-visible', window.scrollY > screenH() * 0.6);
        window.addEventListener('scroll', toggleSubir, { passive: true });
        toggleSubir();
    }

    // Logo (solo con el menú ya encogido): celular abre/cierra el menú; escritorio regresa a la portada
    if (brandLogoWrapper) {
        brandLogoWrapper.addEventListener('click', () => {
            const isMobile = window.innerWidth <= 768;
            if (!morphNav.classList.contains('is-scrolled')) return;
            if (isMobile) morphNav.classList.toggle('mobile-menu-open');
            else volverInicio();
        });
    }

    /* ----------------------------------------------------------------------
       7. ENLACES DEL MENÚ
       Fundido y salto directo (saltarA, §6) al inicio EXACTO de la sección (sin margen: con margen se asomaba
       la sección vecina en celular). Antes era un desplazamiento suave que recorría todas las escenas intermedias.
       #inicio usa volverInicio().
       Solo los enlaces a "#…": el de idioma (ES / EN) del menú del celular es un enlace normal a la otra página.
       ---------------------------------------------------------------------- */
    const menuLinks = document.querySelectorAll('.nav-links a[href^="#"], .mobile-menu-content a[href^="#"]');
    menuLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            if (targetId === 'inicio') { volverInicio(); return; }
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                saltarA(targetSection.getBoundingClientRect().top + window.pageYOffset);
            }
        });
    });
});

/* ==========================================================================
   8. FORMULARIO DE CONTACTO ("Platiquemos de tu proceso")
   Se abre con cualquier elemento .js-abrir-contacto.
   Envío: POST a enviar.php (solo funciona en un servidor con PHP, como Hostinger).
   Respaldo: si la respuesta no es JSON o falla la red (GitHub Pages no ejecuta PHP),
   abre el correo del visitante con los datos ya escritos (mailto:).
   DESTINO también aparece en enviar.php, index.html y el aviso de privacidad (DOCUMENTACION.md §8.1).
   ========================================================================== */
(function () {
    const modal = document.getElementById('contacto-modal');
    const form = document.getElementById('contacto-form');
    if (!modal || !form) return;
    const estado = form.querySelector('.cf-estado');
    const boton = form.querySelector('.cf-enviar');
    const DESTINO = 'rvertti@4wardcorp.com';
    // Mensajes en los dos idiomas (los de enviar.php llegan ya traducidos según el campo oculto "idioma")
    const T = LANG === 'en' ? {
        revisa: 'Please check the highlighted fields.',
        acepta: 'Please accept the privacy notice to send your message.',
        enviando: 'Sending…',
        correo: 'Your email app opened with the message ready — just hit send.',
        etiquetas: ['Name', 'Company', 'Email', 'Phone', 'Industry', 'Which process would I like to improve?']
    } : {
        revisa: 'Revisa los campos marcados.',
        acepta: 'Para enviar, acepta el aviso de privacidad.',
        enviando: 'Enviando…',
        correo: 'Se abrió tu correo con el mensaje listo; solo envíalo.',
        etiquetas: ['Nombre', 'Empresa', 'Correo', 'Teléfono', 'Sector', '¿Qué proceso quiero mejorar?']
    };
    let ultimoFoco = null;
    let abiertoEn = 0;   // performance.now() al abrir: mide el tiempo con el formulario abierto sin depender del reloj del equipo

    // Abre la ventana, empieza a medir el tiempo (filtro anti-robots de 3 s en enviar.php) y recuerda el foco
    function abrir(e) {
        if (e) e.preventDefault();
        ultimoFoco = document.activeElement;
        modal.hidden = false;
        document.documentElement.classList.add('contacto-abierto');
        abiertoEn = performance.now();
        requestAnimationFrame(() => modal.classList.add('is-open'));
        // En celular no se enfoca el primer campo para no abrir el teclado de golpe
        if (window.innerWidth > 768) setTimeout(() => form.elements.nombre.focus({ preventScroll: true }), 250);
    }
    function cerrar() {
        modal.classList.remove('is-open');
        document.documentElement.classList.remove('contacto-abierto');
        setTimeout(() => { modal.hidden = true; }, 300);
        if (ultimoFoco) ultimoFoco.focus({ preventScroll: true });
    }

    document.querySelectorAll('.js-abrir-contacto').forEach(b => b.addEventListener('click', abrir));
    modal.querySelectorAll('[data-cerrar]').forEach(b => b.addEventListener('click', cerrar));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) cerrar(); });

    // Obligatorios: nombre, empresa, correo (con formato) y proceso; además la casilla del aviso
    function validar() {
        let ok = true;
        ['nombre', 'empresa', 'correo', 'proceso'].forEach(n => {
            const el = form.elements[n];
            const malo = !el.value.trim() || (n === 'correo' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim()));
            el.classList.toggle('is-error', malo);
            if (malo) ok = false;
        });
        if (!ok) { estado.className = 'cf-estado'; estado.textContent = T.revisa; return false; }
        if (!form.elements.acepta.checked) { estado.className = 'cf-estado'; estado.textContent = T.acepta; return false; }
        return true;
    }

    function respaldoCorreo() {
        const f = form.elements;
        const e = T.etiquetas;
        const sector = f.sector.selectedIndex > 0 ? f.sector.options[f.sector.selectedIndex].text : '—';
        const cuerpo = e[0] + ': ' + f.nombre.value + '\n' + e[1] + ': ' + f.empresa.value + '\n' + e[2] + ': ' + f.correo.value +
            '\n' + e[3] + ': ' + (f.telefono.value || '—') + '\n' + e[4] + ': ' + sector +
            '\n\n' + e[5] + '\n' + f.proceso.value;
        const asunto = (LANG === 'en' ? 'Contacto web (EN) – ' : 'Contacto web – ') + f.empresa.value;
        window.location.href = 'mailto:' + DESTINO + '?subject=' + encodeURIComponent(asunto) + '&body=' + encodeURIComponent(cuerpo);
        estado.className = 'cf-estado is-ok';
        estado.textContent = T.correo;
    }

    form.addEventListener('input', e => {
        e.target.classList.remove('is-error');
        if (!estado.classList.contains('is-ok')) estado.textContent = '';
    });

    form.addEventListener('submit', async e => {
        e.preventDefault();
        if (!validar()) return;
        boton.disabled = true;
        estado.className = 'cf-estado';
        estado.textContent = T.enviando;
        form.elements.tiempo.value = Math.round(performance.now() - abiertoEn);
        try {
            const r = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { 'Accept': 'application/json' } });
            const tipo = r.headers.get('content-type') || '';
            if (!tipo.includes('application/json')) throw new Error('sin PHP');
            const datos = await r.json();
            if (datos.ok) {
                form.reset();
                estado.className = 'cf-estado is-ok';
                estado.textContent = datos.msg;
            } else {
                estado.textContent = datos.msg;
            }
        } catch (err) {
            respaldoCorreo();
        } finally {
            boton.disabled = false;
        }
    });
})();

/* ==========================================================================
   9. IDIOMA
   - Páginas: index.html (es) y en/index.html (en). Los enlaces [data-lang] llevan a la otra versión.
   - Preferencia: al elegir un idioma (selector, pie o aviso) se guarda en localStorage ("4w-idioma").
     Si el visitante ya eligió el otro idioma, al entrar se le lleva a esa versión (conserva el #ancla).
   - Aviso: si no ha elegido y el idioma principal de su navegador es el de la otra versión, aparece en la
     portada "View this site in English?" / "¿Ver este sitio en español?". No se cambia de página a la fuerza.
     Si baja sin contestar, el aviso se quita (sin guardar nada) para no tapar las escenas.
   - localStorage puede fallar (modo privado, bloqueos): todo va en try/catch y el sitio funciona igual.
   ========================================================================== */
(function () {
    const CLAVE = '4w-idioma';
    const OTRO = LANG === 'en' ? 'es' : 'en';
    const enlaceOtro = document.querySelector('[data-lang="' + OTRO + '"]');
    if (!enlaceOtro) return;
    const urlOtro = enlaceOtro.getAttribute('href');
    const leer = () => { try { return localStorage.getItem(CLAVE); } catch (e) { return null; } };
    const guardar = v => { try { localStorage.setItem(CLAVE, v); } catch (e) { /* sin almacenamiento: no pasa nada */ } };
    const irAlOtro = () => { guardar(OTRO); window.location.href = urlOtro + window.location.hash; };

    // Ya eligió el otro idioma en una visita anterior
    const elegido = leer();
    if (elegido === OTRO) { window.location.replace(urlOtro + window.location.hash); return; }

    // Cualquier enlace al otro idioma guarda la elección (y conserva el #ancla)
    document.querySelectorAll('[data-lang="' + OTRO + '"]').forEach(a => a.addEventListener('click', ev => { ev.preventDefault(); irAlOtro(); }));

    if (elegido === LANG) return;
    const idiomas = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ''];
    if (!String(idiomas[0] || '').toLowerCase().startsWith(OTRO)) return;

    const textos = OTRO === 'en'
        ? { pregunta: 'View this site in English?', si: 'English', no: 'Stay in Spanish', lang: 'en' }
        : { pregunta: '¿Ver este sitio en español?', si: 'Español', no: 'Seguir en inglés', lang: 'es' };
    const aviso = document.createElement('div');
    aviso.className = 'lang-aviso';
    aviso.setAttribute('role', 'dialog');
    aviso.setAttribute('aria-label', textos.pregunta);
    aviso.lang = textos.lang;
    aviso.innerHTML = '<p></p><div class="lang-aviso-botones"><button type="button" class="lang-aviso-si"></button><button type="button" class="lang-aviso-no"></button></div>';
    aviso.querySelector('p').textContent = textos.pregunta;
    aviso.querySelector('.lang-aviso-si').textContent = textos.si;
    aviso.querySelector('.lang-aviso-no').textContent = textos.no;
    aviso.querySelector('.lang-aviso-si').addEventListener('click', irAlOtro);
    aviso.querySelector('.lang-aviso-no').addEventListener('click', () => {
        guardar(LANG);
        aviso.classList.remove('is-visible');
        setTimeout(() => aviso.remove(), 400);
    });
    // Aparece después de la pantalla de carga y solo en la portada: si el visitante baja sin contestar,
    // se quita (sin guardar nada) para no tapar las escenas; en su siguiente visita vuelve a aparecer.
    const quitarAlBajar = () => {
        if (window.scrollY < window.innerHeight * 0.6) return;
        window.removeEventListener('scroll', quitarAlBajar);
        aviso.classList.remove('is-visible');
        setTimeout(() => aviso.remove(), 400);
    };
    window.addEventListener('load', () => setTimeout(() => {
        if (window.scrollY >= window.innerHeight * 0.6) return;
        document.body.appendChild(aviso);
        requestAnimationFrame(() => requestAnimationFrame(() => aviso.classList.add('is-visible')));
        window.addEventListener('scroll', quitarAlBajar, { passive: true });
    }, 1600));
})();
