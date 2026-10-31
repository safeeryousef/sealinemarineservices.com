// Interactive 3D boat on animated water for the rentals banner.
// Loaded by main.js only on larger screens when the banner scrolls into view; the photo stays as fallback.
(function () {
  const host = document.querySelector('[data-scene3d]');
  if (!host || !window.THREE) return;
  const T = window.THREE;

  const W = () => host.clientWidth;
  const H = () => host.clientHeight;

  const renderer = new T.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.setSize(W(), H());
  renderer.domElement.className = 'scene3d-canvas';
  renderer.domElement.setAttribute('aria-label', 'Interactive 3D boat – move your pointer to look around');
  renderer.domElement.setAttribute('role', 'img');
  host.appendChild(renderer.domElement);

  const scene = new T.Scene();
  const haze = new T.Color('#d9a27a');
  scene.background = haze;
  scene.fog = new T.Fog(haze, 14, 42);

  const camera = new T.PerspectiveCamera(38, W() / H(), 0.1, 100);

  scene.add(new T.HemisphereLight('#ffe6cc', '#06303d', 0.75));
  const sun = new T.DirectionalLight('#ffd2a1', 0.85);
  sun.position.set(-8, 6, -6);
  scene.add(sun);

  // Water: a subdivided plane whose vertices are moved each frame
  const waterGeo = new T.PlaneGeometry(70, 70, 90, 90);
  waterGeo.rotateX(-Math.PI / 2);
  const water = new T.Mesh(waterGeo, new T.MeshStandardMaterial({ color: '#0a6f80', roughness: 0.45, metalness: 0.1, flatShading: true }));
  scene.add(water);
  const base = waterGeo.attributes.position.array.slice();
  const waveAt = (x, z, t) => Math.sin(x * 0.32 + t * 1.1) * 0.16 + Math.cos(z * 0.41 + t * 1.4) * 0.12 + Math.sin((x + z) * 0.18 + t * 0.7) * 0.1;

  // Boat built from simple shapes in brand colours
  const boat = new T.Group();
  const hullGeo = new T.BoxGeometry(4.4, 0.75, 1.7, 10, 2, 2);
  const hp = hullGeo.attributes.position;
  for (let i = 0; i < hp.count; i++) {
    const x = hp.getX(i), y = hp.getY(i), z = hp.getZ(i);
    const bow = Math.max(0, (x - 0.6) / 1.6);                 // 0 at mid-ship, 1 at the bow
    hp.setZ(i, z * (1 - 0.92 * Math.pow(bow, 1.4)));           // taper to a point
    if (y < 0) hp.setY(i, y + bow * 0.38);                     // raise the keel towards the bow
    if (y < 0) hp.setZ(i, hp.getZ(i) * 0.72);                  // V-shaped bottom
  }
  hullGeo.computeVertexNormals();
  boat.add(new T.Mesh(hullGeo, new T.MeshStandardMaterial({ color: '#f4f6f6', roughness: 0.4, flatShading: true })));

  const stripe = new T.Mesh(new T.BoxGeometry(3.3, 0.12, 1.74), new T.MeshStandardMaterial({ color: '#0b2b3d', roughness: 0.5 }));
  stripe.position.set(-0.35, 0.05, 0);
  boat.add(stripe);
  const accent = new T.Mesh(new T.BoxGeometry(2.6, 0.06, 1.76), new T.MeshStandardMaterial({ color: '#0aa2b5', roughness: 0.5 }));
  accent.position.set(-0.6, -0.08, 0);
  boat.add(accent);

  const deck = new T.Mesh(new T.BoxGeometry(3.4, 0.08, 1.45), new T.MeshStandardMaterial({ color: '#d9cdb8', roughness: 0.8 }));
  deck.position.set(-0.35, 0.4, 0);
  boat.add(deck);
  const cabin = new T.Mesh(new T.BoxGeometry(1.3, 0.55, 1.1), new T.MeshStandardMaterial({ color: '#ffffff', roughness: 0.4, flatShading: true }));
  cabin.position.set(-0.2, 0.7, 0);
  boat.add(cabin);
  const glass = new T.Mesh(new T.BoxGeometry(0.08, 0.38, 1.0), new T.MeshStandardMaterial({ color: '#0b2b3d', roughness: 0.1, metalness: 0.6 }));
  glass.position.set(0.47, 0.74, 0);
  glass.rotation.z = -0.55;
  boat.add(glass);
  const roof = new T.Mesh(new T.BoxGeometry(1.7, 0.06, 1.35), new T.MeshStandardMaterial({ color: '#0aa2b5', roughness: 0.5 }));
  roof.position.set(-0.35, 1.22, 0);
  boat.add(roof);
  [[-1.1, 0.55], [0.35, 0.55], [-1.1, -0.55], [0.35, -0.55]].forEach(([x, z]) => {
    const pole = new T.Mesh(new T.CylinderGeometry(0.025, 0.025, 0.55, 6), new T.MeshStandardMaterial({ color: '#c8d3d6', metalness: 0.8, roughness: 0.3 }));
    pole.position.set(x, 0.95, z);
    boat.add(pole);
  });
  const motor = new T.Mesh(new T.BoxGeometry(0.35, 0.6, 0.45), new T.MeshStandardMaterial({ color: '#0b2b3d', roughness: 0.4 }));
  motor.position.set(-2.4, 0.05, 0);
  boat.add(motor);
  scene.add(boat);

  // Simple wake: foam dots trailing behind the boat
  const foamCount = 160;
  const foamGeo = new T.BufferGeometry();
  const foamPos = new Float32Array(foamCount * 3);
  for (let i = 0; i < foamCount; i++) {
    const d = Math.random() * 9;
    foamPos[i * 3] = -2.6 - d;
    foamPos[i * 3 + 1] = 0.05;
    foamPos[i * 3 + 2] = (Math.random() - 0.5) * (0.6 + d * 0.45);
  }
  foamGeo.setAttribute('position', new T.BufferAttribute(foamPos, 3));
  const foam = new T.Points(foamGeo, new T.PointsMaterial({ color: '#ffffff', size: 0.09, transparent: true, opacity: 0.75 }));
  scene.add(foam);

  // Pointer parallax
  let px = 0, py = 0, tx = 0, ty = 0;
  host.addEventListener('pointermove', e => {
    const r = host.getBoundingClientRect();
    tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
  });
  host.addEventListener('pointerleave', () => { tx = 0; ty = 0; });

  let running = false, raf = 0, angle = 0.65;
  const clock = new T.Clock();
  const pos = waterGeo.attributes.position;

  function frame() {
    const t = clock.getElapsedTime();
    for (let i = 0; i < pos.count; i++) {
      const x = base[i * 3], z = base[i * 3 + 2];
      pos.array[i * 3 + 1] = waveAt(x, z, t);
    }
    pos.needsUpdate = true;
    waterGeo.computeVertexNormals();

    boat.position.y = waveAt(0, 0, t) + 0.12;
    boat.rotation.z = (waveAt(1.5, 0, t) - waveAt(-1.5, 0, t)) * 0.25;
    boat.rotation.x = (waveAt(0, 0.8, t) - waveAt(0, -0.8, t)) * 0.3;
    foam.position.y = boat.position.y - 0.3;

    px += (tx - px) * 0.05;
    py += (ty - py) * 0.05;
    angle += 0.0012;
    const r = 7;
    camera.position.set(Math.cos(angle + px * 0.5) * r, 2.2 - py * 0.9, Math.sin(angle + px * 0.5) * r);
    camera.lookAt(0, 0.45, 0);

    renderer.render(scene, camera);
    if (running) raf = requestAnimationFrame(frame);
  }

  // Only render while the banner is on screen
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !running) { running = true; clock.start(); raf = requestAnimationFrame(frame); }
    else if (!e.isIntersecting && running) { running = false; cancelAnimationFrame(raf); clock.stop(); }
  }).observe(host);

  new ResizeObserver(() => {
    renderer.setSize(W(), H());
    camera.aspect = W() / H();
    camera.updateProjectionMatrix();
    if (!running) renderer.render(scene, camera);
  }).observe(host);

  host.classList.add('scene3d-ready');
})();
