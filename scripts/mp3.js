#!/usr/bin/env node

/* eslint-env node */

const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const { promisify } = require("util");

const execAsync = promisify(exec);

// Configuration
const AUDIO_DIR = "public/audio/samples";
const LANGUAGES_JSON = "src/config/languages.json";

// Load the languages JSON file
function loadLanguagesData() {
  if (!fs.existsSync(LANGUAGES_JSON)) {
    console.error(`Error: Language data file not found at ${LANGUAGES_JSON}`);
    console.error("Usage: node script.js [path-to-languages.json]");
    process.exit(1);
  }

  try {
    const jsonData = fs.readFileSync(LANGUAGES_JSON, "utf8");
    return JSON.parse(jsonData);
  } catch (error) {
    console.error(
      `[ERROR] Failed to parse languages.json at ${LANGUAGES_JSON}`
    );
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

// Get changed MP3 files from git
async function getChangedMp3Files(audioDir) {
  if (!fs.existsSync(audioDir)) {
    console.error(`Error: Audio directory not found at ${audioDir}`);
    process.exit(1);
  }

  try {
    // Check if we're in a git repository
    try {
      await execAsync(`git rev-parse --is-inside-work-tree`);
    } catch (error) {
      console.error("[ERROR] Not in a git repository");
      console.error(
        "Make sure you're in a git repository and git is installed"
      );
      process.exit(1);
    }

    // Get staged and unstaged changes
    const { stdout: diffOutput } = await execAsync(`git diff --name-only HEAD`);

    // Get untracked files
    const { stdout: untrackedOutput } = await execAsync(
      `git ls-files --others --exclude-standard`
    );

    // Combine both outputs
    const allChangedFiles = [
      ...diffOutput.split("\n").filter((file) => file.trim()),
      ...untrackedOutput.split("\n").filter((file) => file.trim())
    ];

    const changedFiles = allChangedFiles
      .filter((file) => {
        const fullPath = path.resolve(file);
        const audioDirPath = path.resolve(audioDir);
        return (
          fullPath.startsWith(audioDirPath) &&
          file.toLowerCase().endsWith(".mp3")
        );
      })
      .map((file) => {
        const basename = path.basename(file, ".mp3");
        // Check for -luka-bas BEFORE checking for -luka
        const isBas = basename.endsWith("-luka-bas");
        const isLuka = !isBas && basename.endsWith("-luka");
        const iso = isBas
          ? basename.replace("-luka-bas", "")
          : isLuka
          ? basename.replace("-luka", "")
          : basename;

        return {
          fullPath: path.resolve(file),
          basename: basename,
          iso: iso,
          isLuka: isLuka,
          isBas: isBas,
          filename: path.basename(file)
        };
      });

    return changedFiles;
  } catch (error) {
    console.error("[ERROR] Error checking git status:", error.message);
    process.exit(1);
  }
}

// Get all MP3 files in the audio directory (fallback)
function getAllMp3Files(audioDir) {
  if (!fs.existsSync(audioDir)) {
    console.error(`Error: Audio directory not found at ${audioDir}`);
    process.exit(1);
  }

  return fs
    .readdirSync(audioDir)
    .filter((file) => file.toLowerCase().endsWith(".mp3"))
    .map((file) => {
      const basename = path.basename(file, ".mp3");
      // Check for -luka-bas BEFORE checking for -luka
      const isBas = basename.endsWith("-luka-bas");
      const isLuka = !isBas && basename.endsWith("-luka");
      const iso = isBas
        ? basename.replace("-luka-bas", "")
        : isLuka
        ? basename.replace("-luka", "")
        : basename;

      return {
        fullPath: path.join(audioDir, file),
        basename: basename,
        iso: iso,
        isLuka: isLuka,
        isBas: isBas,
        filename: file
      };
    });
}

// Update MP3 metadata using ffmpeg
async function updateMp3Metadata(filePath, title) {
  const dir = path.dirname(filePath);
  const filename = path.basename(filePath);
  const tempFile = path.join(dir, `temp_${filename}`);

  try {
    // Escape double quotes in title for shell command
    const escapedTitle = title.replace(/"/g, '\\"');

    // Use ffmpeg to update metadata
    const command = `ffmpeg -i "${filePath}" -c copy -metadata title="${escapedTitle}" "${tempFile}" -y 2>&1`;

    await execAsync(command);

    // Replace original file with updated one
    fs.unlinkSync(filePath);
    fs.renameSync(tempFile, filePath);

    return true;
  } catch (error) {
    console.error(`\n[ERROR] Failed updating ${filename}:`);
    console.error(`  Title attempted: "${title}"`);
    console.error(`  Error: ${error.message}\n`);

    // Clean up temp file if it exists
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
    return false;
  }
}

// Main function
async function main() {
  const useGitOnly = process.argv.includes("--git-only");

  console.log("MP3 Metadata Updater");
  console.log(`Audio directory: ${AUDIO_DIR}`);
  console.log(`Mode: ${useGitOnly ? "Git changes only" : "All files"}\n`);

  // Check if ffmpeg and ffprobe are available
  try {
    await execAsync("ffmpeg -version 2>&1");
  } catch (error) {
    console.error("Error: ffmpeg is not installed or not in PATH");
    console.error("Please install ffmpeg:");
    console.error("  macOS: brew install ffmpeg");
    console.error("  Linux: sudo apt-get install ffmpeg");
    console.error("  Windows: Download from https://ffmpeg.org/download.html");
    process.exit(1);
  }

  const languagesData = loadLanguagesData();

  // Get files based on mode
  const mp3Files = useGitOnly
    ? await getChangedMp3Files(AUDIO_DIR)
    : getAllMp3Files(AUDIO_DIR);

  if (mp3Files.length === 0) {
    console.log(
      useGitOnly
        ? `No changed MP3 files found in git working directory`
        : `No MP3 files found in ${AUDIO_DIR}`
    );
    return;
  }

  console.log(`Found ${mp3Files.length} MP3 file(s) to process\n`);

  let updated = 0;
  let skipped = 0;

  for (const file of mp3Files) {
    const iso = file.iso.toLowerCase();

    if (languagesData[iso]) {
      const lang = languagesData[iso];
      const expectedTitle = file.isBas
        ? `${lang.name} - ${iso} - ${lang.group} - luka with bas`
        : file.isLuka
        ? `${lang.name} - ${iso} - ${lang.group} - luka`
        : `${lang.name} - ${iso} - ${lang.group} - original`;

      console.log(
        `Processing: ${file.filename}, ISO code: ${iso}${
          file.isBas
            ? " (luka with bas variant)"
            : file.isLuka
            ? " (luka variant)"
            : ""
        }`
      );

      const success = await updateMp3Metadata(file.fullPath, expectedTitle);

      if (success) {
        console.log(`  ✓ Updated successfully`);
        updated++;
      } else {
        console.log(`  ✗ Failed to update\n`);
        skipped++;
      }
    } else {
      console.log(`Skipping: ${file.filename}`);
      console.log(`  Reason: ISO code '${iso}' not found in language data\n`);
      skipped++;
    }
  }

  console.log("─".repeat(50));
  console.log(`Summary:`);
  console.log(`  Updated: ${updated}`);
  console.log(`  Skipped (errors/missing data): ${skipped}`);
  console.log(`  Total: ${mp3Files.length}`);
}

// Run the script
main().catch((error) => {
  console.error("\n[FATAL ERROR]:", error.message);
  console.error("Stack trace:", error.stack);
  process.exit(1);
});
