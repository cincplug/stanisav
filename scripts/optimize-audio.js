#!/usr/bin/env node

/* eslint-env node */

import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import { fileURLToPath } from "url";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";

const execAsync = promisify(exec);

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const AUDIO_DIR = "public/audio/samples";
const OUTPUT_DIR = "public/audio/samples/optimized";
const FFMPEG_PATH = ffmpegInstaller.path;

// Default optimization settings (can be overridden by analysis report)
const DEFAULT_SETTINGS = {
  targetLufs: -16,
  truePeak: -1.5,
  lra: 11,
  highpassFreq: 90,
  compressionThreshold: -18,
  compressionRatio: 2.5,
  compressionAttack: 5,
  compressionRelease: 100,
  limiterThreshold: -1,
  limiterAttack: 5,
  limiterRelease: 50,
  bitrate: "192k",
  useVBR: true,
  vbrQuality: 2, // 0-9, lower is better for VBR
};

// Get all -luka.mp3 files
function getLukaMp3Files(audioDir) {
  if (!fs.existsSync(audioDir)) {
    console.error(`Error: Audio directory not found at ${audioDir}`);
    process.exit(1);
  }

  return fs
    .readdirSync(audioDir)
    .filter((file) => file.toLowerCase().endsWith("-luka.mp3"))
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
async function optimizeAudioFile(inputPath, outputPath, settings) {
  try {
    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Build filter chain
    const filters = [
      // 1. High-pass filter to remove rumble
      `highpass=f=${settings.highpassFreq}`,

      // 2. Compression for dynamic range control
      `acompressor=threshold=${settings.compressionThreshold}dB:ratio=${settings.compressionRatio}:attack=${settings.compressionAttack}:release=${settings.compressionRelease}`,

      // 3. Loudness normalization
      `loudnorm=I=${settings.targetLufs}:TP=${settings.truePeak}:LRA=${settings.lra}`,

      // 4. Limiter to prevent clipping
      `alimiter=limit=${settings.limiterThreshold}dB:attack=${settings.limiterAttack}:release=${settings.limiterRelease}`,
    ];

    const filterChain = filters.join(",");

    // Build encoding parameters
    const audioCodec = settings.useVBR
      ? `-codec:a libmp3lame -q:a ${settings.vbrQuality}`
      : `-codec:a libmp3lame -b:a ${settings.bitrate}`;

    // Build command
    const command = `"${FFMPEG_PATH}" -i "${inputPath}" -af "${filterChain}" ${audioCodec} "${outputPath}" -y 2>&1`;

    await execAsync(command);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Main optimization function
async function main() {
  const args = process.argv.slice(2);
  const inPlace = args.includes("--in-place");
  const skipAnalysis = args.includes("--skip-analysis");

  console.log("Audio Optimization Tool for -luka.mp3 files");
  console.log(`Audio directory: ${AUDIO_DIR}`);
  console.log(`Using FFmpeg: ${FFMPEG_PATH}`);
  console.log(
    `Mode: ${
      inPlace ? "In-place (overwrite originals)" : "Create optimized copies"
    }\n`
  );

  // Load settings
  const settings = skipAnalysis ? DEFAULT_SETTINGS : loadAnalysisReport();

  console.log("Optimization Settings:");
  console.log(`  Target Loudness: ${settings.targetLufs} LUFS`);
  console.log(`  True Peak Limit: ${settings.truePeak} dB`);
  console.log(`  High-pass Filter: ${settings.highpassFreq} Hz`);
  console.log(
    `  Compression: ${settings.compressionRatio}:1 ratio @ ${settings.compressionThreshold} dB`
  );
  console.log(`  Limiter: ${settings.limiterThreshold} dB`);
  console.log(
    `  Encoding: MP3 ${
      settings.useVBR ? `VBR quality ${settings.vbrQuality}` : settings.bitrate
    }`
  );
  console.log();

  const mp3Files = getLukaMp3Files(AUDIO_DIR);

  if (mp3Files.length === 0) {
    console.log(`No -luka.mp3 files found in ${AUDIO_DIR}`);
    return;
  }

  console.log(`Found ${mp3Files.length} -luka.mp3 file(s) to optimize\n`);

  if (!inPlace) {
    console.log(`Optimized files will be saved to: ${OUTPUT_DIR}\n`);
  } else {
    console.log("⚠ WARNING: Original files will be OVERWRITTEN!");
    console.log("  Press Ctrl+C within 5 seconds to cancel...\n");
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  console.log("Processing files...\n");

  const results = {
    success: 0,
    failed: 0,
    errors: [],
  };

  for (let i = 0; i < mp3Files.length; i++) {
    const file = mp3Files[i];
    const progress = `[${i + 1}/${mp3Files.length}]`;

    process.stdout.write(
      `${progress} Processing: ${file.filename}...`.padEnd(100)
    );

    const outputPath = inPlace
      ? file.fullPath
      : path.join(OUTPUT_DIR, file.filename);

    const tempPath = inPlace
      ? path.join(path.dirname(file.fullPath), `temp_${file.filename}`)
      : outputPath;

    const result = await optimizeAudioFile(file.fullPath, tempPath, settings);

    if (result.success) {
      if (inPlace) {
        // Replace original with optimized version
        fs.unlinkSync(file.fullPath);
        fs.renameSync(tempPath, file.fullPath);
      }
      process.stdout.write(
        "\r" + `${progress} ✓ ${file.filename}`.padEnd(100) + "\n"
      );
      results.success++;
    } else {
      process.stdout.write(
        "\r" + `${progress} ✗ ${file.filename}`.padEnd(100) + "\n"
      );
      console.log(`  Error: ${result.error}\n`);
      results.failed++;
      results.errors.push({ filename: file.filename, error: result.error });
    }
  }

  console.log("\n" + "=".repeat(80));
  console.log("OPTIMIZATION COMPLETE");
  console.log("=".repeat(80) + "\n");

  console.log(`Summary:`);
  console.log(`  Successfully optimized: ${results.success}`);
  console.log(`  Failed: ${results.failed}`);
  console.log(`  Total: ${mp3Files.length}`);

  if (!inPlace && results.success > 0) {
    console.log(`\nOptimized files saved to: ${OUTPUT_DIR}`);
  }

  if (results.errors.length > 0) {
    console.log(`\nErrors:`);
    results.errors.forEach((err) => {
      console.log(`  - ${err.filename}: ${err.error}`);
    });
  }

  console.log();
}

// Run the script
main().catch((error) => {
  console.error("\n[FATAL ERROR]:", error.message);
  console.error("Stack trace:", error.stack);
  process.exit(1);
});
