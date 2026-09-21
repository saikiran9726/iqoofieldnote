import React from 'react';
import { BottomSheet, Button } from '../../components';
import { FileAudio, Image, FileSpreadsheet, FileCode } from 'lucide-react';

export interface ImportSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOption?: (option: string) => void;
}

export const ImportSheet: React.FC<ImportSheetProps> = ({
  isOpen,
  onClose,
  onSelectOption,
}) => {
  const options = [
    {
      id: 'audio',
      title: 'Import Field Audio File',
      desc: 'Transcribe and extract findings from existing voice memos (.m4a, .wav, .webm, .mp3)',
      icon: FileAudio,
      badge: 'Local Whisper',
      comingLater: false,
    },
    {
      id: 'photos',
      title: 'Batch Import Inspection Photos',
      desc: 'Extract GPS EXIF tags and attach evidence to inspection dossiers',
      icon: Image,
      badge: 'Coming in Phase 5',
      comingLater: true,
    },
    {
      id: 'csv',
      title: 'Import Asset Registry (CSV)',
      desc: 'Bulk populate equipment serial tags and maintenance baselines',
      icon: FileSpreadsheet,
      badge: 'Coming in Phase 5',
      comingLater: true,
    },
    {
      id: 'json',
      title: 'Restore FieldNote Archive (JSON)',
      desc: 'Import complete cryptographic backup package from another device',
      icon: FileCode,
      badge: 'Coming in Phase 5',
      comingLater: true,
    },
  ];

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Import Field Data"
      subtitle="Select local files to import into on-device intelligence pipeline"
    >
      <div className="space-y-3">
        {options.map((opt) => {
          const Icon = opt.icon;
          return (
            <div
              key={opt.id}
              onClick={() => {
                onSelectOption?.(opt.id);
                if (opt.comingLater) {
                  alert(`${opt.title} is scheduled for Phase 5 integration.`);
                } else {
                  alert(`Selected ${opt.title}. Audio file reader ready.`);
                  onClose();
                }
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onSelectOption?.(opt.id);
                }
              }}
              className="p-4 rounded-xl bg-bg-surface2 border border-border-default hover:border-border-strong hover:bg-bg-hover transition-all flex items-start justify-between gap-3 cursor-pointer select-none"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-bg-surface1 border border-border-subtle flex items-center justify-center text-semantic-green shrink-0 mt-0.5">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-body-sm font-bold text-text-primary truncate">
                      {opt.title}
                    </h4>
                    <span
                      className={`
                        px-1.5 py-0.2 rounded text-[10px] font-mono font-bold uppercase
                        ${
                          opt.comingLater
                            ? 'bg-bg-surface1 text-text-muted border border-border-subtle'
                            : 'bg-semantic-green-surface text-semantic-green-text border border-semantic-green-border'
                        }
                      `}
                    >
                      {opt.badge}
                    </span>
                  </div>
                  <p className="text-metadata text-text-muted leading-snug">
                    {opt.desc}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        <div className="pt-2">
          <Button fullWidth variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
};
