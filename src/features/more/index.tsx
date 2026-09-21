import React from 'react';
import { Link } from 'react-router-dom';
import {
  Database,
  Activity,
  ShieldCheck,
  FileSpreadsheet,
  Download,
  Search,
  Settings,
  ChevronRight,
  CloudLightning,
  Volume2,
  Cpu,
  Globe2,
} from 'lucide-react';
import { useSettingsStore } from '../../lib/settings';

export const MoreScreen: React.FC = () => {
  const { speech, setUseOnlineSpeech, setLanguage, setVolumeButtonTrigger } = useSettingsStore();

  const moduleCards = [
    {
      to: '/assets',
      title: 'Asset Inventory',
      description: 'Equipment tags, QR codes, maintenance timelines & geo-locations',
      icon: Database,
      badge: 'Local DB',
    },
    {
      to: '/rollup',
      title: 'Site Rollup & Telemetry',
      description: 'Cross-site aggregate metrics, hazard frequency & audit rates',
      icon: Activity,
      badge: 'Analytics',
    },
    {
      to: '/privacy',
      title: 'Privacy & Cryptographic Vault',
      description: 'WebAuthn biometric access, zero-cloud storage & emergency purge',
      icon: ShieldCheck,
      badge: 'Encrypted',
    },
    {
      to: '/officekit',
      title: 'OfficeKit Documents',
      description: 'Canvas-rasterized Indian script PDF export & document compiler',
      icon: FileSpreadsheet,
      badge: 'Offline PDF',
    },
    {
      to: '/export',
      title: 'Dossier Backup & Export',
      description: 'Package notes, media, and CSV/JSON datasets into offline archives',
      icon: Download,
      badge: 'ZIP/CSV',
    },
    {
      to: '/search',
      title: 'Local Full-Text Search',
      description: 'Zero-latency indexing across all local field notes & transcripts',
      icon: Search,
      badge: 'IndexedDB',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Overview section */}
      <div>
        <h2 className="text-heading-sm font-bold text-text-primary">
          Field Intelligence Modules
        </h2>
        <p className="text-metadata text-text-muted mt-0.5">
          Specialized offline tools for assets, reporting, security, and exports
        </p>
      </div>

      {/* Grid of Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {moduleCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.to}
              to={card.to}
              className="p-4 rounded-xl bg-bg-surface1 border border-border-default hover:border-border-strong hover:bg-bg-surface2/60 transition-all flex items-start justify-between gap-3 group"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-bg-surface2 border border-border-subtle flex items-center justify-center text-semantic-green shrink-0 group-hover:scale-105 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-body-sm font-bold text-text-primary truncate">
                      {card.title}
                    </h3>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-medium bg-bg-surface2 text-text-muted border border-border-subtle">
                      {card.badge}
                    </span>
                  </div>
                  <p className="text-metadata text-text-secondary mt-1 leading-snug">
                    {card.description}
                  </p>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-text-primary group-hover:translate-x-0.5 transition-all shrink-0 mt-2" />
            </Link>
          );
        })}
      </div>

      {/* Settings & System Transparency */}
      <div className="p-5 rounded-2xl bg-bg-surface1 border border-border-default space-y-5 transition-colors">
        <div className="flex items-center gap-2 pb-3 border-b border-border-subtle">
          <Settings className="w-4 h-4 text-semantic-green" />
          <h3 className="text-body-md font-bold text-text-primary">
            Settings & System Constraints
          </h3>
        </div>

        {/* Setting 1: Speech Service (Honest Web Speech API notice per Rule 7a) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-bg-surface2/60 border border-border-subtle">
          <div className="space-y-0.5 max-w-lg">
            <div className="flex items-center gap-2">
              <CloudLightning className="w-4 h-4 text-semantic-amber" />
              <label htmlFor="online-speech-toggle" className="text-body-sm font-semibold text-text-primary cursor-pointer">
                Online Speech (uses your browser's speech service)
              </label>
            </div>
            <p className="text-metadata text-text-muted leading-relaxed">
              Default is OFF for 100% on-device privacy. When enabled, speech audio is processed via your browser vendor's cloud service and the status badge updates accordingly.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              id="online-speech-toggle"
              type="checkbox"
              checked={speech.useOnlineSpeech}
              onChange={(e) => setUseOnlineSpeech(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-border-strong peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-semantic-green"></div>
          </label>
        </div>

        {/* Setting 2: Preferred Language */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-bg-surface2/60 border border-border-subtle">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-semantic-blue" />
              <span className="text-body-sm font-semibold text-text-primary">
                Field Script / Language
              </span>
            </div>
            <p className="text-metadata text-text-muted">
              Self-hosted local fonts for Latin, Telugu (తెలుగు), and Hindi (हिन्दी).
            </p>
          </div>

          <select
            value={speech.preferredLanguage}
            onChange={(e) => setLanguage(e.target.value as 'en-US' | 'te-IN' | 'hi-IN')}
            className="px-3 py-1.5 rounded-lg bg-bg-surface1 border border-border-default text-text-primary text-metadata font-medium focus:outline-none focus:border-semantic-green"
          >
            <option value="en-US">English (Latin)</option>
            <option value="te-IN">Telugu (తెలుగు)</option>
            <option value="hi-IN">Hindi (हिन्दी)</option>
          </select>
        </div>

        {/* Setting 3: Hardware volume button trigger notice per Rule 7c */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-bg-surface2/60 border border-border-subtle">
          <div className="space-y-0.5 max-w-lg">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-text-secondary" />
              <label htmlFor="volume-trigger-toggle" className="text-body-sm font-semibold text-text-primary cursor-pointer">
                Hardware Volume-Button Trigger
              </label>
            </div>
            <p className="text-metadata text-text-muted leading-relaxed">
              <strong>Browser Limitation Note:</strong> Standard web browsers cannot intercept hardware volume keys while backgrounded or locked due to OS sandboxing. This setting enables keydown listening when the PWA is active and in foreground.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              id="volume-trigger-toggle"
              type="checkbox"
              checked={speech.volumeButtonTrigger}
              onChange={(e) => setVolumeButtonTrigger(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-border-strong peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-semantic-green"></div>
          </label>
        </div>

        {/* Transparency note: WebGPU/WASM Engine per Rule 7f */}
        <div className="p-3 rounded-xl bg-bg-surface2/40 border border-border-subtle flex items-start gap-2.5">
          <Cpu className="w-4 h-4 text-text-muted mt-0.5 shrink-0" />
          <div className="text-metadata text-text-muted leading-relaxed">
            <strong className="text-text-secondary">On-Device Compute Notice (Rule 7f):</strong> Web browsers run on-device machine learning through <strong>WebGPU</strong> or <strong>WASM SIMD</strong> runtimes. Web applications cannot directly address mobile NPU silicon. FieldNote runs 100% locally on standard web graphics and CPU pipelines.
          </div>
        </div>
      </div>
    </div>
  );
};
