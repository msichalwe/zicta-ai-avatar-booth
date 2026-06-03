/* ============================================================
   ZICTAOS — Mini Games arcade (10 ZICTA-themed touch games)
   Security · Law · Technology · Hacking · Strategy
   buildArcade(app, ctx) -> { onClose }
   ============================================================ */
window.buildArcade = function (app, ctx) {
  const D = window.TIDE_DATA;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  app.innerHTML = `
    <div class="app-bar">
      <div class="a-ico ic-arcade">${ic.pad()}</div>
      <div><h2>Mini Games</h2><div class="a-sub">Learn security, law &amp; tech by playing</div></div>
      <div class="sp"></div>
      <button class="close-app" title="Close (Esc)">${ic.x()}</button>
    </div>
    <div class="app-body"><div class="arcade-wrap" id="arcadeStage"></div></div>`;

  const stage = app.querySelector('#arcadeStage');
  app.querySelector('.close-app').onclick = ctx.close;
  let cleanup = null;            // per-game teardown (timers etc.)

  /* ---------- game catalogue ---------- */
  const GAMES = [
    { key:'scam',   cat:'SECURITY',   title:'Spot the Scam',    blurb:'Scam or safe? Tap fast, learn the red flags.', grad:'linear-gradient(150deg,#fb7185,#be123c)', ico:ic.hook(), run:()=>binary(cfg.scam) },
    { key:'phish',  cat:'SECURITY',   title:'Phish or Legit',   blurb:'Inspect the web link — real or fake?',          grad:'linear-gradient(150deg,#f97316,#b45309)', ico:ic.link(), run:()=>binary(cfg.phish) },
    { key:'pass',   cat:'SECURITY',   title:'Strong or Weak',   blurb:'Judge each password at a glance.',               grad:'linear-gradient(150deg,#22d3ee,#0e7490)', ico:ic.key(),  run:()=>binary(cfg.pass) },
    { key:'tf',     cat:'TECH',       title:'True or False',    blurb:'Quick-fire ICT & ZICTA facts.',                 grad:'linear-gradient(150deg,#38bdf8,#1d4ed8)', ico:ic.bolt(), run:()=>binary(cfg.tf) },
    { key:'law',    cat:'CYBER LAW',  title:'Legal or Illegal', blurb:'Know Zambia’s cyber-crime law.',                 grad:'linear-gradient(150deg,#a78bfa,#6d28d9)', ico:ic.gavel(),run:()=>binary(cfg.law) },
    { key:'ttt',    cat:'STRATEGY',   title:'Cyber Tac-Toe',    blurb:'Shields vs Locks — beat the bot.',              grad:'linear-gradient(150deg,#34d399,#047857)', ico:ic.grid(), run:ttt },
    { key:'memory', cat:'TECH',       title:'Memory Match',     blurb:'Pair each ICT term with its meaning.',          grad:'linear-gradient(150deg,#60a5fa,#2563eb)', ico:ic.cards(),run:memory },
    { key:'defend', cat:'HACKING',    title:'Threat Defender',  blurb:'Tap the threats, spare the safe ones.',         grad:'linear-gradient(150deg,#ef4444,#7f1d1d)', ico:ic.shield(),run:defend },
    { key:'cipher', cat:'HACKING',    title:'Cipher Crack',     blurb:'Decode the secret Caesar message.',             grad:'linear-gradient(150deg,#14b8a6,#0f766e)', ico:ic.term(), run:cipher },
    { key:'binary', cat:'TECH',       title:'Binary Blocks',    blurb:'Flip bits to build the number.',                grad:'linear-gradient(150deg,#8b5cf6,#4338ca)', ico:ic.bin(),  run:binaryBlocks }
  ];

  /* binary-choice game configs (shared engine) */
  const cfg = {
    scam: { title:'Spot the Scam', data:D.scam, prompt:m=>m.text, ok:(m,s)=>s===m.scam, why:m=>m.why, yes:{label:'SCAM',cls:'bad'}, no:{label:'SAFE',cls:'good'}, key:'scam' },
    tf:   { title:'True or False', data:D.tf,   prompt:m=>m.s,    ok:(m,s)=>s===m.a,    why:m=>m.why, yes:{label:'TRUE',cls:'good'}, no:{label:'FALSE',cls:'bad'}, key:'tf' },
    pass: { title:'Strong or Weak', data:D.passwords, prompt:m=>`<code class="pw">${m.p}</code>`, ok:(m,s)=>s===m.strong, why:m=>m.why, yes:{label:'STRONG',cls:'good'}, no:{label:'WEAK',cls:'bad'}, key:'pass' },
    phish:{ title:'Phish or Legit', data:D.phish, prompt:m=>`<code class="pw">${m.url}</code>`, ok:(m,s)=>s===m.legit, why:m=>m.why, yes:{label:'LEGIT',cls:'good'}, no:{label:'PHISH',cls:'bad'}, key:'phish' },
    law:  { title:'Legal or Illegal', data:D.law, prompt:m=>m.act, ok:(m,s)=>s===m.legal, why:m=>m.why, yes:{label:'LEGAL',cls:'good'}, no:{label:'ILLEGAL',cls:'bad'}, key:'law' }
  };

  menu();

  /* ======================= MENU ======================= */
  function menu() {
    teardown();
    stage.innerHTML = `
      <div class="arcade-menu anim-q">
        <h2 class="arcade-h">Choose a game</h2>
        <p class="arcade-sub">${GAMES.length} quick games — sharpen your security, law &amp; tech instincts.</p>
        <div class="game-grid">
          ${GAMES.map(g => `
            <button class="game-card" data-g="${g.key}">
              <div class="game-ico" style="background:${g.grad}">${g.ico}</div>
              <span class="game-tag">${g.cat}</span>
              <h3>${g.title}</h3>
              <p>${g.blurb}</p>
              <span class="game-play">Play ${ic.arrow()}</span>
            </button>`).join('')}
        </div>
      </div>`;
    stage.querySelectorAll('.game-card').forEach(c => c.onclick = () => {
      const g = GAMES.find(x => x.key === c.dataset.g); if (g) g.run();
    });
  }

  /* ======================= SHARED RESULT ======================= */
  function result(o) {
    teardown();
    const pct = o.pct;
    const r = 70, circ = 2 * Math.PI * r, off = circ * (1 - pct / 100);
    record(o.key, pct);
    const msg = pct === 100 ? "Perfect run! 🛡️" : pct >= 70 ? "Sharp instincts 🐬" : pct >= 40 ? "Getting there — keep practising" : "Review the Knowledge cards & retry";
    const card = document.createElement('div');
    card.className = 'game-result anim-q';
    card.innerHTML = `
      <div class="ring"><svg width="160" height="160"><circle cx="80" cy="80" r="${r}" stroke="rgba(8,47,73,.12)" stroke-width="12" fill="none"/>
        <circle cx="80" cy="80" r="${r}" stroke="url(#gg)" stroke-width="12" fill="none" stroke-linecap="round" stroke-dasharray="${circ}" stroke-dashoffset="${circ}" id="ga"/>
        <defs><linearGradient id="gg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#38bdf8"/><stop offset="1" stop-color="#0369a1"/></linearGradient></defs></svg>
        <div class="pct" id="gp">0%</div></div>
      <h2>${o.title}</h2><p>${o.msg || msg}</p>
      <div class="badges">${o.badges.map(b => `<div class="rb"><b>${b.v}</b>${b.l}</div>`).join('')}</div>
      <div class="actions">
        <button class="btn" id="again">Play again ${ic.redo()}</button>
        <button class="btn ghost" id="back">Other games</button>
      </div>`;
    stage.innerHTML = ''; stage.appendChild(card);
    setTimeout(() => { const a = card.querySelector('#ga'); a.style.transition = reduce ? 'none' : 'stroke-dashoffset 1s var(--ease-out)'; a.style.strokeDashoffset = off; }, 80);
    const t0 = performance.now();
    (function up(t){ const p = Math.min(1,(t-t0)/1000); card.querySelector('#gp').textContent = Math.round(p*pct)+'%'; if(p<1) requestAnimationFrame(up); })(t0);
    card.querySelector('#again').onclick = o.again;
    card.querySelector('#back').onclick = menu;
  }

  /* ======================= BINARY ENGINE ======================= */
  function binary(g) {
    teardown();
    let i = 0, score = 0, streak = 0, best = 0, locked = false;
    function round() {
      const m = g.data[i];
      const card = document.createElement('div');
      card.className = 'game-stage anim-q';
      card.innerHTML = `
        <div class="game-top">
          <button class="qback" id="gback" title="Back">${ic.back()}</button>
          <span class="game-name">${g.title}</span>
          <span class="game-streak">🔥 <b id="strk">${streak}</b></span>
          <span class="qcount">${i + 1}/${g.data.length}</span>
        </div>
        <div class="gbar"><i style="width:${i / g.data.length * 100}%"></i></div>
        <div class="msg-card" id="msgCard"><div class="msg-quote">${ic.quote()}</div><p class="msg-text">${g.prompt(m)}</p></div>
        <div class="game-feedback" id="fb"></div>
        <div class="choice-row" id="choices">
          <button class="choice ${g.no.cls}" data-v="0">${g.no.label}</button>
          <button class="choice ${g.yes.cls}" data-v="1">${g.yes.label}</button>
        </div>`;
      stage.innerHTML = ''; stage.appendChild(card);
      requestAnimationFrame(() => card.querySelector('.gbar i').style.width = (i / g.data.length * 100) + '%');
      card.querySelector('#gback').onclick = menu;
      locked = false;
      card.querySelectorAll('.choice').forEach(btn => btn.onclick = () => {
        if (locked) return; locked = true;
        const said = btn.dataset.v === '1';
        const good = g.ok(m, said);
        const fb = card.querySelector('#fb');
        card.querySelectorAll('.choice').forEach(b => b.disabled = true);
        btn.classList.add(good ? 'is-correct' : 'is-wrong');
        if (good) { score++; streak++; best = Math.max(best, streak); card.querySelector('#msgCard').classList.add('ok'); }
        else { streak = 0; card.querySelector('#msgCard').classList.add('no'); }
        card.querySelector('#strk').textContent = streak;
        fb.innerHTML = `<div class="fb-in ${good ? 'good' : 'bad'}"><b>${good ? 'Nice! ' : 'Watch out. '}</b>${g.why(m)}
          <button class="btn fb-next">${i === g.data.length - 1 ? 'Results' : 'Next'} ${ic.arrow()}</button></div>`;
        requestAnimationFrame(() => fb.querySelector('.fb-in').classList.add('show'));
        fb.querySelector('.fb-next').onclick = () => { i++; i < g.data.length ? round() : result({
          key:'game:'+g.key, title:g.title, pct:Math.round(score/g.data.length*100),
          badges:[{v:`${score}/${g.data.length}`,l:'Correct'},{v:best,l:'Best streak'}], again:()=>binary(g) }); };
      });
    }
    round();
  }

  /* ======================= TIC-TAC-TOE ======================= */
  function ttt() {
    teardown();
    let board, over, you, wins = 0, losses = 0, draws = 0;
    const P = '🛡️', C = '🔒';
    function fresh() { board = Array(9).fill(''); over = false; you = true; draw(); }
    function draw() {
      const card = document.createElement('div');
      card.className = 'game-stage anim-q ttt';
      card.innerHTML = `
        <div class="game-top"><button class="qback" id="gback">${ic.back()}</button>
          <span class="game-name">Cyber Tac-Toe</span>
          <span class="qcount">You ${P} · Bot ${C}</span></div>
        <div class="ttt-status" id="tst">Your move — place a ${P}</div>
        <div class="ttt-board" id="tb">${board.map((v,k)=>`<button class="ttt-cell" data-k="${k}">${v}</button>`).join('')}</div>
        <div class="ttt-score">Wins <b>${wins}</b> · Losses <b>${losses}</b> · Draws <b>${draws}</b></div>
        <div class="actions"><button class="btn ghost" id="reset">New round ${ic.redo()}</button></div>`;
      stage.innerHTML = ''; stage.appendChild(card);
      card.querySelector('#gback').onclick = menu;
      card.querySelector('#reset').onclick = fresh;
      card.querySelectorAll('.ttt-cell').forEach(c => c.onclick = () => human(+c.dataset.k));
      sync();
    }
    function sync(){ const tb = stage.querySelector('#tb'); if(!tb) return;
      tb.querySelectorAll('.ttt-cell').forEach((c,k)=>{ c.textContent=board[k]; c.disabled = over || board[k] !== '' || !you; }); }
    function human(k){ if(over||board[k]||!you) return; board[k]=P; you=false; sync();
      const w=winner(board); if(w) return end(w);
      setTimeout(()=>{ const m=bestMove(board); if(m>-1){ board[m]=C; } const w2=winner(board); you=true; sync(); if(w2) end(w2); else { stage.querySelector('#tst').textContent=`Your move — place a ${P}`; } }, 380);
    }
    function end(w){ over=true; const s=stage.querySelector('#tst');
      if(w==='draw'){ draws++; s.textContent='Draw — well defended!'; }
      else if(w===P){ wins++; s.textContent='You win! 🎉'; }
      else { losses++; s.textContent='Bot wins — try again.'; }
      sync(); const sc=stage.querySelector('.ttt-score'); if(sc) sc.innerHTML=`Wins <b>${wins}</b> · Losses <b>${losses}</b> · Draws <b>${draws}</b>`;
      record('game:ttt', wins+draws >= 3 ? 100 : (wins*100/Math.max(1,wins+losses+draws)));
    }
    function winner(b){ const L=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
      for(const [a,c,d] of L){ if(b[a]&&b[a]===b[c]&&b[a]===b[d]) return b[a]; }
      return b.every(x=>x)?'draw':null; }
    function bestMove(b){ // win > block > center > corner > side
      const tryline=(who)=>{ for(let k=0;k<9;k++){ if(!b[k]){ b[k]=who; if(winner(b)===who){ b[k]=''; return k; } b[k]=''; } } return -1; };
      let m=tryline(C); if(m>-1) return m; m=tryline(P); if(m>-1) return m;
      if(!b[4]) return 4; const cor=[0,2,6,8].filter(k=>!b[k]); if(cor.length) return cor[Math.floor(Math.random()*cor.length)];
      const free=b.map((v,k)=>v?-1:k).filter(k=>k>-1); return free.length?free[Math.floor(Math.random()*free.length)]:-1; }
    fresh();
  }

  /* ======================= MEMORY MATCH ======================= */
  function memory() {
    teardown();
    const pairs = D.memory;
    let deck = [];
    pairs.forEach((p,id)=>{ deck.push({id,t:p.a}); deck.push({id,t:p.b}); });
    deck = shuffle(deck);
    let flipped = [], matched = 0, moves = 0, lock = false;
    const card = document.createElement('div');
    card.className = 'game-stage anim-q';
    card.innerHTML = `
      <div class="game-top"><button class="qback" id="gback">${ic.back()}</button>
        <span class="game-name">Memory Match</span>
        <span class="qcount">Moves <b id="mv">0</b></span></div>
      <p class="mem-hint">Flip two cards to match each ICT term with its meaning.</p>
      <div class="mem-grid" id="mg">
        ${deck.map((c,k)=>`<button class="mem-card" data-k="${k}"><span class="mem-face">${c.t}</span></button>`).join('')}
      </div>`;
    stage.innerHTML = ''; stage.appendChild(card);
    card.querySelector('#gback').onclick = menu;
    const cells = [...card.querySelectorAll('.mem-card')];
    cells.forEach((el,k)=> el.onclick = ()=>flip(el,k));
    function flip(el,k){ if(lock||el.classList.contains('on')||el.classList.contains('done')) return;
      el.classList.add('on'); flipped.push({el,k});
      if(flipped.length===2){ lock=true; moves++; card.querySelector('#mv').textContent=moves;
        const [a,b]=flipped;
        if(deck[a.k].id===deck[b.k].id){ setTimeout(()=>{ a.el.classList.add('done'); b.el.classList.add('done'); flipped=[]; lock=false; matched++;
            if(matched===pairs.length) win(); },420); }
        else { setTimeout(()=>{ a.el.classList.remove('on'); b.el.classList.remove('on'); flipped=[]; lock=false; },720); }
      }
    }
    function win(){ const ideal=pairs.length, pct=Math.round(Math.min(100, ideal/moves*100));
      result({ key:'game:memory', title:'Memory Match', pct, msg:`Solved in ${moves} moves!`,
        badges:[{v:moves,l:'Moves'},{v:pairs.length,l:'Pairs'}], again:memory }); }
  }

  /* ======================= THREAT DEFENDER ======================= */
  function defend() {
    teardown();
    const pool = D.threats; let score=0, total=0, lives=3, idx=0, running=true;
    const card = document.createElement('div');
    card.className='game-stage anim-q';
    card.innerHTML = `
      <div class="game-top"><button class="qback" id="gback">${ic.back()}</button>
        <span class="game-name">Threat Defender</span>
        <span class="qcount">❤️ <b id="lv">${lives}</b> · <b id="sc">0</b></span></div>
      <p class="mem-hint">Tap the <b>threats</b> before they reach the server. Don't tap the safe ones!</p>
      <div class="def-field" id="field"><div class="def-server">🖥️ SERVER</div></div>`;
    stage.innerHTML=''; stage.appendChild(card);
    card.querySelector('#gback').onclick = menu;
    const field = card.querySelector('#field');
    const timers = [];
    const order = shuffle(pool.concat(pool)).slice(0, 14);  // ~14 items
    function spawn(){
      if(!running) return;
      if(idx>=order.length){ // wait for last to clear then finish
        timers.push(setTimeout(()=>{ if(running) finish(); }, 3600)); return; }
      const item = order[idx++];
      const chip = document.createElement('button');
      chip.className = 'def-chip ' + (item.bad?'bad':'safe');
      chip.textContent = item.label;
      chip.style.left = (8 + Math.random()*70) + '%';
      field.appendChild(chip);
      total++;
      requestAnimationFrame(()=> chip.classList.add('drop'));
      let resolved=false;
      const judge=(tapped)=>{ if(resolved) return; resolved=true; chip.classList.add('gone');
        const correct = item.bad ? tapped : !tapped;
        if(correct){ score++; chip.classList.add(item.bad?'zapped':'passed'); }
        else { lives--; chip.classList.add('miss'); card.querySelector('#lv').textContent=Math.max(0,lives); }
        card.querySelector('#sc').textContent=score;
        setTimeout(()=>chip.remove(), 380);
        if(lives<=0){ running=false; timers.push(setTimeout(finish,500)); }
      };
      chip.onclick = ()=>judge(true);
      timers.push(setTimeout(()=>judge(false), reduce?900:3300)); // reached server / passed
      timers.push(setTimeout(spawn, reduce?400:Math.max(700,1500-idx*40)));
    }
    function finish(){ running=false; teardown();
      result({ key:'game:defend', title:'Threat Defender', pct: Math.round(score/Math.max(1,total)*100),
        badges:[{v:`${score}/${total}`,l:'Correct'},{v:Math.max(0,lives),l:'Lives left'}], again:defend }); }
    cleanup = ()=>{ running=false; timers.forEach(clearTimeout); };
    spawn();
  }

  /* ======================= CIPHER CRACK ======================= */
  function cipher() {
    teardown();
    const rounds = D.cipher; let i=0, score=0, locked=false;
    function round(){
      const c = rounds[i];
      const card = document.createElement('div');
      card.className='game-stage anim-q';
      card.innerHTML = `
        <div class="game-top"><button class="qback" id="gback">${ic.back()}</button>
          <span class="game-name">Cipher Crack</span>
          <span class="qcount">${i+1}/${rounds.length}</span></div>
        <p class="mem-hint">Caesar cipher — each letter was shifted forward by <b>3</b>. Decode it!</p>
        <div class="cipher-box"><span class="cipher-text">${c.cipher}</span></div>
        <div class="q-opts cipher-opts">
          ${c.opts.map((o,k)=>`<button class="opt" data-k="${k}"><span class="key">${'ABCD'[k]}</span><span>${o}</span></button>`).join('')}
        </div>
        <div class="game-feedback" id="fb"></div>`;
      stage.innerHTML=''; stage.appendChild(card);
      card.querySelector('#gback').onclick = menu; locked=false;
      card.querySelectorAll('.opt').forEach(btn=>btn.onclick=()=>{
        if(locked) return; locked=true;
        const good = c.opts[+btn.dataset.k]===c.answer;
        card.querySelectorAll('.opt').forEach(b=>{ b.disabled=true; if(b.querySelector('span:last-child').textContent===c.answer) b.classList.add('correct'); });
        if(good) score++; else btn.classList.add('wrong');
        const fb=card.querySelector('#fb');
        fb.innerHTML=`<div class="fb-in ${good?'good':'bad'}"><b>${good?'Decoded! ':'Not quite. '}</b>“${c.cipher}” → <b>${c.answer}</b>.
          <button class="btn fb-next">${i===rounds.length-1?'Results':'Next'} ${ic.arrow()}</button></div>`;
        requestAnimationFrame(()=>fb.querySelector('.fb-in').classList.add('show'));
        fb.querySelector('.fb-next').onclick=()=>{ i++; i<rounds.length?round():result({
          key:'game:cipher', title:'Cipher Crack', pct:Math.round(score/rounds.length*100),
          badges:[{v:`${score}/${rounds.length}`,l:'Decoded'}], again:cipher }); };
      });
    }
    round();
  }

  /* ======================= BINARY BLOCKS ======================= */
  function binaryBlocks() {
    teardown();
    const ROUNDS = 5; const BITS=[8,4,2,1]; let i=0, score=0, target=0, bits=[0,0,0,0];
    function newRound(){ target = 1 + Math.floor(Math.random()*15); bits=[0,0,0,0]; draw(); }
    function val(){ return bits.reduce((s,b,k)=> s + (b?BITS[k]:0), 0); }
    function draw(){
      const card=document.createElement('div');
      card.className='game-stage anim-q';
      card.innerHTML=`
        <div class="game-top"><button class="qback" id="gback">${ic.back()}</button>
          <span class="game-name">Binary Blocks</span>
          <span class="qcount">${i+1}/${ROUNDS}</span></div>
        <p class="mem-hint">Computers count in <b>bits</b>. Flip the blocks so they add up to the target.</p>
        <div class="bin-target">Target: <b>${target}</b></div>
        <div class="bin-row" id="bits">
          ${BITS.map((b,k)=>`<button class="bin-bit" data-k="${k}"><span class="bv">0</span><span class="bw">${b}</span></button>`).join('')}
        </div>
        <div class="bin-sum">Your value: <b id="sum">0</b></div>
        <div class="game-feedback" id="fb"></div>`;
      stage.innerHTML=''; stage.appendChild(card);
      card.querySelector('#gback').onclick = menu;
      card.querySelectorAll('.bin-bit').forEach(btn=>btn.onclick=()=>{
        const k=+btn.dataset.k; bits[k]=bits[k]?0:1;
        btn.classList.toggle('on',!!bits[k]); btn.querySelector('.bv').textContent=bits[k];
        const v=val(); card.querySelector('#sum').textContent=v;
        if(v===target){ score++; const fb=card.querySelector('#fb');
          card.querySelectorAll('.bin-bit').forEach(b=>b.disabled=true);
          fb.innerHTML=`<div class="fb-in good"><b>Correct! </b>${target} = ${bits.join('')} in binary.
            <button class="btn fb-next">${i===ROUNDS-1?'Results':'Next'} ${ic.arrow()}</button></div>`;
          requestAnimationFrame(()=>fb.querySelector('.fb-in').classList.add('show'));
          fb.querySelector('.fb-next').onclick=()=>{ i++; i<ROUNDS?newRound():result({
            key:'game:binary', title:'Binary Blocks', pct:Math.round(score/ROUNDS*100),
            badges:[{v:`${score}/${ROUNDS}`,l:'Solved'}], again:binaryBlocks }); };
        }
      });
    }
    newRound();
  }

  /* ======================= helpers ======================= */
  function teardown(){ if(cleanup){ try{cleanup();}catch(e){} cleanup=null; } }
  function shuffle(a){ a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
  function record(key,pct){ try{ window.TideScore && window.TideScore.record(key, Math.round(pct)); }catch(e){} }

  return { onClose: () => teardown() };
};

/* icon pack — module-scoped, assigned at load (buildArcade runs only on open) */
var ic = {
  pad:()=>'<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="2.5" y="7" width="19" height="10" rx="5" stroke="#fff" stroke-width="1.7"/><path d="M7 10v4M5 12h4" stroke="#fff" stroke-width="1.7" stroke-linecap="round"/><circle cx="15.5" cy="11" r="1.1" fill="#fff"/><circle cx="18" cy="13.5" r="1.1" fill="#fff"/></svg>',
  hook:()=>'<svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M7 4v8a5 5 0 0 0 10 0" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/><circle cx="7" cy="3.2" r="1.6" fill="#fff"/></svg>',
  link:()=>'<svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M9 15l6-6M8 13l-2 2a3.5 3.5 0 0 0 5 5l2-2M16 11l2-2a3.5 3.5 0 0 0-5-5l-2 2" stroke="#fff" stroke-width="1.7" stroke-linecap="round"/></svg>',
  key:()=>'<svg width="26" height="26" viewBox="0 0 24 24" fill="none"><circle cx="8" cy="8" r="4.2" stroke="#fff" stroke-width="1.8"/><path d="M11 11l8 8M16 16l2-2" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/></svg>',
  bolt:()=>'<svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" fill="#fff"/></svg>',
  gavel:()=>'<svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M14 3l7 7-3 3-7-7 3-3Z" stroke="#fff" stroke-width="1.7" stroke-linejoin="round"/><path d="M10 7 4 13M5 21h10" stroke="#fff" stroke-width="1.7" stroke-linecap="round"/></svg>',
  grid:()=>'<svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M9 3v18M15 3v18M3 9h18M3 15h18" stroke="#fff" stroke-width="1.7" stroke-linecap="round"/></svg>',
  cards:()=>'<svg width="26" height="26" viewBox="0 0 24 24" fill="none"><rect x="4" y="6" width="11" height="14" rx="2" stroke="#fff" stroke-width="1.7"/><path d="M9 6 11 4h7a2 2 0 0 1 2 2v11l-2 2" stroke="#fff" stroke-width="1.5"/></svg>',
  shield:()=>'<svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M12 3l7 2.5v5c0 4.4-3 8-7 9.5-4-1.5-7-5.1-7-9.5v-5L12 3Z" stroke="#fff" stroke-width="1.7" stroke-linejoin="round"/><path d="M9 12l2 2 4-4.5" stroke="#fff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  term:()=>'<svg width="26" height="26" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="16" rx="2.5" stroke="#fff" stroke-width="1.7"/><path d="M7 9l3 3-3 3M13 15h4" stroke="#fff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  bin:()=>'<svg width="26" height="26" viewBox="0 0 24 24" fill="none"><text x="3" y="16" font-family="monospace" font-size="11" font-weight="700" fill="#fff">1010</text><text x="3" y="9" font-family="monospace" font-size="7" fill="#fff">0110</text></svg>',
  quote:()=>'<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M9 7H5v5h4l-2 4M19 7h-4v5h4l-2 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  arrow:()=>'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" style="vertical-align:-2px"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  back:()=>'<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 6l-6 6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  redo:()=>'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" style="vertical-align:-2px"><path d="M20 12a8 8 0 1 1-2.3-5.6" stroke="#fff" stroke-width="1.9" stroke-linecap="round"/><path d="M20 4v4h-4" stroke="#fff" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  x:()=>'<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
};
