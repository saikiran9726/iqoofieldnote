import React from 'react';
import { ShieldCheck, Check, Repeat, MapPin } from 'lucide-react';
import type { Finding } from '../shared/types';
import { PriorityBadge } from './PriorityBadge';
import { ConfidenceBadge } from './ConfidenceBadge';

export interface FindingCardProps {
  finding: Finding;
  onVerify?: (findingId: string) => void;
}

export const FindingCard: React.FC<FindingCardProps> = ({ finding, onVerify }) => {
  return (
    <div className="p-4 rounded-xl bg-bg-surface1 border border-border-default space-y-2.5 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <PriorityBadge priority={finding.severity} size="sm" />
          <ConfidenceBadge confidence={finding.confidence} size="sm" />
          <span className="px-2 py-0.5 rounded text-metadata-xs font-mono bg-bg-surface2 text-text-muted border border-border-subtle">
            {finding.category}
          </span>
          {finding.isNew && (
            <span className="px-2 py-0.5 rounded text-metadata-xs font-mono font-bold bg-semantic-amber-surface text-semantic-amber-text border border-semantic-amber-border">
              [NEW]
            </span>
          )}
          {finding.occurrences && finding.occurrences > 1 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-metadata-xs font-mono font-bold bg-semantic-amber-surface text-semantic-amber-text border border-semantic-amber-border">
              <Repeat className="w-2.5 h-2.5" />
              {finding.occurrences}x recurring
            </span>
          )}
        </div>

        {onVerify && !finding.isVerified && (
          <button
            type="button"
            onClick={() => onVerify(finding.id)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-metadata-xs font-semibold bg-semantic-green/15 text-semantic-green border border-semantic-green/30 hover:bg-semantic-green/25 active:scale-95 transition-all"
          >
            <Check className="w-3 h-3" />
            <span>Verify</span>
          </button>
        )}

        {finding.isVerified && (
          <span className="inline-flex items-center gap-1 text-metadata-xs font-mono font-bold text-semantic-green">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>VERIFIED</span>
          </span>
        )}
      </div>

      <p className="text-body-sm text-text-primary leading-relaxed">
        {finding.text}
      </p>

      {finding.locationDetails && (
        <div className="flex items-center gap-1 text-metadata-xs text-text-muted font-mono">
          <MapPin className="w-3 h-3 text-semantic-green" />
          <span>{finding.locationDetails}</span>
        </div>
      )}
    </div>
  );
};
