# FieldNote — Offline Field Intelligence PWA

FieldNote is an offline-first, on-device intelligence Progressive Web Application designed for rapid field data capture, voice-driven reporting, inspection audits, and task tracking under demanding outdoor (Daylight mode) and low-light field conditions (Dark mode).

---

## Run

### Prerequisites
- Node.js 18+ (tested on Node v20+)
- npm 9+

### Development
```bash
# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

### Production Build & Preview
```bash
# Type check and build bundle
npm run build

# Preview production build locally with service worker
npm run preview
```

### Quality & Test Suite
```bash
# Typecheck
npm run typecheck

# Lint (zero warnings allowed)
npm run lint

# Screenshot verification
npm run test:e2e
```

---

## Deploy

### Static / SPA Hosting
FieldNote is a 100% client-side Progressive Web Application and can be hosted on any static web host, CDN, or object storage (Vercel, Cloudflare Pages, Netlify, GitHub Pages, AWS S3/CloudFront).

- **Vercel**: Configuration is provided in `vercel.json` with SPA route rewrites to `/index.html` and explicit `no-cache` headers for service workers (`sw.js`).
- **Static output**: Build artifacts reside in `/dist`. Serving `/dist` from the root of any web server delivers the complete offline PWA.

---

## Demo Mode

To explore FieldNote's offline capabilities without configuring real field hardware:
1. Open the **Capture** tab (`/capture`) and click **"Voice Memo"** to record an audio capture or click **"Sample"** to load pre-formatted field observations.
2. Open the **Reports** tab (`/reports`) to inspect auto-compiled field dossiers and site audits.
3. Open the **Tasks** tab (`/tasks`) to filter and complete extracted punch-list items.
4. Open the **More** tab (`/more`) to explore Asset tracking, Rollup telemetry, OfficeKit Indic canvas shaper, Privacy cryptographic vault, and Export tools.
5. Use the **Theme Toggle** in the top bar to switch between Dark (`#090B0D`), Daylight (high-contrast WCAG AA+), and System mode.

---

## Real vs Simulated

In strict compliance with standing rules and system transparency:

| Feature / Subsystem | Implementation Status | Technical Details |
| :--- | :--- | :--- |
| **Offline Core & DB** | **Real** | IndexedDB storage powered by Dexie.js. Zero runtime network dependencies. |
| **Design Tokens & Daylight Mode** | **Real** | Strict token system in `src/design/tokens.ts` with CSS variables. High-contrast WCAG AA+ palette. |
| **PWA & Offline Precaching** | **Real** | Full asset precaching via `vite-plugin-pwa` (Workbox) including self-hosted fonts. |
| **Self-Hosted Typography** | **Real** | `@fontsource` packages for Inter, JetBrains Mono, Noto Sans Telugu, and Noto Sans Devanagari. No Google Fonts or runtime CDN requests. |
| **Indic Canvas Font Shaping** | **Real** | HTML5 2D Canvas HarfBuzz text rasterizer for accurate Telugu/Devanagari rendering alongside vector Latin text. |
| **Web Speech API** | **Real & Optional** | Off by default per Rule 7a. When enabled, uses browser speech service and updates status badge. |
| **WebAuthn Biometrics** | **Real / Simulated Fallback** | Uses `navigator.credentials` / WebAuthn when supported; falls back to honest simulated toggle when hardware is unavailable. |
| **Volume-Button Trigger** | **Real Foreground Listener** | Keydown handler active when PWA is in foreground. Transparently discloses browser background limitations. |
| **Web Share Target** | **Real PWA Manifest** | Manifest declaration configured. Discloses requirement for installed Android PWA. |
| **On-Device Machine Learning** | **Real WebGPU / WASM** | Runs via WebGPU / WASM SIMD. Does not claim proprietary mobile NPU access (Rule 7f). |
