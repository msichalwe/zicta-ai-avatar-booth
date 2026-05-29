// ZICTA-AI avatar booth — zero-dependency local server.
// Serves the booth page and proxies Claude (brain) + Google TTS (voice).
// Keys live in config.json (gitignored) and never reach the browser.

const http = require("http");
const fs = require("fs");
const path = require("path");

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

// ---- static files ----
function serveStatic(req, res) {
  let urlPath = decodeURIComponent(req.url.split("?")[0]);
  if (urlPath === "/") urlPath = "/index.html";
  const filePath = path.join(__dirname, path.normalize(urlPath));
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    return res.end("forbidden");
  }
  fs.readFile(filePath, (err, buf) => {
    if (err) {
      res.writeHead(404);
      return res.end("not found");
    }
    const ext = path.extname(filePath).toLowerCase();
    const noCache = [".html", ".js", ".mjs", ".json"].includes(ext);
    res.writeHead(200, {
      "Content-Type": MIME[ext] || "application/octet-stream",
      "Cache-Control": noCache ? "no-store, no-cache, must-revalidate" : "public, max-age=86400",
    });
    res.end(buf);
  });
}

const requestHandler = async (req, res) => {
  try {
    if (req.url.startsWith("/api/config")) return handleConfig(res);
    if (req.url.startsWith("/api/chat") && req.method === "POST") return handleChat(req, res);
    if (req.url.startsWith("/api/tts") && req.method === "POST") return handleTts(req, res);
    if (req.url.startsWith("/api/embed") && req.method === "POST") return handleEmbed(res);
    if (req.url.startsWith("/api/la-token") && req.method === "POST") return handleLaToken(req, res);
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
  console.log("  Brain (Claude):", config.anthropicApiKey ? "ON" : "demo fallback");
  console.log("  Voice (Google):", config.googleTtsApiKey ? "ON" : "browser fallback");
  console.log("  LiveAvatar photoreal:", config.liveavatarApiKey ? (config.liveavatarSandbox !== false ? "ON (sandbox)" : "ON (live)") : "needs key");
  console.log("  Press Ctrl+C to stop.\n");
});
