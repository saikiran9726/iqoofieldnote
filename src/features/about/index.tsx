import React from 'react';
import { ArrowLeft, ShieldCheck, Cpu, HardDrive, FileCode, CheckCircle2, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AboutScreen: React.FC = () => {
  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-2 pb-4 border-b border-border-default">
        <Link
          to="/more"
          className="p-1.5 rounded-lg bg-bg-surface1 border border-border-default text-text-muted hover:text-text-primary transition-colors"
          title="Return to More"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-heading-sm font-bold text-text-primary tracking-tight">
            About FieldNote
          </h1>
          <p className="text-metadata text-text-muted">
            Architecture, cryptographic specifications, and offline-first guarantees
          </p>
        </div>
      </div>

      {/* Hero Badge Card */}
      <div className="p-6 rounded-2xl bg-bg-surface1 border border-border-default space-y-3 text-center sm:text-left flex flex-col sm:flex-row items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-bg-surface2 border-2 border-semantic-green flex items-center justify-center text-semantic-green shrink-0 shadow-lg">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <h2 className="text-heading-md font-extrabold text-text-primary">
              FieldNote Progressive Web App
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-semantic-green-surface text-semantic-green-text border border-semantic-green-border">
              v0.1.0-release
            </span>
          </div>
          <p className="text-body-sm text-text-secondary leading-relaxed">
            High-contrast on-device field inspection intelligence, automated report compilation, punch-list extraction, and tamper-evident audit ledger.
          </p>
        </div>
      </div>

      {/* Specifications Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="p-4 rounded-xl bg-bg-surface1 border border-border-default space-y-2">
          <div className="flex items-center gap-2 text-semantic-green">
            <HardDrive className="w-4 h-4" />
            <h3 className="text-body-sm font-bold text-text-primary">Storage & Offline Engine</h3>
          </div>
          <p className="text-metadata text-text-muted leading-relaxed">
            Dexie IndexedDB local database with zero cloud telemetry. AES-GCM 256-bit storage encryption with PBKDF2 100,000-iteration key derivation.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-bg-surface1 border border-border-default space-y-2">
          <div className="flex items-center gap-2 text-semantic-amber">
            <Cpu className="w-4 h-4" />
            <h3 className="text-body-sm font-bold text-text-primary">On-Device Intelligence</h3>
          </div>
          <p className="text-metadata text-text-muted leading-relaxed">
            Powered by SimulatedEngine for field evaluation, code-mixed Telugu/English entity extraction, and instant confidence scoring.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-bg-surface1 border border-border-default space-y-2">
          <div className="flex items-center gap-2 text-semantic-blue">
            <Award className="w-4 h-4" />
            <h3 className="text-body-sm font-bold text-text-primary">Cryptographic Integrity</h3>
          </div>
          <p className="text-metadata text-text-muted leading-relaxed">
            SHA-256 immutable block-chained audit ledger for every report edit, field revision, and certified digital signature sign-off.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-bg-surface1 border border-border-default space-y-2">
          <div className="flex items-center gap-2 text-semantic-green">
            <FileCode className="w-4 h-4" />
            <h3 className="text-body-sm font-bold text-text-primary">Self-Hosted Typography</h3>
          </div>
          <p className="text-metadata text-text-muted leading-relaxed">
            Inter, JetBrains Mono, Noto Sans Telugu, and Noto Sans Devanagari self-hosted via @fontsource packages with zero CDN dependencies.
          </p>
        </div>
      </div>

      {/* Compliance & Standards */}
      <div className="p-5 rounded-2xl bg-bg-surface1 border border-border-default space-y-3">
        <h3 className="text-body-sm font-bold text-text-primary flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-semantic-green" />
          <span>System & Environmental Guarantees</span>
        </h3>
        <ul className="space-y-1.5 text-metadata text-text-secondary">
          <li>• <strong>Zero Network Exfiltration:</strong> Core capture, recording, processing, and PDF exports run 100% offline.</li>
          <li>• <strong>Daylight AA+ Contrast:</strong> High-ambient solar visibility palette designed for outdoor railway & substation fields.</li>
          <li>• <strong>PWA Standards:</strong> Service worker asset precaching, background sync queue, and Web Share Target compatibility.</li>
        </ul>
      </div>

      {/* Privacy Notice */}
      <div className="p-4 rounded-xl bg-semantic-amber-surface border border-semantic-amber-border flex items-start gap-3">
        <ShieldCheck className="w-4 h-4 text-semantic-amber shrink-0 mt-0.5" />
        <p className="text-metadata text-text-secondary leading-relaxed">
          <strong className="text-text-primary">Demo data only.</strong>{' '}
          Nothing leaves this device unless you turn on sync or share a report.
        </p>
      </div>
    </div>
  );
};
