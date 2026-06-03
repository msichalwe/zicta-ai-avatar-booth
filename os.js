/* ============================================================
   TideOS — core shell: boot, parallax, clock, slider, drag, apps
   ============================================================ */
(function () {
  const D = window.TIDE_DATA;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- shared tiny icon set ---------- */
  window.TideIcons = {
    sun:  '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="4.4" fill="#fbbf24"/><g stroke="#fbbf24" stroke-width="1.7" stroke-linecap="round"><path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5 5l1.7 1.7M17.3 17.3 19 19M19 5l-1.7 1.7M6.7 17.3 5 19"/></g></svg>',
    cloud:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M7 18a4 4 0 0 1 .4-8A5 5 0 0 1 17 11a3.5 3.5 0 0 1-.5 7H7Z" fill="#cbe8fb" stroke="#7dd3fc" stroke-width="1.3"/></svg>',
    rain: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M7 14a4 4 0 0 1 .4-8A5 5 0 0 1 17 7a3.5 3.5 0 0 1-.5 7H7Z" fill="#cbe8fb" stroke="#7dd3fc" stroke-width="1.3"/><g stroke="#38bdf8" stroke-width="1.7" stroke-linecap="round"><path d="M8.5 17l-1 2.5M12 17l-1 2.5M15.5 17l-1 2.5"/></g></svg>',
    shield:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 3l7 2.5v5c0 4.4-3 8-7 9.5-4-1.5-7-5.1-7-9.5v-5L12 3Z" stroke="#fff" stroke-width="1.7" stroke-linejoin="round"/><path d="M9 12l2 2 4-4.5" stroke="#fff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    key:  '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="8" cy="8" r="4.2" stroke="#fff" stroke-width="1.7"/><path d="M11 11l8 8M16 16l2-2M18.5 18.5l2-2" stroke="#fff" stroke-width="1.7" stroke-linecap="round"/></svg>',
    lock: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="5" y="10.5" width="14" height="9.5" rx="2.5" stroke="#fff" stroke-width="1.7"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" stroke="#fff" stroke-width="1.7"/><circle cx="12" cy="15" r="1.4" fill="#fff"/></svg>',
    wifi: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M3 9.5a13 13 0 0 1 18 0M6 13a8 8 0 0 1 12 0M9 16.3a3.6 3.6 0 0 1 6 0" stroke="#fff" stroke-width="1.7" stroke-linecap="round"/><circle cx="12" cy="19.3" r="1.3" fill="#fff"/></svg>',
    globe:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#fff" stroke-width="1.6"/><path d="M3 12h18M12 3c2.5 2.4 2.5 15.6 0 18M12 3c-2.5 2.4-2.5 15.6 0 18" stroke="#fff" stroke-width="1.4"/></svg>',
    sim:  '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M6 3h7l5 5v13a0 0 0 0 1 0 0H6a0 0 0 0 1 0 0V3Z" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/><rect x="9" y="12" width="6" height="6" rx="1.2" stroke="#fff" stroke-width="1.4"/></svg>',
    chat: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7A2.5 2.5 0 0 1 17.5 16H9l-4 4v-4H6.5" stroke="#fff" stroke-width="1.6" stroke-linejoin="round" fill="none"/></svg>',
    spark:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/></svg>',
    child:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="7" r="3.2" stroke="#fff" stroke-width="1.6"/><path d="M5.5 20a6.5 6.5 0 0 1 13 0" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/></svg>',
    update:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M20 12a8 8 0 1 1-2.3-5.6" stroke="#fff" stroke-width="1.7" stroke-linecap="round"/><path d="M20 4v4h-4" stroke="#fff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };

  /* ======================= BOOT ======================= */
  function boot() {
    const bar = $('#bootBar'), status = $('#bootStatus'), bootEl = $('#boot');
    const steps = [
      [12, 'Warming the currents…'],
      [34, 'Calibrating the tide…'],
      [58, 'Loading ZICTA knowledge…'],
      [78, 'Securing the channel…'],
      [100, 'Welcome aboard']
    ];
    let i = 0;
    const dur = reduce ? 90 : 520;
    function next() {
      if (i >= steps.length) { finish(); return; }
      const [pct, txt] = steps[i++];
      bar.style.width = pct + '%';
      status.textContent = txt;
      setTimeout(next, dur);
    }
    function finish() {
      setTimeout(() => {
        bootEl.classList.add('done');
        document.body.classList.add('os-ready');
      }, 360);
    }
    setTimeout(next, reduce ? 50 : 500);
  }
  window.__tideBoot = boot;

  /* ======================= CLOCK ======================= */
  function clock() {
    const big = $('#bigClock'), date = $('#bigDate'), mini = $('#menuClock');
    function tick() {
      const n = new Date();
      let h = n.getHours(), m = n.getMinutes(), s = n.getSeconds();
      const hh = String(h).padStart(2, '0'), mm = String(m).padStart(2, '0'), ss = String(s).padStart(2, '0');
      if (big) big.innerHTML = `${hh}:${mm}<span class="sec">${ss}</span>`;
      if (mini) mini.textContent = `${hh}:${mm}`;
      if (date) date.textContent = n.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
      // also any open slider time
      const st = $('#slideTime'); if (st) st.innerHTML = `${hh}:${mm}<span style="font-size:.5em;color:var(--accent-2)">${ss}</span>`;
    }
    tick(); setInterval(tick, 1000);
  }

  /* ======================= SLIDING TILES ======================= */
  function slider() {
    const track = $('#sliderTrack'), dots = $('#sliderDots');
    if (!track) return;
    const w = D.weather;
    const cells = w.forecast.map(f => `<div class="wx-cell"><div class="d">${f.d}</div><div style="margin:4px 0">${window.TideIcons[f.ic]}</div><div class="t">${f.t}</div></div>`).join('');
    track.innerHTML = `
      <div class="slide">
        <div class="s-top"><span>Time · ${w.city}</span><span>${window.TideIcons.sun}</span></div>
        <div class="s-main"><div class="big" id="slideTime">--:--</div><div class="sub" id="slideDay">—</div></div>
      </div>
      <div class="slide">
        <div class="s-top"><span>Weather · ${w.city}</span><span>27°</span></div>
        <div class="s-main">
          <div class="big">27°<span style="font-size:.4em;font-weight:600;color:var(--ink-soft)"> Sunny</span></div>
          <div class="wx-row">${cells}</div>
        </div>
      </div>
      <div class="slide">
        <div class="s-top"><span>Tide · today</span><span>🌊</span></div>
        <div class="s-main">
          <div class="big">High <span style="font-size:.5em;color:var(--ink-soft)">14:20</span></div>
          <div class="sub">Calm seas · gentle 0.4m swell · UV moderate</div>
        </div>
      </div>`;
    const sd = $('#slideDay'); if (sd) sd.textContent = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' });
    const count = 3; let idx = 0;
    dots.innerHTML = Array.from({ length: count }, (_, i) => `<b class="${i === 0 ? 'on' : ''}" data-i="${i}"></b>`).join('');
    function go(n) { idx = (n + count) % count; track.style.transform = `translateX(${-idx * 100}%)`; $$('#sliderDots b').forEach((b, i) => b.classList.toggle('on', i === idx)); }
    dots.addEventListener('click', e => { const b = e.target.closest('b'); if (b) { go(+b.dataset.i); reset(); } });
    let timer; function reset() { clearInterval(timer); if (!reduce) timer = setInterval(() => go(idx + 1), 4500); }
    reset();
  }

  /* ======================= PHOTO SLIDESHOW ======================= */
  function photos() {
    const stage = $('#photoStage'), dots = $('#photoDots');
    const tagEl = $('#photoTag'), titleEl = $('#photoTitle'), overlay = $('.photo-overlay');
    if (!stage) return;
    const list = D.photos || [];
    if (!list.length) return;
    stage.innerHTML = list.map((p, i) =>
      `<div class="photo-slide${i === 0 ? ' on' : ''}" style="background-image:url(${p.img})"></div>`).join('');
    const slides = $$('.photo-slide', stage);
    dots.innerHTML = list.map((_, i) => `<b class="${i === 0 ? 'on' : ''}" data-i="${i}"></b>`).join('');
    let idx = -1;
    function go(n) {
      idx = (n + list.length) % list.length;
      slides.forEach((s, i) => s.classList.toggle('on', i === idx));
      $$('#photoDots b').forEach((b, i) => b.classList.toggle('on', i === idx));
      tagEl.textContent = list[idx].tag;
      titleEl.textContent = list[idx].title;
      overlay.classList.remove('show'); void overlay.offsetWidth; overlay.classList.add('show');
    }
    go(0);
    dots.addEventListener('click', e => { const b = e.target.closest('b'); if (b) { go(+b.dataset.i); reset(); } });
    const prev = $('#photoPrev'), next = $('#photoNext');
    if (prev) prev.addEventListener('click', e => { e.stopPropagation(); go(idx - 1); reset(); });
    if (next) next.addEventListener('click', e => { e.stopPropagation(); go(idx + 1); reset(); });
    let timer; function reset() { clearInterval(timer); if (!reduce) timer = setInterval(() => go(idx + 1), 5000); }
    reset();
  }

  /* ======================= FACT TICKER ======================= */
  function facts() {
    const box = $('#factBox'); if (!box) return;
    let i = 0, first = true;
    function show() {
      const f = D.facts[i % D.facts.length];
      if (first || reduce) {
        box.innerHTML = `<span class="ftag">${f.tag}</span><div class="ftxt">${f.html}</div>`;
        box.style.opacity = 1; first = false; i++;
        return;
      }
      box.style.opacity = 0; box.style.transition = 'opacity .4s';
      setTimeout(() => {
        box.innerHTML = `<span class="ftag">${f.tag}</span><div class="ftxt">${f.html}</div>`;
        box.style.opacity = 1;
      }, 380);
      i++;
    }
    show();
    if (!reduce) setInterval(show, 5200);
    // tap to flip → open knowledge app
    $('.w-fact').addEventListener('click', e => { if (!e.target.closest('.grab') && !window.__justDragged) openApp('knowledge'); });
  }

  /* ======================= PARALLAX ======================= */
  function parallax() {
    const scene = $('#scene');
    const layers = $$('#scene > *');
    let tx = 0, ty = 0, cx = 0, cy = 0;
    function set(px, py) { tx = px; ty = py; }
    window.addEventListener('pointermove', e => {
      const nx = (e.clientX / innerWidth - .5);
      const ny = (e.clientY / innerHeight - .5);
      set(nx, ny);
    });
    window.addEventListener('deviceorientation', e => {
      if (e.gamma == null) return;
      set(Math.max(-1, Math.min(1, e.gamma / 35)), Math.max(-1, Math.min(1, (e.beta - 30) / 35)));
    });
    function loop() {
      cx += (tx - cx) * 0.06; cy += (ty - cy) * 0.06;
      const k = +getComputedStyle(document.documentElement).getPropertyValue('--parallax') || 1;
      layers.forEach(l => {
        const d = (+l.dataset.depth || 0) * k;
        l.style.transform = `translate3d(${-cx * d}px, ${-cy * d * .7}px, 0)`;
      });
      requestAnimationFrame(loop);
    }
    if (!reduce) loop();
  }

  /* ---- ambient: glints + bubbles ---- */
  function ambient() {
    const g = $('#glints');
    for (let i = 0; i < 16; i++) {
      const s = document.createElement('span'); s.className = 'glint';
      s.style.left = (10 + Math.random() * 85) + '%';
      s.style.top = (62 + Math.random() * 32) + '%';
      s.style.animationDelay = (Math.random() * 4) + 's';
      g.appendChild(s);
    }
    const b = $('#bubbles');
    for (let i = 0; i < 14; i++) {
      const s = document.createElement('span'); s.className = 'bubble';
      const sz = 6 + Math.random() * 20;
      s.style.left = Math.random() * 100 + '%';
      s.style.width = sz + 'px'; s.style.height = sz + 'px';
      s.style.setProperty('--bx', (Math.random() * 80 - 40) + 'px');
      s.style.animationDuration = (10 + Math.random() * 14) + 's';
      s.style.animationDelay = (Math.random() * 12) + 's';
      b.appendChild(s);
    }
  }

  /* ======================= DRAG WIDGETS ======================= */
  function drag() {
    let active = null, sx, sy, ox, oy;
    $$('.widget').forEach(w => {
      const handle = w.querySelector('.grab') || w;
      handle.addEventListener('pointerdown', e => {
        if (w.classList.contains('tile') && !w.querySelector('.grab')) return;
        active = w; w.classList.add('dragging');
        const r = w.getBoundingClientRect();
        const pr = w.parentElement.getBoundingClientRect();
        // switch to absolute px positioning relative to desktop (works in any orientation)
        w.style.position = 'absolute';
        w.style.width = r.width + 'px';
        w.style.height = r.height + 'px';
        w.style.margin = '0';
        w.style.left = (r.left - pr.left) + 'px';
        w.style.top = (r.top - pr.top) + 'px';
        w.style.right = 'auto'; w.style.bottom = 'auto';
        sx = e.clientX; sy = e.clientY; ox = r.left - pr.left; oy = r.top - pr.top;
        window.__justDragged = false;
        handle.setPointerCapture?.(e.pointerId);
        e.preventDefault();
      });
    });
    window.addEventListener('pointermove', e => {
      if (!active) return;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.abs(dx) + Math.abs(dy) > 4) window.__justDragged = true;
      const pr = active.parentElement.getBoundingClientRect();
      let nx = ox + dx, ny = oy + dy;
      nx = Math.max(0, Math.min(pr.width - active.offsetWidth, nx));
      ny = Math.max(0, Math.min(pr.height - active.offsetHeight, ny));
      active.style.left = nx + 'px'; active.style.top = ny + 'px';
    });
    window.addEventListener('pointerup', () => {
      if (active) { active.classList.remove('dragging'); active = null; setTimeout(() => window.__justDragged = false, 50); }
    });
  }

  /* ======================= APP MANAGER ======================= */
  const builders = {
    camera: window.buildCamera,
    quiz: window.buildQuiz,
    knowledge: window.buildKnowledge,
    ai: window.buildAI,
    arcade: window.buildArcade,
    zictabot: window.buildZictabot
  };
  const closers = {};
  let current = null;

  function openApp(name, originEl) {
    if (current) return;
    const layer = $('#appLayer');
    const app = document.createElement('div');
    app.className = 'app';
    layer.appendChild(app);
    const api = builders[name] ? builders[name](app, { close: () => closeApp(), icons: window.TideIcons }) : null;
    closers[name] = api && api.onClose;
    // origin morph
    if (originEl) {
      const r = originEl.getBoundingClientRect();
      app.style.transformOrigin = `${r.left + r.width / 2}px ${r.top + r.height / 2}px`;
    }
    app.classList.add('open');
    requestAnimationFrame(() => app.classList.add('anim-in'));
    current = { name, app };
    document.body.classList.add('app-active');
  }
  function closeApp() {
    if (!current) return;
    const { name, app } = current;
    if (closers[name]) try { closers[name](); } catch (e) {}
    app.classList.remove('anim-in'); app.classList.add('anim-out');
    setTimeout(() => { app.remove(); }, reduce ? 20 : 420);
    current = null;
    document.body.classList.remove('app-active');
  }
  window.openApp = openApp;
  window.closeApp = closeApp;

  /* launch wiring */
  function wireLaunchers() {
    $$('[data-app]').forEach(el => {
      el.addEventListener('click', e => {
        if (el.classList.contains('widget') && (e.target.closest('.grab') || window.__justDragged)) return;
        openApp(el.dataset.app, el);
      });
    });
    $$('[data-action="tweaks"]').forEach(el => el.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('tide-open-tweaks'));
    }));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeApp(); });
  }

  /* ======================= INIT ======================= */
  document.addEventListener('DOMContentLoaded', () => {
    boot(); clock(); slider(); photos(); facts(); parallax(); ambient(); drag(); wireLaunchers();
    // deep-link: ?app=zictabot opens an app once the desktop is ready
    const want = new URLSearchParams(location.search).get('app');
    if (want && builders[want]) setTimeout(() => openApp(want), reduce ? 200 : 2600);
  });
})();
