/* Euro Sports & Bar - links, menu, sticky CTA and GSAP motion.
   Everything is visible without this file; motion only enhances. */
(() => {
  const root = document.documentElement;

  /* ---------- WhatsApp links ----------
     The number lives in <body data-whatsapp="55DDXXXXXXXXX"> (country + area code + number, digits only).
     While it is empty, CTAs keep their in-page fallback (#contato). */
  const number = (document.body.dataset.whatsapp || '').replace(/\D/g, '');
  const waLink = (text) => `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
  const messages = {
    aulas: 'Olá! Vim pelo site e quero conhecer as aulas da Euro Sports.',
    turmas: 'Olá! Vim pelo site e quero consultar turmas e horários das aulas.',
    sport: (s) => `Olá! Vim pelo site e quero saber sobre as aulas de ${s}: turmas, horários e matrícula.`,
  };
  if (number) {
    document.querySelectorAll('[data-wa]').forEach((a) => {
      const kind = a.dataset.wa;
      a.href = waLink(messages[kind] || messages.sport(kind));
      a.target = '_blank';
      a.rel = 'noopener';
    });
  }

  /* sport picker in the closing section */
  const picker = document.getElementById('picker');
  if (picker) {
    picker.addEventListener('submit', (e) => {
      e.preventDefault();
      const choice = picker.querySelector('input[name="esporte"]:checked')?.value || '';
      const text = choice && choice !== 'nao-sei'
        ? messages.sport(choice)
        : 'Olá! Vim pelo site e quero conhecer as aulas da Euro Sports. Ainda não sei qual esporte escolher.';
      const status = document.getElementById('picker-status');
      if (!number) {
        status.textContent = 'O WhatsApp oficial ainda não foi configurado nesta página.';
        return;
      }
      status.textContent = '';
      window.open(waLink(text), '_blank', 'noopener');
    });
  }

  /* ---------- mobile menu ---------- */
  const menu = document.getElementById('menu');
  const toggle = document.querySelector('.menu-toggle');
  if (menu && toggle) {
    toggle.addEventListener('click', () => { menu.showModal(); toggle.setAttribute('aria-expanded', 'true'); });
    menu.addEventListener('close', () => toggle.setAttribute('aria-expanded', 'false'));
    menu.querySelectorAll('a, [data-close]').forEach((el) => el.addEventListener('click', () => menu.close()));
  }

  /* ---------- sticky CTA (mobile): visible after the hero, hidden over the closing section ---------- */
  const sticky = document.querySelector('.sticky-cta');
  const hero = document.querySelector('.hero');
  const contact = document.getElementById('contato');
  if (sticky && hero && contact && 'IntersectionObserver' in window) {
    let pastHero = false, atContact = false;
    const update = () => sticky.classList.toggle('is-visible', pastHero && !atContact);
    new IntersectionObserver(([e]) => { pastHero = !e.isIntersecting; update(); }).observe(hero);
    new IntersectionObserver(([e]) => { atContact = e.isIntersecting; update(); }, { rootMargin: '0px 0px -20% 0px' }).observe(contact);
  }

  /* ---------- motion ---------- */
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  root.classList.add('js');
  const ease = 'expo.out';
  const mm = gsap.matchMedia();

  // Hero: the photo opens from a slightly tighter frame, then type and actions arrive in reading order.
  const heroImg = document.querySelector('.hero-media img');
  const tl = gsap.timeline({ defaults: { ease } });
  tl.from('.hero-frame', { clipPath: 'inset(6% 5% 6% 5% round 14px)', duration: 1.5 })
    .from(heroImg, { scale: 1.14, duration: 2.2 }, 0)
    .from('.site-header > *', { y: -16, autoAlpha: 0, duration: 0.9, stagger: 0.08 }, 0.45)
    .from('.hero h1 .line > span', { yPercent: 105, duration: 1.1, stagger: 0.09 }, 0.55)
    .from('.hero-aside > *', { y: 18, autoAlpha: 0, duration: 0.9, stagger: 0.1 }, 0.9)
    .from('.hero-sports a', { autoAlpha: 0, duration: 1, stagger: 0.08 }, 1.0);

  // Hero photo drifts slower than the page as it leaves.
  gsap.to(heroImg, {
    yPercent: 4, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  });

  // Headings: lines rise out of their own mask as the section arrives.
  gsap.utils.toArray('[data-split]').forEach((h) => {
    gsap.from(h.querySelectorAll('.line > span'), {
      yPercent: 105, duration: 1.1, ease, stagger: 0.08,
      scrollTrigger: { trigger: h, start: 'top 85%', once: true },
    });
  });

  // Supporting copy fades in after its heading.
  gsap.utils.toArray('[data-fade]').forEach((el) => {
    gsap.from(el, {
      y: 22, autoAlpha: 0, duration: 1, ease,
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });

  // Photos: frame opens from the bottom edge; the image inside settles from a small zoom.
  gsap.utils.toArray('[data-reveal]').forEach((m) => {
    const img = m.querySelector('img');
    gsap.timeline({ scrollTrigger: { trigger: m, start: 'top 86%', once: true } })
      .from(m, { clipPath: 'inset(18% 0% 0% 0% round 14px)', duration: 1.3, ease }, 0)
      .from(img, { scale: 1.18, duration: 1.8, ease }, 0);
  });

  // Large photos keep a gentle parallax while in view (desktop only; phones read, they don't drift).
  mm.add('(min-width: 761px)', () => {
    gsap.utils.toArray('[data-parallax] img').forEach((img) => {
      gsap.fromTo(img, { yPercent: -6 }, {
        yPercent: 6, ease: 'none',
        scrollTrigger: { trigger: img.closest('[data-parallax]'), start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });
  });

  // Facility specs count in as a list, one row after the other.
  gsap.from('.specs li', {
    y: 16, autoAlpha: 0, duration: 0.8, ease, stagger: 0.07,
    scrollTrigger: { trigger: '.specs', start: 'top 82%', once: true },
  });

  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
