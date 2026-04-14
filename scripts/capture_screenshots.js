/**
 * Playwright Screenshot Script for PRD Documentation
 * Usage: node scripts/capture_screenshots.js
 *
 * Prerequisites:
 * 1. Start the development server: npm run dev
 * 2. Make sure the API is running on port 8000
 */

const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3000';
const OUTPUT_DIR = path.join(__dirname, '..', 'output', 'screenshots');

// Pages to capture
const PAGES = [
  { name: '01-homepage', path: '/', width: 1920, height: 1080 },
  { name: '02-tools-page', path: '/tools', width: 1920, height: 1440 },
  { name: '03-tool-detail', path: '/tools/chatgpt', width: 1920, height: 1440 },
  { name: '04-compare-page', path: '/compare/chatgpt-claude-gemini', width: 1920, height: 1080 },
  { name: '05-scenarios-page', path: '/scenarios', width: 1920, height: 1080 },
  { name: '06-rankings-page', path: '/rankings', width: 1920, height: 1080 },
  { name: '07-auth-page', path: '/auth', width: 1920, height: 1080 },
  { name: '08-command-palette', path: '/', width: 1920, height: 1080, triggerCmdK: true },
];

async function captureScreenshots() {
  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log('Starting browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();

  // Enable console log interception for debugging
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`  [Console Error] ${msg.text()}`);
    }
  });

  for (const pageConfig of PAGES) {
    console.log(`\nCapturing: ${pageConfig.name}`);
    console.log(`  URL: ${BASE_URL}${pageConfig.path}`);

    try {
      // Navigate to the page
      await page.goto(`${BASE_URL}${pageConfig.path}`, {
        waitUntil: 'networkidle',
        timeout: 30000,
      });

      // Wait for page to be fully loaded
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(1000); // Extra wait for dynamic content

      // Trigger Cmd+K if needed (for command palette screenshot)
      if (pageConfig.triggerCmdK) {
        console.log('  Triggering Cmd+K...');
        await page.keyboard.press('Meta+k');
        await page.waitForTimeout(500);
      }

      // Take screenshot
      const screenshotPath = path.join(OUTPUT_DIR, `${pageConfig.name}.png`);
      await page.screenshot({
        path: screenshotPath,
        fullPage: false,
      });
      console.log(`  Saved: ${screenshotPath}`);

    } catch (error) {
      console.error(`  Error capturing ${pageConfig.name}: ${error.message}`);
      // Take a screenshot anyway to see what went wrong
      const errorPath = path.join(OUTPUT_DIR, `${pageConfig.name}-error.png`);
      await page.screenshot({ path: errorPath }).catch(() => {});
    }
  }

  await browser.close();
  console.log('\nScreenshot capture complete!');
  console.log(`Output directory: ${OUTPUT_DIR}`);
}

// Run if called directly
if (require.main === module) {
  captureScreenshots()
    .then(() => {
      console.log('Done!');
      process.exit(0);
    })
    .catch(err => {
      console.error('Screenshot capture failed:', err);
      process.exit(1);
    });
}

module.exports = { captureScreenshots, PAGES, BASE_URL };
