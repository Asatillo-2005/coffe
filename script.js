/* ============================================================
   BREW HAVEN — 3D Coffee Scene + Coffee Type Slider
   Built with Three.js (loaded via CDN)
   ============================================================ */

// ---------- COFFEE DATA ----------
const COFFEES = [
  {
    id: 'espresso',
    name: 'Espresso',
    emoji: '\u2615',
    desc: 'Bold, rich, intense — a classic Italian shot.',
    longDesc: 'Bold, rich, intense — a classic Italian shot.',
    price: '$3.50',
    liquidColor: 0x2b1407,
    foamColor: 0x6b4226,
    foamHeight: 0.05,
    cupHeight: 0.55,
    cupColor: 0xf5f5f0,
    steamIntensity: 1.0,
  },
  {
    id: 'americano',
    name: 'Americano',
    emoji: '\u2615',
    desc: 'Espresso lengthened with hot water for a smooth body.',
    longDesc: 'Espresso lengthened with hot water for a smooth body.',
    price: '$4.00',
    liquidColor: 0x3a1f0e,
    foamColor: 0x7a4a2a,
    foamHeight: 0.08,
    cupHeight: 0.85,
    cupColor: 0xffffff,
    steamIntensity: 1.2,
  },
  {
    id: 'cappuccino',
    name: 'Cappuccino',
    emoji: '\u2615',
    desc: 'Equal parts espresso, steamed milk, and silky foam.',
    longDesc: 'Equal parts espresso, steamed milk, and silky foam.',
    price: '$4.50',
    liquidColor: 0x8b5a3c,
    foamColor: 0xfff5e6,
    foamHeight: 0.35,
    cupHeight: 0.85,
    cupColor: 0xfaf8f3,
    steamIntensity: 1.4,
  },
  {
    id: 'latte',
    name: 'Latte',
    emoji: '\u2615',
    desc: 'Smooth espresso with velvety steamed milk and a kiss of foam.',
    longDesc: 'Smooth espresso with velvety steamed milk and a kiss of foam.',
    price: '$5.00',
    liquidColor: 0xc9a37a,
    foamColor: 0xfff5e6,
    foamHeight: 0.18,
    cupHeight: 1.1,
    cupColor: 0xf8f8f3,
    steamIntensity: 1.0,
  },
  {
    id: 'mocha',
    name: 'Mocha',
    emoji: '\u2615',
    desc: 'Espresso, chocolate, steamed milk — pure indulgence.',
    longDesc: 'Espresso, chocolate, steamed milk — pure indulgence.',
    price: '$5.50',
    liquidColor: 0x4a2718,
    foamColor: 0xd4a574,
    foamHeight: 0.25,
    cupHeight: 1.0,
    cupColor: 0xfff8e8,
    steamIntensity: 1.3,
  },
  {
    id: 'macchiato',
    name: 'Macchiato',
    emoji: '\u2615',
    desc: 'Espresso \u201Cmarked\u201D with a dollop of foamed milk.',
    longDesc: 'Espresso "marked" with a dollop of foamed milk.',
    price: '$4.25',
    liquidColor: 0x351a0a,
    foamColor: 0xffefd5,
    foamHeight: 0.15,
    cupHeight: 0.65,
    cupColor: 0xf8f0e8,
    steamIntensity: 1.1,
  },
  {
    id: 'flatwhite',
    name: 'Flat White',
    emoji: '\u2615',
    desc: 'A double shot with silky microfoam — Australian classic.',
    longDesc: 'A double shot with silky microfoam — Australian classic.',
    price: '$4.75',
    liquidColor: 0xa67855,
    foamColor: 0xfff8ee,
    foamHeight: 0.1,
    cupHeight: 0.75,
    cupColor: 0xeeeae0,
    steamIntensity: 1.1,
  },
];

// ============================================================
//                    3D COFFEE SCENE
// ============================================================
const CoffeeScene = (() => {
  let scene, camera, renderer, canvas;
  let cup, liquid, foam, handle, saucer, group;
  let steamParticles, steamGeo, steamMat;
  let raf;
  let dragging = false;
  let lastX = 0, lastY = 0;
  let userRotY = 0, userRotX = 0;
  let velY = 0;
  let current = COFFEES[0];

  // Smooth tween targets
  const target = {
    liquidColor: new THREE.Color(current.liquidColor),
    foamColor: new THREE.Color(current.foamColor),
    cupColor: new THREE.Color(current.cupColor),
    cupScaleY: current.cupHeight / 0.85,
    foamScale: current.foamHeight,
    steam: current.steamIntensity,
  };
  const live = {
    liquidColor: new THREE.Color(current.liquidColor),
    foamColor: new THREE.Color(current.foamColor),
    cupColor: new THREE.Color(current.cupColor),
    cupScaleY: target.cupScaleY,
    foamScale: target.foamScale,
    steam: target.steam,
  };

  function init() {
    canvas = document.getElementById('coffee-canvas');
    if (!canvas) return;

    const wrap = document.getElementById('canvas-wrap');
    const size = wrap.clientWidth;

    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x1a0f0a, 6, 14);

    camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 1.4, 5.2);
    camera.lookAt(0, 0.6, 0);

    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(size, size, false);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // ---------- Lights ----------
    const ambient = new THREE.AmbientLight(0xffe4cc, 0.45);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xffd9b3, 1.4);
    keyLight.position.set(4, 6, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 20;
    keyLight.shadow.camera.left = -4;
    keyLight.shadow.camera.right = 4;
    keyLight.shadow.camera.top = 4;
    keyLight.shadow.camera.bottom = -4;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xe8a87c, 0.8);
    rimLight.position.set(-3, 2, -3);
    scene.add(rimLight);

    const fillLight = new THREE.PointLight(0xffaa66, 0.6, 8);
    fillLight.position.set(0, 2, 3);
    scene.add(fillLight);

    // ---------- Group for the whole cup setup ----------
    group = new THREE.Group();
    scene.add(group);

    // ---------- Saucer ----------
    const saucerGeo = new THREE.CylinderGeometry(1.3, 1.4, 0.08, 64);
    const saucerMat = new THREE.MeshStandardMaterial({
      color: 0xf5f5f0,
      roughness: 0.4,
      metalness: 0.05,
    });
    saucer = new THREE.Mesh(saucerGeo, saucerMat);
    saucer.position.y = -0.04;
    saucer.castShadow = true;
    saucer.receiveShadow = true;
    group.add(saucer);

    // ---------- Cup (open cylinder) ----------
    const cupOuter = new THREE.CylinderGeometry(0.85, 0.6, 0.85, 64, 1, true);
    const cupMat = new THREE.MeshStandardMaterial({
      color: current.cupColor,
      roughness: 0.25,
      metalness: 0.1,
      side: THREE.DoubleSide,
    });
    cup = new THREE.Mesh(cupOuter, cupMat);
    cup.position.y = 0.45;
    cup.castShadow = true;
    cup.receiveShadow = true;
    group.add(cup);

    // Cup bottom (a small disk so light doesn't bleed through)
    const bottomGeo = new THREE.CircleGeometry(0.6, 64);
    const bottom = new THREE.Mesh(bottomGeo, cupMat);
    bottom.rotation.x = -Math.PI / 2;
    bottom.position.y = 0.04;
    group.add(bottom);

    // ---------- Liquid ----------
    const liquidGeo = new THREE.CylinderGeometry(0.78, 0.55, 0.6, 64);
    const liquidMat = new THREE.MeshStandardMaterial({
      color: current.liquidColor,
      roughness: 0.15,
      metalness: 0.6,
      emissive: 0x1a0a04,
      emissiveIntensity: 0.15,
    });
    liquid = new THREE.Mesh(liquidGeo, liquidMat);
    liquid.position.y = 0.4;
    group.add(liquid);

    // ---------- Foam ----------
    const foamGeo = new THREE.SphereGeometry(0.78, 48, 32, 0, Math.PI * 2, 0, Math.PI / 2);
    const foamMat = new THREE.MeshStandardMaterial({
      color: current.foamColor,
      roughness: 0.85,
      metalness: 0.0,
      flatShading: false,
    });
    foam = new THREE.Mesh(foamGeo, foamMat);
    foam.position.y = 0.7;
    foam.scale.y = current.foamHeight;
    foam.castShadow = true;
    group.add(foam);

    // Add subtle foam bubbles
    const bubbleGroup = new THREE.Group();
    for (let i = 0; i < 18; i++) {
      const r = 0.04 + Math.random() * 0.05;
      const geo = new THREE.SphereGeometry(r, 12, 12);
      const mat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.6,
        transparent: true,
        opacity: 0.5,
      });
      const b = new THREE.Mesh(geo, mat);
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 0.6;
      b.position.set(Math.cos(angle) * radius, 0.02, Math.sin(angle) * radius);
      bubbleGroup.add(b);
    }
    foam.add(bubbleGroup);

    // ---------- Handle ----------
    const handleGeo = new THREE.TorusGeometry(0.32, 0.07, 16, 48, Math.PI);
    handle = new THREE.Mesh(handleGeo, cupMat);
    handle.position.set(0.85, 0.45, 0);
    handle.rotation.z = -Math.PI / 2;
    handle.rotation.y = Math.PI / 2;
    handle.castShadow = true;
    group.add(handle);

    // ---------- Steam particles ----------
    steamGeo = new THREE.BufferGeometry();
    const COUNT = 80;
    const positions = new Float32Array(COUNT * 3);
    const speeds = new Float32Array(COUNT);
    const offsets = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = Math.random() * 0.4;
      positions[i * 3] = Math.cos(a) * r;
      positions[i * 3 + 1] = 0.8 + Math.random() * 0.5;
      positions[i * 3 + 2] = Math.sin(a) * r;
      speeds[i] = 0.003 + Math.random() * 0.006;
      offsets[i] = Math.random() * Math.PI * 2;
    }
    steamGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    steamGeo.userData = { speeds, offsets, count: COUNT };

    steamMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.18,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    steamParticles = new THREE.Points(steamGeo, steamMat);
    group.add(steamParticles);

    // ---------- Ground plane (catches shadow) ----------
    const planeGeo = new THREE.PlaneGeometry(10, 10);
    const planeMat = new THREE.ShadowMaterial({ opacity: 0.35 });
    const plane = new THREE.Mesh(planeGeo, planeMat);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -0.08;
    plane.receiveShadow = true;
    scene.add(plane);

    // ---------- Interactivity ----------
    bindDrag();
    window.addEventListener('resize', onResize);

    onResize();
    animate();
  }

  function onResize() {
    if (!renderer) return;
    const wrap = document.getElementById('canvas-wrap');
    const size = wrap.clientWidth;
    renderer.setSize(size, size, false);
    camera.aspect = 1;
    camera.updateProjectionMatrix();
  }

  function bindDrag() {
    const onDown = (x, y) => { dragging = true; lastX = x; lastY = y; velY = 0; };
    const onMove = (x, y) => {
      if (!dragging) return;
      const dx = x - lastX;
      const dy = y - lastY;
      userRotY += dx * 0.01;
      userRotX = Math.max(-0.6, Math.min(0.6, userRotX + dy * 0.005));
      velY = dx * 0.01;
      lastX = x;
      lastY = y;
    };
    const onUp = () => { dragging = false; };

    canvas.addEventListener('mousedown', (e) => onDown(e.clientX, e.clientY));
    window.addEventListener('mousemove', (e) => onMove(e.clientX, e.clientY));
    window.addEventListener('mouseup', onUp);

    canvas.addEventListener('touchstart', (e) => {
      const t = e.touches[0]; onDown(t.clientX, t.clientY);
    }, { passive: true });
    canvas.addEventListener('touchmove', (e) => {
      const t = e.touches[0]; onMove(t.clientX, t.clientY);
    }, { passive: true });
    canvas.addEventListener('touchend', onUp);
  }

  function lerp(a, b, t) { return a + (b - a) * t; }

  function tweenColors(t) {
    live.liquidColor.lerp(target.liquidColor, t);
    live.foamColor.lerp(target.foamColor, t);
    live.cupColor.lerp(target.cupColor, t);
    live.cupScaleY = lerp(live.cupScaleY, target.cupScaleY, t);
    live.foamScale = lerp(live.foamScale, target.foamScale, t);
    live.steam = lerp(live.steam, target.steam, t);

    liquid.material.color.copy(live.liquidColor);
    foam.material.color.copy(live.foamColor);
    cup.material.color.copy(live.cupColor);
    cup.scale.y = live.cupScaleY;
    foam.scale.y = live.foamScale;
    foam.position.y = 0.05 + 0.85 * live.cupScaleY;
    steamMat.opacity = 0.35 * live.steam;
  }

  function animate() {
    raf = requestAnimationFrame(animate);
    const t = performance.now() * 0.001;

    // Idle rotation when not dragging
    if (!dragging) {
      userRotY += velY * 0.96 + 0.003;
      velY *= 0.9;
    }

    group.rotation.y = userRotY;
    group.rotation.x = userRotX;
    // Gentle bob
    group.position.y = Math.sin(t * 1.5) * 0.03;

    // Tween properties
    tweenColors(0.08);

    // Animate steam
    const pos = steamGeo.attributes.position.array;
    const { speeds, offsets, count } = steamGeo.userData;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] += speeds[i] * live.steam;
      // Gentle wobble
      pos[i * 3] += Math.sin(t * 2 + offsets[i]) * 0.0015;
      pos[i * 3 + 2] += Math.cos(t * 2 + offsets[i]) * 0.0015;
      if (pos[i * 3 + 1] > 2.6) {
        const a = Math.random() * Math.PI * 2;
        const r = Math.random() * 0.4;
        pos[i * 3] = Math.cos(a) * r;
        pos[i * 3 + 1] = 0.8 + Math.random() * 0.2;
        pos[i * 3 + 2] = Math.sin(a) * r;
      }
    }
    steamGeo.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
  }

  function setCoffee(coffee) {
    current = coffee;
    target.liquidColor.set(coffee.liquidColor);
    target.foamColor.set(coffee.foamColor);
    target.cupColor.set(coffee.cupColor);
    target.cupScaleY = coffee.cupHeight / 0.85;
    target.foamScale = coffee.foamHeight;
    target.steam = coffee.steamIntensity;
    // Spin nudge for delight
    velY = 0.15;
  }

  return { init, setCoffee };
})();

// ============================================================
//                       SLIDER
// ============================================================
const Slider = (() => {
  const sliderEl = document.getElementById('slider');
  const dotsEl = document.getElementById('slider-dots');
  const prevBtn = document.querySelector('.slider-arrow.prev');
  const nextBtn = document.querySelector('.slider-arrow.next');
  const nameEl = document.getElementById('coffee-name');
  const descEl = document.getElementById('coffee-desc');
  const currentBox = document.querySelector('.current-coffee');

  let activeIndex = 0;

  function build() {
    COFFEES.forEach((c, i) => {
      const card = document.createElement('div');
      card.className = 'coffee-card' + (i === 0 ? ' active' : '');
      card.dataset.index = i;
      card.innerHTML = `
        <div class="card-emoji">${c.emoji}</div>
        <h3>${c.name}</h3>
        <p>${c.desc}</p>
        <span class="price">${c.price}</span>
      `;
      card.addEventListener('click', () => select(i, true));
      sliderEl.appendChild(card);

      const dot = document.createElement('span');
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => select(i, true));
      dotsEl.appendChild(dot);
    });

    prevBtn.addEventListener('click', () => select(
      (activeIndex - 1 + COFFEES.length) % COFFEES.length, true
    ));
    nextBtn.addEventListener('click', () => select(
      (activeIndex + 1) % COFFEES.length, true
    ));

    // Keyboard arrows
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') prevBtn.click();
      if (e.key === 'ArrowRight') nextBtn.click();
    });
  }

  function select(i, scrollInto) {
    activeIndex = i;
    const cards = sliderEl.querySelectorAll('.coffee-card');
    const dots = dotsEl.querySelectorAll('span');
    cards.forEach((c, idx) => c.classList.toggle('active', idx === i));
    dots.forEach((d, idx) => d.classList.toggle('active', idx === i));

    if (scrollInto) {
      cards[i].scrollIntoView({
        behavior: 'smooth', inline: 'center', block: 'nearest',
      });
    }

    // Update text labels with little fade animation
    currentBox.classList.remove('changing');
    void currentBox.offsetWidth;
    currentBox.classList.add('changing');
    setTimeout(() => {
      nameEl.textContent = COFFEES[i].name;
      descEl.textContent = COFFEES[i].longDesc;
    }, 250);

    // Update 3D scene
    CoffeeScene.setCoffee(COFFEES[i]);
  }

  return { build };
})();

// ============================================================
//                       BOOT
// ============================================================
window.addEventListener('DOMContentLoaded', () => {
  Slider.build();
  CoffeeScene.init();
});
