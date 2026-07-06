/* ============================================================
   LEGADO · main.js · microinteracciones de sitio
   Movimiento pausado: fades cortos ease-out, drift sutil.
   Respeta prefers-reduced-motion.
   ============================================================ */
(function () {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* —— Reveal on scroll ————————————————————————————————————— */
  const revealables = document.querySelectorAll('.reveal, .reveal-line');
  if (reduced) {
    revealables.forEach(el => el.classList.add('is-in'));
  } else if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealables.forEach(el => io.observe(el));
  } else {
    revealables.forEach(el => el.classList.add('is-in'));
  }

  // Stagger automático dentro de grids marcados con data-stagger
  document.querySelectorAll('[data-stagger]').forEach(grid => {
    Array.from(grid.children).forEach((child, i) => {
      child.style.setProperty('--reveal-delay', (i * 0.09).toFixed(2) + 's');
    });
  });

  /* —— Parallax sutil (≤24 px de drift, solo desktop) ————————— */
  const parallaxEls = document.querySelectorAll('[data-parallax]');
  if (!reduced && parallaxEls.length && window.innerWidth > 900) {
    let ticking = false;
    const update = () => {
      const vh = window.innerHeight;
      parallaxEls.forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const progress = (r.top + r.height / 2 - vh / 2) / vh; // -1 … 1
        const amount = parseFloat(el.dataset.parallax || '18');
        el.style.transform = 'translateY(' + (-progress * amount).toFixed(1) + 'px)';
      });
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  /* —— Contadores (historia: 20 años, 4 semanas…) ———————————— */
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window && !reduced) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        cio.unobserve(e.target);
        const el = e.target;
        const target = parseInt(el.dataset.count, 10);
        const dur = 1100;
        const t0 = performance.now();
        const tick = (t) => {
          const p = Math.min((t - t0) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased);
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.5 });
    counters.forEach(el => cio.observe(el));
  } else {
    counters.forEach(el => { el.textContent = el.dataset.count; });
  }

  /* —— FAQ accordion —————————————————————————————————————— */
  document.querySelectorAll('.faq-item').forEach(item => {
    item.addEventListener('click', () => {
      const open = item.classList.contains('is-open');
      item.parentElement.querySelectorAll('.faq-item.is-open')
        .forEach(o => o.classList.remove('is-open'));
      if (!open) item.classList.add('is-open');
    });
  });

  /* —— Galería de ficha (crossfade) ———————————————————————— */
  const gallery = document.querySelector('[data-gallery]');
  if (gallery) {
    const mains = gallery.querySelectorAll('.pp-gallery-main .ph');
    const thumbs = gallery.querySelectorAll('.pp-thumb');
    thumbs.forEach((thumb, i) => {
      thumb.addEventListener('click', () => {
        thumbs.forEach(t => t.classList.remove('is-active'));
        mains.forEach(m => m.classList.remove('is-active'));
        thumb.classList.add('is-active');
        if (mains[i]) mains[i].classList.add('is-active');
      });
    });
  }

  /* —— Capa fotográfica con fallback ———————————————————————
     Cada .ph[data-img] intenta cargar su foto editorial; si no
     existe todavía, se queda el gradiente cálido placeholder. */
  window.legadoLoadImages = function (root) {
    (root || document).querySelectorAll('.ph[data-img]').forEach(ph => {
      const src = ph.dataset.img;
      if (!src || ph.dataset.imgLoaded === src) return;
      const probe = new Image();
      probe.onload = () => {
        const fill = ph.querySelector('.ph-fill');
        if (fill) {
          fill.style.backgroundImage = 'url("' + src + '")';
          ph.classList.add('has-img');
          ph.classList.toggle('is-pack', ph.dataset.fit === 'pack');
          ph.dataset.imgLoaded = src;
        }
      };
      probe.src = src;
    });
  };
  window.legadoLoadImages(document);

  /* —— Newsletter / contacto (prototipo sin backend) ————————— */
  document.querySelectorAll('form[data-fake]').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const note = form.querySelector('[data-fake-ok]');
      if (note) { note.style.display = 'block'; }
      form.querySelectorAll('input').forEach(i => { i.value = ''; });
    });
  });
})();
