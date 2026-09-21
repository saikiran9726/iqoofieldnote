import React from 'react';
import { CheckCircle2, AlertTriangle, HelpCircle, AlertOctagon, Clock, Check } from 'lucide-react';

export type StatusType = 'verified' | 'review' | 'missing' | 'critical' | 'todo' | 'done';

export interface StatusIndicatorProps {
  status: StatusType;
  customText?: string;
  size?: 'sm' | 'md';
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  customText,
  size = 'md',
}) => {
  const config = {
    verified: {
      icon: CheckCircle2,
      text: 'VERIFIED',
      classes: 'bg-semantic-green-surface text-semantic-green-text border-semantic-green-border',
    },
    review: {
      icon: AlertTriangle,
      text: 'REVIEW REQUIRED',
      classes: 'bg-semantic-amber-surface text-semantic-amber-text border-semantic-amber-border',
    },
    missing: {
      icon: HelpCircle,
      text: 'MISSING',
      classes: 'bg-semantic-amber-surface text-semantic-amber-text border-semantic-amber-border border-dashed',
    },
    critical: {
      icon: AlertOctagon,
      text: 'CRITICAL',
      classes: 'bg-semantic-red-surface text-semantic-red-text border-semantic-red-border',
    },
    todo: {
      icon: Clock,
      text: 'TODO',
      classes: 'bg-bg-surface2 text-text-secondary border-border-default',
    },
    done: {
      icon: Check,
      text: 'COMPLETED',
      classes: 'bg-semantic-green-surface text-semantic-green-text border-semantic-green-border',
    },
  }[status];

  const Icon = config.icon;
  const label = customText || config.text;
  const isSm = size === 'sm';

  return (
    <span
      className={`
        inline-flex items-center gap-1 font-mono font-bold uppercase rounded-md border select-none transition-colors
        ${isSm ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-metadata-xs'}
        ${config.classes}
      `}
    >
      <Icon className={isSm ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
      <span>{label}</span>
    </span>
  );
};
