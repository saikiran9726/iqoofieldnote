import React, { useState } from 'react';
import {
  FileText,
  FileSpreadsheet,
  FileCode,
  Check,
  Sparkles,
  Camera,
  MapPin,
  Clock,
  PenTool,
  Share2,
} from 'lucide-react';
import { Button } from './Button';
import { BottomSheet } from './BottomSheet';
import type { Report } from '../shared/types';
import {
  generateReportPdf,
  generateReportExcel,
  generateReportCsv,
  generateReportJson,
  generateReportText,
  downloadOrShareFile,
} from '../lib/exportEngine';
import { db } from '../data/db';

export interface ExportSheetProps {
  isOpen: boolean;
  onClose: () => void;
  report?: Report;
  reportTitle?: string;
}

export const ExportSheet: React.FC<ExportSheetProps> = ({
  isOpen,
  onClose,
  report,
  reportTitle = 'Inspection Dossier',
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'xlsx' | 'csv' | 'json' | 'txt'>('pdf');
  const [includePhotos, setIncludePhotos] = useState<boolean>(true);
  const [includeGps, setIncludeGps] = useState<boolean>(true);
  const [includeTimestamp, setIncludeTimestamp] = useState<boolean>(true);
  const [includeSignature, setIncludeSignature] = useState<boolean>(true);

  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isExportDone, setIsExportDone] = useState<boolean>(false);

  const handleExecuteExport = async () => {
    setIsExporting(true);

    try {
      // Find report if not directly supplied
      let targetReport = report;
      if (!targetReport) {
        targetReport = await db.reports.get('rep-hero-001');
      }
      if (!targetReport) {
        targetReport = (await db.reports.toArray())[0];
      }
      if (!targetReport) {
        alert('No report available to export.');
        setIsExporting(false);
        return;
      }

      const options = {
        includePhotos,
        includeGps,
        includeTimestamp,
        includeSignature,
      };

      if (selectedFormat === 'pdf') {
        const { blob, filename } = await generateReportPdf(targetReport, options);
        await downloadOrShareFile({ blob, filename, mimeType: 'application/pdf' });
      } else if (selectedFormat === 'xlsx') {
        const { blob, filename } = await generateReportExcel(targetReport, options);
        await downloadOrShareFile({
          blob,
          filename,
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
      } else if (selectedFormat === 'csv') {
        const { blob, filename } = await generateReportCsv(targetReport);
        await downloadOrShareFile({ blob, filename, mimeType: 'text/csv' });
      } else if (selectedFormat === 'json') {
        const { blob, filename } = await generateReportJson(targetReport);
        await downloadOrShareFile({ blob, filename, mimeType: 'application/json' });
      } else if (selectedFormat === 'txt') {
        const { blob, filename } = await generateReportText(targetReport);
        await downloadOrShareFile({ blob, filename, mimeType: 'text/plain' });
      }

      setIsExportDone(true);
      setTimeout(() => {
        setIsExportDone(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed. Check console.');
    } finally {
      setIsExporting(false);
    }
  };

  const formats = [
    { id: 'pdf', name: 'PDF', desc: 'Vector Latin + Canvas Indic rasterizer', icon: FileSpreadsheet, badge: 'Official' },
    { id: 'xlsx', name: 'Excel (.xlsx)', desc: 'Multi-tab spreadsheet with audit ledger', icon: FileSpreadsheet, badge: 'SheetJS' },
    { id: 'csv', name: 'CSV', desc: 'Raw tabular findings and punch list', icon: FileText, badge: 'Universal' },
    { id: 'json', name: 'JSON', desc: 'Full cryptographic backup schema', icon: FileCode, badge: 'Dev/API' },
    { id: 'txt', name: 'Plain Text', desc: 'Clean ASCII formatted summary memo', icon: FileText, badge: 'Lightweight' },
  ] as const;

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Export Field Dossier"
      subtitle={`Export & share on-device records for ${reportTitle}`}
    >
      <div className="space-y-4">
        {/* Format Selection List */}
        <div className="space-y-2">
          <label className="text-metadata-xs font-mono uppercase text-text-muted font-bold">
            Select Output Format
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {formats.map((fmt) => {
              const Icon = fmt.icon;
              const isSelected = selectedFormat === fmt.id;
              return (
                <div
                  key={fmt.id}
                  onClick={() => setSelectedFormat(fmt.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') setSelectedFormat(fmt.id);
                  }}
                  className={`
                    p-3 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-2 select-none
                    ${
                      isSelected
                        ? 'bg-semantic-green-surface/40 border-semantic-green text-semantic-green-text shadow-sm'
                        : 'bg-bg-surface2 border-border-default hover:border-border-strong text-text-primary'
                    }
                  `}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? 'text-semantic-green' : 'text-text-muted'}`} />
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-body-xs font-bold truncate">{fmt.name}</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase bg-bg-surface1 text-text-muted border border-border-subtle">
                          {fmt.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-text-muted leading-tight truncate">{fmt.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section Toggles */}
        <div className="p-4 rounded-xl bg-bg-surface2 border border-border-default space-y-3">
          <label className="text-metadata-xs font-mono uppercase text-text-muted font-bold block">
            Dossier Inclusion Toggles
          </label>

          <div className="grid grid-cols-2 gap-2 text-metadata-xs font-mono">
            <label className="flex items-center gap-2 cursor-pointer select-none text-text-secondary">
              <input
                type="checkbox"
                checked={includePhotos}
                onChange={(e) => setIncludePhotos(e.target.checked)}
                className="w-4 h-4 rounded text-semantic-green focus:ring-semantic-green bg-bg-surface1 border-border-strong"
              />
              <Camera className="w-3.5 h-3.5 text-text-muted" />
              <span>Photos & Evidence</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none text-text-secondary">
              <input
                type="checkbox"
                checked={includeGps}
                onChange={(e) => setIncludeGps(e.target.checked)}
                className="w-4 h-4 rounded text-semantic-green focus:ring-semantic-green bg-bg-surface1 border-border-strong"
              />
              <MapPin className="w-3.5 h-3.5 text-text-muted" />
              <span>GPS Geofence</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none text-text-secondary">
              <input
                type="checkbox"
                checked={includeTimestamp}
                onChange={(e) => setIncludeTimestamp(e.target.checked)}
                className="w-4 h-4 rounded text-semantic-green focus:ring-semantic-green bg-bg-surface1 border-border-strong"
              />
              <Clock className="w-3.5 h-3.5 text-text-muted" />
              <span>Timestamp & Hash Seal</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none text-text-secondary">
              <input
                type="checkbox"
                checked={includeSignature}
                onChange={(e) => setIncludeSignature(e.target.checked)}
                className="w-4 h-4 rounded text-semantic-green focus:ring-semantic-green bg-bg-surface1 border-border-strong"
              />
              <PenTool className="w-3.5 h-3.5 text-text-muted" />
              <span>Inspector Signature</span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center gap-2">
          <Button
            size="md"
            variant="primary"
            fullWidth
            loading={isExporting}
            onClick={handleExecuteExport}
            icon={isExportDone ? Check : Sparkles}
          >
            {isExportDone
              ? 'Export Completed & Downloaded'
              : `Generate & Download ${selectedFormat.toUpperCase()}`}
          </Button>

          <Button
            size="md"
            variant="secondary"
            icon={Share2}
            onClick={handleExecuteExport}
            title="Share file directly via Web Share API"
          >
            Share
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
};

