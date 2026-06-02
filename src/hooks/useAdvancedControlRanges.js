import { advancedConfigGroups } from "../modules/configStore";

const deriveMin = (value) => {
  return Math.abs(value / 5) - 1;
};

const deriveMax = (value) => {
  return Math.abs(value * 5) + 1;
};

const deriveStep = (value) => {
  const abs = Math.abs(value);
  const str = String(abs);
  const decimalIndex = str.indexOf(".");
  const decimalPlaces = decimalIndex === -1 ? 0 : str.length - decimalIndex - 1;
  if (decimalPlaces >= 2) return 0.01;
  if (decimalPlaces === 1) return 0.1;
  return 1;
};

// Returns advancedConfigGroups with min, max, step derived per entry
export const useAdvancedControlRanges = () =>
  Object.entries(advancedConfigGroups).map(([groupName, entries]) => ({
    groupName,
    entries: entries.map(([dotKey, label, staticDefault]) => ({
      dotKey,
      label,
      staticDefault,
      min: deriveMin(staticDefault),
      max: deriveMax(staticDefault),
      step: deriveStep(staticDefault),
    })),
  }));
