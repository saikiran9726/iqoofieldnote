import { chromium } from 'playwright';
import { preview } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const screensDir = path.resolve(__dirname, '../docs/screens/phase-0');

if (!fs.existsSync(screensDir)) {
  fs.mkdirSync(screensDir, { recursive: true });
}

async function runVerification() {
  console.log('Starting preview server for verification...');
  const previewServer = await preview({
    preview: {
      port: 4173,
      host: '127.0.0.1',
    },
  });

  const baseUrl = 'http://127.0.0.1:4173';
  console.log(`Preview server running at ${baseUrl}`);

  const browser = await chromium.launch({ headless: true });
  const consoleErrors = [];

  const routes = [
    { path: '/capture', name: 'capture' },
    { path: '/reports', name: 'reports' },
    { path: '/tasks', name: 'tasks' },
    { path: '/more', name: 'more' },
    { path: '/assets', name: 'assets' },
    { path: '/rollup', name: 'rollup' },
    { path: '/privacy', name: 'privacy' },
    { path: '/officekit', name: 'officekit' },
    { path: '/export', name: 'export' },
    { path: '/search', name: 'search' },
  ];

  try {
    // 1. Mobile verification (390x844)
    console.log('\n--- Verifying Mobile Viewport (390x844) ---');
    const mobilePage = await browser.newPage({
      viewport: { width: 390, height: 844 },
    });

    mobilePage.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error(`[Browser Console Error]: ${msg.text()}`);
        consoleErrors.push(msg.text());
      }
    });

    for (const route of routes) {
      await mobilePage.goto(`${baseUrl}${route.path}`, { waitUntil: 'networkidle' });
      await mobilePage.waitForTimeout(150);
      const filename = `mobile-${route.name}-390x844.png`;
      await mobilePage.screenshot({ path: path.join(screensDir, filename) });
      console.log(`✓ Captured ${filename}`);
    }

    // 2. Desktop / Tablet verification (1280x800)
    console.log('\n--- Verifying Desktop / Tablet Viewport (1280x800) ---');
    const desktopPage = await browser.newPage({
      viewport: { width: 1280, height: 800 },
    });

    desktopPage.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error(`[Browser Console Error]: ${msg.text()}`);
        consoleErrors.push(msg.text());
      }
    });

    for (const route of routes) {
      await desktopPage.goto(`${baseUrl}${route.path}`, { waitUntil: 'networkidle' });
      await desktopPage.waitForTimeout(150);
      const filename = `desktop-${route.name}-1280x800.png`;
      await desktopPage.screenshot({ path: path.join(screensDir, filename) });
      console.log(`✓ Captured ${filename}`);
    }

    // 3. Daylight theme test
    console.log('\n--- Verifying Daylight Theme Mode ---');
    await mobilePage.goto(`${baseUrl}/capture`, { waitUntil: 'networkidle' });
    const daylightButton = await mobilePage.getByRole('radio', { name: /Daylight/i });
    if (await daylightButton.isVisible()) {
      await daylightButton.click();
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
    console.log('\nALL VERIFICATIONS PASSED: 0 console errors, all screens captured successfully.');
  }
}

runVerification().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
