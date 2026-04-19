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

function addMissingToAll() {
  const model = readJson(modelFile);
  const modelKeys = getAllKeys(model);
  const files = getAllFiles().filter((f) => f !== modelFile);
  let changed = false;
  for (const file of files) {
    const json = readJson(file);
    const keys = getAllKeys(json);
    const missing = modelKeys.filter((k) => !keys.includes(k));
    if (missing.length) {
      missing.forEach((k) => {
        setValueByKey(json, k, getValueByKey(model, k));
      });
      fs.writeFileSync(
        path.join(dir, file),
        JSON.stringify(json, null, 2) + "\n",
      );
      console.log(`Added ${missing.length} missing keys to ${file}`);
      changed = true;
    }
  }
  if (!changed) {
    console.log("No missing keys to add. All files are up to date.");
  }
}

const args = process.argv.slice(2);
if (args.includes("--add-missing")) {
  addMissingToAll();
} else if (args.includes("--all")) {
  compareAll();
} else {
  const ok = compareSingle(defaultCompareFile, true);
  if (!ok) {
    console.log("No discrepancies found in", defaultCompareFile);
  }
}
