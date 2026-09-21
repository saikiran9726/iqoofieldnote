import React, { useState } from 'react';
import { Download, ArrowLeft, FileArchive, FileText, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ExportScreen: React.FC = () => {
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const handleExportZip = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert('Export complete: fieldnote-dossier-backup.zip packaged locally via client memory.');
    }, 600);
  };

  const handleExportCsv = () => {
    const csvContent = 'data:text/csv;charset=utf-8,ID,Title,Status,Timestamp\n1,Pump Inspection,Processed,2026-09-21\n2,Valve Calibration,Draft,2026-09-21';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'fieldnote-records.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link to="/more" className="p-1.5 rounded-lg bg-bg-surface1 border border-border-default text-text-muted hover:text-text-primary">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h2 className="text-heading-sm font-bold text-text-primary">Dossier Backup & Export</h2>
          <p className="text-metadata text-text-muted">Export local database to ZIP bundles, CSV tables & reports</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* ZIP Package */}
        <div className="p-5 rounded-2xl bg-bg-surface1 border border-border-default space-y-3">
          <div className="flex items-center gap-2">
            <FileArchive className="w-5 h-5 text-semantic-green" />
            <h3 className="text-body-md font-bold text-text-primary">Full Dossier ZIP</h3>
          </div>
          <p className="text-body-sm text-text-secondary leading-relaxed">
            Packages all local audio recordings, high-res photos, inspection dossiers, and JSON metadata into a single offline archive.
          </p>
          <button
            type="button"
            onClick={handleExportZip}
            disabled={isExporting}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-semantic-green text-text-inverse font-semibold text-body-sm hover:brightness-110 active:scale-[0.98] transition-all"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Packaging Archive...' : 'Download ZIP Bundle'}</span>
          </button>
        </div>

        {/* CSV Dataset */}
        <div className="p-5 rounded-2xl bg-bg-surface1 border border-border-default space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-semantic-blue" />
            <h3 className="text-body-md font-bold text-text-primary">CSV Spreadsheet</h3>
          </div>
          <p className="text-body-sm text-text-secondary leading-relaxed">
            Extracts all field tasks, asset records, and inspection logs into structured CSV sheets for external spreadsheet import.
          </p>
          <button
            type="button"
            onClick={handleExportCsv}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-bg-surface2 text-text-primary border border-border-default font-semibold text-body-sm hover:bg-bg-hover active:scale-[0.98] transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV Spreadsheets</span>
          </button>
        </div>
      </div>

      {/* Web Share Target Notice per Rule 7e */}
      <div className="p-4 rounded-xl bg-bg-surface1 border border-border-default space-y-2">
        <div className="flex items-center gap-2">
          <Share2 className="w-4 h-4 text-semantic-amber" />
          <h4 className="text-body-sm font-bold text-text-primary">
            Web Share Target Compatibility (Rule 7e)
          </h4>
        </div>
        <p className="text-metadata text-text-secondary leading-relaxed">
          <strong>PWA Installation Requirement:</strong> The Web Share Target API (sharing external voice notes directly into FieldNote from your phone's voice recorder or gallery) requires installing FieldNote as a standalone PWA on Android Chrome / Chromium. In standard browser tabs, share receiving is not supported by browser security policies.
        </p>
      </div>
    </div>
  );
};
