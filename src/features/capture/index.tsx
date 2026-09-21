import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mic,
  Camera,
  Download,
  QrCode,
  Sun,
  Moon,
  Pause,
  Play,
  Check,
  X,
  FileText,
  Sparkles,
} from 'lucide-react';
import {
  OfflineBadge,
  RecordingWaveform,
  ProcessingTimeline,
  ReportCard,
  Button,
  LanguageChip,
  ErrorState,
} from '../../components';
import { useCaptureStore, useReportsStore } from '../../lib/stores';
import { useThemeStore } from '../../lib/theme';
import { ImportSheet } from './ImportSheet';
import { db } from '../../data/db';
import type { Report } from '../../shared/types';

export const CaptureScreen: React.FC = () => {
  const navigate = useNavigate();
  const {
    mode,
    isPaused,
    recordingDurationMs,
    noiseLevel,
    liveTranscriptText,
    engineStage,
    engineProgress,
    engineMessage,
    assembledReport,
    errorType,
    errorMessage,
    handsFreeMode,
    startCapture,
    pauseCapture,
    resumeCapture,
    finishCaptureAndProcess,
    cancelCapture,
    setHandsFreeMode,
    clearError,
  } = useCaptureStore();

  const { resolvedTheme, toggleTheme } = useThemeStore();
  const { reports, loadReports } = useReportsStore();
  const [isImportSheetOpen, setIsImportSheetOpen] = useState<boolean>(false);
  const [showQuickText, setShowQuickText] = useState<boolean>(false);
  const [quickTitle, setQuickTitle] = useState<string>('');
  const [quickText, setQuickText] = useState<string>('');

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const recentReports = reports.slice(0, 3);

  // Format recording timer into MM:SS.d
  const formatTimer = (ms: number): string => {
    const totalSecs = ms / 1000;
    const mins = Math.floor(totalSecs / 60);
    const secs = Math.floor(totalSecs % 60);
    const tenths = Math.floor((ms % 1000) / 100);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${tenths}`;
  };

  const handleFinish = async () => {
    await finishCaptureAndProcess((reportId) => {
      navigate(`/report/${reportId}`);
    });
  };

  const handleSaveQuickText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickText.trim()) return;

    const newReport: Report = {
      id: `rep-${Date.now()}`,
      title: quickTitle.trim() || `Field Note #${reports.length + 1}`,
      siteId: 'site-kukatpally',
      siteName: 'Kukatpally Metro Site',
      inspector: 'K. S. Rao (Field Eng #104)',
      createdAt: new Date().toISOString(),
      status: 'draft',
      priority: 'medium',
      summary: quickText.trim(),
      findings: [],
      actions: [],
      evidenceIds: [],
      editHistory: [],
      overallConfidence: 0.9,
    };

    await db.reports.put(newReport);
    await loadReports();
    setQuickTitle('');
    setQuickText('');
    setShowQuickText(false);
  };

  // --- STATE 1: ERROR STATE (Screen 2 Error Handling) ---
  if (mode === 'error') {
    let errorTitle = 'Microphone Error';
    let plainMsg = errorMessage || 'Could not access the audio recording device.';
    let onAction: () => void = () => { startCapture().catch(console.error); };

    if (errorType === 'permission_denied') {
      errorTitle = 'Microphone Access Denied';
      plainMsg = 'FieldNote requires microphone permission for on-device voice reporting. Please allow microphone access in your browser settings.';
      onAction = () => { startCapture().catch(console.error); };
    } else if (errorType === 'not_found') {
      errorTitle = 'No Microphone Detected';
      plainMsg = 'No audio input hardware was found on this device. You can still record observations using manual text.';
      onAction = () => {
        clearError();
        setShowQuickText(true);
      };
    } else if (errorType === 'busy') {
      errorTitle = 'Microphone Busy';
      plainMsg = 'The microphone is currently in use by another app or browser tab. Please close other audio apps and try again.';
      onAction = () => { startCapture().catch(console.error); };
    }

    return (
      <div className="space-y-6 max-w-xl mx-auto py-6">
        <ErrorState
          title={errorTitle}
          message={plainMsg}
          onRetry={onAction}
          onReset={clearError}
        />
      </div>
    );
  }

  // --- STATE 2: PROCESSING PIPELINE SCREEN (Screen 4) ---
  if (mode === 'processing') {
    return (
      <div className="space-y-6 max-w-xl mx-auto py-4">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-semantic-green animate-pulse" />
            <span className="text-metadata font-mono font-bold uppercase tracking-wider text-text-primary">
              Local Machine Learning Engine
            </span>
          </div>
          <OfflineBadge />
        </div>

        {/* Accessible live region */}
        <div className="sr-only" role="status" aria-live="polite">
          {engineMessage}
        </div>

        {/* Processing Timeline (No spinners) */}
        <ProcessingTimeline
          currentStage={engineStage}
          progressPercent={engineProgress}
          message={engineMessage}
        />

        {/* Progressive Field Assembly Preview Card */}
        <div className="p-5 rounded-2xl bg-bg-surface1 border border-border-default shadow-md space-y-3.5 transition-all">
          <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
            <span className="text-metadata-xs font-mono font-bold uppercase text-text-muted">
              Progressive Dossier Assembly
            </span>
            <span className="text-metadata-xs font-mono font-semibold text-semantic-green">
              {engineStage === 'complete' ? 'SEALED (SHA-256)' : 'ASSEMBLING...'}
            </span>
          </div>

          <div className="space-y-2">
            <h3 className="text-body-md font-bold text-text-primary">
              {assembledReport?.title || 'Identifying Audit Title...'}
            </h3>
            <p className="text-metadata font-mono text-text-muted">
              Site: <strong className="text-text-primary">{assembledReport?.siteName || 'Locating...'}</strong> | Inspector: <strong className="text-text-primary">{assembledReport?.inspector || 'Identifying...'}</strong>
            </p>
          </div>

          {assembledReport?.priority && (
            <div className="flex items-center gap-2 pt-1">
              <span className="px-2 py-0.5 rounded text-metadata-xs font-mono font-bold uppercase bg-semantic-amber-surface text-semantic-amber-text border border-semantic-amber-border">
                {assembledReport.priority} PRIORITY
              </span>
              {assembledReport.priorityReason && (
                <span className="text-metadata text-text-secondary truncate">
                  {assembledReport.priorityReason}
                </span>
              )}
            </div>
          )}

          {assembledReport?.summary && (
            <p className="text-body-sm text-text-secondary bg-bg-surface2/60 p-3 rounded-xl border border-border-subtle leading-relaxed">
              {assembledReport.summary}
            </p>
          )}
        </div>

        {engineStage === 'complete' && (
          <Button
            size="lg"
            variant="primary"
            fullWidth
            icon={Check}
            onClick={() => {
              const id = useCaptureStore.getState().createdReportId;
              if (id) navigate(`/report/${id}`);
            }}
          >
            Open Assembled Report
          </Button>
        )}
      </div>
    );
  }

  // --- STATE 3: RECORDING SCREEN (Screen 2) ---
  if (mode === 'recording') {
    return (
      <div className="space-y-6 max-w-xl mx-auto py-2">
        {/* Top Recording Bar */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-bg-surface1 border border-border-default shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-semantic-red animate-ping" />
            <span className="font-mono text-metadata font-bold tracking-wider uppercase text-semantic-red">
              {isPaused ? 'PAUSED' : 'RECORDING'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono text-heading-sm font-bold text-text-primary">
              {formatTimer(recordingDurationMs)}
            </span>
            <OfflineBadge />
          </div>
        </div>

        {/* Live Waveform & Indicators */}
        <div className="p-6 rounded-3xl bg-bg-surface1 border border-border-default shadow-md space-y-5 text-center">
          <div className="flex items-center justify-between">
            <LanguageChip language="te" label="Telugu · English" />

            {/* Noise Indicator (LOW / MEDIUM / HIGH) */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-metadata-xs font-mono font-bold uppercase border bg-bg-surface2 text-text-secondary border-border-subtle">
              <span
                className={`w-2 h-2 rounded-full ${
                  noiseLevel === 'HIGH'
                    ? 'bg-semantic-red'
                    : noiseLevel === 'MEDIUM'
                    ? 'bg-semantic-amber'
                    : 'bg-semantic-green'
                }`}
              />
              <span>NOISE: {noiseLevel}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-bg-surface2 border border-border-subtle">
            <RecordingWaveform isRecording={!isPaused} height={64} />
          </div>

          {/* Live Typewriter Transcript Stream */}
          <div className="p-4 rounded-2xl bg-bg-surface2/60 border border-border-subtle text-left min-h-[96px] space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-muted flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-semantic-green" />
              Live Speech Stream (Local Model)
            </span>
            <p className="text-body-sm text-text-primary font-sans leading-relaxed">
              {liveTranscriptText || (
                <span className="text-text-muted italic">Listening for field speech...</span>
              )}
              {!isPaused && <span className="inline-block w-1.5 h-4 bg-semantic-green ml-1 animate-pulse align-middle" />}
            </p>
          </div>
        </div>

        {/* Controls: Pause, Cancel, Finish CTA (56dp+) */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <Button
            size="md"
            variant="ghost"
            icon={X}
            onClick={cancelCapture}
          >
            Cancel
          </Button>

          <Button
            size="md"
            variant="secondary"
            icon={isPaused ? Play : Pause}
            onClick={isPaused ? resumeCapture : pauseCapture}
          >
            {isPaused ? 'Resume' : 'Pause'}
          </Button>

          <Button
            size="lg"
            variant="primary"
            icon={Check}
            onClick={handleFinish}
            className="flex-1 min-h-[56px] text-body-md font-bold shadow-lg shadow-semantic-green/20"
          >
            Finish & Compile
          </Button>
        </div>
      </div>
    );
  }

  // --- STATE 4: CAPTURE HOME (Screen 1) ---
  return (
    <div className="space-y-8 pb-12 max-w-2xl mx-auto">
      {/* Quick Header Strip with Daylight Quick Toggle & Offline Badge */}
      <div className="flex items-center justify-between px-1">
        <OfflineBadge />

        <button
          type="button"
          aria-label={`Switch to ${resolvedTheme === 'dark' ? 'Daylight' : 'Dark'} mode`}
          onClick={toggleTheme}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-bg-surface1 border border-border-default text-text-secondary hover:text-text-primary hover:bg-bg-surface2 transition-all select-none text-metadata font-medium shadow-sm"
        >
          {resolvedTheme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-semantic-amber" />
              <span className="hidden sm:inline">Daylight Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-semantic-blue" />
              <span className="hidden sm:inline">Dark Mode</span>
            </>
          )}
        </button>
      </div>

      {/* Hero "What happened today?" Section with Huge Central Mic */}
      <div className="flex flex-col items-center text-center space-y-6 pt-2">
        <div className="space-y-1.5">
          <h2 className="text-heading-xl font-extrabold text-text-primary tracking-tight">
            What happened today?
          </h2>
          <p className="text-body-sm text-text-secondary max-w-md mx-auto">
            Tap the mic to record observations, hazards, or equipment checks.
          </p>
        </div>

        {/* Huge Visually Dominating Central Mic Button (124px) */}
        <div className="relative flex items-center justify-center my-4">
          {/* Layered background pulse rings */}
          <div className="absolute w-44 h-44 rounded-full bg-semantic-green/10 animate-pulse pointer-events-none" />
          <div className="absolute w-36 h-36 rounded-full bg-semantic-green/15 pointer-events-none" />

          <button
            type="button"
            aria-label="Start audio capture"
            onClick={startCapture}
            className="relative z-10 w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-semantic-green text-text-inverse flex flex-col items-center justify-center shadow-xl shadow-semantic-green/30 hover:scale-105 active:scale-95 transition-all select-none cursor-pointer group"
          >
            <Mic className="w-12 h-12 stroke-[2.2] group-hover:scale-110 transition-transform" />
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase mt-1">
              Record
            </span>
          </button>
        </div>

        {/* Action Buttons Row: Camera, Import, QR Scan */}
        <div className="flex items-center justify-center gap-3 w-full max-w-sm">
          <Button
            size="md"
            variant="secondary"
            icon={Camera}
            onClick={() => alert('Camera photo capture: Opens device camera stream to attach evidence.')}
            className="flex-1"
          >
            Camera
          </Button>

          <Button
            size="md"
            variant="secondary"
            icon={Download}
            onClick={() => setIsImportSheetOpen(true)}
            className="flex-1"
          >
            Import
          </Button>

          <Button
            size="md"
            variant="secondary"
            icon={QrCode}
            onClick={() => alert('QR Scanner: Opens camera barcode reader for equipment tag lookup.')}
            className="flex-1"
          >
            QR Scan
          </Button>
        </div>

        {/* Hands-free mode & manual text trigger */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-metadata text-text-muted pt-2">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={handsFreeMode}
              onChange={(e) => setHandsFreeMode(e.target.checked)}
              className="w-4 h-4 rounded border-border-default text-semantic-green focus:ring-0"
            />
            <span>Hands-free continuous mode</span>
          </label>

          <span className="hidden sm:inline opacity-40">•</span>

          <button
            type="button"
            onClick={() => setShowQuickText(!showQuickText)}
            className="flex items-center gap-1 text-semantic-green hover:underline font-medium"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Draft text memo</span>
          </button>
        </div>

        {/* Quick Text Note Form */}
        {showQuickText && (
          <form onSubmit={handleSaveQuickText} className="w-full max-w-md p-4 rounded-2xl bg-bg-surface1 border border-border-default space-y-3 text-left">
            <h4 className="text-body-sm font-bold text-text-primary">Quick Observation Note</h4>
            <input
              type="text"
              placeholder="Note title (optional)..."
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-bg-surface2 border border-border-default text-text-primary placeholder:text-text-muted text-body-sm focus:outline-none focus:border-semantic-green"
            />
            <textarea
              rows={3}
              placeholder="Write field observations, equipment serials, or site conditions..."
              value={quickText}
              onChange={(e) => setQuickText(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-bg-surface2 border border-border-default text-text-primary placeholder:text-text-muted text-body-sm focus:outline-none focus:border-semantic-green resize-none"
              required
            />
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={() => setShowQuickText(false)}>
                Cancel
              </Button>
              <Button size="sm" variant="primary" type="submit">
                Save Draft
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* RECENT REPORTS Section (2-3 cards) */}
      <div className="space-y-3.5 pt-4">
        <div className="flex items-center justify-between px-1">
          <span className="text-metadata-xs font-mono font-bold uppercase tracking-wider text-text-muted">
            Recent Reports ({recentReports.length})
          </span>
          <button
            type="button"
            onClick={() => navigate('/reports')}
            className="text-metadata-xs text-semantic-green font-semibold hover:underline"
          >
            View all
          </button>
        </div>

        <div className="space-y-3">
          {recentReports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onClick={() => navigate(`/report/${report.id}`)}
            />
          ))}
        </div>
      </div>

      {/* Import Sheet */}
      <ImportSheet
        isOpen={isImportSheetOpen}
        onClose={() => setIsImportSheetOpen(false)}
      />
    </div>
  );
};
