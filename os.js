/* ============================================================
   TideOS — core shell: boot, parallax, clock, slider, drag, apps
   ============================================================ */
(function () {
  const D = window.TIDE_DATA;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- score store (persists best %; feeds the Leaderboard widget) ---------- */
  const SCORE_KEY = 'tideos.scores.v1';
  window.TideScore = {
    all() { try { return JSON.parse(localStorage.getItem(SCORE_KEY) || '{}'); } catch (e) { return {}; } },
    best(k) { const a = this.all(); return k in a ? a[k] : null; },
    record(k, v) {
      try { const a = this.all(); v = Math.round(v);
        if (!(k in a) || v > a[k]) { a[k] = v; localStorage.setItem(SCORE_KEY, JSON.stringify(a)); window.dispatchEvent(new CustomEvent('tide-score')); }
      } catch (e) {}
    }
  };

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
    update:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M20 12a8 8 0 1 1-2.3-5.6" stroke="#fff" stroke-width="1.7" stroke-linecap="round"/><path d="M20 4v4h-4" stroke="#fff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    hook: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M7 4v8a5 5 0 0 0 10 0" stroke="#fff" stroke-width="1.7" stroke-linecap="round"/><circle cx="7" cy="3.2" r="1.5" fill="#fff"/></svg>',
    gavel:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M14 3l7 7-3 3-7-7 3-3Z" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/><path d="M10 7 4 13M5 21h10" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/></svg>',
    chip: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="6" y="6" width="12" height="12" rx="2" stroke="#fff" stroke-width="1.6"/><rect x="9.5" y="9.5" width="5" height="5" rx="1" fill="#fff"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/></svg>'
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
    // tap the photo -> open large in the lightbox modal
    const pw = $('.w-photo');
    if (pw) pw.addEventListener('click', e => {
      if (e.target.closest('.photo-nav') || e.target.closest('.grab') || e.target.closest('.photo-dots') || window.__justDragged) return;
      const p = list[idx]; if (p && window.openLightbox) window.openLightbox(p.img, `<b>${p.title || ''}</b>${p.tag ? ' · ' + p.tag : ''}`);
    });
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
    zictabot: window.buildZictabot,
    map: window.buildMap
  };
  const closers = {};
  let current = null;

  function openApp(name, originEl) {
    if (current) return;
    window.dispatchEvent(new Event('tide-app-open'));
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

  /* ======================= NETWORK PULSE WIDGET ======================= */
  function networkPulse() {
    const box = $('#netBars'); if (!box || !D.networks) return;
    box.innerHTML = D.networks.map(n => `
      <div class="net-row">
        <span class="net-name">${n.name}</span>
        <span class="net-bars" data-s="${n.strength}">${[1,2,3,4,5].map(i => `<i class="${i <= n.strength ? 'on' : ''}" style="--c:${n.color}"></i>`).join('')}</span>
        <span class="net-pct">${n.strength * 20}%</span>
      </div>`).join('');
    if (reduce) return;
    setInterval(() => {
      $$('.net-bars', box).forEach(r => {
        const base = +r.dataset.s, jitter = Math.random() < .45 ? Math.max(2, base - 1) : base;
        $$('i', r).forEach((b, i) => b.classList.toggle('on', i < jitter));
      });
    }, 1700);
  }

  /* ======================= CYBER WEATHER (threat gauge) ======================= */
  function cyberWeather() {
    const needle = $('#wxNeedle'), label = $('#wxLabel'), tip = $('#wxTip'); if (!needle) return;
    const levels = [
      { a: -68, name: 'LOW',      cls: 'low', tip: 'Calm seas — keep 2FA on and stay alert.' },
      { a: -24, name: 'MODERATE', cls: 'mod', tip: 'Phishing about — verify links before tapping.' },
      { a: 24,  name: 'ELEVATED', cls: 'hi',  tip: 'Scam SMS rising — never share OTPs or PINs.' },
      { a: 64,  name: 'HIGH',     cls: 'max', tip: 'Active fraud wave — double-check every request.' }
    ];
    let i = 1;
    function set() { const L = levels[i]; needle.style.transform = `rotate(${L.a}deg)`; label.textContent = L.name; label.className = 'wx-level ' + L.cls; tip.textContent = L.tip; }
    set();
    if (!reduce) setInterval(() => { i = (i + (Math.random() < .5 ? 1 : levels.length - 1)) % levels.length; set(); }, 5200);
  }

  /* ======================= LEADERBOARD WIDGET ======================= */
  const SCORE_LABELS = {
    'quiz:core':'Quiz · ZICTA & Safety','quiz:pass':'Quiz · Passwords','quiz:phish':'Quiz · Phishing',
    'quiz:law':'Quiz · Cyber Law','quiz:tech':'Quiz · How Tech Works','quiz:privacy':'Quiz · Privacy',
    'game:scam':'Spot the Scam','game:phish':'Phish or Legit','game:pass':'Strong or Weak','game:tf':'True or False',
    'game:law':'Legal or Illegal','game:ttt':'Cyber Tac-Toe','game:memory':'Memory Match','game:defend':'Threat Defender',
    'game:cipher':'Cipher Crack','game:binary':'Binary Blocks'
  };
  function leaderboard() {
    const list = $('#boardList'); if (!list) return;
    function render() {
      const all = window.TideScore.all();
      const rows = Object.keys(all).map(k => ({ n: SCORE_LABELS[k] || k, v: all[k] })).sort((a, b) => b.v - a.v).slice(0, 5);
      if (!rows.length) { list.innerHTML = '<div class="board-empty">Play a quiz or game to climb the board! 🏆</div>'; return; }
      const medal = ['🥇','🥈','🥉','4','5'];
      list.innerHTML = rows.map((r, i) => `<div class="board-row"><span class="board-rank">${medal[i]}</span><span class="board-name">${r.n}</span><span class="board-score">${r.v}%</span></div>`).join('');
    }
    render();
    window.addEventListener('tide-score', render);
  }

  /* ======================= QUICK ACTIONS WIDGET ======================= */
  function quickActions() {
    const grid = $('#quickGrid'); if (!grid || !D.quickActions) return;
    grid.innerHTML = D.quickActions.map((a, k) => `
      <button class="qa-chip" data-k="${k}">
        <span class="qa-ico">${window.TideIcons[a.ico] || ''}</span>
        <span class="qa-txt"><b>${a.label}</b><small>${a.sub}</small></span>
      </button>`).join('');
    grid.querySelectorAll('.qa-chip').forEach((b, k) => b.onclick = () => {
      const a = D.quickActions[k];
      if (a.app) openApp(a.app); else if (a.game) openApp('arcade');
    });
  }

  /* ======================= ZICTABOT ROBOT (eye-tracking) ======================= */
  function robot() {
    const scene = $('#zbotScene'), pupils = $('#zPupils'); if (!scene || !pupils) return;
    let tx = 0, ty = 0, cx = 0, cy = 0;
    window.addEventListener('pointermove', e => {
      const r = scene.getBoundingClientRect();
      tx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (innerWidth / 2)));
      ty = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (innerHeight / 2)));
    });
    if (reduce) return;
    (function loop() { cx += (tx - cx) * .1; cy += (ty - cy) * .1; pupils.setAttribute('transform', `translate(${(cx * 4).toFixed(2)} ${(cy * 3).toFixed(2)})`); requestAnimationFrame(loop); })();
  }

  /* ======================= RADIAL QUICK-ACTIONS FAB ======================= */
  function quickFab() {
    if ($('#qaFab')) return;
    // self-contained styles
    const st = document.createElement('style'); st.id = 'qaFabStyle';
    st.textContent = `
      #qaScrim{position:fixed;inset:0;z-index:58;background:rgba(6,30,52,.28);backdrop-filter:blur(2px);opacity:0;pointer-events:none;transition:opacity .3s}
      #qaScrim.on{opacity:1;pointer-events:auto}
      #qaFab{position:fixed;left:24px;bottom:30px;z-index:61;width:60px;height:60px;transition:opacity .3s,transform .3s}
      body.app-active #qaFab{opacity:0;pointer-events:none;transform:translateY(18px)}
      body.app-active #qaScrim{display:none}
      .qa-trigger{position:absolute;left:0;bottom:0;width:60px;height:60px;border-radius:50%;border:none;cursor:pointer;z-index:3;
        background:radial-gradient(circle at 34% 28%,#38bdf8,#0369a1);color:#fff;box-shadow:0 12px 30px rgba(3,105,161,.5),inset 0 1px 0 rgba(255,255,255,.4);
        display:grid;place-items:center;transition:transform .35s cubic-bezier(.2,.8,.3,1.4)}
      .qa-trigger svg{transition:transform .35s var(--spring,cubic-bezier(.2,.8,.3,1.4))}
      #qaFab.open .qa-trigger{transform:rotate(45deg)}
      #qaFab.open .qa-trigger{background:radial-gradient(circle at 34% 28%,#22d3ee,#0c4a6e)}
      .qa-item{position:absolute;left:6px;bottom:6px;width:48px;height:48px;border-radius:50%;z-index:2;cursor:pointer;border:none;
        display:grid;place-items:center;color:#fff;background:rgba(255,255,255,.16);
        box-shadow:0 8px 22px rgba(6,40,61,.4),inset 0 1px 0 rgba(255,255,255,.35);backdrop-filter:blur(14px) saturate(160%);
        transform:translate(0,0) scale(.2);opacity:0;pointer-events:none;
        transition:transform .42s cubic-bezier(.2,.85,.3,1.35),opacity .26s}
      .qa-item .qa-lbl{position:absolute;left:58px;top:50%;transform:translateY(-50%) translateX(-6px);white-space:nowrap;
        background:rgba(6,40,61,.92);color:#fff;font:600 12.5px/1 'Manrope',sans-serif;padding:7px 11px;border-radius:9px;opacity:0;transition:.25s;pointer-events:none}
      .qa-item .qa-lbl::after{content:"";position:absolute;right:100%;top:50%;transform:translateY(-50%);border:5px solid transparent;border-right-color:rgba(6,40,61,.92);border-left:0}
      #qaFab.open .qa-item{opacity:1;pointer-events:auto;transform:var(--t) scale(1)}
      #qaFab.open .qa-item:hover{filter:brightness(1.12)}
      #qaFab.open .qa-item:hover .qa-lbl{opacity:1;transform:translateY(-50%) translateX(0)}
      .qa-item svg{width:22px;height:22px}
    `;
    document.head.appendChild(st);

    const ITEMS = [
      { label: 'Talk to Zictabot', ico: 'chat',   run: () => openApp('zictabot') },
      { label: 'Report a scam',    ico: 'shield', run: () => openApp('knowledge') },
      { label: 'Photo Booth',      ico: 'spark',  run: () => openApp('camera') },
      { label: 'Cyber Quiz',       ico: 'lock',   run: () => openApp('quiz') },
      { label: 'Mini Games',       ico: 'globe',  run: () => openApp('arcade') },
    ];
    const scrim = document.createElement('div'); scrim.id = 'qaScrim';
    const fab = document.createElement('div'); fab.id = 'qaFab';
    fab.innerHTML = `<button class="qa-trigger" aria-label="Quick actions">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/></svg></button>`;
    const R = 132, start = 8, end = 86, n = ITEMS.length;
    ITEMS.forEach((it, i) => {
      const ang = (start + (n > 1 ? (end - start) * i / (n - 1) : 0)) * Math.PI / 180;
      const x = Math.cos(ang) * R, y = -Math.sin(ang) * R;
      const b = document.createElement('button'); b.className = 'qa-item';
      b.style.setProperty('--t', `translate(${x.toFixed(0)}px, ${y.toFixed(0)}px)`);
      b.style.transitionDelay = (i * 0.04) + 's';
      b.innerHTML = `${window.TideIcons[it.ico] || ''}<span class="qa-lbl">${it.label}</span>`;
      b.onclick = (e) => { e.stopPropagation(); close(); it.run(); };
      fab.appendChild(b);
    });
    document.body.appendChild(scrim); document.body.appendChild(fab);

    let open = false;
    function setOpen(v) { open = v; fab.classList.toggle('open', v); scrim.classList.toggle('on', v); }
    function close() { setOpen(false); }
    fab.querySelector('.qa-trigger').onclick = (e) => { e.stopPropagation(); setOpen(!open); };
    scrim.onclick = close;
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    window.addEventListener('tide-app-open', close);
    if (location.hash === '#qa') setTimeout(() => setOpen(true), 200);
  }

  /* ======================= PHOTO LIGHTBOX (modal) ======================= */
  function lightbox() {
    if ($('#tideLightbox')) return;
    const st = document.createElement('style'); st.id = 'lbStyle';
    st.textContent = `
      #tideLightbox{position:fixed;inset:0;z-index:120;display:flex;align-items:center;justify-content:center;padding:5vmin;
        background:rgba(4,22,40,.66);backdrop-filter:blur(10px);opacity:0;pointer-events:none;transition:opacity .3s}
      #tideLightbox.on{opacity:1;pointer-events:auto}
      #tideLightbox .lb-card{position:relative;max-width:92vw;max-height:90vh;border-radius:22px;overflow:hidden;
        box-shadow:0 40px 100px rgba(0,0,0,.55);transform:scale(.92);transition:transform .35s cubic-bezier(.2,.8,.3,1.2);background:#0a1626}
      #tideLightbox.on .lb-card{transform:scale(1)}
      #tideLightbox img{display:block;max-width:92vw;max-height:90vh;object-fit:contain}
      #tideLightbox .lb-cap{position:absolute;left:0;right:0;bottom:0;padding:30px 22px 18px;color:#fff;font-family:'Manrope',sans-serif;
        font-weight:600;font-size:clamp(14px,1.7vw,20px);background:linear-gradient(to top,rgba(4,22,40,.85),transparent)}
      #tideLightbox .lb-x{position:absolute;top:14px;right:14px;width:42px;height:42px;border-radius:50%;border:none;cursor:pointer;
        background:rgba(255,255,255,.92);color:#0a1626;display:grid;place-items:center;box-shadow:0 6px 18px rgba(0,0,0,.3)}
    `;
    document.head.appendChild(st);
    const lb = document.createElement('div'); lb.id = 'tideLightbox';
    lb.innerHTML = `<div class="lb-card"><img id="lbImg" alt=""/><div class="lb-cap" id="lbCap"></div>
      <button class="lb-x" aria-label="Close"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg></button></div>`;
    document.body.appendChild(lb);
    const img = lb.querySelector('#lbImg'), capEl = lb.querySelector('#lbCap');
    function close() { lb.classList.remove('on'); }
    lb.querySelector('.lb-x').onclick = close;
    lb.onclick = (e) => { if (e.target === lb) close(); };
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    window.openLightbox = (src, caption) => { img.src = src; capEl.innerHTML = caption || ''; capEl.style.display = caption ? '' : 'none'; lb.classList.add('on'); };
  }

  /* ======================= INIT ======================= */
  document.addEventListener('DOMContentLoaded', () => {
    boot(); clock(); slider(); photos(); facts(); parallax(); ambient(); drag(); wireLaunchers();
    quickFab(); lightbox();
    networkPulse(); cyberWeather(); leaderboard(); quickActions(); robot();
    // deep-link: ?app=zictabot opens an app once the desktop is ready
    const want = new URLSearchParams(location.search).get('app');
    if (want && builders[want]) setTimeout(() => openApp(want), reduce ? 200 : 2600);
  });
})();
