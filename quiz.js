/* ============================================================
   TideOS — Cyber Quiz (scoring + animated transitions + results)
   buildQuiz(app, ctx) -> { onClose }
   ============================================================ */
window.buildQuiz = function (app, ctx) {
  const Q = window.TIDE_DATA.quiz;
  let i = 0, score = 0, locked = false, answered = [];

  app.innerHTML = `
    <div class="app-bar">
      <div class="a-ico ic-quiz">${quizIco()}</div>
      <div><h2>Cyber Quiz</h2><div class="a-sub">ZICTA &amp; online-safety challenge</div></div>
      <div class="sp"></div>
      <button class="close-app" title="Close (Esc)">${x()}</button>
    </div>
    <div class="app-body">
      <div class="quiz-wrap"><div id="qStage"></div></div>
    </div>`;

  const stage = app.querySelector('#qStage');
  app.querySelector('.close-app').onclick = ctx.close;

  function render() {
    const q = Q[i];
    const card = document.createElement('div');
    card.className = 'quiz-card anim-q';
    card.innerHTML = `
      <div class="quiz-progress">
        <div class="qbar"><i style="width:${(i) / Q.length * 100}%"></i></div>
        <span class="qcount">${i + 1} / ${Q.length}</span>
      </div>
      <span class="qtag">${q.cat}</span>
      <div class="qtext">${q.q}</div>
      <div class="q-opts">
        ${q.opts.map((o, k) => `<button class="opt" data-k="${k}"><span class="key">${'ABCD'[k]}</span><span>${o}</span></button>`).join('')}
      </div>
      <div class="q-explain" id="explain"><b>Why:</b> ${q.explain}</div>
      <div class="quiz-foot" id="foot"></div>`;
    stage.innerHTML = ''; stage.appendChild(card);
    requestAnimationFrame(() => { card.querySelector('.qbar i').style.width = (i / Q.length * 100) + '%'; });
    locked = false;

    card.querySelectorAll('.opt').forEach(btn => {
      btn.onclick = () => {
        if (locked) return; locked = true;
        const k = +btn.dataset.k;
        const correct = q.answer;
        card.querySelectorAll('.opt').forEach(b => b.disabled = true);
        if (k === correct) { btn.classList.add('correct'); score++; }
        else { btn.classList.add('wrong'); card.querySelector(`.opt[data-k="${correct}"]`).classList.add('correct'); }
        answered.push({ q: q.q, ok: k === correct });
        card.querySelector('#explain').classList.add('show');
        const last = i === Q.length - 1;
        const foot = card.querySelector('#foot');
        foot.innerHTML = `<button class="btn" id="nextBtn">${last ? 'See results' : 'Next question'} ${arrow()}</button>`;
        foot.querySelector('#nextBtn').onclick = () => { i++; last ? results() : render(); };
      };
    });
  }

  function results() {
    const pct = Math.round(score / Q.length * 100);
    const r = 76, circ = 2 * Math.PI * r, off = circ * (1 - pct / 100);
    let title, msg;
    if (pct === 100) { title = 'Cyber Captain! 🌟'; msg = 'Flawless — you navigate the net like a pro.'; }
    else if (pct >= 70) { title = 'Sea-worthy! 🐬'; msg = 'Strong instincts. A few currents left to master.'; }
    else if (pct >= 40) { title = 'Finding your sea legs'; msg = 'Good start — revisit the Knowledge cards to level up.'; }
    else { title = 'Anchors aweigh'; msg = 'Plenty to learn — the Knowledge deck has your back.'; }

    const card = document.createElement('div');
    card.className = 'quiz-card anim-q';
    card.innerHTML = `
      <div class="result">
        <div class="ring">
          <svg width="170" height="170"><circle cx="85" cy="85" r="${r}" stroke="rgba(8,47,73,.12)" stroke-width="12" fill="none"/>
          <circle cx="85" cy="85" r="${r}" stroke="url(#qg)" stroke-width="12" fill="none" stroke-linecap="round" stroke-dasharray="${circ}" stroke-dashoffset="${circ}" id="ringArc"/>
          <defs><linearGradient id="qg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#38bdf8"/><stop offset="1" stop-color="#0369a1"/></linearGradient></defs></svg>
          <div class="pct" id="pctNum">0%</div>
        </div>
        <h2>${title}</h2>
        <p>${msg}</p>
        <div class="badges">
          <div class="rb"><b>${score}/${Q.length}</b>Correct</div>
          <div class="rb"><b>${pct}%</b>Score</div>
          <div class="rb"><b>${rank(pct)}</b>Rank</div>
        </div>
        <div class="actions">
          <button class="btn" id="again">Play again ${redo()}</button>
          <button class="btn ghost" id="learn">Open Knowledge</button>
        </div>
      </div>`;
    stage.innerHTML = ''; stage.appendChild(card);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    setTimeout(() => { card.querySelector('#ringArc').style.transition = reduce ? 'none' : 'stroke-dashoffset 1.1s cubic-bezier(.16,1,.3,1)'; card.querySelector('#ringArc').style.strokeDashoffset = off; }, 80);
    // count up
    let cur = 0; const t0 = performance.now();
    (function up(t) { const p = Math.min(1, (t - t0) / 1100); card.querySelector('#pctNum').textContent = Math.round(p * pct) + '%'; if (p < 1) requestAnimationFrame(up); })(t0);
    card.querySelector('#again').onclick = () => { i = 0; score = 0; answered = []; render(); };
    card.querySelector('#learn').onclick = () => { ctx.close(); setTimeout(() => window.openApp('knowledge'), 300); };
  }

  render();
  return { onClose: () => {} };

  function rank(p) { return p === 100 ? 'S' : p >= 70 ? 'A' : p >= 40 ? 'B' : 'C'; }
  function quizIco() { return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9.2" stroke="#fff" stroke-width="1.7"/><path d="M9.2 9.4a2.8 2.8 0 1 1 4 2.5c-.9.5-1.2 1-1.2 1.9" stroke="#fff" stroke-width="1.7" stroke-linecap="round"/><circle cx="12" cy="17" r="1.1" fill="#fff"/></svg>'; }
  function arrow() { return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="vertical-align:-2px"><path d="M5 12h14M13 6l6 6-6 6" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'; }
  function redo() { return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="vertical-align:-2px"><path d="M20 12a8 8 0 1 1-2.3-5.6" stroke="#fff" stroke-width="1.9" stroke-linecap="round"/><path d="M20 4v4h-4" stroke="#fff" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>'; }
  function x() { return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'; }
};
