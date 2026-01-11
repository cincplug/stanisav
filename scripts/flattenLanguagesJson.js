// Script to flatten languages.json structure by moving typology properties to top level
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const languagesPath = path.join(
  __dirname,
  "..",
  "src",
  "config",
  "languages.json"
);

// Read the current languages.json
const languagesData = JSON.parse(fs.readFileSync(languagesPath, "utf8"));

// Flatten the structure
const flattenedData = {};

for (const [code, langData] of Object.entries(languagesData)) {
  const { typology, ...rest } = langData;

  flattenedData[code] = {
    ...rest,
    ...(typology || {}),
  };
}

// Write back to languages.json with nice formatting
fs.writeFileSync(languagesPath, JSON.stringify(flattenedData, null, 2), "utf8");

console.log("✅ Successfully flattened languages.json");
console.log(
  `   Processed ${Object.keys(flattenedData).length} language entries`
);
