import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, RotateCcw } from 'lucide-react';
import { EmptyState, ReportCard, QuestionCard, Button } from '../../components';
import { useReportsStore } from '../../lib/stores';
import { resetDemoData } from '../../data/db';

export const ReportsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { reports, loadReports, assignMissingEntity } = useReportsStore();

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const heroReport = reports.find((r) => r.isHero);

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

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            icon={RotateCcw}
            onClick={async () => {
              await resetDemoData();
              await loadReports();
            }}
          >
            Reset Demo Data
          </Button>
        </div>
      </div>

      {/* Missing Panel ID Prompt on Hero Report if unresolved */}
      {heroReport && heroReport.isPanelIdMissing && (
        <QuestionCard
          question="Substation Panel identifier was not stated in the voice memo. Assign to PANEL-204 based on GPS coordinates?"
          missingField="Panel ID"
          suggestedValue="PANEL-204"
          onResolve={async (val) => {
            await assignMissingEntity(heroReport.id, 'panelId', val);
            await loadReports();
          }}
        />
      )}

      {reports.length === 0 ? (
        <EmptyState
          icon={Plus}
          badge="Zero Dossiers"
          title="No Inspection Reports Generated"
          description="Structured inspection dossiers and site logs will appear here once audio or notes are compiled by the on-device intelligence engine."
          actions={[
            {
              label: 'Load Demo Reports',
              icon: Plus,
              onClick: async () => {
                await resetDemoData();
                await loadReports();
              },
              variant: 'primary',
            },
          ]}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-metadata font-mono font-medium text-text-muted uppercase tracking-wider">
              Compiled Field Dossiers ({reports.length})
            </span>
          </div>

          <div className="space-y-3.5">
            {reports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onClick={() => {
                  navigate(`/reports/${report.id}`);
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
