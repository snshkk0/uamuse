(function () {
    'use strict';

    // Hero parallax: tagline + CTA drift up slower than scroll, hero fades out
    function initHeroParallax() {
        const hero = document.querySelector('.home-hero, .page-hero');
        if (!hero) return;

        const tagline = hero.querySelector('.hero-tagline');
        const cta = hero.querySelector('.hero-cta');
        const heroHeight = hero.offsetHeight;

        window.addEventListener('scroll', function () {
            const y = window.pageYOffset;
            const progress = Math.min(y / heroHeight, 1);

            if (tagline) tagline.style.transform = 'translateY(' + (y * 0.3) + 'px)';
            if (cta)     cta.style.transform     = 'translateY(' + (y * 0.18) + 'px)';

            hero.style.opacity = String(Math.max(0, 1 - progress * 1.6));
        }, { passive: true });
    }

    // Scroll reveal: elements fade + slide up as they enter viewport
    function initScrollReveal() {
        const targets = document.querySelectorAll(
            '.feature-card, .why-item, .artist-card, .about-card, ' +
            '.genre_button, #chartsTable, .section-title, .section-desc, ' +
            '.contact-form, .checkbox-consent, .login-card'
        );
        if (!targets.length) return;

        targets.forEach(function (el, i) {
            el.style.opacity    = '0';
            el.style.transform  = 'translateY(28px)';
            el.style.transition =
                'opacity 0.6s ease ' + ((i % 4) * 0.1) + 's, ' +
                'transform 0.6s ease ' + ((i % 4) * 0.1) + 's';
        });

        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.style.opacity   = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

        targets.forEach(function (el) { observer.observe(el); });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initHeroParallax();
        initScrollReveal();
    });
})();
