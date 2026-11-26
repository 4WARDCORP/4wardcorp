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
   6. Regresar al inicio (logo, "Inicio" del menú y botón ↑)
   7. Enlaces del menú
   8. Formulario de contacto (función independiente, al final del archivo)

   REGLAS
   - El alto de una pantalla se mide con screenH() / sceneStep(), nunca con window.innerHeight.
   - Las animaciones usan translateY(calc(var(--vh) * -N00)) para coincidir con el CSS.
   - "Celular" = window.innerWidth <= 768 (mismo umbral que el CSS).
   ========================================================================== */

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
            const escala = Math.max(0.6, Math.min(1, disponible / ((fBottom - fTop) * stageH)));
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

        function setScene(index) {
            if (index === current) return;
            current = index;
            section.dataset.scene = index;
            if (track) track.style.transform = `translateY(calc(var(--vh) * -${index * 100}))`;
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
            if (rect.top <= 2 && rect.bottom >= windowHeight - 2) {
                let activeIndex = Math.round(Math.max(0, -rect.top) / sceneStep(section));
                if (activeIndex >= count) activeIndex = count - 1;
                setScene(activeIndex);
            }
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
            if (rect.top <= 2 && rect.bottom >= windowHeight - 2) {
                let index = Math.round(Math.max(0, -rect.top) / sceneStep(section));
                if (index >= count) index = count - 1;
                if (index === current) return;
                current = index;
                section.dataset.scene = index;
                if (track) track.style.transform = `translateY(calc(var(--vh) * -${index * 100}))`;
                bgs.forEach((bg, idx) => bg.classList.toggle('active', idx === index));
            }
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
            if (rect.top <= 2 && rect.bottom >= windowHeight - 2) {
                let activeIndex = Math.round(Math.max(0, -rect.top) / sceneStep(sequenceSectionDilema));
                if (activeIndex >= dilemaBgs.length) activeIndex = dilemaBgs.length - 1;
                if (dilemaTrack) dilemaTrack.style.transform = `translateY(calc(var(--vh) * -${activeIndex * 100}))`;
                dilemaBgs.forEach((bg, idx) => bg.classList.toggle('active', idx === activeIndex));
            }
        }

        if (operacionesScroll) operacionesScroll(windowHeight);
        if (crecimientoScroll) crecimientoScroll(windowHeight);

        if (sequenceSectionIA) {
            const rect = sequenceSectionIA.getBoundingClientRect();
            if (rect.top <= 2 && rect.bottom >= windowHeight - 2) {
                let activeIndex = Math.round(Math.max(0, -rect.top) / sceneStep(sequenceSectionIA));
                if (activeIndex >= iaBgs.length) activeIndex = iaBgs.length - 1;
                if (iaTrack) iaTrack.style.transform = `translateY(calc(var(--vh) * -${activeIndex * 100}))`;
                iaBgs.forEach((bg, idx) => bg.classList.toggle('active', idx === activeIndex));
                sequenceSectionIA.dataset.scene = activeIndex;   // el CSS enciende las tarjetas de los frentes en la escena 3
            }
        }

        if (sequenceSectionPilares) {
            const rect = sequenceSectionPilares.getBoundingClientRect();
            if (rect.top <= 2 && rect.bottom >= windowHeight - 2) {
                let activeIndex = Math.round(Math.max(0, -rect.top) / sceneStep(sequenceSectionPilares));
                if (activeIndex > PILARES_ULTIMA_ESCENA) activeIndex = PILARES_ULTIMA_ESCENA;
                if (pilaresTrack) pilaresTrack.style.transform = `translateY(calc(var(--vh) * -${activeIndex * 100}))`;
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
       6. REGRESAR AL INICIO
       Fundido a negro (.fundido-inicio, 0.35 s), salto directo a la portada y fundido de regreso.
       Se usa desde: logo (escritorio), "Inicio" del menú (celular) y botón flotante ↑.
       ---------------------------------------------------------------------- */
    const fundido = document.querySelector('.fundido-inicio');
    function volverInicio() {
        morphNav.classList.remove('mobile-menu-open');
        if (!fundido) { window.scrollTo({ top: 0, behavior: 'instant' }); return; }
        fundido.classList.add('is-on');
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'instant' });
            setTimeout(() => fundido.classList.remove('is-on'), 80);
        }, 380);
    }

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
       Desplazamiento suave al inicio EXACTO de la sección (sin margen: con margen se asomaba
       la sección vecina en celular). #inicio usa volverInicio().
       ---------------------------------------------------------------------- */
    const menuLinks = document.querySelectorAll('.nav-links a, .mobile-menu-content a');
    menuLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            if (targetId === 'inicio') { volverInicio(); return; }
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                morphNav.classList.remove('mobile-menu-open');
                const offsetPosition = targetSection.getBoundingClientRect().top + window.pageYOffset;
                window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
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
        if (!ok) { estado.className = 'cf-estado'; estado.textContent = 'Revisa los campos marcados.'; return false; }
        if (!form.elements.acepta.checked) { estado.className = 'cf-estado'; estado.textContent = 'Para enviar, acepta el aviso de privacidad.'; return false; }
        return true;
    }

    function respaldoCorreo() {
        const f = form.elements;
        const cuerpo = 'Nombre: ' + f.nombre.value + '\nEmpresa: ' + f.empresa.value + '\nCorreo: ' + f.correo.value +
            '\nTeléfono: ' + (f.telefono.value || '—') + '\nSector: ' + (f.sector.value || '—') +
            '\n\n¿Qué proceso quiero mejorar?\n' + f.proceso.value;
        window.location.href = 'mailto:' + DESTINO + '?subject=' + encodeURIComponent('Contacto web – ' + f.empresa.value) + '&body=' + encodeURIComponent(cuerpo);
        estado.className = 'cf-estado is-ok';
        estado.textContent = 'Se abrió tu correo con el mensaje listo; solo envíalo.';
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
        estado.textContent = 'Enviando…';
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
