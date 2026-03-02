import fs from "fs";
import path from "path";
import { promisify } from "util";
import { exec } from "child_process";

const execAsync = promisify(exec);

export async function getChangedMp3Files(audioDir) {
  if (!fs.existsSync(audioDir)) {
    console.error(`Error: Audio directory not found at ${audioDir}`);
    process.exit(1);
  }

  try {
    await execAsync(`git rev-parse --is-inside-work-tree`);
    const { stdout: diffOutput } = await execAsync(`git diff --name-only HEAD`);
    const { stdout: untrackedOutput } = await execAsync(
      `git ls-files --others --exclude-standard`,
    );
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
