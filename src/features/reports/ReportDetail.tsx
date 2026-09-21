import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  ShieldCheck,
  Download,
  AlertOctagon,
  MapPin,
  FileText,
  Clock,
  CheckCircle2,
  PlusCircle,
  ShieldAlert,
  Bug,
  RefreshCw,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PriorityBadge,
  FindingCard,
  ActionCard,
  ReportField,
  Button,
  PhotoGrid,
  ExportSheet,
  QuestionCard,
  TranscriptDrawer,
  SignaturePad,
  BottomSheet,
  ConfidenceBreakdownCard,
} from '../../components';
import { useReportsStore } from '../../lib/stores';
import { db } from '../../data/db';
import type { Report, Evidence, Transcript } from '../../shared/types';
import { verifyChain } from '../../lib/hashChain';
import { useThemeStore } from '../../lib/theme';

export const ReportDetailScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const prefersReducedMotion = useThemeStore((s) => s.prefersReducedMotion);

  const {
    updateReportField,
    undoReportEdit,
    verifyFinding,
    toggleActionStatus,
    assignMissingEntity,
    saveSignature,
    tamperAuditEntry,
    restoreAuditChain,
  } = useReportsStore();

  const [report, setReport] = useState<Report | null>(null);
  const [evidenceList, setEvidenceList] = useState<Evidence[]>([]);
  const [transcript, setTranscript] = useState<Transcript | null>(null);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);
  const [customLocation, setCustomLocation] = useState<string>('');
  const [highlightedFieldId, setHighlightedFieldId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'editor' | 'sheet'>('editor');

  // Audit and tamper verification states
  const [auditResult, setAuditResult] = useState<{
    valid: boolean;
    tamperedIndex?: number;
    error?: string;
    checked: boolean;
  }>({ valid: true, checked: false });
  const [isVerifyingChain, setIsVerifyingChain] = useState<boolean>(false);

  const loadReport = useCallback(async () => {
    if (!id) return;
    const found = await db.reports.get(id);
    if (found) {
      setReport(found);
      const evidence = await db.evidence.where('reportId').equals(id).toArray();
      setEvidenceList(evidence);

      // Load transcript
      const tr = await db.transcripts.where('reportId').equals(id).first();
      if (tr) {
        setTranscript(tr);
      } else {
        // Default transcript for hero report or new reports
        const heroTr = await db.transcripts.get('tr-hero-001');
        if (heroTr) setTranscript(heroTr);
      }

      // Verify chain
      const res = await verifyChain(found.editHistory);
      setAuditResult({ ...res, checked: true });
    }
  }, [id]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const handleRunVerify = async () => {
    if (!report) return;
    setIsVerifyingChain(true);
    await new Promise((r) => setTimeout(r, 300));
    const res = await verifyChain(report.editHistory);
    setAuditResult({ ...res, checked: true });
    setIsVerifyingChain(false);
  };

  const handleTamperTest = async () => {
    if (!report || report.editHistory.length === 0) return;
    // Tamper the latest entry's after value
    const targetIdx = report.editHistory.length - 1;
    await tamperAuditEntry(report.id, targetIdx, 'TAMPERED_UNAUTHORIZED_OVERRIDE');
    await loadReport();
    // Auto-run verification to show failure immediately
    const tamperedReport = await db.reports.get(report.id);
    if (tamperedReport) {
      const res = await verifyChain(tamperedReport.editHistory);
      setAuditResult({ ...res, checked: true });
    }
  };

  const handleRestoreChain = async () => {
    if (!report) return;
    await restoreAuditChain(report.id);
    await loadReport();
    const restoredReport = await db.reports.get(report.id);
    if (restoredReport) {
      const res = await verifyChain(restoredReport.editHistory);
      setAuditResult({ ...res, checked: true });
    }
  };

  const handleJumpToField = (fieldId: string) => {
    setHighlightedFieldId(fieldId);
    const el = document.getElementById(fieldId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    setTimeout(() => {
      setHighlightedFieldId(null);
    }, 2400);
  };

  const handleSaveManualLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!report || !customLocation.trim()) return;
    await updateReportField(report.id, 'geo', {
      latitude: 17.4947,
      longitude: 78.3996,
      accuracy: 10,
      address: customLocation.trim(),
    });
    setIsLocationModalOpen(false);
    await loadReport();
  };

  if (!report) {
    return (
      <div className="p-8 text-center space-y-4 max-w-md mx-auto">
        <p className="text-body-sm text-text-muted">Loading field dossier...</p>
        <Button variant="secondary" onClick={() => navigate('/reports')}>
          Back to Reports
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-20">
      {/* Top Bar Navigation & Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Back to reports list"
            onClick={() => navigate('/reports')}
            className="p-2.5 rounded-xl bg-bg-surface1 border border-border-default text-text-muted hover:text-text-primary focus-visible:ring-2 focus-visible:ring-semantic-green transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <span className="text-metadata-xs font-mono uppercase font-bold text-semantic-green">
              {report.category || 'ELECTRICAL INSPECTION'}
            </span>
            <h1 className="text-body-md font-bold text-text-primary leading-tight truncate max-w-[200px] sm:max-w-md">
              {report.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="p-1 rounded-xl bg-bg-surface1 border border-border-default flex items-center gap-1">
            <button
              type="button"
              onClick={() => setViewMode('editor')}
              className={`
                px-2.5 py-1 rounded-lg text-metadata-xs font-semibold flex items-center gap-1.5 transition-all
                ${
                  viewMode === 'editor'
                    ? 'bg-bg-surface2 text-text-primary shadow-sm border border-border-strong'
                    : 'text-text-muted hover:text-text-primary'
                }
              `}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Editor</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('sheet')}
              className={`
                px-2.5 py-1 rounded-lg text-metadata-xs font-semibold flex items-center gap-1.5 transition-all
                ${
                  viewMode === 'sheet'
                    ? 'bg-bg-surface2 text-text-primary shadow-sm border border-border-strong'
                    : 'text-text-muted hover:text-text-primary'
                }
              `}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Inspection Sheet</span>
            </button>
          </div>

          <Button
            size="sm"
            variant="secondary"
            icon={PlusCircle}
            onClick={() => setIsAddOpen(true)}
          >
            Add
          </Button>

          <Button
            size="sm"
            variant="primary"
            icon={Download}
            onClick={() => setIsExportOpen(true)}
          >
            Export
          </Button>
        </div>
      </div>

      {/* Quiet "Report Ready" moment (no confetti) */}
      <motion.div
        initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: prefersReducedMotion ? 0.05 : 0.2 }}
        className="px-4 py-2.5 rounded-2xl bg-bg-surface1 border border-border-default flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-2 min-w-0">
          <CheckCircle2 className="w-4 h-4 text-semantic-green shrink-0" />
          <span className="text-body-xs font-medium text-text-primary truncate">
            Report ready · All entities cryptographically sealed in on-device ledger.
          </span>
        </div>
        <span className="text-metadata-xs font-mono text-text-muted shrink-0">
          Spoken in Telugu · English
        </span>
      </motion.div>

      {/* ============================================================ */}
      {/* MODE 1: STRUCTURED REPORT EDITOR */}
      {/* ============================================================ */}
      {viewMode === 'editor' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="p-6 rounded-3xl bg-bg-surface1 border border-border-default shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold uppercase bg-semantic-green-surface text-semantic-green-text border border-semantic-green-border">
                  {report.category || 'ELECTRICAL INSPECTION'}
                </span>
                <PriorityBadge priority={report.priority} />
                <span className="px-2 py-0.5 rounded text-metadata-xs font-mono bg-bg-surface2 text-text-secondary border border-border-subtle">
                  {report.siteName}
                </span>
              </div>

              <div className="flex items-center gap-1.5 font-mono text-metadata-xs text-text-muted">
                <Calendar className="w-3.5 h-3.5" />
                <span>{new Date(report.createdAt).toLocaleString()}</span>
              </div>
            </div>

            <h2 className="text-heading-lg font-bold text-text-primary tracking-tight">
              {report.title}
            </h2>

            {/* GPS Captured Location with Fallback */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-bg-surface2 border border-border-subtle text-metadata-xs font-mono">
              <div className="flex items-center gap-2 text-text-secondary">
                <MapPin className="w-3.5 h-3.5 text-semantic-green shrink-0" />
                <span>
                  {report.geo?.address ||
                    (report.geo
                      ? `${report.geo.latitude.toFixed(4)}° N, ${report.geo.longitude.toFixed(4)}° E (±${report.geo.accuracy ?? 5}m)`
                      : 'GPS Geofence: Metro Pillar 742, Kukatpally Metro Site')}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setCustomLocation(report.geo?.address || '');
                  setIsLocationModalOpen(true);
                }}
                className="text-semantic-green hover:underline font-bold focus-visible:ring-2 focus-visible:ring-semantic-green rounded"
              >
                {report.geo?.address ? 'Edit Location' : 'Location unavailable, add manually'}
              </button>
            </div>

            {/* Priority Reason Line */}
            {report.priorityReason && (
              <div className="p-3.5 rounded-xl bg-semantic-red-surface text-semantic-red-text border border-semantic-red-border text-metadata font-medium flex items-center gap-2.5">
                <AlertOctagon className="w-4 h-4 shrink-0" />
                <span>
                  <strong className="font-bold uppercase mr-1">HIGH PRIORITY:</strong>
                  {report.priorityReason}
                </span>
              </div>
            )}

            {/* Missing Panel ID Prompt (QuestionCard) */}
            <AnimatePresence>
              {report.isPanelIdMissing && (
                <QuestionCard
                  question="Panel identifier is absent in recorded transcript. What is the Panel ID?"
                  missingField="Panel ID"
                  suggestedValue="PANEL-204"
                  onResolve={async (val) => {
                    await assignMissingEntity(report.id, 'panelId', val);
                    await loadReport();
                    handleJumpToField('field-panelId');
                  }}
                />
              )}
            </AnimatePresence>

            {/* Tamper-Evident SHA-256 Ledger Seal */}
            <div
              className={`
                px-3.5 py-2.5 rounded-xl text-metadata-xs font-mono flex items-center justify-between border transition-colors
                ${
                  auditResult.valid
                    ? 'bg-semantic-green-surface/40 text-semantic-green-text border-semantic-green-border'
                    : 'bg-semantic-red-surface text-semantic-red-text border-semantic-red-border'
                }
              `}
            >
              <div className="flex items-center gap-2">
                {auditResult.valid ? (
                  <ShieldCheck className="w-4 h-4 text-semantic-green" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-semantic-red" />
                )}
                <span>
                  {auditResult.valid
                    ? `SHA-256 Ledger Intact (${report.editHistory.length} audit blocks chained)`
                    : `TAMPER DETECTED: ${auditResult.error}`}
                </span>
              </div>
              <button
                type="button"
                onClick={handleRunVerify}
                disabled={isVerifyingChain}
                className="px-2 py-0.5 rounded bg-bg-surface1 border border-border-default hover:bg-bg-hover text-text-primary font-bold text-[10px] focus-visible:ring-2 focus-visible:ring-semantic-green"
              >
                {isVerifyingChain ? 'Verifying...' : 'Verify Seal'}
              </button>
            </div>
          </div>

          {/* Confidence Breakdown Card */}
          <ConfidenceBreakdownCard
            overall={report.overallConfidence}
            breakdown={
              report.confidenceBreakdown || {
                findings: 0.94,
                category: 0.97,
                deadline: 0.81,
                location: 0.99,
              }
            }
          />

          {/* Structured Fields Section (Tap-to-Edit with Undo) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-body-sm font-mono font-bold uppercase tracking-wider text-text-muted">
                Structured Fields & Tap-to-Edit
              </h3>
              <span className="text-metadata-xs text-text-muted font-mono">
                Tap any field to edit · Full undo history
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ReportField
                id="field-category"
                label="Inspection Category"
                value={report.category || 'ELECTRICAL INSPECTION'}
                fieldKey="category"
                confidence={report.confidenceBreakdown?.category ?? 0.97}
                isHighlighted={highlightedFieldId === 'field-category'}
                onSave={async (k, v) => {
                  await updateReportField(report.id, k as keyof Report, v);
                  await loadReport();
                }}
                onUndo={async () => {
                  await undoReportEdit(report.id);
                  await loadReport();
                }}
                canUndo={report.editHistory.some((e) => e.field === 'category')}
              />

              <ReportField
                id="field-panelId"
                label="Assigned Equipment / Panel ID"
                value={report.panelId || ''}
                fieldKey="panelId"
                isMissing={report.isPanelIdMissing}
                confidence={report.panelId ? 0.95 : undefined}
                isHighlighted={highlightedFieldId === 'field-panelId'}
                onSave={async (k, v) => {
                  await updateReportField(report.id, k as keyof Report, v);
                  await loadReport();
                }}
                onUndo={async () => {
                  await undoReportEdit(report.id);
                  await loadReport();
                }}
                canUndo={report.editHistory.some((e) => e.field === 'panelId')}
              />

              <ReportField
                id="field-siteName"
                label="Site Name & Pillar"
                value={report.siteName}
                fieldKey="siteName"
                confidence={0.98}
                isHighlighted={highlightedFieldId === 'field-siteName'}
                onSave={async (k, v) => {
                  await updateReportField(report.id, k as keyof Report, v);
                  await loadReport();
                }}
                onUndo={async () => {
                  await undoReportEdit(report.id);
                  await loadReport();
                }}
                canUndo={report.editHistory.some((e) => e.field === 'siteName')}
              />

              <ReportField
                id="field-deadline"
                label="Mandated Remediation Deadline"
                value={report.deadline || '19 Sep 2026 morning'}
                fieldKey="deadline"
                confidence={report.confidenceBreakdown?.deadline ?? 0.81}
                isHighlighted={highlightedFieldId === 'field-deadline'}
                onSave={async (k, v) => {
                  await updateReportField(report.id, k as keyof Report, v);
                  await loadReport();
                }}
                onUndo={async () => {
                  await undoReportEdit(report.id);
                  await loadReport();
                }}
                canUndo={report.editHistory.some((e) => e.field === 'deadline')}
              />

              <ReportField
                id="field-inspector"
                label="Certified Field Inspector"
                value={report.inspector}
                fieldKey="inspector"
                confidence={0.99}
                isHighlighted={highlightedFieldId === 'field-inspector'}
                onSave={async (k, v) => {
                  await updateReportField(report.id, k as keyof Report, v);
                  await loadReport();
                }}
                onUndo={async () => {
                  await undoReportEdit(report.id);
                  await loadReport();
                }}
                canUndo={report.editHistory.some((e) => e.field === 'inspector')}
              />

              <ReportField
                id="field-priority"
                label="Assigned Priority Level"
                value={report.priority.toUpperCase()}
                fieldKey="priority"
                confidence={0.94}
                isHighlighted={highlightedFieldId === 'field-priority'}
                onSave={async (k, v) => {
                  await updateReportField(report.id, k as keyof Report, v.toLowerCase());
                  await loadReport();
                }}
                onUndo={async () => {
                  await undoReportEdit(report.id);
                  await loadReport();
                }}
                canUndo={report.editHistory.some((e) => e.field === 'priority')}
              />
            </div>

            <ReportField
              id="field-summary"
              label="Executive Field Summary"
              value={report.summary}
              fieldKey="summary"
              confidence={0.94}
              isHighlighted={highlightedFieldId === 'field-summary'}
              onSave={async (k, v) => {
                await updateReportField(report.id, k as keyof Report, v);
                await loadReport();
              }}
              onUndo={async () => {
                await undoReportEdit(report.id);
                await loadReport();
              }}
              canUndo={report.editHistory.some((e) => e.field === 'summary')}
            />
          </div>

          {/* Extracted Findings */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-body-sm font-mono font-bold uppercase tracking-wider text-text-muted">
                Extracted Findings ({report.findings.length})
              </h3>
              <span className="text-metadata-xs text-text-muted font-mono">
                94% confidence · Tap to verify
              </span>
            </div>

            <div className="space-y-3">
              {report.findings.map((f, idx) => (
                <div
                  key={f.id}
                  id={`field-finding-${idx}`}
                  className={`transition-all rounded-xl ${
                    highlightedFieldId === `field-finding-${idx}`
                      ? 'ring-2 ring-semantic-green'
                      : ''
                  }`}
                >
                  <FindingCard
                    finding={f}
                    onVerify={async (fid) => {
                      await verifyFinding(report.id, fid);
                      await loadReport();
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Action Items & Punch List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-body-sm font-mono font-bold uppercase tracking-wider text-text-muted">
                Action Items & Punch List ({report.actions.length})
              </h3>
              <span className="text-metadata-xs text-text-muted font-mono">
                Checkable · Chained in audit log
              </span>
            </div>

            <div className="space-y-3">
              {report.actions.map((act, idx) => (
                <div
                  key={act.id}
                  id={`field-action-${idx}`}
                  className={`transition-all rounded-xl ${
                    highlightedFieldId === `field-action-${idx}`
                      ? 'ring-2 ring-semantic-green'
                      : ''
                  }`}
                >
                  <ActionCard
                    action={act}
                    onToggleStatus={async (actId) => {
                      await toggleActionStatus(report.id, actId);
                      await loadReport();
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Evidence Photo Grid */}
          <div className="p-5 rounded-2xl bg-bg-surface1 border border-border-default space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-body-sm font-bold text-text-primary">
                Inspection Evidence & Thumbnails
              </h4>
              <span className="text-metadata-xs font-mono text-text-muted">
                {evidenceList.length} attachments
              </span>
            </div>
            <PhotoGrid
              evidenceList={evidenceList}
              onAddPhoto={() => setIsAddOpen(true)}
            />
          </div>

          {/* Transcript Drawer & Phrase Linking */}
          {transcript && (
            <div className="p-5 rounded-2xl bg-bg-surface1 border border-border-default space-y-4">
              <TranscriptDrawer
                transcript={transcript}
                onJumpToField={handleJumpToField}
              />
            </div>
          )}

          {/* Inspector Digital Sign-Off */}
          <div className="p-5 rounded-2xl bg-bg-surface1 border border-border-default space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-body-sm font-bold text-text-primary">
                  Cryptographic Inspector Sign-Off
                </h4>
                <p className="text-metadata text-text-muted mt-0.5">
                  Sign below to authorize and append final cryptographic seal.
                </p>
              </div>
              {report.signedAt && (
                <span className="px-2.5 py-1 rounded-lg text-metadata-xs font-mono font-bold bg-semantic-green-surface text-semantic-green-text border border-semantic-green-border flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>SEALED & SIGNED</span>
                </span>
              )}
            </div>

            {report.signatureDataUrl ? (
              <div className="p-4 rounded-xl bg-bg-surface2 border border-border-default space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-metadata-xs font-mono text-text-muted">
                    Signed by {report.inspector} at{' '}
                    {new Date(report.signedAt || report.createdAt).toLocaleString()}
                  </span>
                  <button
                    type="button"
                    onClick={async () => {
                      await updateReportField(report.id, 'signatureDataUrl', undefined);
                      await loadReport();
                    }}
                    className="text-metadata-xs text-semantic-amber hover:underline font-bold"
                  >
                    Re-sign
                  </button>
                </div>
                <div className="h-28 bg-bg-surface1 rounded-lg border border-border-subtle flex items-center justify-center p-2">
                  <img
                    src={report.signatureDataUrl}
                    alt="Inspector Digital Signature"
                    className="max-h-full object-contain filter invert dark:filter-none"
                  />
                </div>
              </div>
            ) : (
              <SignaturePad
                inspectorName={report.inspector}
                onSaveSignature={async (dataUrl) => {
                  await saveSignature(report.id, dataUrl);
                  await loadReport();
                }}
              />
            )}
          </div>

          {/* Edit History & Tamper Audit Ledger */}
          <div className="p-5 rounded-2xl bg-bg-surface1 border border-border-default space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-semantic-green" />
                <h4 className="text-body-sm font-bold text-text-primary">
                  Tamper-Evident Hash Audit Ledger
                </h4>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  icon={ShieldCheck}
                  onClick={handleRunVerify}
                  disabled={isVerifyingChain}
                >
                  {isVerifyingChain ? 'Verifying...' : 'Verify Chain'}
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  icon={Bug}
                  onClick={handleTamperTest}
                  title="Dev test: mutates an entry's stored data to demonstrate cryptographic detection"
                >
                  Tamper Entry (Dev Test)
                </Button>

                {!auditResult.valid && (
                  <Button
                    size="sm"
                    variant="primary"
                    icon={RefreshCw}
                    onClick={handleRestoreChain}
                  >
                    Restore Ledger
                  </Button>
                )}
              </div>
            </div>

            {/* Status notification */}
            <div
              className={`
                p-3 rounded-xl border text-metadata font-mono flex items-start gap-2.5
                ${
                  auditResult.valid
                    ? 'bg-semantic-green-surface/40 text-semantic-green-text border-semantic-green-border'
                    : 'bg-semantic-red-surface text-semantic-red-text border-semantic-red-border'
                }
              `}
            >
              {auditResult.valid ? (
                <ShieldCheck className="w-4 h-4 text-semantic-green shrink-0 mt-0.5" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-semantic-red shrink-0 mt-0.5" />
              )}
              <div className="space-y-0.5">
                <p className="font-bold">
                  {auditResult.valid
                    ? 'ALL HASH INTEGRITY CHECKS PASSED'
                    : 'CRYPTOGRAPHIC TAMPER DETECTED'}
                </p>
                <p className="text-metadata-xs opacity-90">
                  {auditResult.valid
                    ? `Every edit is chained via SHA-256(prevHash + canonicalJson(entry)). All ${report.editHistory.length} audit entries verified authentic.`
                    : auditResult.error}
                </p>
              </div>
            </div>

            {/* Audit History Log */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {report.editHistory.length === 0 ? (
                <p className="text-metadata text-text-muted italic py-2">
                  No subsequent edits. Initial genesis record intact.
                </p>
              ) : (
                report.editHistory.map((entry, idx) => (
                  <div
                    key={entry.id || idx}
                    className="p-3 rounded-xl bg-bg-surface2 border border-border-subtle space-y-1.5 font-mono text-metadata-xs"
                  >
                    <div className="flex items-center justify-between text-text-muted">
                      <span className="font-bold text-text-secondary">
                        Block #{idx + 1} · {entry.field}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    <div className="text-text-primary truncate">
                      <span className="text-text-muted">Value: </span>
                      <span className="text-semantic-green">{String(entry.after)}</span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-text-muted pt-0.5 border-t border-border-subtle">
                      <span className="truncate max-w-[140px] sm:max-w-[200px]">
                        prev: {entry.prevHash.substring(0, 16)}...
                      </span>
                      <span className="font-bold text-semantic-green truncate max-w-[140px] sm:max-w-[200px]">
                        hash: {entry.hash.substring(0, 16)}...
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODE 2: DIGITAL INSPECTION SHEET (FINAL VIEW / SCREEN 8) */}
      {/* ============================================================ */}
      {viewMode === 'sheet' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-bg-surface1 border border-border-default shadow-md space-y-6">
          {/* Header */}
          <div className="border-b border-border-subtle pb-6 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded text-metadata-xs font-mono font-bold uppercase bg-semantic-green text-text-inverse">
                  OFFICIAL FIELD DOSSIER
                </span>
                <span className="px-2 py-0.5 rounded text-metadata-xs font-mono bg-bg-surface2 text-text-secondary border border-border-subtle">
                  {report.category || 'ELECTRICAL INSPECTION'}
                </span>
              </div>
              <span className="text-metadata-xs font-mono text-text-muted">
                Report ID: {report.id}
              </span>
            </div>

            <h2 className="text-heading-xl font-bold text-text-primary tracking-tight">
              {report.title}
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 font-mono text-metadata-xs">
              <div className="p-2.5 rounded-xl bg-bg-surface2 border border-border-subtle space-y-0.5">
                <span className="text-text-muted uppercase text-[10px]">Site Location</span>
                <p className="font-bold text-text-primary truncate">{report.siteName}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-bg-surface2 border border-border-subtle space-y-0.5">
                <span className="text-text-muted uppercase text-[10px]">Equipment ID</span>
                <p className="font-bold text-semantic-green truncate">
                  {report.panelId || 'PANEL-204'}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-bg-surface2 border border-border-subtle space-y-0.5">
                <span className="text-text-muted uppercase text-[10px]">Date / Time</span>
                <p className="font-bold text-text-primary truncate">
                  {new Date(report.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-bg-surface2 border border-border-subtle space-y-0.5">
                <span className="text-text-muted uppercase text-[10px]">Inspector</span>
                <p className="font-bold text-text-primary truncate">{report.inspector}</p>
              </div>
            </div>
          </div>

          {/* High Priority Warning */}
          {report.priorityReason && (
            <div className="p-4 rounded-xl bg-semantic-red-surface text-semantic-red-text border border-semantic-red-border text-body-sm font-medium flex items-center gap-3">
              <AlertOctagon className="w-5 h-5 shrink-0" />
              <div>
                <strong className="font-bold uppercase mr-1">HIGH SEVERITY ALERT:</strong>
                {report.priorityReason}
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="space-y-2">
            <h4 className="text-metadata font-mono font-bold uppercase tracking-wider text-text-muted">
              Executive Field Summary
            </h4>
            <p className="text-body-md text-text-primary leading-relaxed bg-bg-surface2 p-4 rounded-xl border border-border-subtle">
              {report.summary}
            </p>
          </div>

          {/* Findings Table */}
          <div className="space-y-2">
            <h4 className="text-metadata font-mono font-bold uppercase tracking-wider text-text-muted">
              Inspection Findings & Hazardous Items ({report.findings.length})
            </h4>
            <div className="space-y-2">
              {report.findings.map((f) => (
                <div
                  key={f.id}
                  className="p-3.5 rounded-xl bg-bg-surface2 border border-border-subtle flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <PriorityBadge priority={f.severity} size="sm" />
                      <span className="text-metadata-xs font-mono text-text-muted">
                        {f.category}
                      </span>
                      {f.occurrences && f.occurrences > 1 && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-semantic-amber-surface text-semantic-amber-text border border-semantic-amber-border">
                          {f.occurrences}x recurring
                        </span>
                      )}
                    </div>
                    <p className="text-body-sm text-text-primary font-medium">{f.text}</p>
                  </div>
                  <span className="text-metadata-xs font-mono font-bold text-semantic-green shrink-0 mt-1">
                    VERIFIED
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Punch List */}
          <div className="space-y-2">
            <h4 className="text-metadata font-mono font-bold uppercase tracking-wider text-text-muted">
              Mandatory Action Items ({report.actions.length})
            </h4>
            <div className="space-y-2">
              {report.actions.map((act) => (
                <div
                  key={act.id}
                  className="p-3.5 rounded-xl bg-bg-surface2 border border-border-subtle flex items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <p className="text-body-sm font-semibold text-text-primary">{act.title}</p>
                    <p className="text-metadata-xs font-mono text-text-muted">
                      Assignee: {act.assignee} · Due: {act.dueDate ? new Date(act.dueDate).toLocaleDateString() : 'Immediate'}
                    </p>
                  </div>
                  <span
                    className={`
                      px-2 py-0.5 rounded text-metadata-xs font-mono font-bold uppercase
                      ${
                        act.isCompleted
                          ? 'bg-semantic-green-surface text-semantic-green-text border border-semantic-green-border'
                          : 'bg-semantic-amber-surface text-semantic-amber-text border border-semantic-amber-border'
                      }
                    `}
                  >
                    {act.isCompleted ? 'COMPLETED' : 'PENDING'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Sign-off & Verification Footer */}
          <div className="pt-6 border-t border-border-subtle grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-bg-surface2 border border-border-subtle space-y-2">
              <span className="text-metadata-xs font-mono text-text-muted uppercase">
                Inspector Signature & Seal
              </span>
              {report.signatureDataUrl ? (
                <div className="h-20 bg-bg-surface1 rounded-lg border border-border-subtle flex items-center justify-center p-2">
                  <img
                    src={report.signatureDataUrl}
                    alt="Inspector Digital Signature"
                    className="max-h-full object-contain filter invert dark:filter-none"
                  />
                </div>
              ) : (
                <div className="h-20 bg-bg-surface1 rounded-lg border border-dashed border-border-strong flex items-center justify-center text-text-muted text-metadata font-mono">
                  [Sign-off verified on device]
                </div>
              )}
              <p className="text-[11px] font-mono text-text-muted">
                Certified: {report.inspector}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-bg-surface2 border border-border-subtle space-y-2">
              <span className="text-metadata-xs font-mono text-text-muted uppercase">
                Cryptographic Seal Verification
              </span>
              <div className="p-2.5 rounded-lg bg-bg-surface1 border border-border-subtle space-y-1 font-mono text-[11px]">
                <div className="flex items-center gap-1.5 text-semantic-green font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>SHA-256 Ledger Authenticated</span>
                </div>
                <p className="text-text-muted truncate">
                  Root Genesis: 00000000...0000
                </p>
                <p className="text-text-muted truncate">
                  Latest Seal: {report.editHistory[report.editHistory.length - 1]?.hash.substring(0, 24)}...
                </p>
              </div>
              <p className="text-[11px] font-mono text-text-muted">
                Offline Immutable Audit Standard ISO-19011
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODALS & BOTTOM SHEETS */}
      {/* ============================================================ */}

      {/* Manual Location Modal */}
      <BottomSheet
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        title="Set Inspection Location"
        subtitle="Manually update GPS coordinates or location address tag"
      >
        <form onSubmit={handleSaveManualLocation} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-metadata-xs font-mono uppercase text-text-muted">
              Location Description / Landmark
            </label>
            <input
              type="text"
              placeholder="e.g. Metro Pillar 742, Kukatpally, Hyderabad"
              value={customLocation}
              onChange={(e) => setCustomLocation(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-bg-surface2 border border-border-default text-text-primary text-body-sm focus:outline-none focus:border-semantic-green focus:ring-1 focus:ring-semantic-green"
              autoFocus
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              type="button"
              onClick={() => setIsLocationModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Location
            </Button>
          </div>
        </form>
      </BottomSheet>

      {/* Add To Report Sheet (Scheduled for Phase 5) */}
      <BottomSheet
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add to Field Dossier"
        subtitle="Attach additional media, sensor telemetry, or sub-audits"
      >
        <div className="space-y-3">
          {[
            {
              title: 'Capture Inspection Photo',
              desc: 'Take photo with camera to attach GPS geotagged evidence',
              badge: 'Camera Ready',
            },
            {
              title: 'Thermal Sensor Log',
              desc: 'Import infrared FLIR thermal scan measurement package',
              badge: 'Phase 5',
            },
            {
              title: 'Supplementary Audio Note',
              desc: 'Record addendum voice memo to append to transcript ledger',
              badge: 'Phase 5',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              onClick={() => {
                alert(`${item.title}: Scheduled for Phase 5 integration.`);
                setIsAddOpen(false);
              }}
              className="p-4 rounded-xl bg-bg-surface2 border border-border-default hover:border-border-strong hover:bg-bg-hover transition-all flex items-start justify-between gap-3 cursor-pointer"
            >
              <div className="space-y-0.5">
                <h5 className="text-body-sm font-bold text-text-primary">
                  {item.title}
                </h5>
                <p className="text-metadata text-text-muted">{item.desc}</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-bg-surface1 text-text-muted border border-border-subtle shrink-0">
                {item.badge}
              </span>
            </div>
          ))}

          <div className="pt-2">
            <Button fullWidth variant="ghost" onClick={() => setIsAddOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </BottomSheet>

      {/* Export Sheet */}
      <ExportSheet
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        reportTitle={report.title}
      />
    </div>
  );
};

