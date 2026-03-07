import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const i18nDir = path.resolve(__dirname, "../src/i18n");
const runtimePath = path.join(i18nDir, "runtime.js");

const files = [
  { folder: "messages", name: "eng.json" },
  { folder: "language-names", name: "eng.json" },
  { folder: "lineage-labels", name: "eng.json" },
];

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Usage: node scripts/addLang.js <iso1> <iso2> ...");
  process.exit(1);
}

for (const iso of args) {
  for (const { folder, name } of files) {
    const src = path.join(i18nDir, folder, name);
    const dest = path.join(i18nDir, folder, `${iso}.json`);
    if (!fs.existsSync(dest)) {
      fs.copyFileSync(src, dest);
      console.log(`Copied ${src} -> ${dest}`);
    } else {
      console.log(`File already exists: ${dest}`);
    }
  }
}

let runtime = fs.readFileSync(runtimePath, "utf8");

for (const iso of args) {
  const isoCap = iso.charAt(0).toUpperCase() + iso.slice(1);

  // Add imports if missing
  const msgImport = `import ${iso} from "./messages/${iso}.json";`;
  if (!runtime.includes(msgImport)) {
    runtime = runtime.replace(
      /import srp from "\.\/messages\/srp\.json";/,
      (match) => `${match}\n${msgImport}`,
    );
  }
  const langImport = `import languageNames${isoCap} from "./language-names/${iso}.json";`;
  if (!runtime.includes(langImport)) {
    runtime = runtime.replace(
      /import languageNamesSrp from "\.\/language-names\/srp\.json";/,
      (match) => `${match}\n${langImport}`,
    );
  }
  const linImport = `import lineageLabels${isoCap} from "./lineage-labels/${iso}.json";`;
  if (!runtime.includes(linImport)) {
    runtime = runtime.replace(
      /import lineageLabelsSrp from "\.\/lineage-labels\/srp\.json";/,
      (match) => `${match}\n${linImport}`,
    );
  }

  // Add entries to constants if missing
  // messagesByLocale
  const msgEntry = `  ${iso},`;
  if (!runtime.includes(msgEntry)) {
    runtime = runtime.replace(
      /const messagesByLocale = \{\s*([^}]+)\}/m,
      (match, entries) => {
        // Insert before closing }
        return match.replace(/\n\}/, `\n${msgEntry}\n}`);
      },
    );
  }

  // languageNamesByLocale
  const langEntry = `  ${iso}: languageNames${isoCap},`;
  if (!runtime.includes(langEntry)) {
    runtime = runtime.replace(
      /const languageNamesByLocale = \{\s*([^}]+)\}/m,
      (match, entries) => {
        return match.replace(/\n\}/, `\n${langEntry}\n}`);
      },
    );
  }

  // lineageLabelsByLocale
  const linEntry = `  ${iso}: lineageLabels${isoCap},`;
  if (!runtime.includes(linEntry)) {
    runtime = runtime.replace(
      /const lineageLabelsByLocale = \{\s*([^}]+)\}/m,
      (match, entries) => {
        return match.replace(/\n\}/, `\n${linEntry}\n}`);
      },
    );
  }
}

fs.writeFileSync(runtimePath, runtime);
console.log("Updated runtime.js");
