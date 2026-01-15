#!/usr/bin/env node

/* eslint-env node */

import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import { fileURLToPath } from "url";
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
      ...untrackedOutput.split("\n").filter((file) => file.trim()),
    ];

    const changedFiles = allChangedFiles
      .filter((file) => {
        const fullPath = path.resolve(file);
        const audioDirPath = path.resolve(audioDir);
        const basename = path.basename(file, ".mp3");

        return (
          fullPath.startsWith(audioDirPath) &&
          file.toLowerCase().endsWith(".mp3") &&
          basename.endsWith("-luka") &&
          !basename.endsWith("-luka-bas")
        );
      })
      .map((file) => ({
        fullPath: path.resolve(file),
        filename: path.basename(file),
      }));

    return changedFiles;
  } catch (error) {
    console.error("[ERROR] Error checking git status:", error.message);
    process.exit(1);
  }
}

// Get all -luka.mp3 files (NOT -luka-bas.mp3)
function getAllMp3Files(audioDir) {
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

// Main function
async function main() {
  const args = process.argv.slice(2);
  const useGitOnly = args.includes("--git-only");

  console.log("MP3 Metadata Updater for -luka.mp3 files");
  console.log(`Audio directory: ${AUDIO_DIR}`);
  console.log(`Mode: ${useGitOnly ? "Git changes only" : "All files"}\n`);

  const languagesData = loadLanguagesData();

  if (!languagesData) {
    console.error("Failed to load language data. Exiting.");
    process.exit(1);
  }

  // Get files based on mode
  const mp3Files = useGitOnly
    ? await getChangedMp3Files(AUDIO_DIR)
    : getAllMp3Files(AUDIO_DIR);

  if (mp3Files.length === 0) {
    console.log(
      useGitOnly
        ? `No changed -luka.mp3 files found in git working directory`
        : `No -luka.mp3 files found in ${AUDIO_DIR}`
    );
    return;
  }

  console.log(`Found ${mp3Files.length} -luka.mp3 file(s) to process\n`);

  let updated = 0;
  let skipped = 0;

  for (const file of mp3Files) {
    const title = getMetadataTitle(file.filename, languagesData);

    if (!title) {
      console.log(`Skipping: ${file.filename}`);
      console.log(`  Reason: ISO code not found in language data\n`);
      skipped++;
      continue;
    }

    console.log(`Processing: ${file.filename}`);

    const result = await updateMp3Metadata(file.fullPath, title);

    if (result.success) {
      console.log(`  ✓ Updated successfully`);
      updated++;
    } else {
      console.log(`  ✗ Failed to update`);
      console.log(`  Error: ${result.error}\n`);
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
