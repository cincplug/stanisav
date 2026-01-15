#!/usr/bin/env node

/* eslint-env node */

import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import { fileURLToPath } from "url";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import {
  loadLanguagesData,
  updateMp3Metadata,
  getMetadataTitle,
} from "./shared/metadata.js";

const execAsync = promisify(exec);

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const AUDIO_DIR = "public/audio/samples";
const FFMPEG_PATH = ffmpegInstaller.path;

// Default optimization settings (can be overridden by analysis report)
const DEFAULT_SETTINGS = {
  targetLufs: -16,
  truePeak: -1.5,
  lra: 11,
  highpassFreq: 90,
  // EQ settings to combat "radio sound" and enhance voice/bass
  useEQ: true,
  eqPresets: {
    // Reduce harsh midrange frequencies (radio sound)
    reduceMidrange: { freq: 2800, gain: -2, q: 1.5 },
    reduceHarshness: { freq: 4500, gain: -1.5, q: 1.2 },
    // Boost presence and warmth
    boostPresence: { freq: 180, gain: 1.5, q: 0.8 },
    boostClarity: { freq: 8000, gain: 1, q: 1.5 },
  },
  // Compression - kept moderate
  compressionThreshold: -18,
  compressionRatio: 2.5,
  compressionAttack: 5,
  compressionRelease: 100,
  limiterThreshold: -1,
  limiterAttack: 5,
  limiterRelease: 50,
  bitrate: "192k",
  useVBR: true,
  vbrQuality: 2,
  // Metadata update
  updateMetadata: true,
};

// Get all -luka.mp3 files (NOT -luka-bas.mp3)
function getLukaMp3Files(audioDir) {
  if (!fs.existsSync(audioDir)) {
    console.error(`Error: Audio directory not found at ${audioDir}`);
    process.exit(1);
  }

  return fs
    .readdirSync(audioDir)
    .filter((file) => {
      const basename = path.basename(file, ".mp3");
      return basename.endsWith("-luka") && !basename.endsWith("-luka-bas");
    })
    .map((file) => ({
      fullPath: path.join(audioDir, file),
      filename: file,
    }));
}

// Load settings from analysis report if available
function loadAnalysisReport() {
  const reportPath = path.join(process.cwd(), "audio-analysis-report.json");

  if (!fs.existsSync(reportPath)) {
    console.log("⚠ No analysis report found. Using default settings.");
    console.log(
      "  Run 'npm run audio:analyze' first for optimized settings.\n"
    );
    return DEFAULT_SETTINGS;
  }

  try {
    const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
    const settings = { ...DEFAULT_SETTINGS };

    // Adjust settings based on analysis
    if (report.summary) {
      // If dynamic range is low, use lighter compression
      if (report.summary.avgDynamicRange < 8) {
        settings.compressionRatio = 2.0;
        settings.compressionThreshold = -20;
      }

      // If files are already close to target, adjust target to their average
      if (Math.abs(report.summary.avgLufs - settings.targetLufs) < 1) {
        settings.targetLufs = Math.round(report.summary.avgLufs);
      }
    }

    console.log("✓ Loaded settings from analysis report\n");
    return settings;
  } catch (error) {
    console.log("⚠ Error reading analysis report. Using default settings.\n");
    return DEFAULT_SETTINGS;
  }
}

// Optimize audio file
async function optimizeAudioFile(inputPath, settings) {
  const dir = path.dirname(inputPath);
  const filename = path.basename(inputPath);
  const tempFile = path.join(dir, `temp_${filename}`);

  try {
    // Build filter chain
    const filters = [];

    // 1. High-pass filter to remove rumble
    filters.push(`highpass=f=${settings.highpassFreq}`);

    // 2. EQ to reduce "radio sound" and enhance voice/bass
    if (settings.useEQ) {
      const eq = settings.eqPresets;
      filters.push(
        `equalizer=f=${eq.reduceMidrange.freq}:width_type=q:width=${eq.reduceMidrange.q}:g=${eq.reduceMidrange.gain}`,
        `equalizer=f=${eq.reduceHarshness.freq}:width_type=q:width=${eq.reduceHarshness.q}:g=${eq.reduceHarshness.gain}`,
        `equalizer=f=${eq.boostPresence.freq}:width_type=q:width=${eq.boostPresence.q}:g=${eq.boostPresence.gain}`,
        `equalizer=f=${eq.boostClarity.freq}:width_type=q:width=${eq.boostClarity.q}:g=${eq.boostClarity.gain}`
      );
    }

    // 3. Gentle compression
    filters.push(
      `acompressor=threshold=${settings.compressionThreshold}dB:ratio=${settings.compressionRatio}:attack=${settings.compressionAttack}:release=${settings.compressionRelease}`
    );

    // 4. Loudness normalization
    filters.push(
      `loudnorm=I=${settings.targetLufs}:TP=${settings.truePeak}:LRA=${settings.lra}`
    );

    // 5. Final limiter
    filters.push(
      `alimiter=limit=${settings.limiterThreshold}dB:attack=${settings.limiterAttack}:release=${settings.limiterRelease}`
    );

    const filterChain = filters.join(",");

    // Build encoding parameters
    const audioCodec = settings.useVBR
      ? `-codec:a libmp3lame -q:a ${settings.vbrQuality}`
      : `-codec:a libmp3lame -b:a ${settings.bitrate}`;

    // Build command
    const command = `"${FFMPEG_PATH}" -i "${inputPath}" -af "${filterChain}" ${audioCodec} "${tempFile}" -y 2>&1`;

    await execAsync(command);

    // Replace original file with optimized one
    fs.unlinkSync(inputPath);
    fs.renameSync(tempFile, inputPath);

    return { success: true };
  } catch (error) {
    // Clean up temp file if it exists
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
    return { success: false, error: error.message };
  }
}

// Main optimization function
async function main() {
  const args = process.argv.slice(2);
  const skipAnalysis = args.includes("--skip-analysis");

  console.log("Audio Optimization Tool for -luka.mp3 files");
  console.log(`Audio directory: ${AUDIO_DIR}`);
  console.log(`Using FFmpeg: ${FFMPEG_PATH}`);
  console.log(`Mode: In-place optimization (overwrites originals)\n`);

  // Load settings
  const settings = skipAnalysis ? DEFAULT_SETTINGS : loadAnalysisReport();

  // Load language data for metadata
  let languagesData = null;
  if (settings.updateMetadata) {
    languagesData = loadLanguagesData();
    if (!languagesData) {
      console.log(
        "⚠ Could not load language data. Metadata updates disabled.\n"
      );
      settings.updateMetadata = false;
    }
  }

  console.log("Optimization Settings:");
  console.log(`  Target Loudness: ${settings.targetLufs} LUFS`);
  console.log(`  True Peak Limit: ${settings.truePeak} dB`);
  console.log(`  High-pass Filter: ${settings.highpassFreq} Hz`);
  if (settings.useEQ) {
    console.log(`  EQ Profile: Voice + Bass optimized`);
    console.log(`    - Reduce 2.8 kHz (radio sound): -2 dB`);
    console.log(`    - Reduce 4.5 kHz (harshness): -1.5 dB`);
    console.log(`    - Boost 180 Hz (warmth): +1.5 dB`);
    console.log(`    - Boost 8 kHz (clarity): +1 dB`);
  }
  console.log(
    `  Compression: ${settings.compressionRatio}:1 ratio @ ${settings.compressionThreshold} dB`
  );
  console.log(`  Limiter: ${settings.limiterThreshold} dB`);
  console.log(
    `  Encoding: MP3 ${
      settings.useVBR ? `VBR quality ${settings.vbrQuality}` : settings.bitrate
    }`
  );
  console.log(`  Update Metadata: ${settings.updateMetadata ? "Yes" : "No"}`);
  console.log();

  const mp3Files = getLukaMp3Files(AUDIO_DIR);

  if (mp3Files.length === 0) {
    console.log(`No -luka.mp3 files found in ${AUDIO_DIR}`);
    return;
  }

  console.log(`Found ${mp3Files.length} -luka.mp3 file(s) to optimize\n`);
  console.log("Processing files...\n");

  const results = {
    success: 0,
    failed: 0,
    metadataUpdated: 0,
    metadataFailed: 0,
    errors: [],
  };

  for (let i = 0; i < mp3Files.length; i++) {
    const file = mp3Files[i];
    const progress = `[${i + 1}/${mp3Files.length}]`;

    process.stdout.write(
      `${progress} Processing: ${file.filename}...`.padEnd(100)
    );

    // Step 1: Optimize audio
    const result = await optimizeAudioFile(file.fullPath, settings);

    if (!result.success) {
      process.stdout.write(
        "\r" +
          `${progress} ✗ ${file.filename} (audio optimization failed)`.padEnd(
            100
          ) +
          "\n"
      );
      console.log(`  Error: ${result.error}\n`);
      results.failed++;
      results.errors.push({
        filename: file.filename,
        step: "optimization",
        error: result.error,
      });
      continue;
    }

    results.success++;

    // Step 2: Update metadata (if enabled)
    if (settings.updateMetadata && languagesData) {
      const title = getMetadataTitle(file.filename, languagesData);

      if (title) {
        const metadataResult = await updateMp3Metadata(file.fullPath, title);

        if (metadataResult.success) {
          results.metadataUpdated++;
          process.stdout.write(
            "\r" +
              `${progress} ✓ ${file.filename} (optimized + metadata)`.padEnd(
                100
              ) +
              "\n"
          );
        } else {
          results.metadataFailed++;
          process.stdout.write(
            "\r" +
              `${progress} ⚠ ${file.filename} (optimized, metadata failed)`.padEnd(
                100
              ) +
              "\n"
          );
          console.log(`  Metadata error: ${metadataResult.error}\n`);
        }
      } else {
        process.stdout.write(
          "\r" +
            `${progress} ✓ ${file.filename} (optimized, no metadata)`.padEnd(
              100
            ) +
            "\n"
        );
      }
    } else {
      process.stdout.write(
        "\r" + `${progress} ✓ ${file.filename}`.padEnd(100) + "\n"
      );
    }
  }

  console.log("\n" + "=".repeat(80));
  console.log("OPTIMIZATION COMPLETE");
  console.log("=".repeat(80) + "\n");

  console.log(`Summary:`);
  console.log(`  Successfully optimized: ${results.success}`);
  console.log(`  Failed: ${results.failed}`);
  if (settings.updateMetadata) {
    console.log(`  Metadata updated: ${results.metadataUpdated}`);
    console.log(`  Metadata failed: ${results.metadataFailed}`);
  }
  console.log(`  Total: ${mp3Files.length}`);

  if (results.errors.length > 0) {
    console.log(`\nErrors:`);
    results.errors.forEach((err) => {
      console.log(`  - ${err.filename} (${err.step}): ${err.error}`);
    });
  }

  console.log(
    `\nTip: To disable EQ or metadata updates, edit DEFAULT_SETTINGS in the script.`
  );
  console.log();
}

// Run the script
main().catch((error) => {
  console.error("\n[FATAL ERROR]:", error.message);
  console.error("Stack trace:", error.stack);
  process.exit(1);
});
