import React from 'react';
import { ShieldCheck, AlertCircle, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useThemeStore } from '../lib/theme';
import type { ConfidenceBreakdown } from '../shared/types';

export interface ConfidenceBadgeProps {
  confidence?: number; // 0.0 - 1.0 (or 0 - 100)
  size?: 'sm' | 'md' | 'lg';
  showPercent?: boolean;
  isMissing?: boolean;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({
  confidence,
  size = 'md',
  showPercent = true,
  isMissing = false,
}) => {
  if (isMissing || confidence === undefined || confidence <= 0) {
    const isSm = size === 'sm';
    return (
      <span
        className={`
          inline-flex items-center gap-1 font-mono font-semibold rounded-md border select-none transition-colors
          ${isSm ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-metadata-xs'}
          bg-semantic-amber-surface text-semantic-amber-text border-semantic-amber-border
        `}
        title="Field requires human review or is missing"
      >
        <HelpCircle className={isSm ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
        <span>MISSING</span>
      </span>
    );
  }

  const normConfidence = confidence > 1 ? confidence / 100 : confidence;
  const percent = Math.round(normConfidence * 100);

  let label = 'HIGH CONFIDENCE';
  let Icon = ShieldCheck;
  let classes = 'bg-semantic-green-surface text-semantic-green-text border-semantic-green-border';

  if (normConfidence < 0.85) {
    label = 'REVIEW';
    Icon = AlertCircle;
    classes = 'bg-semantic-amber-surface text-semantic-amber-text border-semantic-amber-border';
  }

  const isSm = size === 'sm';
  const isLg = size === 'lg';

  return (
    <span
      className={`
        inline-flex items-center gap-1 font-mono font-semibold rounded-md border select-none transition-colors
        ${isSm ? 'px-1.5 py-0.5 text-[10px]' : isLg ? 'px-2.5 py-1 text-body-xs' : 'px-2 py-0.5 text-metadata-xs'}
        ${classes}
      `}
      title={`AI Model Confidence: ${percent}% (${label})`}
    >
      <Icon className={isSm ? 'w-2.5 h-2.5' : isLg ? 'w-3.5 h-3.5' : 'w-3 h-3'} />
      <span>{label}</span>
      {showPercent && <span className="opacity-80">({percent}%)</span>}
    </span>
  );
};

export interface ConfidenceBreakdownProps {
  breakdown?: ConfidenceBreakdown;
  overall?: number;
  className?: string;
}

export const ConfidenceBreakdownCard: React.FC<ConfidenceBreakdownProps> = ({
  breakdown = {
    findings: 0.94,
    category: 0.97,
    deadline: 0.81,
    location: 0.99,
  },
  overall = 0.94,
  className = '',
}) => {
  const prefersReducedMotion = useThemeStore((s) => s.prefersReducedMotion);

  const items = [
    { label: 'Category Extraction', key: 'category', value: breakdown.category },
    { label: 'Findings & Hazards', key: 'findings', value: breakdown.findings },
    { label: 'Deadline & Timings', key: 'deadline', value: breakdown.deadline },
    { label: 'Location & Geofence', key: 'location', value: breakdown.location ?? 0.99 },
  ];

  return (
    <div className={`p-4 rounded-2xl bg-bg-surface1 border border-border-default space-y-3.5 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-semantic-green" />
          <h4 className="text-body-sm font-bold text-text-primary">
            AI Model Confidence Score
          </h4>
        </div>
        <ConfidenceBadge confidence={overall} size="md" />
      </div>

      <div className="space-y-2.5 pt-1">
        {items.map((item) => {
          const val = item.value > 1 ? item.value / 100 : item.value;
          const pct = Math.round(val * 100);
          const isReview = val < 0.85;

          return (
            <div key={item.key} className="space-y-1">
              <div className="flex items-center justify-between text-metadata-xs font-mono">
                <span className="text-text-muted">{item.label}</span>
                <span className={isReview ? 'text-semantic-amber-text font-bold' : 'text-semantic-green font-bold'}>
                  {pct}% · {isReview ? 'REVIEW' : 'HIGH CONFIDENCE'}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-bg-surface2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={
                    prefersReducedMotion
                      ? { duration: 0 }
                      : { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
                  }
                  className={`h-full rounded-full ${
                    isReview ? 'bg-semantic-amber' : 'bg-semantic-green'
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

