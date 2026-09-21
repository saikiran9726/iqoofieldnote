import React from 'react';
import { Globe2 } from 'lucide-react';

export interface LanguageChipProps {
  language: 'en' | 'te' | 'hi';
  label?: string;
  size?: 'sm' | 'md';
}

export const LanguageChip: React.FC<LanguageChipProps> = ({
  language,
  label,
  size = 'md',
}) => {
  const config = {
    en: { code: 'EN', name: 'English (Latin)', classes: 'bg-bg-surface2 text-text-secondary border-border-default' },
    te: { code: 'TE', name: 'Telugu (తెలుగు)', classes: 'bg-semantic-amber-surface text-semantic-amber-text border-semantic-amber-border' },
    hi: { code: 'HI', name: 'Hindi (हिन्दी)', classes: 'bg-semantic-blue-surface text-semantic-blue-text border-semantic-blue-border' },
  }[language];

  const isSm = size === 'sm';

  return (
    <span
      className={`
        inline-flex items-center gap-1 font-mono rounded-md border select-none transition-colors
        ${isSm ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-metadata-xs'}
        ${config.classes}
      `}
      title={`Language: ${config.name}`}
    >
      <Globe2 className={isSm ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
      <span className="font-bold">{config.code}</span>
      {label && <span className="font-sans font-normal ml-0.5">{label}</span>}
    </span>
  );
};
