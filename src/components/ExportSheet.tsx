import React, { useState } from 'react';
import { Download, FileArchive, FileText, FileSpreadsheet, Check, Sparkles } from 'lucide-react';
import { Button } from './Button';
import { BottomSheet } from './BottomSheet';

export interface ExportSheetProps {
  isOpen: boolean;
  onClose: () => void;
  reportTitle?: string;
}

export const ExportSheet: React.FC<ExportSheetProps> = ({
  isOpen,
  onClose,
  reportTitle = 'Inspection Dossier',
}) => {
  const [exportingType, setExportingType] = useState<string | null>(null);
  const [completedType, setCompletedType] = useState<string | null>(null);

  const handleExport = (type: string) => {
    setExportingType(type);
    setTimeout(() => {
      setExportingType(null);
      setCompletedType(type);
      setTimeout(() => setCompletedType(null), 2500);
    }, 600);
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Export Field Dossier"
      subtitle={`Export options for ${reportTitle}`}
    >
      <div className="space-y-4">
        {/* PDF Option */}
        <div className="p-4 rounded-xl bg-bg-surface2 border border-border-default space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <FileSpreadsheet className="w-5 h-5 text-semantic-green" />
              <div>
                <h4 className="text-body-sm font-bold text-text-primary">
                  Official PDF Audit Report
                </h4>
                <p className="text-metadata text-text-muted">
                  Vector Latin + Canvas-rasterized Indian script ligatures
                </p>
              </div>
            </div>
          </div>

          <Button
            size="sm"
            variant="primary"
            fullWidth
            loading={exportingType === 'pdf'}
            onClick={() => handleExport('pdf')}
            icon={completedType === 'pdf' ? Check : Sparkles}
          >
            {completedType === 'pdf' ? 'PDF Generated (Downloaded)' : 'Generate PDF Report'}
          </Button>
        </div>

        {/* ZIP Package */}
        <div className="p-4 rounded-xl bg-bg-surface2 border border-border-default space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <FileArchive className="w-5 h-5 text-semantic-blue" />
              <div>
                <h4 className="text-body-sm font-bold text-text-primary">
                  Full Archive (ZIP Dossier)
                </h4>
                <p className="text-metadata text-text-muted">
                  Includes raw audio, high-res photos, PDF & JSON metadata
                </p>
              </div>
            </div>
          </div>

          <Button
            size="sm"
            variant="secondary"
            fullWidth
            loading={exportingType === 'zip'}
            onClick={() => handleExport('zip')}
            icon={completedType === 'zip' ? Check : Download}
          >
            {completedType === 'zip' ? 'ZIP Packaged' : 'Download ZIP Bundle'}
          </Button>
        </div>

        {/* CSV Option */}
        <div className="p-4 rounded-xl bg-bg-surface2 border border-border-default space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <FileText className="w-5 h-5 text-text-secondary" />
              <div>
                <h4 className="text-body-sm font-bold text-text-primary">
                  CSV Structured Spreadsheet
                </h4>
                <p className="text-metadata text-text-muted">
                  Findings, tasks, and asset audit history
                </p>
              </div>
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            fullWidth
            loading={exportingType === 'csv'}
            onClick={() => handleExport('csv')}
            icon={completedType === 'csv' ? Check : Download}
          >
            {completedType === 'csv' ? 'CSV Exported' : 'Export CSV Dataset'}
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
};
