import React from 'react';
import type { Transcript, TranscriptSegment } from '../shared/types';
import { LanguageChip } from './LanguageChip';
import { ConfidenceBadge } from './ConfidenceBadge';
import { Clock, MessageSquareQuote } from 'lucide-react';

export interface TranscriptDrawerProps {
  transcript: Transcript;
  activeSegmentIndex?: number;
  onSelectSegment?: (index: number, segment: TranscriptSegment) => void;
}

export const TranscriptDrawer: React.FC<TranscriptDrawerProps> = ({
  transcript,
  activeSegmentIndex,
  onSelectSegment,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <MessageSquareQuote className="w-4 h-4 text-semantic-green" />
          <h4 className="text-body-sm font-bold text-text-primary">
            Audio Transcript & Language Offsets
          </h4>
        </div>
        <span className="text-metadata-xs font-mono text-text-muted">
          Duration: {(transcript.audioDurationMs / 1000).toFixed(1)}s
        </span>
      </div>

      <div className="space-y-2.5">
        {transcript.segments.map((seg, idx) => {
          const isSelected = activeSegmentIndex === idx;
          return (
            <div
              key={idx}
              onClick={() => onSelectSegment?.(idx, seg)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onSelectSegment?.(idx, seg);
                }
              }}
              className={`
                p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 select-none
                ${
                  isSelected
                    ? 'bg-semantic-green/10 border-semantic-green/40 shadow-sm'
                    : 'bg-bg-surface1 border-border-default hover:border-border-strong hover:bg-bg-surface2'
                }
              `}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <LanguageChip language={seg.language} size="sm" />
                  <span className="flex items-center gap-1 text-[11px] font-mono text-text-muted">
                    <Clock className="w-2.5 h-2.5" />
                    {(seg.startMs / 1000).toFixed(1)}s – {(seg.endMs / 1000).toFixed(1)}s
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-text-muted">
                    chars [{seg.startChar}..{seg.endChar}]
                  </span>
                  <ConfidenceBadge confidence={seg.confidence} size="sm" />
                </div>
              </div>

              <p className="text-body-sm text-text-primary leading-relaxed font-sans">
                {seg.text}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
