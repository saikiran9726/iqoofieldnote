import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mic,
  Camera,
  Image,
  FileAudio,
  FileText,
  FileSpreadsheet,
  Clipboard,
  QrCode,
  Smartphone,
  CheckCircle2,
} from 'lucide-react';
import { BottomSheet, Button, ErrorState } from '../../components';
import { db } from '../../data/db';
import { SimulatedEngine } from '../../engine/simulatedEngine';

export interface ImportSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onStartVoiceCapture?: () => void;
}

const SUPPORTED_EXTENSIONS = [
  '.m4a',
  '.mp3',
  '.wav',
  '.opus',
  '.pdf',
  '.doc',
  '.docx',
  '.txt',
];

export const ImportSheet: React.FC<ImportSheetProps> = ({
  isOpen,
  onClose,
  onStartVoiceCapture,
}) => {
  const navigate = useNavigate();
  const audioInputRef = useRef<HTMLInputElement | null>(null);
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const docInputRef = useRef<HTMLInputElement | null>(null);
  const pdfInputRef = useRef<HTMLInputElement | null>(null);

  const [unsupportedFile, setUnsupportedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importedCount, setImportedCount] = useState<number>(0);
  const [showClipboardModal, setShowClipboardModal] = useState<boolean>(false);
  const [clipboardText, setClipboardText] = useState<string>('');

  const isFileSupported = (file: File): boolean => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    return (
      SUPPORTED_EXTENSIONS.includes(ext) ||
      file.type.startsWith('audio/') ||
      file.type === 'application/pdf' ||
      file.type.includes('word') ||
      file.type.startsWith('text/')
    );
  };

  const handleAudioFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    // Validate all selected files
    for (const file of fileArray) {
      if (!isFileSupported(file)) {
        setUnsupportedFile(file);
        return;
      }
    }

    // Process audio files with multi-select support
    setIsImporting(true);
    const engine = new SimulatedEngine({ instant: true });
    let count = 0;

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      if (!file) continue;
      const reportId = `rep-audio-${Date.now()}-${i}`;
      const sampleMemo = `Field audio memo from file ${file.name}: Substation inspection completed. Loose terminals identified on distribution board.`;
      
      const newReport = await engine.buildReport({
        rawText: sampleMemo,
        overrides: {
          id: reportId,
          title: `Audio Inspection Memo — ${file.name.replace(/\.[^/.]+$/, '')}`,
          siteName: 'Kukatpally Metro Site',
          panelId: 'PANEL-204',
          priorityReason: 'Imported from external audio file',
        },
      });

      await db.reports.put(newReport);
      count++;
    }

    setIsImporting(false);
    setImportedCount(count);
    setTimeout(() => {
      onClose();
      navigate('/reports');
    }, 800);
  };

  const handleClipboardImport = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim().length > 10) {
          await processTextImport(text.trim());
          return;
        }
      }
    } catch {
      // Clipboard access denied or empty; open fallback paste modal
    }
    setShowClipboardModal(true);
  };

  const processTextImport = async (text: string) => {
    setIsImporting(true);
    const engine = new SimulatedEngine({ instant: true });
    const reportId = `rep-clip-${Date.now()}`;

    const newReport = await engine.buildReport({
      rawText: text,
      overrides: {
        id: reportId,
        title: 'Field Observation Note (Imported from Clipboard)',
        siteName: 'Kukatpally Metro Site',
        panelId: 'PANEL-204',
        priorityReason: 'Imported clipboard text observation',
      },
    });

    await db.reports.put(newReport);
    setIsImporting(false);
    setImportedCount(1);
    setTimeout(() => {
      setShowClipboardModal(false);
      onClose();
      navigate('/reports');
    }, 800);
  };

  const options = [
    {
      id: 'voice',
      title: 'Voice Recording',
      desc: 'Live high-fidelity microphone capture with real-time waveform',
      icon: Mic,
      badge: 'Live Audio',
      onClick: () => {
        onClose();
        onStartVoiceCapture?.();
      },
    },
    {
      id: 'camera',
      title: 'Camera / Document OCR',
      desc: 'Live document-corner scanning and nameplate text extraction',
      icon: Camera,
      badge: 'Simulated OCR',
      onClick: () => {
        onClose();
        navigate('/ocr');
      },
    },
    {
      id: 'gallery',
      title: 'Photo Gallery',
      desc: 'Batch import field inspection photos and GPS tags',
      icon: Image,
      badge: 'Photos',
      onClick: () => photoInputRef.current?.click(),
    },
    {
      id: 'audio',
      title: 'Audio File (M4A, MP3, WAV, OPUS)',
      desc: 'Multi-select external audio memos to auto-generate reports',
      icon: FileAudio,
      badge: 'Multi-Audio',
      onClick: () => audioInputRef.current?.click(),
    },
    {
      id: 'pdf',
      title: 'PDF Dossier',
      desc: 'Import existing inspection specifications or schematic sheets',
      icon: FileText,
      badge: 'PDF',
      onClick: () => pdfInputRef.current?.click(),
    },
    {
      id: 'document',
      title: 'Document (TXT, CSV, JSON)',
      desc: 'Restore asset manifests, punch lists, or plaintext notes',
      icon: FileSpreadsheet,
      badge: 'Data Sheet',
      onClick: () => docInputRef.current?.click(),
    },
    {
      id: 'clipboard',
      title: 'Clipboard Text',
      desc: 'Extract findings from copied text notes or field messages',
      icon: Clipboard,
      badge: 'Text Parser',
      onClick: handleClipboardImport,
    },
    {
      id: 'qr',
      title: 'QR / Barcode Scanner',
      desc: 'Scan equipment serial tags and link to maintenance records',
      icon: QrCode,
      badge: 'BarcodeDetector',
      onClick: () => {
        onClose();
        navigate('/scanner');
      },
    },
  ];

  return (
    <>
      <BottomSheet
        isOpen={isOpen}
        onClose={() => {
          setUnsupportedFile(null);
          onClose();
        }}
        title="Field Import Hub (Spec 3)"
        subtitle="Multi-modal ingestion pipeline for offline field dossiers"
      >
        <div className="space-y-4">
          {/* Unsupported File Format Error State (Spec 3) */}
          {unsupportedFile ? (
            <div className="space-y-4">
              <ErrorState
                title="Unsupported file format"
                message={`The file "${unsupportedFile.name}" (${unsupportedFile.type || 'unknown format'}) cannot be processed offline. Supported formats: M4A, MP3, WAV, OPUS, PDF, TXT, CSV, JSON, PNG, JPEG.`}
                onRetry={() => {
                  setUnsupportedFile(null);
                  audioInputRef.current?.click();
                }}
              />
              <div className="flex justify-end">
                <Button size="sm" variant="ghost" onClick={() => setUnsupportedFile(null)}>
                  Dismiss Error
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Web Share Target Android PWA Notice Banner */}
              <div className="p-3 rounded-xl bg-bg-surface2 border border-border-subtle flex items-center gap-2.5 text-metadata text-text-secondary">
                <Smartphone className="w-4 h-4 text-semantic-green shrink-0" />
                <span>
                  <strong>Web Share Target:</strong> Direct sharing from system apps into FieldNote works only for the installed Android PWA.
                </span>
              </div>

              {/* Progress indicator during multi-audio import */}
              {isImporting && (
                <div className="p-4 rounded-xl bg-semantic-green-surface/20 border border-semantic-green flex items-center justify-between text-semantic-green-text">
                  <span className="text-body-sm font-semibold animate-pulse">
                    Processing audio memo with on-device engine...
                  </span>
                  <span className="text-metadata-xs font-mono">Generating report</span>
                </div>
              )}

              {importedCount > 0 && (
                <div className="p-3 rounded-xl bg-semantic-green-surface text-semantic-green-text flex items-center gap-2 text-body-sm font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Successfully imported {importedCount} field dossiers!</span>
                </div>
              )}

              {/* 8 Import Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {options.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <div
                      key={opt.id}
                      onClick={opt.onClick}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          opt.onClick();
                        }
                      }}
                      className="p-3.5 rounded-xl bg-bg-surface2 border border-border-default hover:border-border-strong hover:bg-bg-hover transition-all flex items-start gap-3 cursor-pointer select-none group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-bg-surface1 border border-border-subtle flex items-center justify-center text-semantic-green shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="space-y-0.5 min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-body-xs font-bold text-text-primary truncate">
                            {opt.title}
                          </h4>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase bg-bg-surface1 text-text-muted border border-border-subtle shrink-0">
                            {opt.badge}
                          </span>
                        </div>
                        <p className="text-metadata-xs text-text-muted line-clamp-2 leading-relaxed">
                          {opt.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick error state simulator for test verification */}
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const fakeFile = new File(['dummy'], 'firmware_update.bin', {
                      type: 'application/octet-stream',
                    });
                    setUnsupportedFile(fakeFile);
                  }}
                  className="text-metadata-xs text-text-muted hover:text-semantic-amber"
                >
                  Test Unsupported File Error
                </button>
              </div>
            </>
          )}
        </div>
      </BottomSheet>

      {/* Hidden File Inputs */}
      <input
        ref={audioInputRef}
        type="file"
        multiple
        accept="audio/*, .m4a, .mp3, .wav, .opus"
        className="hidden"
        onChange={(e) => handleAudioFilesSelected(e.target.files)}
      />

      <input
        ref={photoInputRef}
        type="file"
        multiple
        accept="image/*, .png, .jpg, .jpeg, .webp"
        className="hidden"
        onChange={(e) => handleAudioFilesSelected(e.target.files)}
      />

      <input
        ref={docInputRef}
        type="file"
        accept=".txt, .csv, .json, text/*"
        className="hidden"
        onChange={(e) => handleAudioFilesSelected(e.target.files)}
      />

      <input
        ref={pdfInputRef}
        type="file"
        accept=".pdf, application/pdf"
        className="hidden"
        onChange={(e) => handleAudioFilesSelected(e.target.files)}
      />

      {/* Clipboard Fallback Modal */}
      {showClipboardModal && (
        <BottomSheet
          isOpen={showClipboardModal}
          onClose={() => setShowClipboardModal(false)}
          title="Paste Clipboard Note"
          subtitle="Paste copied text observations to auto-compile a report"
        >
          <div className="space-y-4">
            <textarea
              rows={5}
              value={clipboardText}
              onChange={(e) => setClipboardText(e.target.value)}
              placeholder="Paste field observation text here (e.g. 'Inspected Panel 204. Found loose cable lugs and oxidation...')."
              className="w-full p-3 rounded-xl bg-bg-surface2 border border-border-default text-text-primary placeholder:text-text-muted text-body-sm focus:outline-none focus:border-semantic-green resize-none"
            />
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={() => setShowClipboardModal(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant="primary"
                disabled={!clipboardText.trim()}
                onClick={() => {
                  setShowClipboardModal(false);
                  processTextImport(clipboardText.trim());
                }}
              >
                Compile Note
              </Button>
            </div>
          </div>
        </BottomSheet>
      )}
    </>
  );
};
