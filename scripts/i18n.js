// Usage:
//   node scripts/i18n.js              — compare eng.json vs nld.json, show missing/extra keys with English values
//   node scripts/i18n.js --all        — compare eng.json vs all locale files, show missing/extra keys
//   node scripts/i18n.js --fix        — sync all locale files to eng.json: add missing keys (English value as placeholder), remove extra keys, sort all keys alphabetically

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dir = path.join(__dirname, "../src/i18n/messages");
const modelFile = "eng.json";
const defaultCompareFile = "nld.json";

function getAllFiles() {
  return fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"));
}

function getAllKeys(obj, prefix = "") {
  let keys = [];
  for (const k in obj) {
    const val = obj[k];
    const full = prefix ? `${prefix}.${k}` : k;
    if (val && typeof val === "object" && !Array.isArray(val)) {
      keys = keys.concat(getAllKeys(val, full));
    } else {
      keys.push(full);
    }
  }
  return keys;
}

function getValueByKey(obj, key) {
  return key.split(".").reduce((o, k) => (o && k in o ? o[k] : undefined), obj);
}

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

function deleteValueByKey(obj, key) {
  const parts = key.split(".");
  const ancestors = [obj];
  let o = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!o || typeof o[parts[i]] !== "object") return;
    o = o[parts[i]];
    ancestors.push(o);
  }
  delete o[parts[parts.length - 1]];

  // Walk back up and remove any parent that became an empty object
  for (let i = parts.length - 2; i >= 0; i--) {
    const parent = ancestors[i];
    if (Object.keys(parent[parts[i]]).length === 0) {
      delete parent[parts[i]];
    } else {
      break;
    }
  }
}

function sortKeysDeep(obj) {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return obj;
  return Object.keys(obj)
    .sort((a, b) => a.localeCompare(b))
    .reduce((sorted, key) => {
      sorted[key] = sortKeysDeep(obj[key]);
      return sorted;
    }, {});
}

function compareSingle(compareFile, logEnglish = true) {
  const model = readJson(modelFile);
  const compare = readJson(compareFile);
  const modelKeys = getAllKeys(model);
  const compareKeys = getAllKeys(compare);
  const missing = modelKeys.filter((k) => !compareKeys.includes(k));
  const extra = compareKeys.filter((k) => !modelKeys.includes(k));
  let hasDiscrepancy = false;
  if (missing.length || extra.length) {
    hasDiscrepancy = true;
    console.log(`\n--- ${compareFile} ---`);
    if (missing.length) {
      console.log("Missing keys:");
      missing.forEach((k) => {
        if (logEnglish) {
          const val = getValueByKey(model, k);
          console.log(`  ${k}:`, JSON.stringify(val));
        } else {
          console.log("  " + k);
        }
      });
    }
    if (extra.length) {
      console.log("Extra keys:");
      extra.forEach((k) => console.log("  " + k));
    }
  }
  return hasDiscrepancy;
}

function compareAll() {
  const model = readJson(modelFile);
  const modelKeys = getAllKeys(model);
  const files = getAllFiles().filter((f) => f !== modelFile);
  let hasDiscrepancy = false;
  for (const file of files) {
    const json = readJson(file);
    const keys = getAllKeys(json);
    const missing = modelKeys.filter((k) => !keys.includes(k));
    const extra = keys.filter((k) => !modelKeys.includes(k));
    if (missing.length || extra.length) {
      hasDiscrepancy = true;
      console.log(`\n--- ${file} ---`);
      if (missing.length) {
        console.log("Missing keys:");
        missing.forEach((k) => console.log("  " + k));
      }
      if (extra.length) {
        console.log("Extra keys:");
        extra.forEach((k) => console.log("  " + k));
      }
    }
  }
  if (!hasDiscrepancy) {
    console.log("All files match the model structure.");
  }
}

function fixAll() {
  const model = readJson(modelFile);
  const modelKeys = getAllKeys(model);
  const files = getAllFiles().filter((f) => f !== modelFile);
  let anyChanged = false;

  for (const file of files) {
    let json = readJson(file);
    const keys = getAllKeys(json);
    const missing = modelKeys.filter((k) => !keys.includes(k));
    const extra = keys.filter((k) => !modelKeys.includes(k));

    if (!missing.length && !extra.length) continue;

    anyChanged = true;
    console.log(`\n--- ${file} ---`);

    if (missing.length) {
      missing.forEach((k) => {
        setValueByKey(json, k, getValueByKey(model, k));
      });
      console.log(
        `  Added ${missing.length} missing key(s): ${missing.join(", ")}`,
      );
    }

    if (extra.length) {
      extra.forEach((k) => deleteValueByKey(json, k));
      console.log(
        `  Removed ${extra.length} extra key(s): ${extra.join(", ")}`,
      );
    }

    json = sortKeysDeep(json);

    fs.writeFileSync(
      path.join(dir, file),
      JSON.stringify(json, null, 2) + "\n",
    );
  }

  if (!anyChanged) {
    console.log(
      "All files are already in sync with the model. Nothing to fix.",
    );
  }
}

const args = process.argv.slice(2);
if (args.includes("--fix")) {
  fixAll();
} else if (args.includes("--all")) {
  compareAll();
} else {
  const ok = compareSingle(defaultCompareFile, true);
  if (!ok) {
    console.log("No discrepancies found in", defaultCompareFile);
  }
}
