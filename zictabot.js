/* ============================================================
   TideOS — Talk to Zictabot (live photoreal avatar via LiveAvatar)
   Reuses the ZICTA-AI LiveAvatar workflow as an OS app/widget.
   buildZictabot(app, ctx) -> { onClose }
   ============================================================ */
window.buildZictabot = function (app, ctx) {
  const SDK_URL = "https://cdn.jsdelivr.net/npm/@heygen/liveavatar-web-sdk@0.0.18/+esm";

  // one-time styles for this app
  if (!document.getElementById('zb-style')) {
    const st = document.createElement('style'); st.id = 'zb-style';
    st.textContent = `
      .zb-body{display:flex;height:100%;width:100%}
      .zb-stage{position:relative;flex:1;min-width:0;background:#0a1626;overflow:hidden;display:flex;align-items:center;justify-content:center}
      /* side chat panel */
      .zb-chat{flex:0 0 clamp(300px,26vw,400px);display:flex;flex-direction:column;background:#0c1f33;border-left:1px solid rgba(255,255,255,.08);min-height:0}
      .zb-chat-head{padding:16px 18px;font-family:'Sora',sans-serif;font-weight:700;font-size:16px;color:#eaf4ff;border-bottom:1px solid rgba(255,255,255,.08);display:flex;align-items:center;gap:8px}
      .zb-chat-head .dot{width:8px;height:8px;border-radius:50%;background:#18c29c;box-shadow:0 0 0 0 rgba(24,194,156,.5);animation:zbpulse 2s infinite}
      .zb-msgs{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;scroll-behavior:smooth}
      .zb-msgs::-webkit-scrollbar{width:7px}.zb-msgs::-webkit-scrollbar-thumb{background:rgba(255,255,255,.18);border-radius:4px}
      .zb-empty{margin:auto;text-align:center;color:rgba(234,244,255,.45);font-family:'Manrope',sans-serif;font-size:14px;padding:20px}
      .zb-msg{max-width:88%;padding:10px 14px;border-radius:15px;font-family:'Manrope',sans-serif;font-size:14.5px;line-height:1.4;word-wrap:break-word}
      .zb-msg .who{display:block;font-size:10px;letter-spacing:.4px;text-transform:uppercase;opacity:.55;margin-bottom:3px;font-weight:700}
      .zb-msg.bot{align-self:flex-start;background:linear-gradient(135deg,rgba(24,194,156,.22),rgba(34,211,238,.16));color:#dffaf2;border-bottom-left-radius:4px}
      .zb-msg.user{align-self:flex-end;background:rgba(255,255,255,.10);color:#eaf4ff;border-bottom-right-radius:4px}
      .zb-form{display:flex;gap:8px;padding:14px;border-top:1px solid rgba(255,255,255,.08)}
      .zb-input{flex:1;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);border-radius:999px;padding:12px 16px;color:#eaf4ff;font-family:'Manrope',sans-serif;font-size:14px;outline:none}
      .zb-input::placeholder{color:rgba(234,244,255,.4)}
      .zb-send{flex:0 0 auto;width:44px;height:44px;border-radius:50%;border:none;cursor:pointer;background:radial-gradient(circle at 35% 30%,#18c29c,#0a8f73);color:#fff;display:grid;place-items:center}
      @media (orientation:portrait){.zb-body{flex-direction:column}.zb-chat{flex:0 0 38%;border-left:none;border-top:1px solid rgba(255,255,255,.08)}}
      .zb-video{width:100%;height:100%;object-fit:cover;background:#0a1626;display:block}
      .zb-cap{position:absolute;left:50%;bottom:118px;transform:translateX(-50%);max-width:86%;text-align:center;
        font-family:'Manrope',system-ui,sans-serif;font-size:clamp(16px,2.4vw,26px);font-weight:600;color:#fff;
        background:rgba(8,20,34,.55);backdrop-filter:blur(6px);padding:10px 18px;border-radius:16px;z-index:4;opacity:0;transition:opacity .3s}
      .zb-cap.show{opacity:1}
      .zb-usercap{position:absolute;left:50%;bottom:176px;transform:translateX(-50%);max-width:80%;text-align:center;
        font-family:'Manrope',sans-serif;font-style:italic;font-size:clamp(14px,1.8vw,20px);color:#cfe6ff;z-index:4;text-shadow:0 2px 10px rgba(0,0,0,.8)}
      .zb-timer{position:absolute;top:18px;right:18px;z-index:5;display:flex;align-items:center;gap:8px}
      .zb-clock{background:rgba(255,255,255,.9);color:#0a1626;font-weight:800;font-size:18px;padding:7px 14px;border-radius:999px;font-variant-numeric:tabular-nums;min-width:62px;text-align:center}
      .zb-clock.low{background:#ff5d6c;color:#fff;animation:zbpulse 1s infinite}
      @keyframes zbpulse{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}
      .zb-plus{background:#2563eb;color:#fff;border:none;cursor:pointer;font-weight:800;font-size:14px;padding:8px 14px;border-radius:999px}
      .zb-mic{position:absolute;left:50%;bottom:30px;transform:translateX(-50%);width:74px;height:74px;border-radius:50%;border:none;cursor:pointer;
        color:#fff;font-size:26px;z-index:5;background:radial-gradient(circle at 35% 30%,#18c29c,#0a8f73);
        box-shadow:0 10px 30px rgba(15,191,152,.5);transition:transform .12s,background .2s}
      .zb-mic:active{transform:translateX(-50%) scale(.93)}
      .zb-mic.listening{background:radial-gradient(circle at 35% 30%,#ff6b7a,#c41f3c);animation:zbpulse 1.1s infinite}
      .zb-mic.speaking{background:radial-gradient(circle at 35% 30%,#5b9bff,#2155b9)}
      .zb-mic.muted{background:radial-gradient(circle at 35% 30%,#9aa7b4,#5f6c79)}
      .zb-hint{position:absolute;left:50%;bottom:8px;transform:translateX(-50%);color:rgba(255,255,255,.6);font-size:13px;z-index:5;font-family:'Manrope',sans-serif}
      .zb-over{position:absolute;inset:0;z-index:8;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;
        background:radial-gradient(ellipse at center,#0e1f38,#0a1626);color:#eaf4ff;text-align:center;padding:30px;font-family:'Manrope',sans-serif}
      .zb-spin{width:48px;height:48px;border:4px solid rgba(24,194,156,.25);border-top-color:#18c29c;border-radius:50%;animation:zbspin 1s linear infinite}
      @keyframes zbspin{to{transform:rotate(360deg)}}
      .zb-over h3{font-family:'Sora',sans-serif;font-size:clamp(22px,3vw,34px);margin:0}
      .zb-over p{max-width:520px;line-height:1.5;opacity:.8;margin:0}
      .zb-over code{background:#13294a;padding:2px 7px;border-radius:5px}
      .zb-btn{padding:16px 38px;border-radius:999px;border:none;cursor:pointer;font-family:'Sora',sans-serif;font-weight:700;font-size:18px;color:#06241b;background:#18c29c;box-shadow:0 12px 30px rgba(24,194,156,.45)}
      .zb-hidden{display:none!important}
    `;
    document.head.appendChild(st);
  }

  app.innerHTML = `
    <div class="app-bar">
      <div class="a-ico ic-ai">${aiIco()}</div>
      <div><h2>Talk to Zictabot</h2><div class="a-sub">Live ZICTA AI host · ask out loud</div></div>
      <div class="sp"></div>
      <button class="close-app" title="Close (Esc)">${x()}</button>
    </div>
    <div class="app-body zb-body" style="padding:0">
      <div class="zb-stage">
        <video class="zb-video" id="zbVideo" autoplay playsinline></video>
        <div class="zb-timer zb-hidden" id="zbTimerBar"><span class="zb-clock" id="zbClock">1:30</span><button class="zb-plus" id="zbPlus">+20s</button></div>
        <div class="zb-usercap" id="zbUserCap"></div>
        <div class="zb-cap" id="zbCap"></div>
        <button class="zb-mic zb-hidden" id="zbMic">🎤</button>
        <div class="zb-hint zb-hidden" id="zbHint"></div>
        <div class="zb-over" id="zbOver">
          <div class="zb-spin" id="zbSpin"></div>
          <h3 id="zbTitle">Connecting to Zictabot…</h3>
          <p id="zbMsg">Setting up your conversation</p>
          <button class="zb-btn zb-hidden" id="zbAgain">Start again</button>
        </div>
      </div>
      <aside class="zb-chat">
        <div class="zb-chat-head"><span class="dot"></span> Conversation</div>
        <div class="zb-msgs" id="zbMsgs"><div class="zb-empty">Your chat with Zictabot appears here. Speak out loud, or type a question below.</div></div>
        <form class="zb-form" id="zbForm" autocomplete="off">
          <input class="zb-input" id="zbInput" placeholder="Type a question…" />
          <button class="zb-send" type="submit" aria-label="Send"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 12 20 5l-4 15-4-6-8-2Z" fill="#fff"/></svg></button>
        </form>
      </aside>
    </div>`;

  const $ = (s) => app.querySelector(s);
  const video = $('#zbVideo'), cap = $('#zbCap'), userCap = $('#zbUserCap');
  const over = $('#zbOver'), spin = $('#zbSpin'), title = $('#zbTitle'), msg = $('#zbMsg'), again = $('#zbAgain');
  const mic = $('#zbMic'), hint = $('#zbHint'), timerBar = $('#zbTimerBar'), clockEl = $('#zbClock'), plus = $('#zbPlus');
  const msgsEl = $('#zbMsgs'), chatForm = $('#zbForm'), chatInput = $('#zbInput');
  app.querySelector('.close-app').onclick = ctx.close;

  /* ---- side chat / transcript ---- */
  let curBot = null;
  function botName(){ return (cfg && cfg.agentName) || 'Zictabot'; }
  function addMsg(role, text){
    const empty = msgsEl.querySelector('.zb-empty'); if (empty) empty.remove();
    const el = document.createElement('div'); el.className = 'zb-msg ' + role;
    el.innerHTML = `<span class="who">${role === 'bot' ? botName() : 'You'}</span><span class="t"></span>`;
    el.querySelector('.t').textContent = text || '';
    msgsEl.appendChild(el); msgsEl.scrollTop = msgsEl.scrollHeight; return el;
  }
  function botChunk(txt){ if (!curBot) curBot = addMsg('bot', ''); const t = curBot.querySelector('.t'); t.textContent += txt; msgsEl.scrollTop = msgsEl.scrollHeight; }
  function botFinal(txt){ if (!curBot) curBot = addMsg('bot', ''); if (txt) curBot.querySelector('.t').textContent = txt; curBot = null; msgsEl.scrollTop = msgsEl.scrollHeight; }
  chatForm.onsubmit = (e) => {
    e.preventDefault();
    const q = chatInput.value.trim(); if (!q || !session) return;
    chatInput.value = ''; addMsg('user', q); bump();
    try { if (session.message) session.message(q); else if (session.repeat) session.repeat(q); } catch (err) { console.warn(err); }
  };

  let SDK = null, cfg = {}, session = null, ptt = false, ending = false, closing = false, goodbyeLive = false;
  let keepAlive = null, idleWatch = null, timerInt = null, closeSafety = null, farewellTimer = null, farewellPending = false;
  let secondsLeft = 0, lastActivity = Date.now(), muted = false, holding = false, disposed = false;
  const MAXS_DEFAULT = 90, EXTEND = 20, IDLE_STOP_MS = 60000;
  const FAREWELL = /\b(goodbye|good bye|bye+|see you|see ya|that'?s all|that'?s it|i'?m done|we'?re done|nothing else|thank you so much|have a (good|nice|great) (day|one)|take care)\b/i;
  const bump = () => { lastActivity = Date.now(); };

  function showOver(t, m, showAgain, spinning){ over.classList.remove('zb-hidden'); title.textContent=t; msg.innerHTML=m||'';
    spin.classList.toggle('zb-hidden', !spinning); again.classList.toggle('zb-hidden', !showAgain); }
  function hideOver(){ over.classList.add('zb-hidden'); }
  function setMic(s){ mic.className='zb-mic'+(s&&s!=='idle'?' '+s:''); mic.textContent = s==='muted'?'🔇':s==='listening'?'●':s==='speaking'?'♪':'🎤'; }

  (async function start(){
    try { cfg = await (await fetch('/api/config')).json(); } catch {}
    if (disposed) return;                       // closed before we even got config
    if (!cfg.hasLiveAvatar){
      showOver('Add a LiveAvatar key', 'Set <code>liveavatarApiKey</code> in <code>config.json</code> on the server, then restart.', false, false);
      return;
    }
    showOver('Connecting to Zictabot…', 'Setting up your conversation', false, true);
    let tok;
    try { tok = await (await fetch('/api/la-token',{method:'POST'})).json(); if(!tok.sessionToken) throw new Error(tok.error||'no token'); }
    catch(e){ return showOver('Could not connect', String(e.message||e), false, false); }
    if (disposed) return;                       // closed while fetching the token — never open a session
    ptt = !!tok.pushToTalk;
    try { SDK = await import(SDK_URL); }
    catch(e){ return showOver('Could not load avatar engine', 'Check the internet connection.', false, false); }
    if (disposed) return;
    try {
      const { LiveAvatarSession, SessionInteractivityMode } = SDK;
      session = new LiveAvatarSession(tok.sessionToken, {
        voiceChat: ptt ? { mode: SessionInteractivityMode.PUSH_TO_TALK } : true,
        apiUrl: tok.apiUrl || 'https://api.liveavatar.com'
      });
      // user closed the app during setup → stop immediately so the avatar never starts billing
      if (disposed) { stopSession(); return; }
      wire();
      await session.start();
      if (disposed) { stopSession(); return; } // closed mid-handshake → end the session we just started
      keepAlive = setInterval(()=>{ try{ session && session.keepAlive(); }catch{} }, 150000);
    } catch(e){ showOver('Could not start Zictabot', String(e.message||e), false, false); }
  })();

  // Hard stop: release the mic, end the live session, drop the reference. Safe to call repeatedly.
  function stopSession(){
    try { session && session.voiceChat && session.voiceChat.stop && session.voiceChat.stop(); } catch {}
    try { session && session.stop(); } catch {}
    session = null;
  }

  function wire(){
    const { SessionEvent, SessionState, AgentEventsEnum } = SDK;
    session.on(SessionEvent.SESSION_STREAM_READY, onReady);
    session.on(SessionEvent.SESSION_STATE_CHANGED, (st)=>{ if(st===SessionState.DISCONNECTED) onEnded(); });
    session.on(AgentEventsEnum.AVATAR_SPEAK_STARTED, ()=>{ bump(); if(closing) goodbyeLive=true; if(!ptt) setMic('speaking'); });
    session.on(AgentEventsEnum.AVATAR_SPEAK_ENDED, ()=>{ bump(); if(!ptt) setMic('idle');
      if(closing && goodbyeLive){ clearTimeout(closeSafety); return finish(); }
      if(farewellPending){ farewellPending=false; clearTimeout(farewellTimer); setTimeout(finish, 900); } });
    session.on(AgentEventsEnum.USER_SPEAK_STARTED, ()=>{ bump(); if(!ptt) setMic('listening'); });
    session.on(AgentEventsEnum.USER_SPEAK_ENDED, ()=>{ bump(); if(!ptt) setMic('idle'); });
    session.on(AgentEventsEnum.USER_TRANSCRIPTION, (e)=>{ userCap.textContent = e.text ? '“'+e.text+'”' : '';
      if(e.text) addMsg('user', e.text);
      if(FAREWELL.test(e.text||'')){ farewellPending=true; clearTimeout(farewellTimer); farewellTimer=setTimeout(()=>{ if(farewellPending){farewellPending=false; finish();} }, 9000); } });
    let line='';
    session.on(AgentEventsEnum.AVATAR_TRANSCRIPTION_CHUNK, (e)=>{ line+=(e.text||''); cap.textContent=line; cap.classList.add('show'); botChunk(e.text||''); });
    session.on(AgentEventsEnum.AVATAR_TRANSCRIPTION, (e)=>{ line=''; cap.textContent=e.text||''; cap.classList.add('show'); botFinal(e.text||''); });
  }

  async function onReady(){
    try { session.attach(video); } catch(e){ console.warn(e); }
    video.play().catch(()=>{});
    let micMsg = ptt ? 'Press & hold the mic to talk' : 'Just speak — she’s listening · tap mic to mute';
    try { await session.voiceChat.start(); } catch(e){ micMsg='Allow the microphone to talk'; }
    hideOver(); mic.classList.remove('zb-hidden'); hint.classList.remove('zb-hidden');
    setMic('idle'); hint.textContent = micMsg; bump(); startTimer();
    if (cfg.liveavatarSandbox === false){
      clearInterval(idleWatch);
      idleWatch = setInterval(()=>{ if(session && Date.now()-lastActivity>IDLE_STOP_MS){ clearInterval(idleWatch); finish(); } }, 10000);
    }
  }

  /* ---- countdown ---- */
  function fmt(s){ s=Math.max(0,s); return Math.floor(s/60)+':'+String(s%60).padStart(2,'0'); }
  function startTimer(){
    secondsLeft = cfg.liveavatarMaxSeconds || MAXS_DEFAULT;
    plus.textContent = '+'+(cfg.liveavatarExtendSeconds||EXTEND)+'s';
    clockEl.textContent = fmt(secondsLeft); timerBar.classList.remove('zb-hidden');
    clearInterval(timerInt);
    timerInt = setInterval(()=>{ secondsLeft--; clockEl.textContent=fmt(secondsLeft); clockEl.classList.toggle('low',secondsLeft<=20);
      if(secondsLeft<=0){ clearInterval(timerInt); timeUp(); } }, 1000);
  }
  plus.onclick = ()=>{ secondsLeft += (cfg.liveavatarExtendSeconds||EXTEND); clockEl.textContent=fmt(secondsLeft); clockEl.classList.toggle('low',secondsLeft<=20); bump(); };
  function timeUp(){
    if(closing||ending||!session) return; closing=true; goodbyeLive=false; plus.classList.add('zb-hidden'); hint.textContent='Wrapping up…';
    const bye = "That's all the time we have for now — thank you so much for visiting the ZICTA stand. Have a wonderful day!";
    try { session.interrupt(); } catch {}
    setTimeout(()=>{ try{ session.repeat(bye); }catch(e){ finish(); } }, 400);
    closeSafety = setTimeout(finish, 16000);
  }

  /* ---- mic ---- */
  mic.onclick = async ()=>{ if(!session) return;
    if(ptt) return;  // push-to-talk handled by pointer events below
    try { if(muted){ await session.voiceChat.unmute(); muted=false; setMic('idle'); hint.textContent='Mic on — just speak'; }
          else { await session.voiceChat.mute(); muted=true; setMic('muted'); hint.textContent='Muted · tap mic to talk'; } } catch(e){ console.warn(e); }
  };
  mic.addEventListener('pointerdown', async (e)=>{ if(!ptt||!session||holding) return; e.preventDefault(); holding=true; bump(); setMic('listening'); try{ await session.voiceChat.startPushToTalk(); }catch{} });
  const pttUp = async ()=>{ if(!ptt||!session||!holding) return; holding=false; setMic('idle'); try{ await session.voiceChat.stopPushToTalk(); }catch{} };
  mic.addEventListener('pointerup', pttUp); mic.addEventListener('pointerleave', pttUp); mic.addEventListener('pointercancel', pttUp);

  /* ---- end / cleanup ---- */
  function onEnded(){ if(ending) return; ending=true; cleanup();
    showOver('Thanks for chatting!', cfg.liveavatarSandbox ? 'Sandbox sessions are short. Start another any time.' : 'Tap below for a new conversation.', true, false);
    again.onclick = ctx.close;  // back to desktop for the next visitor
  }
  function finish(){ if(ending||!session) return; try{ session.stop(); }catch{ onEnded(); } } // stop -> DISCONNECTED -> onEnded
  function cleanup(){ clearInterval(keepAlive); clearInterval(idleWatch); clearInterval(timerInt); clearTimeout(closeSafety); clearTimeout(farewellTimer);
    try{ video.srcObject=null; }catch{} }

  /* ---- helpers ---- */
  function aiIco(){ return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 3a6 6 0 0 1 6 6v1.5a4.5 4.5 0 0 1-4.5 4.5H12l-3.2 3v-3a4.8 4.8 0 0 1-2.8-4.4V9a6 6 0 0 1 6-6Z" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/><circle cx="9.6" cy="10" r="1" fill="#fff"/><circle cx="14.4" cy="10" r="1" fill="#fff"/></svg>'; }
  function x(){ return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'; }

  return { onClose: () => {
    if (disposed) return;        // idempotent — closeApp may fire this more than once
    disposed = true; ending = true;   // block any late finish()/onEnded() from re-opening anything
    cleanup();                   // clears keepAlive ping, idle watch, timers; detaches video
    stopSession();               // releases mic + ends the live avatar so it stops consuming tokens
  } };
};
