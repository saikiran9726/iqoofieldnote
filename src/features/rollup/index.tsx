import React from 'react';
import { ArrowLeft, BarChart3, TrendingUp, AlertOctagon, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const RollupScreen: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link to="/more" className="p-1.5 rounded-lg bg-bg-surface1 border border-border-default text-text-muted hover:text-text-primary">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h2 className="text-heading-sm font-bold text-text-primary">Site Rollup & Telemetry</h2>
          <p className="text-metadata text-text-muted">On-device aggregate metrics and site audit summaries</p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-bg-surface1 border border-border-default space-y-1">
          <span className="text-metadata text-text-muted font-mono uppercase">Total Audits</span>
          <p className="text-heading-md font-bold text-text-primary">12</p>
          <span className="text-metadata-xs text-semantic-green flex items-center gap-1 font-mono">
            <TrendingUp className="w-3 h-3" /> +100% on-device
          </span>
        </div>

        <div className="p-4 rounded-xl bg-bg-surface1 border border-border-default space-y-1">
          <span className="text-metadata text-text-muted font-mono uppercase">Open Actions</span>
          <p className="text-heading-md font-bold text-semantic-amber">3</p>
          <span className="text-metadata-xs text-text-muted font-mono">1 critical priority</span>
        </div>

        <div className="p-4 rounded-xl bg-bg-surface1 border border-border-default space-y-1">
          <span className="text-metadata text-text-muted font-mono uppercase">Hazards Flagged</span>
          <p className="text-heading-md font-bold text-semantic-red">2</p>
          <span className="text-metadata-xs text-semantic-red flex items-center gap-1 font-mono">
            <AlertOctagon className="w-3 h-3" /> Action required
          </span>
        </div>

        <div className="p-4 rounded-xl bg-bg-surface1 border border-border-default space-y-1">
          <span className="text-metadata text-text-muted font-mono uppercase">Integrity Score</span>
          <p className="text-heading-md font-bold text-semantic-green">98%</p>
          <span className="text-metadata-xs text-semantic-green flex items-center gap-1 font-mono">
            <CheckCircle2 className="w-3 h-3" /> All verified
          </span>
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-bg-surface1 border border-border-default space-y-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-semantic-green" />
          <h3 className="text-body-sm font-bold text-text-primary">Local Telemetry Rollup</h3>
        </div>
        <p className="text-body-sm text-text-secondary leading-relaxed">
          Rollup analytics are computed entirely inside your browser client via IndexedDB aggregation. No telemetry or usage statistics are transmitted over the internet.
        </p>
      </div>
    </div>
  );
};
