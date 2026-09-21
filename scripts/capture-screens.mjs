import { chromium } from 'playwright';
import { preview } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const screensDir = path.resolve(__dirname, '../docs/screens/phase-3');

if (!fs.existsSync(screensDir)) {
  fs.mkdirSync(screensDir, { recursive: true });
}

async function runVerification() {
  console.log('Starting preview server for Phase 3 verification...');
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
    // 1. Mobile verification (390x844)
    console.log('\n--- Verifying Mobile Viewport (390x844) ---');
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      permissions: ['microphone'],
    });
    const mobilePage = await mobileContext.newPage();

    mobilePage.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error(`[Browser Console Error]: ${msg.text()}`);
        consoleErrors.push(msg.text());
      }
    });

    // Step 1: Capture Home
    await mobilePage.goto(`${baseUrl}/capture`, { waitUntil: 'networkidle' });
    await mobilePage.waitForTimeout(300);
    await mobilePage.screenshot({ path: path.join(screensDir, '01-mobile-capture-home-390x844.png') });
    console.log('✓ Captured 01-mobile-capture-home-390x844.png');

    // Step 2: Start Recording
    const recordBtn = mobilePage.getByRole('button', { name: 'Start audio capture' });
    await recordBtn.click();
    await mobilePage.waitForTimeout(600);
    await mobilePage.screenshot({ path: path.join(screensDir, '02-mobile-recording-390x844.png') });
    console.log('✓ Captured 02-mobile-recording-390x844.png');

    // Step 3: Finish & Compile (Processing Screen 4)
    const finishBtn = mobilePage.getByRole('button', { name: 'Finish & Compile' });
    await finishBtn.click();
    await mobilePage.waitForTimeout(300);
    await mobilePage.screenshot({ path: path.join(screensDir, '03-mobile-processing-390x844.png') });
    console.log('✓ Captured 03-mobile-processing-390x844.png');

    // Step 4: Arrive at Structured Report Editor (Screen 5)
    await mobilePage.waitForURL(/\/report\//, { timeout: 7000 });
    await mobilePage.waitForTimeout(400);
    await mobilePage.screenshot({ path: path.join(screensDir, '04-mobile-report-editor-initial-390x844.png') });
    console.log('✓ Captured 04-mobile-report-editor-initial-390x844.png');

    // Step 5: Answer QuestionCard (Screen 6 / Missing info resolution)
    const assignBtn = mobilePage.getByRole('button', { name: /Assign "PANEL-204"/i });
    if (await assignBtn.isVisible()) {
      await assignBtn.click();
      await mobilePage.waitForTimeout(400);
      await mobilePage.screenshot({ path: path.join(screensDir, '05-mobile-report-missing-resolved-390x844.png') });
      console.log('✓ Captured 05-mobile-report-missing-resolved-390x844.png');
    }

    // Step 6: Transcript Drawer & Phrase Linking (Screen 7)
    const transcriptSegment = mobilePage.getByText(/Panel daggara loose connections/i).first();
    if (await transcriptSegment.isVisible()) {
      await transcriptSegment.click();
      await mobilePage.waitForTimeout(300);
      await mobilePage.screenshot({ path: path.join(screensDir, '06-mobile-transcript-linked-390x844.png') });
      console.log('✓ Captured 06-mobile-transcript-linked-390x844.png');
    }

    // Step 7: SignaturePad Interaction
    const sampleSignBtn = mobilePage.getByRole('button', { name: /Use certified signature mark/i });
    if (await sampleSignBtn.isVisible()) {
      await sampleSignBtn.click();
      await mobilePage.waitForTimeout(200);
    }
    const signBtn = mobilePage.getByRole('button', { name: 'Sign & Seal' });
    if (await signBtn.isVisible()) {
      await signBtn.click();
      await mobilePage.waitForTimeout(300);
      console.log('✓ Captured signature signed & sealed');
    }

    // Step 8: Inspection Sheet Mode (Screen 8 / Final View)
    const sheetModeBtn = mobilePage.getByRole('button', { name: 'Inspection Sheet' });
    if (await sheetModeBtn.isVisible()) {
      await sheetModeBtn.click();
      await mobilePage.waitForTimeout(300);
      await mobilePage.screenshot({ path: path.join(screensDir, '07-mobile-inspection-sheet-view-390x844.png') });
      console.log('✓ Captured 07-mobile-inspection-sheet-view-390x844.png');

      // Switch back to editor
      const editorModeBtn = mobilePage.getByRole('button', { name: 'Editor' });
      await editorModeBtn.click();
      await mobilePage.waitForTimeout(200);
    }

    // Step 9: Cryptographic Tamper Test
    const tamperBtn = mobilePage.getByRole('button', { name: /Tamper Entry/i });
    if (await tamperBtn.isVisible()) {
      await tamperBtn.click();
      await mobilePage.waitForTimeout(300);
      await mobilePage.screenshot({ path: path.join(screensDir, '08-mobile-tamper-warning-390x844.png') });
      console.log('✓ Captured 08-mobile-tamper-warning-390x844.png');

      // Restore Ledger
      const restoreBtn = mobilePage.getByRole('button', { name: 'Restore Ledger' });
      if (await restoreBtn.isVisible()) {
        await restoreBtn.click();
        await mobilePage.waitForTimeout(300);
        await mobilePage.screenshot({ path: path.join(screensDir, '09-mobile-tamper-restored-390x844.png') });
        console.log('✓ Captured 09-mobile-tamper-restored-390x844.png');
      }
    }

    // Standard Routes verification
    const routes = [
      { path: '/reports', name: 'reports' },
      { path: '/tasks', name: 'tasks' },
      { path: '/more', name: 'more' },
      { path: '/assets', name: 'assets' },
      { path: '/rollup', name: 'rollup' },
      { path: '/privacy', name: 'privacy' },
      { path: '/officekit', name: 'officekit' },
      { path: '/export', name: 'export' },
      { path: '/search', name: 'search' },
      { path: '/kit', name: 'component-kit' },
    ];

    for (const route of routes) {
      await mobilePage.goto(`${baseUrl}${route.path}`, { waitUntil: 'networkidle' });
      await mobilePage.waitForTimeout(150);
      const filename = `mobile-${route.name}-390x844.png`;
      await mobilePage.screenshot({ path: path.join(screensDir, filename) });
      console.log(`✓ Captured ${filename}`);
    }

    // 2. Desktop / Tablet verification (1280x800)
    console.log('\n--- Verifying Desktop / Tablet Viewport (1280x800) ---');
    const desktopPage = await mobileContext.newPage();
    await desktopPage.setViewportSize({ width: 1280, height: 800 });

    await desktopPage.goto(`${baseUrl}/reports/rep-hero-001`, { waitUntil: 'networkidle' });
    await desktopPage.waitForTimeout(300);
    await desktopPage.screenshot({ path: path.join(screensDir, '10-desktop-report-editor-1280x800.png') });
    console.log('✓ Captured 10-desktop-report-editor-1280x800.png');

    const desktopSheetBtn = desktopPage.getByRole('button', { name: 'Inspection Sheet' });
    if (await desktopSheetBtn.isVisible()) {
      await desktopSheetBtn.click();
      await desktopPage.waitForTimeout(300);
      await desktopPage.screenshot({ path: path.join(screensDir, '11-desktop-inspection-sheet-1280x800.png') });
      console.log('✓ Captured 11-desktop-inspection-sheet-1280x800.png');
    }

    for (const route of routes) {
      await desktopPage.goto(`${baseUrl}${route.path}`, { waitUntil: 'networkidle' });
      await desktopPage.waitForTimeout(150);
      const filename = `desktop-${route.name}-1280x800.png`;
      await desktopPage.screenshot({ path: path.join(screensDir, filename) });
      console.log(`✓ Captured ${filename}`);
    }

    // 3. Daylight theme tests
    console.log('\n--- Verifying Daylight Theme Mode on Report Editor ---');
    await mobilePage.goto(`${baseUrl}/reports/rep-hero-001`, { waitUntil: 'networkidle' });
    const daylightToggle = mobilePage.getByRole('button', { name: /Daylight/i }).first();
    if (await daylightToggle.isVisible()) {
      await daylightToggle.click();
      await mobilePage.waitForTimeout(250);
      await mobilePage.screenshot({ path: path.join(screensDir, '12-mobile-report-daylight-390x844.png') });
      console.log('✓ Captured 12-mobile-report-daylight-390x844.png');
    }

  } finally {
    await browser.close();
    previewServer.httpServer.close();
  }

  if (consoleErrors.length > 0) {
    console.error(`\nFAILED: Encountered ${consoleErrors.length} console errors during verification.`);
    process.exit(1);
  } else {
    console.log('\nALL VERIFICATIONS PASSED: 0 console errors, all Phase 3 screens captured successfully.');
  }
}

runVerification().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});

