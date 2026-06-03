/* ============================================================
   TideOS — Cyber Quiz (pick a topic → scored quiz + results)
   buildQuiz(app, ctx) -> { onClose }
   ============================================================ */
window.buildQuiz = function (app, ctx) {
  const SETS = window.TIDE_DATA.quizSets || [];
  const ICON = window.TideIcons || {};
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  app.innerHTML = `
    <div class="app-bar">
      <div class="a-ico ic-quiz">${quizIco()}</div>
      <div><h2>Cyber Quiz</h2><div class="a-sub">Pick a topic &amp; test your skills</div></div>
      <div class="sp"></div>
      <button class="close-app" title="Close (Esc)">${x()}</button>
    </div>
    <div class="app-body"><div class="quiz-wrap" id="qStage"></div></div>`;

  const stage = app.querySelector('#qStage');
  app.querySelector('.close-app').onclick = ctx.close;

  /* ---- topic chooser ---- */
  function menu() {
    stage.classList.add('is-menu');
    stage.innerHTML = `
      <div class="picker anim-q">
        <h2 class="picker-h">Choose a quiz topic</h2>
        <p class="picker-sub">${SETS.length} quizzes — security, scams, law, technology &amp; privacy.</p>
        <div class="pick-grid">
          ${SETS.map(s => `
            <button class="pick-card" data-id="${s.id}">
              <div class="pick-ico" style="background:${s.grad}">${ICON[s.ico] || ICON.shield}</div>
              <span class="pick-tag">${s.tag}</span>
              <h3>${s.title}</h3>
              <p>${s.blurb}</p>
              <span class="pick-meta">${s.questions.length} questions${best(s.id) != null ? ` · best ${best(s.id)}%` : ''}</span>
            </button>`).join('')}
        </div>
      </div>`;
    stage.querySelectorAll('.pick-card').forEach(c => c.onclick = () => start(c.dataset.id));
  }

  /* ---- run one quiz set ---- */
  function start(id) {
    const set = SETS.find(s => s.id === id) || SETS[0];
    const Q = set.questions;
    let i = 0, score = 0, answered = [], locked = false;
    stage.classList.remove('is-menu');

    function render() {
      const q = Q[i];
      const card = document.createElement('div');
      card.className = 'quiz-card anim-q';
      card.innerHTML = `
        <div class="quiz-progress">
          <button class="qback" id="qback" title="Back to topics">${backIco()}</button>
          <div class="qbar"><i style="width:${i / Q.length * 100}%"></i></div>
          <span class="qcount">${i + 1} / ${Q.length}</span>
        </div>
        <span class="qtag">${set.title} · ${q.cat}</span>
        <div class="qtext">${q.q}</div>
        <div class="q-opts">
          ${q.opts.map((o, k) => `<button class="opt" data-k="${k}"><span class="key">${'ABCD'[k]}</span><span>${o}</span></button>`).join('')}
        </div>
        <div class="q-explain" id="explain"><b>Why:</b> ${q.explain}</div>
        <div class="quiz-foot" id="foot"></div>`;
      stage.innerHTML = ''; stage.appendChild(card);
      requestAnimationFrame(() => { card.querySelector('.qbar i').style.width = (i / Q.length * 100) + '%'; });
      card.querySelector('#qback').onclick = menu;
      locked = false;

      card.querySelectorAll('.opt').forEach(btn => {
        btn.onclick = () => {
          if (locked) return; locked = true;
          const k = +btn.dataset.k, correct = q.answer;
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
      record(set.id, pct);
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
          <p>${set.title} · ${msg}</p>
          <div class="badges">
            <div class="rb"><b>${score}/${Q.length}</b>Correct</div>
            <div class="rb"><b>${pct}%</b>Score</div>
            <div class="rb"><b>${rank(pct)}</b>Rank</div>
          </div>
          <div class="actions">
            <button class="btn" id="again">Play again ${redo()}</button>
            <button class="btn ghost" id="more">Other topics</button>
          </div>
        </div>`;
      stage.innerHTML = ''; stage.appendChild(card);
      setTimeout(() => { card.querySelector('#ringArc').style.transition = reduce ? 'none' : 'stroke-dashoffset 1.1s cubic-bezier(.16,1,.3,1)'; card.querySelector('#ringArc').style.strokeDashoffset = off; }, 80);
      let t0 = performance.now();
      (function up(t) { const p = Math.min(1, (t - t0) / 1100); card.querySelector('#pctNum').textContent = Math.round(p * pct) + '%'; if (p < 1) requestAnimationFrame(up); })(t0);
      card.querySelector('#again').onclick = () => start(set.id);
      card.querySelector('#more').onclick = menu;
    }

    render();
  }

  menu();
  return { onClose: () => {} };

  /* ---- score persistence (feeds the Leaderboard widget) ---- */
  function record(id, pct) { try { window.TideScore && window.TideScore.record('quiz:' + id, pct); } catch (e) {} }
  function best(id) { try { return window.TideScore ? window.TideScore.best('quiz:' + id) : null; } catch (e) { return null; } }

  function rank(p) { return p === 100 ? 'S' : p >= 70 ? 'A' : p >= 40 ? 'B' : 'C'; }
  function quizIco() { return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9.2" stroke="#fff" stroke-width="1.7"/><path d="M9.2 9.4a2.8 2.8 0 1 1 4 2.5c-.9.5-1.2 1-1.2 1.9" stroke="#fff" stroke-width="1.7" stroke-linecap="round"/><circle cx="12" cy="17" r="1.1" fill="#fff"/></svg>'; }
  function arrow() { return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="vertical-align:-2px"><path d="M5 12h14M13 6l6 6-6 6" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'; }
  function backIco() { return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 6l-6 6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'; }
  function redo() { return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="vertical-align:-2px"><path d="M20 12a8 8 0 1 1-2.3-5.6" stroke="#fff" stroke-width="1.9" stroke-linecap="round"/><path d="M20 4v4h-4" stroke="#fff" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>'; }
  function x() { return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'; }
};
