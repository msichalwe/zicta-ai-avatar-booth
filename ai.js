/* ============================================================
   TideOS — ZICTA AI (interactive assistant via window.claude)
   buildAI(app, ctx) -> { onClose }
   ============================================================ */
window.buildAI = function (app, ctx) {
  const PRIMER = "You are ZICTA AI, a friendly assistant for the Zambia Information & Communications Technology Authority (ZICTA). You help the public with cyber security, online safety, digital literacy, SIM registration, reporting scams, and general ICT questions in a Zambian context. Keep answers short, warm and practical — 2 to 4 sentences, plain language, no markdown headings. If asked something outside ICT/safety, gently steer back. Never ask for passwords or PINs.";

  const SUGGEST = [
    "How do I spot a phishing SMS?",
    "Why register my SIM card?",
    "Tips for a strong password",
    "Is public Wi-Fi safe?"
  ];

  app.innerHTML = `
    <div class="app-bar">
      <div class="a-ico ic-ai">${aiIco()}</div>
      <div><h2>ZICTA AI</h2><div class="a-sub">Your cyber-safety companion</div></div>
      <div class="sp"></div>
      <button class="close-app" title="Close (Esc)">${x()}</button>
    </div>
    <div class="app-body">
      <div class="ai-wrap">
        <div class="ai-stream scrollable" id="aiStream">
          <div class="ai-hello">
            <div class="ai-orb">${orb()}</div>
            <h3>Hi, I'm ZICTA AI 🌊</h3>
            <p>Ask me anything about staying safe online, ZICTA services or digital basics.</p>
            <div class="ai-chips" id="aiChips">
              ${SUGGEST.map(s => `<button class="ai-chip">${s}</button>`).join('')}
            </div>
          </div>
        </div>
        <form class="ai-bar" id="aiForm" autocomplete="off">
          <input class="ai-input" id="aiInput" placeholder="Message ZICTA AI…" />
          <button class="ai-send" id="aiSend" type="submit">${send()}</button>
        </form>
      </div>
    </div>`;

  const stream = app.querySelector('#aiStream');
  const form = app.querySelector('#aiForm');
  const input = app.querySelector('#aiInput');
  const sendBtn = app.querySelector('#aiSend');
  app.querySelector('.close-app').onclick = ctx.close;
  let history = [], busy = false;

  app.querySelectorAll('.ai-chip').forEach(c => c.onclick = () => { input.value = c.textContent; ask(); });
  form.onsubmit = e => { e.preventDefault(); ask(); };
  setTimeout(() => input.focus(), 400);

  function bubble(role, html) {
    const hello = stream.querySelector('.ai-hello'); if (hello) hello.remove();
    const row = document.createElement('div');
    row.className = 'ai-msg ' + role;
    row.innerHTML = role === 'ai'
      ? `<div class="ai-av">${orb()}</div><div class="ai-text">${html}</div>`
      : `<div class="ai-text">${html}</div>`;
    stream.appendChild(row);
    stream.scrollTop = stream.scrollHeight;
    return row;
  }

  async function ask() {
    const q = input.value.trim(); if (!q || busy) return;
    busy = true; input.value = ''; sendBtn.disabled = true;
    bubble('me', esc(q));
    history.push({ role: 'user', content: q });
    const typing = bubble('ai', `<span class="ai-typing"><i></i><i></i><i></i></span>`);
    try {
      const r = await fetch('/api/chat', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages: history.slice(-12) })
      });
      const data = await r.json();
      const clean = (data.reply || "I'm not sure how to answer that — try asking about online safety or ZICTA services.").trim();
      history.push({ role: 'assistant', content: clean });
      typing.querySelector('.ai-text').innerHTML = esc(clean).replace(/\n/g, '<br>');
    } catch (err) {
      typing.querySelector('.ai-text').innerHTML = "I couldn't reach the network just now — try the live <b>Talk to Zictabot</b> assistant instead.";
    }
    stream.scrollTop = stream.scrollHeight;
    busy = false; sendBtn.disabled = false; input.focus();
  }

  return { onClose: () => {} };

  function esc(s){ const d=document.createElement('div'); d.textContent=s; return d.innerHTML; }
  function aiIco(){ return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 3a6 6 0 0 1 6 6v1.5a4.5 4.5 0 0 1-4.5 4.5H12l-3.2 3v-3a4.8 4.8 0 0 1-2.8-4.4V9a6 6 0 0 1 6-6Z" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/><circle cx="9.6" cy="10" r="1" fill="#fff"/><circle cx="14.4" cy="10" r="1" fill="#fff"/></svg>'; }
  function orb(){ return '<svg width="26" height="26" viewBox="0 0 24 24" fill="none"><defs><linearGradient id="og" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7dd3fc"/><stop offset="1" stop-color="#2563eb"/></linearGradient></defs><circle cx="12" cy="12" r="9" fill="url(#og)"/><path d="M8 13.5c1 1.2 2.4 1.9 4 1.9s3-.7 4-1.9" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/><circle cx="9.3" cy="10" r="1.1" fill="#fff"/><circle cx="14.7" cy="10" r="1.1" fill="#fff"/></svg>'; }
  function send(){ return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 12 20 5l-4 15-4-6-8-2Z" fill="#fff"/></svg>'; }
  function x(){ return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'; }
};
