// ============================================================
// Mautsch Fahrzeugtechnik — 3D low-poly car scene
// Procedurally built, driven by scroll progress + pointer
// ============================================================
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const PAINT   = 0x2a3340;
const GLASS   = 0x070a12;
const TIRE    = 0x0c0d10;
const RIM     = 0xc7ccd6;
const ACCENT  = 0xe11d2a;

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Scroll choreography keyframes: progress -> camera + car pose
const KEYS = [
  { p: 0.00, cx: 0.0,  cy: 1.12, cz: 6.8, lx: 0.0,  ly: 0.42, lz: 0, ry: -0.62, px: 0.0  },
  { p: 0.22, cx: 0.6,  cy: 1.30, cz: 7.4, lx: 0.7,  ly: 0.55, lz: 0, ry: -1.75, px: 2.3  },
  { p: 0.45, cx: -0.5, cy: 1.55, cz: 7.6, lx: -0.7, ly: 0.55, lz: 0, ry: -3.55, px: -2.3 },
  { p: 0.66, cx: 0.3,  cy: 2.55, cz: 6.9, lx: 0.4,  ly: 0.30, lz: 0, ry: -4.75, px: 1.8  },
  { p: 0.84, cx: -0.4, cy: 1.25, cz: 7.2, lx: -0.5, ly: 0.55, lz: 0, ry: -6.05, px: -1.6 },
  { p: 1.00, cx: 0.0,  cy: 1.55, cz: 9.0, lx: 0.0,  ly: 0.60, lz: 0, ry: -6.95, px: 0.0  },
];

function poseAt(p) {
  if (p <= KEYS[0].p) return { ...KEYS[0] };
  if (p >= KEYS[KEYS.length - 1].p) return { ...KEYS[KEYS.length - 1] };
  let a = KEYS[0], b = KEYS[1];
  for (let i = 0; i < KEYS.length - 1; i++) {
    if (p >= KEYS[i].p && p <= KEYS[i + 1].p) { a = KEYS[i]; b = KEYS[i + 1]; break; }
  }
  const t = (p - a.p) / (b.p - a.p);
  const e = t * t * (3 - 2 * t); // smoothstep
  const mix = (k) => a[k] + (b[k] - a[k]) * e;
  return { cx: mix('cx'), cy: mix('cy'), cz: mix('cz'), lx: mix('lx'), ly: mix('ly'), lz: mix('lz'), ry: mix('ry'), px: mix('px') };
}

// ---- build a faceted low-poly wheel ----
function buildWheel() {
  const wheel = new THREE.Group();
  const tireGeo = new THREE.CylinderGeometry(0.46, 0.46, 0.32, 16, 1);
  const tire = new THREE.Mesh(tireGeo, new THREE.MeshStandardMaterial({ color: TIRE, metalness: 0.2, roughness: 0.85, flatShading: true }));
  tire.rotation.x = Math.PI / 2;
  wheel.add(tire);

  const rimGeo = new THREE.CylinderGeometry(0.27, 0.27, 0.34, 7, 1);
  const rim = new THREE.Mesh(rimGeo, new THREE.MeshStandardMaterial({ color: RIM, metalness: 0.95, roughness: 0.28, flatShading: true }));
  rim.rotation.x = Math.PI / 2;
  wheel.add(rim);

  const hubGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.38, 8);
  const hub = new THREE.Mesh(hubGeo, new THREE.MeshStandardMaterial({ color: 0x05060a, metalness: 0.9, roughness: 0.3 }));
  hub.rotation.x = Math.PI / 2;
  wheel.add(hub);

  // red brake caliper
  const caliper = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.2, 0.06),
    new THREE.MeshStandardMaterial({ color: ACCENT, metalness: 0.3, roughness: 0.5, emissive: ACCENT, emissiveIntensity: 0.15 })
  );
  caliper.position.set(0.2, 0.0, 0);
  caliper.rotation.z = 0.4;
  wheel.add(caliper);
  return wheel;
}

function buildCar() {
  const car = new THREE.Group();

  // ----- lower body (side profile extruded across the width) -----
  const body = new THREE.Shape();
  body.moveTo(-2.10, 0.30);
  body.lineTo(-2.20, 0.52);
  body.lineTo(-1.78, 0.60);
  body.lineTo(-1.05, 0.66);
  body.lineTo(-0.55, 0.74);
  body.lineTo(1.22, 0.80);
  body.lineTo(1.80, 0.74);
  body.lineTo(2.14, 0.64);
  body.lineTo(2.18, 0.42);
  body.lineTo(2.08, 0.30);
  body.closePath();

  const bodyWidth = 1.78;
  const bodyGeo = new THREE.ExtrudeGeometry(body, {
    depth: bodyWidth, bevelEnabled: true, bevelThickness: 0.07, bevelSize: 0.07, bevelSegments: 2, steps: 1, curveSegments: 1,
  });
  bodyGeo.translate(0, 0, -bodyWidth / 2);
  const paintMat = new THREE.MeshStandardMaterial({ color: PAINT, metalness: 0.88, roughness: 0.34, flatShading: true });
  car.add(new THREE.Mesh(bodyGeo, paintMat));

  // ----- greenhouse / cabin (narrower, dark glass) -----
  const cabin = new THREE.Shape();
  cabin.moveTo(-0.52, 0.78);
  cabin.lineTo(-0.18, 1.12);
  cabin.lineTo(0.55, 1.20);
  cabin.lineTo(0.95, 1.12);
  cabin.lineTo(1.24, 0.82);
  cabin.closePath();

  const cabinWidth = 1.55;
  const cabinGeo = new THREE.ExtrudeGeometry(cabin, {
    depth: cabinWidth, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 1, steps: 1, curveSegments: 1,
  });
  cabinGeo.translate(0, 0, -cabinWidth / 2);
  const glassMat = new THREE.MeshStandardMaterial({ color: GLASS, metalness: 1.0, roughness: 0.08, flatShading: true });
  car.add(new THREE.Mesh(cabinGeo, glassMat));

  // ----- side accent stripe (sill) -----
  const stripe = new THREE.Mesh(
    new THREE.BoxGeometry(3.0, 0.05, bodyWidth + 0.06),
    new THREE.MeshStandardMaterial({ color: ACCENT, metalness: 0.4, roughness: 0.4, emissive: ACCENT, emissiveIntensity: 0.25 })
  );
  stripe.position.set(0.1, 0.40, 0);
  car.add(stripe);

  // ----- headlights -----
  const headMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xbfe3ff, emissiveIntensity: 2.2 });
  [-1, 1].forEach((s) => {
    const h = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.14, 0.34), headMat);
    h.position.set(-2.12, 0.60, s * 0.55);
    car.add(h);
  });

  // ----- taillight bar -----
  const tail = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.12, 1.5),
    new THREE.MeshStandardMaterial({ color: ACCENT, emissive: ACCENT, emissiveIntensity: 2.6 })
  );
  tail.position.set(2.16, 0.58, 0);
  car.add(tail);

  // ----- wheels -----
  const fx = -1.28, rx = 1.34, wz = 0.86;
  [[fx, wz], [fx, -wz], [rx, wz], [rx, -wz]].forEach(([x, z]) => {
    const w = buildWheel();
    w.position.set(x, 0.46, z);
    car.add(w);
  });

  return car;
}

function init() {
  const canvas = document.getElementById('car-canvas');
  if (!canvas) return;

  // WebGL support check -> graceful fallback
  try {
    const test = document.createElement('canvas');
    if (!(test.getContext('webgl2') || test.getContext('webgl'))) throw new Error('no webgl');
  } catch (e) {
    document.body.classList.add('no-3d');
    document.dispatchEvent(new CustomEvent('scene:ready'));
    return;
  }

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 1.45, 8);

  // environment reflections
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  // lighting
  scene.add(new THREE.AmbientLight(0xffffff, 0.35));
  const key = new THREE.DirectionalLight(0xffffff, 3.2);
  key.position.set(4, 8, 5);
  scene.add(key);
  const top = new THREE.DirectionalLight(0xdfe7ff, 1.4);
  top.position.set(-3, 7, -2);
  scene.add(top);
  const rimRed = new THREE.PointLight(ACCENT, 110, 20, 2);
  rimRed.position.set(-5, 2.4, -3);
  scene.add(rimRed);
  const rimCool = new THREE.PointLight(0x4f7bff, 80, 20, 2);
  rimCool.position.set(5, 2.2, -2);
  scene.add(rimCool);
  const fill = new THREE.PointLight(0xffffff, 30, 22, 2);
  fill.position.set(0, 3, 6);
  scene.add(fill);

  // car
  const car = buildCar();
  car.rotation.y = KEYS[0].ry;
  scene.add(car);

  // ground contact shadow (radial gradient sprite texture)
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = shadowCanvas.height = 256;
  const sctx = shadowCanvas.getContext('2d');
  const grad = sctx.createRadialGradient(128, 128, 10, 128, 128, 128);
  grad.addColorStop(0, 'rgba(0,0,0,0.55)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  sctx.fillStyle = grad;
  sctx.fillRect(0, 0, 256, 256);
  const shadowTex = new THREE.CanvasTexture(shadowCanvas);
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(7, 4),
    new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.01;
  scene.add(shadow);

  // ---- state + public API ----
  const state = { progress: 0, smooth: 0, pointerX: 0, pointerY: 0, px: 0, py: 0 };
  window.MautschScene = {
    setProgress(p) { state.progress = Math.max(0, Math.min(1, p)); },
    setPointer(x, y) { state.pointerX = x; state.pointerY = y; },
  };

  const lookAt = new THREE.Vector3(0, 0.55, 0);
  const tmpLook = new THREE.Vector3();
  const clock = new THREE.Clock();
  const lerp = (a, b, t) => a + (b - a) * t;

  function render() {
    const t = clock.getElapsedTime();
    state.smooth = lerp(state.smooth, state.progress, 0.08);
    const pose = poseAt(state.smooth);

    // pointer parallax (disabled for reduced motion)
    const pxTarget = reducedMotion ? 0 : state.pointerX;
    const pyTarget = reducedMotion ? 0 : state.pointerY;
    state.px = lerp(state.px, pxTarget, 0.05);
    state.py = lerp(state.py, pyTarget, 0.05);

    camera.position.x = lerp(camera.position.x, pose.cx + state.px * 0.9, 0.06);
    camera.position.y = lerp(camera.position.y, pose.cy + state.py * 0.5, 0.06);
    camera.position.z = lerp(camera.position.z, pose.cz, 0.06);

    tmpLook.set(pose.lx, pose.ly, pose.lz);
    lookAt.lerp(tmpLook, 0.08);
    camera.lookAt(lookAt);

    const idle = reducedMotion ? 0 : t * 0.07;
    car.rotation.y = lerp(car.rotation.y, pose.ry - idle, 0.07) ;
    car.position.x = lerp(car.position.x, pose.px, 0.06);
    car.position.y = reducedMotion ? 0 : Math.sin(t * 0.9) * 0.025;

    renderer.render(scene, camera);
  }

  let raf;
  function loop() { render(); raf = requestAnimationFrame(loop); }
  loop();

  // pause when tab hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else loop();
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }, { passive: true });

  // signal ready after first frames painted
  requestAnimationFrame(() => requestAnimationFrame(() => {
    document.dispatchEvent(new CustomEvent('scene:ready'));
  }));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
