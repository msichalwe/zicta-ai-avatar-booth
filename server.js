// ZICTA-AI avatar booth — zero-dependency local server.
// Serves the booth page and proxies Claude (brain) + Google TTS (voice).
// Keys live in config.json (gitignored) and never reach the browser.

const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

function loadConfig() {
  for (const f of ["config.json", "config.example.json"]) {
    const p = path.join(__dirname, f);
    if (fs.existsSync(p)) {
      try {
        return JSON.parse(fs.readFileSync(p, "utf8"));
      } catch (e) {
        console.error(`Could not parse ${f}:`, e.message);
      }
    }
  }
  return {};
}

let config = loadConfig();
const PORT = config.port || 3000;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".glb": "model/gltf-binary",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function sendJson(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (c) => {
      data += c;
      if (data.length > 1e6) reject(new Error("body too large"));
    });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

function xmlEscape(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// ---- /api/config : tells the browser what's available (no secrets) ----
function handleConfig(res) {
  sendJson(res, 200, {
    hasBrain: !!config.anthropicApiKey,
    hasTTS: !!config.googleTtsApiKey,
    hasLiveAvatar: !!config.liveavatarApiKey,
    agentName: config.agentName || "Avatar",
    greeting: config.greeting || "Hi! Tap to talk to me.",
    avatarUrl: config.avatarUrl || "",
    avatarBody: config.avatarBody || "F",
    kokoroVoice: config.kokoroVoice || "af_heart",
    liveavatarOrientation: config.liveavatarOrientation || "vertical",
    liveavatarPushToTalk: config.liveavatarPushToTalk === true,
    liveavatarSandbox: config.liveavatarSandbox !== false,
    liveavatarMaxSeconds: config.liveavatarMaxSeconds || 90,
    liveavatarExtendSeconds: config.liveavatarExtendSeconds || 20,
  });
}

// ---- /api/chat : Claude brain (falls back to a canned reply if no key) ----
async function handleChat(req, res) {
  let payload;
  try {
    payload = JSON.parse(await readBody(req));
  } catch {
    return sendJson(res, 400, { error: "bad json" });
  }
  const history = Array.isArray(payload.messages) ? payload.messages : [];

  if (!config.anthropicApiKey) {
    const last = history.length ? history[history.length - 1].content : "";
    return sendJson(res, 200, {
      reply:
        "I'm running in demo mode without my brain connected yet, but I heard you say: " +
        String(last).slice(0, 140) +
        ". Add a Claude key in config.json to give me real answers!",
      demo: true,
    });
  }

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": config.anthropicApiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: config.anthropicModel || "claude-opus-4-7",
        max_tokens: 300,
        system: config.systemPrompt || "You are a friendly AI host. Keep replies short.",
        messages: history,
      }),
    });
    const data = await r.json();
    if (!r.ok) {
      console.error("Anthropic error:", data);
      return sendJson(res, 502, { error: data.error?.message || "brain error" });
    }
    const reply = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join(" ")
      .trim();
    sendJson(res, 200, { reply: reply || "Sorry, I didn't catch that — could you say it again?" });
  } catch (e) {
    console.error("Chat proxy failed:", e.message);
    sendJson(res, 502, { error: "brain unreachable" });
  }
}

// ---- /api/tts : Google TTS with word timings for lip-sync ----
async function handleTts(req, res) {
  let payload;
  try {
    payload = JSON.parse(await readBody(req));
  } catch {
    return sendJson(res, 400, { error: "bad json" });
  }
  const text = String(payload.text || "").trim();
  if (!text) return sendJson(res, 400, { error: "no text" });

  if (!config.googleTtsApiKey) {
    return sendJson(res, 200, { disabled: true });
  }

  // Wrap each word in an SSML <mark> so Google returns per-word timings.
  const words = text.split(/\s+/).filter(Boolean);
  const ssml =
    "<speak>" +
    words.map((w, i) => `<mark name="w${i}"/>${xmlEscape(w)} `).join("") +
    `<mark name="end"/></speak>`;

  try {
    const r = await fetch(
      "https://texttospeech.googleapis.com/v1/text:synthesize?key=" +
        encodeURIComponent(config.googleTtsApiKey),
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          input: { ssml },
          voice: {
            languageCode: config.ttsLanguageCode || "en-GB",
            name: config.ttsVoiceName || undefined,
          },
          audioConfig: { audioEncoding: "MP3", sampleRateHertz: 24000 },
          enableTimePointing: ["SSML_MARK"],
        }),
      }
    );
    const data = await r.json();
    if (!r.ok) {
      console.error("Google TTS error:", data);
      return sendJson(res, 502, { error: data.error?.message || "tts error" });
    }

    const tp = data.timepoints || [];
    const markTime = {};
    tp.forEach((t) => (markTime[t.markName] = t.timeSeconds * 1000));
    const wtimes = words.map((_, i) => markTime[`w${i}`] ?? i * 350);
    const endMs = markTime["end"] ?? wtimes[wtimes.length - 1] + 500;
    const wdurations = wtimes.map((t, i) =>
      Math.max(80, (i + 1 < wtimes.length ? wtimes[i + 1] : endMs) - t)
    );

    sendJson(res, 200, {
      audioBase64: data.audioContent,
      words,
      wtimes,
      wdurations,
    });
  } catch (e) {
    console.error("TTS proxy failed:", e.message);
    sendJson(res, 502, { error: "tts unreachable" });
  }
}

// ---- LiveAvatar (photoreal) : create a Context (persona) once, then an embed URL ----
const LA_BASE = "https://api.liveavatar.com";
let cachedContextId = null;
let cachedEmbedUrl = null;

async function laFetch(path, body) {
  const r = await fetch(LA_BASE + path, {
    method: "POST",
    headers: { "content-type": "application/json", "X-API-KEY": config.liveavatarApiKey },
    body: JSON.stringify(body),
  });
  const data = await r.json().catch(() => ({}));
  return { ok: r.ok, status: r.status, data };
}

async function ensureContext() {
  if (config.liveavatarContextId) return config.liveavatarContextId;
  if (cachedContextId) return cachedContextId;
  const ctxBody = {
    name: (config.agentName || "Host") + " ZICTA " + Date.now().toString(36),
    prompt: config.systemPrompt || "You are a friendly AI host. Keep replies short and spoken.",
    opening_text: config.greeting || "Hi! Tap to talk to me.",
  };
  if (Array.isArray(config.liveavatarLinks) && config.liveavatarLinks.length) ctxBody.links = config.liveavatarLinks;
  const { ok, data } = await laFetch("/v1/contexts", ctxBody);
  const id = data && data.data && data.data.id;
  if (!ok || !id) throw new Error((data && data.message) || "could not create context");
  cachedContextId = id;
  console.log("\n  >> Created LiveAvatar Context:", id);
  console.log("  >> Paste this into config.json as \"liveavatarContextId\" to reuse it.\n");
  return id;
}

async function handleEmbed(res) {
  if (!config.liveavatarApiKey) return sendJson(res, 200, { error: "no liveavatar key" });
  if (cachedEmbedUrl) return sendJson(res, 200, { url: cachedEmbedUrl });
  try {
    const contextId = await ensureContext();
    const body = {
      avatar_id: config.liveavatarAvatarId,
      context_id: contextId,
      is_sandbox: config.liveavatarSandbox !== false,
      orientation: config.liveavatarOrientation || "vertical",
      default_language: "en",
    };
    if (config.liveavatarVoiceId) body.voice_id = config.liveavatarVoiceId;
    const { ok, data } = await laFetch("/v2/embeddings", body);
    const url = data && data.data && data.data.url;
    if (!ok || !url) {
      console.error("LiveAvatar embed error:", data);
      return sendJson(res, 502, { error: (data && data.message) || "embed error", detail: data });
    }
    cachedEmbedUrl = url;
    sendJson(res, 200, { url, orientation: data.data.orientation });
  } catch (e) {
    console.error("Embed creation failed:", e.message);
    sendJson(res, 502, { error: e.message });
  }
}

// ---- /api/la-token : FULL-mode session token for the custom LiveKit render ----
async function handleLaToken(req, res) {
  if (!config.liveavatarApiKey) return sendJson(res, 200, { error: "no liveavatar key" });
  try {
    const contextId = await ensureContext();
    const ptt = config.liveavatarPushToTalk === true;
    const persona = { context_id: contextId, language: "en" };
    if (config.liveavatarVoiceId) persona.voice_id = config.liveavatarVoiceId;
    if (config.liveavatarVoiceSettings && typeof config.liveavatarVoiceSettings === "object")
      persona.voice_settings = config.liveavatarVoiceSettings;
    const body = {
      mode: "FULL",
      avatar_id: config.liveavatarAvatarId,
      avatar_persona: persona,
      is_sandbox: config.liveavatarSandbox !== false,
      video_quality: config.liveavatarVideoQuality || "high",
    };
    if (ptt) body.interactivity_type = "PUSH_TO_TALK";
    const { ok, data } = await laFetch("/v1/sessions/token", body);
    const token = data && data.data && data.data.session_token;
    if (!ok || !token) {
      console.error("LiveAvatar token error:", data);
      return sendJson(res, 502, { error: (data && data.message) || "session token error", detail: data });
    }
    sendJson(res, 200, {
      sessionToken: token,
      sessionId: data.data.session_id,
      pushToTalk: ptt,
      apiUrl: LA_BASE,
    });
  } catch (e) {
    console.error("la-token failed:", e.message);
    sendJson(res, 502, { error: e.message });
  }
}

// ============================================================
//   STAND OPERATIONS — usage tracking, credits, /admin dashboard
// ============================================================

// Apps we count (matches the os.js builders registry). Anything else is ignored.
const KNOWN_APPS = ["zictabot", "ai", "camera", "quiz", "knowledge", "arcade", "map"];
const USAGE_FILE = path.join(__dirname, "usage.json");
const MAX_EVENTS = 20000;

function loadUsage() {
  try {
    const u = JSON.parse(fs.readFileSync(USAGE_FILE, "utf8"));
    if (!Array.isArray(u.events)) u.events = [];
    return u;
  } catch {
    return { events: [], startedAt: Date.now() };
  }
}
let usage = loadUsage();
let usageSaveTimer = null;
function saveUsage() {
  if (usageSaveTimer) return; // debounce: at most one write / 1.5s
  usageSaveTimer = setTimeout(() => {
    usageSaveTimer = null;
    try { fs.writeFileSync(USAGE_FILE, JSON.stringify(usage)); }
    catch (e) { console.error("usage save failed:", e.message); }
  }, 1500);
}

// POST /api/track — booth pings this when an app opens/closes (no auth, public booth).
async function handleTrack(req, res) {
  let p;
  try { p = JSON.parse(await readBody(req)); } catch { return sendJson(res, 400, { error: "bad json" }); }
  const app = String(p.app || "").slice(0, 40);
  const type = String(p.type || "open").slice(0, 20);
  if (!KNOWN_APPS.includes(app)) return sendJson(res, 200, { ok: false });
  const ev = { t: Date.now(), app, type, sid: String(p.sid || "anon").slice(0, 60) };
  const dur = Number(p.dur);
  if (Number.isFinite(dur) && dur > 0) ev.dur = Math.min(dur, 6 * 3600 * 1000);
  usage.events.push(ev);
  if (usage.events.length > MAX_EVENTS) usage.events.splice(0, usage.events.length - MAX_EVENTS);
  saveUsage();
  sendJson(res, 200, { ok: true });
}

// Live LiveAvatar credit balance, cached 60s so admin polling doesn't hammer the API.
let creditsCache = { at: 0, data: null };
async function fetchCredits() {
  if (!config.liveavatarApiKey) return { error: "no key" };
  if (creditsCache.data && Date.now() - creditsCache.at < 60000) return creditsCache.data;
  try {
    const r = await fetch(LA_BASE + "/v1/users/credits", { headers: { "X-API-KEY": config.liveavatarApiKey } });
    const data = await r.json().catch(() => ({}));
    const left = data && data.data && parseFloat(data.data.credits_left);
    const out = (!r.ok || !Number.isFinite(left)) ? { error: (data && data.message) || "credits error" } : { left };
    creditsCache = { at: Date.now(), data: out };
    return out;
  } catch (e) { return { error: e.message }; }
}

// --- admin auth: HMAC-signed cookie, secret derived from the configured password ---
function adminSecret() {
  return crypto.createHash("sha256")
    .update("zicta-admin|" + (config.adminPassword || "") + "|" + (config.adminEmail || ""))
    .digest();
}
function signToken(ttlMs) {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + ttlMs })).toString("base64url");
  const sig = crypto.createHmac("sha256", adminSecret()).update(payload).digest("base64url");
  return payload + "." + sig;
}
function verifyToken(tok) {
  if (!tok || tok.indexOf(".") < 0) return false;
  const [payload, sig] = tok.split(".");
  const expect = crypto.createHmac("sha256", adminSecret()).update(payload).digest("base64url");
  if (!sig || sig.length !== expect.length) return false;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expect))) return false;
  try { return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")).exp > Date.now(); }
  catch { return false; }
}
function parseCookies(req) {
  const out = {};
  (req.headers.cookie || "").split(";").forEach((c) => {
    const i = c.indexOf("="); if (i < 0) return;
    out[c.slice(0, i).trim()] = decodeURIComponent(c.slice(i + 1).trim());
  });
  return out;
}
function isAdmin(req) { return verifyToken(parseCookies(req).zadmin); }
function eq(a, b) {
  const ba = Buffer.from(String(a)), bb = Buffer.from(String(b));
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
}

async function handleAdminLogin(req, res) {
  let p;
  try { p = JSON.parse(await readBody(req)); } catch { return sendJson(res, 400, { error: "bad json" }); }
  const email = String(p.email || "").trim().toLowerCase();
  const okEmail = email === String(config.adminEmail || "").trim().toLowerCase();
  const okPass = !!config.adminPassword && eq(p.password || "", config.adminPassword);
  if (!okEmail || !okPass) return sendJson(res, 401, { error: "Invalid email or password" });
  const tok = signToken(12 * 3600 * 1000);
  res.writeHead(200, {
    "Content-Type": "application/json; charset=utf-8",
    "Set-Cookie": `zadmin=${tok}; HttpOnly; Path=/; Max-Age=${12 * 3600}; SameSite=Lax`,
  });
  res.end(JSON.stringify({ ok: true }));
}
function handleAdminLogout(res) {
  res.writeHead(200, {
    "Content-Type": "application/json; charset=utf-8",
    "Set-Cookie": "zadmin=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax",
  });
  res.end(JSON.stringify({ ok: true }));
}

function dayKey(t) {
  const d = new Date(t);
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

// GET /api/admin/stats — everything the dashboard renders (auth required).
async function handleAdminStats(req, res) {
  if (!isAdmin(req)) return sendJson(res, 401, { error: "unauthorized" });
  const events = usage.events || [];
  const opens = events.filter((e) => e.type === "open");
  const today = dayKey(Date.now());

  const plays = {}; KNOWN_APPS.forEach((a) => (plays[a] = 0));
  opens.forEach((e) => { plays[e.app] = (plays[e.app] || 0) + 1; });

  const allSids = new Set(events.map((e) => e.sid));
  const todaySids = new Set(events.filter((e) => dayKey(e.t) === today).map((e) => e.sid));

  const byDayMap = {};
  opens.forEach((e) => { const k = dayKey(e.t); byDayMap[k] = (byDayMap[k] || 0) + 1; });
  const byDay = Object.keys(byDayMap).sort().slice(-14).map((k) => ({ day: k, opens: byDayMap[k] }));

  const byHour = Array.from({ length: 24 }, (_, h) => ({ hour: h, opens: 0 }));
  opens.filter((e) => dayKey(e.t) === today).forEach((e) => { byHour[new Date(e.t).getHours()].opens++; });

  const durAgg = {};
  events.filter((e) => e.type === "close" && e.dur).forEach((e) => { (durAgg[e.app] = durAgg[e.app] || []).push(e.dur); });
  const avgDur = {};
  Object.keys(durAgg).forEach((a) => { const arr = durAgg[a]; avgDur[a] = Math.round(arr.reduce((s, x) => s + x, 0) / arr.length / 1000); });

  const credits = await fetchCredits();
  const perMin = config.liveavatarCreditsPerMinute || 2;
  const left = credits.left;
  const start = config.liveavatarCreditsStart || null;
  const interactionsLeft = Number.isFinite(left) ? {
    at90s: Math.floor(left / (perMin * 1.5)),
    at2min: Math.floor(left / (perMin * 2)),
    minutes: Math.round(left / perMin),
  } : null;

  const receipts = Array.isArray(config.adminReceipts) ? config.adminReceipts : [];
  const byCategory = {}, byVendor = {};
  let spendTotal = 0;
  receipts.forEach((r) => {
    const amt = Number(r.amount) || 0; spendTotal += amt;
    byCategory[r.category || "Other"] = (byCategory[r.category || "Other"] || 0) + amt;
    byVendor[r.vendor || "Other"] = (byVendor[r.vendor || "Other"] || 0) + amt;
  });

  sendJson(res, 200, {
    generatedAt: Date.now(),
    apps: KNOWN_APPS,
    plays,
    totalOpens: opens.length,
    sessions: { total: allSids.size, today: todaySids.size },
    byDay, byHour, avgDur,
    credits: {
      left: Number.isFinite(left) ? left : null,
      error: credits.error || null,
      perMinute: perMin,
      start,
      used: (Number.isFinite(left) && start) ? Math.max(0, +(start - left).toFixed(1)) : null,
      sandbox: config.liveavatarSandbox !== false,
    },
    interactionsLeft,
    receipts,
    spend: { total: spendTotal, currency: (receipts[0] && receipts[0].currency) || "USD", byCategory, byVendor },
    sessionCaps: { maxSeconds: config.liveavatarMaxSeconds || 90, extendSeconds: config.liveavatarExtendSeconds || 20 },
  });
}

async function handleAdminReset(req, res) {
  if (!isAdmin(req)) return sendJson(res, 401, { error: "unauthorized" });
  usage = { events: [], startedAt: Date.now() };
  try { fs.writeFileSync(USAGE_FILE, JSON.stringify(usage)); } catch (e) {}
  sendJson(res, 200, { ok: true });
}

// ---- static files ----
function serveStatic(req, res) {
  let urlPath = decodeURIComponent(req.url.split("?")[0]);
  if (urlPath === "/") urlPath = "/index.html";
  if (urlPath === "/admin" || urlPath === "/admin/") urlPath = "/admin.html";
  const filePath = path.join(__dirname, path.normalize(urlPath));
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    return res.end("forbidden");
  }
  fs.readFile(filePath, (err, buf) => {
    if (err) {
      // Not a booth file. If the request originated from the embedded map iframe,
      // it's a map asset our explicit prefixes didn't catch (/heroes/*, /zitf-map.jpg,
      // /favicon.ico…) — forward it to the map app rather than 404. Booth files always
      // win because they exist here and never reach this branch.
      if (refererIsMap(req)) return proxyMap(req, res);
      res.writeHead(404);
      return res.end("not found");
    }
    const ext = path.extname(filePath).toLowerCase();
    const noCache = [".html", ".js", ".mjs", ".json", ".css"].includes(ext);
    res.writeHead(200, {
      "Content-Type": MIME[ext] || "application/octet-stream",
      "Cache-Control": noCache ? "no-store, no-cache, must-revalidate" : "public, max-age=86400",
    });
    res.end(buf);
  });
}

// ---- reverse-proxy the ZNPCS Digital Address Map (so the iframe rides on OUR
//      origin/port and never needs :8081 exposed externally). Forwards the map
//      page + its Next.js assets to the local addressing app on 127.0.0.1:8081.
const ZNPS_ORIGIN = (config.znpsMapOrigin || "https://127.0.0.1:8081");
// The booth and the ZNPCS map app SHARE this same origin, and BOTH use /api/*.
// These few /api paths belong to the booth (AI brain / avatar / TTS); every other
// /api/* request is the map app's own data API and must be forwarded to it.
const BOOTH_API = ["/api/config", "/api/chat", "/api/tts", "/api/embed", "/api/la-token", "/api/track"];
const BOOTH_API_PREFIXES = ["/api/admin/"];
const ZNPS_PREFIXES = ["/_next/", "/zitf-map/", "/znps-api/"];
function refererIsMap(req) {
  const r = req.headers.referer || req.headers.referrer;
  if (!r) return false;
  try { return new URL(r).pathname.startsWith("/map"); } catch (e) { return false; }
}
function isMapProxy(req) {
  const p = (req.url || "").split("?")[0];
  if (p === "/map" || p.startsWith("/map/")) return true;          // the map page itself
  if (p.startsWith("/api/")) {                                     // map data APIs (search, address, stats…) but NOT the booth's
    if (BOOTH_API.includes(p) || BOOTH_API_PREFIXES.some((pre) => p.startsWith(pre))) return false;
    return true;
  }
  if (ZNPS_PREFIXES.some(pre => p.startsWith(pre))) return true;   // Next.js build assets
  return false;
  // Other map sub-resources (/heroes, /zitf-map.jpg, favicon…) are handled as a
  // referer-based fallback in serveStatic, so real booth files always win.
}
function proxyMap(req, res) {
  const https = require("https");
  const target = new URL(ZNPS_ORIGIN + req.url);
  const opts = {
    hostname: target.hostname, port: target.port || 443, path: target.pathname + target.search,
    method: req.method, headers: { ...req.headers, host: target.host }, rejectUnauthorized: false,
  };
  const preq = https.request(opts, (pres) => {
    res.writeHead(pres.statusCode || 502, pres.headers);
    pres.pipe(res);
  });
  preq.on("error", (e) => { console.error("map proxy error:", e.message); if (!res.headersSent) sendJson(res, 502, { error: "map service unreachable" }); });
  req.pipe(preq);
}

const requestHandler = async (req, res) => {
  try {
    if (isMapProxy(req)) return proxyMap(req, res);
    if (req.url.startsWith("/api/config")) return handleConfig(res);
    if (req.url.startsWith("/api/chat") && req.method === "POST") return handleChat(req, res);
    if (req.url.startsWith("/api/tts") && req.method === "POST") return handleTts(req, res);
    if (req.url.startsWith("/api/embed") && req.method === "POST") return handleEmbed(res);
    if (req.url.startsWith("/api/la-token") && req.method === "POST") return handleLaToken(req, res);
    if (req.url.startsWith("/api/track") && req.method === "POST") return handleTrack(req, res);
    if (req.url.startsWith("/api/admin/login") && req.method === "POST") return handleAdminLogin(req, res);
    if (req.url.startsWith("/api/admin/logout") && req.method === "POST") return handleAdminLogout(res);
    if (req.url.startsWith("/api/admin/stats")) return handleAdminStats(req, res);
    if (req.url.startsWith("/api/admin/reset") && req.method === "POST") return handleAdminReset(req, res);
    return serveStatic(req, res);
  } catch (e) {
    console.error("Request failed:", e);
    sendJson(res, 500, { error: "server error" });
  }
};

// HTTPS if cert files are configured (needed for camera/mic over the network), else HTTP
let server, scheme = "http";
if (config.httpsKeyFile && config.httpsCertFile &&
    fs.existsSync(config.httpsKeyFile) && fs.existsSync(config.httpsCertFile)) {
  const https = require("https");
  server = https.createServer(
    { key: fs.readFileSync(config.httpsKeyFile), cert: fs.readFileSync(config.httpsCertFile) },
    requestHandler
  );
  scheme = "https";
} else {
  server = http.createServer(requestHandler);
}

server.listen(PORT, () => {
  config = loadConfig();
  console.log("\n  ZICTA-AI avatar booth running (" + scheme.toUpperCase() + ")");
  console.log("  Open:  " + scheme + "://localhost:" + PORT);
  console.log("  Photoreal custom (main): " + scheme + "://localhost:" + PORT + "/");
  console.log("  Embed version:           " + scheme + "://localhost:" + PORT + "/embed.html");
  console.log("  Free 3D fallback:        " + scheme + "://localhost:" + PORT + "/avatar3d.html");
  console.log("  Admin dashboard:         " + scheme + "://localhost:" + PORT + "/admin" + (config.adminPassword && config.adminPassword !== "change-me" ? "" : "  (set adminPassword in config.json!)"));
  console.log("  Brain (Claude):", config.anthropicApiKey ? "ON" : "demo fallback");
  console.log("  Voice (Google):", config.googleTtsApiKey ? "ON" : "browser fallback");
  console.log("  LiveAvatar photoreal:", config.liveavatarApiKey ? (config.liveavatarSandbox !== false ? "ON (sandbox)" : "ON (live)") : "needs key");
  console.log("  Press Ctrl+C to stop.\n");
});
