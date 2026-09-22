import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, QrCode, Search, CheckCircle2, FilePlus } from 'lucide-react';
import QrScanner from 'qr-scanner';
import { db } from '../../data/db';
import type { Report } from '../../shared/types';
import { Button, ErrorState } from '../../components';

export const ScannerScreen: React.FC = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);

  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualAssetId, setManualAssetId] = useState<string>('PANEL-204');
  const [detectedAsset, setDetectedAsset] = useState<{
    id: string;
    title: string;
    previousReportsCount: number;
    openIssuesCount: number;
    siteName: string;
  } | null>(null);

  // Look up asset statistics in Dexie
  const resolveAssetDetails = async (assetId: string) => {
    const cleanId = assetId.trim().toUpperCase();
    const reports = await db.reports.toArray();
    const linkedReports = reports.filter(
      (r) => r.panelId?.toUpperCase() === cleanId
    );

    // Count open actions associated with this asset
    const openIssues = linkedReports.reduce((acc, r) => {
      const openActions = r.actions.filter((a) => !a.isCompleted).length;
      return acc + openActions;
    }, 0);

    const assetRecord =
      (await db.assets.get(cleanId)) ??
      (await db.assets.where('tagId').equals(cleanId).first());

    setDetectedAsset({
      id: cleanId,
      title: assetRecord?.name || `Substation Switchgear ${cleanId}`,
      previousReportsCount: linkedReports.length,
      openIssuesCount: openIssues,
      siteName: assetRecord?.siteName || linkedReports[0]?.siteName || 'Kukatpally Metro Site',
    });
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera access not supported in this browser.');
      }
      if (!videoRef.current) return;
      const scanner = new QrScanner(
        videoRef.current,
        (result) => {
          if (result?.data) void resolveAssetDetails(result.data);
        },
        {
          preferredCamera: 'environment',
          returnDetailedScanResult: true,
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );
      qrScannerRef.current = scanner;
      await scanner.start();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Camera unavailable or permission denied.';
      setCameraError(msg);
    }
  };

  useEffect(() => {
    void startCamera();
    const currentVideo = videoRef.current;

    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.stop();
        qrScannerRef.current.destroy();
      }
      if (currentVideo && currentVideo.srcObject) {
        const stream = currentVideo.srcObject as MediaStream;
        stream.getTracks().forEach((t) => t.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleManualLookup = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!manualAssetId.trim()) return;
    await resolveAssetDetails(manualAssetId);
  };

  const handleStartReportForAsset = async () => {
    if (!detectedAsset) return;

    const newReportId = `rep-${Date.now()}`;
    const newReport: Report = {
      id: newReportId,
      title: `Field Inspection — ${detectedAsset.id}`,
      siteId: 'site-kukatpally',
      siteName: detectedAsset.siteName,
      category: 'ELECTRICAL INSPECTION',
      inspector: 'K. S. Rao (Field Eng #104)',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft',
      priority: 'high',
      priorityReason: 'Asset tagged via QR scanner with open issues pending',
      summary: `Routine equipment assessment initiated via QR barcode scanner for ${detectedAsset.id}. Prior history indicates ${detectedAsset.previousReportsCount} linked inspections with recurring hazards.`,
      panelId: detectedAsset.id,
      isPanelIdMissing: false,
      findings: [
        {
          id: `find-${Date.now()}-1`,
          reportId: newReportId,
          text: `QR Scan verified asset ${detectedAsset.id}. Equipment baseline verified on site.`,
          category: 'Equipment Verification',
          severity: 'high',
          confidence: 0.96,
          isVerified: true,
          assetId: detectedAsset.id,
        },
      ],
      actions: [
        {
          id: `act-${Date.now()}-1`,
          reportId: newReportId,
          title: `Resolve open maintenance punch list item on ${detectedAsset.id}`,
          assignee: 'Electrical Team Lead',
          priority: 'high',
          status: 'todo',
          dueDate: new Date(Date.now() + 86400000).toISOString(),
          isCompleted: false,
        },
      ],
      evidenceIds: [],
      editHistory: [],
      overallConfidence: 0.95,
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
            <h1 className="text-heading-sm font-bold text-text-primary">QR & Asset Scanner</h1>
            <p className="text-metadata text-text-muted">BarcodeDetector & offline equipment telemetry</p>
          </div>
        </div>

        <span className="px-2 py-0.5 rounded text-metadata-xs font-mono font-bold bg-semantic-green-surface text-semantic-green-text border border-semantic-green-border">
          OFFLINE SCANNER
        </span>
      </div>

      {/* Main Scanner Viewport or Error */}
      {cameraError ? (
        <div className="space-y-4">
          <ErrorState
            title="Camera Unavailable / Permission Denied"
            message="FieldNote could not access the camera for live barcode scanning. You can use the manual asset ID lookup below to inspect records and generate reports."
            onRetry={startCamera}
          />

          {/* Manual Entry Fallback Form */}
          <form
            onSubmit={handleManualLookup}
            className="p-5 rounded-2xl bg-bg-surface1 border border-border-default space-y-3"
          >
            <div className="flex items-center gap-2 text-text-primary">
              <Search className="w-4 h-4 text-semantic-green" />
              <h3 className="text-body-sm font-bold">Manual Equipment ID Entry</h3>
            </div>
            <p className="text-metadata text-text-muted">
              Enter the asset tag or panel serial number to look up historical inspection dossiers.
            </p>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={manualAssetId}
                onChange={(e) => setManualAssetId(e.target.value)}
                placeholder="Enter Asset ID (e.g. PANEL-204)..."
                className="flex-1 px-3 py-2.5 rounded-xl bg-bg-surface2 border border-border-default text-text-primary placeholder:text-text-muted text-body-sm font-mono focus:outline-none focus:border-semantic-green"
              />
              <Button size="md" variant="primary" type="submit">
                Lookup Asset
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-bg-base border border-border-default flex items-center justify-center">
            <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />

            {/* Viewfinder corner brackets overlay */}
            <div className="absolute inset-8 pointer-events-none flex flex-col justify-between">
              <div className="flex justify-between">
                <div className="w-8 h-8 border-t-4 border-l-4 border-semantic-green rounded-tl-lg" />
                <div className="w-8 h-8 border-t-4 border-r-4 border-semantic-green rounded-tr-lg" />
              </div>
              <div className="flex justify-center">
                <span className="px-3 py-1 rounded-full bg-bg-base/80 backdrop-blur-sm border border-border-subtle text-metadata-xs font-mono text-text-primary animate-pulse">
                  Align QR code or Barcode inside frame
                </span>
              </div>
              <div className="flex justify-between">
                <div className="w-8 h-8 border-b-4 border-l-4 border-semantic-green rounded-bl-lg" />
                <div className="w-8 h-8 border-b-4 border-r-4 border-semantic-green rounded-br-lg" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between px-1">
            <button
              type="button"
              onClick={() => resolveAssetDetails('PANEL-204')}
              className="text-metadata-xs text-semantic-green font-semibold hover:underline flex items-center gap-1"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Simulate QR Detection: PANEL-204</span>
            </button>

            <button
              type="button"
              onClick={() => setCameraError('Permission denied / No video input device.')}
              className="text-metadata-xs text-text-muted hover:text-semantic-amber"
            >
              Simulate Camera Error State
            </button>
          </div>
        </div>
      )}

      {/* Detected Asset Card (Spec 14) */}
      {detectedAsset && (
        <div className="p-5 rounded-2xl bg-bg-surface1 border-2 border-semantic-green shadow-md space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-semantic-green shrink-0" />
                <span className="text-body-md font-bold text-text-primary font-mono">
                  Detected: {detectedAsset.id}
                </span>
              </div>
              <p className="text-metadata text-text-secondary">{detectedAsset.title}</p>
            </div>

            <span className="px-2 py-0.5 rounded text-metadata-xs font-mono font-bold bg-semantic-green-surface text-semantic-green-text border border-semantic-green-border">
              ASSET LOCATED
            </span>
          </div>

          {/* Telemetry Metrics */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border-subtle">
            <div className="p-3 rounded-xl bg-bg-surface2 border border-border-subtle">
              <span className="text-metadata-xs font-mono text-text-muted uppercase block">Previous reports</span>
              <strong className="text-heading-sm font-bold text-text-primary font-mono">
                {detectedAsset.previousReportsCount}
              </strong>
            </div>

            <div className="p-3 rounded-xl bg-bg-surface2 border border-border-subtle">
              <span className="text-metadata-xs font-mono text-text-muted uppercase block">Open issues</span>
              <strong className="text-heading-sm font-bold text-semantic-amber font-mono">
                {detectedAsset.openIssuesCount}
              </strong>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Button
              size="md"
              variant="primary"
              icon={FilePlus}
              onClick={handleStartReportForAsset}
              className="w-full justify-center"
            >
              Start Report for Asset
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
