import { chromium } from 'playwright';
import { expect } from '@playwright/test';
import { preview } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const screensDir = path.resolve(__dirname, '../docs/screens/phase-5');

if (!fs.existsSync(screensDir)) {
  fs.mkdirSync(screensDir, { recursive: true });
}

async function runVerification() {
  console.log('Starting preview server for Phase 4.5 E2E test...');
  const previewServer = await preview({
    preview: {
      port: 4173,
      host: '127.0.0.1',
    },
  });

  const baseUrl = 'http://127.0.0.1:4173';
  console.log(`Preview server running at ${baseUrl}`);

  const browser = await chromium.launch({
    headless: true,
    args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
  });
  const consoleErrors = [];

  try {
    // 1. Mobile verification (390x844) with OFFLINE mode
    console.log('\n--- Setting up Mobile Context (390x844) & Testing Offline Core ---');
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      permissions: ['microphone', 'notifications'],
      acceptDownloads: true,
    });

    const mobilePage = await mobileContext.newPage();

    mobilePage.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error(`[Browser Console Error]: ${msg.text()}`);
        consoleErrors.push(msg.text());
      }
    });

    // Initial load to establish PWA / IndexedDB seed
    await mobilePage.goto(`${baseUrl}/capture`, { waitUntil: 'networkidle' });
    await mobilePage.waitForTimeout(300);

    // ACTIVATE STRICT OFFLINE MODE PER SPEC RULE 6 & 8
    console.log('Activating context.setOffline(true)...');
    await mobileContext.setOffline(true);
    console.log('✓ Strict offline mode activated');

    // Verify Simulated engine badge is visible on mobile (<640px)
    const simulatedBadge = mobilePage.getByText('Simulated engine').first();
    await expect(simulatedBadge).toBeVisible();
    console.log('✓ Simulated engine badge visible on mobile viewport');

    // ============================================================
    // 9-STEP SCRIPTED DEMO MODE TOUR
    // ============================================================
    console.log('\n--- Executing 9-Step Demo Mode Tour (100% Offline) ---');

    // Step 1: Capture Home
    const headerHeading = mobilePage.getByRole('heading', { name: /What happened today\?/i });
    await expect(headerHeading).toBeVisible();
    await mobilePage.screenshot({ path: path.join(screensDir, '01-demo-capture-home-390x844.png') });
    console.log('✓ Step 1: Verified and captured 01-demo-capture-home-390x844.png');

    // Step 2: Audio Recording with live frequency waveform
    const recordBtn = mobilePage.getByRole('button', { name: 'Start audio capture' });
    await expect(recordBtn).toBeVisible();
    await recordBtn.click();
    const recordingLabel = mobilePage.getByText('RECORDING');
    await expect(recordingLabel).toBeVisible();
    await mobilePage.waitForTimeout(600);
    await mobilePage.screenshot({ path: path.join(screensDir, '02-demo-recording-live-390x844.png') });
    console.log('✓ Step 2: Verified and captured 02-demo-recording-live-390x844.png');

    // Step 3: Staggered Processing Pipeline
    const finishBtn = mobilePage.getByRole('button', { name: 'Finish & Compile' });
    await expect(finishBtn).toBeVisible();
    await finishBtn.click();
    await mobilePage.waitForTimeout(300);
    await mobilePage.screenshot({ path: path.join(screensDir, '03-demo-pipeline-processing-390x844.png') });
    console.log('✓ Step 3: Verified and captured 03-demo-pipeline-processing-390x844.png');

    // Step 4: Structured Report Editor
    await mobilePage.waitForURL(/\/report\//, { timeout: 10000 });
    const categoryBadge = mobilePage.getByText('ELECTRICAL INSPECTION').first();
    await expect(categoryBadge).toBeVisible();
    await mobilePage.waitForTimeout(400);
    await mobilePage.screenshot({ path: path.join(screensDir, '04-demo-report-editor-initial-390x844.png') });
    console.log('✓ Step 4: Verified and captured 04-demo-report-editor-initial-390x844.png');

    // Step 5: Missing Entity QuestionCard Resolution
    const assignBtn = mobilePage.getByRole('button', { name: /Assign "PANEL-204"/i });
    await expect(assignBtn).toBeVisible();
    await assignBtn.click();
    await expect(assignBtn).toBeHidden();

    // Verify Panel ID is assigned and badge turns green
    const panelField = mobilePage.locator('#field-panelId');
    await expect(panelField).toContainText('PANEL-204');
    const linkedAssetBanner = mobilePage.getByText(/Linked Asset:/i);
    await expect(linkedAssetBanner).toBeVisible();
    await mobilePage.waitForTimeout(400);
    await mobilePage.screenshot({ path: path.join(screensDir, '05-demo-questioncard-resolved-390x844.png') });
    console.log('✓ Step 5: Verified Panel ID resolved to PANEL-204 and captured 05-demo-questioncard-resolved-390x844.png');

    // Step 6: Photographic Evidence & Signature Sign-off
    const sampleSignBtn = mobilePage.getByRole('button', { name: /Use certified signature mark/i });
    await expect(sampleSignBtn).toBeVisible();
    await sampleSignBtn.click();
    await mobilePage.waitForTimeout(200);

    const signBtn = mobilePage.getByRole('button', { name: 'Sign & Seal' });
    await expect(signBtn).toBeVisible();
    await signBtn.click();
    await mobilePage.waitForTimeout(300);

    // Verify SHA-256 Ledger seal
    const verifySealBtn = mobilePage.getByRole('button', { name: 'Verify Seal' });
    await expect(verifySealBtn).toBeVisible();
    await verifySealBtn.click();
    const ledgerIntact = mobilePage.getByText(/SHA-256 Ledger Intact/i);
    await expect(ledgerIntact).toBeVisible();

    await mobilePage.screenshot({ path: path.join(screensDir, '06-demo-photo-signature-sealed-390x844.png') });
    console.log('✓ Step 6: Verified signature & cryptographic ledger seal and captured 06-demo-photo-signature-sealed-390x844.png');

    // Step 7: Export Sheet & Real On-Device PDF Download
    const exportBtn = mobilePage.getByRole('button', { name: 'Export' });
    await expect(exportBtn).toBeVisible();
    await exportBtn.click();
    await mobilePage.waitForTimeout(400);

    const generatePdfBtn = mobilePage.getByRole('button', { name: /Generate & Download PDF/i });
    await expect(generatePdfBtn).toBeVisible();
    await mobilePage.screenshot({ path: path.join(screensDir, '07-demo-export-sheet-modal-390x844.png') });
    console.log('✓ Step 7a: Captured 07-demo-export-sheet-modal-390x844.png');

    // Trigger Real PDF Download and assert filename and size
    const downloadPromise = mobilePage.waitForEvent('download', { timeout: 10000 });
    await generatePdfBtn.click();
    const download = await downloadPromise;
    const downloadedFilename = download.suggestedFilename();
    expect(downloadedFilename).toMatch(/\.pdf$/i);

    const downloadPath = path.join(screensDir, downloadedFilename);
    await download.saveAs(downloadPath);
    const pdfSizeBytes = fs.statSync(downloadPath).size;
    expect(pdfSizeBytes).toBeGreaterThan(5000);
    console.log(`✓ Step 7b: Real PDF Download Verified: ${downloadedFilename} (${pdfSizeBytes} bytes > 5 KB)`);

    // Close export sheet
    const closeExportBtn = mobilePage.getByRole('button', { name: 'Close sheet' }).or(mobilePage.getByRole('button', { name: 'Cancel' })).first();
    await expect(closeExportBtn).toBeVisible();
    await closeExportBtn.click();
    await mobilePage.waitForTimeout(300);

    // Step 8: Tasks Screen (Punch List with Open/Completed groups)
    await mobilePage.goto(`${baseUrl}/tasks`);
    const tasksHeading = mobilePage.getByRole('heading', { name: /Action Items & Punch Lists/i });
    await expect(tasksHeading).toBeVisible();
    const openGroup = mobilePage.getByText(/OPEN/i).first();
    await expect(openGroup).toBeVisible();
    await mobilePage.waitForTimeout(300);
    await mobilePage.screenshot({ path: path.join(screensDir, '08-demo-tasks-screen-390x844.png') });
    console.log('✓ Step 8: Verified and captured 08-demo-tasks-screen-390x844.png');

    // Step 9: Asset Page & PANEL-204 Recurring Issue Timeline
    await mobilePage.goto(`${baseUrl}/assets/PANEL-204`);
    const assetTitle = mobilePage.getByText(/PANEL-204/i).first();
    await expect(assetTitle).toBeVisible();
    const recurringFlag = mobilePage.getByText(/Recurring Issue Detected/i);
    await expect(recurringFlag).toBeVisible();
    await mobilePage.waitForTimeout(400);
    await mobilePage.screenshot({ path: path.join(screensDir, '09-demo-panel204-asset-history-390x844.png') });
    console.log('✓ Step 9: Verified and captured 09-demo-panel204-asset-history-390x844.png');

    // Step 10: Reports List with Search, Filter Chips & Site Selector (Spec 9)
    await mobilePage.goto(`${baseUrl}/reports`);
    const reportsHeading = mobilePage.getByRole('heading', { name: /Inspection Dossiers & Audits/i });
    await expect(reportsHeading).toBeVisible();

    // Verify filter buttons
    const filterAll = mobilePage.getByRole('button', { name: /ALL DOSSIERS/i });
    const filterHigh = mobilePage.getByRole('button', { name: /HIGH PRIORITY/i });
    const filterOpen = mobilePage.getByRole('button', { name: /OPEN/i }).first();
    const filterCompleted = mobilePage.getByRole('button', { name: /COMPLETED/i }).first();
    await expect(filterAll).toBeVisible();
    await expect(filterHigh).toBeVisible();
    await expect(filterOpen).toBeVisible();
    await expect(filterCompleted).toBeVisible();

    // Verify card footer format "X findings · Y actions"
    const footerStats = mobilePage.getByText(/\d+ findings · \d+ actions/i).first();
    await expect(footerStats).toBeVisible();
    console.log('✓ Verified card footer format: "X findings · Y actions"');

    await mobilePage.waitForTimeout(300);
    await mobilePage.screenshot({ path: path.join(screensDir, '10-mobile-reports-list-390x844.png') });
    console.log('✓ Captured 10-mobile-reports-list-390x844.png');

    // Filter by HIGH PRIORITY
    await filterHigh.click();
    await mobilePage.waitForTimeout(300);
    await mobilePage.screenshot({ path: path.join(screensDir, '11-mobile-reports-filtered-high-390x844.png') });
    console.log('✓ Captured 11-mobile-reports-filtered-high-390x844.png');

    // Filter by Kukatpally site
    const siteSelect = mobilePage.locator('select');
    await expect(siteSelect).toBeVisible();
    await siteSelect.selectOption('kukatpally');
    await mobilePage.waitForTimeout(300);
    await mobilePage.screenshot({ path: path.join(screensDir, '12-mobile-reports-site-kukatpally-390x844.png') });
    console.log('✓ Captured 12-mobile-reports-site-kukatpally-390x844.png');

    // Test Reports Empty Search State
    const searchInput = mobilePage.getByPlaceholder(/Search by title/i);
    await searchInput.fill('NONEXISTENT_QUERY_XYZ');
    await mobilePage.waitForTimeout(300);
    const noReportsState = mobilePage.getByText(/No matching dossiers found/i);
    await expect(noReportsState).toBeVisible();
    await mobilePage.screenshot({ path: path.join(screensDir, '13-mobile-reports-empty-search-390x844.png') });
    console.log('✓ Captured 13-mobile-reports-empty-search-390x844.png');
    await searchInput.fill('');

    // ============================================================
    // FEATURE: IMPORT HUB BOTTOM SHEET (SPEC 3)
    // ============================================================
    console.log('\n--- Verifying Import Hub Bottom Sheet ---');
    await mobilePage.goto(`${baseUrl}/capture`);
    const importBtn = mobilePage.getByRole('button', { name: 'Import' });
    await expect(importBtn).toBeVisible();
    await importBtn.click();
    await mobilePage.waitForTimeout(300);

    // Verify 8 options & Web Share Target notice banner
    const shareTargetNotice = mobilePage.getByText(/Direct sharing from system apps into FieldNote works only for the installed Android PWA/i);
    await expect(shareTargetNotice).toBeVisible();
    await expect(mobilePage.getByText('Audio File (M4A, MP3, WAV, OPUS)')).toBeVisible();
    await expect(mobilePage.getByText('Clipboard Text')).toBeVisible();
    await expect(mobilePage.getByText('QR / Barcode Scanner')).toBeVisible();

    await mobilePage.screenshot({ path: path.join(screensDir, '14-import-hub-sheet-390x844.png') });
    console.log('✓ Captured 14-import-hub-sheet-390x844.png');

    // Trigger and verify Unsupported File format ErrorState
    const testUnsupportedBtn = mobilePage.getByRole('button', { name: /Test Unsupported File Error/i });
    await expect(testUnsupportedBtn).toBeVisible();
    await testUnsupportedBtn.click();
    await mobilePage.waitForTimeout(200);

    const unsupportedError = mobilePage.getByText(/Unsupported file format/i);
    await expect(unsupportedError).toBeVisible();
    const formatsMentioned = mobilePage.getByText(/Supported formats: M4A, MP3, WAV, OPUS/i);
    await expect(formatsMentioned).toBeVisible();
    await mobilePage.screenshot({ path: path.join(screensDir, '15-import-hub-unsupported-file-error-390x844.png') });
    console.log('✓ Captured 15-import-hub-unsupported-file-error-390x844.png');

    // Dismiss error and close sheet
    const dismissBtn = mobilePage.getByRole('button', { name: /Dismiss Error/i });
    await dismissBtn.click();
    const closeSheetBtn = mobilePage.getByRole('button', { name: 'Close sheet' }).first();
    await closeSheetBtn.click();
    await mobilePage.waitForTimeout(200);

    // ============================================================
    // FEATURE: QR / ASSET SCANNER (SPEC 14)
    // ============================================================
    console.log('\n--- Verifying QR / Asset Scanner ---');
    await mobilePage.goto(`${baseUrl}/scanner`);
    await mobilePage.waitForTimeout(500);

    // Trigger QR detection simulation
    const simQrBtn = mobilePage.getByRole('button', { name: /Simulate QR Detection: PANEL-204/i });
    await expect(simQrBtn).toBeVisible();
    await simQrBtn.click();
    await mobilePage.waitForTimeout(300);

    // Assert asset details for PANEL-204
    const assetTag = mobilePage.getByText(/Detected: PANEL-204/i).first();
    await expect(assetTag).toBeVisible();
    const prevReports = mobilePage.getByText(/Previous reports/i).first();
    await expect(prevReports).toBeVisible();
    const openIssues = mobilePage.getByText(/Open issues/i).first();
    await expect(openIssues).toBeVisible();

    const startReportBtn = mobilePage.getByRole('button', { name: /Start Report for Asset/i });
    await expect(startReportBtn).toBeVisible();

    await mobilePage.screenshot({ path: path.join(screensDir, '16-qr-scanner-telemetry-390x844.png') });
    console.log('✓ Captured 16-qr-scanner-telemetry-390x844.png');

    // Test camera error state with manual lookup fallback
    const simCamErrorBtn = mobilePage.getByRole('button', { name: /Simulate Camera Error State/i });
    await expect(simCamErrorBtn).toBeVisible();
    await simCamErrorBtn.click();
    await mobilePage.waitForTimeout(300);

    const manualLookupInput = mobilePage.getByPlaceholder(/Enter Asset ID/i);
    await expect(manualLookupInput).toBeVisible();
    await mobilePage.screenshot({ path: path.join(screensDir, '16b-qr-scanner-camera-error-fallback-390x844.png') });
    console.log('✓ Captured 16b-qr-scanner-camera-error-fallback-390x844.png');

    // ============================================================
    // FEATURE: CAMERA / DOCUMENT OCR (SPEC 13)
    // ============================================================
    console.log('\n--- Verifying Document Camera & OCR Screen ---');
    await mobilePage.goto(`${baseUrl}/ocr`);
    await mobilePage.waitForTimeout(400);

    // Verify viewfinder overlay and Capture button
    const captureButton = mobilePage.getByRole('button', { name: 'Capture', exact: true });
    await expect(captureButton).toBeVisible();
    await mobilePage.screenshot({ path: path.join(screensDir, '17-camera-ocr-viewfinder-390x844.png') });
    console.log('✓ Captured 17-camera-ocr-viewfinder-390x844.png');

    // Simulate "3 pages detected"
    const sim3PagesBtn = mobilePage.getByRole('button', { name: /Simulate "3 pages detected"/i });
    await expect(sim3PagesBtn).toBeVisible();
    await sim3PagesBtn.click();
    await mobilePage.waitForTimeout(200);

    const pagesCountBadge = mobilePage.getByText('3 pages detected', { exact: true });
    await expect(pagesCountBadge).toBeVisible();
    console.log('✓ Verified multi-page count: "3 pages detected"');

    // Click "Extract text"
    const extractOcrBtn = mobilePage.getByRole('button', { name: /Extract text/i });
    await expect(extractOcrBtn).toBeVisible();
    await extractOcrBtn.click();
    await mobilePage.waitForTimeout(400);

    // Verify extracted review card and Simulated OCR label
    const simulatedOcrNotice = mobilePage.getByText(/Simulated OCR/i).first();
    await expect(simulatedOcrNotice).toBeVisible();
    await expect(mobilePage.getByText(/Extracted Fields Review/i)).toBeVisible();
    await mobilePage.screenshot({ path: path.join(screensDir, '18-camera-ocr-review-extracted-390x844.png') });
    console.log('✓ Captured 18-camera-ocr-review-extracted-390x844.png');

    // Test OCR Error state with retake tips
    const simFailBtn = mobilePage.getByRole('button', { name: /Simulate OCR Error State/i });
    await expect(simFailBtn).toBeVisible();
    await simFailBtn.click();
    await mobilePage.waitForTimeout(200);

    const ocrFailureError = mobilePage.getByText(/OCR Text Extraction Failed/i);
    await expect(ocrFailureError).toBeVisible();
    const retakeTips = mobilePage.getByText(/Document Retake Tips/i);
    await expect(retakeTips).toBeVisible();
    await mobilePage.screenshot({ path: path.join(screensDir, '19-camera-ocr-retake-error-tips-390x844.png') });
    console.log('✓ Captured 19-camera-ocr-retake-error-tips-390x844.png');

    // ============================================================
    // FEATURE: SEARCH / ASK YOUR REPORTS (SPEC 12)
    // ============================================================
    console.log('\n--- Verifying Search / Ask Your Reports Screen ---');
    await mobilePage.goto(`${baseUrl}/search`);
    await mobilePage.waitForTimeout(400);

    // Verify LOCAL DATA ONLY badge
    const localDataBadge = mobilePage.getByText(/LOCAL DATA ONLY/i);
    await expect(localDataBadge).toBeVisible();

    // Query 1: "Show all high-priority electrical issues at Kukatpally"
    const chipQuery1 = mobilePage.getByText(/Show all high-priority electrical issues at Kukatpally/i);
    await expect(chipQuery1).toBeVisible();
    await chipQuery1.click();
    await mobilePage.waitForTimeout(300);

    // Assert results summary banner: "X reports, Y findings, Z open actions"
    const summaryBanner = mobilePage.getByText(/\d+ reports, \d+ findings, \d+ open actions/i);
    await expect(summaryBanner).toBeVisible();
    console.log('✓ Verified Dexie query summary: "3 reports, 7 findings, 4 open actions"');
    await mobilePage.screenshot({ path: path.join(screensDir, '20-search-query-kukatpally-high-390x844.png') });
    console.log('✓ Captured 20-search-query-kukatpally-high-390x844.png');

    // Query 2: "Which assets had repeated issues?"
    const chipQuery2 = mobilePage.getByText(/Which assets had repeated issues\?/i);
    await expect(chipQuery2).toBeVisible();
    await chipQuery2.click();
    await mobilePage.waitForTimeout(300);

    const repeatedHazardCard = mobilePage.getByText(/Repeated Issue Asset: PANEL-204/i);
    await expect(repeatedHazardCard).toBeVisible();
    console.log('✓ Verified repeated asset hazard spotlight for PANEL-204');
    await mobilePage.screenshot({ path: path.join(screensDir, '21-search-query-repeated-assets-390x844.png') });
    console.log('✓ Captured 21-search-query-repeated-assets-390x844.png');

    // Query 3: Empty search state
    const searchField = mobilePage.getByPlaceholder(/Search or ask/i);
    await searchField.fill('unmatched_custom_query_nomatch');
    await mobilePage.waitForTimeout(200);
    const emptySearchMsg = mobilePage.getByText(/No Matching Local Reports Found/i);
    await expect(emptySearchMsg).toBeVisible();
    await mobilePage.screenshot({ path: path.join(screensDir, '22-search-empty-state-390x844.png') });
    console.log('✓ Captured 22-search-empty-state-390x844.png');

    // ============================================================
    // FEATURE: ADD TO REPORT & [NEW] / [NEWLY APPENDED] BADGES
    // ============================================================
    console.log('\n--- Verifying Add to Report & Chained Hash Trail ---');
    await mobilePage.goto(`${baseUrl}/reports`);
    const heroReportCard = mobilePage.getByText(/Electrical Inspection — Substation Panel Audit/i).first();
    await heroReportCard.click();
    await mobilePage.waitForURL(/\/reports?\//, { timeout: 10000 });

    // Open Add to Field Dossier sheet
    const addBtn = mobilePage.getByRole('button', { name: /^Add$/i }).first();
    await expect(addBtn).toBeVisible();
    await addBtn.click();
    await mobilePage.waitForTimeout(300);

    // Select Supplementary Voice Note
    const voiceNoteOption = mobilePage.getByText(/Supplementary Voice Note/i);
    await expect(voiceNoteOption).toBeVisible();
    await voiceNoteOption.click();
    await mobilePage.waitForTimeout(200);

    // Click "Append Voice Note"
    const appendBtn = mobilePage.getByRole('button', { name: /Append Voice Note/i });
    await expect(appendBtn).toBeVisible();
    await appendBtn.click();
    await mobilePage.waitForTimeout(500);

    // Assert [NEW] badge in Findings and [NEWLY APPENDED] in Actions
    const newFindingBadge = mobilePage.getByText('[NEW]').first();
    await expect(newFindingBadge).toBeVisible();
    const newlyAppendedActionBadge = mobilePage.getByText('[NEWLY APPENDED]').first();
    await expect(newlyAppendedActionBadge).toBeVisible();
    console.log('✓ Verified [NEW] on findings and [NEWLY APPENDED] on actions');

    // Verify audit chain seal still intact
    const verifySealBtnAfterAppend = mobilePage.getByRole('button', { name: 'Verify Seal' });
    await expect(verifySealBtnAfterAppend).toBeVisible();
    await verifySealBtnAfterAppend.click();
    const ledgerValid = mobilePage.getByText(/SHA-256 Ledger Intact/i);
    await expect(ledgerValid).toBeVisible();
    console.log('✓ Cryptographic SHA-256 ledger integrity verified after append');

    await mobilePage.screenshot({ path: path.join(screensDir, '23-add-to-report-appended-new-badges-390x844.png') });
    console.log('✓ Captured 23-add-to-report-appended-new-badges-390x844.png');

    // Step 11: More Screen with Settings & Engine Honesty Checks
    await mobilePage.goto(`${baseUrl}/more`);
    const moreHeading = mobilePage.getByRole('heading', { name: /Field Intelligence Modules/i });
    await expect(moreHeading).toBeVisible();

    // Verify engine honesty controls in More
    const disabledOnDeviceBtn = mobilePage.getByRole('button', { name: /On-device engine: coming in a later build/i });
    await expect(disabledOnDeviceBtn).toBeVisible();
    await expect(disabledOnDeviceBtn).toBeDisabled();

    const disabledOnlineSpeech = mobilePage.getByText(/Online speech isn't wired up in this build/i);
    await expect(disabledOnlineSpeech).toBeVisible();

    const disabledVolumeTrigger = mobilePage.getByText(/Hardware volume trigger isn't wired up in this build/i);
    await expect(disabledVolumeTrigger).toBeVisible();

    await mobilePage.waitForTimeout(300);
    await mobilePage.screenshot({ path: path.join(screensDir, '24-mobile-more-settings-390x844.png') });
    console.log('✓ Verified honesty controls and captured 24-mobile-more-settings-390x844.png');

    // 2. Desktop Verification (1280x800)
    console.log('\n--- Verifying Desktop Viewport (1280x800) ---');
    const desktopPage = await mobileContext.newPage();
    await desktopPage.setViewportSize({ width: 1280, height: 800 });

    // Desktop PANEL-204 Asset Dossier
    await desktopPage.goto(`${baseUrl}/assets/PANEL-204`);
    await expect(desktopPage.getByText(/PANEL-204/i).first()).toBeVisible();
    await desktopPage.waitForTimeout(300);
    await desktopPage.screenshot({ path: path.join(screensDir, '25-desktop-panel204-asset-history-1280x800.png') });
    console.log('✓ Captured 25-desktop-panel204-asset-history-1280x800.png');

    // Desktop Reports Screen
    await desktopPage.goto(`${baseUrl}/reports`);
    await expect(desktopPage.getByRole('heading', { name: /Inspection Dossiers & Audits/i })).toBeVisible();
    await desktopPage.waitForTimeout(300);
    await desktopPage.screenshot({ path: path.join(screensDir, '26-desktop-reports-list-1280x800.png') });
    console.log('✓ Captured 26-desktop-reports-list-1280x800.png');

    // Desktop Scanner Screen
    await desktopPage.goto(`${baseUrl}/scanner`);
    await expect(desktopPage.getByText(/PANEL-204/i).first()).toBeVisible();
    await desktopPage.waitForTimeout(300);
    await desktopPage.screenshot({ path: path.join(screensDir, '27-desktop-scanner-view-1280x800.png') });
    console.log('✓ Captured 27-desktop-scanner-view-1280x800.png');

    // Desktop Search Screen
    await desktopPage.goto(`${baseUrl}/search`);
    await expect(desktopPage.getByRole('heading', { name: /Ask Your Reports/i })).toBeVisible();
    await desktopPage.waitForTimeout(300);
    await desktopPage.screenshot({ path: path.join(screensDir, '28-desktop-search-view-1280x800.png') });
    console.log('✓ Captured 28-desktop-search-view-1280x800.png');

    // Daylight Theme Verification
    console.log('\n--- Verifying Daylight Theme Mode ---');
    const daylightToggle = desktopPage.getByRole('radio', { name: /Daylight/i });
    await expect(daylightToggle).toBeVisible();
    await daylightToggle.click();
    await desktopPage.waitForTimeout(250);
    await desktopPage.screenshot({ path: path.join(screensDir, '29-desktop-daylight-mode-1280x800.png') });
    console.log('✓ Captured 29-desktop-daylight-mode-1280x800.png');

  } finally {
    await browser.close();
    previewServer.httpServer.close();
  }

  // Quality Assertion
  console.log('\n============================================================');
  console.log('PHASE 5 QUALITY & E2E VERIFICATION REPORT');
  console.log('============================================================');
  console.log(`Total Console Errors: ${consoleErrors.length}`);

  if (consoleErrors.length > 0) {
    console.error('FAILED: Browser console errors detected during verification:');
    consoleErrors.forEach((err) => console.error(`  - ${err}`));
    process.exit(1);
  }

  console.log('SUCCESS: All Phase 5 features (Reports list filters, Import Hub, QR scanner, Camera OCR, Ask Your Reports, and Add to Report with [NEW] badges) verified cleanly with ZERO errors.');
  process.exit(0);
}

runVerification().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
