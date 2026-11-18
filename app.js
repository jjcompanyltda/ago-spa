/* Àgò spa & bem viver · comportamento da página (sem dependências) */
(() => {
  "use strict";
  const C = window.CONFIG || {};
  const doc = document.documentElement;
  const reduzir = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const celular = () => matchMedia("(max-width: 760px)").matches;
  const ponteiroFino = matchMedia("(pointer: fine)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const limitar = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const guardar = (k, v) => { try { v === undefined ? sessionStorage.getItem(k) : sessionStorage.setItem(k, v); } catch (e) { /* sem storage */ } };
  const ler = (k) => { try { return sessionStorage.getItem(k); } catch (e) { return null; } };

  /* ── WhatsApp: todos os links montados a partir do CONFIG ────────────── */
  const wa = C.whatsapp || {};
  const numero = String(wa.numero || "5531998000434").replace(/\D/g, "");
  const msgs = wa.mensagens || {};
  const linkWa = (texto) => `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
  $$("[data-wa]").forEach((a) => { a.href = linkWa(msgs[a.dataset.wa] || msgs.agendar || ""); });
  $$("[data-ritual]").forEach((a) => { a.href = linkWa((msgs.ritual || "Quero agendar: {ritual}").replace("{ritual}", a.dataset.ritual)); });
  if (C.mostrarPrecos) doc.classList.add("com-precos");
  $$("[data-ano]").forEach((el) => (el.textContent = new Date().getFullYear()));

  /* ── Intro "pedir licença" ───────────────────────────────────────────── */
  const intro = $(".intro");
  const pularIntro = new URLSearchParams(location.search).get("intro") === "0";
  if (intro) {
    const deveMostrar = C.intro?.mostrar !== false && !pularIntro && !(C.intro?.umaVezPorSessao && ler("ago-intro"));
    if (!deveMostrar) { intro.remove(); }
    else {
      document.body.classList.add("intro-ativa");
      let fechado = false;
      const fechar = () => {
        if (fechado) return; fechado = true;
        guardar("ago-intro", "1");
        intro.classList.add("abrir");
        document.body.classList.remove("intro-ativa");
        document.dispatchEvent(new Event("intro-fim"));
        setTimeout(() => intro.remove(), 1700);
      };
      setTimeout(fechar, reduzir ? 900 : 3700);
      intro.addEventListener("click", fechar);
      addEventListener("keydown", (e) => { if (["Enter", " ", "Escape"].includes(e.key)) fechar(); }, { once: true });
    }
  }

  /* ── Tema de fundo muda com a seção no meio da tela ─────────────────── */
  const secoesTema = $$("main [data-tema], footer[data-tema]");
  const ioTema = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) {
      doc.dataset.tema = e.target.dataset.tema;
      const id = e.target.id;
      $$(".menu a").forEach((a) => a.classList.toggle("ativo", a.getAttribute("href") === `#${id}`));
    }
  }), { rootMargin: "-50% 0px -50% 0px" });
  secoesTema.forEach((s) => ioTema.observe(s));

  /* ── Topo e menu do celular ─────────────────────────────────────────── */
  const topo = $(".topo");
  const menuMovel = $("#menu-movel");
  const abreMenu = $(".abre-menu");
  const alternarMenu = (abrir) => {
    menuMovel.hidden = !abrir;
    abreMenu.setAttribute("aria-expanded", String(abrir));
    abreMenu.setAttribute("aria-label", abrir ? "Fechar menu" : "Abrir menu");
    document.body.classList.toggle("menu-aberto", abrir);
  };
  abreMenu?.addEventListener("click", () => alternarMenu(menuMovel.hidden));
  $$("a", menuMovel).forEach((a) => a.addEventListener("click", () => alternarMenu(false)));
  addEventListener("keydown", (e) => { if (e.key === "Escape" && !menuMovel.hidden) alternarMenu(false); });

  /* ── Texto revelando por linha ──────────────────────────────────────── */
  const dividir = (el) => {
    if (!el.dataset.original) el.dataset.original = el.innerHTML;
    el.innerHTML = el.dataset.original;
    el.classList.remove("pronto");
    const fichas = [];
    let espAntes = false;
    const percorrer = (no, tag) => no.childNodes.forEach((n) => {
      if (n.nodeType === 3) {
        n.textContent.split(/(\s+)/).forEach((t) => {
          if (!t) return;
          if (/^\s+$/.test(t)) { espAntes = true; return; }
          fichas.push({ t, tag, esp: espAntes }); espAntes = false;
        });
      } else if (n.nodeName === "BR") { fichas.push({ br: true }); espAntes = false; }
      else if (n.nodeType === 1) percorrer(n, n.nodeName.toLowerCase());
    });
    percorrer(el, null);
    el.innerHTML = "";
    const spans = [];
    fichas.forEach((f) => {
      if (f.br) { el.appendChild(document.createElement("br")); spans.push(null); return; }
      if (f.esp) el.appendChild(document.createTextNode(" "));
      const s = document.createElement("span");
      s.style.display = "inline-block";
      s.dataset.esp = f.esp ? "1" : "";
      if (f.tag) { const e = document.createElement(f.tag); e.textContent = f.t; s.appendChild(e); } else s.textContent = f.t;
      el.appendChild(s); spans.push(s);
    });
    const linhas = []; let topoAtual = null;
    spans.forEach((s) => {
      if (!s) { topoAtual = null; return; }
      const t = s.offsetTop;
      if (topoAtual === null || Math.abs(t - topoAtual) > 6) { linhas.push([]); topoAtual = t; }
      linhas[linhas.length - 1].push(s);
    });
    el.innerHTML = "";
    linhas.forEach((ws, i) => {
      const l = document.createElement("span"); l.className = "l";
      const dentro = document.createElement("span"); dentro.style.setProperty("--i", i);
      ws.forEach((w, k) => { if (k && w.dataset.esp) dentro.appendChild(document.createTextNode(" ")); w.style.display = ""; dentro.appendChild(w); });
      l.appendChild(dentro); el.appendChild(l);
    });
    el.classList.add("pronto");
  };
  const titulos = $$(".linhas");
  const ioRevelar = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("in"); ioRevelar.unobserve(e.target); }
  }), { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
  const prepararTitulos = () => titulos.forEach((t) => { if (!reduzir) dividir(t); });
  (document.fonts?.ready || Promise.resolve()).then(() => {
    prepararTitulos();
    titulos.forEach((t) => ioRevelar.observe(t));
  });
  let larguraAntes = innerWidth;
  addEventListener("resize", () => {
    if (Math.abs(innerWidth - larguraAntes) < 40) return;
    larguraAntes = innerWidth;
    titulos.forEach((t) => { const estava = t.classList.contains("in"); if (!reduzir) dividir(t); if (estava) t.classList.add("in"); });
  });
  // Máscaras com clip-path: observar o PAI (o IntersectionObserver não dispara no filho recortado)
  $$(".revelar-pai, .revelar").forEach((el) => ioRevelar.observe(el));

  /* ── Parallax leve (propriedade translate, para não brigar com transform) */
  const paralaxe = reduzir ? [] : $$("[data-parallax]");
  const moverParalaxe = () => {
    for (const img of paralaxe) {
      const r = img.parentElement.getBoundingClientRect();
      if (r.bottom < -100 || r.top > innerHeight + 100) continue;
      const c = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
      img.style.translate = `0 ${(c * -parseFloat(img.dataset.parallax) * 600).toFixed(1)}px`;
    }
  };

  /* ── A travessia: rolagem que toca o vídeo ──────────────────────────── */
  const cine = $(".cine");
  const canvas = cine && $(".cine-canvas", cine);
  let atualizarCine = () => {};
  if (cine && canvas && C.frames?.total) {
    const ctx = canvas.getContext("2d");
    const total = C.frames.total;
    const padrao = celular() ? C.frames.mobile : C.frames.desktop;
    const src = (i) => padrao.replace("{n}", String(i + 1).padStart(4, "0"));
    const quadros = new Array(total);
    const momentos = $$(".momento", cine);
    const porta = $(".porta", cine);
    const barra = $(".cine-progresso", cine);
    let atual = 0, desenhado = -1, ativoCine = false;

    const carregar = (i) => {
      if (quadros[i]) return quadros[i];
      const img = new Image();
      img.decoding = "async";
      img.onload = () => { if (desenhado === -1 || Math.abs(Math.round(atual) - i) < 2) desenhar(Math.round(atual), true); };
      img.src = src(i);
      return (quadros[i] = img);
    };
    carregar(0);
    // carrega em passadas (1 a cada 8, depois 4, 2, 1) para cobrir o filme todo cedo
    const fila = [];
    for (const passo of [8, 4, 2, 1]) for (let i = 0; i < total; i += passo) if (!fila.includes(i)) fila.push(i);
    let k = 0;
    const lote = () => { for (let n = 0; n < 6 && k < fila.length; n++) carregar(fila[k++]); if (k < fila.length) setTimeout(lote, 50); };
    const iniciarCarga = () => { if (k === 0) lote(); };
    new IntersectionObserver(([e]) => { if (e.isIntersecting) iniciarCarga(); }, { rootMargin: "150% 0px" }).observe(cine);

    const pronto = (i) => quadros[i] && quadros[i].complete && quadros[i].naturalWidth;
    const maisProximo = (i) => { for (let d = 0; d < total; d++) { if (pronto(i - d)) return i - d; if (pronto(i + d)) return i + d; } return -1; };
    function desenhar(i, forcar) {
      const j = maisProximo(i);
      if (j < 0 || (j === desenhado && !forcar)) return;
      const img = quadros[j], cw = canvas.width, ch = canvas.height;
      const escala = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const w = img.naturalWidth * escala, h = img.naturalHeight * escala;
      // no celular o assunto (a maca) fica um pouco à esquerda do centro
      const desloc = celular() ? (w - cw) * 0.06 : 0;
      ctx.drawImage(img, (cw - w) / 2 + desloc, (ch - h) / 2, w, h);
      desenhado = j;
    }
    const ajustar = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      desenhado = -1; desenhar(Math.round(atual), true);
    };
    const progresso = () => {
      const r = cine.getBoundingClientRect();
      return limitar(-r.top / ((cine.offsetHeight - innerHeight) || 1));
    };
    const aplicar = (p) => {
      for (const m of momentos) {
        const de = +m.dataset.de, ate = +m.dataset.ate;
        m.classList.toggle("ativo", p >= de && (p < ate || (ate >= 1 && p >= 1)));
      }
      const abre = limitar(p / 0.13);
      const suave = abre * abre * (3 - 2 * abre);
      porta.style.setProperty("--abre", suave.toFixed(4));
      porta.style.opacity = String(limitar(1 - (abre - 0.75) * 4));
      porta.style.visibility = abre >= 1 ? "hidden" : "visible";
      barra.style.setProperty("--p", p.toFixed(4));
    };
    atualizarCine = () => {
      if (!ativoCine) return;
      const alvo = progresso() * (total - 1);
      atual += (alvo - atual) * (reduzir ? 1 : 0.16);
      if (Math.abs(alvo - atual) < 0.05) atual = alvo;
      desenhar(Math.round(atual));
      aplicar(atual / (total - 1));
    };
    new IntersectionObserver(([e]) => { ativoCine = e.isIntersecting; }, { rootMargin: "10% 0px" }).observe(cine);
    addEventListener("resize", ajustar);
    ajustar();
    aplicar(0);

    /* poeira de luz âmbar por cima do vídeo */
    const poeira = $(".cine-poeira", cine);
    if (poeira && !reduzir) {
      const pc = poeira.getContext("2d");
      let parts = [];
      const criar = () => {
        const dpr = Math.min(devicePixelRatio || 1, 2);
        poeira.width = poeira.clientWidth * dpr; poeira.height = poeira.clientHeight * dpr;
        const n = celular() ? 38 : 80;
        parts = Array.from({ length: n }, () => ({
          x: Math.random() * poeira.width, y: Math.random() * poeira.height,
          r: (0.5 + Math.random() * 1.8) * dpr, vy: -(0.08 + Math.random() * 0.25) * dpr,
          fase: Math.random() * 6.28, vel: 0.004 + Math.random() * 0.01, a: 0.25 + Math.random() * 0.55,
        }));
      };
      criar(); addEventListener("resize", criar);
      const passo = () => {
        if (ativoCine) {
          pc.clearRect(0, 0, poeira.width, poeira.height);
          pc.globalCompositeOperation = "lighter";
          for (const q of parts) {
            q.fase += q.vel; q.y += q.vy; q.x += Math.sin(q.fase) * 0.25;
            if (q.y < -10) { q.y = poeira.height + 10; q.x = Math.random() * poeira.width; }
            const brilho = q.a * (0.55 + 0.45 * Math.sin(q.fase * 2.3));
            const g = pc.createRadialGradient(q.x, q.y, 0, q.x, q.y, q.r * 4);
            g.addColorStop(0, `rgba(244, 196, 132, ${brilho})`);
            g.addColorStop(1, "rgba(231, 167, 92, 0)");
            pc.fillStyle = g; pc.beginPath(); pc.arc(q.x, q.y, q.r * 4, 0, 6.283); pc.fill();
          }
        }
        requestAnimationFrame(passo);
      };
      requestAnimationFrame(passo);
    }
  }

  /* ── Galeria horizontal que corre com a rolagem ─────────────────────── */
  const galeria = $(".galeria");
  const trilho = galeria && $(".galeria-trilho", galeria);
  let curso = 0;
  const medirGaleria = () => {
    if (!galeria) return;
    curso = Math.max(0, trilho.scrollWidth - innerWidth);
    galeria.style.height = `${curso + innerHeight}px`;
  };
  const moverGaleria = () => {
    if (!galeria) return;
    const r = galeria.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    const p = limitar(-r.top / ((galeria.offsetHeight - innerHeight) || 1));
    trilho.style.transform = `translate3d(${(-p * curso).toFixed(1)}px, 0, 0)`;
    if (!reduzir) for (const fig of trilho.children) {
      if (!fig.classList.contains("g-item")) continue;
      const fr = fig.getBoundingClientRect();
      const d = Math.abs(fr.left + fr.width / 2 - innerWidth / 2) / innerWidth;
      fig.style.setProperty("--gb", (1 - limitar(d * 1.3) * 0.32).toFixed(3));
      fig.style.setProperty("--gs", (1 - limitar(d * 1.3) * 0.25).toFixed(3));
    }
  };
  medirGaleria();
  addEventListener("resize", medirGaleria);
  addEventListener("load", medirGaleria);
  $$("img", trilho || document.createElement("div")).forEach((img) => img.addEventListener("load", medirGaleria, { once: true }));

  /* ── Visita: passos trocam a mídia fixa ─────────────────────────────── */
  const passos = $$(".passo");
  const midiasVisita = $$(".vm");
  const ativarPasso = (n) => {
    passos.forEach((p) => p.classList.toggle("ativo", p.dataset.passo === n));
    midiasVisita.forEach((m) => {
      const on = m.dataset.passo === n;
      m.classList.toggle("ativo", on);
      if (m.tagName === "VIDEO") { if (on && !reduzir) m.play().catch(() => {}); else m.pause(); }
    });
  };
  const ioPasso = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) ativarPasso(e.target.dataset.passo); }), { rootMargin: "-45% 0px -45% 0px" });
  passos.forEach((p) => ioPasso.observe(p));
  if (passos[0]) passos[0].classList.add("ativo");

  /* ── Vídeos de ambiente: tocam só na tela ───────────────────────────── */
  const ioVideo = new IntersectionObserver((es) => es.forEach((e) => {
    const v = e.target;
    if (e.isIntersecting && !reduzir) v.play().catch(() => {}); else v.pause();
  }), { threshold: 0.2 });
  $$(".video-ambiente").forEach((v) => ioVideo.observe(v));

  /* ── Cartões com tilt 3D e brilho que segue o cursor ────────────────── */
  if (ponteiroFino && !reduzir) {
    $$(".tilt").forEach((c) => {
      c.addEventListener("pointermove", (e) => {
        const r = c.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        c.classList.add("mexendo");
        c.style.setProperty("--ry", `${((x - 0.5) * 10).toFixed(2)}deg`);
        c.style.setProperty("--rx", `${(-(y - 0.5) * 8).toFixed(2)}deg`);
        c.style.setProperty("--mx", `${(x * 100).toFixed(1)}%`);
        c.style.setProperty("--my", `${(y * 100).toFixed(1)}%`);
      });
      c.addEventListener("pointerleave", () => { c.classList.remove("mexendo"); c.style.setProperty("--rx", "0deg"); c.style.setProperty("--ry", "0deg"); });
    });
    $$(".botao").forEach((b) => b.addEventListener("pointermove", (e) => {
      const r = b.getBoundingClientRect();
      b.style.setProperty("--bx", `${e.clientX - r.left}px`); b.style.setProperty("--by", `${e.clientY - r.top}px`);
    }));
  }

  /* ── Depoimentos (carrossel) ────────────────────────────────────────── */
  const depos = $$(".depo");
  const pontos = $(".depo-pontos");
  let idx = 0, timer = null, depoVisivel = false, pausado = false;
  if (depos.length && pontos) {
    depos.forEach((d, i) => {
      const b = document.createElement("button");
      b.type = "button"; b.setAttribute("role", "tab"); b.setAttribute("aria-label", `Avaliação ${i + 1} de ${depos.length}`);
      b.addEventListener("click", () => irPara(i, true));
      pontos.appendChild(b);
    });
    const irPara = (i, manual) => {
      const ant = depos[idx];
      idx = (i + depos.length) % depos.length;
      depos.forEach((d, k) => { d.classList.toggle("ativo", k === idx); d.classList.toggle("saindo", d === ant && k !== idx); d.setAttribute("aria-hidden", String(k !== idx)); });
      $$("button", pontos).forEach((b, k) => b.setAttribute("aria-selected", String(k === idx)));
      if (manual) reiniciar();
    };
    const reiniciar = () => { clearInterval(timer); timer = setInterval(() => { if (depoVisivel && !pausado && !reduzir) irPara(idx + 1); }, 9000); };
    $(".depo-ant")?.addEventListener("click", () => irPara(idx - 1, true));
    $(".depo-prox")?.addEventListener("click", () => irPara(idx + 1, true));
    const painel = $(".depo-painel");
    painel.addEventListener("pointerenter", () => (pausado = true));
    painel.addEventListener("pointerleave", () => (pausado = false));
    painel.addEventListener("focusin", () => (pausado = true));
    painel.addEventListener("focusout", () => (pausado = false));
    let x0 = null;
    painel.addEventListener("touchstart", (e) => (x0 = e.touches[0].clientX), { passive: true });
    painel.addEventListener("touchend", (e) => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 45) irPara(idx + (dx < 0 ? 1 : -1), true); x0 = null; });
    new IntersectionObserver(([e]) => (depoVisivel = e.isIntersecting), { threshold: 0.3 }).observe(painel);
    irPara(0); reiniciar();
  }

  /* ── WhatsApp flutuante ─────────────────────────────────────────────── */
  const whats = $(".whats");
  const whatsBotao = $(".whats-botao");
  const whatsMenu = $("#whats-menu");
  const zonasSemBotao = new Set();
  const ioZona = new IntersectionObserver((es) => es.forEach((e) => { e.isIntersecting ? zonasSemBotao.add(e.target) : zonasSemBotao.delete(e.target); atualizarWhats(); }), { threshold: 0.01 });
  $$("#final, .rodape, .contato-botoes, .hero").forEach((z) => ioZona.observe(z));
  const fecharWhats = () => { whatsMenu.hidden = true; whatsBotao.setAttribute("aria-expanded", "false"); };
  // o botão se recolhe quando estaria em cima de outro link ou botão
  let cobrindo = false;
  const medirCobertura = () => {
    const r = whatsBotao.getBoundingClientRect();
    const pts = [[r.left + r.width / 2, r.top + r.height / 2], [r.left + 4, r.top + 4], [r.right - 4, r.top + 4], [r.left + 4, r.bottom - 4], [r.right - 4, r.bottom - 4], [r.left - 6, r.top + r.height / 2]];
    const achou = pts.some(([x, y]) => document.elementsFromPoint(x, y).some((el) => !whats.contains(el) && el.closest("a, button, summary, input, iframe")));
    if (achou !== cobrindo) { cobrindo = achou; atualizarWhats(); }
  };
  let ultimaMedida = 0;
  addEventListener("scroll", () => { const t = performance.now(); if (t - ultimaMedida > 120) { ultimaMedida = t; requestAnimationFrame(medirCobertura); } }, { passive: true });
  addEventListener("scrollend", () => requestAnimationFrame(medirCobertura));
  const atualizarWhats = () => {
    const mostrar = zonasSemBotao.size === 0 && !cobrindo && !document.body.classList.contains("menu-aberto");
    whats.classList.toggle("visivel", mostrar);
    if (!mostrar) fecharWhats();
  };
  whatsBotao.addEventListener("click", (e) => { e.stopPropagation(); const abrir = whatsMenu.hidden; whatsMenu.hidden = !abrir; whatsBotao.setAttribute("aria-expanded", String(abrir)); if (abrir) whatsMenu.querySelector("a").focus({ preventScroll: true }); });
  document.addEventListener("click", (e) => { if (!whats.contains(e.target)) fecharWhats(); });
  addEventListener("keydown", (e) => { if (e.key === "Escape") fecharWhats(); });

  /* ── Respiração guiada: 4 inspira · 4 segura · 6 solta ──────────────── */
  const dialogo = $(".respira");
  if (dialogo) {
    const circ = $(".respira-circulo", dialogo), txt = $(".respira-texto", dialogo), cont = $(".respira-contagem", dialogo);
    const fases = [{ t: "inspire…", d: 4, s: 1 }, { t: "segure…", d: 4, s: 1 }, { t: "solte…", d: 6, s: 0.42 }];
    let timers = [];
    const limpar = () => { timers.forEach(clearTimeout); timers = []; };
    const ciclo = (n) => {
      if (n >= 4) { txt.textContent = "pronto. volte quando quiser"; cont.textContent = ""; circ.style.transitionDuration = "3s"; circ.style.transform = "scale(.6)"; return; }
      let t = 0;
      fases.forEach((f) => {
        timers.push(setTimeout(() => {
          txt.textContent = f.t;
          circ.style.transitionDuration = `${f.d}s`;
          circ.style.transform = `scale(${f.s})`;
          for (let s = 0; s < f.d; s++) timers.push(setTimeout(() => (cont.textContent = String(f.d - s)), s * 1000));
        }, t * 1000));
        t += f.d;
      });
      timers.push(setTimeout(() => ciclo(n + 1), t * 1000));
    };
    $$(".abre-respira").forEach((b) => b.addEventListener("click", () => {
      dialogo.showModal();
      circ.style.transitionDuration = "0s"; circ.style.transform = "scale(.42)";
      txt.textContent = "vamos começar"; cont.textContent = "";
      limpar(); timers.push(setTimeout(() => ciclo(0), 1600));
    }));
    $(".respira-fechar", dialogo).addEventListener("click", () => dialogo.close());
    dialogo.addEventListener("close", limpar);
    dialogo.addEventListener("click", (e) => { if (e.target === dialogo) dialogo.close(); });
  }

  /* ── Ambiente sonoro (Web Audio, desligado por padrão) ──────────────── */
  const botaoSom = $(".som");
  let audio = null;
  const criarAudio = () => {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    const ac = new AC();
    const mestre = ac.createGain(); mestre.gain.value = 0;
    const filtro = ac.createBiquadFilter(); filtro.type = "lowpass"; filtro.frequency.value = 700; filtro.Q.value = 0.4;
    filtro.connect(mestre); mestre.connect(ac.destination);
    [[110, "sine", 0.3, 0], [164.81, "sine", 0.18, 3], [220.4, "triangle", 0.05, -4], [329.6, "sine", 0.035, 2]].forEach(([f, tipo, g, det]) => {
      const o = ac.createOscillator(); o.type = tipo; o.frequency.value = f; o.detune.value = det;
      const gg = ac.createGain(); gg.gain.value = g;
      const lfo = ac.createOscillator(); lfo.frequency.value = 0.05 + Math.random() * 0.08;
      const lg = ac.createGain(); lg.gain.value = g * 0.5; lfo.connect(lg); lg.connect(gg.gain); lfo.start();
      o.connect(gg); gg.connect(filtro); o.start();
    });
    // ar: ruído rosado bem baixo
    const buf = ac.createBuffer(1, ac.sampleRate * 4, ac.sampleRate), d = buf.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < d.length; i++) { const w = Math.random() * 2 - 1; b0 = 0.997 * b0 + w * 0.029; b1 = 0.985 * b1 + w * 0.032; b2 = 0.95 * b2 + w * 0.048; d[i] = (b0 + b1 + b2) * 0.18; }
    const ruido = ac.createBufferSource(); ruido.buffer = buf; ruido.loop = true;
    const rg = ac.createGain(); rg.gain.value = 0.05; ruido.connect(rg); rg.connect(filtro); ruido.start();
    const lfoF = ac.createOscillator(); lfoF.frequency.value = 0.04; const lfoG = ac.createGain(); lfoG.gain.value = 260;
    lfoF.connect(lfoG); lfoG.connect(filtro.frequency); lfoF.start();
    return { ac, mestre };
  };
  botaoSom?.addEventListener("click", async () => {
    const ligar = botaoSom.getAttribute("aria-pressed") !== "true";
    botaoSom.setAttribute("aria-pressed", String(ligar));
    botaoSom.setAttribute("aria-label", ligar ? "Desligar som ambiente" : "Ligar som ambiente");
    if (ligar) {
      if (!audio) audio = criarAudio();
      if (!audio) return;
      await audio.ac.resume();
      const g = audio.mestre.gain, t = audio.ac.currentTime;
      g.cancelScheduledValues(t); g.setValueAtTime(g.value, t); g.linearRampToValueAtTime(0.22, t + 2.5);
    } else if (audio) {
      const g = audio.mestre.gain, t = audio.ac.currentTime;
      g.cancelScheduledValues(t); g.setValueAtTime(g.value, t); g.linearRampToValueAtTime(0, t + 1.2);
      setTimeout(() => { if (botaoSom.getAttribute("aria-pressed") !== "true") audio.ac.suspend(); }, 1300);
    }
  });

  /* ── Cursor com halo âmbar ──────────────────────────────────────────── */
  const halo = $(".cursor-halo");
  if (halo && ponteiroFino && !reduzir) {
    let hx = innerWidth / 2, hy = innerHeight / 2, tx = hx, ty = hy;
    addEventListener("pointermove", (e) => { tx = e.clientX; ty = e.clientY; halo.classList.add("ativo"); halo.classList.toggle("sobre-link", !!e.target.closest("a, button, summary")); }, { passive: true });
    document.addEventListener("pointerleave", () => halo.classList.remove("ativo"));
    const seguir = () => { hx += (tx - hx) * 0.14; hy += (ty - hy) * 0.14; halo.style.transform = `translate3d(${hx.toFixed(1)}px, ${hy.toFixed(1)}px, 0)`; requestAnimationFrame(seguir); };
    requestAnimationFrame(seguir);
  }

  /* ── Laço único de rolagem ──────────────────────────────────────────── */
  const aoRolar = () => { topo.classList.toggle("rolou", scrollY > 30); };
  addEventListener("scroll", aoRolar, { passive: true });
  aoRolar();
  const laco = () => { atualizarCine(); moverGaleria(); moverParalaxe(); requestAnimationFrame(laco); };
  requestAnimationFrame(laco);
})();
