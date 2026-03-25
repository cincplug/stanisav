
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dir = path.join(__dirname, '../src/i18n/messages');
const modelFile = 'eng.json';

function getAllFiles() {
  return fs.readdirSync(dir).filter(f => f.endsWith('.json'));
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
}

function getAllKeys(obj, prefix = '') {
  let keys = [];
  for (const k in obj) {
    const val = obj[k];
    const full = prefix ? `${prefix}.${k}` : k;
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      keys = keys.concat(getAllKeys(val, full));
    } else {
      keys.push(full);
    }
  }
  return keys;
}

function compareKeys(modelKeys, otherKeys) {
  const missing = modelKeys.filter(k => !otherKeys.includes(k));
  const extra = otherKeys.filter(k => !modelKeys.includes(k));
  return { missing, extra };
}

const model = readJson(modelFile);
const modelKeys = getAllKeys(model);

const files = getAllFiles().filter(f => f !== modelFile);

let hasDiscrepancy = false;

for (const file of files) {
  const json = readJson(file);
  const keys = getAllKeys(json);
  const { missing, extra } = compareKeys(modelKeys, keys);
  if (missing.length || extra.length) {
    hasDiscrepancy = true;
    console.log(`\n--- ${file} ---`);
    if (missing.length) {
      console.log('Missing keys:');
      missing.forEach(k => console.log('  ' + k));
    }
    if (extra.length) {
      console.log('Extra keys:');
      extra.forEach(k => console.log('  ' + k));
    }
  }
}

if (!hasDiscrepancy) {
  console.log('All files match the model structure.');
}
