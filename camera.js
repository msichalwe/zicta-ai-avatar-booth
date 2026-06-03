/* ============================================================
   TideOS — Photo Booth (webcam + ocean filters + capture)
   buildCamera(app, ctx) -> { onClose }
   ============================================================ */
window.buildCamera = function (app, ctx) {
  const FILTERS = [
    { id: 'none',   name: 'True',    cls: 'fx-none',   sw: 'linear-gradient(135deg,#bae6fd,#7dd3fc)' },
    { id: 'lagoon', name: 'Lagoon',  cls: 'fx-lagoon', sw: 'linear-gradient(135deg,#5eead4,#0ea5e9)' },
    { id: 'deep',   name: 'Deep Sea',cls: 'fx-deep',   sw: 'linear-gradient(135deg,#2563eb,#0c4a6e)' },
    { id: 'sunny',  name: 'Sunset',  cls: 'fx-sunny',  sw: 'linear-gradient(135deg,#fde68a,#fb923c)' },
    { id: 'mono',   name: 'Pearl',   cls: 'fx-mono',   sw: 'linear-gradient(135deg,#e5e7eb,#9ca3af)' },
    { id: 'noir',   name: 'Abyss',   cls: 'fx-noir',   sw: 'linear-gradient(135deg,#475569,#0f172a)' }
  ];

  app.innerHTML = `
    <div class="app-bar">
      <div class="a-ico ic-cam">${camIco()}</div>
      <div><h2>Photo Booth</h2><div class="a-sub">Live ocean filters · ZICTA frame</div></div>
      <div class="sp"></div>
      <button class="close-app" title="Close (Esc)">${x()}</button>
    </div>
    <div class="app-body">
      <div class="cam-wrap">
        <div class="cam-stage">
          <div class="cam-frame">
            <video id="camVideo" autoplay playsinline muted class="fx-none"></video>
            <canvas id="camCanvas" class="fx-none" style="display:none"></canvas>
            <div class="vignette"></div>
            <div class="badge"><span class="tag">ZICTA</span><span>ZICTAOS · Stay Cyber-Safe</span></div>
            <div class="flash" id="flash"></div>
            <div class="countdown" id="count"><span></span></div>
            <div class="cam-placeholder" id="camPlaceholder">
              <div class="ic">${bigCam()}</div>
              <h3>Dive into the booth</h3>
              <p>Allow camera access to take an ocean-themed selfie. Nothing leaves your device.</p>
              <button class="btn" id="startCam">Enable camera</button>
              <p style="opacity:.7;font-size:12px;margin-top:14px">No camera? You can still preview the filters & frame.</p>
            </div>
          </div>
        </div>
        <div class="cam-side">
          <div>
            <h4>Filter</h4>
            <div class="filter-grid" id="filterGrid"></div>
          </div>
          <div>
            <h4>Captures</h4>
            <div class="gallery" id="gallery"><span class="empty">No photos yet — say cheese 🐠</span></div>
          </div>
          <div class="cam-actions">
            <button class="shutter" id="shutter" disabled>${shutIco()} Take photo</button>
            <button class="btn ghost" id="download" disabled>Download last shot</button>
          </div>
        </div>
      </div>
    </div>`;

  const video = app.querySelector('#camVideo');
  const canvas = app.querySelector('#camCanvas');
  const flash = app.querySelector('#flash');
  const count = app.querySelector('#count');
  const placeholder = app.querySelector('#camPlaceholder');
  const shutter = app.querySelector('#shutter');
  const dl = app.querySelector('#download');
  const gallery = app.querySelector('#gallery');
  let stream = null, fx = 'fx-none', shots = [], lastData = null, live = false;

  // filters
  const grid = app.querySelector('#filterGrid');
  grid.innerHTML = FILTERS.map(f => `
    <div class="filter-chip ${f.id === 'none' ? 'on' : ''}" data-cls="${f.cls}">
      <div class="sw" style="background:${f.sw}"></div>${f.name}
    </div>`).join('');
  grid.addEventListener('click', e => {
    const chip = e.target.closest('.filter-chip'); if (!chip) return;
    grid.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('on'));
    chip.classList.add('on');
    fx = chip.dataset.cls;
    video.className = fx; canvas.className = fx;
  });

  async function start() {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 1280, height: 960 }, audio: false });
      video.srcObject = stream;
      placeholder.style.display = 'none';
      shutter.disabled = false; live = true;
    } catch (err) {
      placeholder.innerHTML = `<div class="ic">${bigCam()}</div>
        <h3>Camera unavailable</h3>
        <p>We couldn't access a camera (permission denied or none found). You can still explore filters & the frame.</p>
        <button class="btn ghost" id="dismiss">Got it</button>`;
      placeholder.querySelector('#dismiss').onclick = () => placeholder.style.display = 'none';
      shutter.disabled = false; // allow gradient-frame capture even without cam
    }
  }
  app.querySelector('#startCam').onclick = start;
  // auto-attempt on open
  setTimeout(start, 250);

  function capture() {
    const w = 1280, h = 960;
    canvas.width = w; canvas.height = h;
    const c = canvas.getContext('2d');
    // mirror to match preview
    c.save(); c.translate(w, 0); c.scale(-1, 1);
    c.filter = filterCss(fx);
    if (live && video.videoWidth) {
      // cover-fit
      const vr = video.videoWidth / video.videoHeight, fr = w / h;
      let sw, sh, sx, sy;
      if (vr > fr) { sh = video.videoHeight; sw = sh * fr; sx = (video.videoWidth - sw) / 2; sy = 0; }
      else { sw = video.videoWidth; sh = sw / fr; sx = 0; sy = (video.videoHeight - sh) / 2; }
      c.drawImage(video, sx, sy, sw, sh, 0, 0, w, h);
    } else {
      const g = c.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, '#7dd3fc'); g.addColorStop(1, '#0369a1');
      c.fillStyle = g; c.fillRect(0, 0, w, h);
      c.filter = 'none'; c.fillStyle = 'rgba(255,255,255,.85)';
      c.font = '700 64px Sora, sans-serif'; c.textAlign = 'center';
      c.fillText('🌊', w / 2, h / 2);
    }
    c.restore(); c.filter = 'none';
    // frame overlay
    c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 14; c.strokeRect(7, 7, w - 14, h - 14);
    // badge bar
    const grd = c.createLinearGradient(0, h - 120, 0, h);
    grd.addColorStop(0, 'rgba(8,47,73,0)'); grd.addColorStop(1, 'rgba(8,47,73,.6)');
    c.fillStyle = grd; c.fillRect(0, h - 120, w, 120);
    c.fillStyle = '#38bdf8'; roundRect(c, 40, h - 78, 130, 46, 10); c.fill();
    c.fillStyle = '#fff'; c.font = '800 26px Manrope, sans-serif'; c.textAlign = 'left';
    c.fillText('ZICTA', 60, h - 47);
    c.font = '700 24px Manrope, sans-serif';
    c.fillText('ZICTAOS · Stay Cyber-Safe', 190, h - 47);
    lastData = canvas.toDataURL('image/png');
    addShot(lastData);
    dl.disabled = false;
  }

  function addShot(data) {
    shots.unshift(data);
    if (shots.length === 1) gallery.innerHTML = '';
    const img = document.createElement('img');
    img.className = 'shot'; img.src = data; img.title = 'Open';
    img.onclick = () => { const w = window.open(); if (w) w.document.write(`<img src="${data}" style="max-width:100%">`); };
    gallery.prepend(img);
    if (gallery.children.length > 8) gallery.lastChild.remove();
  }

  shutter.onclick = () => {
    let n = 3; count.classList.add('go'); count.firstElementChild.textContent = n;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { count.classList.remove('go'); doShot(); return; }
    const iv = setInterval(() => {
      n--;
      if (n <= 0) { clearInterval(iv); count.classList.remove('go'); doShot(); }
      else { count.firstElementChild.textContent = n; count.firstElementChild.style.animation = 'none'; void count.offsetWidth; count.firstElementChild.style.animation = ''; }
    }, 900);
  };
  function doShot() { flash.classList.add('go'); setTimeout(() => flash.classList.remove('go'), 650); capture(); }

  dl.onclick = () => { if (!lastData) return; const a = document.createElement('a'); a.href = lastData; a.download = 'zictaos-photo.png'; a.click(); };
  app.querySelector('.close-app').onclick = ctx.close;

  function stop() { if (stream) stream.getTracks().forEach(t => t.stop()); }
  return { onClose: stop };

  /* helpers */
  function filterCss(cls) {
    return ({
      'fx-none': 'none',
      'fx-lagoon': 'saturate(1.5) contrast(1.05) hue-rotate(-8deg) brightness(1.05)',
      'fx-deep': 'saturate(1.3) contrast(1.15) hue-rotate(150deg) brightness(.95)',
      'fx-sunny': 'saturate(1.4) brightness(1.12) sepia(.25) hue-rotate(-12deg)',
      'fx-mono': 'grayscale(1) contrast(1.1)',
      'fx-noir': 'grayscale(1) contrast(1.4) brightness(.9)'
    })[cls] || 'none';
  }
  function roundRect(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  function camIco() { return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="2.5" y="6" width="19" height="13" rx="3" stroke="#fff" stroke-width="1.7"/><circle cx="12" cy="12.5" r="3.6" stroke="#fff" stroke-width="1.7"/><path d="M8.5 6 9.7 4h4.6L15.5 6" stroke="#fff" stroke-width="1.7" stroke-linejoin="round"/></svg>'; }
  function bigCam() { return '<svg width="84" height="84" viewBox="0 0 24 24" fill="none"><rect x="2.5" y="6" width="19" height="13" rx="3" stroke="#9ad6f5" stroke-width="1.4"/><circle cx="12" cy="12.5" r="3.6" stroke="#9ad6f5" stroke-width="1.4"/><path d="M8.5 6 9.7 4h4.6L15.5 6" stroke="#9ad6f5" stroke-width="1.4" stroke-linejoin="round"/></svg>'; }
  function shutIco() { return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#fff" stroke-width="1.8"/><circle cx="12" cy="12" r="4" fill="#fff"/></svg>'; }
  function x() { return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'; }
};
