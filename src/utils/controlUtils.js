import controlsConfig from "../config/controls.json";
import { advancedConfigGroups } from "../modules/configStore";

export const deriveMin = (value) => Math.abs(value / 5) - 1;

export const deriveMax = (value) => Math.abs(value * 5) + 1;

export const deriveStep = (value) => {
  const abs = Math.abs(value);
  const str = String(abs);
  const decimalIndex = str.indexOf(".");
  const decimalPlaces = decimalIndex === -1 ? 0 : str.length - decimalIndex - 1;
  if (decimalPlaces >= 2) return 0.01;
  if (decimalPlaces === 1) return 0.1;
  return 1;
};

// Finds the group name in controlsConfig that contains a given controlKey
const findControlGroup = (controlKey) =>
  Object.keys(controlsConfig).find(
    (group) => controlKey in controlsConfig[group],
  );

// Returns { min, max } for a controlKey (from controls.json)
// or an advancedKey (dot-notation, bounds derived from default value)
export const resolveControlBounds = (controlKey, advancedKey) => {
  if (controlKey) {
    const group = findControlGroup(controlKey);
    if (!group) return { min: -Infinity, max: Infinity };
    const entry = controlsConfig[group][controlKey];
    return { min: entry.min, max: entry.max };
  }

  if (advancedKey) {
    const groupName = advancedKey.slice(0, advancedKey.indexOf("."));
    const group = advancedConfigGroups[groupName];
    if (!group) return { min: -Infinity, max: Infinity };
    const entry = group.find(([dotKey]) => dotKey === advancedKey);
    if (!entry) return { min: -Infinity, max: Infinity };
    const staticDefault = entry[2];
    return { min: deriveMin(staticDefault), max: deriveMax(staticDefault) };
  }

  return { min: -Infinity, max: Infinity };
};
