/* ============================================================
   TideOS — Map app (embeds the ZNPCS Digital Addressing map)
   Shows the exact /map page from the addressing system via iframe.
   buildMap(app, ctx) -> { onClose }
   ============================================================ */
window.buildMap = function (app, ctx) {
  // The map is reverse-proxied by our own server at same-origin "/map", so it
  // loads on whatever host:port the kiosk is reached on (internal OR external)
  // without needing port 8081 exposed. (Override with window.ZICTA_MAP_URL.)
  const MAP_URL = window.ZICTA_MAP_URL || '/map';

  if (!document.getElementById('mapStyle')) {
    const st = document.createElement('style'); st.id = 'mapStyle';
    st.textContent = `
      .map-body{padding:0!important;position:relative;background:#eef4fb}
      .map-frame{position:absolute;inset:0;width:100%;height:100%;border:0;display:block}
      .map-load{position:absolute;inset:0;z-index:2;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;
        background:radial-gradient(ellipse at center,#f3f9ff,#dde9f6);color:#0c4a6e;font-family:'Manrope',sans-serif;transition:opacity .4s}
      .map-load.hide{opacity:0;pointer-events:none}
      .map-load .spin{width:46px;height:46px;border:4px solid rgba(3,105,161,.25);border-top-color:#0369a1;border-radius:50%;animation:mapspin 1s linear infinite}
      @keyframes mapspin{to{transform:rotate(360deg)}}
      .map-load h3{font-family:'Sora',sans-serif;font-weight:700;font-size:18px;margin:0}
      .map-load p{font-size:13.5px;color:#5b7a91;margin:0;max-width:420px;text-align:center;line-height:1.5}
      .map-load code{background:#dce8f2;padding:2px 7px;border-radius:5px}
      .map-load .btn{margin-top:4px}
    `;
    document.head.appendChild(st);
  }

  app.innerHTML = `
    <div class="app-bar">
      <div class="a-ico" style="background:linear-gradient(150deg,#0ea5e9,#0369a1)">${mapIco()}</div>
      <div><h2>Digital Address Map</h2><div class="a-sub">Zambia National Addressing System</div></div>
      <div class="sp"></div>
      <button class="close-app" title="Close (Esc)">${x()}</button>
    </div>
    <div class="app-body map-body">
      <iframe class="map-frame" id="mapFrame" src="${MAP_URL}"
        allow="geolocation; fullscreen" referrerpolicy="no-referrer-when-downgrade"></iframe>
      <div class="map-load" id="mapLoad">
        <div class="spin"></div>
        <h3>Loading the map…</h3>
        <p>Bringing up the Zambia National Digital Addressing System.</p>
      </div>
    </div>`;

  app.querySelector('.close-app').onclick = ctx.close;
  const frame = app.querySelector('#mapFrame');
  const load = app.querySelector('#mapLoad');

  let loaded = false;
  frame.addEventListener('load', () => { loaded = true; load.classList.add('hide'); });
  // fallback: hide the loader after a few seconds even if the load event is suppressed (cross-origin)
  setTimeout(() => { if (load) load.classList.add('hide'); }, 6000);
  // if it clearly failed (cross-origin we can't detect well), offer a direct link after a while
  setTimeout(() => {
    if (!loaded) {
      load.classList.remove('hide');
      load.innerHTML = `<h3>Map taking a moment…</h3>
        <p>If it doesn't appear, the addressing service may be offline. It loads from <code>${MAP_URL}</code>.</p>
        <button class="btn" id="mapRetry">Retry</button>`;
      const r = load.querySelector('#mapRetry'); if (r) r.onclick = () => { load.classList.add('hide'); frame.src = MAP_URL; };
    }
  }, 9000);

  return { onClose: () => { try { frame.src = 'about:blank'; } catch (e) {} } };

  function mapIco() { return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 4 3 6.5v13L9 17l6 2.5 6-2.5v-13L15 6.5 9 4Z" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/><path d="M9 4v13M15 6.5v13" stroke="#fff" stroke-width="1.6"/></svg>'; }
  function x() { return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'; }
};
