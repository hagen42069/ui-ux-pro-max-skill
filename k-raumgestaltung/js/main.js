/* ============================================================
   K·RAUMGESTALTUNG — interactions, scroll storytelling, UI
   ============================================================ */
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  const hasGSAP = typeof window.gsap !== 'undefined';

  /* ---------- preloader ---------- */
  const preloader = document.getElementById('preloader');
  window.addEventListener('load', () => {
    setTimeout(() => preloader && preloader.classList.add('is-done'), reduceMotion ? 0 : 900);
  });
  // safety: never trap the user behind the loader
  setTimeout(() => preloader && preloader.classList.add('is-done'), 3500);

  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------- smooth scroll (Lenis) + GSAP ScrollTrigger ---------- */
  let lenis = null;
  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);

  if (!reduceMotion && typeof window.Lenis !== 'undefined') {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true, wheelMultiplier: 0.9 });
    lenis.on('scroll', () => { if (hasGSAP) ScrollTrigger.update(); });
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  const scrollTo = (target) => {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: 0 });
    else el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  // anchor links -> smooth scroll + close mobile menu
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (a.hasAttribute('data-noop')) { e.preventDefault(); return; }
      if (id.length > 1 && document.querySelector(id)) {
        e.preventDefault();
        closeMenu();
        scrollTo(id);
      }
    });
  });

  /* ---------- nav state ---------- */
  const nav = document.getElementById('nav');
  // sections that have a dark background -> nav goes light
  const darkSections = ['#hero', '#svc-boeden', '#prozess', '#chillliege'];
  const updateNav = () => {
    const y = window.scrollY;
    nav.classList.toggle('is-stuck', y > 40);
    let light = false;
    darkSections.forEach((sel) => {
      const s = document.querySelector(sel);
      if (!s) return;
      const r = s.getBoundingClientRect();
      if (r.top <= 70 && r.bottom >= 70) light = true;
    });
    nav.classList.toggle('is-light', light);
  };
  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  // scroll progress bar
  const progress = document.getElementById('scrollProgress');
  const updateProgress = () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  /* ---------- mobile menu ---------- */
  const burger = document.getElementById('burger');
  const closeMenu = () => { document.body.classList.remove('menu-open'); burger.setAttribute('aria-expanded', 'false'); };
  burger.addEventListener('click', () => {
    const open = document.body.classList.toggle('menu-open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  /* ---------- custom cursor ---------- */
  if (!isTouch) {
    const cursor = document.getElementById('cursor');
    const dot = cursor.querySelector('.cursor__dot');
    const ring = cursor.querySelector('.cursor__ring');
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    window.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + 'px'; dot.style.top = my + 'px';
    });
    const loop = () => {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
      requestAnimationFrame(loop);
    };
    loop();
    const hoverables = 'a, button, [data-magnetic], .material-card, .gal, input, textarea, select';
    document.querySelectorAll(hoverables).forEach((el) => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
    });
    // dark cursor over dark sections
    const darkObserver = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) cursor.classList.toggle('is-dark', en.target.dataset.dark === '1'); });
    }, { threshold: 0.5 });
    ['#hero', '#svc-boeden', '#prozess', '#chillliege', '#kontakt'].forEach((sel) => {
      const s = document.querySelector(sel); if (s) { s.dataset.dark = '1'; darkObserver.observe(s); }
    });
    ['#intro', '#leistungen', '#materialien', '#referenzen'].forEach((sel) => {
      const s = document.querySelector(sel); if (s) { s.dataset.dark = '0'; darkObserver.observe(s); }
    });
  }

  /* ---------- magnetic buttons ---------- */
  if (!isTouch && !reduceMotion) {
    document.querySelectorAll('[data-magnetic]').forEach((el) => {
      const strength = 0.35;
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * strength;
        const y = (e.clientY - r.top - r.height / 2) * strength;
        el.style.transform = `translate(${x}px, ${y}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------- reveal on scroll ---------- */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); revealObserver.unobserve(en.target); } });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('[data-reveal]').forEach((el) => revealObserver.observe(el));

  /* ---------- text reveal (split words) ---------- */
  if (hasGSAP && !reduceMotion) {
    document.querySelectorAll('.reveal-text').forEach((el) => {
      const words = el.textContent.trim().split(/\s+/);
      el.innerHTML = words.map((w) => `<span class="word"><span>${w}</span></span>`).join(' ');
      const inner = el.querySelectorAll('.word > span');
      gsap.set(inner, { yPercent: 110 });
      gsap.to(inner, {
        yPercent: 0, duration: 0.9, ease: 'power3.out', stagger: 0.045,
        scrollTrigger: { trigger: el, start: 'top 85%' },
      });
    });
    // wrap each .word span overflow
    document.querySelectorAll('.reveal-text .word').forEach((w) => {
      w.style.overflow = 'hidden'; w.style.verticalAlign = 'top';
    });
  }

  /* ---------- hero title intro ---------- */
  if (hasGSAP && !reduceMotion) {
    gsap.to('.hero__title .line > span', {
      yPercent: 0, duration: 1.1, ease: 'power4.out', stagger: 0.12, delay: 1.0,
    });
    gsap.from('.hero__sub, .hero__actions, .hero__eyebrow', {
      y: 30, opacity: 0, duration: 1, ease: 'power3.out', stagger: 0.12, delay: 1.5,
    });
  } else {
    document.querySelectorAll('.hero__title .line > span').forEach((s) => (s.style.transform = 'none'));
  }

  /* ---------- counters ---------- */
  document.querySelectorAll('[data-count]').forEach((el) => {
    const target = parseInt(el.dataset.count, 10);
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        obs.unobserve(el);
        if (reduceMotion) { el.textContent = target; return; }
        let n = 0;
        const step = Math.max(1, Math.round(target / 40));
        const tick = () => { n = Math.min(target, n + step); el.textContent = n; if (n < target) requestAnimationFrame(tick); };
        tick();
      });
    }, { threshold: 0.5 });
    obs.observe(el);
  });

  /* ============================================================
     SERVICE 1 — Fenster: cycle window treatments
     ============================================================ */
  const treats = document.querySelectorAll('#windowStage .treat');
  const fensterItems = document.querySelectorAll('#svcFensterList li');
  const setTreat = (key) => {
    treats.forEach((t) => t.classList.toggle('is-on', t.dataset.treat === key));
    fensterItems.forEach((li) => li.classList.toggle('is-active', li.dataset.treat === key));
  };
  const treatKeys = ['plissee', 'rollo', 'jalousie', 'flaeche', 'gardine'];
  if (hasGSAP) {
    ScrollTrigger.create({
      trigger: '#svc-fenster', start: 'top 60%', end: 'bottom 40%',
      onUpdate: (self) => {
        const i = Math.min(treatKeys.length - 1, Math.floor(self.progress * treatKeys.length));
        setTreat(treatKeys[i]);
      },
    });
  }
  setTreat('plissee');
  fensterItems.forEach((li) => li.addEventListener('mouseenter', () => setTreat(li.dataset.treat)));

  // sun follows cursor / scroll
  const sun = document.getElementById('windowSun');
  const windowStage = document.getElementById('windowStage');
  if (sun && windowStage && !reduceMotion) {
    windowStage.parentElement.addEventListener('mousemove', (e) => {
      const r = windowStage.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width - 0.5) * 60;
      sun.style.transform = `translateX(${x}px)`;
    });
  }

  /* ============================================================
     SERVICE 2 — Böden: cycle floors
     ============================================================ */
  const floorSurface = document.getElementById('floorSurface');
  const floorCaption = document.getElementById('floorCaption');
  const floorItems = document.querySelectorAll('#svcFloorList li');
  const floorKeys = ['teppich', 'laminat', 'linoleum', 'kork', 'pvc'];
  const floorMoods = {
    teppich: 'Teppich · weich & behaglich', laminat: 'Laminat · modern & klar',
    linoleum: 'Linoleum · natürlich & robust', kork: 'Kork · warm & nachhaltig',
    pvc: 'PVC · pflegeleicht & vielseitig',
  };
  const setFloor = (key) => {
    if (!floorSurface) return;
    floorSurface.dataset.floor = key;
    floorCaption.textContent = floorMoods[key];
    floorItems.forEach((li) => li.classList.toggle('is-active', li.dataset.floor === key));
  };
  if (hasGSAP) {
    ScrollTrigger.create({
      trigger: '#svc-boeden', start: 'top 60%', end: 'bottom 40%',
      onUpdate: (self) => setFloor(floorKeys[Math.min(floorKeys.length - 1, Math.floor(self.progress * floorKeys.length))]),
    });
  }
  setFloor('teppich');
  floorItems.forEach((li) => li.addEventListener('mouseenter', () => setFloor(li.dataset.floor)));

  /* ============================================================
     SERVICE 3 — Polster: cycle upholstery
     ============================================================ */
  const uphStage = document.getElementById('uphStage');
  const uphCaption = document.getElementById('uphCaption');
  const uphItems = document.querySelectorAll('#svcUphList li');
  const uphKeys = ['alt', 'neu', 'leder', 'struktur', 'sonder', 'wand'];
  const uphLabels = {
    alt: 'Alter Bezug', neu: 'Neue Polsterung', leder: 'Lederoptik',
    struktur: 'Strukturstoff', sonder: 'Sonderanfertigung', wand: 'Wandbespannung',
  };
  const setUph = (key) => {
    if (!uphStage) return;
    uphStage.dataset.uph = key;
    uphCaption.textContent = uphLabels[key];
    uphItems.forEach((li) => li.classList.toggle('is-active', li.dataset.uph === key));
  };
  if (hasGSAP) {
    ScrollTrigger.create({
      trigger: '#svc-polster', start: 'top 60%', end: 'bottom 40%',
      onUpdate: (self) => setUph(uphKeys[Math.min(uphKeys.length - 1, Math.floor(self.progress * uphKeys.length))]),
    });
  }
  setUph('alt');
  uphItems.forEach((li) => li.addEventListener('mouseenter', () => setUph(li.dataset.uph)));

  /* ============================================================
     PROCESS — horizontal scroll (pinned)
     ============================================================ */
  if (hasGSAP && !reduceMotion && window.innerWidth > 860) {
    const track = document.getElementById('processTrack');
    const pin = document.getElementById('processPin');
    const getDistance = () => track.scrollWidth - window.innerWidth + parseFloat(getComputedStyle(track).paddingLeft) * 2;
    gsap.to(track, {
      x: () => -getDistance(),
      ease: 'none',
      scrollTrigger: {
        trigger: pin, start: 'top top', end: () => '+=' + getDistance(),
        scrub: 1, pin: true, anticipatePin: 1, invalidateOnRefresh: true,
      },
    });
  }

  /* ============================================================
     PARALLAX — gallery + scenes
     ============================================================ */
  if (hasGSAP && !reduceMotion) {
    gsap.utils.toArray('.gal').forEach((el, i) => {
      gsap.from(el, {
        y: 70, opacity: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 90%' },
      });
    });
    gsap.utils.toArray('.contact__scene').forEach((el) => {
      gsap.to(el, { yPercent: 12, ease: 'none', scrollTrigger: { trigger: el, scrub: true } });
    });
  }

  /* ============================================================
     REFERENCES — filter
     ============================================================ */
  const filterWrap = document.getElementById('refsFilter');
  const galItems = document.querySelectorAll('#gallery .gal');
  if (filterWrap) {
    filterWrap.addEventListener('click', (e) => {
      const btn = e.target.closest('button'); if (!btn) return;
      filterWrap.querySelectorAll('button').forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const f = btn.dataset.filter;
      galItems.forEach((g) => g.classList.toggle('is-hidden', f !== 'all' && g.dataset.cat !== f));
      if (hasGSAP) ScrollTrigger.refresh();
    });
  }

  /* ============================================================
     BEFORE / AFTER slider
     ============================================================ */
  const ba = document.getElementById('beforeAfter');
  if (ba) {
    const before = document.getElementById('baBefore');
    const handle = document.getElementById('baHandle');
    let dragging = false;
    const setPos = (clientX) => {
      const r = ba.getBoundingClientRect();
      let pct = ((clientX - r.left) / r.width) * 100;
      pct = Math.max(2, Math.min(98, pct));
      before.style.clipPath = 'inset(0 ' + (100 - pct) + '% 0 0)';
      handle.style.left = pct + '%';
      handle.setAttribute('aria-valuenow', Math.round(pct));
    };
    const start = () => { dragging = true; };
    const stop = () => { dragging = false; };
    const move = (e) => { if (!dragging) return; setPos(e.touches ? e.touches[0].clientX : e.clientX); };
    handle.addEventListener('mousedown', start);
    handle.addEventListener('touchstart', start, { passive: true });
    window.addEventListener('mouseup', stop);
    window.addEventListener('touchend', stop);
    window.addEventListener('mousemove', move);
    window.addEventListener('touchmove', move, { passive: true });
    ba.addEventListener('click', (e) => { if (e.target === handle || handle.contains(e.target)) return; setPos(e.clientX); });
    handle.addEventListener('keydown', (e) => {
      const cur = parseFloat(handle.getAttribute('aria-valuenow'));
      if (e.key === 'ArrowLeft') { const r = ba.getBoundingClientRect(); setPos(r.left + (r.width * (cur - 4)) / 100); }
      if (e.key === 'ArrowRight') { const r = ba.getBoundingClientRect(); setPos(r.left + (r.width * (cur + 4)) / 100); }
    });
  }

  /* ============================================================
     CHILL-LIEGE — morph on scroll
     ============================================================ */
  if (hasGSAP && !reduceMotion) {
    const barrow = document.querySelector('.chill-barrow');
    const lounge = document.querySelector('.chill-lounge');
    if (barrow && lounge) {
      ScrollTrigger.create({
        trigger: '#chillliege', start: 'top 65%', end: 'bottom 60%',
        onUpdate: (self) => {
          gsap.set(barrow, { opacity: 1 - Math.min(1, self.progress * 1.6) });
          gsap.set(lounge, { opacity: Math.max(0, self.progress * 1.6 - 0.4) });
        },
      });
    }
  } else {
    const lounge = document.querySelector('.chill-lounge'); if (lounge) lounge.style.opacity = 1;
  }

  /* ============================================================
     CONTACT FORM
     ============================================================ */
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const success = document.getElementById('formSuccess');
      let valid = true;
      form.querySelectorAll('[required]').forEach((f) => {
        const ok = f.type === 'checkbox' ? f.checked : f.value.trim() !== '';
        f.style.borderColor = ok ? '' : '#c0392b';
        if (!ok) valid = false;
      });
      if (!valid) return;
      success.hidden = false;
      form.querySelectorAll('input, textarea, select').forEach((f) => { if (f.type !== 'submit') f.value = ''; });
      form.querySelector('#privacy').checked = false;
      setTimeout(() => { success.hidden = true; }, 6000);
    });
  }

  // refresh ScrollTrigger after full load (fonts/layout settle)
  window.addEventListener('load', () => { if (hasGSAP) setTimeout(() => ScrollTrigger.refresh(), 300); });
})();
