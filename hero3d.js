/* Àgò · Hero 3D: o símbolo vivo (Three.js 0.160.0)
   Esfera berinjela pendurada por um fio, balançando como pêndulo lento;
   anel e pétalas finas girando devagar; chama âmbar que ilumina a esfera;
   fumaça de incenso e poeira de luz. Pausa fora da tela. */
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const canvas = document.querySelector(".hero-3d");
const hero = document.querySelector(".hero");
const reduzir = matchMedia("(prefers-reduced-motion: reduce)").matches;

function iniciar() {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch (e) { return; }
  if (!renderer.getContext()) return;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  const cena = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  cena.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0.2, 11);

  /* Cores */
  const BERINJELA = new THREE.Color("#4A3358");
  const LILAS = new THREE.Color("#B9A6D0");
  const AMBAR = new THREE.Color("#E7A75C");

  /* Grupo do símbolo (mesmas proporções da logo) */
  const simbolo = new THREE.Group();
  cena.add(simbolo);
  const R = 1.9;                 // raio do anel
  const CY = 0.3;                // centro do anel
  const TOPO = CY + R;           // ponto onde pétalas e fio se encontram
  const RE = R * 0.63;           // raio da esfera
  const FIO = TOPO - (CY - R * 0.48); // comprimento do fio

  /* Anel + pétalas (giram juntos em Y) */
  const coroa = new THREE.Group();
  simbolo.add(coroa);
  const matLinha = new THREE.MeshStandardMaterial({ color: LILAS, emissive: LILAS, emissiveIntensity: 0.35, roughness: 0.35, metalness: 0.6 });
  const anel = new THREE.Mesh(new THREE.TorusGeometry(R, 0.012, 12, 220), matLinha);
  anel.position.y = CY;
  coroa.add(anel);
  const s = R / 71;
  const pontoLogo = (x, y) => new THREE.Vector3((x - 80) * s, (101 - y) * s + CY, 0);
  const petala = (lado) => {
    const pts = [[80, 31], [70, 43], [55, 54], [43, 68], [37, 86], [37, 102], [42, 114], [50, 123]]
      .map(([x, y]) => pontoLogo(80 + (x - 80) * lado, y));
    const curva = new THREE.CatmullRomCurve3(pts);
    return new THREE.Mesh(new THREE.TubeGeometry(curva, 90, 0.014, 8, false), matLinha);
  };
  coroa.add(petala(1), petala(-1));

  /* Pêndulo: fio + esfera, presos no ponto do topo */
  const pendulo = new THREE.Group();
  pendulo.position.y = TOPO;
  simbolo.add(pendulo);
  const fio = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, FIO - RE, 8), new THREE.MeshStandardMaterial({ color: "#d9cbe6", emissive: "#b9a6d0", emissiveIntensity: 0.5, roughness: 0.4 }));
  fio.position.y = -(FIO - RE) / 2;
  pendulo.add(fio);
  const matEsfera = new THREE.MeshPhysicalMaterial({
    color: BERINJELA, roughness: 0.3, metalness: 0.05,
    clearcoat: 1, clearcoatRoughness: 0.07,
    sheen: 0.55, sheenRoughness: 0.5, sheenColor: LILAS,
    envMapIntensity: 0.6,
  });
  const esfera = new THREE.Mesh(new THREE.SphereGeometry(RE, 96, 64), matEsfera);
  esfera.position.y = -FIO;
  pendulo.add(esfera);

  /* Chama âmbar no topo: sprite + luz pontual que ilumina a esfera */
  const texturaChama = (() => {
    const c = document.createElement("canvas"); c.width = 128; c.height = 256;
    const g = c.getContext("2d");
    const grad = g.createRadialGradient(64, 170, 4, 64, 150, 110);
    grad.addColorStop(0, "rgba(255,244,214,1)");
    grad.addColorStop(0.18, "rgba(255,206,140,.95)");
    grad.addColorStop(0.45, "rgba(231,167,92,.45)");
    grad.addColorStop(1, "rgba(231,167,92,0)");
    g.fillStyle = grad;
    g.beginPath(); g.moveTo(64, 6);
    g.bezierCurveTo(84, 70, 112, 120, 104, 176); g.arc(64, 176, 40, 0, Math.PI); g.bezierCurveTo(16, 120, 44, 70, 64, 6); g.fill();
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  })();
  const texturaBrilho = (() => {
    const c = document.createElement("canvas"); c.width = c.height = 128;
    const g = c.getContext("2d");
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, "rgba(255,255,255,1)"); grad.addColorStop(0.3, "rgba(255,255,255,.35)"); grad.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grad; g.fillRect(0, 0, 128, 128);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  })();
  const chama = new THREE.Sprite(new THREE.SpriteMaterial({ map: texturaChama, color: 0xffffff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  chama.scale.set(0.26, 0.5, 1);
  chama.position.set(0, TOPO + 0.24, 0.02);
  simbolo.add(chama);
  const aura = new THREE.Sprite(new THREE.SpriteMaterial({ map: texturaBrilho, color: AMBAR, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending }));
  aura.scale.set(1.6, 1.6, 1);
  aura.position.copy(chama.position);
  simbolo.add(aura);
  const luzChama = new THREE.PointLight(AMBAR, 9, 9, 1.4);
  luzChama.position.set(0, TOPO + 0.3, 0.6);
  simbolo.add(luzChama);

  /* Luzes de ambiente: lilás suave, contraluz e preenchimento */
  cena.add(new THREE.HemisphereLight("#cdbde0", "#1e1424", 0.5));
  const chave = new THREE.DirectionalLight("#d8c9ea", 1.1); chave.position.set(-4, 3, 5); cena.add(chave);
  const contra = new THREE.DirectionalLight(LILAS, 2.4); contra.position.set(3, 1, -4); cena.add(contra);
  const baixo = new THREE.PointLight("#E7A75C", 2.2, 8, 1.5); baixo.position.set(-1.6, -3, 2.4); simbolo.add(baixo);

  /* Fumaça de incenso: sprites subindo da chama */
  const fumaca = [];
  const matFumaca = new THREE.SpriteMaterial({ map: texturaBrilho, color: "#d9cbe6", transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
  for (let i = 0; i < 26; i++) {
    const sp = new THREE.Sprite(matFumaca.clone());
    sp.userData = { vida: Math.random(), vel: 0.05 + Math.random() * 0.05, fase: Math.random() * 6.28, lado: (Math.random() - 0.5) * 0.4 };
    simbolo.add(sp); fumaca.push(sp);
  }

  /* Poeira de luz âmbar */
  const N = innerWidth < 760 ? 220 : 480;
  const pos = new Float32Array(N * 3), fasePo = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 16;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 9;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 6;
    fasePo[i] = Math.random() * 6.28;
  }
  const geoPo = new THREE.BufferGeometry();
  geoPo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const poeira = new THREE.Points(geoPo, new THREE.PointsMaterial({ size: 0.05, map: texturaBrilho, color: "#f1c48a", transparent: true, opacity: 0.75, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true }));
  cena.add(poeira);

  /* Layout: desktop à direita do texto; celular atrás do texto, menor */
  const layout = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    const movel = w < 760;
    simbolo.scale.setScalar(movel ? 0.5 : (w < 1100 ? 0.68 : 0.8));
    simbolo.position.set(movel ? 0 : (w < 1100 ? 1.9 : 2.45), movel ? 0.95 : 0.05, 0);
  };
  layout();
  addEventListener("resize", layout);

  /* Mouse inclina o pêndulo */
  let mx = 0, my = 0, tmx = 0, tmy = 0;
  addEventListener("pointermove", (e) => { tmx = e.clientX / innerWidth - 0.5; tmy = e.clientY / innerHeight - 0.5; }, { passive: true });

  /* Entrada: a esfera desce até assentar quando a intro abre */
  let entrada = document.querySelector(".intro") ? 0 : 1;
  document.addEventListener("intro-fim", () => { entrada = Math.max(entrada, 0.0001); });
  if (entrada === 0 && !document.querySelector(".intro")) entrada = 1;

  const relogio = new THREE.Clock();
  let visivel = true, rodando = false;
  const quadro = () => {
    if (!visivel || document.hidden) { rodando = false; return; }
    rodando = true;
    const dt = Math.min(relogio.getDelta(), 0.05);
    const t = relogio.elapsedTime;
    if (entrada > 0 && entrada < 1) entrada = Math.min(1, entrada + dt / 2.2);
    const e = entrada === 0 ? 0 : 1 - Math.pow(1 - entrada, 3);

    mx += (tmx - mx) * 0.04; my += (tmy - my) * 0.04;
    pendulo.rotation.z = Math.sin(t * 0.55) * 0.075 + mx * 0.22;
    pendulo.rotation.x = Math.sin(t * 0.37) * 0.025 + my * 0.12;
    pendulo.position.y = TOPO + (1 - e) * 1.6;
    esfera.scale.setScalar(0.6 + 0.4 * e);
    coroa.rotation.y = Math.sin(t * 0.17) * 0.6;
    coroa.rotation.x = Math.sin(t * 0.2) * 0.06;
    simbolo.rotation.y = mx * 0.25;
    simbolo.rotation.x = my * 0.12;

    const vela = 1 + Math.sin(t * 9.1) * 0.06 + Math.sin(t * 13.7) * 0.04 + Math.sin(t * 2.3) * 0.05;
    chama.scale.set(0.26 * (2 - vela) * 0.95, 0.5 * vela, 1);
    aura.material.opacity = 0.45 + (vela - 1) * 1.2;
    luzChama.intensity = 8.5 * vela * e;

    for (const sp of fumaca) {
      const u = sp.userData;
      u.vida += dt * u.vel;
      if (u.vida > 1) { u.vida = 0; u.fase = Math.random() * 6.28; }
      const v = u.vida;
      sp.position.set(Math.sin(v * 5 + u.fase) * 0.22 * v + u.lado * v, TOPO + 0.45 + v * 3.4, -0.1);
      const tam = 0.25 + v * 1.5;
      sp.scale.set(tam, tam * 1.3, 1);
      sp.material.opacity = Math.sin(v * Math.PI) * 0.09 * e;
    }

    const p = geoPo.attributes.position.array;
    for (let i = 0; i < N; i++) {
      p[i * 3 + 1] += 0.0025 + Math.sin(t * 0.6 + fasePo[i]) * 0.0012;
      p[i * 3] += Math.cos(t * 0.3 + fasePo[i]) * 0.0015;
      if (p[i * 3 + 1] > 4.6) p[i * 3 + 1] = -4.6;
    }
    geoPo.attributes.position.needsUpdate = true;
    poeira.material.opacity = 0.55 + Math.sin(t * 0.8) * 0.15;

    camera.position.x = mx * 0.35;
    camera.position.y = 0.2 - my * 0.25;
    camera.lookAt(0, 0.1, 0);
    renderer.render(cena, camera);
    requestAnimationFrame(quadro);
  };

  document.documentElement.classList.add("webgl-ok");
  if (reduzir) { entrada = 1; relogio.getDelta(); renderer.render(cena, camera); quadro.call(null); visivel = false; return; }
  new IntersectionObserver(([en]) => { visivel = en.isIntersecting; if (visivel && !rodando) { relogio.getDelta(); requestAnimationFrame(quadro); } }).observe(hero);
  document.addEventListener("visibilitychange", () => { if (!document.hidden && visivel && !rodando) { relogio.getDelta(); requestAnimationFrame(quadro); } });
  requestAnimationFrame(quadro);
}

if (canvas && hero) {
  try { iniciar(); } catch (e) { console.warn("Hero 3D indisponível:", e); }
}
