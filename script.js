document.addEventListener('DOMContentLoaded', () => {

    /* ==================================================
       1. PANTALLA DE CARGA 
    ================================================== */
    window.addEventListener('load', () => {
        setTimeout(() => {
            document.getElementById('preloader').classList.add('loaded');
        }, 300);
    });

    /* ==================================================
       2. HERO SLIDER AUTOMÁTICO
    ================================================== */
    const slides = document.querySelectorAll('.slide');
    if(slides.length > 0) {
        let currentSlide = 0;
        setInterval(() => {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        }, 4500); 
    }

    const heroTitle = document.getElementById('hero-title');

    /* ==================================================
       3. LÓGICA MAESTRA DE SCROLL DE SECUENCIAS
    ================================================== */
    const sequenceSectionDilema = document.getElementById('dilema');
    const dilemaTrack = document.getElementById('dilema-text-track');
    const dilemaBgs = sequenceSectionDilema ? sequenceSectionDilema.querySelectorAll('.seq-bg') : [];

    const sequenceSectionOperaciones = document.getElementById('operaciones');
    const operacionesTrack = document.getElementById('operaciones-text-track');

    const sequenceSectionPilares = document.getElementById('experiencia');
    const pilaresTrack = document.getElementById('pilares-text-track');
    const pilaresBgs = sequenceSectionPilares ? sequenceSectionPilares.querySelectorAll('.pilares-mobile-view .seq-bg') : [];
    const pilaresDesktopCards = document.querySelectorAll('.pilares-desktop-view .quadrant-card');

    const sequenceSectionIA = document.getElementById('ia');
    const iaTrack = document.getElementById('ia-text-track');
    const iaBgs = sequenceSectionIA ? sequenceSectionIA.querySelectorAll('.seq-bg') : [];

    const sequenceSectionEcosistema = document.getElementById('ecosistema');
    const ecosistemaTrack = document.getElementById('ecosistema-text-track');

    // Alto de una escena = alto real de su punto de anclaje (100vh de CSS).
    // No usar window.innerHeight: en iPhone, con la barra del navegador a la vista, innerHeight es menor que 100vh
    // y el error se acumula escena por escena (en IA 03/06 → 04/06 el cambio se sentía inmediato).
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

    // ESCENAS CON PUNTOS SOBRE UNA IMAGEN (Operaciones y Ecosistema)
    // Escena 0: título sobre blanco. Escenas 1+: se enciende el punto (y su tarjeta) de esa escena;
    // los anteriores quedan con su nombre.
    function makeSpotSequence(section, track) {
        const stage = section.querySelector('.op-stage');
        const bgs = section.querySelectorAll(':scope > .sticky-container > .seq-bg');
        const spots = section.querySelectorAll('.op-spot');
        const cards = section.querySelectorAll('.eco-card');
        const svg = section.querySelector('.eco-lines');
        const lines = svg ? svg.querySelectorAll('line') : [];
        const count = section.querySelectorAll('.snap-point').length;
        let current = -1;

        function drawLines() {
            if (!svg || !stage) return;
            const sr = stage.getBoundingClientRect();
            svg.setAttribute('viewBox', `0 0 ${sr.width} ${sr.height}`);
            lines.forEach(line => {
                const spot = section.querySelector('#spot-' + line.dataset.from);
                const card = Array.from(cards).find(c => c.dataset.for.split(' ').includes(line.dataset.from));
                if (!spot || !card) return;
                const px = parseFloat(spot.style.left) / 100 * sr.width;
                const py = parseFloat(spot.style.top) / 100 * sr.height;
                const cl = card.offsetLeft, ct = card.offsetTop, cw = card.offsetWidth, ch = card.offsetHeight;
                // Punto del borde de la tarjeta más cercano al punto de la maqueta
                const cx = Math.min(Math.max(px, cl), cl + cw);
                const cy = Math.min(Math.max(py, ct), ct + ch);
                line.setAttribute('x1', cx); line.setAttribute('y1', cy);
                line.setAttribute('x2', px); line.setAttribute('y2', py);
            });
        }

        function place() {
            const vertical = window.innerWidth <= 768;
            spots.forEach(spot => {
                spot.style.left = (vertical ? spot.dataset.xv : spot.dataset.x) + '%';
                spot.style.top = (vertical ? spot.dataset.yv : spot.dataset.y) + '%';
            });
            drawLines();
            if (current >= 0) { const c = current; current = -1; setScene(c); }
        }

        function setScene(index) {
            if (index === current) return;
            current = index;
            section.dataset.scene = index;
            if (track) track.style.transform = `translateY(calc(var(--vh) * -${index * 100}))`;
            bgs.forEach((bg, idx) => bg.classList.toggle('active', idx === Math.min(index, 1)));
            let focus = null;
            section.querySelectorAll('.op-spot, .eco-card, .eco-lines line').forEach(el => {
                const n = Number(el.dataset.scene);
                el.classList.toggle('is-on', n === index);
                el.classList.toggle('is-seen', n < index);
                if (n === index && !focus && el.classList.contains('op-spot')) focus = el;
            });
            if (stage && focus) {
                stage.style.setProperty('--fx', focus.style.left);
                stage.style.setProperty('--fy', focus.style.top);
            }
        }

        place();
        window.addEventListener('resize', place);
        window.addEventListener('load', drawLines);

        return function onScroll(windowHeight) {
            const rect = section.getBoundingClientRect();
            // Al pasar el final de la sección (pie de página), el texto se desvanece
            section.classList.toggle('is-past', rect.bottom < windowHeight - 2);
            // Una escena por pantalla, alineada con los puntos de anclaje (tolerancia de 2px)
            if (rect.top <= 2 && rect.bottom >= windowHeight - 2) {
                let activeIndex = Math.round(Math.max(0, -rect.top) / sceneStep(section));
                if (activeIndex >= count) activeIndex = count - 1;
                setScene(activeIndex);
            }
        };
    }

    // ESCENAS SIMPLES (fondo con fundido + contenido que sube una pantalla por escena): Crecimiento
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
    const sequenceSectionCrecimiento = document.getElementById('crecimiento');
    const crecimientoScroll = sequenceSectionCrecimiento
        ? makeSimpleSequence(sequenceSectionCrecimiento, document.getElementById('crecimiento-text-track')) : null;

    const operacionesScroll = sequenceSectionOperaciones ? makeSpotSequence(sequenceSectionOperaciones, operacionesTrack) : null;
    const ecosistemaScroll = sequenceSectionEcosistema ? makeSpotSequence(sequenceSectionEcosistema, ecosistemaTrack) : null;

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        // Alto de una pantalla del sitio (= una escena). No innerHeight: en iPhone cambia al esconderse la barra.
        const windowHeight = screenH();

        if(heroTitle && currentScrollY < windowHeight) {
            heroTitle.style.transform = `translateY(-${currentScrollY * 0.8}px)`;
            heroTitle.style.opacity = 1 - (currentScrollY / (windowHeight * 0.5));
        }

        if (sequenceSectionDilema) {
            const rect = sequenceSectionDilema.getBoundingClientRect();
            // Misma lógica que las demás secciones: una escena por pantalla, cambio a mitad del movimiento
            // (antes se calculaba por porcentaje y Enfoque → Garantía cambiaba casi al empezar a deslizar)
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
            // Tolerancia de 2px: la sección empieza en una posición con decimales
            if (rect.top <= 2 && rect.bottom >= windowHeight - 2) {
                // Una escena por pantalla, alineada con los puntos de anclaje del scroll
                let activeIndex = Math.round(Math.max(0, -rect.top) / sceneStep(sequenceSectionIA));
                if (activeIndex >= iaBgs.length) activeIndex = iaBgs.length - 1;

                if(iaTrack) iaTrack.style.transform = `translateY(calc(var(--vh) * -${activeIndex * 100}))`;
                iaBgs.forEach((bg, idx) => {
                    if (idx === activeIndex) bg.classList.add('active');
                    else bg.classList.remove('active');
                });
            }
        }

        if (sequenceSectionPilares) {
            const rect = sequenceSectionPilares.getBoundingClientRect();
            // Una escena por pantalla (misma lógica que IA, Operaciones y Ecosistema):
            // escena 0 = título; escenas 1–4 = cada sector entra completo con un solo movimiento
            if (rect.top <= 2 && rect.bottom >= windowHeight - 2) {
                let activeIndex = Math.round(Math.max(0, -rect.top) / sceneStep(sequenceSectionPilares));
                if (activeIndex > 4) activeIndex = 4;
                if (pilaresTrack) pilaresTrack.style.transform = `translateY(calc(var(--vh) * -${activeIndex * 100}))`;
                pilaresBgs.forEach((bg, idx) => bg.classList.toggle('active', idx === activeIndex));
                pilaresDesktopCards.forEach((card, index) => card.classList.toggle('is-in', activeIndex >= index + 1));
            }
        }

        if (ecosistemaScroll) ecosistemaScroll(windowHeight);
    });

    /* ==================================================
       4. SCROLL MORPHING (MENÚ)
    ================================================== */
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

    // REGRESAR AL INICIO: fundido a negro, salto directo a la portada y fundido de regreso
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

    // Botón flotante: aparece al salir de la portada
    const btnSubir = document.querySelector('.btn-subir');
    if (btnSubir) {
        btnSubir.addEventListener('click', volverInicio);
        const toggleSubir = () => btnSubir.classList.toggle('is-visible', window.scrollY > screenH() * 0.6);
        window.addEventListener('scroll', toggleSubir, { passive: true });
        toggleSubir();
    }

    if (brandLogoWrapper) {
        brandLogoWrapper.addEventListener('click', () => {
            const isMobile = window.innerWidth <= 768;
            if (!morphNav.classList.contains('is-scrolled')) return;
            // Celular: el logo abre y cierra el menú (ahí está "Inicio"). Escritorio: el logo regresa a la portada
            if (isMobile) morphNav.classList.toggle('mobile-menu-open');
            else volverInicio();
        });
    }

    const menuLinks = document.querySelectorAll('.nav-links a, .mobile-menu-content a');
    menuLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            if (targetId === 'inicio') { volverInicio(); return; }
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                morphNav.classList.remove('mobile-menu-open');
                // Llevar al inicio exacto de la sección (antes se detenía 100 px antes y en celular
                // se asomaba la sección anterior o la siguiente)
                const offset = 0;
                const sectionPosition = targetSection.getBoundingClientRect().top;
                const offsetPosition = sectionPosition + window.pageYOffset - offset;
                window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
            }
        });
    });

    /* ==================================================
       5. EFECTO PARALLAX INTERNO Y FADE-UP
    ================================================== */
    const parallaxImages = document.querySelectorAll('.parallax-img');
    const onScrollParallax = () => {
        parallaxImages.forEach(img => {
            const wrapper = img.parentElement;
            const rect = wrapper.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            if (rect.top < windowHeight && rect.bottom > 0) {
                const scrollProgress = (windowHeight - rect.top) / (windowHeight + rect.height);
                const yPos = (scrollProgress * 40) - 20; 
                img.style.transform = `translate3d(0, ${yPos}%, 0)`;
            }
        });
    };

    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.15 };
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); 
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal-up');
    revealElements.forEach(el => observer.observe(el));

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                onScrollParallax();
                ticking = false;
            });
            ticking = true;
        }
    });
    onScrollParallax();
});
/* ==================================================
   CONTACTO: ventana con el formulario "Platiquemos de tu proceso"
   En Hostinger envía a enviar.php (correo). En GitHub Pages no hay PHP:
   si el envío falla por eso, abre el correo del visitante con los datos ya escritos.
================================================== */
(function () {
    const modal = document.getElementById('contacto-modal');
    const form = document.getElementById('contacto-form');
    if (!modal || !form) return;
    const estado = form.querySelector('.cf-estado');
    const boton = form.querySelector('.cf-enviar');
    const DESTINO = 'rvertti@4wardcorp.com';
    let ultimoFoco = null;

    function abrir(e) {
        if (e) e.preventDefault();
        ultimoFoco = document.activeElement;
        modal.hidden = false;
        document.documentElement.classList.add('contacto-abierto');
        form.elements.t0.value = Date.now();
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
