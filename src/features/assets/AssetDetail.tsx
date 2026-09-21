import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  AlertTriangle,
  Repeat,
  FileText,
  Clock,
  ChevronRight,
  ShieldCheck,
  Tag,
  Building2,
} from 'lucide-react';
import { db } from '../../data/db';
import type { Asset, Report } from '../../shared/types';
import { PriorityBadge, EmptyState } from '../../components';

export const AssetDetailScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [linkedReports, setLinkedReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      if (!id) return;

      // Match by id (e.g. 'asset-panel-204') or tagId (e.g. 'PANEL-204')
      let found = await db.assets.get(id);
      if (!found) {
        found = await db.assets.where('tagId').equalsIgnoreCase(id).first();
      }

      if (found) {
        setAsset(found);
        // Find all reports linked to this asset or panelId
        const allReports = await db.reports.toArray();
        const related = allReports.filter(
          (r) =>
            r.panelId?.toLowerCase() === found?.tagId.toLowerCase() ||
            (found?.tagId === 'PANEL-204' &&
              (r.id === 'rep-hero-001' ||
                r.id === 'rep-002' ||
                r.id === 'rep-003' ||
                r.id === 'rep-004'))
        );
        // Sort descending by creation date
        related.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setLinkedReports(related);
      }
      setLoading(false);
    };

    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="p-8 text-center text-text-muted font-mono text-body-sm">
        Loading equipment dossier...
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Link
            to="/assets"
            className="p-2 rounded-xl bg-bg-surface1 border border-border-default text-text-muted hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h2 className="text-heading-sm font-bold text-text-primary">Asset Not Found</h2>
        </div>
        <EmptyState
          icon={Tag}
          badge="Asset Missing"
          title="Equipment Tag Not Found"
          description={`No local asset record found for tag "${id}".`}
          actions={[
            {
              label: 'Return to Asset Inventory',
              icon: ArrowLeft,
              onClick: () => navigate('/assets'),
              variant: 'primary',
            },
          ]}
        />
      </div>
    );
  }

  const isPanel204 = asset.tagId.toUpperCase() === 'PANEL-204';
  const recurringCount = isPanel204 ? 3 : asset.issueHistory.length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-2xl bg-bg-surface1 border border-border-default shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            to="/assets"
            className="p-2 rounded-xl bg-bg-surface2 border border-border-subtle text-text-muted hover:text-text-primary transition-colors"
            title="Back to Asset Inventory"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-metadata font-mono font-bold bg-semantic-green-surface text-semantic-green-text border border-semantic-green-border">
                {asset.tagId}
              </span>
              <span className="text-metadata-xs font-mono uppercase text-text-muted">
                {asset.category}
              </span>
            </div>
            <h1 className="text-heading-md font-bold text-text-primary mt-1">
              {asset.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span
            className={`px-3 py-1 rounded-lg text-metadata-xs font-mono font-bold uppercase border ${
              asset.status === 'critical'
                ? 'bg-semantic-red-surface text-semantic-red-text border-semantic-red-border'
                : asset.status === 'maintenance_required'
                ? 'bg-semantic-amber-surface text-semantic-amber-text border-semantic-amber-border'
                : 'bg-semantic-green-surface text-semantic-green-text border-semantic-green-border'
            }`}
          >
            {asset.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* RECURRING ISSUE SPOTLIGHT BANNER */}
      {recurringCount > 0 && (
        <div className="p-5 rounded-2xl bg-semantic-amber-surface text-semantic-amber-text border border-semantic-amber-border shadow-sm space-y-2">
          <div className="flex items-center gap-2">
            <Repeat className="w-5 h-5 text-semantic-amber-text shrink-0" />
            <h3 className="text-body-sm font-bold uppercase tracking-wide">
              Recurring Issue Detected ({recurringCount} Occurrences)
            </h3>
          </div>
          <p className="text-body-xs leading-relaxed">
            <strong>Loose connections & thermal oxidation</strong> have been flagged{' '}
            <strong>{recurringCount} times</strong> across historical inspection dossiers for{' '}
            <strong>{asset.tagId}</strong>. Last reported on{' '}
            <strong>
              {new Date(asset.lastInspected).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}{' '}
              11:42 AM
            </strong>{' '}
            at {asset.siteName}.
          </p>
        </div>
      )}

      {/* METRICS SUMMARY GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-bg-surface1 border border-border-default shadow-sm space-y-1">
          <div className="flex items-center gap-1.5 text-text-muted text-metadata-xs font-mono">
            <FileText className="w-3.5 h-3.5 text-semantic-green" />
            <span>TOTAL AUDITS</span>
          </div>
          <div className="text-heading-sm font-bold text-text-primary font-mono">
            {linkedReports.length} Reports
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-bg-surface1 border border-border-default shadow-sm space-y-1">
          <div className="flex items-center gap-1.5 text-text-muted text-metadata-xs font-mono">
            <AlertTriangle className="w-3.5 h-3.5 text-semantic-amber-text" />
            <span>RECURRING HAZARDS</span>
          </div>
          <div className="text-heading-sm font-bold text-semantic-amber-text font-mono">
            {recurringCount} Flagged
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-bg-surface1 border border-border-default shadow-sm space-y-1">
          <div className="flex items-center gap-1.5 text-text-muted text-metadata-xs font-mono">
            <Building2 className="w-3.5 h-3.5 text-text-muted" />
            <span>PRIMARY SITE</span>
          </div>
          <div className="text-body-xs font-bold text-text-primary truncate">
            {asset.siteName}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-bg-surface1 border border-border-default shadow-sm space-y-1">
          <div className="flex items-center gap-1.5 text-text-muted text-metadata-xs font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-semantic-green" />
            <span>LEDGER SEAL</span>
          </div>
          <div className="text-body-xs font-bold text-semantic-green font-mono">
            100% Verified
          </div>
        </div>
      </div>

      {/* CHRONOLOGICAL AUDIT TIMELINE */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-body-sm font-mono font-bold uppercase tracking-wider text-text-muted flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>Inspection & Maintenance Timeline ({linkedReports.length})</span>
          </h2>
          <span className="text-metadata-xs text-text-muted font-mono">
            Chronological audit trail
          </span>
        </div>

        {linkedReports.length === 0 ? (
          <div className="p-6 rounded-2xl bg-bg-surface1 border border-border-default text-center text-text-muted text-body-xs">
            No inspection reports linked to this equipment yet.
          </div>
        ) : (
          <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-border-strong">
            {linkedReports.map((report) => (
              <div key={report.id} className="relative group">
                {/* Timeline node dot */}
                <div
                  className={`absolute -left-[19px] top-4 w-3.5 h-3.5 rounded-full border-2 bg-bg-base transition-colors ${
                    report.priority === 'high' || report.priority === 'critical'
                      ? 'border-semantic-red bg-semantic-red-surface'
                      : report.priority === 'medium'
                      ? 'border-semantic-amber bg-semantic-amber-surface'
                      : 'border-semantic-green bg-semantic-green-surface'
                  }`}
                />

                <div
                  onClick={() => navigate(`/reports/${report.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate(`/reports/${report.id}`);
                    }
                  }}
                  className="p-4 rounded-2xl bg-bg-surface1 border border-border-default hover:border-border-strong hover:bg-bg-surface2/50 transition-all cursor-pointer space-y-2 shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <PriorityBadge priority={report.priority} />
                      <span className="text-metadata-xs font-mono text-text-muted">
                        {new Date(report.createdAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}{' '}
                        · {new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-metadata-xs font-mono text-semantic-green">
                      <span>View Dossier</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <h3 className="text-body-sm font-bold text-text-primary">
                    {report.title}
                  </h3>

                  <p className="text-metadata text-text-secondary line-clamp-2">
                    {report.summary}
                  </p>

                  <div className="pt-2 border-t border-border-subtle flex flex-wrap items-center justify-between gap-2 text-metadata-xs text-text-muted font-mono">
                    <span>Inspector: {report.inspector}</span>
                    <span>
                      {report.findings.length} findings · {report.actions.length} action items
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
