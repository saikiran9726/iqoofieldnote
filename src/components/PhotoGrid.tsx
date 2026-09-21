import React from 'react';
import { Camera, Plus, Trash2 } from 'lucide-react';
import type { Evidence } from '../shared/types';

export interface PhotoGridProps {
  evidenceList: Evidence[];
  onAddPhoto?: () => void;
  onRemovePhoto?: (id: string) => void;
  onViewPhoto?: (evidence: Evidence) => void;
}

export const PhotoGrid: React.FC<PhotoGridProps> = ({
  evidenceList,
  onAddPhoto,
  onRemovePhoto,
  onViewPhoto,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-semantic-green" />
          <h4 className="text-body-sm font-bold text-text-primary">
            Site Evidence & Photos ({evidenceList.length})
          </h4>
        </div>

        {onAddPhoto && (
          <button
            type="button"
            onClick={onAddPhoto}
            className="flex items-center gap-1 text-metadata-xs font-semibold text-semantic-green hover:underline"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Photo</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {evidenceList.map((evi) => (
          <div
            key={evi.id}
            onClick={() => onViewPhoto?.(evi)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') onViewPhoto?.(evi);
            }}
            className="relative group rounded-xl overflow-hidden bg-bg-surface2 border border-border-default hover:border-border-strong transition-all aspect-video flex flex-col justify-end p-2 cursor-pointer select-none"
          >
            <div className="absolute inset-0 flex items-center justify-center text-text-muted bg-bg-surface2">
              <Camera className="w-8 h-8 opacity-40 group-hover:scale-110 transition-transform" />
            </div>

            {evi.caption && (
              <div className="relative z-10 bg-black/70 backdrop-blur-sm px-2 py-1 rounded text-white text-[11px] font-medium truncate">
                {evi.caption}
              </div>
            )}

            {onRemovePhoto && (
              <button
                type="button"
                aria-label="Remove photo"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemovePhoto(evi.id);
                }}
                className="absolute top-1.5 right-1.5 z-10 w-7 h-7 rounded-lg bg-black/60 text-white hover:bg-semantic-red flex items-center justify-center transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}

        {onAddPhoto && (
          <button
            type="button"
            onClick={onAddPhoto}
            className="rounded-xl border border-dashed border-border-strong hover:border-semantic-green bg-bg-surface1/60 hover:bg-bg-surface2/60 transition-all aspect-video flex flex-col items-center justify-center gap-1.5 text-text-muted hover:text-text-primary"
          >
            <Plus className="w-5 h-5 text-semantic-green" />
            <span className="text-metadata-xs font-medium">Add Photo</span>
          </button>
        )}
      </div>
    </div>
  );
};
