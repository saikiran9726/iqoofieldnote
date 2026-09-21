# FieldNote — Phase Execution Log

## Phase 0: Project Scaffold, Shell, Tokens, and Offline PWA

### What Was Done
- **Master Spec & Rules Initialization**:
  - Saved UI/UX Master Specification to `docs/MASTER_SPEC.md`.
  - Created `docs/STANDING_RULES.md` with strict execution rules.
- **Scaffold & Build Setup**:
  - Configured Vite + React 18 + TypeScript + Tailwind CSS + Lucide Icons + Motion (Framer Motion) + Zustand + Dexie IndexedDB + React Router DOM + `vite-plugin-pwa`.
  - Fully wired `package.json` scripts: `dev`, `build`, `preview`, `typecheck`, `lint`, and `test:e2e`.
- **Offline Font Engine**:
  - Self-hosted fonts installed via `@fontsource` packages: `@fontsource/inter`, `@fontsource/jetbrains-mono`, `@fontsource/noto-sans-telugu`, and `@fontsource/noto-sans-devanagari`.
  - Verified 0 external font/CDN runtime requests.
- **Design Tokens & Daylight Palette**:
  - Created single source of truth in `src/design/tokens.ts` defining Dark theme (`#090B0D` base, `#111417` and `#181C20` elevated surfaces), Daylight high-contrast WCAG AA+ palette, semantic accents (green for active/CTA, amber for missing/review, red for critical), type scale (minimum body 14px, metadata minimum 12px), spacing, radii, and motion curves.
  - Connected Tailwind CSS variables with automatic dark/daylight theme switcher.
- **App Shell & Routing**:
  - Developed responsive `Layout` with TopBar, Desktop sidebar (>= 768px), and 4 bottom-nav items on mobile (< 768px): Capture, Reports, Tasks, More.
  - Built adaptive `OfflineBadge` driven by `navigator.onLine` and speech settings (displaying on-device core indicator or active online speech service).
  - Built `ThemeToggle` (Dark, Daylight, System) persisted across reloads and respecting `prefers-reduced-motion`.
  - Built high-craft `EmptyState` components with domain-appropriate voice and fully-wired actionable buttons (zero dead buttons).
  - Built feature module sub-routes: `/assets`, `/rollup`, `/privacy`, `/officekit`, `/export`, `/search`.
- **Offline PWA Manifest & Service Worker**:
  - Configured `vite-plugin-pwa` with precache glob rules matching all bundles and self-hosted fonts.
  - Generated PWA icons (`public/favicon.svg`, `public/icons/icon-192.png`, `public/icons/icon-512.png`).
  - Added `vercel.json` SPA routing rewrites and `no-cache` service worker headers.
- **Quality Verification**:
  - `npm run typecheck`: Passed (0 errors).
  - `npm run lint`: Passed (0 warnings, 0 errors).
  - `npm run build`: Passed (0 errors, 33 precached PWA entries).
  - `npm run test:e2e`: Passed — Automated Playwright runner verified all 10 mobile views at 390x844, all 10 desktop views at 1280x800, and Daylight theme mode. 21 screenshots captured and saved to `docs/screens/phase-0/` with 0 console errors.

### Assumptions Logged
1. Master Spec text was organized from all requirements and constraints into `docs/MASTER_SPEC.md` for consistent phase reference.
2. Fonts are bundled directly via `@fontsource/*` npm packages to satisfy Rule 6 (offline core, no external Google Fonts or runtime CDN requests).
3. Playwright Chromium browser is used to execute automated screen captures and console error assertions during `npm run test:e2e`.

### Known Gaps
- Subsequent phases (Phases 1-7) will implement the live on-device Whisper model transcription, Dexie database operational writes, PDF export binary compilation, and backend sync endpoints. Phase 0 provides the shell, state store, navigation, design tokens, and offline PWA foundation.
