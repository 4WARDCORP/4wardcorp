document.addEventListener('DOMContentLoaded', () => {

    /* ==================================================
       1. PANTALLA DE CARGA (SAFARI FIX)
    ================================================== */
    const preloader = document.getElementById('preloader');
    const triggerPreloader = () => {
        if (preloader && !preloader.classList.contains('loaded')) {
            preloader.classList.add('loaded');
        }
    };
    setTimeout(triggerPreloader, 300);
    window.addEventListener('load', triggerPreloader);

    /* ==================================================
       2. EFECTO REVEAL (HOVER SPOTLIGHT EN HERO)
    ================================================== */
    const heroSection = document.getElementById('inicio');
    const heroReveal = document.getElementById('hero-reveal');

    if (heroSection && heroReveal) {
        heroSection.addEventListener('mousemove', (e) => {
            const rect = heroSection.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            heroReveal.style.setProperty('--x', `${x}px`);
            heroReveal.style.setProperty('--y', `${y}px`);
        });

        heroSection.addEventListener('mouseleave', () => {
            heroReveal.style.setProperty('--x', `-1000px`);
            heroReveal.style.setProperty('--y', `-1000px`);
        });
    }

    /* ==================================================
       3. SCROLL MORPHING INTELIGENTE
    ================================================== */
    const morphNav = document.getElementById('morph-nav');
    const brandLogoWrapper = document.querySelector('.brand-logo-wrapper');
    let isScrollingTimeout;

    window.addEventListener('scroll', () => {
        const heroHeight = window.innerHeight;
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

    /* ==================================================
       4. EVENTO CLICK: MENÚ DESPLEGABLE MÓVIL
    ================================================== */
    if (brandLogoWrapper) {
        brandLogoWrapper.addEventListener('click', (e) => {
            const isMobile = window.innerWidth <= 768;
            if (isMobile && morphNav.classList.contains('is-scrolled')) {
                morphNav.classList.toggle('mobile-menu-open');
            }
        });
    }

    /* ==================================================
       5. SCROLL SUAVE PARA LOS ENLACES (Ambos menús)
    ================================================== */
    // Agregamos .mobile-menu-content a al querySelector para que también hagan scroll suave
    const menuLinks = document.querySelectorAll('.nav-links a, .mobile-menu-content a');
    
    menuLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                morphNav.classList.remove('mobile-menu-open');
                const offset = 100; 
                const sectionPosition = targetSection.getBoundingClientRect().top;
                const offsetPosition = sectionPosition + window.pageYOffset - offset;
                window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
            }
        });
    });

    /* ==================================================
       6. EFECTO PARALLAX INTERNO Y FADE-UP
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