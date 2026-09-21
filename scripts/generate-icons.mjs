import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, '../public');
const iconsDir = path.join(publicDir, 'icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

const svgContent = fs.readFileSync(path.join(publicDir, 'favicon.svg'), 'utf-8');

async function generateIcons() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { margin: 0; padding: 0; background: transparent; display: flex; align-items: center; justify-content: center; }
          svg { width: 100vw; height: 100vh; }
        </style>
      </head>
      <body>
        ${svgContent}
      </body>
    </html>
  `);

  // 192x192
  await page.setViewportSize({ width: 192, height: 192 });
  await page.screenshot({ path: path.join(iconsDir, 'icon-192.png'), omitBackground: false });
  console.log('Generated icon-192.png');

  // 512x512
  await page.setViewportSize({ width: 512, height: 512 });
  await page.screenshot({ path: path.join(iconsDir, 'icon-512.png'), omitBackground: false });
  console.log('Generated icon-512.png');

  fs.writeFileSync(path.join(iconsDir, 'icon-maskable.svg'), svgContent);

  await browser.close();
}

generateIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
