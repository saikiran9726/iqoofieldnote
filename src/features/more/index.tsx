import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  Laptop,
  ShieldCheck,
  Layers,
  Info,
  Database,
  Search,
  Settings,
  ChevronRight,
  Sun,
  Moon,
  Globe2,
  Sparkles,
  RotateCcw,
  Check,
  Cpu,
} from 'lucide-react';
import { useSettingsStore } from '../../lib/stores';
import { useThemeStore } from '../../lib/theme';
import { resetDemoData } from '../../data/db';
import { useTranslation, type SupportedLanguage } from '../../lib/i18n';
import { Button } from '../../components';

export const MoreScreen: React.FC = () => {
  const { t, language } = useTranslation();
  const setPreferredLanguage = useSettingsStore((s) => s.setPreferredLanguage);
  const { resolvedTheme, toggleTheme } = useThemeStore();
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

  // Feature Modules (Every More entry opens a real screen per Phase 6 Spec)
  const moduleCards = [
    {
      to: '/rollup',
      title: t('weeklyRollup'),
      description: t('weeklyRollupDesc'),
      icon: Activity,
      badge: 'Manager',
    },
    {
      to: '/officekit',
      title: t('officeKit'),
      description: t('officeKitDesc'),
      icon: Laptop,
      badge: 'Bridge',
    },
    {
      to: '/privacy',
      title: t('privacyTrust'),
      description: t('privacyTrustDesc'),
      icon: ShieldCheck,
      badge: 'Trust',
    },
    {
      to: '/templates',
      title: t('templatesGlossary'),
      description: t('templatesGlossaryDesc'),
      icon: Layers,
      badge: 'Schemas',
    },
    {
      to: '/about',
      title: t('aboutApp'),
      description: t('aboutAppDesc'),
      icon: Info,
      badge: 'v0.1.0',
    },
    {
      to: '/assets',
      title: 'Asset Inventory & Timeline',
      description: 'Equipment tags, QR telemetry, maintenance logs & PANEL-204 history',
      icon: Database,
      badge: 'Assets',
    },
    {
      to: '/search',
      title: 'Ask Your Reports & Search',
      description: 'Zero-latency on-device query parser across field notes & findings',
      icon: Search,
      badge: 'Local DB',
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
          Specialized offline tools for manager rollup, OfficeKit bridge, security vault, and templates
        </p>
      </div>

      {/* Grid of Feature Cards (Every card links to a real screen) */}
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

      {/* Settings, Language, Theme & Demo Controls */}
      <div className="p-5 rounded-2xl bg-bg-surface1 border border-border-default space-y-5 transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-semantic-green" />
            <h2 className="text-body-md font-bold text-text-primary">
              System Settings & Intelligence Controls
            </h2>
          </div>

          <Button
            size="sm"
            variant="secondary"
            icon={Sparkles}
            onClick={handleLaunchTour}
          >
            {t('demoTour')}
          </Button>
        </div>

        {/* Setting 1: Language & Field Script (Spec 6) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-bg-surface2/60 border border-border-subtle">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-semantic-blue" />
              <span className="text-body-sm font-semibold text-text-primary">
                {t('languageSetting')}
              </span>
            </div>
            <p className="text-metadata text-text-muted">
              Self-hosted fonts for Latin (Inter), Telugu (తెలుగు - Noto Sans), and Hindi (हिन्दी - Devanagari).
            </p>
          </div>

          <select
            value={language}
            onChange={(e) => setPreferredLanguage(e.target.value as SupportedLanguage)}
            className="px-3 py-1.5 rounded-lg bg-bg-surface1 border border-border-default text-text-primary text-metadata font-medium focus:outline-none focus:border-semantic-green shrink-0"
          >
            <option value="en-US">English (Latin)</option>
            <option value="te-IN">Telugu (తెలుగు)</option>
            <option value="hi-IN">Hindi (हिन्दी)</option>
          </select>
        </div>

        {/* Setting 2: Display Theme Toggle (Dark vs. Daylight) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-bg-surface2/60 border border-border-subtle">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              {resolvedTheme === 'daylight' ? (
                <Sun className="w-4 h-4 text-semantic-amber" />
              ) : (
                <Moon className="w-4 h-4 text-text-muted" />
              )}
              <span className="text-body-sm font-semibold text-text-primary">
                {t('themeSetting')}
              </span>
            </div>
            <p className="text-metadata text-text-muted">
              High-contrast Daylight Mode (AA+ solar visibility) vs. Dark Mode.
            </p>
          </div>

          <Button
            size="sm"
            variant="secondary"
            icon={resolvedTheme === 'daylight' ? Sun : Moon}
            onClick={toggleTheme}
          >
            {resolvedTheme === 'daylight' ? t('daylightMode') : t('darkMode')}
          </Button>
        </div>

        {/* Setting 3: Reset Demo Database */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-bg-surface2/60 border border-border-subtle">
          <div className="space-y-0.5 max-w-lg">
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-semantic-amber" />
              <span className="text-body-sm font-semibold text-text-primary">
                Reset Demo Database
              </span>
            </div>
            <p className="text-metadata text-text-muted leading-relaxed">
              Restore all IndexedDB tables (12 weekly field reports, PANEL-204 records, and punch lists) to default seed values.
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
