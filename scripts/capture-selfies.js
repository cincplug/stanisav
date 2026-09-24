#!/usr/bin/env node

/* eslint-env node */

/**
 * capture-selfies.js
 *
 * Build-time replacement for the old in-app batch-capture button. Boots the
 * app in a headless browser, iterates every language code straight from the
 * live app data (no hardcoded/replicated ISO list), reads back each
 * MiniStanisav render via canvas.toDataURL() (the WebGL framebuffer itself,
 * so no overlapping page chrome can ever bleed into the image), then
 * auto-trims the fully transparent margins on every side and resizes to a
 * fixed height (width scales to keep each Stanisav's own aspect ratio)
 * before writing it to public/selfies.
 *
 * Re-run this whenever Stanisav's shape/material config changes, so the
 * committed PNGs never silently drift out of sync with the live scene.
 *
 * Output: public/selfies/<iso>.png
 *
 * Usage:
 *   npm run selfies [-- --size=256] [-- --only=cre,eng,jpn]
 *
 * Requires: playwright, sharp (dev dependencies)
 * One-time setup: npx playwright install chromium
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { chromium } from "playwright";
import sharp from "sharp";
import { createServer } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const OUTPUT_DIR = path.join(rootDir, "public/selfies");
// Final height (in px) of every selfie, after trimming the transparent
// margins. Width scales to preserve each Stanisav's own aspect ratio.
// Override per-run with --size=N.
const SELFIE_HEIGHT = 256;

function getOutputHeight() {
  const sizeArg = process.argv.find((arg) => arg.startsWith("--size="));
  const size = sizeArg ? Number.parseInt(sizeArg.split("=")[1], 10) : NaN;
  return Number.isFinite(size) && size > 0 ? size : SELFIE_HEIGHT;
}

// Restricts the batch to a handful of ISO codes for quick iteration, e.g.
// --only=cre,eng,jpn. Runs every language when omitted.
function getOnlyCodes() {
  const onlyArg = process.argv.find((arg) => arg.startsWith("--only="));
  return onlyArg ? onlyArg.slice("--only=".length).split(",") : null;
}

async function captureLanguageSelfie(page, languageCode) {
  await page.evaluate(
    (code) => window.__stanisavCapture.setLanguage(code),
    languageCode,
  );
  await page.waitForFunction(() => window.__stanisavCaptureReady === true);

  const dataUrl = await page.evaluate(() =>
    window.__stanisavCapture.captureDataUrl(),
  );
  return Buffer.from(dataUrl.split(",")[1], "base64");
}

async function main() {
  const outputHeight = getOutputHeight();
  const onlyCodes = getOnlyCodes();

  const server = await createServer({ root: rootDir, server: { port: 0 } });
  await server.listen();
  const address = server.httpServer.address();
  const baseUrl = `http://localhost:${address.port}`;

  const browser = await chromium.launch();
  const page = await browser.newPage({
    // Extra-wide viewport so wide-eared/polysynthetic shapes are never
    // clipped by the camera frustum before capture; trim() removes any
    // resulting excess transparent margin afterwards.
    viewport: { width: 3200, height: 400 },
    deviceScaleFactor: 2,
  });

  try {
    await page.goto(`${baseUrl}/en/article?capture=1`, {
      waitUntil: "networkidle",
    });
    await page.waitForFunction(
      () => (window.__stanisavCapture?.getLanguages() || []).length > 0,
    );

    const languageCodes = await page.evaluate(() =>
      window.__stanisavCapture.getLanguages(),
    );
    const codesToCapture = onlyCodes
      ? languageCodes.filter((code) => onlyCodes.includes(code))
      : languageCodes;

    fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    for (const languageCode of codesToCapture) {
      const screenshot = await captureLanguageSelfie(page, languageCode);

      const outputPath = path.join(OUTPUT_DIR, `${languageCode}.png`);
      await sharp(screenshot)
        .trim()
        .resize({ height: outputHeight })
        // palette: true quantizes to an indexed PNG (like pngquant), which
        // shrinks these flat-shaded renders ~75% smaller with no visible
        // quality loss.
        .png({ compressionLevel: 9, adaptiveFiltering: true, palette: true })
        .toFile(outputPath);

      console.log(`Captured ${languageCode}.png`);
    }

    console.log(
      `Done. ${codesToCapture.length} selfies written to public/selfies`,
    );
  } finally {
    await browser.close();
    await server.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
