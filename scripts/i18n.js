import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Usage:
//   node scripts/i18n.js                          — compare eng.json vs nld.json, show missing/extra keys with English values
//   node scripts/i18n.js --all                    — compare eng.json vs all locale files, show missing/extra keys
//   node scripts/i18n.js --fix                    — sync all locale files to eng.json: add missing keys (English value as placeholder), remove extra keys, sort all keys alphabetically
//   node scripts/i18n.js --fix --translate KEY    — same as --fix but auto-translates missing keys via DeepL
//   node scripts/i18n.js --cleanup                — remove extra keys from all locale files (without adding missing ones)
//   node scripts/i18n.js --prompt                 — generate prompt.txt for an AI model to translate missing keys
//   node scripts/i18n.js --apply translations.json — apply AI-returned translations JSON to locale files

const dir = path.join(__dirname, "../src/i18n/messages");
const modelFile = "eng.json";
const defaultCompareFile = "nld.json";

const deeplLocaleMap = {
  afr: "AF",
  ara: "AR",
  bul: "BG",
  ces: "CS",
  dan: "DA",
  deu: "DE",
  ell: "EL",
  est: "ET",
  fin: "FI",
  fra: "FR",
  hun: "HU",
  ind: "ID",
  ita: "IT",
  jpn: "JA",
  kor: "KO",
  lav: "LV",
  lit: "LT",
  nld: "NL",
  nob: "NB",
  pol: "PL",
  por: "PT-PT",
  ron: "RO",
  rus: "RU",
  slk: "SK",
  slv: "SL",
  spa: "ES",
  swe: "SV",
  tur: "TR",
  ukr: "UK",
  zho: "ZH",
};

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

async function translateBatch(texts, targetLang, apiKey) {
  const params = new URLSearchParams();
  params.append("auth_key", apiKey);
  params.append("target_lang", targetLang);
  texts.forEach((t) => params.append("text", t));

  const response = await fetch("https://api-free.deepl.com/v2/translate", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!response.ok) {
    throw new Error(
      `DeepL responded with ${response.status}: ${await response.text()}`,
    );
  }

  const data = await response.json();
  return data.translations.map((t) => t.text || null);
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
    console.log("All files are already in sync with the model.");
  }
}

async function fixAll(apiKey = null) {
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
      const locale = file.replace(".json", "");
      const deeplTarget = apiKey ? deeplLocaleMap[locale] : null;
      const stringKeys = missing.filter(
        (k) => typeof getValueByKey(model, k) === "string",
      );
      const nonStringKeys = missing.filter(
        (k) => typeof getValueByKey(model, k) !== "string",
      );
      let translations = {};

      if (apiKey && deeplTarget && stringKeys.length) {
        console.log(
          `  Requesting ${stringKeys.length} translation(s) from DeepL for ${deeplTarget}...`,
        );
        try {
          const englishValues = stringKeys.map((k) => getValueByKey(model, k));
          const results = await translateBatch(
            englishValues,
            deeplTarget,
            apiKey,
          );
          stringKeys.forEach((k, i) => {
            translations[k] = results[i] || "TRANSLATION NOT FOUND";
          });
        } catch (err) {
          console.warn(`  DeepL request failed: ${err.message}`);
          console.warn(
            `  Falling back to TRANSLATION NOT FOUND for all missing string keys.`,
          );
          stringKeys.forEach((k) => {
            translations[k] = "TRANSLATION NOT FOUND";
          });
        }
      } else if (apiKey && !deeplTarget) {
        console.warn(
          `  No DeepL language code mapped for locale '${locale}', skipping translation.`,
        );
      }

      missing.forEach((k) => {
        const englishValue = getValueByKey(model, k);
        if (typeof englishValue === "string") {
          setValueByKey(
            json,
            k,
            translations[k] ??
              (apiKey ? "TRANSLATION NOT FOUND" : englishValue),
          );
        } else {
          setValueByKey(json, k, englishValue);
        }
      });

      const addedNote = deeplTarget && apiKey ? " (translated)" : "";
      console.log(
        `  Added ${stringKeys.length} string key(s)${addedNote}: ${stringKeys.join(", ")}`,
      );
      if (nonStringKeys.length) {
        console.log(
          `  Added ${nonStringKeys.length} structural key(s): ${nonStringKeys.join(", ")}`,
        );
      }
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

function cleanupAll() {
  const model = readJson(modelFile);
  const modelKeys = getAllKeys(model);
  const files = getAllFiles().filter((f) => f !== modelFile);
  let anyChanged = false;

  for (const file of files) {
    let json = readJson(file);
    const keys = getAllKeys(json);
    const extra = keys.filter((k) => !modelKeys.includes(k));

    if (!extra.length) continue;

    anyChanged = true;
    extra.forEach((k) => deleteValueByKey(json, k));
    json = sortKeysDeep(json);
    fs.writeFileSync(
      path.join(dir, file),
      JSON.stringify(json, null, 2) + "\n",
    );
    console.log(`\n--- ${file} ---`);
    console.log(`  Removed ${extra.length} extra key(s): ${extra.join(", ")}`);
  }

  if (!anyChanged) {
    console.log("No extra keys found. All files are clean.");
  }
}

function generatePrompt() {
  const model = readJson(modelFile);
  const files = getAllFiles().filter((f) => f !== modelFile);

  // Collect per-locale missing string keys
  // Structure: { "keyPath": { englishValue, locales: ["nld", "deu", ...] } }
  const missingByKey = {};

  for (const file of files) {
    const locale = file.replace(".json", "");
    const json = readJson(file);
    const modelKeys = getAllKeys(model);
    const existingKeys = getAllKeys(json);
    const missing = modelKeys
      .filter((k) => !existingKeys.includes(k))
      .filter((k) => typeof getValueByKey(model, k) === "string");

    for (const k of missing) {
      if (!missingByKey[k]) {
        missingByKey[k] = { english: getValueByKey(model, k), locales: [] };
      }
      missingByKey[k].locales.push(locale);
    }
  }

  if (!Object.keys(missingByKey).length) {
    console.log(
      "No missing string keys found across any locale. No prompt generated.",
    );
    return;
  }

  const keyLines = Object.entries(missingByKey)
    .map(
      ([k, { english, locales }]) =>
        `  "${k}": "${english}"  →  needed in: ${locales.join(", ")}`,
    )
    .join("\n");

  // Build the expected output shape for the AI
  const exampleOutput = {};
  for (const [k, { locales }] of Object.entries(missingByKey)) {
    for (const locale of locales) {
      if (!exampleOutput[locale]) exampleOutput[locale] = {};
      exampleOutput[locale][k] = `<translation>`;
    }
  }

  const prompt = `\
You are a professional translator. Translate the following UI strings from English into the specified languages.

MISSING TRANSLATIONS
====================
${keyLines}

Keys use dot notation (e.g. "controls.tongueSize.label"). These are short UI labels, control names,
or brief descriptions from a language-learning visualization app. Keep translations concise and natural.
Do not translate the key names themselves, only the values.

Note: srp locale should be in Latin script

LOCALES
=======
Use ISO 639-3 codes as locale identifiers. The locales involved are:
${[...new Set(Object.values(missingByKey).flatMap((v) => v.locales))].sort().join(", ")}

RESPONSE FORMAT
===============
Return ONLY a JSON object. No explanation, no markdown, no code fences.
The structure must be:

{
  "<locale>": {
    "<key.path>": "<translated value>",
    ...
  },
  ...
}

Only include locale+key pairs listed above as needed. Example shape based on this request:

${JSON.stringify(exampleOutput, null, 2)}
`;

  const outPath = path.join(__dirname, "../prompt.txt");
  fs.writeFileSync(outPath, prompt, "utf8");
  console.log(`Prompt written to prompt.txt`);
  console.log(
    `${Object.keys(missingByKey).length} unique key(s) across ${[...new Set(Object.values(missingByKey).flatMap((v) => v.locales))].length} locale(s).`,
  );
}

function applyTranslations(translationsFile) {
  const resolved = path.resolve(translationsFile);
  if (!fs.existsSync(resolved)) {
    console.error(`File not found: ${resolved}`);
    process.exit(1);
  }

  let input;
  try {
    input = JSON.parse(fs.readFileSync(resolved, "utf8"));
  } catch (err) {
    console.error(`Failed to parse ${translationsFile}: ${err.message}`);
    process.exit(1);
  }

  const model = readJson(modelFile);
  const modelKeys = getAllKeys(model);
  let anyChanged = false;

  for (const [locale, keyMap] of Object.entries(input)) {
    const file = `${locale}.json`;
    const filePath = path.join(dir, file);

    if (!fs.existsSync(filePath)) {
      console.warn(`Locale file not found, skipping: ${file}`);
      continue;
    }

    let json = readJson(file);
    const applied = [];
    const skipped = [];

    for (const [keyPath, value] of Object.entries(keyMap)) {
      if (!modelKeys.includes(keyPath)) {
        skipped.push(`${keyPath} (not in eng.json)`);
        continue;
      }
      if (typeof value !== "string" || !value.trim()) {
        skipped.push(`${keyPath} (empty or non-string value)`);
        continue;
      }
      setValueByKey(json, keyPath, value);
      applied.push(keyPath);
    }

    if (applied.length) {
      anyChanged = true;
      json = sortKeysDeep(json);
      fs.writeFileSync(filePath, JSON.stringify(json, null, 2) + "\n");
      console.log(`\n--- ${file} ---`);
      console.log(
        `  Applied ${applied.length} translation(s): ${applied.join(", ")}`,
      );
    }
    if (skipped.length) {
      console.warn(`  Skipped ${skipped.length} key(s): ${skipped.join(", ")}`);
    }
  }

  if (!anyChanged) {
    console.log("No translations were applied.");
  }
}

const args = process.argv.slice(2);
const apiKeyArg = args.includes("--translate")
  ? args[args.indexOf("--translate") + 1]
  : null;
const applyFileArg = args.includes("--apply")
  ? args[args.indexOf("--apply") + 1]
  : null;

if (args.includes("--apply")) {
  if (!applyFileArg) {
    console.error(
      "--apply requires a file path, e.g. node scripts/i18n.js --apply translations.json",
    );
    process.exit(1);
  }
  applyTranslations(applyFileArg);
} else if (args.includes("--prompt")) {
  generatePrompt();
} else if (args.includes("--cleanup")) {
  cleanupAll();
} else if (args.includes("--fix")) {
  fixAll(apiKeyArg);
} else if (args.includes("--all")) {
  compareAll();
} else {
  const ok = compareSingle(defaultCompareFile, true);
  if (!ok) {
    console.log("No discrepancies found in", defaultCompareFile);
  }
}
