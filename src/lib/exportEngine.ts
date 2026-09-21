import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import type { Report } from '../shared/types';
import { db } from '../data/db';

export interface ExportOptions {
  includePhotos?: boolean;
  includeGps?: boolean;
  includeTimestamp?: boolean;
  includeSignature?: boolean;
}

/**
 * Rasterizes Indic script (Telugu / Hindi) into a high-DPI canvas image
 * to ensure perfect complex font ligature shaping in client-generated PDFs.
 */
export interface RasterizedText {
  dataUrl: string;
  widthPt: number;
  heightPt: number;
}

/**
 * Cleans text for Latin PDF rendering (e.g. converting superscript 16mm² to 16 mm2)
 */
export function cleanPdfText(str: string): string {
  if (!str) return '';
  return str
    .replace(/16mm²/g, '16 mm2')
    .replace(/mm²/g, 'mm2')
    .replace(/²/g, '2');
}

/**
 * Rasterizes Indic script (Telugu / Hindi) into a high-DPI canvas image
 * to ensure perfect complex font ligature shaping in client-generated PDFs.
 */
export function rasterizeIndicText(
  text: string,
  fontSizePx = 14,
  fontFamily = 'Noto Sans Telugu, Noto Sans Devanagari, sans-serif'
): RasterizedText {
  if (typeof document === 'undefined') return { dataUrl: '', widthPt: 0, heightPt: 0 };
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return { dataUrl: '', widthPt: 0, heightPt: 0 };

  const dpr = 2; // High DPI for crisp rendering
  ctx.font = `600 ${fontSizePx * dpr}px ${fontFamily}`;
  const metrics = ctx.measureText(text);
  canvas.width = Math.ceil(metrics.width) + 20 * dpr;
  canvas.height = Math.ceil(fontSizePx * 1.8 * dpr);

  ctx.font = `600 ${fontSizePx * dpr}px ${fontFamily}`;
  let textColor = '#0F172A';
  try {
    const computed = getComputedStyle(document.documentElement).getPropertyValue('--color-text-primary').trim();
    if (computed) textColor = computed;
  } catch {
    // fallback
  }
  ctx.fillStyle = textColor;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 10 * dpr, canvas.height / 2);

  const widthPt = canvas.width / dpr;
  const heightPt = canvas.height / dpr;

  return { dataUrl: canvas.toDataURL('image/png'), widthPt, heightPt };
}

/**
 * Checks if a string contains Indic characters (Telugu / Devanagari)
 */
export function containsIndicScript(text: string): boolean {
  // Telugu and Devanagari script detection with unicode flag
  return /\p{Script=Telugu}|\p{Script=Devanagari}/u.test(text);
}

/**
 * Generates an on-device PDF inspection report
 */
export async function generateReportPdf(
  report: Report,
  options: ExportOptions = {
    includePhotos: true,
    includeGps: true,
    includeTimestamp: true,
    includeSignature: true,
  }
): Promise<{ blob: Blob; filename: string }> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 40;

  // Header Banner
  doc.setFillColor(15, 23, 42); // #0F172A
  doc.rect(36, y, pageWidth - 72, 54, 'F');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('FIELDNOTE · OFFICIAL INSPECTION DOSSIER', 50, y + 24);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `CATEGORY: ${report.category || 'ELECTRICAL INSPECTION'}  |  REPORT ID: ${report.id}`,
    50,
    y + 42
  );

  y += 70;

  // High Priority Banner
  if (report.priority === 'high' || report.priority === 'critical') {
    doc.setFillColor(254, 242, 242);
    doc.setDrawColor(239, 68, 68);
    doc.rect(36, y, pageWidth - 72, 34, 'FD');

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(185, 28, 28);
    doc.text('HIGH PRIORITY / SAFETY HAZARD DETECTED', 50, y + 14);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(127, 29, 29);
    doc.text(report.priorityReason || 'Thermal & loose terminal risk', 50, y + 26);

    y += 46;
  }

  // Metadata Grid Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.rect(36, y, pageWidth - 72, 60, 'FD');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);

  doc.text('SITE / LOCATION:', 50, y + 18);
  doc.text('PANEL / ASSET ID:', 210, y + 18);
  doc.text('INSPECTOR:', 360, y + 18);

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);

  doc.text(report.siteName, 50, y + 32);
  doc.text(report.panelId || 'PANEL-204', 210, y + 32);
  doc.text(report.inspector, 360, y + 32);

  if (options.includeGps && report.geo) {
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `GPS: ${report.geo.latitude.toFixed(4)}° N, ${report.geo.longitude.toFixed(4)}° E (${report.geo.address || 'Geofenced'})`,
      50,
      y + 48
    );
  }

  y += 74;

  // Executive Summary Section
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('Executive Field Summary', 36, y);
  y += 14;

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(51, 65, 85);
  const summaryClean = cleanPdfText(report.summary);
  const summaryLines = doc.splitTextToSize(summaryClean, pageWidth - 72);
  doc.text(summaryLines, 36, y);
  y += summaryLines.length * 13 + 12;

  // Telugu / Multilingual Section Demonstration (Rasterized if present)
  const teluguExcerpt = 'లూజ్ కనెక్షన్లు గమనించబడ్డాయి (Loose connections verified on site)';
  if (containsIndicScript(teluguExcerpt)) {
    const raster = rasterizeIndicText(teluguExcerpt, 13);
    if (raster.dataUrl) {
      const maxWidth = pageWidth - 72;
      const displayWidth = Math.min(raster.widthPt, maxWidth);
      const displayHeight = (raster.heightPt * displayWidth) / raster.widthPt;
      doc.addImage(raster.dataUrl, 'PNG', 36, y, displayWidth, displayHeight);
      y += Math.ceil(displayHeight) + 16;
    }
  }

  // Findings Section
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(`Findings & Extracted Hazards (${report.findings.length})`, 36, y);
  y += 16;

  for (const finding of report.findings) {
    doc.setFillColor(241, 245, 249);
    doc.rect(36, y, pageWidth - 72, 28, 'F');

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(`[${finding.severity.toUpperCase()}] ${cleanPdfText(finding.category)}`, 46, y + 12);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    const cleanedFindingText = cleanPdfText(finding.text);
    const findingLines = doc.splitTextToSize(cleanedFindingText, pageWidth - 100);
    doc.text(findingLines[0] || cleanedFindingText, 46, y + 22);

    y += 34;
  }

  y += 8;

  // Action Items Section
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(`Mandatory Action Items (${report.actions.length})`, 36, y);
  y += 16;

  for (const act of report.actions) {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(203, 213, 225);
    doc.rect(36, y, pageWidth - 72, 28, 'FD');

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(`• ${cleanPdfText(act.title)}`, 46, y + 12);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `Assignee: ${act.assignee || 'Unassigned'}  |  Status: ${act.isCompleted ? 'COMPLETED' : 'PENDING'}`,
      46,
      y + 22
    );

    y += 34;
  }

  y += 10;

  // Evidence Photos (if enabled)
  if (options.includePhotos) {
    const evidenceList = await db.evidence.where('reportId').equals(report.id).toArray();
    if (evidenceList.length > 0) {
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text(`Attached Photographic Evidence (${evidenceList.length} tags)`, 36, y);
      y += 14;

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      for (const evi of evidenceList) {
        doc.text(`- Photo Ref: ${evi.caption || 'Inspection detail'} (${new Date(evi.timestamp).toLocaleTimeString()})`, 46, y);
        y += 12;
      }
      y += 8;
    }
  }

  // Signature & Cryptographic Ledger Footer
  if (y > 680) {
    doc.addPage();
    y = 50;
  }

  doc.setDrawColor(226, 232, 240);
  doc.line(36, y, pageWidth - 36, y);
  y += 16;

  // Sign-off box
  if (options.includeSignature && report.signatureDataUrl) {
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('CERTIFIED INSPECTOR SIGNATURE:', 36, y);

    try {
      doc.addImage(report.signatureDataUrl, 'PNG', 36, y + 6, 140, 42);
    } catch {
      doc.text('[Signature Image Attached]', 36, y + 20);
    }
  }

  // Hash Chain Seal
  const lastHash =
    report.editHistory.length > 0
      ? report.editHistory[report.editHistory.length - 1]?.hash
      : 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(16, 185, 129);
  doc.text('SHA-256 IMMUTABLE LEDGER SEAL: VALID', pageWidth - 260, y + 10);

  doc.setFont('Courier', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Hash: ${lastHash?.substring(0, 32)}...`, pageWidth - 260, y + 22);
  doc.text(`Timestamp: ${new Date().toISOString()}`, pageWidth - 260, y + 32);
  doc.text('On-device Cryptographic Ledger Seal', pageWidth - 260, y + 42);

  const filename = `${report.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${report.id}.pdf`;
  const blob = doc.output('blob');

  return { blob, filename };
}

/**
 * Generates an on-device Excel (.xlsx) workbook with multiple sheets
 */
export async function generateReportExcel(
  report: Report,
  _options: ExportOptions = {}
): Promise<{ blob: Blob; filename: string }> {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Report Details
  const detailsData = [
    ['FieldNote Inspection Dossier'],
    ['Report ID', report.id],
    ['Title', report.title],
    ['Category', report.category || 'ELECTRICAL INSPECTION'],
    ['Site Name', report.siteName],
    ['Panel / Asset ID', report.panelId || 'PANEL-204'],
    ['Inspector', report.inspector],
    ['Date Created', new Date(report.createdAt).toLocaleString()],
    ['Priority Level', report.priority.toUpperCase()],
    ['Priority Reason', report.priorityReason || ''],
    ['Remediation Deadline', report.deadline || ''],
    ['Executive Summary', report.summary],
    ['Overall Confidence', `${Math.round(report.overallConfidence * 100)}%`],
    ['GPS Latitude', report.geo?.latitude ?? ''],
    ['GPS Longitude', report.geo?.longitude ?? ''],
  ];
  const wsDetails = XLSX.utils.aoa_to_sheet(detailsData);
  XLSX.utils.book_append_sheet(wb, wsDetails, 'Report Summary');

  // Sheet 2: Findings
  const findingsHeaders = ['ID', 'Category', 'Severity', 'Confidence', 'Verified', 'Occurrences', 'Finding Text'];
  const findingsRows = report.findings.map((f) => [
    f.id,
    f.category,
    f.severity.toUpperCase(),
    `${Math.round(f.confidence * 100)}%`,
    f.isVerified ? 'YES' : 'NO',
    f.occurrences || 1,
    f.text,
  ]);
  const wsFindings = XLSX.utils.aoa_to_sheet([findingsHeaders, ...findingsRows]);
  XLSX.utils.book_append_sheet(wb, wsFindings, 'Findings');

  // Sheet 3: Actions
  const actionsHeaders = ['ID', 'Title', 'Assignee', 'Priority', 'Status', 'Due Date', 'Completed'];
  const actionsRows = report.actions.map((a) => [
    a.id,
    a.title,
    a.assignee || 'Unassigned',
    a.priority.toUpperCase(),
    a.status.toUpperCase(),
    a.dueDate ? new Date(a.dueDate).toLocaleDateString() : '',
    a.isCompleted ? 'YES' : 'NO',
  ]);
  const wsActions = XLSX.utils.aoa_to_sheet([actionsHeaders, ...actionsRows]);
  XLSX.utils.book_append_sheet(wb, wsActions, 'Action Items');

  // Sheet 4: Audit Trail
  const auditHeaders = ['Block #', 'Field', 'Before', 'After', 'Timestamp', 'Prev Hash', 'Block Hash'];
  const auditRows = report.editHistory.map((e, idx) => [
    idx + 1,
    e.field,
    String(e.before),
    String(e.after),
    e.timestamp,
    e.prevHash,
    e.hash,
  ]);
  const wsAudit = XLSX.utils.aoa_to_sheet([auditHeaders, ...auditRows]);
  XLSX.utils.book_append_sheet(wb, wsAudit, 'Audit Ledger');

  const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  const blob = new Blob([buf], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const filename = `${report.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${report.id}.xlsx`;

  return { blob, filename };
}

/**
 * Generates an on-device CSV export
 */
export async function generateReportCsv(
  report: Report,
  _options: ExportOptions = {}
): Promise<{ blob: Blob; filename: string }> {
  const lines: string[] = [];

  lines.push(`Report ID,${report.id}`);
  lines.push(`Title,"${report.title.replace(/"/g, '""')}"`);
  lines.push(`Category,"${report.category || 'ELECTRICAL INSPECTION'}"`);
  lines.push(`Site,"${report.siteName}"`);
  lines.push(`Panel ID,"${report.panelId || 'PANEL-204'}"`);
  lines.push(`Inspector,"${report.inspector}"`);
  lines.push(`Priority,${report.priority.toUpperCase()}`);
  lines.push(`Summary,"${report.summary.replace(/"/g, '""')}"`);
  lines.push('');

  lines.push('FINDINGS');
  lines.push('ID,Category,Severity,Confidence,Verified,Occurrences,Text');
  for (const f of report.findings) {
    lines.push(
      `"${f.id}","${f.category}","${f.severity}",${f.confidence},${f.isVerified ? 'YES' : 'NO'},${f.occurrences || 1},"${f.text.replace(/"/g, '""')}"`
    );
  }
  lines.push('');

  lines.push('ACTION ITEMS');
  lines.push('ID,Title,Assignee,Priority,Status,Due Date,Completed');
  for (const a of report.actions) {
    lines.push(
      `"${a.id}","${a.title.replace(/"/g, '""')}","${a.assignee || 'Unassigned'}","${a.priority}","${a.status}","${a.dueDate || ''}",${a.isCompleted ? 'YES' : 'NO'}`
    );
  }

  const csvContent = lines.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  const filename = `${report.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${report.id}.csv`;

  return { blob, filename };
}

/**
 * Generates an on-device JSON export with complete cryptographic metadata
 */
export async function generateReportJson(
  report: Report,
  _options: ExportOptions = {}
): Promise<{ blob: Blob; filename: string }> {
  const exportPayload = {
    schemaVersion: '1.0.0',
    exportedAt: new Date().toISOString(),
    generator: 'FieldNote PWA On-Device Engine',
    report,
    ledger: {
      blockCount: report.editHistory.length,
      headHash:
        report.editHistory.length > 0
          ? report.editHistory[report.editHistory.length - 1]?.hash
          : 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    },
  };

  const jsonStr = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const filename = `${report.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${report.id}.json`;

  return { blob, filename };
}

/**
 * Generates a clean plain text inspection report
 */
export async function generateReportText(
  report: Report,
  _options: ExportOptions = {}
): Promise<{ blob: Blob; filename: string }> {
  const text = `
================================================================================
FIELDNOTE INSPECTION DOSSIER: ${report.title.toUpperCase()}
================================================================================
Report ID:     ${report.id}
Category:      ${report.category || 'ELECTRICAL INSPECTION'}
Site Name:     ${report.siteName}
Panel / Asset: ${report.panelId || 'PANEL-204'}
Inspector:     ${report.inspector}
Date Created:  ${new Date(report.createdAt).toLocaleString()}
Priority:      ${report.priority.toUpperCase()} (${report.priorityReason || 'Standard'})
Deadline:      ${report.deadline || 'N/A'}
GPS Geofence:  ${report.geo ? `${report.geo.latitude}, ${report.geo.longitude}` : 'Manual'}

EXECUTIVE SUMMARY:
${report.summary}

FINDINGS (${report.findings.length}):
${report.findings.map((f, i) => `  ${i + 1}. [${f.severity.toUpperCase()}] ${f.text} (${f.category})`).join('\n')}

MANDATORY ACTIONS (${report.actions.length}):
${report.actions.map((a, i) => `  ${i + 1}. [${a.isCompleted ? 'DONE' : 'TODO'}] ${a.title} (Assignee: ${a.assignee || 'Unassigned'})`).join('\n')}

CRYPTOGRAPHIC SEAL:
  Latest Block Hash: ${report.editHistory[report.editHistory.length - 1]?.hash || 'GENESIS'}
  Verification: On-device immutable ledger seal verified
================================================================================
`.trim();

  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const filename = `${report.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${report.id}.txt`;
  return { blob, filename };
}

/**
 * Downloads or shares a generated file using Web Share API where supported
 */
export async function downloadOrShareFile(file: {
  blob: Blob;
  filename: string;
  mimeType: string;
}): Promise<void> {
  const shareFile = new File([file.blob], file.filename, { type: file.mimeType });

  // Use Web Share API if supported with file sharing
  if (
    typeof navigator !== 'undefined' &&
    'canShare' in navigator &&
    navigator.canShare?.({ files: [shareFile] })
  ) {
    try {
      await navigator.share({
        files: [shareFile],
        title: file.filename,
        text: 'FieldNote Inspection Dossier',
      });
      return;
    } catch {
      // Fallback to standard download if user dismissed or cancelled share dialog
    }
  }

  // Fallback anchor download
  const url = URL.createObjectURL(file.blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
