// Usage: node scripts/i18n-batch-replace.js keyPath values.json
// values.json: { "nld": "translation", "deu": "translation", ... }
// keyPath: e.g. controls.isMenuExpanded.label

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.argv.length < 4) {
  console.error(
    "Usage: node scripts/i18n-batch-replace.js keyPath values.json",
  );
  process.exit(1);
}

const keyPath = process.argv[2];
const valuesFile = process.argv[3];
const values = JSON.parse(fs.readFileSync(valuesFile, "utf8"));
const dir = path.join(__dirname, "../src/i18n/messages");

function setValueByKey(obj, key, value) {
  const parts = key.split(".");
  let o = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (
      !(parts[i] in o) ||
      typeof o[parts[i]] !== "object" ||
      Array.isArray(o[parts[i]])
    ) {
      o[parts[i]] = {};
    }
    o = o[parts[i]];
  }
  o[parts[parts.length - 1]] = value;
}

for (const [locale, translation] of Object.entries(values)) {
  const file = path.join(dir, `${locale}.json`);
  if (!fs.existsSync(file)) {
    console.warn(`File not found: ${file}`);
    continue;
  }
  const json = JSON.parse(fs.readFileSync(file, "utf8"));
  setValueByKey(json, keyPath, translation);
  fs.writeFileSync(file, JSON.stringify(json, null, 2) + "\n");
  console.log(`Updated ${locale}: ${keyPath} = ${translation}`);
}
