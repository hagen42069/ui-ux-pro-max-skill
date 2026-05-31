// ============================================================
// Mautsch Fahrzeugtechnik — interaction layer
// ============================================================
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasGSAP = typeof window.gsap !== 'undefined';
const isTouch = window.matchMedia('(hover: none)').matches || window.innerWidth < 900;

document.getElementById('year').textContent = new Date().getFullYear();

// ------------------------------------------------------------
// Preloader
// ------------------------------------------------------------
(function preloader() {
  const el = document.getElementById('preloader');
  const bar = document.getElementById('preloaderBar');
  const pct = document.getElementById('preloaderPct');
  if (!el) return;

  document.documentElement.style.overflow = 'hidden';
  let prog = 0, ready = false, done = false;

  // title lines start hidden (only if gsap available to animate them back)
  if (hasGSAP && !reduced) gsap.set('.hero__title .line > span', { yPercent: 115 });

  const tick = setInterval(() => {
    prog += Math.random() * 13 + 4;
    if (prog > 92 && !ready) prog = 92;
    if (prog >= 100) { prog = 100; clearInterval(tick); finish(); }
    bar.style.width = prog + '%';
    pct.textContent = Math.round(prog) + '%';
  }, 110);

  document.addEventListener('scene:ready', () => { ready = true; });
  setTimeout(() => { ready = true; }, 3200); // safety net

  function finish() {
    if (done) return; done = true;
    el.classList.add('is-done');
    document.documentElement.style.overflow = '';
    document.body.classList.add('cursor-ready');
    heroIntro();
  }
})();

function heroIntro() {
  if (hasGSAP && !reduced) {
    const tl = gsap.timeline({ delay: 0.15 });
    tl.to('.hero__title .line > span', { yPercent: 0, duration: 1.1, stagger: 0.12, ease: 'expo.out' });
  }
  // mark all in-view reveal elements
  revealCheck();
}

// ------------------------------------------------------------
// Smooth scroll (Lenis) + ScrollTrigger sync
// ------------------------------------------------------------
let lenis = null;
if (window.Lenis && !reduced) {
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true, wheelMultiplier: 1 });
  if (hasGSAP && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  } else {
    function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
  }
}

// ------------------------------------------------------------
// Scroll progress -> 3D scene
// ------------------------------------------------------------
function pushProgress(p) { if (window.MautschScene) window.MautschScene.setProgress(p); }

if (hasGSAP && window.ScrollTrigger && !reduced) {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.create({
    trigger: document.body, start: 'top top', end: 'bottom bottom',
    onUpdate: (self) => pushProgress(self.progress),
  });
} else {
  window.addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    pushProgress(max > 0 ? window.scrollY / max : 0);
  }, { passive: true });
}

// ------------------------------------------------------------
// Smooth anchor links (work with Lenis)
// ------------------------------------------------------------
document.querySelectorAll('[data-link]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (!id || !id.startsWith('#')) return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    closeMobileMenu();
    if (lenis) lenis.scrollTo(target, { offset: -60, duration: 1.2 });
    else target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  });
});

// ------------------------------------------------------------
// Reveal on scroll
// ------------------------------------------------------------
const revealEls = document.querySelectorAll('.reveal-up');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      entry.target.style.transitionDelay = Math.min(i * 60, 240) + 'ms';
      entry.target.classList.add('is-in');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
revealEls.forEach((el) => revealObserver.observe(el));
function revealCheck() { /* observer handles it; placeholder for hero intro hook */ }

// ------------------------------------------------------------
// Count-up stats
// ------------------------------------------------------------
const counters = document.querySelectorAll('[data-count]');
const countObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = parseInt(el.dataset.count, 10);
    const dur = 1400; const start = performance.now();
    function step(now) {
      const t = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(target * eased);
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
    countObserver.unobserve(el);
  });
}, { threshold: 0.6 });
counters.forEach((el) => countObserver.observe(el));

// ------------------------------------------------------------
// Navbar scrolled state + active link
// ------------------------------------------------------------
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('is-scrolled', window.scrollY > 40);
}, { passive: true });

const navLinks = document.querySelectorAll('.nav__links a');
const sections = [...navLinks].map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const id = '#' + entry.target.id;
      navLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === id));
    }
  });
}, { threshold: 0.4, rootMargin: '-20% 0px -40% 0px' });
sections.forEach((s) => sectionObserver.observe(s));

// ------------------------------------------------------------
// Mobile menu
// ------------------------------------------------------------
const burger = document.getElementById('navBurger');
const mobileMenu = document.getElementById('mobileMenu');
function closeMobileMenu() {
  burger.classList.remove('is-open');
  mobileMenu.classList.remove('is-open');
  burger.setAttribute('aria-expanded', 'false');
  document.documentElement.style.overflow = '';
}
burger.addEventListener('click', () => {
  const open = burger.classList.toggle('is-open');
  mobileMenu.classList.toggle('is-open', open);
  burger.setAttribute('aria-expanded', String(open));
  document.documentElement.style.overflow = open ? 'hidden' : '';
});

// ------------------------------------------------------------
// Pointer -> 3D parallax
// ------------------------------------------------------------
if (!isTouch && !reduced) {
  window.addEventListener('pointermove', (e) => {
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = (e.clientY / window.innerHeight) * 2 - 1;
    if (window.MautschScene) window.MautschScene.setPointer(x, -y);
  }, { passive: true });
}

// ------------------------------------------------------------
// Custom cursor
// ------------------------------------------------------------
if (!isTouch && !reduced) {
  const ring = document.getElementById('cursor');
  const dot = document.getElementById('cursorDot');
  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let rx = mx, ry = my;
  window.addEventListener('pointermove', (e) => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
  }, { passive: true });
  function cursorLoop() {
    rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
    requestAnimationFrame(cursorLoop);
  }
  cursorLoop();
  document.querySelectorAll('a, button, [data-magnetic], .card, [data-tilt]').forEach((el) => {
    el.addEventListener('pointerenter', () => ring.classList.add('is-hover'));
    el.addEventListener('pointerleave', () => ring.classList.remove('is-hover'));
  });
}

// ------------------------------------------------------------
// Magnetic buttons
// ------------------------------------------------------------
if (!isTouch && !reduced) {
  document.querySelectorAll('[data-magnetic]').forEach((el) => {
    const strength = 0.4;
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) * strength;
      const y = (e.clientY - (r.top + r.height / 2)) * strength;
      el.style.transform = `translate(${x}px, ${y}px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
}

// ------------------------------------------------------------
// Contact form -> mailto:
// ------------------------------------------------------------
const CONTACT_EMAIL = 'info@mautsch-fahrzeugtechnik.de'; // TODO: durch echte Adresse ersetzen
const contactForm = document.getElementById('contactForm');
const cfStatus = document.getElementById('cfStatus');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!contactForm.checkValidity()) {
      contactForm.reportValidity();
      cfStatus.textContent = 'Bitte alle Pflichtfelder ausfüllen.';
      cfStatus.className = 'contact__form-status is-error';
      return;
    }
    const d = Object.fromEntries(new FormData(contactForm));
    const subject = `Anfrage: ${d.service || ''} – ${d.vehicle || ''}`.trim();
    const body =
      `Name: ${d.name}\n` +
      `E-Mail: ${d.email}\n` +
      `Telefon: ${d.phone || '—'}\n` +
      `Fahrzeug: ${d.vehicle}\n` +
      `Leistung: ${d.service}\n\n` +
      `Nachricht:\n${d.message}\n`;
    const href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = href;
    cfStatus.textContent = 'Ihr E-Mail-Programm öffnet sich…';
    cfStatus.className = 'contact__form-status is-ok';
  });
}

// ------------------------------------------------------------
// 3D paint color picker
// ------------------------------------------------------------
const colorPicker = document.getElementById('colorPicker');
if (colorPicker) {
  colorPicker.addEventListener('click', (e) => {
    const btn = e.target.closest('.swatch');
    if (!btn) return;
    const color = btn.dataset.color;
    if (window.MautschScene && window.MautschScene.setPaintColor) {
      window.MautschScene.setPaintColor(color);
    }
    colorPicker.querySelectorAll('.swatch').forEach((s) => s.classList.toggle('is-active', s === btn));
  });
}

// ------------------------------------------------------------
// Card glow + subtle tilt
// ------------------------------------------------------------
if (!isTouch && !reduced) {
  document.querySelectorAll('[data-tilt]').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      card.style.setProperty('--mx', px * 100 + '%');
      card.style.setProperty('--my', py * 100 + '%');
      const rx = (py - 0.5) * -6;
      const ry = (px - 0.5) * 6;
      card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });
}
