import React from 'react';
import { Mic, FileSearch, ShieldCheck, FileCheck, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import type { EngineStage } from '../engine/types';

export interface ProcessingTimelineProps {
  currentStage: EngineStage;
  progressPercent: number;
  message?: string;
}

export const ProcessingTimeline: React.FC<ProcessingTimelineProps> = ({
  currentStage,
  progressPercent,
  message,
}) => {
  const steps: Array<{ stage: EngineStage; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { stage: 'transcribing', label: 'Transcribe Audio', icon: Mic },
    { stage: 'extracting', label: 'Extract Entities', icon: FileSearch },
    { stage: 'verifying', label: 'Cross-Verify', icon: ShieldCheck },
    { stage: 'building', label: 'Build Dossier', icon: FileCheck },
  ];

  const stageOrder: Record<EngineStage, number> = {
    idle: -1,
    transcribing: 0,
    extracting: 1,
    verifying: 2,
    building: 3,
    complete: 4,
    error: -2,
  };

  const currentIdx = stageOrder[currentStage];

  return (
    <div className="p-4 rounded-2xl bg-bg-surface1 border border-border-default space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-metadata-xs font-mono font-bold uppercase tracking-wider text-text-muted">
          On-Device Processing Pipeline
        </span>
        <span className="font-mono text-metadata font-bold text-semantic-green">
          {progressPercent}%
        </span>
      </div>

      {/* Steps Row */}
      <div className="grid grid-cols-4 gap-2">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isDone = currentIdx > idx || currentStage === 'complete';
          const isCurrent = currentIdx === idx;
          const isPending = currentIdx < idx && currentStage !== 'complete';

          return (
            <div key={step.stage} className="flex flex-col items-center text-center space-y-1.5">
              <div
                className={`
                  w-9 h-9 rounded-xl flex items-center justify-center transition-all border
                  ${
                    isDone
                      ? 'bg-semantic-green-surface text-semantic-green-text border-semantic-green-border'
                      : isCurrent
                      ? 'bg-semantic-green text-text-inverse border-semantic-green animate-pulse shadow-md shadow-semantic-green/20'
                      : isPending
                      ? 'bg-bg-surface2 text-text-muted border-border-subtle opacity-60'
                      : 'bg-semantic-red-surface text-semantic-red-text border-semantic-red-border'
                  }
                `}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : currentStage === 'error' ? (
                  <AlertCircle className="w-4 h-4" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>
              <span className={`text-[11px] font-medium leading-tight ${isCurrent ? 'text-text-primary font-bold' : 'text-text-muted'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Progress Message */}
      {message && (
        <div className="p-2.5 rounded-lg bg-bg-surface2/70 border border-border-subtle text-metadata font-mono text-text-secondary truncate">
          {message}
        </div>
      )}
    </div>
  );
};
