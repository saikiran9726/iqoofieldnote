import { Calendar, ChevronRight, Repeat } from 'lucide-react';
import type { Asset } from '../shared/types';

export interface AssetCardProps {
  asset: Asset;
  onClick?: () => void;
}

export const AssetCard: React.FC<AssetCardProps> = ({ asset, onClick }) => {
  const statusClasses = {
    operational: 'bg-semantic-green-surface text-semantic-green-text border-semantic-green-border',
    maintenance_required: 'bg-semantic-amber-surface text-semantic-amber-text border-semantic-amber-border',
    critical: 'bg-semantic-red-surface text-semantic-red-text border-semantic-red-border',
    decommissioned: 'bg-bg-surface2 text-text-muted border-border-default',
  }[asset.status];

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
      className="p-5 rounded-2xl bg-bg-surface1 border border-border-default hover:border-border-strong hover:bg-bg-surface2/40 transition-all cursor-pointer space-y-3 select-none shadow-sm"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-metadata font-mono font-bold bg-bg-surface2 text-semantic-blue border border-border-subtle">
              {asset.tagId}
            </span>
            <span className="text-metadata text-text-muted truncate">
              {asset.category}
            </span>
          </div>
          <h3 className="text-body-md font-bold text-text-primary truncate">
            {asset.name}
          </h3>
        </div>

        <span className={`px-2.5 py-0.5 rounded-md text-metadata-xs font-mono font-bold uppercase border shrink-0 ${statusClasses}`}>
          {asset.status.replace('_', ' ')}
        </span>
      </div>

      {asset.issueHistory.length > 0 && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-semantic-amber-surface text-semantic-amber-text border border-semantic-amber-border text-metadata font-medium">
          <Repeat className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">
            {asset.issueHistory.length} recorded issues flagged across audits
          </span>
        </div>
      )}

      <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-metadata text-text-muted">
        <span className="flex items-center gap-1 font-mono text-metadata-xs">
          <Calendar className="w-3 h-3" />
          <span>Inspected: {new Date(asset.lastInspected).toLocaleDateString()}</span>
        </span>
        <span className="text-semantic-green font-semibold flex items-center gap-1 text-metadata-xs">
          <span>Details</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
};
