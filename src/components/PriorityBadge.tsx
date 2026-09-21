import React from 'react';
import { AlertOctagon, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import type { SeverityLevel } from '../shared/types';

export interface PriorityBadgeProps {
  priority: SeverityLevel;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  size = 'md',
  showLabel = true,
}) => {
  const config = {
    critical: {
      icon: AlertOctagon,
      label: 'CRITICAL',
      classes:
        'bg-semantic-red-surface text-semantic-red-text border-semantic-red-border',
    },
    high: {
      icon: AlertTriangle,
      label: 'HIGH',
      classes:
        'bg-semantic-amber-surface text-semantic-amber-text border-semantic-amber-border',
    },
    medium: {
      icon: Info,
      label: 'MEDIUM',
      classes:
        'bg-semantic-blue-surface text-semantic-blue-text border-semantic-blue-border',
    },
    low: {
      icon: CheckCircle2,
      label: 'LOW',
      classes:
        'bg-semantic-green-surface text-semantic-green-text border-semantic-green-border',
    },
  }[priority];

  const Icon = config.icon;
  const isSm = size === 'sm';

  return (
    <span
      className={`
        inline-flex items-center gap-1 font-mono font-bold uppercase tracking-wider rounded-md border select-none transition-colors
        ${isSm ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-metadata-xs'}
        ${config.classes}
      `}
      title={`Priority Level: ${config.label}`}
    >
      <Icon className={isSm ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
      {showLabel && <span>{config.label}</span>}
    </span>
  );
};
