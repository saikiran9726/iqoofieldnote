import React, { useState } from 'react';
import type { Transcript, TranscriptSegment } from '../shared/types';
import { LanguageChip } from './LanguageChip';
import { ConfidenceBadge } from './ConfidenceBadge';
import { Clock, MessageSquareQuote, Play, Pause, Volume2, Sparkles } from 'lucide-react';
import { Button } from './Button';

export interface TranscriptDrawerProps {
  transcript: Transcript;
  activeSegmentIndex?: number;
  onSelectSegment?: (index: number, segment: TranscriptSegment) => void;
  onJumpToField?: (fieldId: string) => void;
}

export const TranscriptDrawer: React.FC<TranscriptDrawerProps> = ({
  transcript,
  activeSegmentIndex,
  onSelectSegment,
  onJumpToField,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTimeMs, setCurrentTimeMs] = useState<number>(0);

  // Link highlights within segments to report fields
  const getSegmentLink = (index: number): { targetId: string; label: string } | null => {
    if (index === 0) return { targetId: 'field-panelId', label: 'Linked: Panel ID & Loose Connections' };
    if (index === 1) return { targetId: 'field-finding-0', label: 'Linked: 3 Loose Connections + Cable Damage' };
    if (index === 2) return { targetId: 'field-action-0', label: 'Linked: Action Items & Deadline' };
    return null;
  };

  const togglePlayback = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      setCurrentTimeMs(0);
      const interval = setInterval(() => {
        setCurrentTimeMs((prev) => {
          if (prev >= transcript.audioDurationMs) {
            clearInterval(interval);
            setIsPlaying(false);
            return 0;
          }
          return prev + 500;
        });
      }, 500);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with audio scrubber */}
      <div className="p-4 rounded-2xl bg-bg-surface1 border border-border-default space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquareQuote className="w-4 h-4 text-semantic-green" />
            <h4 className="text-body-sm font-bold text-text-primary">
              Voice Transcript & Phrase Alignment
            </h4>
          </div>
          <span className="px-2 py-0.5 rounded text-metadata-xs font-mono bg-bg-surface2 text-text-secondary border border-border-subtle">
            Spoken in Telugu · English
          </span>
        </div>

        {/* Audio Scrubber Controls */}
        <div className="flex items-center gap-3 pt-1">
          <Button
            size="sm"
            variant="secondary"
            icon={isPlaying ? Pause : Play}
            onClick={togglePlayback}
          >
            {isPlaying ? 'Pause' : 'Play Audio'}
          </Button>

          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono text-text-muted">
              <span className="flex items-center gap-1">
                <Volume2 className="w-3 h-3" />
                {(currentTimeMs / 1000).toFixed(1)}s
              </span>
              <span>{(transcript.audioDurationMs / 1000).toFixed(1)}s</span>
            </div>
            <div className="w-full h-1.5 bg-bg-surface2 rounded-full overflow-hidden">
              <div
                className="h-full bg-semantic-green transition-all duration-300"
                style={{
                  width: `${Math.min(100, (currentTimeMs / transcript.audioDurationMs) * 100)}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Segments list with phrase linking */}
      <div className="space-y-2.5">
        {transcript.segments.map((seg, idx) => {
          const isSelected = activeSegmentIndex === idx;
          const link = getSegmentLink(idx);

          return (
            <div
              key={idx}
              onClick={() => {
                onSelectSegment?.(idx, seg);
                if (link && onJumpToField) {
                  onJumpToField(link.targetId);
                }
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onSelectSegment?.(idx, seg);
                  if (link && onJumpToField) {
                    onJumpToField(link.targetId);
                  }
                }
              }}
              className={`
                p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 select-none group
                ${
                  isSelected
                    ? 'bg-semantic-green/10 border-semantic-green shadow-sm'
                    : 'bg-bg-surface1 border-border-default hover:border-border-strong hover:bg-bg-surface2'
                }
              `}
              title="Tap to jump to linked field in the report"
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

              <p className="text-body-sm text-text-primary leading-relaxed font-sans group-hover:text-semantic-green transition-colors">
                {seg.text}
              </p>

              {link && (
                <div className="flex items-center gap-1 text-[11px] font-mono text-semantic-green font-medium pt-1">
                  <Sparkles className="w-3 h-3" />
                  <span>{link.label}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

