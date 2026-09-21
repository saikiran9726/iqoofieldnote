import { chromium } from 'playwright';
import { expect } from '@playwright/test';
import { preview } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const screensDir = path.resolve(__dirname, '../docs/screens/phase-4-fix');

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

    // Step 10: Reports List with Search and Filter Chips
    await mobilePage.goto(`${baseUrl}/reports`);
    const reportsHeading = mobilePage.getByRole('heading', { name: /Inspection Dossiers & Audits/i });
    await expect(reportsHeading).toBeVisible();
    await mobilePage.waitForTimeout(300);
    await mobilePage.screenshot({ path: path.join(screensDir, '10-mobile-reports-list-390x844.png') });
    console.log('✓ Captured 10-mobile-reports-list-390x844.png');

    // Filter by HIGH PRIORITY
    const highFilterBtn = mobilePage.getByRole('button', { name: /HIGH PRIORITY/i });
    await expect(highFilterBtn).toBeVisible();
    await highFilterBtn.click();
    await mobilePage.waitForTimeout(300);
    await mobilePage.screenshot({ path: path.join(screensDir, '11-mobile-reports-filtered-high-390x844.png') });
    console.log('✓ Captured 11-mobile-reports-filtered-high-390x844.png');

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
    await mobilePage.screenshot({ path: path.join(screensDir, '12-mobile-more-settings-390x844.png') });
    console.log('✓ Verified honesty controls and captured 12-mobile-more-settings-390x844.png');

    // 2. Desktop Verification (1280x800)
    console.log('\n--- Verifying Desktop Viewport (1280x800) ---');
    const desktopPage = await mobileContext.newPage();
    await desktopPage.setViewportSize({ width: 1280, height: 800 });

    // Desktop PANEL-204 Asset Dossier
    await desktopPage.goto(`${baseUrl}/assets/PANEL-204`);
    await expect(desktopPage.getByText(/PANEL-204/i).first()).toBeVisible();
    await desktopPage.waitForTimeout(300);
    await desktopPage.screenshot({ path: path.join(screensDir, '13-desktop-panel204-asset-history-1280x800.png') });
    console.log('✓ Captured 13-desktop-panel204-asset-history-1280x800.png');

    // Desktop Tasks Screen
    await desktopPage.goto(`${baseUrl}/tasks`);
    await expect(desktopPage.getByRole('heading', { name: /Action Items & Punch Lists/i })).toBeVisible();
    await desktopPage.waitForTimeout(300);
    await desktopPage.screenshot({ path: path.join(screensDir, '14-desktop-tasks-screen-1280x800.png') });
    console.log('✓ Captured 14-desktop-tasks-screen-1280x800.png');

    // Desktop Reports Screen
    await desktopPage.goto(`${baseUrl}/reports`);
    await expect(desktopPage.getByRole('heading', { name: /Inspection Dossiers & Audits/i })).toBeVisible();
    await desktopPage.waitForTimeout(300);
    await desktopPage.screenshot({ path: path.join(screensDir, '15-desktop-reports-list-1280x800.png') });
    console.log('✓ Captured 15-desktop-reports-list-1280x800.png');

    // 3. Daylight Theme Verification
    console.log('\n--- Verifying Daylight Theme Mode on Asset History ---');
    const daylightToggle = desktopPage.getByRole('radio', { name: /Daylight/i });
    await expect(daylightToggle).toBeVisible();
    await daylightToggle.click();
    await desktopPage.waitForTimeout(250);
    await desktopPage.screenshot({ path: path.join(screensDir, '16-desktop-panel204-daylight-1280x800.png') });
    console.log('✓ Captured 16-desktop-panel204-daylight-1280x800.png');

  } finally {
    await browser.close();
    previewServer.httpServer.close();
  }

  // Quality Assertion
  console.log('\n============================================================');
  console.log('PHASE 4.5 QUALITY & E2E VERIFICATION REPORT');
  console.log('============================================================');
  console.log(`Total Console Errors: ${consoleErrors.length}`);

  if (consoleErrors.length > 0) {
    console.error('FAILED: Browser console errors detected during verification:');
    consoleErrors.forEach((err) => console.error(`  - ${err}`));
    process.exit(1);
  }

  console.log('SUCCESS: All 9 demo steps, offline PDF export, tasks list, and asset history verified cleanly with Playwright expect assertions and ZERO errors.');
  process.exit(0);
}

runVerification().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
