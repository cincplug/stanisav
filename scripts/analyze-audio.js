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
const FFMPEG_PATH = ffmpegInstaller.path;

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

// Analyze audio file using ffmpeg
async function analyzeAudioFile(filePath) {
  try {
    // Get audio statistics: peak level, RMS, duration
    const statsCommand = `"${FFMPEG_PATH}" -i "${filePath}" -af "astats=metadata=1:reset=1,ametadata=print:key=lavfi.astats.Overall.Peak_level:file=-,ametadata=print:key=lavfi.astats.Overall.RMS_level:file=-" -f null - 2>&1`;

    // Get loudness (LUFS) measurement
    const loudnessCommand = `"${FFMPEG_PATH}" -i "${filePath}" -af "loudnorm=print_format=json" -f null - 2>&1`;

    const [statsOutput, loudnessOutput] = await Promise.all([
      execAsync(statsCommand),
      execAsync(loudnessCommand),
    ]);

    // Parse duration
    const durationMatch = statsOutput.stdout.match(
      /Duration: (\d{2}):(\d{2}):(\d{2}\.\d{2})/
    );
    let duration = 0;
    if (durationMatch) {
      const hours = parseInt(durationMatch[1]);
      const minutes = parseInt(durationMatch[2]);
      const seconds = parseFloat(durationMatch[3]);
      duration = hours * 3600 + minutes * 60 + seconds;
    }

    // Parse peak and RMS levels
    const peakMatches = [
      ...statsOutput.stdout.matchAll(
        /lavfi\.astats\.Overall\.Peak_level=(-?\d+\.?\d*)/g
      ),
    ];
    const rmsMatches = [
      ...statsOutput.stdout.matchAll(
        /lavfi\.astats\.Overall\.RMS_level=(-?\d+\.?\d*)/g
      ),
    ];

    const peakLevel =
      peakMatches.length > 0
        ? parseFloat(peakMatches[peakMatches.length - 1][1])
        : null;
    const rmsLevel =
      rmsMatches.length > 0
        ? parseFloat(rmsMatches[rmsMatches.length - 1][1])
        : null;

    // Parse LUFS data
    const lufsJsonMatch = loudnessOutput.stdout.match(
      /\{[\s\S]*"input_i"\s*:\s*"(-?\d+\.?\d*)"/
    );
    const lufsValue = lufsJsonMatch ? parseFloat(lufsJsonMatch[1]) : null;

    // Parse true peak
    const truePeakMatch = loudnessOutput.stdout.match(
      /"input_tp"\s*:\s*"(-?\d+\.?\d*)"/
    );
    const truePeak = truePeakMatch ? parseFloat(truePeakMatch[1]) : null;

    // Parse dynamic range (LRA)
    const lraMatch = loudnessOutput.stdout.match(
      /"input_lra"\s*:\s*"(-?\d+\.?\d*)"/
    );
    const dynamicRange = lraMatch ? parseFloat(lraMatch[1]) : null;

    // Get bitrate
    const bitrateMatch = statsOutput.stdout.match(/bitrate:\s*(\d+)\s*kb\/s/);
    const bitrate = bitrateMatch ? parseInt(bitrateMatch[1]) : null;

    return {
      duration,
      peakLevel,
      rmsLevel,
      lufs: lufsValue,
      truePeak,
      dynamicRange,
      bitrate,
    };
  } catch (error) {
    console.error(`  Error analyzing: ${error.message}`);
    return null;
  }
}

// Main analysis function
async function main() {
  console.log("Audio Analysis Tool for -luka.mp3 files");
  console.log(`Audio directory: ${AUDIO_DIR}`);
  console.log(`Using FFmpeg: ${FFMPEG_PATH}\n`);

  const mp3Files = getLukaMp3Files(AUDIO_DIR);

  if (mp3Files.length === 0) {
    console.log(`No -luka.mp3 files found in ${AUDIO_DIR}`);
    return;
  }

  console.log(`Found ${mp3Files.length} -luka.mp3 file(s) to analyze\n`);
  console.log("Analyzing files (this may take a while)...\n");

  const results = [];
  let processed = 0;

  for (const file of mp3Files) {
    process.stdout.write(
      `\rProcessing: ${processed + 1}/${mp3Files.length} - ${
        file.filename
      }`.padEnd(100)
    );

    const analysis = await analyzeAudioFile(file.fullPath);

    if (analysis) {
      results.push({
        filename: file.filename,
        ...analysis,
      });
    }

    processed++;
  }

  console.log("\n\n" + "=".repeat(80));
  console.log("ANALYSIS RESULTS");
  console.log("=".repeat(80) + "\n");

  // Calculate statistics
  const validResults = results.filter((r) => r.lufs !== null);

  if (validResults.length === 0) {
    console.log("No valid results to analyze.");
    return;
  }

  const avgLufs =
    validResults.reduce((sum, r) => sum + r.lufs, 0) / validResults.length;
  const minLufs = Math.min(...validResults.map((r) => r.lufs));
  const maxLufs = Math.max(...validResults.map((r) => r.lufs));

  const avgPeak =
    validResults.reduce((sum, r) => sum + (r.peakLevel || 0), 0) /
    validResults.length;
  const maxPeak = Math.max(
    ...validResults.map((r) => r.peakLevel || -Infinity)
  );

  const avgDR =
    validResults.reduce((sum, r) => sum + (r.dynamicRange || 0), 0) /
    validResults.length;
  const minDR = Math.min(
    ...validResults.filter((r) => r.dynamicRange).map((r) => r.dynamicRange)
  );
  const maxDR = Math.max(
    ...validResults.filter((r) => r.dynamicRange).map((r) => r.dynamicRange)
  );

  const avgBitrate =
    validResults.reduce((sum, r) => sum + (r.bitrate || 0), 0) /
    validResults.length;

  console.log("LOUDNESS (LUFS - Loudness Units Full Scale):");
  console.log(`  Average: ${avgLufs.toFixed(2)} LUFS`);
  console.log(`  Range: ${minLufs.toFixed(2)} to ${maxLufs.toFixed(2)} LUFS`);
  console.log(`  Spread: ${(maxLufs - minLufs).toFixed(2)} LU\n`);

  console.log("PEAK LEVELS:");
  console.log(`  Average Peak: ${avgPeak.toFixed(2)} dB`);
  console.log(`  Maximum Peak: ${maxPeak.toFixed(2)} dB\n`);

  console.log("DYNAMIC RANGE (LRA):");
  console.log(`  Average: ${avgDR.toFixed(2)} LU`);
  console.log(`  Range: ${minDR.toFixed(2)} to ${maxDR.toFixed(2)} LU\n`);

  console.log("ENCODING:");
  console.log(`  Average Bitrate: ${avgBitrate.toFixed(0)} kb/s\n`);

  console.log("=".repeat(80));
  console.log("RECOMMENDATIONS");
  console.log("=".repeat(80) + "\n");

  // Target loudness for voice + music content
  const targetLufs = -16; // Standard for podcasts/voice content

  console.log("1. NORMALIZATION:");
  console.log(`   Target: ${targetLufs} LUFS (podcast/voice standard)`);
  if (Math.abs(avgLufs - targetLufs) > 2) {
    console.log(
      `   ⚠ Your files average ${avgLufs.toFixed(
        1
      )} LUFS - normalization RECOMMENDED`
    );
    console.log(
      `   Adjustment needed: ${(targetLufs - avgLufs).toFixed(1)} dB`
    );
  } else {
    console.log(
      `   ✓ Your files are close to target (${avgLufs.toFixed(1)} LUFS)`
    );
  }
  console.log();

  console.log("2. COMPRESSION:");
  if (avgDR > 8) {
    console.log(
      `   ⚠ High dynamic range (${avgDR.toFixed(
        1
      )} LU) - gentle compression recommended`
    );
    console.log(
      `   Suggested: Ratio 2.5:1, Threshold -18dB, Attack 5ms, Release 100ms`
    );
  } else {
    console.log(`   ✓ Dynamic range is reasonable (${avgDR.toFixed(1)} LU)`);
    console.log(`   Suggested: Light compression if needed - Ratio 2:1`);
  }
  console.log();

  console.log("3. PEAK LIMITING:");
  if (maxPeak > -1) {
    console.log(
      `   ⚠ Some files have peaks above -1dB (max: ${maxPeak.toFixed(2)} dB)`
    );
    console.log(`   Limiter REQUIRED at -1 dB true peak`);
  } else {
    console.log(`   ✓ Peaks are safe (max: ${maxPeak.toFixed(2)} dB)`);
    console.log(`   Limiter recommended at -1 dB for safety`);
  }
  console.log();

  console.log("4. HIGH-PASS FILTER:");
  console.log(
    `   Recommended: 80-100 Hz to remove rumble (dog footsteps, room noise)`
  );
  console.log(`   This won't affect bass guitar (lowest note ~41 Hz E string)`);
  console.log();

  console.log("5. ENCODING QUALITY:");
  if (avgBitrate < 192) {
    console.log(`   ⚠ Current average bitrate: ${avgBitrate.toFixed(0)} kb/s`);
    console.log(
      `   Recommended: 192 kb/s VBR or higher for voice + acoustic bass`
    );
  } else {
    console.log(`   ✓ Current bitrate is good: ${avgBitrate.toFixed(0)} kb/s`);
  }
  console.log();

  console.log("=".repeat(80));
  console.log("SUGGESTED OPTIMIZATION PARAMETERS");
  console.log("=".repeat(80) + "\n");

  console.log("ffmpeg filter chain:");
  console.log(`  1. High-pass filter: highpass=f=90`);
  console.log(
    `  2. Compression: acompressor=threshold=-18dB:ratio=2.5:attack=5:release=100`
  );
  console.log(
    `  3. Loudness normalization: loudnorm=I=${targetLufs}:TP=-1.5:LRA=11`
  );
  console.log(`  4. Limiter: alimiter=limit=-1dB:attack=5:release=50`);
  console.log();

  console.log("Output encoding:");
  console.log(`  Format: MP3`);
  console.log(`  Bitrate: 192k VBR (quality 2) or 256k CBR for best quality`);
  console.log();

  // Save detailed report
  const reportPath = path.join(process.cwd(), "audio-analysis-report.json");
  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      {
        summary: {
          totalFiles: validResults.length,
          avgLufs,
          minLufs,
          maxLufs,
          avgPeak,
          maxPeak,
          avgDynamicRange: avgDR,
          avgBitrate,
          targetLufs,
          recommendedAdjustment: targetLufs - avgLufs,
        },
        files: results,
      },
      null,
      2
    )
  );

  console.log(`✓ Detailed report saved to: ${reportPath}\n`);
  console.log(
    "Next step: Run 'npm run audio:optimize' to process your files with these settings."
  );
}

// Run the script
main().catch((error) => {
  console.error("\n[FATAL ERROR]:", error.message);
  console.error("Stack trace:", error.stack);
  process.exit(1);
});
