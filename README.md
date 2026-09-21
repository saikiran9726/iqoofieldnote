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
# Type check and build production bundle
npm run build

# Preview production build locally with service worker
npm run preview
```

### Quality & Test Suite
```bash
# Unit test suite (vitest)
npm test

# Typecheck (tsc --noEmit)
npm run typecheck

# Lint (zero warnings allowed)
npm run lint

# Offline Playwright E2E verification & screenshot generation
npm run test:e2e
```

---

## Deploy

### Static / SPA Hosting
FieldNote is a 100% client-side Progressive Web Application and can be hosted on any static web host, CDN, or object storage (Vercel, Cloudflare Pages, Netlify, GitHub Pages, AWS S3/CloudFront).

- **Vercel**: `vercel.json` handles SPA rewrites, `no-cache` for service workers, and `immutable` long-cache for hashed assets.
- **Netlify**: `netlify.toml` provides the same SPA redirect and cache header rules. `public/_redirects` is the belt-and-suspenders fallback also honoured by Cloudflare Pages.
- **Other static hosts**: Serve `/dist` from the root. Configure your host to return `index.html` for any path that is not a real file (SPA fallback).

### Backend / Sync (Optional)
The app runs fully without a backend. If you deploy the optional Phase 7 sync API:

1. Copy `.env.example` → `.env.local` (never commit `.env.local`).
2. Fill in `MONGODB_URI`, `JWT_SECRET`, and `ALLOWED_ORIGIN`.
3. Set these three env vars in your Vercel / Netlify project dashboard.
4. If `MONGODB_URI` is absent, every `/api` endpoint returns `503 { code: "SYNC_NOT_CONFIGURED" }` and the UI displays "Sync isn't configured in this deployment." The rest of the app works normally.

---

## Demo Mode

FieldNote includes an offline-first **9-Step Demo Mode** that allows end-to-end evaluation of all field capture and reporting workflows with zero external network, microphone, or model dependencies:

### How to Trigger Demo Mode
1. **Long-Press TopBar Logo**: Press and hold the `FIELDNOTE` logo or title in the top navigation bar for **500ms** (provides haptic feedback).
2. **Demo Tour HUD**: Click the green **"DEMO TOUR"** floating trigger in the bottom right of the screen.
3. **Settings Toggle**: Go to **More** (`/more`) &rarr; click **"Launch Demo Tour"** or toggle **"Simulated Engine"**.

### The 9-Step Scripted Tour
1. **Capture Home (`/capture`)**: Central dominant mic button with offline badge and Daylight mode quick-toggle.
2. **Live Audio Recording**: Real frequency analyzer waveform, noise meter, and simulated Telugu + English code-mixed transcript stream.
3. **Staggered Processing Pipeline**: 4-stage pipeline animation (*Listening* &rarr; *Extracting* &rarr; *Verifying* &rarr; *Building Report*).
4. **Structured Report Editor (`/reports/rep-hero-001`)**: Auto-compiled field dossier with confidence breakdown bars (Category 97%, Findings 94%, Deadline 81%) and inline tap-to-edit with undo history.
5. **Missing Entity Resolution (`QuestionCard`)**: Sliding amber prompt resolving missing Panel ID to `PANEL-204` (sets field amber &rarr; green).
6. **Photographic Evidence & Inspector Seal**: Attached photo evidence and cryptographic sign-off seal.
7. **Real On-Device PDF Export**: Generates an authentic PDF report with pure vector Latin text, canvas-rasterized Telugu font ligature shaping, and SHA-256 seal.
8. **Tasks & Action Items (`/tasks`)**: Extracted remediation punch list organized into OPEN and COMPLETED groups with reminder notifications.
9. **PANEL-204 Asset History (`/assets/PANEL-204`)**: Equipment dossier tracking 4 linked reports and a 3x recurring loose connection hazard timeline.

### Reset Demo Data
- Click **"Reset Data"** in the Demo Tour panel or **"Reset Demo Data"** in Reports / More settings to restore all IndexedDB tables (11 field reports, PANEL-204 asset records, and punch lists) to initial seed values.

---

## Real vs Simulated Breakdown

In strict compliance with standing rules and system transparency:

| Feature / Subsystem | Implementation Status | Technical Details |
| :--- | :--- | :--- |
| **Speech Transcription** | **Simulated** | `SimulatedEngine` streams pre-authored Telugu + English code-mixed transcript tokens with realistic jitter and audio-length pacing. Real audio is recorded and saved to IndexedDB. |
| **Field Extraction & Confidence** | **Simulated** | Category extraction, severity mapping, action generation, and confidence percentages (97%, 94%, 81%) are generated via `SimulatedEngine`. |
| **On-Device ML Engine** | **Roadmap (Coming Soon)** | Only `SimulatedEngine` exists in this build. True on-device ML execution (e.g. WebGPU/WASM) is planned for a future release; the UI displays "Simulated engine" on all screen sizes. |
| **Offline Core & DB** | **Real** | IndexedDB storage powered by Dexie.js. Zero runtime network dependencies. |
| **On-Device PDF Export** | **Real** | Generated entirely client-side via `jsPDF`. Pure vector Latin text + high-DPI canvas-rasterized Indic text (`Noto Sans Telugu` / `Noto Sans Devanagari`) for accurate complex script ligature shaping. |
| **Multi-Sheet Excel (.xlsx)** | **Real** | Generated on-device via `xlsx` (SheetJS) with Summary, Findings, Actions, and Audit Trail sheets. |
| **CSV, JSON, Plain Text Exports** | **Real** | Real on-device blob generators with Web Share API and download fallbacks. |
| **Cryptographic SHA-256 Hash Chain** | **Real** | Tamper-evident ledger computed via Web Crypto `SubtleCrypto` (`hash = SHA256(prevHash + canonicalJson)`). Detects field mutations and marks audit blocks. |
| **Audio Recorder & Waveform** | **Real** | `navigator.mediaDevices.getUserMedia` + `MediaRecorder` + `AudioContext` `AnalyserNode` with live frequency analysis and RMS noise floor classification. |
| **Notification API Reminders** | **Real** | Native browser `Notification` API with permission handling and graceful in-app alert fallback. |
| **Design Tokens & Daylight Mode** | **Real** | Strict token system in `src/design/tokens.ts` with CSS variables. High-contrast WCAG AA+ daylight palette. |
| **PWA & Offline Precaching** | **Real** | Full asset precaching via `vite-plugin-pwa` (Workbox) including self-hosted fonts. |
| **Self-Hosted Typography** | **Real** | `@fontsource` packages for Inter, JetBrains Mono, Noto Sans Telugu, and Noto Sans Devanagari. Zero external font downloads. |
| **Web Speech API** | **Not Wired Up** | Disabled with an honest explanation note in Settings. `OfflineBadge` indicates offline simulated status. |
| **Hardware Volume Trigger** | **Not Wired Up** | Disabled with an honest explanation note in Settings due to browser background key capture limitations. |
| **Biometric App Lock** | **Simulated** | Clearly labelled as a simulated toggle in Privacy settings; does not claim WebAuthn or `navigator.credentials` hardware verification. |
