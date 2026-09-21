import React, { useState } from 'react';
import {
  Button,
  IconButton,
  PriorityBadge,
  ConfidenceBadge,
  StatusIndicator,
  LanguageChip,
  FilterChip,
  SearchBar,
  BottomSheet,
  RecordingWaveform,
  ProcessingTimeline,
  ReportCard,
  FindingCard,
  ActionCard,
  AssetCard,
  EvidenceCard,
  QuestionCard,
  TranscriptDrawer,
  ReportField,
  SignaturePad,
  PhotoGrid,
  ExportSheet,
  ErrorState,
  EmptyState,
  ThemeToggle,
  OfflineBadge,
} from '../../components';
import {
  Mic,
  Camera,
  Download,
  Trash2,
  Sparkles,
  Plus,
  RotateCcw,
  FileSpreadsheet,
} from 'lucide-react';
import {
  SEED_FINDINGS,
  SEED_ACTIONS,
  SEED_ASSETS,
  SEED_EVIDENCE,
  SEED_TRANSCRIPTS,
} from '../../data/seedData';
import type { Report } from '../../shared/types';
import { resetDemoData } from '../../data/db';

export const ComponentKitScreen: React.FC = () => {
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState<boolean>(false);
  const [isExportSheetOpen, setIsExportSheetOpen] = useState<boolean>(false);
  const [isWaveformActive, setIsWaveformActive] = useState<boolean>(true);
  const [searchVal, setSearchVal] = useState<string>('Transformer');
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [sampleFieldValue, setSampleFieldValue] = useState<string>('PANEL-204');
  const [sampleCanUndo, setSampleCanUndo] = useState<boolean>(true);

  // Sample hero report representation
  const sampleReport: Report = {
    id: 'rep-hero-001',
    title: 'Electrical Inspection — Substation Panel Audit',
    siteId: 'site-kukatpally',
    siteName: 'Kukatpally Metro Site',
    inspector: 'K. S. Rao (Field Eng #104)',
    createdAt: '2026-09-18T11:42:00.000Z',
    status: 'in_review',
    priority: 'high',
    priorityReason: 'Critical thermal load and loose terminals pose immediate fire hazard',
    summary:
      '3 loose connections detected on Terminal Block B with severe thermal oxidation. Phase R feeder cable has chafed insulation. Urgent torquing required before morning shift.',
    findings: SEED_FINDINGS.filter((f) => f.reportId === 'rep-hero-001'),
    actions: SEED_ACTIONS.filter((a) => a.reportId === 'rep-hero-001'),
    evidenceIds: ['evi-hero-01', 'evi-hero-02'],
    editHistory: [],
    isHero: true,
    panelId: undefined,
    isPanelIdMissing: true,
    overallConfidence: 0.94,
  };

  const sampleFinding = SEED_FINDINGS[0]!;
  const sampleAction = SEED_ACTIONS[0]!;
  const sampleAsset = SEED_ASSETS[0]!;
  const sampleEvidence = SEED_EVIDENCE[0]!;
  const sampleTranscript = SEED_TRANSCRIPTS[0]!;

  return (
    <div className="space-y-10 pb-16">
      {/* Kit Header */}
      <div className="p-6 rounded-2xl bg-bg-surface1 border border-border-default shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-metadata-xs font-mono font-bold bg-semantic-green/20 text-semantic-green border border-semantic-green/30 uppercase">
                Dev Tool
              </span>
              <h2 className="text-heading-md font-bold text-text-primary">
                Design System & Component Kit
              </h2>
            </div>
            <p className="text-metadata text-text-muted mt-1">
              Visual validation of all Section 10 UI components in dark and daylight palettes
            </p>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              size="sm"
              variant="secondary"
              icon={RotateCcw}
              onClick={async () => {
                await resetDemoData();
                alert('Demo database reset to seed state.');
              }}
            >
              Reset Seed Data
            </Button>
          </div>
        </div>
      </div>

      {/* 1. Buttons & IconButtons */}
      <section className="space-y-4">
        <h3 className="text-body-sm font-mono font-bold uppercase tracking-wider text-text-muted border-b border-border-subtle pb-2">
          1. Buttons & IconButtons (48dp / 56dp Touch Targets)
        </h3>
        <div className="p-5 rounded-2xl bg-bg-surface1 border border-border-default space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary" icon={Sparkles}>
              Primary (56dp CTA)
            </Button>
            <Button variant="secondary" icon={FileSpreadsheet}>
              Secondary Action
            </Button>
            <Button variant="outline" icon={Download}>
              Outline Action
            </Button>
            <Button variant="destructive" icon={Trash2}>
              Destructive
            </Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="primary" loading>
              Loading State
            </Button>
            <Button variant="secondary" disabled>
              Disabled
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border-subtle">
            <IconButton icon={Mic} aria-label="Start voice recording" variant="primary" />
            <IconButton icon={Camera} aria-label="Capture field photo" variant="secondary" />
            <IconButton icon={Download} aria-label="Download dossier" variant="ghost" />
            <IconButton icon={Trash2} aria-label="Delete entry" variant="destructive" />
            <IconButton icon={Mic} aria-label="Loading audio" loading variant="secondary" />
          </div>
        </div>
      </section>

      {/* 2. Badges & Indicators (Never rely on colour alone) */}
      <section className="space-y-4">
        <h3 className="text-body-sm font-mono font-bold uppercase tracking-wider text-text-muted border-b border-border-subtle pb-2">
          2. Badges, Indicators & Chips (Shape + Text + Accessible)
        </h3>
        <div className="p-5 rounded-2xl bg-bg-surface1 border border-border-default space-y-4">
          <div className="space-y-2">
            <p className="text-metadata font-semibold text-text-secondary">Priority Badges:</p>
            <div className="flex flex-wrap items-center gap-2">
              <PriorityBadge priority="critical" />
              <PriorityBadge priority="high" />
              <PriorityBadge priority="medium" />
              <PriorityBadge priority="low" />
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-border-subtle">
            <p className="text-metadata font-semibold text-text-secondary">Confidence Badges:</p>
            <div className="flex flex-wrap items-center gap-2">
              <ConfidenceBadge confidence={0.96} />
              <ConfidenceBadge confidence={0.82} />
              <ConfidenceBadge confidence={0.62} />
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-border-subtle">
            <p className="text-metadata font-semibold text-text-secondary">Status Indicators:</p>
            <div className="flex flex-wrap items-center gap-2">
              <StatusIndicator status="verified" />
              <StatusIndicator status="review" />
              <StatusIndicator status="missing" />
              <StatusIndicator status="critical" />
              <StatusIndicator status="todo" />
              <StatusIndicator status="done" />
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-border-subtle">
            <p className="text-metadata font-semibold text-text-secondary">Language Chips (Indic & Latin):</p>
            <div className="flex flex-wrap items-center gap-2">
              <LanguageChip language="en" label="English" />
              <LanguageChip language="te" label="Telugu (తెలుగు)" />
              <LanguageChip language="hi" label="Hindi (हिन्दी)" />
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-border-subtle">
            <p className="text-metadata font-semibold text-text-secondary">Offline & Connection Badges:</p>
            <div className="flex flex-wrap items-center gap-2">
              <OfflineBadge />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Search & Filters */}
      <section className="space-y-4">
        <h3 className="text-body-sm font-mono font-bold uppercase tracking-wider text-text-muted border-b border-border-subtle pb-2">
          3. Search Bar & Filter Chips
        </h3>
        <div className="p-5 rounded-2xl bg-bg-surface1 border border-border-default space-y-4">
          <SearchBar
            value={searchVal}
            onChange={setSearchVal}
            onFilterClick={() => alert('Filter clicked')}
            hasActiveFilters={true}
          />

          <div className="flex flex-wrap items-center gap-2">
            {['All', 'Critical', 'Electrical', 'Civil', 'Hydraulics'].map((filter) => (
              <FilterChip
                key={filter}
                label={filter}
                active={selectedFilter === filter}
                onClick={() => setSelectedFilter(filter)}
                count={filter === 'All' ? 11 : filter === 'Critical' ? 1 : 3}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 4. Interactive Field Audio & Engine Processing */}
      <section className="space-y-4">
        <h3 className="text-body-sm font-mono font-bold uppercase tracking-wider text-text-muted border-b border-border-subtle pb-2">
          4. Waveform Visualizer & Engine Pipeline Timeline
        </h3>
        <div className="p-5 rounded-2xl bg-bg-surface1 border border-border-default space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-metadata font-bold text-text-primary">
              Live Acoustic Waveform (Pulsing / Fluctuating)
            </span>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setIsWaveformActive(!isWaveformActive)}
            >
              {isWaveformActive ? 'Pause Waveform' : 'Simulate Waveform'}
            </Button>
          </div>
          <div className="p-4 rounded-xl bg-bg-surface2 border border-border-subtle">
            <RecordingWaveform isRecording={isWaveformActive} />
          </div>

          <ProcessingTimeline
            currentStage="extracting"
            progressPercent={65}
            message="Extracting loose terminals and cable integrity findings..."
          />
        </div>
      </section>

      {/* 5. Question Card & Report Field with Hash Undo */}
      <section className="space-y-4">
        <h3 className="text-body-sm font-mono font-bold uppercase tracking-wider text-text-muted border-b border-border-subtle pb-2">
          5. Missing Entity Prompt & Tamper-Evident ReportField
        </h3>
        <div className="space-y-3">
          <QuestionCard
            question="Panel identifier is absent in recorded transcript. Link to PANEL-204?"
            missingField="Panel ID"
            suggestedValue="PANEL-204"
            onResolve={(val) => alert(`Resolved Panel ID to: ${val}`)}
            onDismiss={() => alert('Question dismissed')}
          />

          <ReportField
            label="Equipment Serial Tag"
            value={sampleFieldValue}
            fieldKey="panelId"
            confidence={0.96}
            canUndo={sampleCanUndo}
            onSave={(_k, newVal) => {
              setSampleFieldValue(newVal);
              setSampleCanUndo(true);
            }}
            onUndo={() => {
              setSampleFieldValue('PANEL-204');
              setSampleCanUndo(false);
            }}
          />
        </div>
      </section>

      {/* 6. Cards (ReportCard, FindingCard, ActionCard, AssetCard, EvidenceCard) */}
      <section className="space-y-4">
        <h3 className="text-body-sm font-mono font-bold uppercase tracking-wider text-text-muted border-b border-border-subtle pb-2">
          6. Domain Cards (Hero Report, Finding, Action, Asset, Evidence)
        </h3>
        <div className="space-y-4">
          <ReportCard report={sampleReport} onClick={() => alert('Report clicked')} />
          <FindingCard
            finding={sampleFinding}
            onVerify={(id) => alert(`Verified finding: ${id}`)}
          />
          <ActionCard
            action={sampleAction}
            onToggleStatus={(id) => alert(`Toggled task: ${id}`)}
          />
          <AssetCard asset={sampleAsset} onClick={() => alert('Asset clicked')} />
          <EvidenceCard evidence={sampleEvidence} onClick={() => alert('Evidence clicked')} />
        </div>
      </section>

      {/* 7. Code-Mixed Transcript Drawer */}
      <section className="space-y-4">
        <h3 className="text-body-sm font-mono font-bold uppercase tracking-wider text-text-muted border-b border-border-subtle pb-2">
          7. Code-Mixed Transcript (Telugu + English Segments)
        </h3>
        <div className="p-5 rounded-2xl bg-bg-surface1 border border-border-default">
          <TranscriptDrawer
            transcript={sampleTranscript}
            activeSegmentIndex={1}
            onSelectSegment={(idx, seg) => alert(`Selected segment ${idx}: ${seg.text}`)}
          />
        </div>
      </section>

      {/* 8. Photo Grid & Inspector Signature Pad */}
      <section className="space-y-4">
        <h3 className="text-body-sm font-mono font-bold uppercase tracking-wider text-text-muted border-b border-border-subtle pb-2">
          8. Photo Grid & Inspector Sign-Off Pad
        </h3>
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-bg-surface1 border border-border-default">
            <PhotoGrid
              evidenceList={SEED_EVIDENCE}
              onAddPhoto={() => alert('Add photo trigger')}
              onRemovePhoto={(id) => alert(`Remove photo ${id}`)}
              onViewPhoto={(evi) => alert(`Viewing photo: ${evi.caption}`)}
            />
          </div>

          <SignaturePad
            inspectorName="K. S. Rao (Field Eng #104)"
            onSaveSignature={() => alert('Signature saved & cryptographically sealed.')}
          />
        </div>
      </section>

      {/* 9. BottomSheet & ExportSheet */}
      <section className="space-y-4">
        <h3 className="text-body-sm font-mono font-bold uppercase tracking-wider text-text-muted border-b border-border-subtle pb-2">
          9. Modals & BottomSheets (Spring Physics)
        </h3>
        <div className="p-5 rounded-2xl bg-bg-surface1 border border-border-default flex flex-wrap gap-3">
          <Button
            variant="primary"
            onClick={() => setIsBottomSheetOpen(true)}
          >
            Open Interactive BottomSheet
          </Button>

          <Button
            variant="secondary"
            onClick={() => setIsExportSheetOpen(true)}
            icon={Download}
          >
            Open ExportSheet (PDF / ZIP / CSV)
          </Button>

          <BottomSheet
            isOpen={isBottomSheetOpen}
            onClose={() => setIsBottomSheetOpen(false)}
            title="Field Inspection Options"
            subtitle="Configurable parameters for local audit"
          >
            <div className="space-y-3">
              <p className="text-body-sm text-text-secondary leading-relaxed">
                Bottom sheets feature tactile drag handles, backdrop blur, spring physics, and full keyboard escape support.
              </p>
              <Button fullWidth variant="primary" onClick={() => setIsBottomSheetOpen(false)}>
                Confirm Action
              </Button>
            </div>
          </BottomSheet>

          <ExportSheet
            isOpen={isExportSheetOpen}
            onClose={() => setIsExportSheetOpen(false)}
            reportTitle={sampleReport.title}
          />
        </div>
      </section>

      {/* 10. States: EmptyState & ErrorState */}
      <section className="space-y-4">
        <h3 className="text-body-sm font-mono font-bold uppercase tracking-wider text-text-muted border-b border-border-subtle pb-2">
          10. Domain States (Empty & Error)
        </h3>
        <div className="space-y-4">
          <EmptyState
            icon={Mic}
            badge="Ready for capture"
            title="Empty State Example"
            description="Clear, non-generic field instructions guide inspectors when zero logs are available."
            actions={[
              {
                label: 'Primary CTA',
                icon: Plus,
                onClick: () => alert('Empty state primary clicked'),
                variant: 'primary',
              },
              {
                label: 'Secondary Action',
                onClick: () => alert('Empty state secondary clicked'),
                variant: 'secondary',
              },
            ]}
          />

          <ErrorState
            title="On-Device Model Check Failed"
            message="WebGPU shader compilation was interrupted. Fallback to WASM SIMD engine initiated."
            onRetry={() => alert('Retrying operation')}
            onReset={() => alert('Resetting state')}
          />
        </div>
      </section>
    </div>
  );
};
