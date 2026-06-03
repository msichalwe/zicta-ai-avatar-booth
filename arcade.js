/* ============================================================
   ZICTAOS — Mini Games (Spot the Scam · True or False)
   buildArcade(app, ctx) -> { onClose }
   ============================================================ */
window.buildArcade = function (app, ctx) {
  const D = window.TIDE_DATA;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  app.innerHTML = `
    <div class="app-bar">
      <div class="a-ico ic-arcade">${padIco()}</div>
      <div><h2>Mini Games</h2><div class="a-sub">Quick cyber-safety challenges</div></div>
      <div class="sp"></div>
      <button class="close-app" title="Close (Esc)">${x()}</button>
    </div>
    <div class="app-body"><div class="arcade-wrap" id="arcadeStage"></div></div>`;

  const stage = app.querySelector('#arcadeStage');
  app.querySelector('.close-app').onclick = ctx.close;

  const GAMES = {
    scam: {
      title: "Spot the Scam", tag: "SWIPE THE THREATS",
      blurb: "Read each message. Is it a scam or safe? Tap fast, learn the red flags.",
      ico: hookIco(), grad: "linear-gradient(150deg,#fb7185,#be123c)",
      data: D.scam, prompt: m => m.text, truth: m => m.scam, why: m => m.why,
      yes: { label: "SCAM", cls: "bad" }, no: { label: "SAFE", cls: "good" },
      pick: (m, said) => said === m.scam
    },
    tf: {
      title: "True or False", tag: "FACT SPRINT",
      blurb: "Decide if each ICT & ZICTA statement is true or false. Build your streak!",
      ico: boltIco(), grad: "linear-gradient(150deg,#38bdf8,#1d4ed8)",
      data: D.tf, prompt: m => m.s, truth: m => m.a, why: m => m.why,
      yes: { label: "TRUE", cls: "good" }, no: { label: "FALSE", cls: "bad" },
      pick: (m, said) => said === m.a
    }
  };

  menu();

  function menu() {
    stage.innerHTML = `
      <div class="arcade-menu anim-q">
        <h2 class="arcade-h">Choose a game</h2>
        <p class="arcade-sub">Two quick rounds to sharpen your instincts.</p>
        <div class="game-cards">
          ${Object.entries(GAMES).map(([k, g]) => `
            <button class="game-card" data-g="${k}">
              <div class="game-ico" style="background:${g.grad}">${g.ico}</div>
              <span class="game-tag">${g.tag}</span>
              <h3>${g.title}</h3>
              <p>${g.blurb}</p>
              <span class="game-play">Play ${arrow()}</span>
            </button>`).join('')}
        </div>
      </div>`;
    stage.querySelectorAll('.game-card').forEach(c => c.onclick = () => play(c.dataset.g));
  }

  function play(key) {
    const g = GAMES[key];
    let i = 0, score = 0, streak = 0, best = 0, locked = false;

    function round() {
      const m = g.data[i];
      const card = document.createElement('div');
      card.className = 'game-stage anim-q';
      card.innerHTML = `
        <div class="game-top">
          <span class="game-name">${g.title}</span>
          <span class="game-streak">🔥 <b id="strk">${streak}</b></span>
          <span class="qcount">${i + 1}/${g.data.length}</span>
        </div>
        <div class="gbar"><i style="width:${i / g.data.length * 100}%"></i></div>
        <div class="msg-card" id="msgCard">
          <div class="msg-quote">${quote()}</div>
          <p class="msg-text">${g.prompt(m)}</p>
        </div>
        <div class="game-feedback" id="fb"></div>
        <div class="choice-row" id="choices">
          <button class="choice ${g.no.cls}" data-v="0">${g.no.label}</button>
          <button class="choice ${g.yes.cls}" data-v="1">${g.yes.label}</button>
        </div>`;
      stage.innerHTML = ''; stage.appendChild(card);
      requestAnimationFrame(() => card.querySelector('.gbar i').style.width = (i / g.data.length * 100) + '%');
      locked = false;

      card.querySelectorAll('.choice').forEach(btn => btn.onclick = () => {
        if (locked) return; locked = true;
        const said = btn.dataset.v === '1';
        const ok = g.pick(m, said);
        const fb = card.querySelector('#fb');
        card.querySelectorAll('.choice').forEach(b => b.disabled = true);
        btn.classList.add(ok ? 'is-correct' : 'is-wrong');
        if (ok) { score++; streak++; best = Math.max(best, streak); card.querySelector('#msgCard').classList.add('ok'); }
        else { streak = 0; card.querySelector('#msgCard').classList.add('no'); }
        card.querySelector('#strk').textContent = streak;
        fb.innerHTML = `<div class="fb-in ${ok ? 'good' : 'bad'}">
          <b>${ok ? 'Nice! ' : 'Watch out. '}</b>${g.why(m)}
          <button class="btn fb-next">${i === g.data.length - 1 ? 'Results' : 'Next'} ${arrow()}</button></div>`;
        requestAnimationFrame(() => fb.querySelector('.fb-in').classList.add('show'));
        fb.querySelector('.fb-next').onclick = () => { i++; i < g.data.length ? round() : done(); };
      });
    }

    function done() {
      const pct = Math.round(score / g.data.length * 100);
      const r = 70, circ = 2 * Math.PI * r, off = circ * (1 - pct / 100);
      const msg = pct === 100 ? "Perfect run — scam-proof! 🛡️" : pct >= 70 ? "Sharp instincts 🐬" : pct >= 40 ? "Getting there — keep practising" : "Review the Knowledge cards & retry";
      const card = document.createElement('div');
      card.className = 'game-result anim-q';
      card.innerHTML = `
        <div class="ring"><svg width="160" height="160"><circle cx="80" cy="80" r="${r}" stroke="rgba(8,47,73,.12)" stroke-width="12" fill="none"/>
          <circle cx="80" cy="80" r="${r}" stroke="url(#gg)" stroke-width="12" fill="none" stroke-linecap="round" stroke-dasharray="${circ}" stroke-dashoffset="${circ}" id="ga"/>
          <defs><linearGradient id="gg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#38bdf8"/><stop offset="1" stop-color="#0369a1"/></linearGradient></defs></svg>
          <div class="pct" id="gp">0%</div></div>
        <h2>${g.title}</h2><p>${msg}</p>
        <div class="badges">
          <div class="rb"><b>${score}/${g.data.length}</b>Correct</div>
          <div class="rb"><b>${best}</b>Best streak</div>
        </div>
        <div class="actions">
          <button class="btn" id="again">Play again ${redo()}</button>
          <button class="btn ghost" id="back">Other games</button>
        </div>`;
      stage.innerHTML = ''; stage.appendChild(card);
      setTimeout(() => { card.querySelector('#ga').style.transition = reduce ? 'none' : 'stroke-dashoffset 1s var(--ease-out)'; card.querySelector('#ga').style.strokeDashoffset = off; }, 80);
      let t0 = performance.now();
      (function up(t){ const p = Math.min(1,(t-t0)/1000); card.querySelector('#gp').textContent = Math.round(p*pct)+'%'; if(p<1) requestAnimationFrame(up); })(t0);
      card.querySelector('#again').onclick = () => play(key);
      card.querySelector('#back').onclick = menu;
    }

    round();
  }

  return { onClose: () => {} };

  function padIco(){ return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="2.5" y="7" width="19" height="10" rx="5" stroke="#fff" stroke-width="1.7"/><path d="M7 10v4M5 12h4" stroke="#fff" stroke-width="1.7" stroke-linecap="round"/><circle cx="15.5" cy="11" r="1.1" fill="#fff"/><circle cx="18" cy="13.5" r="1.1" fill="#fff"/></svg>'; }
  function hookIco(){ return '<svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M7 4v8a5 5 0 0 0 10 0" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/><circle cx="7" cy="3.2" r="1.6" fill="#fff"/><path d="M14 14l2 2 3-3" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'; }
  function boltIco(){ return '<svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" fill="#fff"/></svg>'; }
  function quote(){ return '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M9 7H5v5h4l-2 4M19 7h-4v5h4l-2 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'; }
  function arrow(){ return '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" style="vertical-align:-2px"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'; }
  function redo(){ return '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" style="vertical-align:-2px"><path d="M20 12a8 8 0 1 1-2.3-5.6" stroke="#fff" stroke-width="1.9" stroke-linecap="round"/><path d="M20 4v4h-4" stroke="#fff" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>'; }
  function x(){ return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'; }
};
