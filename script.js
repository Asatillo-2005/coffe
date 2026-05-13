/* ============================================================
   BREW HAVEN — Realistic 3D Coffee Scene + Coffee Slider
   Three.js (CDN) | Canvas-generated textures for latte art,
   wood, steam, ceramic. Switches per coffee type.
   ============================================================ */

/* ----------------------------------------------------------------
   COFFEE DATA
   Each coffee defines its visual recipe: liquid color, foam style,
   foam height, cup style, latte-art pattern, milk/foam ratio, image.
---------------------------------------------------------------- */
const COFFEES = [
  {
    id: 'espresso',
    name: 'Espresso',
    desc: 'A small but mighty 30ml shot. Thick crema, intense aroma, chocolatey body.',
    short: 'Bold, rich, intense — a classic Italian shot.',
    price: '$3.50',
    img: 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?auto=format&fit=crop&w=600&q=80',
    liquid: 0x2a1306,
    crema: 0xa86b3a,         // foam = crema for espresso
    foamType: 'crema',        // crema | microfoam | latte-art | dollop | none
    foamHeight: 0.04,
    artPattern: 'crema',
    cup: 'demitasse',         // demitasse | tulip | mug | glass
    cupColor: 0xfafaf5,
    cupRoughness: 0.18,
    fillLevel: 0.55,
    steam: 0.9,
  },
  {
    id: 'americano',
    name: 'Americano',
    desc: 'A double shot pulled long with hot water. Smooth, mellow, all-day drinkable.',
    short: 'Espresso lengthened with hot water.',
    price: '$4.00',
    img: 'https://images.unsplash.com/photo-1494314671902-399b18174975?auto=format&fit=crop&w=600&q=80',
    liquid: 0x40200d,
    crema: 0x6b3a1e,
    foamType: 'crema',
    foamHeight: 0.05,
    artPattern: 'crema',
    cup: 'mug',
    cupColor: 0xffffff,
    cupRoughness: 0.22,
    fillLevel: 0.85,
    steam: 1.2,
  },
  {
    id: 'cappuccino',
    name: 'Cappuccino',
    desc: '1/3 espresso, 1/3 steamed milk, 1/3 thick velvety foam dusted with cocoa.',
    short: 'Equal parts espresso, milk, and silky foam.',
    price: '$4.50',
    img: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=600&q=80',
    liquid: 0x6e4628,
    crema: 0xfff2dc,
    foamType: 'microfoam',
    foamHeight: 0.32,
    artPattern: 'cocoa-dust',
    cup: 'tulip',
    cupColor: 0xfaf8f3,
    cupRoughness: 0.2,
    fillLevel: 0.9,
    steam: 1.4,
  },
  {
    id: 'latte',
    name: 'Caffè Latte',
    desc: 'A double shot with steamed milk and a thin layer of microfoam — perfect for art.',
    short: 'Smooth espresso with velvety steamed milk.',
    price: '$5.00',
    img: 'https://images.unsplash.com/photo-1561882468-9110e03e0f78?auto=format&fit=crop&w=600&q=80',
    liquid: 0xb78a63,
    crema: 0xf8e8d0,
    foamType: 'latte-art',
    foamHeight: 0.12,
    artPattern: 'rosetta',
    cup: 'tulip',
    cupColor: 0xf8f4ec,
    cupRoughness: 0.2,
    fillLevel: 0.95,
    steam: 1.0,
  },
  {
    id: 'mocha',
    name: 'Mocha',
    desc: 'Espresso, dark chocolate, steamed milk, topped with whipped cream and cocoa.',
    short: 'Espresso meets chocolate — pure indulgence.',
    price: '$5.50',
    img: 'https://images.unsplash.com/photo-1578314675229-093c1c2a795d?auto=format&fit=crop&w=600&q=80',
    liquid: 0x3d1f10,
    crema: 0xf5e0c7,
    foamType: 'whipped',
    foamHeight: 0.28,
    artPattern: 'cocoa-swirl',
    cup: 'mug',
    cupColor: 0xfff5e6,
    cupRoughness: 0.22,
    fillLevel: 0.92,
    steam: 1.3,
  },
  {
    id: 'macchiato',
    name: 'Macchiato',
    desc: 'Espresso "marked" with a small dollop of foamed milk in the center.',
    short: 'Espresso "marked" with foamed milk.',
    price: '$4.25',
    img: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?auto=format&fit=crop&w=600&q=80',
    liquid: 0x2e1608,
    crema: 0xfff0d4,
    foamType: 'dollop',
    foamHeight: 0.18,
    artPattern: 'dollop',
    cup: 'demitasse',
    cupColor: 0xf6efe5,
    cupRoughness: 0.18,
    fillLevel: 0.6,
    steam: 1.1,
  },
  {
    id: 'flatwhite',
    name: 'Flat White',
    desc: 'Double ristretto with silky microfoam — Australian/NZ classic, no foam dome.',
    short: 'Double shot with silky microfoam.',
    price: '$4.75',
    img: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80',
    liquid: 0x8c5d3a,
    crema: 0xf8efd9,
    foamType: 'microfoam',
    foamHeight: 0.08,
    artPattern: 'tulip',
    cup: 'tulip',
    cupColor: 0xeae5db,
    cupRoughness: 0.22,
    fillLevel: 0.92,
    steam: 1.0,
  },
];

/* =================================================================
   3D COFFEE SCENE
================================================================== */
const CoffeeScene = (() => {
  let scene, camera, renderer, canvas;
  let group, cup, liquid, foam, handle, saucer, spoon, table;
  let steamSprites = [];
  let raf;
  let dragging = false;
  let lastX = 0, lastY = 0;
  let userRotY = 0.4, userRotX = 0;
  let velY = 0;
  let current = COFFEES[0];

  // textures cache
  const texCache = {};
  let foamArtTexture = null;

  /* ---------- helpers: procedural textures via canvas ---------- */
  function makeWoodTexture() {
    if (texCache.wood) return texCache.wood;
    const c = document.createElement('canvas');
    c.width = c.height = 512;
    const ctx = c.getContext('2d');
    // base
    const grad = ctx.createLinearGradient(0, 0, 512, 512);
    grad.addColorStop(0, '#5a3a22');
    grad.addColorStop(0.5, '#3e2614');
    grad.addColorStop(1, '#2a1709');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);
    // grain
    for (let i = 0; i < 220; i++) {
      ctx.strokeStyle = `rgba(${20 + Math.random() * 40},${10 + Math.random() * 20},5,${0.15 + Math.random() * 0.4})`;
      ctx.lineWidth = 0.5 + Math.random() * 1.6;
      ctx.beginPath();
      const y = Math.random() * 512;
      ctx.moveTo(0, y);
      let x = 0;
      while (x < 512) {
        x += 4 + Math.random() * 12;
        ctx.lineTo(x, y + Math.sin(x * 0.05 + i) * 4);
      }
      ctx.stroke();
    }
    // knots
    for (let i = 0; i < 5; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const r = 6 + Math.random() * 14;
      const g2 = ctx.createRadialGradient(x, y, 0, x, y, r);
      g2.addColorStop(0, 'rgba(20,10,5,0.9)');
      g2.addColorStop(1, 'rgba(20,10,5,0)');
      ctx.fillStyle = g2;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(2, 2);
    t.anisotropy = renderer ? renderer.capabilities.getMaxAnisotropy() : 8;
    texCache.wood = t;
    return t;
  }

  function makeCeramicNormal() {
    if (texCache.ceramicN) return texCache.ceramicN;
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const ctx = c.getContext('2d');
    const img = ctx.createImageData(256, 256);
    for (let i = 0; i < img.data.length; i += 4) {
      const n = 128 + (Math.random() - 0.5) * 6;
      img.data[i] = n;       // R = X normal
      img.data[i + 1] = n;   // G = Y normal
      img.data[i + 2] = 255; // B = Z up
      img.data[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    texCache.ceramicN = t;
    return t;
  }

  function makeSteamTexture() {
    if (texCache.steam) return texCache.steam;
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgba(255,255,255,0.55)');
    g.addColorStop(0.4, 'rgba(255,255,255,0.18)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    const t = new THREE.CanvasTexture(c);
    texCache.steam = t;
    return t;
  }

  /* ---------- foam art texture (rebuilt per coffee) ---------- */
  function makeFoamArtTexture(coffee) {
    const c = document.createElement('canvas');
    c.width = c.height = 512;
    const ctx = c.getContext('2d');

    const base = '#' + new THREE.Color(coffee.crema).getHexString();
    const liquidHex = '#' + new THREE.Color(coffee.liquid).getHexString();

    // Base foam color, with subtle swirl
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, 512, 512);

    // subtle texture noise
    for (let i = 0; i < 1500; i++) {
      ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.04})`;
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 1, 1);
    }
    for (let i = 0; i < 800; i++) {
      ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.06})`;
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 1, 1);
    }

    const cx = 256, cy = 256;

    if (coffee.artPattern === 'crema') {
      // espresso crema: ring gradient + tiger striping
      const g = ctx.createRadialGradient(cx, cy, 30, cx, cy, 240);
      g.addColorStop(0, base);
      g.addColorStop(0.6, '#7a4a26');
      g.addColorStop(1, '#3b1f0d');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(cx, cy, 240, 0, Math.PI * 2); ctx.fill();
      // bubbles
      for (let i = 0; i < 80; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = Math.random() * 220;
        ctx.fillStyle = `rgba(255,220,170,${Math.random() * 0.4 + 0.1})`;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, Math.random() * 4 + 1, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (coffee.artPattern === 'rosetta') {
      // latte rosetta art
      ctx.save();
      ctx.translate(cx, cy);
      // base milk pour heart base
      ctx.fillStyle = base;
      ctx.beginPath(); ctx.arc(0, 0, 220, 0, Math.PI * 2); ctx.fill();

      // outer ring of liquid (espresso color showing through)
      ctx.strokeStyle = liquidHex;
      ctx.lineWidth = 26;
      ctx.beginPath(); ctx.arc(0, 0, 215, 0, Math.PI * 2); ctx.stroke();

      // rosetta leaves
      ctx.fillStyle = base;
      const leaves = 7;
      for (let i = 0; i < leaves; i++) {
        const t = i / (leaves - 1);
        const y = -150 + t * 280;
        const w = 130 - Math.abs(t - 0.5) * 160;
        ctx.beginPath();
        ctx.ellipse(0, y, Math.max(20, w), 28, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      // central stem (espresso line drag-through)
      ctx.strokeStyle = liquidHex;
      ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(0, -180); ctx.lineTo(0, 180); ctx.stroke();
      // leaf veins
      ctx.strokeStyle = 'rgba(120,70,40,0.5)';
      ctx.lineWidth = 2;
      for (let i = 0; i < leaves; i++) {
        const t = i / (leaves - 1);
        const y = -150 + t * 280;
        const w = 130 - Math.abs(t - 0.5) * 160;
        ctx.beginPath();
        ctx.moveTo(-Math.max(20, w), y);
        ctx.lineTo(Math.max(20, w), y);
        ctx.stroke();
      }
      ctx.restore();
    } else if (coffee.artPattern === 'tulip') {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.fillStyle = base;
      ctx.beginPath(); ctx.arc(0, 0, 220, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = liquidHex;
      ctx.lineWidth = 26;
      ctx.beginPath(); ctx.arc(0, 0, 215, 0, Math.PI * 2); ctx.stroke();
      // 3 stacked circles + heart
      ctx.fillStyle = base;
      const ys = [-120, -40, 50, 140];
      const rs = [55, 70, 80, 50];
      ys.forEach((y, i) => {
        ctx.beginPath(); ctx.arc(0, y, rs[i], 0, Math.PI * 2); ctx.fill();
      });
      // center drag line
      ctx.strokeStyle = liquidHex;
      ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(0, -180); ctx.lineTo(0, 180); ctx.stroke();
      ctx.restore();
    } else if (coffee.artPattern === 'cocoa-dust') {
      // even foam with cocoa dust on top
      const g = ctx.createRadialGradient(cx, cy, 60, cx, cy, 240);
      g.addColorStop(0, '#fff8ee');
      g.addColorStop(1, base);
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(cx, cy, 240, 0, Math.PI * 2); ctx.fill();
      // cocoa dust
      for (let i = 0; i < 1800; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = Math.random() * 220;
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;
        ctx.fillStyle = `rgba(${60 + Math.random() * 30},${30 + Math.random() * 20},10,${Math.random() * 0.6 + 0.2})`;
        ctx.fillRect(x, y, Math.random() * 2 + 0.5, Math.random() * 2 + 0.5);
      }
    } else if (coffee.artPattern === 'cocoa-swirl') {
      // whipped cream + cocoa swirl
      const g = ctx.createRadialGradient(cx, cy, 30, cx, cy, 240);
      g.addColorStop(0, '#fffaf0');
      g.addColorStop(1, '#e8c896');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(cx, cy, 240, 0, Math.PI * 2); ctx.fill();
      // chocolate swirl
      ctx.strokeStyle = '#3a1a08';
      ctx.lineWidth = 8;
      ctx.beginPath();
      for (let a = 0; a < Math.PI * 6; a += 0.05) {
        const r = a * 12;
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;
        if (a === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      // sprinkle cocoa
      for (let i = 0; i < 200; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = Math.random() * 220;
        ctx.fillStyle = `rgba(60,30,10,${Math.random() * 0.7})`;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, Math.random() * 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (coffee.artPattern === 'dollop') {
      // espresso surface with single milk dollop in center
      const g = ctx.createRadialGradient(cx, cy, 20, cx, cy, 240);
      g.addColorStop(0, '#7a4a26');
      g.addColorStop(0.4, '#4a2814');
      g.addColorStop(1, '#2c1407');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(cx, cy, 240, 0, Math.PI * 2); ctx.fill();
      // bubbles in crema
      for (let i = 0; i < 80; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = Math.random() * 220;
        ctx.fillStyle = `rgba(255,220,170,${Math.random() * 0.4 + 0.1})`;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, Math.random() * 4 + 1, 0, Math.PI * 2);
        ctx.fill();
      }
      // milk dollop
      const md = ctx.createRadialGradient(cx, cy, 0, cx, cy, 110);
      md.addColorStop(0, '#fff8ee');
      md.addColorStop(0.7, '#f8e8c8');
      md.addColorStop(1, 'rgba(248,232,200,0)');
      ctx.fillStyle = md;
      ctx.beginPath(); ctx.arc(cx, cy, 110, 0, Math.PI * 2); ctx.fill();
    }

    // soft vignette so edges blend with cup interior
    const vg = ctx.createRadialGradient(cx, cy, 200, cx, cy, 260);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,0.55)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, 512, 512);

    const t = new THREE.CanvasTexture(c);
    t.anisotropy = renderer ? renderer.capabilities.getMaxAnisotropy() : 8;
    return t;
  }

  /* ---------- cup profiles via LatheGeometry ---------- */
  function buildCupGeometry(style) {
    // returns { outer, inner, rim, footRadius, topRadius, height }
    let pts = [];
    let topR, height, footR;
    if (style === 'demitasse') {
      // small espresso cup
      footR = 0.42; topR = 0.62; height = 0.62;
      pts = [
        [0.42, 0],
        [0.46, 0.04],
        [0.50, 0.12],
        [0.54, 0.30],
        [0.58, 0.50],
        [0.62, 0.62],
      ];
    } else if (style === 'tulip') {
      // cappuccino/latte tulip cup
      footR = 0.46; topR = 0.78; height = 0.95;
      pts = [
        [0.46, 0],
        [0.52, 0.05],
        [0.58, 0.18],
        [0.66, 0.40],
        [0.74, 0.65],
        [0.80, 0.85],
        [0.78, 0.95],
      ];
    } else if (style === 'mug') {
      // straight mug
      footR = 0.62; topR = 0.78; height = 1.05;
      pts = [
        [0.62, 0],
        [0.66, 0.04],
        [0.72, 0.15],
        [0.76, 0.40],
        [0.78, 0.70],
        [0.78, 1.05],
      ];
    } else {
      // glass
      footR = 0.50; topR = 0.78; height = 0.95;
      pts = [
        [0.50, 0],
        [0.56, 0.10],
        [0.66, 0.30],
        [0.74, 0.55],
        [0.78, 0.80],
        [0.78, 0.95],
      ];
    }

    // outer profile (closed bottom)
    const outerPts = pts.map(p => new THREE.Vector2(p[0], p[1]));
    // inner profile: slightly thinner, starting from a bit above 0
    const wall = 0.04;
    const innerPts = [];
    innerPts.push(new THREE.Vector2(0, 0.05));
    innerPts.push(new THREE.Vector2(pts[0][0] - wall, 0.05));
    for (let i = 1; i < pts.length; i++) {
      const p = pts[i];
      innerPts.push(new THREE.Vector2(Math.max(p[0] - wall, 0.01), p[1] - 0.005));
    }
    // close at top to outer rim
    innerPts.push(new THREE.Vector2(pts[pts.length - 1][0], pts[pts.length - 1][1]));

    const outer = new THREE.LatheGeometry(outerPts, 96);
    const inner = new THREE.LatheGeometry(innerPts, 96);

    return { outer, inner, topR, height, footR };
  }

  /* ---------- handle path for a given cup ---------- */
  function buildHandle(cupTopR, cupHeight) {
    // Curved handle using TubeGeometry along a CatmullRomCurve3
    const cy = cupHeight * 0.55;
    const startR = cupTopR - 0.04;
    const out = cupTopR + 0.32;
    const pts = [
      new THREE.Vector3(startR, cy + 0.20, 0),
      new THREE.Vector3(out, cy + 0.18, 0),
      new THREE.Vector3(out + 0.05, cy, 0),
      new THREE.Vector3(out, cy - 0.18, 0),
      new THREE.Vector3(startR, cy - 0.20, 0),
    ];
    const curve = new THREE.CatmullRomCurve3(pts);
    return new THREE.TubeGeometry(curve, 64, 0.045, 16, false);
  }

  /* ---------- spoon ---------- */
  function buildSpoon() {
    const g = new THREE.Group();
    // handle: thin rounded box
    const handleGeo = new THREE.CylinderGeometry(0.025, 0.025, 1.1, 16);
    const metalMat = new THREE.MeshStandardMaterial({
      color: 0xdddee2, metalness: 0.95, roughness: 0.18,
    });
    const h = new THREE.Mesh(handleGeo, metalMat);
    h.rotation.z = Math.PI / 2;
    g.add(h);
    // bowl: scaled sphere
    const bowlGeo = new THREE.SphereGeometry(0.12, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2);
    const b = new THREE.Mesh(bowlGeo, metalMat);
    b.rotation.x = Math.PI;
    b.scale.set(1, 0.3, 1.4);
    b.position.set(0.62, 0, 0);
    g.add(b);
    g.castShadow = true;
    g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    return g;
  }

  /* ---------- build/replace cup assembly ---------- */
  let cupAssembly = null;
  function buildCupAssembly(coffee) {
    if (cupAssembly) {
      group.remove(cupAssembly);
      cupAssembly.traverse(o => {
        if (o.geometry) o.geometry.dispose();
      });
    }
    const assembly = new THREE.Group();

    const { outer, inner, topR, height, footR } = buildCupGeometry(coffee.cup);

    // Ceramic material
    const ceramicMat = new THREE.MeshStandardMaterial({
      color: coffee.cupColor,
      roughness: coffee.cupRoughness,
      metalness: 0.05,
      normalMap: makeCeramicNormal(),
      normalScale: new THREE.Vector2(0.05, 0.05),
      envMapIntensity: 1.2,
    });
    const ceramicInteriorMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(coffee.cupColor).multiplyScalar(0.9),
      roughness: coffee.cupRoughness + 0.05,
      metalness: 0.02,
      side: THREE.BackSide,
    });

    const cupOuter = new THREE.Mesh(outer, ceramicMat);
    cupOuter.castShadow = true;
    cupOuter.receiveShadow = true;
    assembly.add(cupOuter);

    const cupInner = new THREE.Mesh(inner, ceramicInteriorMat);
    cupInner.castShadow = false;
    cupInner.receiveShadow = true;
    assembly.add(cupInner);

    // Liquid (a disk + tapered cylinder underneath)
    const fillH = height * coffee.fillLevel;
    const liquidGeo = new THREE.CylinderGeometry(
      Math.max(topR - 0.06, 0.1),  // top
      Math.max(footR - 0.04, 0.1), // bottom
      fillH,
      64
    );
    const liquidMat = new THREE.MeshPhysicalMaterial({
      color: coffee.liquid,
      roughness: 0.12,
      metalness: 0.0,
      clearcoat: 0.9,
      clearcoatRoughness: 0.25,
      reflectivity: 0.5,
      sheen: 0.4,
      sheenColor: new THREE.Color(coffee.crema).multiplyScalar(0.4),
      envMapIntensity: 1.5,
    });
    const liq = new THREE.Mesh(liquidGeo, liquidMat);
    liq.position.y = fillH / 2 + 0.04;
    assembly.add(liq);

    // Foam disc (sits on top of liquid). For micro/latte-art it's nearly flat;
    // for cappuccino/whipped it's a dome.
    const foamRadius = Math.max(topR - 0.07, 0.1);
    let foamMesh;

    if (coffee.foamType === 'whipped') {
      // dome of whipped cream
      const domeGeo = new THREE.SphereGeometry(foamRadius * 1.05, 48, 32, 0, Math.PI * 2, 0, Math.PI / 2);
      const domeMat = new THREE.MeshStandardMaterial({
        color: 0xfffaf0,
        roughness: 0.85,
        metalness: 0.0,
      });
      foamMesh = new THREE.Mesh(domeGeo, domeMat);
      foamMesh.scale.y = coffee.foamHeight * 4;
      foamMesh.position.y = fillH + 0.04 + 0.01;
      // small chocolate sprinkle disc on top using texture
      const topGeo = new THREE.CircleGeometry(foamRadius * 0.9, 64);
      const topTex = makeFoamArtTexture(coffee);
      const topMat = new THREE.MeshStandardMaterial({
        map: topTex, roughness: 0.7, metalness: 0,
      });
      const topMesh = new THREE.Mesh(topGeo, topMat);
      topMesh.rotation.x = -Math.PI / 2;
      topMesh.position.y = fillH + 0.04 + coffee.foamHeight * 4 * foamRadius * 1.05 - 0.005;
      assembly.add(topMesh);
      foamArtTexture = topTex;
    } else if (coffee.foamType === 'crema' || coffee.foamType === 'latte-art' ||
               coffee.foamType === 'microfoam' || coffee.foamType === 'dollop') {
      // flat top disc with art texture, plus a slight rim ring for thickness
      const tex = makeFoamArtTexture(coffee);
      foamArtTexture = tex;
      const discGeo = new THREE.CircleGeometry(foamRadius, 96);
      const discMat = new THREE.MeshStandardMaterial({
        map: tex, roughness: 0.55, metalness: 0,
      });
      foamMesh = new THREE.Mesh(discGeo, discMat);
      foamMesh.rotation.x = -Math.PI / 2;
      foamMesh.position.y = fillH + 0.045;

      // foam thickness ring (only visible for thick foam)
      if (coffee.foamHeight > 0.1) {
        const ringGeo = new THREE.CylinderGeometry(foamRadius, foamRadius * 0.97, coffee.foamHeight * 0.5, 64, 1, true);
        const ringMat = new THREE.MeshStandardMaterial({
          color: coffee.crema, roughness: 0.85, metalness: 0,
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.y = fillH + 0.045 - coffee.foamHeight * 0.25;
        assembly.add(ring);
      }
    }
    if (foamMesh) assembly.add(foamMesh);
    foam = foamMesh;
    liquid = liq;
    cup = cupOuter;

    // Handle
    const handleGeo = buildHandle(topR, height);
    const handleMesh = new THREE.Mesh(handleGeo, ceramicMat);
    handleMesh.castShadow = true;
    handleMesh.receiveShadow = true;
    assembly.add(handleMesh);
    handle = handleMesh;

    // Save metrics for steam positioning
    assembly.userData = { topR, height, fillH };

    cupAssembly = assembly;
    group.add(assembly);
  }

  /* ---------- saucer (depends on cup style: small for demitasse) ---------- */
  let saucerMesh = null;
  function buildSaucer(coffee) {
    if (saucerMesh) {
      group.remove(saucerMesh);
      saucerMesh.geometry.dispose();
    }
    const isSmall = coffee.cup === 'demitasse';
    const r = isSmall ? 0.85 : 1.15;
    // saucer profile
    const sPts = [
      new THREE.Vector2(0, 0),
      new THREE.Vector2(0.25, 0.005),
      new THREE.Vector2(0.5, 0.012),
      new THREE.Vector2(r * 0.75, 0.020),
      new THREE.Vector2(r * 0.92, 0.045),
      new THREE.Vector2(r, 0.06),
      new THREE.Vector2(r - 0.01, 0.07),
      new THREE.Vector2(r * 0.92, 0.07),
    ];
    const geo = new THREE.LatheGeometry(sPts, 96);
    const mat = new THREE.MeshStandardMaterial({
      color: coffee.cupColor,
      roughness: coffee.cupRoughness + 0.02,
      metalness: 0.05,
      normalMap: makeCeramicNormal(),
      normalScale: new THREE.Vector2(0.04, 0.04),
    });
    saucerMesh = new THREE.Mesh(geo, mat);
    saucerMesh.position.y = -0.07;
    saucerMesh.castShadow = true;
    saucerMesh.receiveShadow = true;
    group.add(saucerMesh);
    saucer = saucerMesh;
  }

  /* ---------- steam: sprite-based wisps ---------- */
  function buildSteam() {
    const tex = makeSteamTexture();
    const COUNT = 14;
    for (let i = 0; i < COUNT; i++) {
      const mat = new THREE.SpriteMaterial({
        map: tex,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        color: 0xffffff,
      });
      const s = new THREE.Sprite(mat);
      s.scale.set(0.5, 0.5, 1);
      s.userData = {
        speed: 0.005 + Math.random() * 0.012,
        wob: Math.random() * Math.PI * 2,
        wobSpd: 0.5 + Math.random() * 1.5,
        seed: Math.random(),
        startDelay: Math.random() * 2,
      };
      group.add(s);
      steamSprites.push(s);
    }
  }

  /* ---------- ambient particles for warmth ---------- */
  function buildAmbientDust() {
    const N = 60;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 1] = Math.random() * 4 - 0.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xffd9aa,
      size: 0.04,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const pts = new THREE.Points(geo, mat);
    pts.userData.geo = geo;
    scene.add(pts);
    return pts;
  }
  let dust;

  /* ---------- env map for nice reflections ---------- */
  function buildEnv() {
    // Generate a soft warm gradient cube via PMREM from a CanvasTexture
    const c = document.createElement('canvas');
    c.width = 512; c.height = 256;
    const ctx = c.getContext('2d');
    const g = ctx.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, '#3a1f12');
    g.addColorStop(0.4, '#7a4a26');
    g.addColorStop(0.55, '#e6b07a');
    g.addColorStop(0.7, '#5a3520');
    g.addColorStop(1, '#1c0f08');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 512, 256);
    // a few warm light spots
    for (let i = 0; i < 6; i++) {
      const x = Math.random() * 512;
      const y = 60 + Math.random() * 60;
      const r = 30 + Math.random() * 60;
      const rg = ctx.createRadialGradient(x, y, 0, x, y, r);
      rg.addColorStop(0, 'rgba(255,210,150,0.9)');
      rg.addColorStop(1, 'rgba(255,210,150,0)');
      ctx.fillStyle = rg;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
    const tex = new THREE.CanvasTexture(c);
    tex.mapping = THREE.EquirectangularReflectionMapping;
    tex.colorSpace = THREE.SRGBColorSpace;

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromEquirectangular(tex).texture;
    pmrem.dispose();
    return envTex;
  }

  /* ---------- INIT ---------- */
  function init() {
    canvas = document.getElementById('coffee-canvas');
    if (!canvas) return;
    const wrap = document.getElementById('canvas-wrap');
    const w = wrap.clientWidth, h = wrap.clientHeight;

    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x1a0c06, 6, 16);

    camera = new THREE.PerspectiveCamera(35, w / h, 0.1, 100);
    camera.position.set(0, 1.5, 4.6);
    camera.lookAt(0, 0.5, 0);

    renderer = new THREE.WebGLRenderer({
      canvas, antialias: true, alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h, false);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    // Env
    scene.environment = buildEnv();

    // ---------- Lights ----------
    const ambient = new THREE.AmbientLight(0xffe9cc, 0.35);
    scene.add(ambient);

    // Key (warm overhead like a cafe pendant)
    const key = new THREE.SpotLight(0xffd1a0, 4.5, 12, Math.PI / 5, 0.4, 1.2);
    key.position.set(1.5, 4.2, 2.2);
    key.target.position.set(0, 0.5, 0);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.bias = -0.0005;
    key.shadow.radius = 4;
    scene.add(key);
    scene.add(key.target);

    // Rim light (cool kiss from window)
    const rim = new THREE.DirectionalLight(0x88aaff, 0.4);
    rim.position.set(-3, 2, -3);
    scene.add(rim);

    // Practical fill warm
    const fill = new THREE.PointLight(0xffaa66, 0.6, 6);
    fill.position.set(0, 1.6, 2.5);
    scene.add(fill);

    // ---------- Group ----------
    group = new THREE.Group();
    scene.add(group);

    // ---------- Wooden table ----------
    const tableGeo = new THREE.CircleGeometry(5, 64);
    const tableMat = new THREE.MeshStandardMaterial({
      map: makeWoodTexture(),
      roughness: 0.7,
      metalness: 0.05,
    });
    table = new THREE.Mesh(tableGeo, tableMat);
    table.rotation.x = -Math.PI / 2;
    table.position.y = -0.071;
    table.receiveShadow = true;
    scene.add(table);

    // soft contact shadow patch under saucer
    const shadowGeo = new THREE.CircleGeometry(1.4, 32);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000, transparent: true, opacity: 0.25, depthWrite: false,
    });
    const sh = new THREE.Mesh(shadowGeo, shadowMat);
    sh.rotation.x = -Math.PI / 2;
    sh.position.y = -0.069;
    scene.add(sh);

    // ---------- Build initial cup + saucer + spoon + steam ----------
    buildSaucer(current);
    buildCupAssembly(current);

    spoon = buildSpoon();
    spoon.position.set(0.95, -0.04, 0.55);
    spoon.rotation.y = -0.6;
    spoon.rotation.z = 0.06;
    group.add(spoon);

    buildSteam();
    dust = buildAmbientDust();

    // ---------- Interaction ----------
    bindDrag();
    window.addEventListener('resize', onResize);
    onResize();
    animate();
  }

  function onResize() {
    if (!renderer) return;
    const wrap = document.getElementById('canvas-wrap');
    const w = wrap.clientWidth, h = wrap.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  function bindDrag() {
    const onDown = (x, y) => { dragging = true; lastX = x; lastY = y; velY = 0; };
    const onMove = (x, y) => {
      if (!dragging) return;
      const dx = x - lastX, dy = y - lastY;
      userRotY += dx * 0.01;
      userRotX = Math.max(-0.5, Math.min(0.5, userRotX + dy * 0.005));
      velY = dx * 0.01;
      lastX = x; lastY = y;
    };
    const onUp = () => { dragging = false; };

    canvas.addEventListener('mousedown', e => onDown(e.clientX, e.clientY));
    window.addEventListener('mousemove', e => onMove(e.clientX, e.clientY));
    window.addEventListener('mouseup', onUp);
    canvas.addEventListener('touchstart', e => {
      const t = e.touches[0]; onDown(t.clientX, t.clientY);
    }, { passive: true });
    canvas.addEventListener('touchmove', e => {
      const t = e.touches[0]; onMove(t.clientX, t.clientY);
    }, { passive: true });
    canvas.addEventListener('touchend', onUp);
  }

  function animate() {
    raf = requestAnimationFrame(animate);
    const t = performance.now() * 0.001;

    // idle rotation
    if (!dragging) {
      userRotY += velY * 0.96 + 0.0025;
      velY *= 0.92;
    }
    group.rotation.y = userRotY;
    group.rotation.x = userRotX;
    group.position.y = Math.sin(t * 1.2) * 0.012;

    // steam animation
    const ud = cupAssembly ? cupAssembly.userData : { topR: 0.6, fillH: 0.6 };
    const baseY = ud.fillH + 0.18;
    const steamPower = current.steam;
    steamSprites.forEach((s, i) => {
      const u = s.userData;
      const lifeT = (t * 0.5 + u.seed * 4) % 3;  // 3s lifecycle
      const life = lifeT / 3;
      // position: rises from rim, drifts
      const a = u.seed * Math.PI * 2 + t * 0.4;
      const r = 0.05 + life * 0.35;
      s.position.x = Math.cos(a) * r + Math.sin(t * u.wobSpd + u.wob) * 0.05;
      s.position.z = Math.sin(a) * r + Math.cos(t * u.wobSpd + u.wob) * 0.05;
      s.position.y = baseY + life * 1.4;
      // scale grows
      const sc = 0.25 + life * 0.9;
      s.scale.set(sc, sc, 1);
      // opacity: in then out
      const fade = Math.sin(life * Math.PI);
      s.material.opacity = Math.max(0, fade * 0.5 * steamPower);
      s.material.rotation = u.wob + t * 0.2;
    });

    // dust drift
    if (dust) {
      const arr = dust.userData.geo.attributes.position.array;
      for (let i = 0; i < arr.length; i += 3) {
        arr[i + 1] += 0.001;
        arr[i] += Math.sin(t + i) * 0.0008;
        if (arr[i + 1] > 4) arr[i + 1] = -0.5;
      }
      dust.userData.geo.attributes.position.needsUpdate = true;
    }

    renderer.render(scene, camera);
  }

  function setCoffee(coffee) {
    current = coffee;
    // Animate a quick scale-out then rebuild
    if (cupAssembly) {
      const start = performance.now();
      const dur = 280;
      const initialScale = 1;
      const animateOut = () => {
        const k = Math.min(1, (performance.now() - start) / dur);
        const s = initialScale * (1 - k * 0.15);
        cupAssembly.scale.set(s, 1 - k * 0.05, s);
        cupAssembly.rotation.y = group.rotation.y * 0 + k * 0.3;
        if (k < 1) requestAnimationFrame(animateOut);
        else {
          buildSaucer(coffee);
          buildCupAssembly(coffee);
          // pop-in
          cupAssembly.scale.set(0.85, 0.85, 0.85);
          const t0 = performance.now();
          const popDur = 380;
          const animateIn = () => {
            const k2 = Math.min(1, (performance.now() - t0) / popDur);
            const e = 1 - Math.pow(1 - k2, 3);
            const s2 = 0.85 + e * 0.15;
            cupAssembly.scale.set(s2, s2, s2);
            if (k2 < 1) requestAnimationFrame(animateIn);
          };
          animateIn();
        }
      };
      animateOut();
    } else {
      buildSaucer(coffee);
      buildCupAssembly(coffee);
    }
    // little spin
    velY = 0.18;
  }

  return { init, setCoffee };
})();

/* =================================================================
   SLIDER
================================================================== */
const Slider = (() => {
  const sliderEl = document.getElementById('slider');
  const dotsEl = document.getElementById('slider-dots');
  const prevBtn = document.querySelector('.slider-arrow.prev');
  const nextBtn = document.querySelector('.slider-arrow.next');
  const nameEl = document.getElementById('coffee-name');
  const descEl = document.getElementById('coffee-desc');
  const priceEl = document.getElementById('coffee-price');
  const currentBox = document.querySelector('.current-coffee');

  let active = 0;

  function build() {
    COFFEES.forEach((c, i) => {
      const card = document.createElement('button');
      card.className = 'coffee-card' + (i === 0 ? ' active' : '');
      card.type = 'button';
      card.dataset.index = i;
      card.innerHTML = `
        <div class="card-img">
          <img src="${c.img}" alt="${c.name}" loading="lazy" />
          <div class="card-img-overlay"></div>
        </div>
        <div class="card-body">
          <h3>${c.name}</h3>
          <p>${c.short}</p>
          <span class="price">${c.price}</span>
        </div>
      `;
      card.addEventListener('click', () => select(i, true));
      sliderEl.appendChild(card);

      const dot = document.createElement('span');
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => select(i, true));
      dotsEl.appendChild(dot);
    });

    prevBtn.addEventListener('click', () =>
      select((active - 1 + COFFEES.length) % COFFEES.length, true));
    nextBtn.addEventListener('click', () =>
      select((active + 1) % COFFEES.length, true));

    document.addEventListener('keydown', (e) => {
      if (e.target.closest('input, textarea')) return;
      if (e.key === 'ArrowLeft') prevBtn.click();
      if (e.key === 'ArrowRight') nextBtn.click();
    });

    // Update text for first coffee
    const first = COFFEES[0];
    nameEl.textContent = first.name;
    descEl.textContent = first.desc;
    priceEl.textContent = first.price;
  }

  function select(i, scrollInto) {
    active = i;
    const cards = sliderEl.querySelectorAll('.coffee-card');
    const dots = dotsEl.querySelectorAll('span');
    cards.forEach((c, idx) => c.classList.toggle('active', idx === i));
    dots.forEach((d, idx) => d.classList.toggle('active', idx === i));

    if (scrollInto) {
      cards[i].scrollIntoView({
        behavior: 'smooth', inline: 'center', block: 'nearest',
      });
    }

    currentBox.classList.remove('changing');
    void currentBox.offsetWidth;
    currentBox.classList.add('changing');
    setTimeout(() => {
      nameEl.textContent = COFFEES[i].name;
      descEl.textContent = COFFEES[i].desc;
      priceEl.textContent = COFFEES[i].price;
    }, 220);

    CoffeeScene.setCoffee(COFFEES[i]);
  }

  return { build };
})();

window.addEventListener('DOMContentLoaded', () => {
  Slider.build();
  CoffeeScene.init();
});
