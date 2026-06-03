/* ============================================================
   TideOS — ZICTA Game Show (pick a mystery prize box → answer
   5 questions → collect stars → open the box if you win)
   buildQuiz(app, ctx) -> { onClose }
   ============================================================ */
window.buildQuiz = function (app, ctx) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- styles (injected once) ---------------- */
  if (!document.getElementById('gsStyle')) {
    const st = document.createElement('style'); st.id = 'gsStyle';
    st.textContent = `
      .gs-wrap{position:absolute;inset:0;overflow:hidden;display:flex;align-items:center;justify-content:center;
        background:radial-gradient(140% 120% at 50% -10%,#1b1146 0%,#0b1437 45%,#06102a 100%);color:#fff;font-family:'Manrope',sans-serif}
      .gs-bg{position:absolute;inset:0;z-index:0;pointer-events:none;overflow:hidden}
      .gs-bg .ray{position:absolute;top:-20%;left:calc(50% - 30px);width:60px;height:140%;transform-origin:top center;
        background:linear-gradient(to bottom,rgba(255,255,255,.10),transparent);animation:gsray 9s linear infinite}
      @keyframes gsray{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}
      .gs-bg .twinkle{position:absolute;border-radius:50%;background:#fff;animation:gstw 3s ease-in-out infinite}
      @keyframes gstw{0%,100%{opacity:.15;transform:scale(.6)}50%{opacity:.9;transform:scale(1)}}
      .gs-panel{position:relative;z-index:2;width:min(94%,1000px);text-align:center;padding:24px}
      .gs-kicker{font-family:'Sora',sans-serif;font-weight:800;letter-spacing:.34em;font-size:13px;color:#fcd34d;text-transform:uppercase}
      .gs-title{font-family:'Sora',sans-serif;font-weight:800;line-height:1.02;letter-spacing:-.02em;margin:10px 0 6px;
        font-size:clamp(34px,6vw,76px);background:linear-gradient(120deg,#fde68a,#fbbf24,#f59e0b);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
      .gs-sub{color:rgba(255,255,255,.8);font-size:clamp(15px,1.8vw,20px);max-width:46ch;margin:0 auto 26px;line-height:1.5}
      .gs-btn{font-family:'Sora',sans-serif;font-weight:800;font-size:clamp(16px,1.8vw,22px);border:none;cursor:pointer;
        padding:clamp(15px,1.7vw,20px) clamp(34px,3.6vw,56px);border-radius:999px;color:#3a1d00;
        background:linear-gradient(135deg,#fde68a,#f59e0b);box-shadow:0 14px 34px rgba(245,158,11,.5);transition:transform .15s}
      .gs-btn:hover{transform:translateY(-2px) scale(1.03)} .gs-btn.ghost{background:rgba(255,255,255,.14);color:#fff;box-shadow:none}
      .gs-boxes{display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(16px,2.4vw,36px);margin:8px auto 0;max-width:760px}
      .gs-box{position:relative;aspect-ratio:1;cursor:pointer;border:none;background:none;transform-style:preserve-3d;
        animation:gsfloat 4s ease-in-out infinite;transition:transform .3s}
      .gs-box:nth-child(2){animation-delay:.5s}.gs-box:nth-child(3){animation-delay:1s}
      .gs-box:nth-child(4){animation-delay:1.5s}.gs-box:nth-child(5){animation-delay:.8s}.gs-box:nth-child(6){animation-delay:.3s}
      @keyframes gsfloat{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-12px) rotate(2deg)}}
      .gs-box:hover{transform:translateY(-10px) scale(1.06)}
      .gs-box .cube{position:absolute;inset:14%;border-radius:18px;background:linear-gradient(150deg,#7c3aed,#4f1d96);
        box-shadow:0 20px 40px rgba(0,0,0,.45),inset 0 2px 0 rgba(255,255,255,.25);display:grid;place-items:center}
      .gs-box .lid{position:absolute;left:8%;right:8%;top:6%;height:26%;border-radius:14px;background:linear-gradient(150deg,#8b5cf6,#6d28d9);
        box-shadow:0 8px 16px rgba(0,0,0,.35),inset 0 2px 0 rgba(255,255,255,.3)}
      .gs-box .ribbon{position:absolute;left:48%;top:6%;width:4%;bottom:14%;background:#fcd34d;border-radius:3px}
      .gs-box .qm{font-family:'Sora',sans-serif;font-weight:800;font-size:clamp(28px,4vw,52px);color:#fff;text-shadow:0 3px 8px rgba(0,0,0,.4)}
      .gs-box.dim{opacity:.25;filter:grayscale(.6);animation:none}
      .gs-box.chosen{animation:none;transform:scale(1.08)}
      .gs-box.shuffle{animation:gsshuffle .5s}
      @keyframes gsshuffle{0%{transform:translateX(0) rotate(0)}25%{transform:translateX(-14px) rotate(-8deg)}75%{transform:translateX(14px) rotate(8deg)}100%{transform:translateX(0)}}
      .gs-q{position:relative;z-index:2;width:min(94%,820px);background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.14);
        border-radius:26px;padding:clamp(20px,2.4vw,36px);backdrop-filter:blur(14px);box-shadow:0 24px 60px rgba(0,0,0,.4)}
      .gs-hud{display:flex;align-items:center;gap:14px;margin-bottom:18px}
      .gs-stars{display:flex;gap:6px;font-size:24px}
      .gs-stars .st{filter:grayscale(1) opacity(.4);transition:transform .3s,filter .3s}
      .gs-stars .st.on{filter:none;animation:gsstar .5s} @keyframes gsstar{0%{transform:scale(.4) rotate(-30deg)}60%{transform:scale(1.5)}100%{transform:scale(1)}}
      .gs-prog{margin-left:auto;font-family:'Sora',sans-serif;font-weight:800;color:#fcd34d}
      .gs-cat{font-family:'Sora',sans-serif;font-weight:800;letter-spacing:.2em;font-size:12px;text-transform:uppercase;color:#a5b4fc}
      .gs-cat.gen{color:#fca5a5}
      .gs-question{font-family:'Sora',sans-serif;font-weight:700;font-size:clamp(20px,2.6vw,32px);line-height:1.25;margin:8px 0 22px}
      .gs-opts{display:grid;grid-template-columns:1fr 1fr;gap:14px}
      .gs-opt{font-family:'Manrope',sans-serif;font-weight:700;font-size:clamp(15px,1.7vw,20px);text-align:left;cursor:pointer;
        padding:clamp(14px,1.6vw,20px);border-radius:16px;border:2px solid rgba(255,255,255,.16);background:rgba(255,255,255,.06);color:#fff;
        transition:transform .12s,background .2s,border-color .2s}
      .gs-opt:hover{background:rgba(255,255,255,.13)} .gs-opt:active{transform:scale(.98)}
      .gs-opt.correct{background:rgba(34,197,94,.3);border-color:#22c55e}
      .gs-opt.wrong{background:rgba(239,68,68,.28);border-color:#ef4444}
      .gs-opt.shake{animation:gsshake .4s}
      @keyframes gsshake{0%,100%{transform:translateX(0)}25%{transform:translateX(-7px)}75%{transform:translateX(7px)}}
      .gs-fb{margin-top:16px;min-height:1.2em;font-size:clamp(14px,1.5vw,18px);color:rgba(255,255,255,.85);opacity:0;transition:opacity .3s}
      .gs-fb.show{opacity:1}
      .gs-next{margin-top:18px}
      .gs-reveal{position:relative;z-index:2;text-align:center}
      .gs-bigbox{width:200px;height:200px;margin:0 auto 10px;position:relative;transform-style:preserve-3d}
      .gs-bigbox .cube{position:absolute;inset:10%;border-radius:24px;background:linear-gradient(150deg,#7c3aed,#4f1d96);box-shadow:0 28px 60px rgba(0,0,0,.5);display:grid;place-items:center}
      .gs-bigbox .lid{position:absolute;left:6%;right:6%;top:2%;height:28%;border-radius:18px;background:linear-gradient(150deg,#8b5cf6,#6d28d9);transition:transform .7s ease;transform-origin:top center}
      .gs-bigbox.open .lid{transform:translateY(-60px) rotateX(-110deg)}
      .gs-prize{font-size:84px;opacity:0;transform:scale(.3) translateY(20px);transition:all .6s .3s ease}
      .gs-bigbox.open .gs-prize{opacity:1;transform:scale(1) translateY(-4px)}
      .gs-win-h{font-family:'Sora',sans-serif;font-weight:800;font-size:clamp(28px,4vw,52px);margin:6px 0;
        background:linear-gradient(120deg,#fde68a,#fbbf24);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
      .gs-confetti{position:absolute;inset:0;z-index:5;pointer-events:none;overflow:hidden}
      .gs-confetti i{position:absolute;top:-20px;width:10px;height:14px;border-radius:2px;animation:gsfall linear forwards}
      @keyframes gsfall{to{transform:translateY(110vh) rotate(720deg)}}
    `;
    document.head.appendChild(st);
  }

  /* ---------------- data ---------------- */
  const PRIZES = [
    { id: 'tshirt', name: 'a ZICTA T-Shirt', emoji: '👕' },
    { id: 'cap',    name: 'a ZICTA Cap',     emoji: '🧢' },
    { id: 'cash',   name: 'K100 Cash',       emoji: '💵' }
  ];
  const ICTQ = [
    { q: "ZICTA's toll-free help line is…", opts: ['100', '7070', '991', '112'], a: 1 },
    { q: 'Which company created the ChatGPT AI assistant?', opts: ['Google', 'Meta', 'OpenAI', 'Apple'], a: 2 },
    { q: 'Dialling *#06# on a phone shows its…', opts: ['Battery level', 'IMEI number', 'SIM PIN', 'Data balance'], a: 1 },
    { q: 'Which is the safest password?', opts: ['qwerty123', 'YourName2024', 'coral-tide-lantern-92', 'P@ss!'], a: 2 },
    { q: 'In Zambia, SIM cards must be…', opts: ['Registered with a valid ID', 'Bought abroad', 'Shared with family', 'Renewed weekly'], a: 0 },
    { q: '“Phishing” messages try to steal your…', opts: ['Airtime', 'Personal info & passwords', 'Phone case', 'Ringtone'], a: 1 },
    { q: '“5G” is the 5th generation of…', opts: ['Batteries', 'Mobile networks', 'Cameras', 'Passwords'], a: 1 },
    { q: 'Which company develops the Android operating system?', opts: ['Apple', 'Microsoft', 'Google', 'Samsung'], a: 2 },
    { q: 'Zambia’s country internet domain is…', opts: ['.za', '.zm', '.zb', '.zw'], a: 1 },
    { q: 'On public Wi-Fi you should avoid…', opts: ['Reading news', 'Banking & sensitive logins', 'Checking weather', 'Music'], a: 1 }
  ];
  const GENQ = [
    { q: 'Which country won the 2022 FIFA World Cup?', opts: ['France', 'Brazil', 'Argentina', 'Germany'], a: 2 },
    { q: 'Who won the 2023 men’s Ballon d’Or?', opts: ['Erling Haaland', 'Lionel Messi', 'Kylian Mbappé', 'Vinícius Jr'], a: 1 },
    { q: 'Which nation won AFCON 2023 (played early 2024)?', opts: ['Nigeria', 'Egypt', 'Côte d’Ivoire', 'Senegal'], a: 2 },
    { q: 'Which city hosted the 2024 Summer Olympics?', opts: ['Tokyo', 'Paris', 'Los Angeles', 'London'], a: 1 },
    { q: 'What is the capital city of Zambia?', opts: ['Ndola', 'Kitwe', 'Livingstone', 'Lusaka'], a: 3 },
    { q: 'Victoria Falls lies on which river?', opts: ['Nile', 'Zambezi', 'Congo', 'Limpopo'], a: 1 },
    { q: 'Zambia’s national football team is nicknamed the…', opts: ['Chipolopolo', 'Bafana Bafana', 'Super Eagles', 'Black Stars'], a: 0 },
    { q: 'The album “Midnights” (2022) is by which artist?', opts: ['Beyoncé', 'Taylor Swift', 'Adele', 'Rihanna'], a: 1 },
    { q: 'Which company owns Instagram and WhatsApp?', opts: ['Google', 'Meta', 'Twitter/X', 'TikTok'], a: 1 },
    { q: 'Zambia’s official currency is the…', opts: ['Shilling', 'Rand', 'Kwacha', 'Naira'], a: 2 },
    { q: 'How many continents are there on Earth?', opts: ['5', '6', '7', '8'], a: 2 },
    { q: 'The largest planet in our solar system is…', opts: ['Saturn', 'Earth', 'Jupiter', 'Mars'], a: 2 }
  ];
  const WIN = 4, ROUND = 5;

  app.innerHTML = `
    <div class="app-bar">
      <div class="a-ico ic-quiz">${quizIco()}</div>
      <div><h2>ZICTA Game Show</h2><div class="a-sub">Pick a box · answer · win a prize!</div></div>
      <div class="sp"></div>
      <button class="close-app" title="Close (Esc)">${x()}</button>
    </div>
    <div class="app-body" style="padding:0"><div class="gs-wrap"><div class="gs-bg" id="gsBg"></div><div id="gsStage"></div></div></div>`;
  const stage = app.querySelector('#gsStage');
  app.querySelector('.close-app').onclick = ctx.close;

  const bg = app.querySelector('#gsBg');
  if (!reduce) {
    for (let i = 0; i < 5; i++) { const r = document.createElement('span'); r.className = 'ray'; r.style.animationDelay = (-i * 1.8) + 's'; bg.appendChild(r); }
    for (let i = 0; i < 40; i++) { const t = document.createElement('span'); t.className = 'twinkle'; const s = 1 + Math.random() * 3; t.style.cssText = `left:${Math.random()*100}%;top:${Math.random()*100}%;width:${s}px;height:${s}px;animation-delay:${(-Math.random()*3).toFixed(1)}s`; bg.appendChild(t); }
  }

  let boxes = [], chosen = null, qs = [], qi = 0, stars = 0, locked = false;
  intro();

  function intro() {
    stage.innerHTML = `
      <div class="gs-panel anim-q">
        <div class="gs-kicker">★ ZICTA Game Show ★</div>
        <h1 class="gs-title">Win a Prize!</h1>
        <p class="gs-sub">Pick a mystery box, then answer 5 questions — 3 on ICT &amp; cyber-safety, 2 general knowledge. Get ${WIN} or more right and the box is yours!</p>
        <button class="gs-btn" id="gsPlay">Let’s play ▸</button>
      </div>`;
    stage.querySelector('#gsPlay').onclick = pickScreen;
  }

  function pickScreen() {
    chosen = null;
    boxes = Array.from({ length: 6 }, () => PRIZES[(Math.random() * PRIZES.length) | 0]);
    stage.innerHTML = `
      <div class="gs-panel anim-q">
        <div class="gs-kicker">Step 1</div>
        <h1 class="gs-title" style="font-size:clamp(28px,4.4vw,52px)">Pick your box</h1>
        <p class="gs-sub">Each box hides a prize — a T-shirt, a cap or K100. Pick one… then earn it!</p>
        <div class="gs-boxes" id="gsBoxes">
          ${boxes.map((_, i) => `
            <button class="gs-box" data-i="${i}">
              <span class="lid"></span><span class="cube"><span class="qm">?</span></span><span class="ribbon"></span>
            </button>`).join('')}
        </div>
      </div>`;
    const els = [...stage.querySelectorAll('.gs-box')];
    if (!reduce) els.forEach((e, k) => setTimeout(() => { e.classList.add('shuffle'); setTimeout(() => e.classList.remove('shuffle'), 500); }, k * 70));
    els.forEach(e => e.onclick = () => {
      if (chosen !== null) return;
      chosen = boxes[+e.dataset.i];
      els.forEach(o => o.classList.add(o === e ? 'chosen' : 'dim'));
      setTimeout(beginQuiz, 650);
    });
  }

  function beginQuiz() {
    qs = shuffle(pick(ICTQ, 3).map(q => ({ ...q, cat: 'ICT' })).concat(pick(GENQ, 2).map(q => ({ ...q, cat: 'GEN' }))));
    qs = qs.map(withShuffledOpts);
    qi = 0; stars = 0; locked = false;
    question();
  }

  function question() {
    const m = qs[qi]; locked = false;
    stage.innerHTML = `
      <div class="gs-q anim-q">
        <div class="gs-hud">
          <div class="gs-stars" id="gsStars">${Array.from({ length: ROUND }, (_, i) => `<span class="st ${i < stars ? 'on' : ''}">⭐</span>`).join('')}</div>
          <div class="gs-prog">Q${qi + 1}/${ROUND}</div>
        </div>
        <div class="gs-cat ${m.cat === 'GEN' ? 'gen' : ''}">${m.cat === 'GEN' ? 'General Knowledge' : 'ICT · Cyber'}</div>
        <div class="gs-question">${m.q}</div>
        <div class="gs-opts" id="gsOpts">
          ${m.opts.map((o, i) => `<button class="gs-opt" data-i="${i}">${o}</button>`).join('')}
        </div>
        <div class="gs-fb" id="gsFb"></div>
        <div class="gs-next" id="gsNextWrap"></div>
      </div>`;
    stage.querySelectorAll('.gs-opt').forEach(b => b.onclick = () => answer(+b.dataset.i, b, m));
  }

  function answer(i, btn, m) {
    if (locked) return; locked = true;
    const opts = [...stage.querySelectorAll('.gs-opt')];
    opts.forEach(o => o.disabled = true);
    const good = i === m.a;
    if (good) {
      btn.classList.add('correct'); stars++;
      const stEl = stage.querySelectorAll('#gsStars .st')[stars - 1]; if (stEl) stEl.classList.add('on');
    } else {
      btn.classList.add('wrong', 'shake');
      opts[m.a].classList.add('correct');
    }
    const fb = stage.querySelector('#gsFb');
    fb.textContent = good ? 'Correct! ⭐' : 'Not quite — the right answer is highlighted.';
    fb.classList.add('show');
    const wrap = stage.querySelector('#gsNextWrap');
    const last = qi === ROUND - 1;
    wrap.innerHTML = `<button class="gs-btn" id="gsNext">${last ? 'See result ▸' : 'Next question ▸'}</button>`;
    wrap.querySelector('#gsNext').onclick = () => { qi++; qi < ROUND ? question() : reveal(); };
  }

  function reveal() {
    const won = stars >= WIN;
    record('game:quiz', Math.round(stars / ROUND * 100));
    stage.innerHTML = `
      <div class="gs-panel gs-reveal anim-q">
        <div class="gs-kicker">${won ? '🎉 You did it! 🎉' : 'So close!'}</div>
        <div class="gs-bigbox" id="gsBig">
          <span class="lid"></span><span class="cube"><span class="gs-prize">${chosen.emoji}</span></span>
        </div>
        <h1 class="gs-win-h">${won ? 'You won ' + chosen.name + '!' : stars + ' / ' + ROUND + ' correct'}</h1>
        <p class="gs-sub">${won
          ? 'Show this screen at the ZICTA stand to claim your prize. Nicely played!'
          : 'You needed ' + WIN + ' stars to crack the box. Give it another go!'}</p>
        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
          <button class="gs-btn" id="gsAgain">Play again ▸</button>
          <button class="gs-btn ghost" id="gsHome">Back</button>
        </div>
      </div>`;
    const big = stage.querySelector('#gsBig');
    if (won) setTimeout(() => { big.classList.add('open'); confetti(); }, 350);
    stage.querySelector('#gsAgain').onclick = pickScreen;
    stage.querySelector('#gsHome').onclick = intro;
  }

  /* ---------------- effects + helpers ---------------- */
  function confetti() {
    if (reduce) return;
    const wrap = document.createElement('div'); wrap.className = 'gs-confetti';
    app.querySelector('.gs-wrap').appendChild(wrap);
    const cols = ['#fde68a', '#fbbf24', '#38bdf8', '#a78bfa', '#22c55e', '#ef4444', '#fff'];
    for (let i = 0; i < 90; i++) {
      const p = document.createElement('i');
      p.style.cssText = `left:${Math.random()*100}%;background:${cols[(Math.random()*cols.length)|0]};animation-duration:${(2+Math.random()*2.2).toFixed(2)}s;animation-delay:${(Math.random()*0.5).toFixed(2)}s`;
      wrap.appendChild(p);
    }
    setTimeout(() => wrap.remove(), 5200);
  }
  function pick(arr, n) { return shuffle(arr.slice()).slice(0, n); }
  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function withShuffledOpts(q) { const idx = q.opts.map((_, i) => i); shuffle(idx); return { ...q, opts: idx.map(i => q.opts[i]), a: idx.indexOf(q.a) }; }
  function record(k, v) { try { window.TideScore && window.TideScore.record(k, v); } catch (e) {} }

  return { onClose: () => {} };

  function quizIco() { return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9.2" stroke="#fff" stroke-width="1.7"/><path d="M9.2 9.4a2.8 2.8 0 1 1 4 2.5c-.9.5-1.2 1-1.2 1.9" stroke="#fff" stroke-width="1.7" stroke-linecap="round"/><circle cx="12" cy="17" r="1.1" fill="#fff"/></svg>'; }
  function x() { return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'; }
};
