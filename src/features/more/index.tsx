import React, { useState } from 'react';
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
  Sparkles,
  RotateCcw,
  Check,
} from 'lucide-react';
import { useSettingsStore } from '../../lib/stores';
import { resetDemoData } from '../../data/db';
import { Button } from '../../components';

export const MoreScreen: React.FC = () => {
  const {
    settings,
    setPreferredLanguage,
  } = useSettingsStore();

  const [resetSuccess, setResetSuccess] = useState<boolean>(false);

  const handleResetData = async () => {
    await resetDemoData();
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 3000);
  };

  const handleLaunchTour = () => {
    const btn = document.getElementById('demo-tour-toggle');
    if (btn) btn.click();
  };

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
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Overview section */}
      <div>
        <h1 className="text-heading-sm font-bold text-text-primary">
          Field Intelligence Modules
        </h1>
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
        <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-semantic-green" />
            <h2 className="text-body-md font-bold text-text-primary">
              Settings & Intelligence Engine
            </h2>
          </div>

          <Button
            size="sm"
            variant="secondary"
            icon={Sparkles}
            onClick={handleLaunchTour}
          >
            Launch Demo Tour
          </Button>
        </div>

        {/* Setting: Engine Mode (Disabled per Phase 4.5 honesty) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-bg-surface2/60 border border-border-subtle">
          <div className="space-y-0.5 max-w-lg">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-semantic-amber" />
              <span className="text-body-sm font-semibold text-text-primary">
                Intelligence Engine
              </span>
            </div>
            <p className="text-metadata text-text-muted leading-relaxed">
              Currently running SimulatedEngine for on-device testing and field demonstrations.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              disabled
              className="px-3 py-1.5 rounded-lg text-metadata-xs font-mono font-bold border bg-bg-surface2 text-text-muted border-border-subtle cursor-not-allowed opacity-80"
              title="On-device engine: coming in a later build"
            >
              On-device engine: coming in a later build
            </button>
          </div>
        </div>

        {/* Setting: Reset Demo Database */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-bg-surface2/60 border border-border-subtle">
          <div className="space-y-0.5 max-w-lg">
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-semantic-amber" />
              <span className="text-body-sm font-semibold text-text-primary">
                Reset Demo Database
              </span>
            </div>
            <p className="text-metadata text-text-muted leading-relaxed">
              Restore all IndexedDB tables (11 field reports, PANEL-204 asset records, and punch lists) to default seed values.
            </p>
          </div>

          <Button
            size="sm"
            variant="secondary"
            icon={resetSuccess ? Check : RotateCcw}
            onClick={handleResetData}
          >
            {resetSuccess ? 'Data Reset Complete' : 'Reset Demo Data'}
          </Button>
        </div>

        {/* Setting 1: Speech Service (Disabled per Phase 4.5 truthfulness) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-bg-surface2/60 border border-border-subtle">
          <div className="space-y-0.5 max-w-lg">
            <div className="flex items-center gap-2">
              <CloudLightning className="w-4 h-4 text-text-muted" />
              <label htmlFor="online-speech-toggle" className="text-body-sm font-semibold text-text-secondary cursor-not-allowed">
                Online Speech
              </label>
            </div>
            <p className="text-metadata text-semantic-amber-text font-medium leading-relaxed">
              Online speech isn't wired up in this build.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-not-allowed shrink-0">
            <input
              id="online-speech-toggle"
              type="checkbox"
              disabled
              checked={false}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-border-strong rounded-full opacity-40 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5"></div>
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
            value={settings.preferredLanguage}
            onChange={(e) => setPreferredLanguage(e.target.value as 'en-US' | 'te-IN' | 'hi-IN')}
            className="px-3 py-1.5 rounded-lg bg-bg-surface1 border border-border-default text-text-primary text-metadata font-medium focus:outline-none focus:border-semantic-green"
          >
            <option value="en-US">English (Latin)</option>
            <option value="te-IN">Telugu (తెలుగు)</option>
            <option value="hi-IN">Hindi (हिन्दी)</option>
          </select>
        </div>

        {/* Setting 3: Hardware volume button trigger (Disabled per Phase 4.5 truthfulness) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-bg-surface2/60 border border-border-subtle">
          <div className="space-y-0.5 max-w-lg">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-text-muted" />
              <label htmlFor="volume-trigger-toggle" className="text-body-sm font-semibold text-text-secondary cursor-not-allowed">
                Hardware Volume-Button Trigger
              </label>
            </div>
            <p className="text-metadata text-semantic-amber-text font-medium leading-relaxed">
              Hardware volume trigger isn't wired up in this build.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-not-allowed shrink-0">
            <input
              id="volume-trigger-toggle"
              type="checkbox"
              disabled
              checked={false}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-border-strong rounded-full opacity-40 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5"></div>
          </label>
        </div>

        {/* Transparency note: Simulated Engine notice */}
        <div className="p-3 rounded-xl bg-bg-surface2/40 border border-border-subtle flex items-start gap-2.5">
          <Cpu className="w-4 h-4 text-text-muted mt-0.5 shrink-0" />
          <div className="text-metadata text-text-muted leading-relaxed">
            <strong className="text-text-secondary">Simulated Engine:</strong> Speech transcription, entity extraction, and confidence scores are currently simulated on-device using sample field recordings and seed templates.
          </div>
        </div>
      </div>
    </div>
  );
};
