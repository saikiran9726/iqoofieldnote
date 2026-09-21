import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Camera,
  RotateCcw,
  Plus,
  Sparkles,
  FileCheck,
  AlertOctagon,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import { Button, ErrorState, ConfidenceBadge } from '../../components';
import { db } from '../../data/db';
import type { Report } from '../../shared/types';

export const OcrScreen: React.FC = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [pageCount, setPageCount] = useState<number>(1);
  const [capturedPages, setCapturedPages] = useState<string[]>([]);
  const [isExtracted, setIsExtracted] = useState<boolean>(false);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [showErrorState, setShowErrorState] = useState<boolean>(false);

  useEffect(() => {
    let stream: MediaStream | null = null;
    if (navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: 'environment' } })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            videoRef.current.play().catch(console.error);
          }
        })
        .catch(() => {
          // Graceful headless fallback
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    // Generate page placeholder
    const samplePage = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400" viewBox="0 0 300 400"><rect width="300" height="400" fill="%23181C20"/><text x="20" y="40" fill="%2310B981" font-size="14" font-family="sans-serif">Page ${capturedPages.length + 1} Captured</text><text x="20" y="80" fill="%23F1F5F9" font-size="12" font-family="monospace">EQUIPMENT RATING: 415V</text><text x="20" y="110" fill="%23F1F5F9" font-size="12" font-family="monospace">PANEL ID: PANEL-204</text></svg>`;
    const updated = [...capturedPages, samplePage];
    setCapturedPages(updated);
    setPageCount(updated.length);
  };

  const handleAddPage = () => {
    if (capturedPages.length >= 3) return;
    handleCapture();
  };

  const handleRetake = () => {
    setCapturedPages([]);
    setPageCount(1);
    setIsExtracted(false);
    setShowErrorState(false);
  };

  const handleExtractText = () => {
    setIsExtracting(true);
    setTimeout(() => {
      setIsExtracting(false);
      setIsExtracted(true);
    }, 600);
  };

  const handleCreateReport = async () => {
    const newReportId = `rep-ocr-${Date.now()}`;
    const newReport: Report = {
      id: newReportId,
      title: 'Electrical Inspection — PANEL-204 Nameplate Audit',
      siteId: 'site-kukatpally',
      siteName: 'Kukatpally Metro Site',
      category: 'ELECTRICAL INSPECTION',
      inspector: 'K. S. Rao (Field Eng #104)',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'in_review',
      priority: 'high',
      priorityReason: 'Loose connection indicators transcribed from equipment nameplate',
      summary: 'Automated field inspection compiled via on-device document OCR from equipment nameplate. Verified 415V rated switchgear with thermal loose terminal warnings.',
      panelId: 'PANEL-204',
      isPanelIdMissing: false,
      findings: [
        {
          id: `find-${Date.now()}-1`,
          reportId: newReportId,
          text: 'Nameplate OCR verified: 415V 3-Phase 50Hz 630A switchgear rating.',
          category: 'Equipment Baseline',
          severity: 'low',
          confidence: 0.98,
          isVerified: true,
          assetId: 'PANEL-204',
        },
        {
          id: `find-${Date.now()}-2`,
          reportId: newReportId,
          text: 'Maintenance warning note on label: Re-torque lugs to 18 Nm every quarter.',
          category: 'Torque Specification',
          severity: 'high',
          confidence: 0.94,
          isVerified: true,
          assetId: 'PANEL-204',
        },
      ],
      actions: [
        {
          id: `act-${Date.now()}-1`,
          reportId: newReportId,
          title: 'Torque check Terminal Block B per 18 Nm OCR spec',
          assignee: 'K. Rao (Electrical Team Lead)',
          priority: 'high',
          status: 'todo',
          dueDate: new Date(Date.now() + 86400000).toISOString(),
          isCompleted: false,
        },
      ],
      evidenceIds: [],
      editHistory: [],
      overallConfidence: 0.96,
    };

    await db.reports.put(newReport);
    navigate(`/report/${newReportId}`);
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto pb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            to="/capture"
            className="p-2 rounded-xl bg-bg-surface1 border border-border-default text-text-muted hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-heading-sm font-bold text-text-primary">Camera & Document OCR</h1>
            <p className="text-metadata text-text-muted">Document-corner framing & on-device text recognition</p>
          </div>
        </div>

        <span className="px-2 py-0.5 rounded text-metadata-xs font-mono font-bold bg-semantic-green-surface text-semantic-green-text border border-semantic-green-border">
          SIMULATED OCR
        </span>
      </div>

      {/* OCR Error State with Retake Tips */}
      {showErrorState ? (
        <div className="space-y-4">
          <ErrorState
            title="OCR Text Extraction Failed"
            message="Could not extract text from the captured image. The document appears blurry, underexposed, or angled."
            onRetry={() => setShowErrorState(false)}
          />

          {/* Retake Tips Card (Spec 13) */}
          <div className="p-5 rounded-2xl bg-bg-surface1 border border-border-default space-y-3">
            <div className="flex items-center gap-2 text-text-primary">
              <AlertOctagon className="w-4 h-4 text-semantic-amber" />
              <h3 className="text-body-sm font-bold">Document Retake Tips</h3>
            </div>
            <ul className="text-metadata text-text-secondary space-y-2 pl-1">
              <li className="flex items-start gap-2">
                <span className="font-bold text-semantic-green font-mono">1.</span>
                <span>Align all 4 document corners inside the green viewfinder brackets.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-semantic-green font-mono">2.</span>
                <span>Ensure bright, even lighting and avoid direct glare or flash reflections.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-semantic-green font-mono">3.</span>
                <span>Hold device parallel to the nameplate and steady before capturing.</span>
              </li>
            </ul>

            <div className="pt-2">
              <Button size="md" variant="primary" onClick={handleRetake} className="w-full justify-center">
                Retake Document
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Viewfinder with document-corner overlay */}
          <div className="relative aspect-[3/4] w-full max-h-[440px] rounded-2xl overflow-hidden bg-bg-base border border-border-default flex items-center justify-center">
            <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />

            {/* Document Corner Overlay Frame (Spec 13) */}
            <div className="absolute inset-8 pointer-events-none flex flex-col justify-between">
              <div className="flex justify-between">
                <div className="w-10 h-10 border-t-4 border-l-4 border-semantic-green rounded-tl-xl shadow-sm" />
                <div className="w-10 h-10 border-t-4 border-r-4 border-semantic-green rounded-tr-xl shadow-sm" />
              </div>

              <div className="flex justify-center">
                <span className="px-3 py-1 rounded-full bg-bg-base/80 backdrop-blur-sm border border-border-subtle text-metadata-xs font-mono text-text-primary">
                  {pageCount} {pageCount === 1 ? 'page' : 'pages'} detected
                </span>
              </div>

              <div className="flex justify-between">
                <div className="w-10 h-10 border-b-4 border-l-4 border-semantic-green rounded-bl-xl shadow-sm" />
                <div className="w-10 h-10 border-b-4 border-r-4 border-semantic-green rounded-br-xl shadow-sm" />
              </div>
            </div>
          </div>

          {/* Captured Pages Gallery Indicator */}
          {capturedPages.length > 0 && (
            <div className="p-3 rounded-xl bg-bg-surface1 border border-border-default flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-semantic-green" />
                <span className="text-body-xs font-bold text-text-primary">
                  {capturedPages.length} {capturedPages.length === 1 ? 'page' : 'pages'} captured
                </span>
                {capturedPages.length >= 3 && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-semantic-amber-surface text-semantic-amber-text border border-semantic-amber-border">
                    MAX 3 PAGES
                  </span>
                )}
              </div>

              <span className="text-metadata-xs text-text-muted font-mono">
                {capturedPages.length === 3 ? 'Ready to extract' : 'Add up to 3 pages'}
              </span>
            </div>
          )}

          {/* Controls Bar: Capture, Retake, Add page, Extract text */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Button
              size="md"
              variant="primary"
              icon={Camera}
              onClick={handleCapture}
              disabled={capturedPages.length >= 3}
            >
              Capture
            </Button>

            <Button
              size="md"
              variant="secondary"
              icon={Plus}
              onClick={handleAddPage}
              disabled={capturedPages.length >= 3 || capturedPages.length === 0}
            >
              Add page
            </Button>

            <Button
              size="md"
              variant="ghost"
              icon={RotateCcw}
              onClick={handleRetake}
              disabled={capturedPages.length === 0}
            >
              Retake
            </Button>

            <Button
              size="md"
              variant="primary"
              icon={Sparkles}
              onClick={handleExtractText}
              disabled={capturedPages.length === 0 || isExtracting}
            >
              {isExtracting ? 'Extracting...' : 'Extract text'}
            </Button>
          </div>

          {/* Quick error state test trigger */}
          <div className="flex justify-between items-center px-1 text-metadata-xs">
            <button
              type="button"
              onClick={() => {
                setCapturedPages(['p1', 'p2', 'p3']);
                setPageCount(3);
              }}
              className="text-semantic-green hover:underline font-medium"
            >
              Simulate "3 pages detected"
            </button>

            <button
              type="button"
              onClick={() => setShowErrorState(true)}
              className="text-text-muted hover:text-semantic-amber font-medium"
            >
              Simulate OCR Error State
            </button>
          </div>
        </div>
      )}

      {/* Extracted Fields for Review (Spec 13) */}
      {isExtracted && !showErrorState && (
        <div className="p-5 rounded-2xl bg-bg-surface1 border-2 border-semantic-green shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-semantic-green" />
              <h3 className="text-body-md font-bold text-text-primary">
                Extracted Fields Review
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded text-metadata-xs font-mono font-bold bg-semantic-green-surface text-semantic-green-text border border-semantic-green-border">
              3 PAGES EXTRACTED
            </span>
          </div>

          <div className="space-y-2.5">
            {/* Field 1 */}
            <div className="p-3 rounded-xl bg-bg-surface2 border border-border-subtle flex items-center justify-between">
              <div>
                <span className="text-metadata-xs text-text-muted font-mono uppercase block">Equipment Tag</span>
                <strong className="text-body-sm text-text-primary font-mono">PANEL-204</strong>
              </div>
              <ConfidenceBadge confidence={0.98} size="sm" showPercent />
            </div>

            {/* Field 2 */}
            <div className="p-3 rounded-xl bg-bg-surface2 border border-border-subtle flex items-center justify-between">
              <div>
                <span className="text-metadata-xs text-text-muted font-mono uppercase block">Manufacturer & Model</span>
                <strong className="text-body-sm text-text-primary font-mono">L&T Air Circuit Breaker 630A</strong>
              </div>
              <ConfidenceBadge confidence={0.96} size="sm" showPercent />
            </div>

            {/* Field 3 */}
            <div className="p-3 rounded-xl bg-bg-surface2 border border-border-subtle flex items-center justify-between">
              <div>
                <span className="text-metadata-xs text-text-muted font-mono uppercase block">Rated Specs</span>
                <strong className="text-body-sm text-text-primary font-mono">415V · 3-Phase · 50Hz · 50kA</strong>
              </div>
              <ConfidenceBadge confidence={0.92} size="sm" showPercent />
            </div>

            {/* Field 4 */}
            <div className="p-3 rounded-xl bg-bg-surface2 border border-border-subtle flex items-center justify-between">
              <div>
                <span className="text-metadata-xs text-text-muted font-mono uppercase block">Observed Hazard</span>
                <strong className="text-body-sm text-semantic-amber font-mono">
                  Thermal oxidation noted on busbar
                </strong>
              </div>
              <ConfidenceBadge confidence={0.94} size="sm" showPercent />
            </div>
          </div>

          <div className="pt-2">
            <Button
              size="md"
              variant="primary"
              icon={FileCheck}
              onClick={handleCreateReport}
              className="w-full justify-center"
            >
              Compile Inspection Report
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
