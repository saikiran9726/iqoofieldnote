# FieldNote — UI/UX Master Specification

FieldNote is an offline-first, on-device intelligence Progressive Web Application designed for rapid field data capture, voice-driven reporting, task extraction, asset management, and offline document generation in industrial, agricultural, inspection, and field engineering environments.

---

## 1. Product Principles & Architecture
- **Offline Core**: Zero runtime network dependencies for core workflows (capture, voice transcription, entity extraction, editing, searching, report generation, and PDF export).
- **High-Contrast Design System**:
  - Dark mode (`#090B0D` base, `#111417` / `#181C20` elevated surfaces) for battery conservation and low-light environments.
  - Daylight mode (high-contrast ambient illumination palette meeting WCAG AA+ contrast) for direct sunlight readability.
- **On-Device Engine**: Local ML execution via WebGPU with fallback to WebAssembly (WASM). No browser access to proprietary NPUs is claimed; execution is honest and transparent.
- **Multilingual Support**: Latin script + Indian languages (Telugu, Devanagari/Hindi) with self-hosted fonts (`@fontsource`) and canvas-based rasterization for accurate PDF script shaping.
- **Strict Privacy**: Audio and captured images are stored locally in IndexedDB (Dexie) and never dispatched to external cloud servers without explicit user-initiated sharing.

---

## 2. Navigation & App Shell
The application shell features a top bar with contextual title and adaptive offline/status badge, alongside a fixed 4-tab primary navigation bar:
1. **Capture**: Central hub for audio recordings, quick notes, camera captures, and sensor logs.
2. **Reports**: Formatted inspection records, site logs, structured summaries, and exportable dossiers.
3. **Tasks**: Extracted action items, punch lists, severity-tagged follow-ups, and assignment statuses.
4. **More**: Assets catalog, Rollup dashboard, Privacy vault & locks, OfficeKit document generators, Settings, and System Diagnostics.

### Safe Areas & Layout
- Mobile viewport: 390x844 with safe-area insets (`env(safe-area-inset-top)`, `env(safe-area-inset-bottom)`).
- Tablet & Desktop: Responsive split-pane or sidebar adaptation at 1280x800 and above.

---

## 3. Design Tokens & Visual Hierarchy
- **Palette**:
  - Dark Background: `#090B0D`
  - Dark Surface 1: `#111417`
  - Dark Surface 2: `#181C20`
  - Dark Border: `#282F36`
  - Daylight Background: `#F5F7FA`
  - Daylight Surface 1: `#FFFFFF`
  - Daylight Surface 2: `#E8ECF1`
  - Daylight Border: `#CBD5E1`
- **Semantic Accents**:
  - Green (Active / Verified / CTA / Normal): `#10B981` (Dark) / `#059669` (Daylight)
  - Amber (Review Required / Pending / Missing): `#F59E0B` (Dark) / `#D97706` (Daylight)
  - Red (Critical / High Priority / Destructive): `#EF4444` (Dark) / `#DC2626` (Daylight)
- **Typography Scale**:
  - Primary UI Font: Inter
  - Monospace / Metadata / Code: JetBrains Mono
  - Indic Scripts: Noto Sans Telugu, Noto Sans Devanagari
  - Body Text: Minimum 14px (accessible field readability)
  - Metadata / Captions: Minimum 12px
- **Motion & Transitions**:
  - Micro-durations: 150ms – 300ms
  - Easing: standard ease-out / cubic-bezier curves
  - Full adherence to `prefers-reduced-motion`

---

## 4. Key Feature Modules

### 4.1. Capture
- Multi-modal recording: voice memo, quick text, photo capture with geolocation/timestamp tags.
- Voice transcription options:
  - Local on-device model (Whisper/WASM/WebGPU).
  - Optional Web Speech API (clearly labelled "Online speech (uses your browser's speech service)").
- Volume-button trigger setting with transparent browser limitation disclosures.

### 4.2. Reports & Entities
- Automated parsing of unstructured voice transcripts into structured fields (Date, Location, Personnel, Findings, Hazards, Equipment, Actions).
- Editable field tables with validation and status indicators.
- Offline PDF and markdown generation.

### 4.3. Tasks & Action Items
- Automated extraction from transcripts and notes.
- Priority tiers (Critical, High, Medium, Low), deadlines, assignees, and checklist toggles.

### 4.4. Assets & Inventory
- Asset tracking by ID, QR code, equipment status, inspection history, and geo-coordinates.

### 4.5. Rollup & Analytics
- Aggregate site telemetry, recurring issue counts, time-series inspection completion rates.

### 4.6. Privacy & Security
- On-device cryptographic vaulting, WebAuthn biometric unlock with graceful fallback, and instant emergency wipe.

### 4.7. OfficeKit & Export
- Local PDF generation with canvas-rasterized Indic text and pure-vector Latin text, JSON/CSV exports, and zipped media packages.

---

## 5. Offline PWA & Service Worker
- Complete pre-caching of all static bundles, icons, and `@fontsource` font packages via `vite-plugin-pwa`.
- Web Share Target compatibility for installed PWA environments.
