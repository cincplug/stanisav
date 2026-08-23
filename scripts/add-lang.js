import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const i18nDir = path.resolve(__dirname, "../src/i18n");

const folders = ["messages", "language-names", "lineage-labels", "entrance"];

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Usage: node scripts/addLang.js <iso1> <iso2> ...");
  process.exit(1);
}

for (const iso of args) {
  for (const folder of folders) {
    const src = path.join(i18nDir, folder, "eng.json");
    const dest = path.join(i18nDir, folder, `${iso}.json`);
    if (!fs.existsSync(dest)) {
      fs.copyFileSync(src, dest);
      console.log(`Created ${folder}/${iso}.json`);
    } else {
      console.log(`Already exists: ${folder}/${iso}.json`);
    }
  }
}
