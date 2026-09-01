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
    const operacionesBgs = sequenceSectionOperaciones ? sequenceSectionOperaciones.querySelectorAll('.seq-bg') : [];

    const sequenceSectionPilares = document.getElementById('pilares');
    const pilaresTrack = document.getElementById('pilares-text-track');
    const pilaresBgs = sequenceSectionPilares ? sequenceSectionPilares.querySelectorAll('.pilares-mobile-view .seq-bg') : [];
    const pilaresDesktopCards = document.querySelectorAll('.pilares-desktop-view .quadrant-card');

    const sequenceSectionEcosistema = document.getElementById('ecosistema');
    const ecosistemaTrack = document.getElementById('ecosistema-text-track');
    const ecosistemaBgs = sequenceSectionEcosistema ? sequenceSectionEcosistema.querySelectorAll('.seq-bg') : [];

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        const windowHeight = window.innerHeight;

        if(heroTitle && currentScrollY < windowHeight) {
            heroTitle.style.transform = `translateY(-${currentScrollY * 0.8}px)`;
            heroTitle.style.opacity = 1 - (currentScrollY / (windowHeight * 0.5));
        }

        if (sequenceSectionDilema) {
            const rect = sequenceSectionDilema.getBoundingClientRect();
            if (rect.top <= 0 && rect.bottom >= windowHeight) {
                const totalScroll = rect.height - windowHeight;
                const progress = Math.abs(rect.top) / totalScroll;
                
                const segment = 1 / dilemaBgs.length; 
                let activeIndex = Math.floor(progress / segment);
                if (activeIndex >= dilemaBgs.length) activeIndex = dilemaBgs.length - 1;

                if(dilemaTrack) dilemaTrack.style.transform = `translateY(-${activeIndex * 100}vh)`;
                dilemaBgs.forEach((bg, idx) => {
                    if (idx === activeIndex) bg.classList.add('active');
                    else bg.classList.remove('active');
                });
            }
        }

        if (sequenceSectionOperaciones) {
            const rect = sequenceSectionOperaciones.getBoundingClientRect();
            if (rect.top <= 0 && rect.bottom >= windowHeight) {
                const totalScroll = rect.height - windowHeight;
                const progress = Math.abs(rect.top) / totalScroll;
                
                const segment = 1 / operacionesBgs.length; 
                let activeIndex = Math.floor(progress / segment);
                if (activeIndex >= operacionesBgs.length) activeIndex = operacionesBgs.length - 1;

                if(operacionesTrack) operacionesTrack.style.transform = `translateY(-${activeIndex * 100}vh)`;
                operacionesBgs.forEach((bg, idx) => {
                    if (idx === activeIndex) bg.classList.add('active');
                    else bg.classList.remove('active');
                });
            }
        }

        if (sequenceSectionPilares) {
            const rect = sequenceSectionPilares.getBoundingClientRect();
            if (rect.top <= 0 && rect.bottom >= windowHeight) {
                const totalScroll = rect.height - windowHeight;
                const progress = Math.abs(rect.top) / totalScroll; 
                const isMobile = window.innerWidth <= 768;
                
                if (isMobile) {
                    const segment = 1 / pilaresBgs.length; 
                    let activeIndex = Math.floor(progress / segment);
                    if (activeIndex >= pilaresBgs.length) activeIndex = pilaresBgs.length - 1;

                    if(pilaresTrack) pilaresTrack.style.transform = `translateY(-${activeIndex * 100}vh)`;
                    pilaresBgs.forEach((bg, idx) => {
                        if (idx === activeIndex) bg.classList.add('active');
                        else bg.classList.remove('active');
                    });
                } else {
                    pilaresDesktopCards.forEach((card, index) => {
                        const start = 0.15 + (index * 0.2); 
                        let p = (progress - start) / 0.2;
                        if (p < 0) p = 0; if (p > 1) p = 1;

                        card.style.opacity = p > 0 ? 1 : 0; 

                        let x = 0, y = 0;
                        if(index === 0) { x = -100; y = -100; } 
                        else if(index === 1) { x = 100; y = -100; } 
                        else if(index === 2) { x = -100; y = 100; } 
                        else if(index === 3) { x = 100; y = 100; }  
                        
                        card.style.transform = `translate(${x * (1 - p)}%, ${y * (1 - p)}%)`;
                        card.style.borderRadius = `${80 * (1 - p)}px`; 
                    });
                }
            }
        }

        if (sequenceSectionEcosistema) {
            const rect = sequenceSectionEcosistema.getBoundingClientRect();
            if (rect.top <= 0 && rect.bottom >= windowHeight) {
                const totalScroll = rect.height - windowHeight;
                const progress = Math.abs(rect.top) / totalScroll;
                
                const segment = 1 / ecosistemaBgs.length; 
                let activeIndex = Math.floor(progress / segment);
                if (activeIndex >= ecosistemaBgs.length) activeIndex = ecosistemaBgs.length - 1;

                if(ecosistemaTrack) ecosistemaTrack.style.transform = `translateY(-${activeIndex * 100}vh)`;
                ecosistemaBgs.forEach((bg, idx) => {
                    if (idx === activeIndex) bg.classList.add('active');
                    else bg.classList.remove('active');
                });
            }
        }
    });

    /* ==================================================
       4. SCROLL MORPHING (MENÚ)
    ================================================== */
    const morphNav = document.getElementById('morph-nav');
    const brandLogo = document.querySelector('.brand-logo');
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

    brandLogo.addEventListener('click', () => {
        const isMobile = window.innerWidth <= 768;
        if (isMobile && morphNav.classList.contains('is-scrolled')) {
            morphNav.classList.toggle('mobile-menu-open');
        }
    });

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