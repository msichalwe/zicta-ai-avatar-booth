/* ============================================================
   TideOS — Photo Booth (webcam + filters + ZICTA booth backgrounds)
   Background replacement via MediaPipe Selfie Segmentation (lazy, optional).
   Default = original video + filters (always works); booth backgrounds opt-in.
   buildCamera(app, ctx) -> { onClose }
   ============================================================ */
window.buildCamera = function (app, ctx) {
  const FILTERS = [
    { id: 'none',   name: 'True',     cls: 'fx-none',   sw: 'linear-gradient(135deg,#bae6fd,#7dd3fc)' },
    { id: 'lagoon', name: 'Lagoon',   cls: 'fx-lagoon', sw: 'linear-gradient(135deg,#5eead4,#0ea5e9)' },
    { id: 'deep',   name: 'Deep Sea', cls: 'fx-deep',   sw: 'linear-gradient(135deg,#2563eb,#0c4a6e)' },
    { id: 'sunny',  name: 'Sunset',   cls: 'fx-sunny',  sw: 'linear-gradient(135deg,#fde68a,#fb923c)' },
    { id: 'mono',   name: 'Pearl',    cls: 'fx-mono',   sw: 'linear-gradient(135deg,#e5e7eb,#9ca3af)' },
    { id: 'noir',   name: 'Abyss',    cls: 'fx-noir',   sw: 'linear-gradient(135deg,#475569,#0f172a)' }
  ];
  // Backgrounds: 'live' = real bg; 'blur' = blurred; the rest = ZICTA booth scenes (procedural)
  const BGS = [
    { id: 'live',   name: 'Original', sw: 'linear-gradient(135deg,#cbd5e1,#94a3b8)' },
    { id: 'blur',   name: 'Blur',     sw: 'linear-gradient(135deg,#bae6fd,#7dd3fc)' },
    { id: 'studio', name: 'ZICTA Studio', sw: 'linear-gradient(135deg,#22d3ee,#0369a1)' },
    { id: 'ocean',  name: 'Ocean',    sw: 'linear-gradient(135deg,#7dd3fc,#0369a1)' },
    { id: 'sky',    name: 'Sky',      sw: 'linear-gradient(135deg,#e0f2fe,#7dd3fc)' },
    { id: 'grid',   name: 'Cyber',    sw: 'linear-gradient(135deg,#0ea5e9,#06283d)' }
  ];
  const W = 1280, H = 960;

  app.innerHTML = `
    <div class="app-bar">
      <div class="a-ico ic-cam">${camIco()}</div>
      <div><h2>Photo Booth</h2><div class="a-sub">Filters · ZICTA booth backgrounds</div></div>
      <div class="sp"></div>
      <button class="close-app" title="Close (Esc)">${x()}</button>
    </div>
    <div class="app-body">
      <div class="cam-wrap">
        <div class="cam-stage">
          <div class="cam-frame">
            <video id="camVideo" autoplay playsinline muted style="display:none"></video>
            <canvas id="camLive" class="cam-live"></canvas>
            <div class="vignette"></div>
            <div class="badge"><span class="tag">ZICTA</span><span>ZICTAOS · Stay Cyber-Safe</span></div>
            <div class="flash" id="flash"></div>
            <div class="countdown" id="count"><span></span></div>
            <div class="cam-placeholder" id="camPlaceholder">
              <div class="ic">${bigCam()}</div>
              <h3>Step into the ZICTA booth</h3>
              <p>Allow camera access to take a selfie with live filters & branded booth backgrounds. Nothing leaves your device.</p>
              <button class="btn" id="startCam">Enable camera</button>
            </div>
          </div>
        </div>
        <div class="cam-side">
          <div>
            <h4>Booth background</h4>
            <div class="filter-grid" id="bgGrid"></div>
          </div>
          <div>
            <h4>Filter</h4>
            <div class="filter-grid" id="filterGrid"></div>
          </div>
          <div>
            <h4>Captures</h4>
            <div class="gallery" id="gallery"><span class="empty">No photos yet — say cheese 🐠</span></div>
          </div>
          <div class="cam-actions">
            <button class="btn ghost" id="funBtn" aria-pressed="false">✨ Face reactions: Off</button>
            <button class="shutter" id="shutter" disabled>${shutIco()} Take photo</button>
            <button class="btn ghost" id="download" disabled>Download last shot</button>
          </div>
        </div>
      </div>
    </div>`;

  const video = app.querySelector('#camVideo');
  const live = app.querySelector('#camLive');
  const flash = app.querySelector('#flash');
  const count = app.querySelector('#count');
  const placeholder = app.querySelector('#camPlaceholder');
  const shutter = app.querySelector('#shutter');
  const dl = app.querySelector('#download');
  const gallery = app.querySelector('#gallery');
  live.width = W; live.height = H;
  const lctx = live.getContext('2d');

  let stream = null, fxId = 'none', bgId = 'live', shots = [], lastData = null, hasCam = false;
  let raf = 0, disposed = false, seg = null, segReady = false, segLoading = false, segBusy = false;
  // face reactions (playful emoji props on detected faces — works for groups)
  let faceOn = false, faceapi = null, faceReady = false, faceLoading = false, faceDets = [], lastDetT = 0, mapInfo = { mode: 'raw', sx: 0, sy: 0, sw: 1, sh: 1 };
  const EMO = { happy: '😄', surprised: '😮', sad: '😢', angry: '😠', fearful: '😨', disgusted: '🤢', neutral: '😎' };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- filter chips ---------- */
  const fgrid = app.querySelector('#filterGrid');
  fgrid.innerHTML = FILTERS.map(f => `
    <div class="filter-chip ${f.id === 'none' ? 'on' : ''}" data-fx="${f.id}">
      <div class="sw" style="background:${f.sw}"></div>${f.name}
    </div>`).join('');
  fgrid.addEventListener('click', e => {
    const chip = e.target.closest('.filter-chip'); if (!chip) return;
    fgrid.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('on'));
    chip.classList.add('on'); fxId = chip.dataset.fx;
  });

  /* ---------- background chips ---------- */
  const bgrid = app.querySelector('#bgGrid');
  bgrid.innerHTML = BGS.map(b => `
    <div class="filter-chip ${b.id === 'live' ? 'on' : ''}" data-bg="${b.id}">
      <div class="sw" style="background:${b.sw}"></div>${b.name}
    </div>`).join('');
  bgrid.addEventListener('click', async e => {
    const chip = e.target.closest('.filter-chip'); if (!chip) return;
    const id = chip.dataset.bg;
    if (id !== 'live' && id !== 'blur') {           // booth scenes + blur need segmentation
      const ok = await ensureSeg();
      if (!ok) { toast('Background replacement needs internet — using Original.'); return; }
    } else if (id === 'blur') {
      const ok = await ensureSeg(); if (!ok) { toast('Blur needs internet — using Original.'); return; }
    }
    bgrid.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('on'));
    chip.classList.add('on'); bgId = id;
  });

  function toast(msg) {
    const t = document.createElement('div'); t.textContent = msg;
    t.style.cssText = 'position:absolute;left:50%;top:18px;transform:translateX(-50%);background:rgba(6,40,61,.92);color:#fff;font:600 13px Manrope,sans-serif;padding:9px 16px;border-radius:10px;z-index:9;box-shadow:0 8px 20px rgba(0,0,0,.3)';
    app.querySelector('.cam-frame').appendChild(t); setTimeout(() => t.remove(), 2600);
  }

  /* ---------- Face reactions (face-api.js, lazy) — playful emoji props, group-aware ---------- */
  async function ensureFace() {
    if (faceReady) return true;
    if (faceLoading) { while (faceLoading) await new Promise(r => setTimeout(r, 100)); return faceReady; }
    faceLoading = true;
    try {
      if (!window.faceapi) await loadScript('https://cdn.jsdelivr.net/npm/@vladmandic/face-api/dist/face-api.js');
      faceapi = window.faceapi;
      const base = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';
      await faceapi.nets.tinyFaceDetector.loadFromUri(base);
      await faceapi.nets.faceExpressionNet.loadFromUri(base);
      faceReady = true;
    } catch (e) { console.warn('face-api unavailable:', e); faceReady = false; }
    faceLoading = false; return faceReady;
  }
  async function detectFaces() {
    if (!faceReady || !hasCam || !video.videoWidth) return;
    try {
      const opts = new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.4 });
      const res = await faceapi.detectAllFaces(video, opts).withFaceExpressions();
      faceDets = res.map(r => ({ box: r.detection.box, exp: topExp(r.expressions) }));
    } catch (e) { /* skip a frame */ }
  }
  function topExp(ex) { let k = 'neutral', v = 0; for (const key in ex) { if (ex[key] > v) { v = ex[key]; k = key; } } return k; }
  function mapBox(b) {
    if (mapInfo.mode === 'seg') {
      const fx = W / (video.videoWidth || W), fy = H / (video.videoHeight || H);
      return { cx: W - (b.x + b.width / 2) * fx, y: b.y * fy, w: b.width * fx };
    }
    const sc = W / mapInfo.sw, scY = H / mapInfo.sh;
    return { cx: W - (b.x - mapInfo.sx + b.width / 2) * sc, y: (b.y - mapInfo.sy) * scY, w: b.width * sc };
  }
  function drawFaces(c) {
    if (!faceOn || !faceDets.length) return;
    for (const d of faceDets) {
      const p = mapBox(d.box); const size = Math.max(34, p.w * 0.7);
      c.save(); c.font = size + 'px serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText(EMO[d.exp] || '😎', p.cx, p.y - size * 0.3);
      c.restore();
    }
  }
  app.querySelector('#funBtn').onclick = async (e) => {
    const btn = e.currentTarget;
    if (!faceOn) {
      btn.textContent = '✨ Loading…';
      const ok = await ensureFace();
      if (!ok) { btn.textContent = '✨ Face reactions: Off'; toast('Reactions need internet — try again.'); return; }
      faceOn = true; btn.textContent = '✨ Face reactions: On'; btn.classList.add('on');
    } else {
      faceOn = false; faceDets = []; btn.textContent = '✨ Face reactions: Off'; btn.classList.remove('on');
    }
  };

  /* ---------- MediaPipe Selfie Segmentation (lazy) ---------- */
  function loadScript(src) {
    return new Promise((res, rej) => {
      const s = document.createElement('script'); s.src = src; s.crossOrigin = 'anonymous';
      s.onload = res; s.onerror = () => rej(new Error('script ' + src)); document.head.appendChild(s);
    });
  }
  async function ensureSeg() {
    if (segReady) return true;
    if (segLoading) { while (segLoading) await new Promise(r => setTimeout(r, 100)); return segReady; }
    segLoading = true;
    try {
      if (!window.SelfieSegmentation) {
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation@0.1/selfie_segmentation.js');
      }
      seg = new window.SelfieSegmentation({ locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation@0.1/${f}` });
      seg.setOptions({ modelSelection: 1, selfieMode: false });
      seg.onResults(onSegResults);
      segReady = true;
    } catch (e) { console.warn('Segmentation unavailable:', e); segReady = false; }
    segLoading = false;
    return segReady;
  }

  /* offscreen background canvas (procedural booth scenes) */
  const bgCanvas = document.createElement('canvas'); bgCanvas.width = W; bgCanvas.height = H;
  const bctx = bgCanvas.getContext('2d');
  function paintBooth(kind, t) {
    const c = bctx;
    if (kind === 'studio') {
      const g = c.createRadialGradient(W/2, H*0.42, 80, W/2, H*0.42, W*0.8);
      g.addColorStop(0, '#2bd4ee'); g.addColorStop(.55, '#0a8fd0'); g.addColorStop(1, '#053a63');
      c.fillStyle = g; c.fillRect(0, 0, W, H);
      c.fillStyle = 'rgba(255,255,255,.06)'; for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(W/2, H*0.42, 120 + i*90, 0, 7); c.lineWidth = 2; c.strokeStyle = 'rgba(255,255,255,.08)'; c.stroke(); }
      brand(c, .12);
    } else if (kind === 'ocean') {
      const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#7dd3fc'); g.addColorStop(1, '#035c95');
      c.fillStyle = g; c.fillRect(0, 0, W, H);
      c.globalAlpha = .5; for (let i = 0; i < 4; i++) { c.beginPath(); const y = H*0.5 + i*90; c.moveTo(0, y); for (let xx = 0; xx <= W; xx += 40) c.lineTo(xx, y + Math.sin((xx/120) + i + (t||0)/900) * 14); c.strokeStyle = 'rgba(255,255,255,.4)'; c.lineWidth = 3; c.stroke(); } c.globalAlpha = 1;
      brand(c, .14);
    } else if (kind === 'sky') {
      const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#e6f6ff'); g.addColorStop(1, '#8fd3f7');
      c.fillStyle = g; c.fillRect(0, 0, W, H);
      const sg = c.createRadialGradient(W*0.8, H*0.22, 10, W*0.8, H*0.22, 260); sg.addColorStop(0, 'rgba(255,250,220,.95)'); sg.addColorStop(1, 'rgba(255,250,220,0)'); c.fillStyle = sg; c.fillRect(0, 0, W, H);
      brand(c, .14, '#06557e');
    } else if (kind === 'grid') {
      c.fillStyle = '#06283d'; c.fillRect(0, 0, W, H);
      c.strokeStyle = 'rgba(56,189,248,.28)'; c.lineWidth = 1.5;
      for (let xx = 0; xx <= W; xx += 64) { c.beginPath(); c.moveTo(xx, 0); c.lineTo(xx, H); c.stroke(); }
      for (let yy = 0; yy <= H; yy += 64) { c.beginPath(); c.moveTo(0, yy); c.lineTo(W, yy); c.stroke(); }
      const gg = c.createRadialGradient(W/2, H*0.4, 60, W/2, H*0.4, W*0.7); gg.addColorStop(0, 'rgba(34,211,238,.35)'); gg.addColorStop(1, 'rgba(34,211,238,0)'); c.fillStyle = gg; c.fillRect(0, 0, W, H);
      brand(c, .16);
    }
  }
  function brand(c, alpha, col) {
    c.save(); c.globalAlpha = alpha || .14; c.fillStyle = col || '#ffffff';
    c.font = '800 220px Sora, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText('ZICTA', W/2, H*0.46); c.restore();
  }

  /* ---------- segmentation composite ---------- */
  function onSegResults(res) {
    const c = lctx;
    mapInfo.mode = 'seg';
    c.save();
    c.clearRect(0, 0, W, H);
    // mirror everything for a natural selfie
    c.translate(W, 0); c.scale(-1, 1);
    // 1) person mask -> 2) person pixels via source-in -> 3) background behind
    c.drawImage(res.segmentationMask, 0, 0, W, H);
    c.globalCompositeOperation = 'source-in';
    c.filter = filterCss(fxId);
    c.drawImage(res.image, 0, 0, W, H);
    c.filter = 'none';
    c.globalCompositeOperation = 'destination-over';
    if (bgId === 'blur') { c.filter = 'blur(12px)'; c.drawImage(res.image, 0, 0, W, H); c.filter = 'none'; }
    else { paintBooth(bgId, performance.now()); c.drawImage(bgCanvas, 0, 0, W, H); }
    c.restore();
    c.globalCompositeOperation = 'source-over';
    drawFaces(c);
    segBusy = false;
  }

  /* ---------- main render loop ---------- */
  function frame() {
    if (disposed) return;
    raf = requestAnimationFrame(frame);
    if (!hasCam || !video.videoWidth) return;
    if (faceOn && faceReady && performance.now() - lastDetT > 220) { lastDetT = performance.now(); detectFaces(); }
    const useSeg = segReady && bgId !== 'live';
    if (useSeg) {
      if (!segBusy) { segBusy = true; seg.send({ image: video }).catch(() => { segBusy = false; }); }
      return; // onSegResults paints
    }
    // raw mode: mirrored video, cover-fit, with filter
    const c = lctx; c.save(); c.clearRect(0, 0, W, H);
    c.translate(W, 0); c.scale(-1, 1); c.filter = filterCss(fxId);
    const vr = video.videoWidth / video.videoHeight, fr = W / H;
    let sw, sh, sx, sy;
    if (vr > fr) { sh = video.videoHeight; sw = sh * fr; sx = (video.videoWidth - sw) / 2; sy = 0; }
    else { sw = video.videoWidth; sh = sw / fr; sx = 0; sy = (video.videoHeight - sh) / 2; }
    c.drawImage(video, sx, sy, sw, sh, 0, 0, W, H);
    c.restore(); c.filter = 'none';
    mapInfo = { mode: 'raw', sx, sy, sw, sh };
    drawFaces(c);
  }

  /* ---------- camera start ---------- */
  async function start() {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 1280, height: 960 }, audio: false });
      video.srcObject = stream; await video.play().catch(() => {});
      placeholder.style.display = 'none'; shutter.disabled = false; hasCam = true;
    } catch (err) {
      placeholder.innerHTML = `<div class="ic">${bigCam()}</div><h3>Camera unavailable</h3>
        <p>We couldn't access a camera (permission denied or none found).</p>
        <button class="btn ghost" id="dismiss">Got it</button>`;
      placeholder.querySelector('#dismiss').onclick = () => placeholder.style.display = 'none';
    }
  }
  app.querySelector('#startCam').onclick = start;
  frame();                          // start the render loop (idles until camera ready)
  setTimeout(start, 250);           // auto-attempt

  /* ---------- capture ---------- */
  function capture() {
    const cap = document.createElement('canvas'); cap.width = W; cap.height = H;
    const c = cap.getContext('2d');
    c.drawImage(live, 0, 0, W, H);                              // current composited frame
    // frame + badge overlay (branded)
    c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 14; c.strokeRect(7, 7, W - 14, H - 14);
    const grd = c.createLinearGradient(0, H - 120, 0, H);
    grd.addColorStop(0, 'rgba(8,47,73,0)'); grd.addColorStop(1, 'rgba(8,47,73,.6)');
    c.fillStyle = grd; c.fillRect(0, H - 120, W, 120);
    c.fillStyle = '#38bdf8'; roundRect(c, 40, H - 78, 130, 46, 10); c.fill();
    c.fillStyle = '#fff'; c.font = '800 26px Manrope, sans-serif'; c.textAlign = 'left'; c.fillText('ZICTA', 60, H - 47);
    c.font = '700 24px Manrope, sans-serif'; c.fillText('ZICTAOS · Stay Cyber-Safe', 190, H - 47);
    lastData = cap.toDataURL('image/png'); addShot(lastData); dl.disabled = false;
  }
  function addShot(data) {
    shots.unshift(data); if (shots.length === 1) gallery.innerHTML = '';
    const img = document.createElement('img'); img.className = 'shot'; img.src = data; img.title = 'Open';
    img.onclick = () => { if (window.openLightbox) window.openLightbox(data, 'Your ZICTA booth photo'); };
    gallery.prepend(img); if (gallery.children.length > 8) gallery.lastChild.remove();
  }
  shutter.onclick = () => {
    let n = 3; count.classList.add('go'); count.firstElementChild.textContent = n;
    if (reduce) { count.classList.remove('go'); doShot(); return; }
    const iv = setInterval(() => { n--;
      if (n <= 0) { clearInterval(iv); count.classList.remove('go'); doShot(); }
      else { count.firstElementChild.textContent = n; count.firstElementChild.style.animation = 'none'; void count.offsetWidth; count.firstElementChild.style.animation = ''; }
    }, 900);
  };
  function doShot() { flash.classList.add('go'); setTimeout(() => flash.classList.remove('go'), 650); capture(); }
  dl.onclick = () => { if (!lastData) return; const a = document.createElement('a'); a.href = lastData; a.download = 'zictaos-photo.png'; a.click(); };
  app.querySelector('.close-app').onclick = ctx.close;

  function stop() { disposed = true; cancelAnimationFrame(raf); try { if (seg) seg.close(); } catch {} if (stream) stream.getTracks().forEach(t => t.stop()); }
  return { onClose: stop };

  /* ---------- helpers ---------- */
  function filterCss(id) {
    return ({ none:'none', lagoon:'saturate(1.5) contrast(1.05) hue-rotate(-8deg) brightness(1.05)',
      deep:'saturate(1.3) contrast(1.15) hue-rotate(150deg) brightness(.95)',
      sunny:'saturate(1.4) brightness(1.12) sepia(.25) hue-rotate(-12deg)',
      mono:'grayscale(1) contrast(1.1)', noir:'grayscale(1) contrast(1.4) brightness(.9)' })[id] || 'none';
  }
  function roundRect(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  function camIco() { return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="2.5" y="6" width="19" height="13" rx="3" stroke="#fff" stroke-width="1.7"/><circle cx="12" cy="12.5" r="3.6" stroke="#fff" stroke-width="1.7"/><path d="M8.5 6 9.7 4h4.6L15.5 6" stroke="#fff" stroke-width="1.7" stroke-linejoin="round"/></svg>'; }
  function bigCam() { return '<svg width="84" height="84" viewBox="0 0 24 24" fill="none"><rect x="2.5" y="6" width="19" height="13" rx="3" stroke="#9ad6f5" stroke-width="1.4"/><circle cx="12" cy="12.5" r="3.6" stroke="#9ad6f5" stroke-width="1.4"/><path d="M8.5 6 9.7 4h4.6L15.5 6" stroke="#9ad6f5" stroke-width="1.4" stroke-linejoin="round"/></svg>'; }
  function shutIco() { return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#fff" stroke-width="1.8"/><circle cx="12" cy="12" r="4" fill="#fff"/></svg>'; }
  function x() { return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'; }
};
