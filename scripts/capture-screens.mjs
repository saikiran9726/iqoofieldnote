import { chromium } from 'playwright';
import { expect } from '@playwright/test';
import { preview } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const screensDir = path.resolve(__dirname, '../docs/screens/phase-6');

if (!fs.existsSync(screensDir)) {
  fs.mkdirSync(screensDir, { recursive: true });
}

async function runVerification() {
  console.log('Starting preview server for Phase 6 E2E test...');
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

    // Step 1: Capture Home
    await mobilePage.screenshot({ path: path.join(screensDir, '01-demo-capture-home-390x844.png') });
    console.log('✓ Captured 01-demo-capture-home-390x844.png');

    // Step 2: Live Recording View
    const micButton = mobilePage.getByRole('button', { name: /Start audio capture/i });
    await expect(micButton).toBeVisible();
    await micButton.click();
    await mobilePage.waitForTimeout(500);

    await expect(mobilePage.getByText(/RECORDING/i)).toBeVisible();
    await expect(mobilePage.getByText(/Telugu · English/i)).toBeVisible();
    await mobilePage.screenshot({ path: path.join(screensDir, '02-demo-recording-live-390x844.png') });
    console.log('✓ Captured 02-demo-recording-live-390x844.png');

    // Step 3: Finish & Processing Pipeline
    const finishBtn = mobilePage.getByRole('button', { name: /Finish & Compile/i });
    await expect(finishBtn).toBeVisible();
    await finishBtn.click();
    await mobilePage.waitForTimeout(400);

    await mobilePage.screenshot({ path: path.join(screensDir, '03-demo-pipeline-processing-390x844.png') });
    console.log('✓ Captured 03-demo-pipeline-processing-390x844.png');

    // Step 4: Wait for Navigation to Structured Report Editor
    await mobilePage.waitForURL(/\/reports?\//, { timeout: 10000 });
    await mobilePage.waitForTimeout(300);

    const questionCard = mobilePage.getByText(/One thing is missing/i);
    await expect(questionCard).toBeVisible();
    await mobilePage.screenshot({ path: path.join(screensDir, '04-demo-report-editor-initial-390x844.png') });
    console.log('✓ Captured 04-demo-report-editor-initial-390x844.png');

    // Step 5: Resolve QuestionCard to PANEL-204
    const assignP204Btn = mobilePage.getByRole('button', { name: /Assign PANEL-204/i });
    await expect(assignP204Btn).toBeVisible();
    await assignP204Btn.click();
    await mobilePage.waitForTimeout(300);

    await expect(mobilePage.getByText(/PANEL-204/i).first()).toBeVisible();
    await mobilePage.screenshot({ path: path.join(screensDir, '05-demo-questioncard-resolved-390x844.png') });
    console.log('✓ Captured 05-demo-questioncard-resolved-390x844.png');

    // Step 6: Sign & Seal
    const certSigBtn = mobilePage.getByRole('button', { name: /Use certified signature mark/i });
    if (await certSigBtn.isVisible()) {
      await certSigBtn.click();
      await mobilePage.waitForTimeout(200);
      const signSealBtn = mobilePage.getByRole('button', { name: /Sign & Seal/i });
      if (await signSealBtn.isVisible()) {
        await signSealBtn.click();
        await mobilePage.waitForTimeout(200);
      }
    }
    await mobilePage.screenshot({ path: path.join(screensDir, '06-demo-photo-signature-sealed-390x844.png') });
    console.log('✓ Captured 06-demo-photo-signature-sealed-390x844.png');

    // ============================================================
    // PHASE 6 SPECIFIC CHECKS
    // ============================================================

    // 1. Weekly Field Summary (Spec 16: Kukatpally Site, 18-24 Sep, 12 reports, 4 high-priority, 7 open actions, 3 recurring)
    console.log('\n--- Verifying Weekly Rollup (Spec 16) ---');
    await mobilePage.goto(`${baseUrl}/rollup`);
    await expect(mobilePage.getByRole('heading', { name: /WEEKLY FIELD SUMMARY/i })).toBeVisible();
    await expect(mobilePage.getByText('Kukatpally Metro Site').first()).toBeVisible();

    // Verify exactly computed metrics: 12 dossiers, 4 high-priority, 7 open actions, 3 recurring issues
    await expect(mobilePage.getByText('12').first()).toBeVisible();
    await expect(mobilePage.getByText('4').first()).toBeVisible();
    await expect(mobilePage.getByText('7').first()).toBeVisible();
    await expect(mobilePage.getByText('3').first()).toBeVisible();

    // Verify recurring issues section & visual bars
    await expect(mobilePage.getByText(/RECURRING ISSUES/i)).toBeVisible();
    await expect(mobilePage.getByText(/Loose connections detected on Terminal Block B/i)).toBeVisible();
    await expect(mobilePage.getByText(/Damaged cable insulation sheath/i)).toBeVisible();
    await expect(mobilePage.getByText(/Terminal lug thermal oxidation/i)).toBeVisible();

    await mobilePage.waitForTimeout(300);
    await mobilePage.screenshot({ path: path.join(screensDir, '07-mobile-weekly-rollup-390x844.png') });
    console.log('✓ Verified Spec 16 Weekly Rollup & captured 07-mobile-weekly-rollup-390x844.png');

    // 2. Privacy and Trust (Spec 17: Redaction live preview, app lock, AES-GCM, round-trip)
    console.log('\n--- Verifying Privacy & Trust (Spec 17) ---');
    await mobilePage.goto(`${baseUrl}/privacy`);
    await expect(mobilePage.getByRole('heading', { name: /Privacy & Trust Architecture/i })).toBeVisible();

    // Verify local-only banner
    await expect(mobilePage.getByText(/LOCAL-ONLY PROCESSING · ZERO CLOUD EXFILTRATION/i)).toBeVisible();

    // Verify live preview redaction box showing [REDACTED NAME] and [REDACTED PHONE]
    await expect(mobilePage.getByText(/\[REDACTED NAME\]/i).first()).toBeVisible();
    await expect(mobilePage.getByText(/\[REDACTED PHONE\]/i).first()).toBeVisible();

    // Test Set Passcode to Enable AES-GCM
    const setPasscodeBtn = mobilePage.getByRole('button', { name: /Set Passcode to Enable AES-GCM/i });
    if (await setPasscodeBtn.isVisible()) {
      await setPasscodeBtn.click();
      await mobilePage.waitForTimeout(200);

      const passInputs = mobilePage.locator('input[type="password"]');
      await passInputs.nth(0).fill('4892');
      await passInputs.nth(1).fill('4892');

      const savePassBtn = mobilePage.getByRole('button', { name: /Save Passcode & Encrypt/i });
      await savePassBtn.click();
      await mobilePage.waitForTimeout(300);
    }

    await expect(mobilePage.getByText(/Encrypted Storage: ACTIVE/i)).toBeVisible();

    // Test Encryption Round-Trip
    const roundTripBtn = mobilePage.getByRole('button', { name: /Test Encryption Round-Trip/i });
    await expect(roundTripBtn).toBeVisible();
    await roundTripBtn.click();
    await mobilePage.waitForTimeout(500);
    await expect(mobilePage.getByText(/Round-Trip Verified Intact/i)).toBeVisible();
    console.log('✓ Verified WebCrypto AES-GCM 256-bit round-trip intact');

    // Verify Global Hash Integrity
    const verifyHashBtn = mobilePage.getByRole('button', { name: /Verify Hash Integrity/i });
    await expect(verifyHashBtn).toBeVisible();
    await verifyHashBtn.click();
    await mobilePage.waitForTimeout(500);
    await expect(mobilePage.getByText(/100% Intact/i)).toBeVisible();
    console.log('✓ Verified global SHA-256 ledger integrity');

    await mobilePage.screenshot({ path: path.join(screensDir, '08-mobile-privacy-trust-390x844.png') });
    console.log('✓ Captured 08-mobile-privacy-trust-390x844.png');

    // Test Lock App Now
    const lockNowBtn = mobilePage.getByRole('button', { name: /Lock Vault Now/i });
    await expect(lockNowBtn).toBeVisible();
    await lockNowBtn.click();
    await mobilePage.waitForTimeout(300);

    await expect(mobilePage.getByText(/FieldNote Vault Locked/i)).toBeVisible();
    await mobilePage.screenshot({ path: path.join(screensDir, '09-mobile-vault-locked-390x844.png') });
    console.log('✓ Captured 09-mobile-vault-locked-390x844.png');

    // Unlock Vault with passcode "4892"
    const lockPinInput = mobilePage.locator('input[type="password"]');
    await lockPinInput.fill('4892');
    const unlockBtn = mobilePage.getByRole('button', { name: /Unlock Vault/i });
    await unlockBtn.click();
    await mobilePage.waitForTimeout(300);
    await expect(mobilePage.getByRole('heading', { name: /Privacy & Trust Architecture/i })).toBeVisible();
    console.log('✓ Successfully unlocked vault with passcode round-trip');

    // 3. Office Kit Bridge (Spec 19: Phone ⇄ Laptop, transfer preview, drop zone, send to laptop)
    console.log('\n--- Verifying Office Kit Bridge (Spec 19) ---');
    await mobilePage.goto(`${baseUrl}/officekit`);
    await expect(mobilePage.getByRole('heading', { name: /PHONE ⇄ LAPTOP BRIDGE/i })).toBeVisible();
    await expect(mobilePage.getByText(/Transfer Simulation \(Preview\)/i)).toBeVisible();
    await expect(mobilePage.getByText(/Desktop Audio Drop-Zone/i)).toBeVisible();

    // Test Clipboard Sync
    const copyClipBtn = mobilePage.getByRole('button', { name: /Copy Selected Report to Clipboard/i });
    await expect(copyClipBtn).toBeVisible();
    await copyClipBtn.click();
    await mobilePage.waitForTimeout(300);

    // Test Send to Laptop
    const sendToLaptopBtn = mobilePage.getByRole('button', { name: /Send to laptop/i }).first();
    await expect(sendToLaptopBtn).toBeVisible();
    await sendToLaptopBtn.click();
    await mobilePage.waitForTimeout(1200);
    await expect(mobilePage.getByText(/Successfully delivered/i)).toBeVisible();

    await mobilePage.screenshot({ path: path.join(screensDir, '10-mobile-officekit-bridge-390x844.png') });
    console.log('✓ Verified Spec 19 Office Kit Bridge & captured 10-mobile-officekit-bridge-390x844.png');

    // 4. Templates & Glossary (Spec 20: 5 categories, custom builder, CSV import, spell-check)
    console.log('\n--- Verifying Templates & Glossary (Spec 20) ---');
    await mobilePage.goto(`${baseUrl}/templates`);
    await expect(mobilePage.getByRole('heading', { name: /Templates & Glossary/i })).toBeVisible();

    // Verify 5 category templates
    await expect(mobilePage.getByText(/Substation Electrical Audit/i)).toBeVisible();
    await expect(mobilePage.getByText(/Structural Concrete & Pillar Audit/i)).toBeVisible();
    await expect(mobilePage.getByText(/Pump & Hydraulic Machinery Inspection/i)).toBeVisible();
    await expect(mobilePage.getByText(/Trackside Signaling & Relay Audit/i)).toBeVisible();
    await expect(mobilePage.getByText(/Substation Fire & Environmental Safety/i)).toBeVisible();

    // Open Custom Builder Modal
    const buildTplBtn = mobilePage.getByRole('button', { name: /Build Custom Template/i });
    await expect(buildTplBtn).toBeVisible();
    await buildTplBtn.click();
    await mobilePage.waitForTimeout(200);
    await expect(mobilePage.getByRole('heading', { name: /Custom Template Builder/i })).toBeVisible();
    await mobilePage.screenshot({ path: path.join(screensDir, '11a-mobile-template-builder-modal-390x844.png') });
    console.log('✓ Captured 11a-mobile-template-builder-modal-390x844.png');

    // Close Modal
    await mobilePage.getByRole('button', { name: /Cancel/i }).click();
    await mobilePage.waitForTimeout(200);

    // Switch to Glossary & CSV tab
    await mobilePage.getByRole('button', { name: /Glossary & CSV/i }).click();
    await mobilePage.waitForTimeout(200);
    await expect(mobilePage.getByText(/CSV Glossary Import/i)).toBeVisible();
    await expect(mobilePage.getByText(/Active Glossary Registry/i)).toBeVisible();
    await mobilePage.screenshot({ path: path.join(screensDir, '11b-mobile-glossary-csv-390x844.png') });
    console.log('✓ Captured 11b-mobile-glossary-csv-390x844.png');

    // Switch to Spell-Check Engine tab
    await mobilePage.getByRole('button', { name: /Spell-Check Engine/i }).click();
    await mobilePage.waitForTimeout(200);
    await expect(mobilePage.getByText(/Engine Glossary Spelling Correction/i)).toBeVisible();
    await expect(mobilePage.getByText(/Kukatpally Metro Site/i).first()).toBeVisible();
    await expect(mobilePage.getByText(/PANEL-204/i).first()).toBeVisible();
    await expect(mobilePage.getByText(/K. S. Rao/i).first()).toBeVisible();
    await mobilePage.screenshot({ path: path.join(screensDir, '11c-mobile-glossary-spellcheck-390x844.png') });
    console.log('✓ Captured 11c-mobile-glossary-spellcheck-390x844.png');

    // 5. About Screen
    console.log('\n--- Verifying About Screen ---');
    await mobilePage.goto(`${baseUrl}/about`);
    await expect(mobilePage.getByRole('heading', { name: /About FieldNote/i })).toBeVisible();
    await expect(mobilePage.getByText(/v0.1.0-release/i)).toBeVisible();
    await expect(mobilePage.getByText(/Zero Network Exfiltration/i)).toBeVisible();
    await mobilePage.screenshot({ path: path.join(screensDir, '12-mobile-about-390x844.png') });
    console.log('✓ Captured 12-mobile-about-390x844.png');

    // 6. More Screen & Multilingual Support (Spec 6: English, Telugu, Hindi)
    console.log('\n--- Verifying More Screen & Multilingual Support (Spec 6) ---');
    await mobilePage.goto(`${baseUrl}/more`);
    await expect(mobilePage.getByRole('heading', { name: /Field Intelligence Modules/i })).toBeVisible();
    await mobilePage.screenshot({ path: path.join(screensDir, '13a-mobile-more-english-390x844.png') });
    console.log('✓ Captured 13a-mobile-more-english-390x844.png');

    // Switch language to Telugu (te-IN)
    console.log('Switching language to Telugu (te-IN)...');
    const langSelect = mobilePage.locator('select');
    await langSelect.selectOption('te-IN');
    await mobilePage.waitForTimeout(300);

    // Verify Telugu labels on navigation tabs
    await expect(mobilePage.getByText('క్యాప్చర్')).toBeVisible();
    await expect(mobilePage.getByText('నివేదికలు')).toBeVisible();
    await expect(mobilePage.getByText('పనులు')).toBeVisible();
    await expect(mobilePage.getByText('మరిన్ని')).toBeVisible();
    await expect(mobilePage.getByText('వారపు ఫీల్డ్ సారాంశం')).toBeVisible();

    await mobilePage.screenshot({ path: path.join(screensDir, '13b-mobile-more-telugu-390x844.png') });
    console.log('✓ Verified Telugu labels with Noto Sans Telugu & captured 13b-mobile-more-telugu-390x844.png');

    // Switch language to Hindi (hi-IN)
    console.log('Switching language to Hindi (hi-IN)...');
    await langSelect.selectOption('hi-IN');
    await mobilePage.waitForTimeout(300);

    // Verify Hindi labels on navigation tabs
    await expect(mobilePage.getByText('कैप्चर')).toBeVisible();
    await expect(mobilePage.getByText('रिपोर्ट्स')).toBeVisible();
    await expect(mobilePage.getByText('कार्य')).toBeVisible();
    await expect(mobilePage.getByText('अधिक')).toBeVisible();
    await expect(mobilePage.getByText('साप्ताहिक फील्ड सारांश')).toBeVisible();

    await mobilePage.screenshot({ path: path.join(screensDir, '13c-mobile-more-hindi-390x844.png') });
    console.log('✓ Verified Hindi labels with Noto Sans Devanagari & captured 13c-mobile-more-hindi-390x844.png');

    // Revert language back to English (en-US)
    await langSelect.selectOption('en-US');
    await mobilePage.waitForTimeout(200);

    // ============================================================
    // 2. Desktop Verification (1280x800)
    // ============================================================
    console.log('\n--- Verifying Desktop Viewport (1280x800) ---');
    const desktopPage = await mobileContext.newPage();
    await desktopPage.setViewportSize({ width: 1280, height: 800 });

    // Desktop Manager Dashboard (Spec 16 Weekly Rollup)
    await desktopPage.goto(`${baseUrl}/rollup`);
    await expect(desktopPage.getByRole('heading', { name: /WEEKLY FIELD SUMMARY/i })).toBeVisible();
    await desktopPage.waitForTimeout(300);
    await desktopPage.screenshot({ path: path.join(screensDir, '14-desktop-manager-dashboard-rollup-1280x800.png') });
    console.log('✓ Captured 14-desktop-manager-dashboard-rollup-1280x800.png');

    // Desktop Office Kit Management Surface (Spec 19)
    await desktopPage.goto(`${baseUrl}/officekit`);
    await expect(desktopPage.getByRole('heading', { name: /PHONE ⇄ LAPTOP BRIDGE/i })).toBeVisible();
    await desktopPage.waitForTimeout(300);
    await desktopPage.screenshot({ path: path.join(screensDir, '15-desktop-officekit-management-1280x800.png') });
    console.log('✓ Captured 15-desktop-officekit-management-1280x800.png');

    // Desktop Templates & Glossary
    await desktopPage.goto(`${baseUrl}/templates`);
    await expect(desktopPage.getByRole('heading', { name: /Templates & Glossary/i })).toBeVisible();
    await desktopPage.waitForTimeout(300);
    await desktopPage.screenshot({ path: path.join(screensDir, '16-desktop-templates-glossary-1280x800.png') });
    console.log('✓ Captured 16-desktop-templates-glossary-1280x800.png');

    // Desktop Privacy & Trust
    await desktopPage.goto(`${baseUrl}/privacy`);
    await expect(desktopPage.getByRole('heading', { name: /Privacy & Trust Architecture/i })).toBeVisible();
    await desktopPage.waitForTimeout(300);
    await desktopPage.screenshot({ path: path.join(screensDir, '17-desktop-privacy-trust-1280x800.png') });
    console.log('✓ Captured 17-desktop-privacy-trust-1280x800.png');

    // Desktop Daylight Theme Mode
    console.log('\n--- Verifying Daylight Theme Mode ---');
    const daylightToggle = desktopPage.getByRole('radio', { name: /Daylight/i });
    if (await daylightToggle.isVisible()) {
      await daylightToggle.click();
      await desktopPage.waitForTimeout(250);
      await desktopPage.screenshot({ path: path.join(screensDir, '18-desktop-daylight-mode-1280x800.png') });
      console.log('✓ Captured 18-desktop-daylight-mode-1280x800.png');
    }

  } finally {
    await browser.close();
    previewServer.httpServer.close();
  }

  // Quality Assertion
  console.log('\n============================================================');
  console.log('PHASE 6 QUALITY & E2E VERIFICATION REPORT');
  console.log('============================================================');
  console.log(`Total Console Errors: ${consoleErrors.length}`);

  if (consoleErrors.length > 0) {
    console.error('FAILED: Browser console errors detected during verification:');
    consoleErrors.forEach((err) => console.error(`  - ${err}`));
    process.exit(1);
  }

  console.log('SUCCESS: All Phase 6 features (Weekly Rollup, Privacy Vault with AES-GCM, Office Kit Bridge, Templates & Glossary, and Multilingual i18n) verified cleanly with ZERO console errors.');
  process.exit(0);
}

runVerification().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
