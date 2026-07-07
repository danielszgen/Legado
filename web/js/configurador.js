/* ============================================================
   LEGADO · configurador.js
   ------------------------------------------------------------
   Configurador 3D de sillón (Three.js r128, global THREE).
   - 4 modelos paramétricos basados en Nordic / Venus / Baltic /
     Lara (Moher Mobiliario) reconstruidos con geometría simple.
   - Rotación 360º por arrastre (turntable).
   - 5 escenarios: estudio infinito marfil + 4 salas con estilos.
   - Modo día / noche con transición de iluminación.
   - 4 posturas de reclinado animadas (respaldo + piecero).
   - Tapizados (cuero, lino, bouclé, terciopelo) y maderas.
   ------------------------------------------------------------
   En Shopify: tapizado/color/mecanismo = opciones de variante;
   sala, luz y postura = presentación (line item properties).
   ============================================================ */
(function () {
  'use strict';
  if (typeof THREE === 'undefined') return;

  const D = window.LEGADO;
  const lerp = THREE.MathUtils.lerp;

  /* —— Texturas procedurales (bump) ———————————————————————— */
  const texCache = {};
  function makeBump(kind) {
    if (texCache[kind]) return texCache[kind];
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d');
    g.fillStyle = '#808080';
    g.fillRect(0, 0, 128, 128);
    if (kind === 'lino') {
      g.strokeStyle = 'rgba(255,255,255,0.25)'; g.lineWidth = 1;
      for (let i = 0; i < 128; i += 3) {
        g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 128); g.stroke();
        g.beginPath(); g.moveTo(0, i); g.lineTo(128, i); g.stroke();
      }
    } else if (kind === 'boucle') {
      for (let i = 0; i < 900; i++) {
        const r = 1 + Math.random() * 1.6;
        g.fillStyle = 'rgba(255,255,255,' + (0.15 + Math.random() * 0.3) + ')';
        g.beginPath();
        g.arc(Math.random() * 128, Math.random() * 128, r, 0, 7);
        g.fill();
      }
    } else if (kind === 'cuero') {
      for (let i = 0; i < 2600; i++) {
        g.fillStyle = 'rgba(' + (Math.random() > 0.5 ? '255,255,255' : '0,0,0') + ',0.06)';
        g.fillRect(Math.random() * 128, Math.random() * 128, 1.4, 1.4);
      }
    } else if (kind === 'terciopelo') {
      for (let i = 0; i < 4000; i++) {
        g.fillStyle = 'rgba(255,255,255,0.04)';
        g.fillRect(Math.random() * 128, Math.random() * 128, 1, 1);
      }
    } else if (kind === 'madera') {
      for (let i = 0; i < 128; i += 4) {
        g.strokeStyle = 'rgba(0,0,0,' + (0.04 + Math.random() * 0.12) + ')';
        g.lineWidth = 1 + Math.random() * 2;
        g.beginPath();
        g.moveTo(i + Math.random() * 3, 0);
        g.bezierCurveTo(i + 4, 40, i - 4, 90, i + Math.random() * 3, 128);
        g.stroke();
      }
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(3, 3);
    texCache[kind] = t;
    return t;
  }

  /* Mancha radial para la sombra de contacto. Blanco→oscuro con
     MultiplyBlending: oscurece cualquier fondo sin artefactos de alfa. */
  let shadowBlobTex = null;
  function makeShadowBlob() {
    if (shadowBlobTex) return shadowBlobTex;
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const g = c.getContext('2d');
    g.fillStyle = '#ffffff';
    g.fillRect(0, 0, 256, 256);
    const grad = g.createRadialGradient(128, 128, 10, 128, 128, 124);
    grad.addColorStop(0, 'rgb(92,74,55)');
    grad.addColorStop(0.5, 'rgb(182,168,148)');
    grad.addColorStop(1, 'rgb(255,255,255)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 256, 256);
    shadowBlobTex = new THREE.CanvasTexture(c);
    return shadowBlobTex;
  }

  const FABRIC_PROPS = {
    cuero:      { roughness: 0.5,  bumpScale: 0.01 },
    lino:       { roughness: 0.95, bumpScale: 0.014 },
    boucle:     { roughness: 1.0,  bumpScale: 0.016 },
    terciopelo: { roughness: 0.62, bumpScale: 0.006 },
  };
  const FABRIC_EXTRA = { cuero: 180, terciopelo: 90, boucle: 60, lino: 0 };

  /* —— Fotografías reales (mohermobiliario.com) ————————————————
     sentado = recorte con transparencia · relax = mecanismo abierto */
  const PHOTOS = {
    nordic: { sentado: 'assets/img/moher/nordic-sentado.webp' },
    venus:  { sentado: 'assets/img/moher/venus-sentado.webp',  relax: 'assets/img/moher/venus-relax.webp' },
    baltic: { sentado: 'assets/img/moher/baltic-sentado.webp', relax: 'assets/img/moher/baltic-relax.webp' },
    lara:   { sentado: 'assets/img/moher/lara-sentado.webp',   relax: 'assets/img/moher/lara-relax.webp' },
  };

  /* —— Geometría: caja redondeada (planta redondeada) ————————— */
  function roundedBoxGeo(w, h, d, r) {
    r = Math.min(r, w / 2 - 0.001, d / 2 - 0.001);
    const s = new THREE.Shape();
    const x = -w / 2, y = -d / 2;
    s.moveTo(x + r, y);
    s.lineTo(x + w - r, y);
    s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + d - r);
    s.quadraticCurveTo(x + w, y + d, x + w - r, y + d);
    s.lineTo(x + r, y + d);
    s.quadraticCurveTo(x, y + d, x, y + d - r);
    s.lineTo(x, y + r);
    s.quadraticCurveTo(x, y, x + r, y);
    const bevel = Math.min(0.025, h * 0.25);
    const geo = new THREE.ExtrudeGeometry(s, {
      depth: Math.max(h - bevel * 2, 0.01),
      bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel * 0.9,
      bevelSegments: 4, curveSegments: 16,
    });
    geo.rotateX(-Math.PI / 2);
    geo.center();
    return geo;
  }

  /* ============================================================
     Configurador
     ============================================================ */
  const Cfg = {
    state: {
      model: 'nordic', material: 'lino', color: 'crudo',
      madera: 'roble', sala: 'estudio', luz: 'dia', postura: 'sentado',
      vista: '3d',
    },
    targets: { rotY: 0.3, back: 0, foot: 0 },
    current: { rotY: 0.3, back: 0, foot: 0 },
    interacted: false,
    rooms: {},

    init(opts) {
      this.stageEl = document.querySelector(opts.stage);
      this.panelEl = document.querySelector(opts.panel);
      if (!this.stageEl || !this.panelEl) return;
      const p = D.getProduct(opts.model || this.state.model);
      this.state.model = p.id;
      this.state.material = p.defaults.material;
      this.state.color = p.defaults.color;
      this.state.madera = p.defaults.madera;

      this.initScene();
      this.buildStageUI();
      this.buildPanel();
      this.applyModel();
      this.applySala();
      this.applyLuz(true);
      this.bindDrag();
      this.animate();

      const loader = this.stageEl.querySelector('.cfg-loading');
      if (loader) requestAnimationFrame(() => loader.classList.add('is-done'));
    },

    /* —— Vista 3D / Fotografía real ——————————————————————————— */
    buildStageUI() {
      const stage = this.stageEl;

      // Capa de fotografía real sobre estudio marfil
      const photo = document.createElement('div');
      photo.className = 'cfg-photo';
      const img = document.createElement('img');
      img.alt = 'Fotografía real del sillón';
      img.decoding = 'async';
      const cap = document.createElement('div');
      cap.className = 'cfg-photo-caption';
      photo.appendChild(img);
      photo.appendChild(cap);
      stage.appendChild(photo);
      this.photoEl = photo; this.photoImg = img; this.photoCap = cap;
      img.addEventListener('load', () => { img.style.opacity = '1'; });

      // Conmutador de vista (píldora de cristal)
      const view = document.createElement('div');
      view.className = 'cfg-view';
      [['3d', '3D'], ['foto', 'Foto real']].forEach(([id, label]) => {
        const b = document.createElement('button');
        b.type = 'button'; b.textContent = label; b.dataset.id = id;
        b.addEventListener('click', () => this.setVista(id));
        view.appendChild(b);
      });
      stage.appendChild(view);
      this.viewToggle = view;
      this.setVista(this.state.vista);
    },

    setVista(v) {
      this.state.vista = v;
      const foto = v === 'foto';
      if (this.viewToggle) {
        this.viewToggle.querySelectorAll('button').forEach(b =>
          b.classList.toggle('is-active', b.dataset.id === v));
      }
      if (this.photoEl) this.photoEl.classList.toggle('is-on', foto);
      const hint = this.stageEl.querySelector('.cfg-stage-hint');
      if (hint) hint.classList.toggle('is-hidden', foto || this.interacted);
      // Sala y luz solo existen en la vista 3D
      if (this.ui) {
        [this.ui.salaGroup, this.ui.luzGroup].forEach(g =>
          g && g.classList.toggle('cfg-group-muted', foto));
      }
      if (foto) this.updatePhoto();
      this.updateBadge();
    },

    updatePhoto() {
      if (!this.photoImg) return;
      const p = D.getProduct(this.state.model);
      const set = PHOTOS[p.id] || {};
      const reclinado = this.state.postura !== 'sentado' && !!set.relax;
      const src = reclinado ? set.relax : set.sentado;
      if (!src) return;
      if (this.photoImg.dataset.src !== src) {
        this.photoImg.style.opacity = '0';
        this.photoImg.dataset.src = src;
        this.photoImg.src = src;
        // Las tomas del mecanismo son JPG sobre blanco: multiply las funde con el marfil
        this.photoImg.classList.toggle('is-opaca', reclinado);
      }
      this.photoCap.textContent = 'Moher ' + p.name + ' · fotografía real' +
        (reclinado ? ' · mecanismo abierto' : '') + ' · tapizado de muestra';
    },

    /* —— Escena ————————————————————————————————————————————— */
    initScene() {
      const w = this.stageEl.clientWidth, h = Math.max(this.stageEl.clientHeight, 540);
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(38, w / h, 0.1, 60);
      this.camera.position.set(1.91, 1.55, 2.82);
      this.camera.lookAt(0, 0.45, 0);

      this.renderer = new THREE.WebGLRenderer({ antialias: true });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.setSize(w, h, false);
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.renderer.outputEncoding = THREE.sRGBEncoding;
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.0;
      this.stageEl.prepend(this.renderer.domElement);

      // Luces — luz lateral (la ventana queda a la izquierda, §19)
      this.hemi = new THREE.HemisphereLight(0xFFF2DC, 0x6E4E32, 0.75);
      this.scene.add(this.hemi);
      this.amb = new THREE.AmbientLight(0xFFE2C0, 0.12);
      this.scene.add(this.amb);
      this.sun = new THREE.DirectionalLight(0xFFE8C0, 1.15);
      this.sun.position.set(-3.2, 2.7, 1.4);
      this.sun.castShadow = true;
      this.sun.shadow.mapSize.set(2048, 2048);
      this.sun.shadow.camera.left = -3; this.sun.shadow.camera.right = 3;
      this.sun.shadow.camera.top = 3;   this.sun.shadow.camera.bottom = -3;
      this.sun.shadow.bias = -0.002;
      this.scene.add(this.sun);
      this.lamp = new THREE.PointLight(0xFFB874, 0, 7, 2);
      this.lamp.position.set(1.15, 1.3, -0.85);
      this.scene.add(this.lamp);

      this.chairPivot = new THREE.Group();
      this.scene.add(this.chairPivot);

      // Entorno cálido (PMREM): da reflejos y volumen a tela y metal
      this.buildEnvironment();

      // Sombra de contacto siempre presente bajo la butaca
      const blobMat = new THREE.MeshBasicMaterial({
        map: makeShadowBlob(), blending: THREE.MultiplyBlending,
        transparent: true, depthWrite: false,
      });
      blobMat.toneMapped = false;
      this.contactShadow = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 2.1), blobMat);
      this.contactShadow.rotation.x = -Math.PI / 2;
      this.contactShadow.position.y = 0.008;
      this.contactShadow.renderOrder = 1;
      this.scene.add(this.contactShadow);

      // Materiales compartidos
      this.fabricMat = new THREE.MeshStandardMaterial({ color: 0xDCC8A6, roughness: 0.95, envMapIntensity: 0.5 });
      this.fabricSeamMat = new THREE.MeshStandardMaterial({ color: 0xC9B391, roughness: 0.98, envMapIntensity: 0.35 });
      this.woodMat = new THREE.MeshStandardMaterial({
        color: 0xB98E5A, roughness: 0.5, bumpMap: makeBump('madera'), bumpScale: 0.01, envMapIntensity: 0.7,
      });
      this.metalMat = new THREE.MeshStandardMaterial({ color: 0x8A7A5C, roughness: 0.4, metalness: 0.7, envMapIntensity: 1.1 });
      this.swivelMat = new THREE.MeshStandardMaterial({ color: 0x141110, roughness: 0.55, metalness: 0.4, envMapIntensity: 0.4 });
      this.plinthMat = new THREE.MeshStandardMaterial({ color: 0x2A2118, roughness: 0.8, envMapIntensity: 0.3 });

      // Fondos fotográficos por sala+luz (assets/img/sala-{id}-{luz}.jpg)
      // Si la imagen es panorámica 2:1 se monta como entorno equirectangular
      // (foto real de sala envolvente); si no, como backplate plano.
      this.texLoader = new THREE.TextureLoader();
      this.backdrops = {};
      this.backdropActive = false;
      // Ángulo de cámara por sala+luz para encuadrar la zona bonita de la
      // panorámica real (la butaca queda siempre centrada).
      // Calibrado: u_vista = 0.08 - yaw/2π sobre la panorámica.
      // sun = acimut mundial del sol 3D para casar con la ventana de la foto.
      this.SALA_VIEW = {
        'moderno-dia':       { yaw: -3.39, sun: -1.22 },
        'moderno-noche':     { yaw: -3.39, sun: -1.22 },
        'rustico-dia':       { yaw: -3.39, sun: 1.92 },
        'rustico-noche':     { yaw: -3.39, sun: 1.92 },
        'mediterraneo-dia':  { yaw: -2.76, sun: 0.19 },
        'mediterraneo-noche':{ yaw: -2.76, sun: 0.19 },
        'clasico-dia':       { yaw: -3.27, sun: 2.04 },
        'clasico-noche':     { yaw: -3.27, sun: 2.04 },
      };

      // Resize
      const onResize = () => {
        const W = this.stageEl.clientWidth, H = Math.max(this.stageEl.clientHeight, 540);
        this.camera.aspect = W / H;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(W, H, false);
        this.updateBgCover();
      };
      if ('ResizeObserver' in window) new ResizeObserver(onResize).observe(this.stageEl);
      else window.addEventListener('resize', onResize);
    },

    /* Entorno HDR sintético: panel-ventana cálido, rebote ámbar y techo
       suave. PMREM lo convierte en iluminación de imagen (r128). */
    buildEnvironment() {
      const env = new THREE.Scene();
      env.background = new THREE.Color(0x191209);
      const panel = (color, intensity, w, h, x, y, z) => {
        const m = new THREE.Mesh(
          new THREE.PlaneGeometry(w, h),
          new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), side: THREE.DoubleSide })
        );
        m.position.set(x, y, z);
        m.lookAt(0, 0, 0);
        env.add(m);
      };
      panel(0xFFF1D6, 4.2, 3.2, 2.4, -4, 2.8, 2);    // ventana cálida (coincide con la key light)
      panel(0xFFD9A8, 1.8, 2.6, 1.6, 4, 2, -1.2);    // rebote ámbar
      panel(0xFFF6E6, 1.2, 4.5, 1.4, 0, 4.6, 0.5);   // techo suave
      panel(0x6E4E32, 0.5, 7, 3, 0, -3.4, 0);        // suelo cálido reflejado
      const pmrem = new THREE.PMREMGenerator(this.renderer);
      this.scene.environment = pmrem.fromScene(env, 0.03).texture;
      pmrem.dispose();
    },

    /* —— Sillón paramétrico ————————————————————————————————— */
    buildChair(p) {
      const cfg = p.config;
      const g = new THREE.Group();
      const W = 0.66 * cfg.seatWidth;       // ancho asiento
      const DEP = 0.62;                     // fondo asiento
      const armH = cfg.armStyle === 'wrap' ? 0.62 : 0.27;
      const armT = { slim: 0.055, curved: 0.09, block: 0.13, wrap: 0.12 }[cfg.armStyle] || 0.08;
      const baseY = cfg.legStyle === 'hidden' ? 0.10 : 0.20;
      const fab = this.fabricMat, wood = this.woodMat;

      const add = (geo, mat, x, y, z) => {
        const m = new THREE.Mesh(geo, mat);
        m.position.set(x, y, z);
        m.castShadow = true; m.receiveShadow = true;
        g.add(m);
        return m;
      };

      // Bancada + cojín de asiento
      add(roundedBoxGeo(W + armT * 2, 0.15, DEP, 0.07), fab, 0, baseY + 0.075, 0);
      add(roundedBoxGeo(W, 0.13, DEP - 0.04, 0.08), fab, 0, baseY + 0.21, 0.02);

      // Brazos
      if (cfg.armStyle === 'curved') {
        // Paneles-oreja redondeados (referencia: Moher Venus)
        [-1, 1].forEach(s => {
          const x = s * (W / 2 + armT / 2);
          const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, armT, 30), fab);
          disc.rotation.z = Math.PI / 2;
          disc.scale.set(1.12, 1, 1);
          disc.position.set(x, baseY + 0.15 + 0.15, 0.05);
          disc.castShadow = true; disc.receiveShadow = true;
          g.add(disc);
        });
      } else if (cfg.armStyle !== 'none') {
        const armGeoSide = roundedBoxGeo(armT, armH, DEP, 0.04);
        [-1, 1].forEach(s => {
          const x = s * (W / 2 + armT / 2);
          add(armGeoSide.clone(), fab, x, baseY + 0.15 + armH / 2, 0);
        });
      }

      // Respaldo (grupo articulado para reclinar)
      const back = new THREE.Group();
      back.position.set(0, baseY + 0.18, -DEP / 2 + 0.07);
      const bh = cfg.backHeight;
      const backMesh = add(roundedBoxGeo(W + (cfg.armStyle === 'wrap' ? armT * 2 : 0), 0.16, bh, 0.07), fab, 0, 0, 0);
      backMesh.geometry.rotateX(Math.PI / 2);                 // panel vertical
      backMesh.position.set(0, bh / 2, 0);
      backMesh.rotation.set(0, 0, 0);
      g.remove(backMesh); back.add(backMesh);

      // Cojín lumbar delantero
      const lumbar = new THREE.Mesh(roundedBoxGeo(W - 0.06, 0.10, bh * 0.62, 0.06), fab);
      lumbar.geometry.rotateX(Math.PI / 2);
      lumbar.position.set(0, bh * 0.36, 0.115);
      lumbar.castShadow = true;
      back.add(lumbar);

      if (cfg.headrest) {
        const hr = new THREE.Mesh(roundedBoxGeo(W * 0.78, 0.13, 0.2, 0.06), fab);
        hr.position.set(0, bh - 0.06, 0.12);
        hr.rotation.x = -0.28;
        hr.castShadow = true;
        back.add(hr);
      }
      if (cfg.wings) {
        [-1, 1].forEach(s => {
          const wing = new THREE.Mesh(roundedBoxGeo(0.09, 0.34, 0.24, 0.04), fab);
          wing.position.set(s * (W / 2 + 0.02), bh * 0.78, 0.1);
          wing.rotation.y = -s * 0.32;
          wing.castShadow = true;
          back.add(wing);
        });
      }
      // Costuras de capitoné (referencia: respaldos acolchados Moher)
      if (cfg.tufted) {
        const seamGeo = new THREE.CylinderGeometry(0.009, 0.009, W - 0.12, 8);
        seamGeo.rotateZ(Math.PI / 2);
        [0.24, 0.44].forEach(f => {
          const seam = new THREE.Mesh(seamGeo.clone(), this.fabricSeamMat);
          seam.position.set(0, bh * f, 0.168);
          back.add(seam);
        });
      }
      back.rotation.x = -0.1;
      g.add(back);
      this.backGroup = back;

      // Piecero (plegado bajo el asiento; se despliega al reclinar)
      const foot = new THREE.Group();
      foot.position.set(0, baseY + 0.12, DEP / 2 - 0.02);
      const fr = new THREE.Mesh(roundedBoxGeo(W * 0.86, 0.07, 0.42, 0.05), fab);
      fr.position.set(0, 0, 0.23);
      fr.castShadow = true;
      foot.add(fr);
      // Recogido: el piecero queda dentro del asiento y emerge al reclinar
      foot.rotation.x = 0.55;
      foot.scale.z = 0.14;
      this.footBaseZ = DEP / 2;
      foot.position.z = this.footBaseZ - 0.16;
      g.add(foot);
      this.footGroup = foot;

      // Patas / base
      if (cfg.legStyle === 'wood-tapered' || cfg.legStyle === 'wood-straight') {
        const taper = cfg.legStyle === 'wood-tapered';
        const lh = 0.2;
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
          const leg = new THREE.Mesh(
            new THREE.CylinderGeometry(taper ? 0.024 : 0.022, taper ? 0.013 : 0.02, lh, 16), wood
          );
          leg.position.set(sx * (W / 2 + armT - 0.05), lh / 2, sz * (DEP / 2 - 0.07));
          if (taper) { leg.rotation.z = -sx * 0.1; leg.rotation.x = sz * 0.1; }
          leg.castShadow = true;
          g.add(leg);
        });
      } else if (cfg.legStyle === 'swivel') {
        // Base de estrella de 5 radios en aluminio negro (referencia: Moher Venus)
        add(new THREE.CylinderGeometry(0.032, 0.042, 0.2, 20), this.swivelMat, 0, 0.11, 0);
        for (let i = 0; i < 5; i++) {
          const a = (i / 5) * Math.PI * 2;
          const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.022, 0.05), this.swivelMat);
          spoke.position.set(Math.sin(a) * 0.2, 0.022, Math.cos(a) * 0.2);
          spoke.rotation.y = a - Math.PI / 2;
          spoke.castShadow = true;
          g.add(spoke);
          const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.028, 0.016, 12), this.swivelMat);
          pad.position.set(Math.sin(a) * 0.38, 0.009, Math.cos(a) * 0.38);
          g.add(pad);
        }
      } else { // hidden — zócalo tapizado hasta el suelo (referencia: Moher Lara)
        add(roundedBoxGeo(W * 0.94, 0.09, DEP * 0.88, 0.045), fab, 0, 0.055, 0);
      }

      g.traverse(o => { if (o.isMesh) o.castShadow = true; });
      return g;
    },

    applyModel() {
      const p = D.getProduct(this.state.model);
      if (this.chair) {
        this.chairPivot.remove(this.chair);
        this.chair.traverse(o => { if (o.isMesh) o.geometry.dispose(); });
      }
      this.chair = this.buildChair(p);
      this.chairPivot.add(this.chair);
      this.applyFabric();
      this.applyPostura();
      this.updatePhoto();
    },

    applyFabric() {
      const mat = D.getMaterial(this.state.material);
      const col = mat.colores.find(c => c.id === this.state.color) || mat.colores[0];
      this.state.color = col.id;
      const props = FABRIC_PROPS[mat.id];
      this.fabricMat.color.set(col.hex);
      this.fabricMat.roughness = props.roughness;
      this.fabricMat.bumpMap = makeBump(mat.id);
      this.fabricMat.bumpScale = props.bumpScale;
      this.fabricMat.needsUpdate = true;
      this.fabricSeamMat.color.set(col.hex).multiplyScalar(0.82);
      this.fabricSeamMat.bumpMap = makeBump(mat.id);
      this.fabricSeamMat.bumpScale = props.bumpScale;
      this.fabricSeamMat.needsUpdate = true;
      const madera = D.maderas.find(m => m.id === this.state.madera) || D.maderas[0];
      this.woodMat.color.set(madera.hex);
    },

    applyPostura() {
      const post = D.posturas.find(x => x.id === this.state.postura) || D.posturas[0];
      this.targets.back = post.back;
      this.targets.foot = post.foot;
      this.updatePhoto();
    },

    /* —— Salas —————————————————————————————————————————————— */
    PALETTES: {
      moderno:      { wall: 0xCFC4B2, floor: 0xB98E5A, rug: 0xE8DDC8, accent: 0x6E4E32 },
      rustico:      { wall: 0xE2D4BC, floor: 0x9A5A38, rug: 0xC9A07A, accent: 0x4A3220 },
      mediterraneo: { wall: 0xEFE7D8, floor: 0xD6C6A4, rug: 0xD8C8A8, accent: 0x6A7A52 },
      clasico:      { wall: 0x5C4030, floor: 0x4A3220, rug: 0x6E4E32, accent: 0xC9A86A },
    },

    buildRoom(id) {
      const pal = this.PALETTES[id];
      const r = new THREE.Group();
      const std = (color, rough) => new THREE.MeshStandardMaterial({ color, roughness: rough || 0.9 });

      const floor = new THREE.Mesh(new THREE.PlaneGeometry(9, 9), std(pal.floor, 0.7));
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
      r.add(floor);

      const backWall = new THREE.Mesh(new THREE.PlaneGeometry(9, 3.4), std(pal.wall));
      backWall.position.set(0, 1.7, -2.3);
      backWall.receiveShadow = true;
      r.add(backWall);

      const sideWall = new THREE.Mesh(new THREE.PlaneGeometry(9, 3.4), std(pal.wall));
      sideWall.rotation.y = Math.PI / 2;
      sideWall.position.set(-2.7, 1.7, 0);
      sideWall.receiveShadow = true;
      r.add(sideWall);

      // Ventana en la pared lateral (luz lateral §19)
      const winFrame = new THREE.Mesh(new THREE.BoxGeometry(0.07, 1.7, 1.3), std(pal.accent, 0.6));
      winFrame.position.set(-2.67, 1.6, 0.4);
      r.add(winFrame);
      const pane = new THREE.Mesh(
        new THREE.PlaneGeometry(1.16, 1.56),
        new THREE.MeshStandardMaterial({ color: 0xFFEFD0, emissive: 0xFFEFD0, emissiveIntensity: 1 })
      );
      pane.rotation.y = Math.PI / 2;
      pane.position.set(-2.62, 1.6, 0.4);
      r.add(pane);
      r.userData.pane = pane.material;
      const cross = new THREE.Mesh(new THREE.BoxGeometry(0.02, 1.56, 0.025), std(pal.accent, 0.6));
      cross.position.set(-2.6, 1.6, 0.4);
      r.add(cross);

      // Alfombra
      const rug = new THREE.Mesh(new THREE.CircleGeometry(1.55, 40), std(pal.rug, 1));
      rug.rotation.x = -Math.PI / 2;
      rug.position.y = 0.006;
      rug.receiveShadow = true;
      r.add(rug);

      // Mesita + lámpara
      const tableTop = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.025, 22), this.woodGenericMat(pal.accent));
      tableTop.position.set(1.15, 0.5, -0.85);
      tableTop.castShadow = true;
      r.add(tableTop);
      const tableLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, 0.5, 10), this.woodGenericMat(pal.accent));
      tableLeg.position.set(1.15, 0.25, -0.85);
      r.add(tableLeg);
      const lampStand = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.016, 0.55, 8), this.metalMat);
      lampStand.position.set(1.15, 0.79, -0.85);
      r.add(lampStand);
      const shade = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.15, 0.18, 18, 1, true),
        new THREE.MeshStandardMaterial({ color: 0xE8DDC8, emissive: 0xFFB874, emissiveIntensity: 0, side: THREE.DoubleSide })
      );
      shade.position.set(1.15, 1.13, -0.85);
      r.add(shade);
      r.userData.shade = shade.material;

      // Cuadro en pared trasera
      const frame = new THREE.Mesh(new THREE.BoxGeometry(0.78, 1.0, 0.04), std(pal.accent, 0.5));
      frame.position.set(-0.9, 1.75, -2.27);
      r.add(frame);
      const art = new THREE.Mesh(new THREE.PlaneGeometry(0.64, 0.86), std(id === 'clasico' ? 0x8A4A30 : 0xC9A07A, 0.95));
      art.position.set(-0.9, 1.75, -2.24);
      r.add(art);

      // Detalles por estilo
      if (id === 'rustico') {
        const beam = new THREE.Mesh(new THREE.BoxGeometry(9, 0.22, 0.26), this.woodGenericMat(0x4A3220));
        beam.position.set(0, 3.1, -1.2);
        r.add(beam);
      }
      if (id === 'mediterraneo' || id === 'rustico') {
        const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.12, 0.3, 14), std(0x9A5A38, 0.95));
        pot.position.set(-1.7, 0.15, -1.7);
        pot.castShadow = true;
        r.add(pot);
        for (let i = 0; i < 3; i++) {
          const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.2 - i * 0.04, 10, 8), std(0x6A7A52, 1));
          leaf.position.set(-1.7 + (i - 1) * 0.08, 0.48 + i * 0.16, -1.7);
          leaf.castShadow = true;
          r.add(leaf);
        }
      }
      if (id === 'mediterraneo') {
        // Alcoba en arco sobre la pared trasera
        const archShape = new THREE.Shape();
        archShape.moveTo(-0.45, 0);
        archShape.lineTo(-0.45, 0.9);
        archShape.absarc(0, 0.9, 0.45, Math.PI, 0, true);
        archShape.lineTo(0.45, 0);
        archShape.lineTo(-0.45, 0);
        const arch = new THREE.Mesh(new THREE.ExtrudeGeometry(archShape, { depth: 0.04, bevelEnabled: false }), std(0xE4D8C2, 1));
        arch.position.set(1.1, 0.7, -2.29);
        r.add(arch);
      }
      if (id === 'clasico') {
        const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.9, 0.28), this.woodGenericMat(0x3A2616));
        shelf.position.set(1.9, 0.95, -2.12);
        shelf.castShadow = true;
        r.add(shelf);
        const bookCols = [0xC9A86A, 0x8A4A30, 0x6E4E32, 0x5C2630, 0xA89A86];
        for (let i = 0; i < 10; i++) {
          const book = new THREE.Mesh(
            new THREE.BoxGeometry(0.07, 0.24 + Math.random() * 0.08, 0.16),
            std(bookCols[i % bookCols.length], 0.9)
          );
          book.position.set(1.5 + (i % 5) * 0.1, 0.6 + Math.floor(i / 5) * 0.55, -2.1);
          r.add(book);
        }
      }
      return r;
    },

    woodGenericMat(color) {
      const m = new THREE.MeshStandardMaterial({ color, roughness: 0.6, bumpMap: makeBump('madera'), bumpScale: 0.008 });
      return m;
    },

    applySala() {
      this.applyLuz(true);
      this.updateBadge();
    },

    /* Monta el entorno según sala+luz: foto de fondo si existe,
       sala procedural como fallback, estudio infinito marfil. */
    refreshEnv() {
      const id = this.state.sala, luz = this.state.luz;
      if (this.room) { this.scene.remove(this.room); this.room = null; }
      if (this.studioFloor && this.studioFloor.parent) this.scene.remove(this.studioFloor);
      if (this.shadowFloor && this.shadowFloor.parent) this.scene.remove(this.shadowFloor);
      this.scene.fog = null;
      this.backdropActive = false;

      if (id === 'estudio') {
        if (!this.studioFloor) {
          this.studioFloor = new THREE.Mesh(
            new THREE.CircleGeometry(14, 48),
            new THREE.MeshStandardMaterial({ color: 0xF4EFE6, roughness: 1 })
          );
          this.studioFloor.rotation.x = -Math.PI / 2;
          this.studioFloor.receiveShadow = true;
        }
        this.scene.add(this.studioFloor);
        this.scene.fog = new THREE.Fog(0xF4EFE6, 9, 20);
        this.setCameraYaw(0);
        this.sun.position.set(-3.2, 2.7, 1.4);
        this.ensureBgColor();
        return;
      }

      const key = id + '-' + luz;
      const cached = this.backdrops[key];
      if (cached && cached !== 'missing' && cached !== 'loading') {
        this.enableBackdrop(cached);
        return;
      }
      // Fallback (y mientras carga la foto): sala procedural
      if (!this.rooms[id]) this.rooms[id] = this.buildRoom(id);
      this.room = this.rooms[id];
      this.scene.add(this.room);
      this.setCameraYaw(0);
      this.sun.position.set(-3.2, 2.7, 1.4);
      this.ensureBgColor();
      if (!cached) {
        this.backdrops[key] = 'loading';
        this.texLoader.load(
          'assets/img/sala-' + key + '.jpg',
          (tex) => {
            tex.encoding = THREE.sRGBEncoding;
            tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
            this.backdrops[key] = tex;
            if (this.state.sala === id && this.state.luz === luz) this.applyLuz(true);
          },
          undefined,
          () => { this.backdrops[key] = 'missing'; }
        );
      }
    },

    enableBackdrop(tex) {
      if (!this.shadowFloor) {
        this.shadowFloor = new THREE.Mesh(
          new THREE.PlaneGeometry(14, 14),
          new THREE.ShadowMaterial({ opacity: 0.22 })
        );
        this.shadowFloor.rotation.x = -Math.PI / 2;
        this.shadowFloor.receiveShadow = true;
      }
      this.scene.add(this.shadowFloor);
      const isPano = tex.image && (tex.image.width / tex.image.height) > 1.9;
      if (isPano) {
        tex.mapping = THREE.EquirectangularReflectionMapping;
        const view = this.SALA_VIEW[this.state.sala + '-' + this.state.luz] || { yaw: 0, sun: null };
        this.setCameraYaw(view.yaw || 0);
        if (view.sun != null) {
          this.sun.position.set(5 * Math.sin(view.sun), 2.8, 5 * Math.cos(view.sun));
        }
      } else {
        tex.mapping = THREE.UVMapping;
        this.setCameraYaw(0);
        this.sun.position.set(-3.2, 2.7, 1.4);
      }
      this.scene.background = tex;
      this.backdropActive = true;
      if (!isPano) this.updateBgCover();
    },

    /* Gira la cámara alrededor de la butaca (la butaca sigue centrada)
       para elegir qué parte de la sala panorámica se ve detrás. */
    setCameraYaw(yaw) {
      // Cámara cercana y alta: los pies de la butaca proyectan por
      // debajo de la línea suelo-pared de la foto y la pieza asienta.
      this.cameraYaw = yaw;
      const r = 3.4, baseAz = 0.595;
      this.camera.position.set(r * Math.sin(baseAz + yaw), 1.55, r * Math.cos(baseAz + yaw));
      this.camera.lookAt(0, 0.45, 0);
    },

    ensureBgColor() {
      if (!this.scene.background || !this.scene.background.isColor) {
        this.scene.background = new THREE.Color(0x2A2118);
      }
    },

    /* Ajusta repeat/offset del fondo para comportarse como cover */
    updateBgCover() {
      const bg = this.scene && this.scene.background;
      if (!bg || !bg.isTexture || !bg.image) return;
      const el = this.renderer.domElement;
      const cAspect = el.clientWidth / Math.max(el.clientHeight, 1);
      const iAspect = bg.image.width / bg.image.height;
      if (cAspect > iAspect) {
        bg.repeat.set(1, iAspect / cAspect);
        bg.offset.set(0, (1 - bg.repeat.y) / 2);
      } else {
        bg.repeat.set(cAspect / iAspect, 1);
        bg.offset.set((1 - bg.repeat.x) / 2, 0);
      }
    },

    /* —— Día / noche ————————————————————————————————————————— */
    applyLuz(immediate) {
      this.refreshEnv();
      const night = this.state.luz === 'noche';
      const studio = this.state.sala === 'estudio';
      this.lightTargets = {
        hemi: night ? 0.16 : 0.64,
        amb:  night ? 0.05 : 0.12,
        sun:  night ? 0.06 : (studio ? 0.95 : 1.15),
        lamp: night ? (studio ? 0.7 : 1.5) : 0,
        exposure: night ? (this.backdropActive ? 0.92 : 0.74) : 1.0,
        bg: new THREE.Color(
          studio ? (night ? 0xCBBC9F : 0xF4EFE6) : (night ? 0x14100C : 0x2A2118)
        ),
      };
      if (this.scene.fog) {
        this.scene.fog.color.set(night ? 0xCBBC9F : 0xF4EFE6);
      }
      // Ventana y pantalla de lámpara de la sala activa
      if (this.room) {
        const pane = this.room.userData.pane, shade = this.room.userData.shade;
        if (pane) {
          pane.emissive.set(night ? 0x3A3024 : 0xFFEFD0);
          pane.emissiveIntensity = night ? 0.25 : 1;
          pane.color.set(night ? 0x1F1A14 : 0xFFEFD0);
        }
        if (shade) shade.emissiveIntensity = night ? 0.9 : 0;
      }
      if (immediate) {
        this.hemi.intensity = this.lightTargets.hemi;
        this.amb.intensity = this.lightTargets.amb;
        this.sun.intensity = this.lightTargets.sun;
        this.lamp.intensity = this.lightTargets.lamp;
        this.renderer.toneMappingExposure = this.lightTargets.exposure;
        if (!this.backdropActive && this.scene.background && this.scene.background.isColor) {
          this.scene.background.copy(this.lightTargets.bg);
        }
      }
      this.updateBadge();
    },

    /* —— Interacción 360º ———————————————————————————————————— */
    bindDrag() {
      const el = this.renderer.domElement;
      let dragging = false, lastX = 0;
      el.addEventListener('pointerdown', (e) => {
        dragging = true; lastX = e.clientX;
        this.interacted = true;
        el.setPointerCapture(e.pointerId);
        const hint = this.stageEl.querySelector('.cfg-stage-hint');
        if (hint) hint.classList.add('is-hidden');
      });
      el.addEventListener('pointermove', (e) => {
        if (!dragging) return;
        this.targets.rotY += (e.clientX - lastX) * 0.011;
        lastX = e.clientX;
      });
      ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev =>
        el.addEventListener(ev, () => { dragging = false; })
      );
    },

    /* —— Bucle ——————————————————————————————————————————————— */
    animate() {
      requestAnimationFrame(() => this.animate());
      // vaivén suave de cortesía (siempre de frente) hasta que el usuario toca;
      // sigue el yaw de cámara para que la pieza no dé la espalda en las salas
      if (!this.interacted) {
        this.targets.rotY = 0.3 + (this.cameraYaw || 0) + Math.sin(performance.now() * 0.00035) * 0.4;
      }

      this.current.rotY = lerp(this.current.rotY, this.targets.rotY, 0.09);
      this.current.back = lerp(this.current.back, this.targets.back, 0.07);
      this.current.foot = lerp(this.current.foot, this.targets.foot, 0.07);
      this.chairPivot.rotation.y = this.current.rotY;
      if (this.backGroup) this.backGroup.rotation.x = -(0.1 + this.current.back * 0.55);
      if (this.footGroup) {
        const f = this.current.foot;
        this.footGroup.rotation.x = lerp(0.55, -0.12, f);
        this.footGroup.scale.z = lerp(0.14, 1, f);
        this.footGroup.position.z = lerp(this.footBaseZ - 0.16, this.footBaseZ - 0.02, f);
      }

      if (this.lightTargets) {
        this.hemi.intensity = lerp(this.hemi.intensity, this.lightTargets.hemi, 0.06);
        this.amb.intensity = lerp(this.amb.intensity, this.lightTargets.amb, 0.06);
        this.sun.intensity = lerp(this.sun.intensity, this.lightTargets.sun, 0.06);
        this.lamp.intensity = lerp(this.lamp.intensity, this.lightTargets.lamp, 0.06);
        this.renderer.toneMappingExposure = lerp(this.renderer.toneMappingExposure, this.lightTargets.exposure, 0.06);
        if (this.scene.background && this.scene.background.isColor) {
          this.scene.background.lerp(this.lightTargets.bg, 0.06);
        }
      }
      this.renderer.render(this.scene, this.camera);
    },

    /* —— Panel de control ———————————————————————————————————— */
    buildPanel() {
      const el = this.panelEl;
      el.innerHTML = '';
      this.ui = {};

      const group = (label) => {
        const wrap = document.createElement('div');
        const lab = document.createElement('div');
        lab.className = 'cfg-group-label';
        lab.innerHTML = '<span>' + label + '</span><span class="cfg-group-value"></span>';
        wrap.appendChild(lab);
        el.appendChild(wrap);
        return { wrap, value: lab.querySelector('.cfg-group-value') };
      };

      // Tapizado
      const gMat = group('Tapizado');
      const matChips = document.createElement('div');
      matChips.className = 'cfg-chips';
      gMat.wrap.appendChild(matChips);
      D.materiales.forEach(m => {
        const b = document.createElement('button');
        b.className = 'cfg-chip'; b.type = 'button'; b.textContent = m.label;
        b.dataset.id = m.id;
        b.addEventListener('click', () => {
          this.state.material = m.id;
          this.state.color = m.colores[0].id;
          this.applyFabric(); this.refreshPanel();
        });
        matChips.appendChild(b);
      });
      this.ui.matChips = matChips; this.ui.matValue = gMat.value;

      // Color
      const gCol = group('Color');
      const colWrap = document.createElement('div');
      colWrap.className = 'cfg-swatches';
      gCol.wrap.appendChild(colWrap);
      this.ui.colWrap = colWrap; this.ui.colValue = gCol.value;

      // Madera
      const gMad = group('Madera de pata');
      const madWrap = document.createElement('div');
      madWrap.className = 'cfg-swatches';
      gMad.wrap.appendChild(madWrap);
      D.maderas.forEach(m => {
        const s = document.createElement('button');
        s.className = 'cfg-swatch'; s.type = 'button';
        s.style.background = m.hex; s.title = m.label; s.dataset.id = m.id;
        s.setAttribute('aria-label', m.label);
        s.addEventListener('click', () => {
          this.state.madera = m.id; this.applyFabric(); this.refreshPanel();
        });
        madWrap.appendChild(s);
      });
      this.ui.madWrap = madWrap; this.ui.madGroup = gMad.wrap; this.ui.madValue = gMad.value;

      // Sala
      const gSala = group('Sala');
      const salaChips = document.createElement('div');
      salaChips.className = 'cfg-chips';
      gSala.wrap.appendChild(salaChips);
      D.salas.forEach(s => {
        const b = document.createElement('button');
        b.className = 'cfg-chip'; b.type = 'button'; b.textContent = s.label;
        b.dataset.id = s.id; b.title = s.desc;
        b.addEventListener('click', () => {
          this.state.sala = s.id; this.applySala(); this.refreshPanel();
        });
        salaChips.appendChild(b);
      });
      this.ui.salaChips = salaChips; this.ui.salaValue = gSala.value;
      this.ui.salaGroup = gSala.wrap;

      // Luz
      const gLuz = group('Ambiente');
      const toggle = document.createElement('div');
      toggle.className = 'cfg-toggle';
      [['dia', 'Día'], ['noche', 'Noche']].forEach(([id, label]) => {
        const b = document.createElement('button');
        b.type = 'button'; b.textContent = label; b.dataset.id = id;
        b.addEventListener('click', () => {
          this.state.luz = id; this.applyLuz(); this.refreshPanel();
        });
        toggle.appendChild(b);
      });
      gLuz.wrap.appendChild(toggle);
      this.ui.luzToggle = toggle;
      this.ui.luzGroup = gLuz.wrap;

      // Postura
      const gPost = group('Postura');
      const postChips = document.createElement('div');
      postChips.className = 'cfg-chips';
      gPost.wrap.appendChild(postChips);
      D.posturas.forEach(p => {
        const b = document.createElement('button');
        b.className = 'cfg-chip'; b.type = 'button'; b.textContent = p.label;
        b.dataset.id = p.id;
        b.addEventListener('click', () => {
          this.state.postura = p.id; this.applyPostura(); this.refreshPanel();
        });
        postChips.appendChild(b);
      });
      this.ui.postChips = postChips;

      // Resumen + precio + CTA
      const summary = document.createElement('div');
      summary.className = 'cfg-summary';
      summary.innerHTML =
        '<div class="cfg-summary-rows"></div>' +
        '<div class="cfg-price-row">' +
        '  <span class="cfg-price"></span>' +
        '  <span class="cfg-price-note">Envío y subida incluidos</span>' +
        '</div>' +
        '<button class="btn btn-primary" style="width:100%" type="button">Encargar — se hace en 4 semanas</button>';
      el.appendChild(summary);
      this.ui.summaryRows = summary.querySelector('.cfg-summary-rows');
      this.ui.price = summary.querySelector('.cfg-price');
      this.ui.cta = summary.querySelector('.btn');
      this.ui.cta.addEventListener('click', () => {
        // Shopify: aquí se hace POST /cart/add.js con variant id + properties
        this.ui.cta.textContent = 'Anotado. Te escribimos hoy.';
        setTimeout(() => { this.ui.cta.textContent = 'Encargar — se hace en 4 semanas'; }, 2600);
      });

      this.refreshPanel();
    },

    refreshPanel() {
      const p = D.getProduct(this.state.model);
      const mat = D.getMaterial(this.state.material);
      const col = mat.colores.find(c => c.id === this.state.color) || mat.colores[0];
      const madera = D.maderas.find(m => m.id === this.state.madera);

      const mark = (wrap, id) => {
        wrap.querySelectorAll('[data-id]').forEach(b =>
          b.classList.toggle('is-active', b.dataset.id === id));
      };
      mark(this.ui.matChips, mat.id);
      mark(this.ui.salaChips, this.state.sala);
      mark(this.ui.postChips, this.state.postura);
      mark(this.ui.madWrap, this.state.madera);
      this.ui.luzToggle.querySelectorAll('button').forEach(b =>
        b.classList.toggle('is-active', b.dataset.id === this.state.luz));

      this.ui.matValue.textContent = mat.origen;
      this.ui.colValue.textContent = col.label;
      this.ui.madValue.textContent = madera ? madera.label : '';

      // Swatches de color del tapizado activo
      this.ui.colWrap.innerHTML = '';
      mat.colores.forEach(c => {
        const s = document.createElement('button');
        s.className = 'cfg-swatch' + (c.id === col.id ? ' is-active' : '');
        s.type = 'button'; s.style.background = c.hex;
        s.title = c.label; s.setAttribute('aria-label', c.label);
        s.addEventListener('click', () => {
          this.state.color = c.id; this.applyFabric(); this.refreshPanel();
        });
        this.ui.colWrap.appendChild(s);
      });

      // Madera solo si el modelo lleva pata vista
      const hasWood = p.config.legStyle === 'wood-tapered' || p.config.legStyle === 'wood-straight';
      this.ui.madGroup.style.display = hasWood ? '' : 'none';

      // Resumen + precio
      const total = p.price + FABRIC_EXTRA[mat.id];
      this.ui.summaryRows.innerHTML =
        '<div class="cfg-summary-row"><span>Modelo</span><b>' + p.name + '</b></div>' +
        '<div class="cfg-summary-row"><span>Tapizado</span><b>' + mat.label + ' · ' + col.label + '</b></div>' +
        (hasWood ? '<div class="cfg-summary-row"><span>Madera</span><b>' + madera.label + '</b></div>' : '') +
        '<div class="cfg-summary-row"><span>Garantía</span><b>20 años estructura</b></div>';
      this.ui.price.textContent = D.formatPrice(total);

      this.updateBadge();
      window.dispatchEvent(new CustomEvent('legado:configchange', { detail: { ...this.state, total } }));
    },

    updateBadge() {
      const badge = this.stageEl && this.stageEl.querySelector('.cfg-stage-badge');
      if (!badge) return;
      if (this.state.vista === 'foto') {
        badge.textContent = 'Estudio Moher · Foto real';
        return;
      }
      const sala = D.salas.find(s => s.id === this.state.sala);
      badge.textContent = (sala ? sala.label : '') + ' · ' + (this.state.luz === 'dia' ? 'Día' : 'Noche');
    },

    /* —— API pública ————————————————————————————————————————— */
    setModel(id) {
      const p = D.getProduct(id);
      this.state.model = p.id;
      this.state.material = p.defaults.material;
      this.state.color = p.defaults.color;
      this.state.madera = p.defaults.madera;
      this.applyModel();
      if (this.ui) this.refreshPanel();
    },
    getState() { return { ...this.state }; },
  };

  window.LegadoConfigurador = Cfg;
})();
