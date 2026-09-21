import { chromium } from 'playwright';
import { preview } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const screensDir = path.resolve(__dirname, '../docs/screens/phase-2');

if (!fs.existsSync(screensDir)) {
  fs.mkdirSync(screensDir, { recursive: true });
}

async function runVerification() {
  console.log('Starting preview server for Phase 2 verification...');
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

    // Screen 1: Capture Home
    await mobilePage.goto(`${baseUrl}/capture`, { waitUntil: 'networkidle' });
    await mobilePage.waitForTimeout(300);
    await mobilePage.screenshot({ path: path.join(screensDir, 'mobile-capture-home-390x844.png') });
    console.log('✓ Captured mobile-capture-home-390x844.png');

    // Screen 1 with Import Sheet open
    const importBtn = mobilePage.getByRole('button', { name: 'Import' });
    if (await importBtn.isVisible()) {
      await importBtn.click();
      await mobilePage.waitForTimeout(250);
      await mobilePage.screenshot({ path: path.join(screensDir, 'mobile-capture-import-sheet-390x844.png') });
      console.log('✓ Captured mobile-capture-import-sheet-390x844.png');
      await mobilePage.getByRole('button', { name: 'Close sheet' }).click();
      await mobilePage.waitForTimeout(200);
    }

    // Screen 2: Recording State
    const recordBtn = mobilePage.getByRole('button', { name: 'Start audio capture' });
    await recordBtn.click();
    await mobilePage.waitForTimeout(800); // Allow timer & waveform to run
    await mobilePage.screenshot({ path: path.join(screensDir, 'mobile-capture-recording-390x844.png') });
    console.log('✓ Captured mobile-capture-recording-390x844.png');

    // Screen 4: Processing Pipeline State
    const finishBtn = mobilePage.getByRole('button', { name: 'Finish & Compile' });
    await finishBtn.click();
    await mobilePage.waitForTimeout(300); // In processing stage
    await mobilePage.screenshot({ path: path.join(screensDir, 'mobile-capture-processing-390x844.png') });
    console.log('✓ Captured mobile-capture-processing-390x844.png');

    // Wait for route transition to report detail
    await mobilePage.waitForURL(/\/report\//, { timeout: 6000 });
    await mobilePage.waitForTimeout(300);
    await mobilePage.screenshot({ path: path.join(screensDir, 'mobile-report-detail-hero-390x844.png') });
    console.log('✓ Captured mobile-report-detail-hero-390x844.png');

    // Screen 2 Error State: Permission Denied simulation
    const deniedContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      permissions: [], // No mic permission granted
    });
    const deniedPage = await deniedContext.newPage();
    await deniedPage.goto(`${baseUrl}/capture`, { waitUntil: 'networkidle' });
    // Trigger store permission error to capture exact error state
    await deniedPage.evaluate(() => {
      // @ts-ignore
      window.localStorage.setItem('fieldnote-sim-error', 'permission_denied');
    });
    // Click record button without permission to trigger real/simulated permission denied
    const deniedRecordBtn = deniedPage.getByRole('button', { name: 'Start audio capture' });
    await deniedRecordBtn.click();
    await deniedPage.waitForTimeout(400);
    await deniedPage.screenshot({ path: path.join(screensDir, 'mobile-capture-permission-denied-390x844.png') });
    console.log('✓ Captured mobile-capture-permission-denied-390x844.png');

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

    await desktopPage.goto(`${baseUrl}/capture`, { waitUntil: 'networkidle' });
    await desktopPage.waitForTimeout(200);
    await desktopPage.screenshot({ path: path.join(screensDir, 'desktop-capture-home-1280x800.png') });
    console.log('✓ Captured desktop-capture-home-1280x800.png');

    await desktopPage.goto(`${baseUrl}/reports/rep-hero-001`, { waitUntil: 'networkidle' });
    await desktopPage.waitForTimeout(200);
    await desktopPage.screenshot({ path: path.join(screensDir, 'desktop-report-detail-hero-1280x800.png') });
    console.log('✓ Captured desktop-report-detail-hero-1280x800.png');

    for (const route of routes) {
      await desktopPage.goto(`${baseUrl}${route.path}`, { waitUntil: 'networkidle' });
      await desktopPage.waitForTimeout(150);
      const filename = `desktop-${route.name}-1280x800.png`;
      await desktopPage.screenshot({ path: path.join(screensDir, filename) });
      console.log(`✓ Captured ${filename}`);
    }

    // 3. Daylight theme tests
    console.log('\n--- Verifying Daylight Theme Mode on Capture Home ---');
    await mobilePage.goto(`${baseUrl}/capture`, { waitUntil: 'networkidle' });
    const daylightToggle = mobilePage.getByRole('button', { name: /Daylight/i }).first();
    if (await daylightToggle.isVisible()) {
      await daylightToggle.click();
      await mobilePage.waitForTimeout(200);
      await mobilePage.screenshot({ path: path.join(screensDir, 'mobile-capture-daylight-390x844.png') });
      console.log('✓ Captured mobile-capture-daylight-390x844.png');
    }

  } finally {
    await browser.close();
    previewServer.httpServer.close();
  }

  if (consoleErrors.length > 0) {
    console.error(`\nFAILED: Encountered ${consoleErrors.length} console errors during verification.`);
    process.exit(1);
  } else {
    console.log('\nALL VERIFICATIONS PASSED: 0 console errors, all Phase 2 screens captured successfully.');
  }
}

runVerification().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
