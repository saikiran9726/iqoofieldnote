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
- None.

---

## Phase 1: Data Architecture, Seed Data, Intelligence Engine, and Component Kit

### What Was Done
- **Types & IndexedDB Architecture**:
  - Defined strict TypeScript entities in `src/shared/types.ts`: `Report`, `Finding`, `Action`, `Evidence`, `Asset`, `Site`, `Transcript`, `TranscriptSegment`, `EditHistoryEntry`, `Template`, `GlossaryEntry`, `SyncOutboxItem`, and `AppSettings`.
  - Upgraded Dexie database schema in `src/data/db.ts` to Version 2 with complete table indexes, foreign keys, and automatic initialization on empty databases.
  - Implemented `resetDemoData()` to reset all local Dexie stores to seed state.
- **Seed Data (Section 8 Spec)**:
  - Created 11 realistic field reports across Kukatpally Metro Site, Miyapur Depot, and Gachibowli dated 12–18 Sep 2026.
  - Built Hero report: Electrical Inspection on 18 Sep 2026 11:42 AM with 3 loose connections (occurrences = 3), 1 damaged cable insulation, `HIGH` priority with reason line, 2 action tasks with 19 Sep morning deadlines, and initially missing Panel ID.
  - Built `PANEL-204` asset tracking record linked with 4 reports and a recurring loose-connection issue counter (3 occurrences).
  - Built code-mixed Telugu + English transcript (`tr-hero-001`) with exact character and millisecond time offsets.
- **On-Device Intelligence Engine**:
  - Defined `ReportEngine` async interface (`transcribe`, `extract`, `verify`, `buildReport`) with structured progress callbacks (`EngineStage`, `EngineProgressEvent`).
  - Implemented `SimulatedEngine` driven by seed data with realistic staggered delays and instant mode for unit tests.
  - Displayed honest "Simulated engine" badge in `TopBar` when in Demo Mode.
- **Tamper-Evident SHA-256 Hash Chain**:
  - Built `src/lib/hashChain.ts` using Web Crypto `SubtleCrypto` computing `hash = SHA256(prevHash + canonicalJson(entry))`.
  - Implemented `verifyChain()` with comprehensive unit tests for valid chains, tampered entry values, and corrupted previous hash links.
- **Zustand Thin Stores**:
  - Implemented `useSettingsStore`, `useCaptureStore`, `useReportsStore`, and `useTasksStore` maintaining Dexie as single source of truth.
- **Complete Typed Component Library (Section 10 Spec)**:
  - Built and styled 27 typed components meeting all accessibility criteria: `Button`, `IconButton`, `PriorityBadge`, `ConfidenceBadge`, `StatusIndicator`, `LanguageChip`, `FilterChip`, `SearchBar`, `BottomSheet`, `RecordingWaveform`, `ProcessingTimeline`, `ReportCard`, `FindingCard`, `ActionCard`, `AssetCard`, `TaskCard`, `EvidenceCard`, `QuestionCard`, `TranscriptDrawer`, `ReportField`, `SignaturePad`, `PhotoGrid`, `ExportSheet`, `ErrorState`, `EmptyState`, `TopBar`, and `BottomNavigation`.
  - Enforced accessibility rules: status never relies on colour alone (every badge includes explicit icon shape + text like `HIGH`, `REVIEW`, `MISSING`, `VERIFIED`); all icon buttons include `aria-label`; minimum 48dp/56dp touch targets.
- **Component Kit Playground (`/kit`)**:
  - Created interactive route `/kit` presenting every component in all operational states across Dark and Daylight themes.
- **Testing & Verification**:
  - Added Vitest unit test suite (`src/lib/hashChain.test.ts`, `src/engine/engine.test.ts`, `src/data/seed.test.ts`) — 10/10 tests passed.
  - `npm run typecheck`: Passed (0 errors).
  - `npm run lint`: Passed (0 errors, 0 warnings).
  - `npm run build`: Passed (0 errors, 33 precached PWA entries).
  - `npm run test:e2e`: Passed — Verified all 11 routes on mobile (390x844), desktop (1280x800), and Daylight theme. 24 screenshots saved to `docs/screens/phase-1/` with 0 console errors.

### Assumptions Logged
1. Canonical JSON formatting sorts top-level and nested keys alphabetically to ensure deterministic cryptographic hash generation across environments.
2. Web Crypto `globalThis.crypto.subtle` is utilized directly for SHA-256 computation to avoid external node polyfills and browser build externalization warnings.
3. Seed data initializes automatically on first app load and persists in IndexedDB across reloads, with a user-triggered `resetDemoData()` option available.

### Known Gaps
- None for Phase 1. Subsequent phases will integrate live WebAssembly/WebGPU Whisper transcription and PDF generation.
