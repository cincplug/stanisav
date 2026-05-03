#!/usr/bin/env node

/* eslint-env node */

/**
 * analyze-blinks.js
 *
 * Scans public/audio/samples for *-luka.mp3 files and finds loudness peaks
 * that should trigger eye blinks. Uses RMS energy over short windows — no
 * FFT needed. Peaks are chosen so the average blink rate sits close to
 * TARGET_BLINKS_PER_SEC, with a minimum gap between consecutive blinks.
 *
 * Output: src/config/blinkTimings.json
 *   { "eng": [1.23, 2.45, 4.01], "fra": [0.8, 1.9, 3.3], ... }
 *
 * Usage:
 *   node scripts/analyze-blinks.js
 *
 * Requires: node-web-audio-api (already a dev dependency)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { OfflineAudioContext } from "node-web-audio-api";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Config ──────────────────────────────────────────────────────────────────

const AUDIO_DIR = "public/audio/samples";
const OUTPUT_FILE = "src/config/blinkTimings.json";

// RMS window length in seconds — short enough to catch transients
const RMS_WINDOW_SEC = 0.05;

// Minimum silence gap between two blinks in seconds — prevents double-triggers
const MIN_BLINK_GAP_SEC = 0.3;

// Target average blink rate — used to pick the RMS threshold per file
// so that louder/quieter recordings produce a comparable number of blinks
const TARGET_BLINKS_PER_SEC = 1.0;

// Acceptable range — threshold search stops once rate lands in here
const MIN_BLINKS_PER_SEC = 0.3;
const MAX_BLINKS_PER_SEC = 3.0;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getIsoCode(filename) {
  const match = filename.match(/^([a-z]{3})-luka\.mp3$/i);
  return match ? match[1].toLowerCase() : null;
}

function getLukaMp3Files(audioDir) {
  if (!fs.existsSync(audioDir)) {
    console.error(`Error: Audio directory not found at ${audioDir}`);
    process.exit(1);
  }
  return fs
    .readdirSync(audioDir)
    .filter((f) => /^[a-z]{3}-luka\.mp3$/i.test(f))
    .map((f) => ({ fullPath: path.join(audioDir, f), filename: f }));
}

// Compute RMS energy for each window across monoData.
// Returns Float32Array of rms values, one per window, and the window hop in samples.
function computeRmsWindows(monoData, sampleRate, windowSec) {
  const windowSamples = Math.floor(sampleRate * windowSec);
  const numWindows = Math.floor(monoData.length / windowSamples);
  const rms = new Float32Array(numWindows);

  for (let w = 0; w < numWindows; w++) {
    const start = w * windowSamples;
    let sum = 0;
    for (let i = start; i < start + windowSamples; i++) {
      sum += monoData[i] * monoData[i];
    }
    rms[w] = Math.sqrt(sum / windowSamples);
  }

  return { rms, windowSamples };
}

// Find rising-edge peaks above threshold with a minimum gap between them.
// Returns array of timestamps in seconds.
function findPeakTimestamps(
  rms,
  windowSamples,
  sampleRate,
  threshold,
  minGapSec,
) {
  const minGapWindows = Math.ceil(minGapSec / (windowSamples / sampleRate));
  const timestamps = [];
  let wasAbove = false;
  let lastPeakWindow = -minGapWindows;

  for (let w = 0; w < rms.length; w++) {
    const isAbove = rms[w] > threshold;
    if (isAbove && !wasAbove && w - lastPeakWindow >= minGapWindows) {
      timestamps.push(
        parseFloat(((w * windowSamples) / sampleRate).toFixed(3)),
      );
      lastPeakWindow = w;
    }
    wasAbove = isAbove;
  }

  return timestamps;
}

// Binary-search for the RMS threshold that produces a blink rate closest to
// TARGET_BLINKS_PER_SEC, within the acceptable range.
function findBestThreshold(
  rms,
  windowSamples,
  sampleRate,
  durationSec,
  minGapSec,
) {
  // Threshold search range: between min and max RMS value
  let lo = 0;
  let hi = Math.max(...rms);

  if (hi === 0) return null; // silent file

  // 20 iterations of bisection is more than enough
  let bestTimestamps = null;
  let bestDistance = Infinity;

  for (let iter = 0; iter < 20; iter++) {
    const mid = (lo + hi) / 2;
    const timestamps = findPeakTimestamps(
      rms,
      windowSamples,
      sampleRate,
      mid,
      minGapSec,
    );
    const rate = timestamps.length / durationSec;
    const distance = Math.abs(rate - TARGET_BLINKS_PER_SEC);

    if (distance < bestDistance) {
      bestDistance = distance;
      bestTimestamps = timestamps;
    }

    if (rate > TARGET_BLINKS_PER_SEC) {
      lo = mid; // too many blinks — raise threshold
    } else {
      hi = mid; // too few blinks — lower threshold
    }
  }

  // Reject if final rate is outside the acceptable range
  if (!bestTimestamps) return null;
  const finalRate = bestTimestamps.length / durationSec;
  if (finalRate < MIN_BLINKS_PER_SEC || finalRate > MAX_BLINKS_PER_SEC)
    return null;
  if (bestTimestamps.length === 0) return null;

  return bestTimestamps;
}

// ─── Per-file analysis ───────────────────────────────────────────────────────

async function analyzeFile(fullPath, filename) {
  const isoCode = getIsoCode(filename);
  if (!isoCode) return null;

  const buffer = fs.readFileSync(fullPath);
  const arrayBuffer = buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  );

  const decodeCtx = new OfflineAudioContext(1, 1, 44100);
  let audioBuffer;
  try {
    audioBuffer = await decodeCtx.decodeAudioData(arrayBuffer);
  } catch (err) {
    console.error(`\n  Failed to decode ${filename}: ${err.message}`);
    return null;
  }

  const sampleRate = audioBuffer.sampleRate;
  const numChannels = audioBuffer.numberOfChannels;
  const totalSamples = audioBuffer.length;
  const durationSec = audioBuffer.duration;

  // Mix down to mono
  const monoData = new Float32Array(totalSamples);
  for (let c = 0; c < numChannels; c++) {
    const ch = audioBuffer.getChannelData(c);
    for (let i = 0; i < totalSamples; i++) {
      monoData[i] += ch[i] / numChannels;
    }
  }

  const { rms, windowSamples } = computeRmsWindows(
    monoData,
    sampleRate,
    RMS_WINDOW_SEC,
  );
  const timestamps = findBestThreshold(
    rms,
    windowSamples,
    sampleRate,
    durationSec,
    MIN_BLINK_GAP_SEC,
  );

  return { isoCode, timestamps, durationSec };
}

// ─── Entry point ─────────────────────────────────────────────────────────────

async function main() {
  console.log("Blink Timing Analyzer");
  console.log(`Audio directory : ${AUDIO_DIR}`);
  console.log(`Output file     : ${OUTPUT_FILE}\n`);

  const mp3Files = getLukaMp3Files(AUDIO_DIR);

  if (mp3Files.length === 0) {
    console.log(`No *-luka.mp3 files found in ${AUDIO_DIR}`);
    return;
  }

  console.log(`Found ${mp3Files.length} file(s)\n`);

  const results = {};
  let processed = 0;
  let skipped = 0;
  const total = mp3Files.length;

  for (const file of mp3Files) {
    const n = processed + skipped + 1;
    process.stdout.write(`\r[${n}/${total}] ${file.filename}...`.padEnd(80));

    const result = await analyzeFile(file.fullPath, file.filename);

    if (!result) {
      skipped++;
      continue;
    }

    if (!result.timestamps) {
      process.stdout.write(
        `\r⚠  ${file.filename}: no peaks found (${result.durationSec.toFixed(1)}s)\n`,
      );
      skipped++;
    } else {
      const rate = (result.timestamps.length / result.durationSec).toFixed(2);
      results[result.isoCode] = result.timestamps;
      process.stdout.write(
        `\r✓  ${file.filename} → ${result.timestamps.length} blinks @ ${rate}/s (${result.durationSec.toFixed(1)}s)\n`,
      );
      processed++;
    }
  }

  console.log(`\nProcessed: ${processed}  Skipped: ${skipped}`);

  const outputDir = path.dirname(path.resolve(OUTPUT_FILE));
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
  console.log(`\n✓ Written to ${OUTPUT_FILE}`);
}

main().catch((err) => {
  console.error("\n[FATAL]:", err.message);
  console.error(err.stack);
  process.exit(1);
});
