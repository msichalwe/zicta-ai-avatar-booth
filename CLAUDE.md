# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

ZICTAOS (internal codename **TideOS**) — a touchscreen kiosk/booth web app for **ZICTA** (Zambia Information and Communications Technology Authority), built for a trade-fair stand. It presents a desktop-OS-style shell with launchable apps (AI chat, photoreal talking avatar, photo booth, quiz/game show, mini-games, knowledge cards, the national Digital Address map) plus ambient widgets (clock, weather, network pulse, cyber-weather, leaderboard).

## Run / develop

```bash
npm start          # = node server.js  (the ONLY script)
```

There is **no build step, no bundler, no test suite, and no lint config**. Frontend JS is plain `<script>`-tag vanilla JS; edit a file and reload the page. The server has **zero npm dependencies** (Node built-ins only) — `node_modules/` is unused.

- Default port **3000**; override with `"port"` in `config.json`.
- Entry page is `index.html` (served at `/`). `TideOS.html` is a byte-identical copy — keep them in sync if you touch one.
- HTTPS is auto-enabled when `httpsKeyFile` + `httpsCertFile` exist in config (required for camera/mic access over the LAN); otherwise plain HTTP.

## Configuration

All secrets and runtime settings live in `config.json` (gitignored). `config.example.json` is the committed template **and the fallback** — `server.js` loads `config.json` if present, else `config.example.json`. Copy the template to `config.json` and fill in keys. Read `config.example.json` first: its `_comment`/`_note` fields document every avatar ID, voice option, and credit/sandbox caveat. **API keys never reach the browser** — the server proxies all third-party calls and exposes only non-secret feature flags via `/api/config`.

## Architecture

### Backend — `server.js` (single file)
A hand-rolled `http`/`https` server that does two jobs: serve the static booth files and **proxy third-party APIs** so keys stay server-side.

- `GET  /api/config`  — non-secret feature flags (which integrations are on, agent name, greeting, voice).
- `POST /api/chat`    — proxies Anthropic Claude (the "brain"). Returns a canned **demo reply** if `anthropicApiKey` is unset.
- `POST /api/tts`     — Google TTS. Wraps each word in an SSML `<mark>` to get per-word timings for avatar lip-sync.
- `POST /api/embed`   — LiveAvatar managed embed URL (used by `embed.html`).
- `POST /api/la-token`— LiveAvatar FULL-mode session token for the custom LiveKit render (used by the Zictabot app).
- `POST /api/track`   — booth usage ping (`{app,type,sid,dur}` on app open/close), fired by `os.js`. Appends to `usage.json` (gitignored, capped to 20k events, debounced writes). No auth.
- `GET /api/admin/stats` + `POST /api/admin/{login,logout,reset}` — the **/admin Stand Operations dashboard** API. Cookie-gated by an HMAC token derived from `adminPassword` (creds: `adminEmail`/`adminPassword` in config). `stats` aggregates plays/sessions/durations from `usage.json`, fetches the **live LiveAvatar credit balance** (`GET /v1/users/credits`, cached 60s) with an interactions-left estimate, and totals `adminReceipts` spend. `reset` clears the usage log.
- **Map reverse-proxy** — requests to `/map`, `/_next/`, `/zitf-map/`, `/znps-api/` are forwarded to `znpsMapOrigin` (default `https://127.0.0.1:8081`, the separately-running ZNPCS national addressing app). This makes the map iframe **same-origin**, so it works on internal and external hosts without exposing port 8081. Booth-owned `/api/*` paths (including `/api/track` and the `/api/admin/*` prefix) are excluded from the proxy — see `BOOTH_API` / `BOOTH_API_PREFIXES`.

LiveAvatar note: a "Context" (persona built from `agentName`/`systemPrompt`/`greeting`) is created once and cached in-process; the server logs the new context id so you can paste it into `config.json` as `liveavatarContextId` to reuse it. Keys come from app.liveavatar.com/developers (HeyGen keys do **not** work). Sandbox mode is free but only renders the test avatar; live mode (`liveavatarSandbox:false`) bills ~2 credits/min and renders the real ZICTA presenter avatars.

### Frontend — the TideOS shell
No framework, no modules — files communicate through globals on `window`. Load order matters and is fixed in `index.html`: `data.js` → app builders → `os.js` → tweaks islands.

- `data.js` → `window.TIDE_DATA`: all display content (weather, photos, "did you know" facts, network operators, knowledge cards, quiz/game questions). **Edit content here, not in the app logic.**
- `os.js` → the shell core: boot screen, parallax ocean scene, clock, draggable widgets, and the **app launcher**. It owns a `builders` registry mapping an app name to its `window.build*` function, plus `window.openApp(name)` / `window.closeApp()`. Deep-link any app with `?app=<name>` (e.g. `?app=zictabot`).
- Each app is a function `window.build<Name>(app, ctx)` that renders into the passed element and returns `{ onClose }`. `ctx = { close, icons }`. The registry:
  | name | file | app |
  |------|------|-----|
  | `camera` | `camera.js` | Photo Booth — webcam, filters, optional MediaPipe selfie-segmentation backgrounds |
  | `quiz` | `quiz.js` | ZICTA Game Show (pick-a-box quiz) |
  | `knowledge` | `knowledge.js` | flip-card facts |
  | `ai` | `ai.js` | text chat → `/api/chat` |
  | `arcade` | `arcade.js` | mini-games |
  | `zictabot` | `zictabot.js` | live photoreal avatar via LiveAvatar SDK + `/api/la-token` |
  | `map` | `map.js` | iframe of the proxied `/map` |
- Shared globals from `os.js`: `window.TideIcons` (inline-SVG icon set) and `window.TideScore` (best-score store in `localStorage` key `tideos.scores.v1`; apps call `TideScore.record(key, pct)`, which updates the Leaderboard widget).
- Styling: `os.css` (shell) + `apps.css` (apps). Fonts: Sora + Manrope from Google Fonts.
- **Tweaks/Personalize panel** is the *only* React code (`tweaks-panel.jsx`, `tweaks.jsx`), loaded via in-browser Babel standalone (`<script type="text/babel">`) with React from a CDN. Everything else is vanilla.

### Standalone avatar pages (kiosk variants, not part of the shell)
- `embed.html` — LiveAvatar managed embed, vertical 9:16 (`/api/embed`).
- `avatar3d.html` — free **3D fallback** host using TalkingHead + Ready Player Me `.glb` files in `avatars/`; brain via `/api/chat`, lip-sync via `/api/tts`. Press **A** to cycle avatars.
- `admin.html` — password-gated **Stand Operations** dashboard at `/admin`: KPI cards, per-experience play charts, activity-over-time, live LiveAvatar credit gauge + interactions-left estimate, and a spend/receipts breakdown. Charts via Chart.js (CDN, degrades to tables offline). Login + receipts come from `config.json` (`adminEmail`/`adminPassword`/`adminReceipts`/`liveavatarCreditsStart`).
- `landing-old.html` — superseded landing page, kept for reference.

## Conventions

- This is a kiosk: code targets a single fullscreen touch display, assumes one user at a time (`openApp` no-ops if an app is already open), and honors `prefers-reduced-motion`.
- Heavy third-party libs (MediaPipe, face-api, LiveAvatar/LiveKit SDK, TalkingHead) are loaded **lazily from CDNs inside the app that needs them**, with graceful fallbacks when the network or a key is missing — preserve that pattern.
- Many commits verify UI changes with headless screenshots; visual polish and "works offline / works internal + external" are recurring goals.
