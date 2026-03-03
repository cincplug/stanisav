#!/usr/bin/env node

/* eslint-env node */

import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import { fileURLToPath } from "url";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FFMPEG_PATH = ffmpegInstaller.path;
const LANGUAGES_JSON = path.join(process.cwd(), "src/config/languages.json");

// Load the languages JSON file
export function loadLanguagesData() {
  if (!fs.existsSync(LANGUAGES_JSON)) {
    console.error(`Error: Language data file not found at ${LANGUAGES_JSON}`);
    return null;
  }

  try {
    const jsonData = fs.readFileSync(LANGUAGES_JSON, "utf8");
    return JSON.parse(jsonData);
  } catch (error) {
    console.error(
      `[ERROR] Failed to parse languages.json at ${LANGUAGES_JSON}`,
    );
    console.error(`Error: ${error.message}`);
    return null;
  }
}

// Update MP3 metadata using ffmpeg
export async function updateMp3Metadata(filePath, title) {
  const dir = path.dirname(filePath);
  const filename = path.basename(filePath);
  const tempFile = path.join(dir, `temp_metadata_${filename}`);

  try {
    // Escape double quotes in title for shell command
    const escapedTitle = title.replace(/"/g, '\\"');

    // Use ffmpeg to update metadata
    const command = `"${FFMPEG_PATH}" -i "${filePath}" -c copy -metadata title="${escapedTitle}" "${tempFile}" -y 2>&1`;

    await execAsync(command);

    // Replace original file with updated one
    fs.unlinkSync(filePath);
    fs.renameSync(tempFile, filePath);

    return { success: true };
  } catch (error) {
    // Clean up temp file if it exists
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
    return { success: false, error: error.message };
  }
}

// Get metadata title for a file
export function getMetadataTitle(filename, languagesData) {
  const basename = path.basename(filename, ".mp3");

  // Only process -luka.mp3 files (not -luka-bas.mp3)
  if (!basename.endsWith("-luka")) {
    return null;
  }

  const iso = basename.replace("-luka", "").toLowerCase();

  if (!languagesData[iso]) {
    return null;
  }

  const lang = languagesData[iso];
  return `${lang.name} - ${iso} - luka`;
}
