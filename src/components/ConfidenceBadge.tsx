import React from 'react';
import { ShieldCheck, Check, AlertCircle } from 'lucide-react';

export interface ConfidenceBadgeProps {
  confidence: number; // 0.0 - 1.0 (or 0 - 100)
  size?: 'sm' | 'md';
  showPercent?: boolean;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({
  confidence,
  size = 'md',
  showPercent = true,
}) => {
  const normConfidence = confidence > 1 ? confidence / 100 : confidence;
  const percent = Math.round(normConfidence * 100);

  let label = 'VERIFIED';
  let Icon = ShieldCheck;
  let classes = 'bg-semantic-green-surface text-semantic-green-text border-semantic-green-border';

  if (normConfidence < 0.75) {
    label = 'REVIEW';
    Icon = AlertCircle;
    classes = 'bg-semantic-amber-surface text-semantic-amber-text border-semantic-amber-border';
  } else if (normConfidence < 0.9) {
    label = 'GOOD';
    Icon = Check;
    classes = 'bg-bg-surface2 text-text-primary border-border-default';
  }

  const isSm = size === 'sm';

  return (
    <span
      className={`
        inline-flex items-center gap-1 font-mono font-semibold rounded-md border select-none transition-colors
        ${isSm ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-metadata-xs'}
        ${classes}
      `}
      title={`AI Model Confidence: ${percent}% (${label})`}
    >
      <Icon className={isSm ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
      <span>{label}</span>
      {showPercent && <span className="opacity-80">({percent}%)</span>}
    </span>
  );
};
