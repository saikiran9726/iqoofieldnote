import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  ShieldCheck,
  Download,
  AlertOctagon,
} from 'lucide-react';
import {
  PriorityBadge,
  ConfidenceBadge,
  FindingCard,
  ActionCard,
  ReportField,
  Button,
  PhotoGrid,
  ExportSheet,
  QuestionCard,
} from '../../components';
import { useReportsStore } from '../../lib/stores';
import { db } from '../../data/db';
import type { Report, Evidence } from '../../shared/types';
import { verifyChain } from '../../lib/hashChain';

export const ReportDetailScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { updateReportField, undoReportEdit, verifyFinding, assignMissingEntity } = useReportsStore();
  const [report, setReport] = useState<Report | null>(null);
  const [evidenceList, setEvidenceList] = useState<Evidence[]>([]);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [hashStatus, setHashStatus] = useState<string>('Verifying SHA-256 seal...');
  const [isChainValid, setIsChainValid] = useState<boolean>(true);

  const loadReport = useCallback(async () => {
    if (!id) return;
    const found = await db.reports.get(id);
    if (found) {
      setReport(found);
      const evidence = await db.evidence.where('reportId').equals(id).toArray();
      setEvidenceList(evidence);

      // Verify hash chain
      const verification = await verifyChain(found.editHistory);
      if (verification.valid) {
        setHashStatus(`SHA-256 Seal Intact (${found.editHistory.length} audit entries)`);
        setIsChainValid(true);
      } else {
        setHashStatus(`Hash Tamper Warning: ${verification.error}`);
        setIsChainValid(false);
      }
    }
  }, [id]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

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
    <div className="space-y-6 max-w-3xl mx-auto pb-16">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          aria-label="Back to reports list"
          onClick={() => navigate('/reports')}
          className="p-2 rounded-xl bg-bg-surface1 border border-border-default text-text-muted hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            icon={Download}
            onClick={() => setIsExportOpen(true)}
          >
            Export Dossier
          </Button>
        </div>
      </div>

      {/* Hero Dossier Header */}
      <div className="p-6 rounded-3xl bg-bg-surface1 border border-border-default shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <PriorityBadge priority={report.priority} />
            <ConfidenceBadge confidence={report.overallConfidence} />
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

        {/* Priority reason line */}
        {report.priorityReason && (
          <div className="p-3 rounded-xl bg-semantic-red-surface text-semantic-red-text border border-semantic-red-border text-metadata font-medium flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 shrink-0" />
            <span>{report.priorityReason}</span>
          </div>
        )}

        {/* Missing Panel ID Prompt on Hero Report */}
        {report.isPanelIdMissing && (
          <QuestionCard
            question="Panel identifier is absent in recorded transcript. Assign to PANEL-204 based on GPS coordinates?"
            missingField="Panel ID"
            suggestedValue="PANEL-204"
            onResolve={async (val) => {
              await assignMissingEntity(report.id, 'panelId', val);
              await loadReport();
            }}
          />
        )}

        {/* Tamper-Evident Hash Chain Seal */}
        <div
          className={`
            px-3.5 py-2 rounded-xl text-metadata-xs font-mono flex items-center justify-between border
            ${
              isChainValid
                ? 'bg-semantic-green-surface/40 text-semantic-green-text border-semantic-green-border'
                : 'bg-semantic-red-surface text-semantic-red-text border-semantic-red-border'
            }
          `}
        >
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-semantic-green" />
            <span>{hashStatus}</span>
          </div>
          <span className="text-[10px] text-text-muted">Immutable Ledger</span>
        </div>
      </div>

      {/* Editable Fields Section */}
      <div className="space-y-3">
        <h3 className="text-body-sm font-mono font-bold uppercase tracking-wider text-text-muted px-1">
          Structured Fields & Tamper Audit
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ReportField
            label="Site Name"
            value={report.siteName}
            fieldKey="siteName"
            confidence={0.98}
            onSave={async (k, v) => {
              await updateReportField(report.id, k as keyof Report, v);
              await loadReport();
            }}
            onUndo={async () => {
              await undoReportEdit(report.id);
              await loadReport();
            }}
            canUndo={report.editHistory.length > 0}
          />

          <ReportField
            label="Assigned Equipment / Panel ID"
            value={report.panelId || ''}
            fieldKey="panelId"
            isMissing={report.isPanelIdMissing}
            confidence={report.panelId ? 0.95 : undefined}
            onSave={async (k, v) => {
              await updateReportField(report.id, k as keyof Report, v);
              await loadReport();
            }}
            onUndo={async () => {
              await undoReportEdit(report.id);
              await loadReport();
            }}
            canUndo={report.editHistory.length > 0}
          />

          <ReportField
            label="Inspector Name"
            value={report.inspector}
            fieldKey="inspector"
            confidence={0.99}
            onSave={async (k, v) => {
              await updateReportField(report.id, k as keyof Report, v);
              await loadReport();
            }}
          />

          <ReportField
            label="Status"
            value={report.status.toUpperCase()}
            fieldKey="status"
            confidence={1.0}
            onSave={async (k, v) => {
              await updateReportField(report.id, k as keyof Report, v);
              await loadReport();
            }}
          />
        </div>

        <ReportField
          label="Executive Summary"
          value={report.summary}
          fieldKey="summary"
          confidence={0.92}
          onSave={async (k, v) => {
            await updateReportField(report.id, k as keyof Report, v);
            await loadReport();
          }}
          onUndo={async () => {
            await undoReportEdit(report.id);
            await loadReport();
          }}
          canUndo={report.editHistory.length > 0}
        />
      </div>

      {/* Findings Section */}
      <div className="space-y-3">
        <h3 className="text-body-sm font-mono font-bold uppercase tracking-wider text-text-muted px-1">
          Extracted Findings ({report.findings.length})
        </h3>
        <div className="space-y-3">
          {report.findings.map((f) => (
            <FindingCard
              key={f.id}
              finding={f}
              onVerify={async (fid) => {
                await verifyFinding(report.id, fid);
                await loadReport();
              }}
            />
          ))}
        </div>
      </div>

      {/* Actions Section */}
      <div className="space-y-3">
        <h3 className="text-body-sm font-mono font-bold uppercase tracking-wider text-text-muted px-1">
          Action Items & Punch List ({report.actions.length})
        </h3>
        <div className="space-y-3">
          {report.actions.map((act) => (
            <ActionCard key={act.id} action={act} />
          ))}
        </div>
      </div>

      {/* Evidence Photo Grid */}
      <div className="p-5 rounded-2xl bg-bg-surface1 border border-border-default space-y-3">
        <PhotoGrid
          evidenceList={evidenceList}
          onAddPhoto={() => alert('Add Photo: Opens camera to capture and attach photo.')}
        />
      </div>

      {/* Export Sheet */}
      <ExportSheet
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        reportTitle={report.title}
      />
    </div>
  );
};
