import { Calendar, User, ChevronRight, AlertCircle } from 'lucide-react';
import type { Report } from '../shared/types';
import { PriorityBadge } from './PriorityBadge';
import { ConfidenceBadge } from './ConfidenceBadge';

export interface ReportCardProps {
  report: Report;
  onClick?: () => void;
}

export const ReportCard: React.FC<ReportCardProps> = ({ report, onClick }) => {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      className="p-5 rounded-2xl bg-bg-surface1 border border-border-default hover:border-border-strong hover:bg-bg-surface2/40 transition-all cursor-pointer space-y-3.5 select-none focus:outline-none focus:border-semantic-green shadow-sm"
    >
      {/* Top Meta Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2 py-0.5 rounded text-metadata-xs font-mono font-medium bg-bg-surface2 text-text-secondary border border-border-subtle truncate">
              {report.siteName}
            </span>
            <span className="flex items-center gap-1 text-metadata-xs text-text-muted font-mono">
              <Calendar className="w-3 h-3" />
              {new Date(report.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>

          <h3 className="text-body-md font-bold text-text-primary tracking-tight truncate">
            {report.title}
          </h3>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <PriorityBadge priority={report.priority} size="sm" />
          <ConfidenceBadge confidence={report.overallConfidence} size="sm" showPercent={false} />
        </div>
      </div>

      {/* Summary Snippet */}
      <p className="text-body-sm text-text-secondary leading-relaxed line-clamp-2">
        {report.summary}
      </p>

      {/* Priority reason if High / Critical */}
      {report.priorityReason && (report.priority === 'high' || report.priority === 'critical') && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-semantic-red-surface text-semantic-red-text border border-semantic-red-border text-metadata font-medium">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{report.priorityReason}</span>
        </div>
      )}

      {/* Footer Details & Counts */}
      <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-metadata text-text-muted">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <User className="w-3 h-3 text-text-muted" />
            <span className="text-text-primary font-mono text-metadata-xs">{report.inspector}</span>
          </span>
          <span>
            Findings: <strong className="text-text-primary font-mono">{report.findings.length}</strong>
          </span>
          <span>
            Tasks: <strong className="text-semantic-amber font-mono">{report.actions.length}</strong>
          </span>
        </div>

        <div className="flex items-center gap-1 text-semantic-green font-semibold hover:translate-x-0.5 transition-transform">
          <span className="text-metadata-xs">View</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};
