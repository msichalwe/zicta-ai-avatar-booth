/* ============================================================
   TideOS — Knowledge Cards (flip + filter, ZICTA + cyber security)
   buildKnowledge(app, ctx) -> { onClose }
   ============================================================ */
window.buildKnowledge = function (app, ctx) {
  const K = window.TIDE_DATA.knowledge;
  const I = window.TideIcons;
  const cats = ['All', ...new Set(K.map(k => k.cat))];
  let active = 'All';

  app.innerHTML = `
    <div class="app-bar">
      <div class="a-ico ic-know">${kIco()}</div>
      <div><h2>Knowledge</h2><div class="a-sub">Tap a card to flip · ${K.length} cards</div></div>
      <div class="sp"></div>
      <button class="close-app" title="Close (Esc)">${x()}</button>
    </div>
    <div class="app-body">
      <div class="know-wrap">
        <div class="know-filters" id="kfilters">
          ${cats.map((c, n) => `<button class="kfilter ${n === 0 ? 'on' : ''}" data-c="${c}">${c}</button>`).join('')}
        </div>
        <div class="know-grid scrollable" id="kgrid"></div>
      </div>
    </div>`;

  const grid = app.querySelector('#kgrid');
  const filters = app.querySelector('#kfilters');
  app.querySelector('.close-app').onclick = ctx.close;

  function paint() {
    const list = K.filter(k => active === 'All' || k.cat === active);
    grid.innerHTML = list.map((k, n) => `
      <div class="kcard" style="animation-delay:${n * 55}ms">
        <div class="kcard-inner">
          <div class="kface kfront">
            <span class="kcat">${k.cat}</span>
            <div class="kicon" style="background:${k.color}">${I[k.ico] || I.shield}</div>
            <h3>${k.title}</h3>
            <span class="hint">${flip()} Tap to learn</span>
          </div>
          <div class="kface kback" style="background:${k.color}">
            <h3>${k.title}</h3>
            <p>${k.body}</p>
            <span class="ktip">${bulb()} ${k.tip}</span>
          </div>
        </div>
      </div>`).join('');
    grid.querySelectorAll('.kcard').forEach(c => c.onclick = () => c.classList.toggle('flipped'));
  }

  filters.addEventListener('click', e => {
    const b = e.target.closest('.kfilter'); if (!b) return;
    filters.querySelectorAll('.kfilter').forEach(f => f.classList.remove('on'));
    b.classList.add('on'); active = b.dataset.c; paint();
  });

  paint();
  return { onClose: () => {} };

  function kIco() { return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5V5.5Z" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5A2.5 2.5 0 0 1 20 21.5V5.5Z" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>'; }
  function flip() { return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 8a8 8 0 0 1 14-3M20 16a8 8 0 0 1-14 3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M18 3v3h-3M6 21v-3h3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'; }
  function bulb() { return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 1 4 10.5c-.7.6-1 1.2-1 2.5H9c0-1.3-.3-1.9-1-2.5A6 6 0 0 1 12 3Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>'; }
  function x() { return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'; }
};
