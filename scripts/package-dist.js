import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const projectRoot = process.cwd();
const distDir = path.join(projectRoot, "dist");
const archivePath = path.join(projectRoot, "dist.zip");

if (!fs.existsSync(distDir)) {
  console.error("dist directory not found. Run npm run build first.");
  process.exit(1);
}

if (fs.existsSync(archivePath)) {
  fs.unlinkSync(archivePath);
}

const result = spawnSync(
  "zip",
  ["-r", "-X", archivePath, ".", "-x", "*.DS_Store", "*__MACOSX*"],
  {
    cwd: distDir,
    stdio: "inherit",
  },
);

if (result.error) {
  console.error(`Could not create dist.zip: ${result.error.message}`);
  process.exit(1);
}

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

console.log(`Created ${archivePath}`);
