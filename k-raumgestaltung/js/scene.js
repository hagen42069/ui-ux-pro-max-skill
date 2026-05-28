/* ============================================================
   K·RAUMGESTALTUNG — Hero 3D "schwebender Musterraum"
   Procedural Three.js scene: window + light shafts, animated
   curtain, brass rod, floating material samples.
   Degrades gracefully if WebGL / CDN is unavailable.
   ============================================================ */
import * as THREE from 'three';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const lowPower = window.matchMedia('(max-width: 768px)').matches ||
  (navigator.deviceMemory && navigator.deviceMemory <= 4);

const canvas = document.getElementById('heroCanvas');
if (canvas) init();

function init() {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: !lowPower, alpha: true, powerPreference: 'high-performance' });
  } catch (e) {
    canvas.style.display = 'none'; // fall back to CSS gradient hero
    return;
  }

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x16110c, 0.05);

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 0.4, 9);

  const dpr = Math.min(window.devicePixelRatio || 1, lowPower ? 1.4 : 2);
  renderer.setPixelRatio(dpr);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  /* ---------- palette ---------- */
  const C = {
    brass: 0xc2a36b, brassDeep: 0xb08d57, walnut: 0x3a2e24,
    cream: 0xf3ead8, sand: 0xe0d0b2, taupe: 0x9c8e78,
    leather: 0x8a5a3c, fabric: 0xcdbfa6, green: 0x7d8a72,
  };

  /* ---------- lighting ---------- */
  scene.add(new THREE.AmbientLight(0xfff1d8, 0.55));
  const key = new THREE.DirectionalLight(0xffe6bb, 2.1);
  key.position.set(5, 6, 4);
  scene.add(key);
  const rim = new THREE.PointLight(0xffcaa0, 18, 30);
  rim.position.set(-4, 2, 3);
  scene.add(rim);
  const fill = new THREE.PointLight(0xc2a36b, 8, 24);
  fill.position.set(3, -2, 5);
  scene.add(fill);

  const root = new THREE.Group();
  scene.add(root);

  /* ---------- window frame ---------- */
  const frameMat = new THREE.MeshStandardMaterial({ color: C.walnut, roughness: 0.6, metalness: 0.1 });
  const winGroup = new THREE.Group();
  const fw = 3.4, fh = 4.2, ft = 0.16;
  const bars = [
    [0, fh / 2, fw, ft], [0, -fh / 2, fw, ft],
    [-fw / 2, 0, ft, fh], [fw / 2, 0, ft, fh],
    [0, 0, fw, ft], [0, 0, ft, fh], // cross
  ];
  bars.forEach(([x, y, w, h]) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.18), frameMat);
    m.position.set(x, y, 0);
    winGroup.add(m);
  });
  // glass
  const glass = new THREE.Mesh(
    new THREE.PlaneGeometry(fw, fh),
    new THREE.MeshPhysicalMaterial({ color: 0xbfc9bd, transparent: true, opacity: 0.18, roughness: 0.05, metalness: 0, transmission: 0.6 })
  );
  glass.position.z = -0.05;
  winGroup.add(glass);

  /* ---------- blinds (slats) + light shafts ---------- */
  const slatMat = new THREE.MeshStandardMaterial({ color: C.sand, roughness: 0.7, side: THREE.DoubleSide });
  for (let i = 0; i < 11; i++) {
    const slat = new THREE.Mesh(new THREE.BoxGeometry(fw - 0.3, 0.16, 0.06), slatMat);
    slat.position.set(0, fh / 2 - 0.45 - i * 0.34, -0.02);
    slat.rotation.x = -0.5;
    winGroup.add(slat);
  }
  // volumetric-ish light shafts (additive planes angled through window)
  const shaftMat = new THREE.MeshBasicMaterial({ color: 0xffe7be, transparent: true, opacity: 0.06, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  const shafts = new THREE.Group();
  for (let i = 0; i < 5; i++) {
    const s = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 9), shaftMat);
    s.position.set(-1.4 + i * 0.7, -1, 1.5);
    s.rotation.z = 0.28; s.rotation.x = -0.2;
    shafts.add(s);
  }
  winGroup.add(shafts);
  winGroup.position.set(0, 0.2, -1.4);
  root.add(winGroup);

  /* ---------- brass curtain rod ---------- */
  const brassMat = new THREE.MeshStandardMaterial({ color: C.brass, roughness: 0.25, metalness: 0.95 });
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 4.6, 24), brassMat);
  rod.rotation.z = Math.PI / 2;
  rod.position.set(0, fh / 2 + 0.45, -0.6);
  root.add(rod);
  [-2.3, 2.3].forEach((x) => {
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.13, 20, 20), brassMat);
    knob.position.set(x, fh / 2 + 0.45, -0.6);
    root.add(knob);
  });

  /* ---------- animated curtain (cloth wave) ---------- */
  const curtainGeo = new THREE.PlaneGeometry(1.5, 4.4, 28, 30);
  const baseZ = curtainGeo.attributes.position.array.slice();
  const curtainMat = new THREE.MeshStandardMaterial({ color: C.cream, roughness: 0.85, side: THREE.DoubleSide });
  const curtainL = new THREE.Mesh(curtainGeo, curtainMat);
  curtainL.position.set(-1.55, 0.0, -0.6);
  root.add(curtainL);
  const curtainR = curtainL.clone();
  curtainR.geometry = curtainGeo.clone();
  curtainR.position.x = 1.55;
  root.add(curtainR);

  function waveCurtain(geo, t, phase) {
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = baseZ[i * 3], y = baseZ[i * 3 + 1];
      const fold = Math.sin(x * 6 + phase) * 0.12;
      const sway = Math.sin(t * 0.8 + y * 0.6 + phase) * 0.06 * ((y + 2.2) / 4.4);
      pos.setZ(i, fold + sway);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
  }

  /* ---------- floating material samples ---------- */
  const samples = [];
  const sampleDefs = [
    { geo: new THREE.BoxGeometry(0.9, 0.9, 0.12), color: C.fabric, rough: 0.9, metal: 0, pos: [-3.4, 1.6, 2.2] },
    { geo: new THREE.CylinderGeometry(0.5, 0.5, 0.14, 36), color: C.leather, rough: 0.5, metal: 0.05, pos: [3.5, 1.2, 1.6] },
    { geo: new THREE.BoxGeometry(1.0, 0.7, 0.1), color: C.brassDeep, rough: 0.3, metal: 0.9, pos: [3.2, -1.6, 2.6] },
    { geo: new THREE.CylinderGeometry(0.42, 0.42, 0.12, 36), color: C.green, rough: 0.8, metal: 0, pos: [-3.2, -1.3, 2.8] },
    { geo: new THREE.BoxGeometry(0.7, 0.7, 0.7), color: C.taupe, rough: 0.85, metal: 0, pos: [-2.4, 0.2, 3.4] },
    { geo: new THREE.SphereGeometry(0.4, 28, 28), color: C.brass, rough: 0.2, metal: 1, pos: [2.5, 0.4, 3.6] },
  ];
  sampleDefs.forEach((d, i) => {
    const m = new THREE.Mesh(d.geo, new THREE.MeshStandardMaterial({ color: d.color, roughness: d.rough, metalness: d.metal }));
    m.position.set(...d.pos);
    m.rotation.set(Math.random() * 0.6, Math.random() * 0.8, Math.random() * 0.3);
    m.userData = { baseY: d.pos[1], speed: 0.5 + i * 0.12, amp: 0.12 + (i % 3) * 0.05, spin: 0.1 + i * 0.04 };
    samples.push(m);
    root.add(m);
  });

  /* ---------- resize ---------- */
  function resize() {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();

  /* ---------- interaction: mouse parallax + scroll dolly ---------- */
  const target = { x: 0, y: 0 };
  const cur = { x: 0, y: 0 };
  if (!reduceMotion) {
    window.addEventListener('mousemove', (e) => {
      target.x = (e.clientX / window.innerWidth - 0.5);
      target.y = (e.clientY / window.innerHeight - 0.5);
    });
  }
  let scrollY = 0;
  window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });

  /* ---------- visibility: pause when offscreen ---------- */
  let visible = true;
  const hero = document.getElementById('hero');
  if (hero && 'IntersectionObserver' in window) {
    new IntersectionObserver((en) => { visible = en[0].isIntersecting; }, { threshold: 0.01 }).observe(hero);
  }

  /* ---------- render loop ---------- */
  const clock = new THREE.Clock();
  function render() {
    requestAnimationFrame(render);
    if (!visible) return;
    const t = clock.getElapsedTime();

    // parallax easing
    cur.x += (target.x - cur.x) * 0.05;
    cur.y += (target.y - cur.y) * 0.05;
    const scrollNorm = Math.min(1, scrollY / window.innerHeight);

    root.rotation.y = cur.x * 0.35;
    root.rotation.x = cur.y * 0.2;
    camera.position.x = cur.x * 1.2;
    camera.position.y = 0.4 - cur.y * 0.8;
    camera.position.z = 9 - scrollNorm * 3.2;      // dolly in while scrolling
    camera.lookAt(0, 0.1 - scrollNorm * 0.5, -1);

    if (!reduceMotion) {
      waveCurtain(curtainL.geometry, t, 0);
      waveCurtain(curtainR.geometry, t, Math.PI);
      samples.forEach((m) => {
        m.position.y = m.userData.baseY + Math.sin(t * m.userData.speed) * m.userData.amp;
        m.rotation.y += m.userData.spin * 0.01;
        m.rotation.x += m.userData.spin * 0.004;
      });
      shafts.children.forEach((s, i) => { s.material.opacity = 0.05 + Math.sin(t * 0.6 + i) * 0.025; });
    }

    renderer.render(scene, camera);
  }
  render();
}
