import React, { useState } from 'react';
import { FileText, Plus, ShieldAlert, ChevronRight, Download, Calendar } from 'lucide-react';
import { EmptyState } from '../../components/EmptyState';
import type { FieldReport } from '../../shared/types';

export const ReportsScreen: React.FC = () => {
  const [reports, setReports] = useState<FieldReport[]>([]);

  const handleCreateSampleReport = () => {
    const sampleReport: FieldReport = {
      id: `rep-${Date.now()}`,
      createdAt: new Date().toISOString(),
      title: 'Substation Transformer B Inspection',
      siteName: 'Substation 4 - Sector 9',
      inspector: 'Field Eng. #104',
      summary: 'Annual dielectric oil analysis and thermal gradient inspection. High thermal signature on Phase B bushing connector.',
      hazards: ['High Voltage Arcing Risk', 'Hot Surface (>65°C)'],
      equipmentStatus: [
        { name: 'Phase A Bushing', condition: 'good' },
        { name: 'Phase B Bushing', condition: 'critical', notes: 'Contact resistance high (140 micro-ohms)' },
        { name: 'Phase C Bushing', condition: 'good' },
      ],
      tasksCount: 2,
    };
    setReports([sampleReport, ...reports]);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-bg-surface1 border border-border-default shadow-sm transition-colors">
        <div>
          <h2 className="text-heading-sm font-bold text-text-primary">
            Inspection Dossiers & Audits
          </h2>
          <p className="text-metadata text-text-muted mt-0.5">
            Auto-compiled from voice transcripts, sensor readings & notes
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreateSampleReport}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-body-sm font-semibold bg-semantic-green text-text-inverse hover:brightness-110 active:scale-[0.98] transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Inspection</span>
        </button>
      </div>

      {reports.length === 0 ? (
        <EmptyState
          icon={FileText}
          badge="Zero Dossiers"
          title="No Inspection Reports Generated"
          description="Structured inspection dossiers and site logs will appear here once audio or notes are compiled by the on-device intelligence engine."
          actions={[
            {
              label: 'Generate Sample Report',
              icon: Plus,
              onClick: handleCreateSampleReport,
              variant: 'primary',
            },
          ]}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-metadata font-mono font-medium text-text-muted uppercase tracking-wider">
              Compiled Reports ({reports.length})
            </span>
            <button
              type="button"
              onClick={() => setReports([])}
              className="text-metadata text-text-muted hover:text-semantic-red transition-colors"
            >
              Clear
            </button>
          </div>

          {reports.map((report) => (
            <div
              key={report.id}
              className="p-5 rounded-xl bg-bg-surface1 border border-border-default hover:border-border-strong transition-all space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-metadata-xs font-mono font-medium bg-bg-surface2 text-text-secondary border border-border-subtle">
                      {report.siteName}
                    </span>
                    <span className="flex items-center gap-1 text-metadata-xs text-text-muted font-mono">
                      <Calendar className="w-3 h-3" />
                      {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-body-lg font-bold text-text-primary">
                    {report.title}
                  </h3>
                </div>

                <button
                  type="button"
                  className="p-2 rounded-lg bg-bg-surface2 hover:bg-bg-hover text-text-secondary border border-border-default transition-colors"
                  title="Export report"
                  onClick={() => alert(`Offline report ${report.title} ready for PDF export.`)}
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>

              <p className="text-body-sm text-text-secondary leading-relaxed">
                {report.summary}
              </p>

              {report.hazards.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {report.hazards.map((h, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-metadata-xs font-semibold bg-semantic-red-surface text-semantic-red-text border border-semantic-red-border"
                    >
                      <ShieldAlert className="w-3 h-3" />
                      {h}
                    </span>
                  ))}
                </div>
              )}

              <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-metadata text-text-muted">
                <div className="flex items-center gap-3">
                  <span>Inspector: <strong className="text-text-primary font-mono">{report.inspector}</strong></span>
                  <span>Tasks: <strong className="text-semantic-amber font-mono">{report.tasksCount}</strong></span>
                </div>
                <button
                  type="button"
                  className="flex items-center gap-1 text-semantic-green font-medium hover:underline text-metadata"
                  onClick={() => alert(`Opening inspection dossier details for ${report.id}`)}
                >
                  <span>View Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
