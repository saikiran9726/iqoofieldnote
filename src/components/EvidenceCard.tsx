import React from 'react';
import { Camera, MapPin, Clock, FileAudio, Activity } from 'lucide-react';
import type { Evidence } from '../shared/types';

export interface EvidenceCardProps {
  evidence: Evidence;
  onClick?: () => void;
}

export const EvidenceCard: React.FC<EvidenceCardProps> = ({ evidence, onClick }) => {
  const Icon = evidence.type === 'photo' ? Camera : evidence.type === 'audio' ? FileAudio : Activity;

  return (
    <div
      onClick={onClick}
      className="p-4 rounded-xl bg-bg-surface1 border border-border-default hover:border-border-strong transition-all space-y-3"
    >
      {/* Visual Placeholder / Image Area */}
      <div className="w-full h-32 rounded-lg bg-bg-surface2 border border-border-subtle flex flex-col items-center justify-center text-text-muted space-y-1 relative overflow-hidden">
        <Icon className="w-8 h-8 text-semantic-green opacity-80" />
        <span className="text-metadata-xs font-mono uppercase tracking-wider">
          Evidence Type: {evidence.type}
        </span>
      </div>

      {evidence.caption && (
        <p className="text-body-sm font-medium text-text-primary leading-snug">
          {evidence.caption}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between text-metadata text-text-muted pt-1 border-t border-border-subtle">
        <span className="flex items-center gap-1 font-mono text-metadata-xs">
          <Clock className="w-3 h-3" />
          {new Date(evidence.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
        {evidence.geo && (
          <span className="flex items-center gap-1 font-mono text-metadata-xs text-semantic-green">
            <MapPin className="w-3 h-3" />
            {evidence.geo.latitude.toFixed(4)}, {evidence.geo.longitude.toFixed(4)}
          </span>
        )}
      </div>
    </div>
  );
};
