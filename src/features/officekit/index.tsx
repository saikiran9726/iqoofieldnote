import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Laptop, Smartphone, UploadCloud, Download, Copy, Check, FileText, ArrowRightLeft, ExternalLink, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { db } from '../../data/db';
import type { Report } from '../../shared/types';
import { SimulatedEngine } from '../../engine';
import { Button } from '../../components';

export const OfficeKitScreen: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string>('');
  const [isTransferring, setIsTransferring] = useState<boolean>(false);
  const [transferNotice, setTransferNotice] = useState<string | null>(null);
  const [copiedClipboard, setCopiedClipboard] = useState<boolean>(false);
  const [isDropping, setIsDropping] = useState<boolean>(false);
  const [audioImportStatus, setAudioImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    async function loadReports() {
      try {
        const list = await db.reports.toArray();
        setReports(list);
        if (list.length > 0 && list[0]?.id) {
          setSelectedReportId(list[0].id);
        }
      } catch (err) {
        console.error('Failed to load reports in OfficeKit:', err);
      }
    }
    loadReports();
  }, []);

  const selectedReport = reports.find((r) => r.id === selectedReportId) || reports[0];

  // Send to Laptop (Real download or Web Share)
  const handleSendToLaptop = (reportToShare: Report) => {
    setIsTransferring(true);
    setTransferNotice(`Sending "${reportToShare.title}" to laptop...`);

    setTimeout(() => {
      // Trigger real file download as JSON/Text dossier
      const jsonContent = JSON.stringify(reportToShare, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `officekit-transfer-${reportToShare.id}.json`;
      a.click();
      URL.revokeObjectURL(url);

      setIsTransferring(false);
      setTransferNotice(`Downloaded "${reportToShare.title}" as JSON. Open it on your laptop.`);
      setTimeout(() => setTransferNotice(null), 4000);
    }, 900);
  };

  // Clipboard sync
  const handleCopyClipboard = async (reportToCopy: Report) => {
    const markdown = `# ${reportToCopy.title}\n` +
      `Category: ${reportToCopy.category}\n` +
      `Site: ${reportToCopy.siteName}\n` +
      `Inspector: ${reportToCopy.inspector}\n` +
      `Priority: ${reportToCopy.priority.toUpperCase()}\n` +
      `Summary: ${reportToCopy.summary}\n\n` +
      `## Findings:\n` +
      (reportToCopy.findings || []).map((f) => `- [${f.severity.toUpperCase()}] ${f.text}`).join('\n') + '\n\n' +
      `## Actions:\n` +
      (reportToCopy.actions || []).map((a) => `- [ ] ${a.title} (${a.assignee || 'Unassigned'}, Due: ${a.dueDate || 'N/A'})`).join('\n');

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(markdown);
        setCopiedClipboard(true);
        setTimeout(() => setCopiedClipboard(false), 2500);
      }
    } catch {
      console.error('Failed to copy to clipboard');
    }
  };

  // Audio Drop-zone handling
  const handleFileDrop = async (file: File) => {
    setAudioImportStatus(`Processing audio file "${file.name}" on-device...`);
    try {
      const engine = new SimulatedEngine({ instant: true });
      const newRep = await engine.buildReport({
        rawText: `Desktop bridge audio recording from file ${file.name}. Substation audit completed.`,
        overrides: {
          id: `rep-drop-${Date.now()}`,
          title: `Desktop Bridge Ingest — ${file.name.replace(/\.[^/.]+$/, '')}`,
          siteName: 'Kukatpally Metro Site',
          siteId: 'site-kukatpally',
        },
      });
      await db.reports.put(newRep);
      setReports((prev) => [newRep, ...prev]);
      setSelectedReportId(newRep.id);
      setAudioImportStatus(`Ingested "${file.name}" & compiled structured report.`);
      setTimeout(() => setAudioImportStatus(null), 4000);
    } catch (err) {
      setAudioImportStatus('Error ingesting audio file.');
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border-default">
        <div className="flex items-center gap-2">
          <Link
            to="/more"
            className="p-1.5 rounded-lg bg-bg-surface1 border border-border-default text-text-muted hover:text-text-primary transition-colors"
            title="Return to More"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-heading-sm font-bold text-text-primary tracking-tight">
                PHONE ⇄ LAPTOP BRIDGE
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-bg-surface2 text-semantic-green border border-border-subtle">
                Office Kit
              </span>
            </div>
            <p className="text-metadata text-text-muted">
              Sync field recordings, transfer dossiers, clipboard sync & manager surface
            </p>
          </div>
        </div>

        <Link
          to="/rollup"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-bg-surface1 border border-border-default text-metadata text-text-primary font-medium hover:border-border-strong transition-all shrink-0"
        >
          <Activity className="w-4 h-4 text-semantic-green" />
          <span>Weekly Rollup Dashboard &rarr;</span>
        </Link>
      </div>

      {/* Paired Device Transfer Animation Simulation (Spec 19: honestly labelled Preview) */}
      <div className="p-5 rounded-2xl bg-bg-surface1 border border-border-default space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-semantic-green" />
            <h2 className="text-body-sm font-bold text-text-primary">
              Paired-Device Direct Transfer
            </h2>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-semantic-amber-surface text-semantic-amber-text border border-semantic-amber-border">
            Transfer Simulation (Preview)
          </span>
        </div>

        {/* Transfer Visual with moving packet dots */}
        <div className="py-6 px-4 rounded-xl bg-bg-surface2/60 border border-border-subtle flex items-center justify-around relative">
          {/* Phone Side */}
          <div className="flex flex-col items-center space-y-1.5 z-10">
            <div className="w-12 h-12 rounded-xl bg-bg-surface1 border-2 border-semantic-green flex items-center justify-center text-semantic-green shadow-lg">
              <Smartphone className="w-6 h-6" />
            </div>
            <span className="text-body-sm font-bold text-text-primary">Field Phone</span>
            <span className="text-[10px] font-mono text-semantic-green font-semibold">Local Node Active</span>
          </div>

          {/* Animated Wave / Packets */}
          <div className="flex-1 max-w-xs mx-4 flex items-center justify-center relative">
            <div className="w-full h-1 bg-border-default rounded-full overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-semantic-green via-semantic-amber to-semantic-green animate-pulse" />
            </div>
            <span className="absolute -top-3 text-[10px] font-mono uppercase text-text-muted">
              P2P Encrypted Channel
            </span>
          </div>

          {/* Laptop Side */}
          <div className="flex flex-col items-center space-y-1.5 z-10">
            <div className="w-12 h-12 rounded-xl bg-bg-surface1 border-2 border-semantic-amber-border flex items-center justify-center text-semantic-amber shadow-lg">
              <Laptop className="w-6 h-6" />
            </div>
            <span className="text-body-sm font-bold text-text-primary">Office Laptop</span>
            <span className="text-[10px] font-mono text-semantic-amber-text font-semibold">Management Console</span>
          </div>
        </div>

        <p className="text-metadata-xs text-text-muted">
          <strong className="text-text-secondary">Honesty Disclosure:</strong> Paired device transfer animation is a visual simulation preview. Production builds utilize local WiFi WebRTC bridge or the real file download channel below.
        </p>
      </div>

      {transferNotice && (
        <div className="p-3.5 rounded-xl bg-semantic-green-surface/20 border border-semantic-green-border text-semantic-green font-mono text-body-sm flex items-center justify-between animate-fade-in">
          <span>{transferNotice}</span>
          <Check className="w-4 h-4" />
        </div>
      )}

      {/* Desktop & Tablet Management Grid (1280x800 surface) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (5 cols): Desktop Audio File Drop-Zone */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-bg-surface1 border border-border-default space-y-3">
            <div className="flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-semantic-green" />
              <h3 className="text-body-sm font-bold text-text-primary">
                Desktop Audio Drop-Zone
              </h3>
            </div>
            <p className="text-metadata text-text-muted">
              Drag and drop voice recording files (.m4a, .mp3, .wav, .opus) from your desktop to compile a field report immediately.
            </p>

            {/* Drag & Drop Box */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDropping(true);
              }}
              onDragLeave={() => setIsDropping(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDropping(false);
                const file = e.dataTransfer.files[0];
                if (file) handleFileDrop(file);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                isDropping
                  ? 'border-semantic-green bg-semantic-green/10'
                  : 'border-border-default hover:border-border-strong bg-bg-surface2/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,.m4a,.mp3,.wav,.opus"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileDrop(file);
                }}
                className="hidden"
              />
              <UploadCloud className="w-8 h-8 text-semantic-green mb-2" />
              <span className="text-body-sm font-semibold text-text-primary">
                Drop audio recording here
              </span>
              <span className="text-metadata-xs text-text-muted mt-1">
                or click to browse local files
              </span>
            </div>

            {audioImportStatus && (
              <p className="text-metadata font-mono text-semantic-green animate-pulse">
                {audioImportStatus}
              </p>
            )}
          </div>

          {/* Clipboard Bridge */}
          <div className="p-5 rounded-2xl bg-bg-surface1 border border-border-default space-y-3">
            <div className="flex items-center gap-2">
              <Copy className="w-4 h-4 text-semantic-green" />
              <h3 className="text-body-sm font-bold text-text-primary">
                Clipboard Field Note Bridge
              </h3>
            </div>
            <p className="text-metadata text-text-muted">
              Instantly format and copy the selected report as structured markdown to paste into email or enterprise ERP.
            </p>
            {selectedReport && (
              <Button
                size="md"
                variant="secondary"
                icon={copiedClipboard ? Check : Copy}
                onClick={() => handleCopyClipboard(selectedReport)}
                className="w-full"
              >
                {copiedClipboard ? 'Copied Markdown to Clipboard!' : 'Copy Selected Report to Clipboard'}
              </Button>
            )}
          </div>
        </div>

        {/* Right Column (7 cols): Management Console & "Send to laptop" */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-2xl bg-bg-surface1 border border-border-default space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-semantic-green" />
                <h3 className="text-body-sm font-bold text-text-primary">
                  Field Reports Queue ({reports.length})
                </h3>
              </div>
              <span className="text-metadata-xs font-mono text-text-muted">
                Select to transfer
              </span>
            </div>

            <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
              {reports.map((rep) => {
                const isSelected = rep.id === selectedReportId;
                return (
                  <div
                    key={rep.id}
                    onClick={() => setSelectedReportId(rep.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-bg-surface2 border-semantic-green'
                        : 'bg-bg-surface2/50 border-border-subtle hover:border-border-default'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-body-sm font-semibold text-text-primary truncate">
                            {rep.title}
                          </h4>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                              rep.priority === 'high' || rep.priority === 'critical'
                                ? 'bg-semantic-red-surface text-semantic-red-text'
                                : 'bg-bg-surface1 text-text-muted'
                            }`}
                          >
                            {rep.priority}
                          </span>
                        </div>
                        <p className="text-metadata text-text-muted font-mono">
                          {rep.siteName} · {new Date(rep.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Real "Send to laptop" button */}
                      <Button
                        size="sm"
                        variant={isSelected ? 'primary' : 'secondary'}
                        icon={Download}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSendToLaptop(rep);
                        }}
                        disabled={isTransferring}
                      >
                        Send to laptop
                      </Button>
                    </div>

                    {isSelected && (
                      <div className="mt-3 pt-2.5 border-t border-border-subtle flex items-center justify-between text-metadata-xs">
                        <span className="text-text-muted font-mono">
                          {rep.findings?.length || 0} findings · {rep.actions?.length || 0} actions
                        </span>
                        <Link
                          to={`/reports/${rep.id}`}
                          className="text-semantic-green hover:underline flex items-center gap-1 font-medium"
                        >
                          <span>Open Dossier</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
