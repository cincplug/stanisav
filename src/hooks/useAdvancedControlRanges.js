import { advancedConfigGroups } from "../modules/configStore";

const deriveStep = (value) => {
  const abs = Math.abs(value);
  if (abs === 0) return 0.01;

  const magnitude = Math.pow(10, Math.floor(Math.log10(abs)));
  const str = String(value);
  const decimalIndex = str.indexOf(".");
  const decimalPlaces = decimalIndex === -1 ? 0 : str.length - decimalIndex - 1;

  if (decimalPlaces >= 2) return magnitude * 0.001;
  if (decimalPlaces === 1) return magnitude * 0.01;
  return magnitude * 0.1;
};

const deriveMin = (value) => {
  if (value < 0) return value * 10;
  if (value === 0) return -1;
  return value / 10;
};

const deriveMax = (value) => {
  if (value === 0) return 1;
  if (value < 0) return value / 10;
  return value * 10;
};

// Returns advancedConfigGroups with min, max, step derived per entry
export const useAdvancedControlRanges = () =>
  Object.entries(advancedConfigGroups).map(([groupName, entries]) => ({
    groupName,
    entries: entries.map(([dotKey, label, staticDefault]) => ({
      dotKey,
      label,
      staticDefault,
      step: deriveStep(staticDefault),
      min: deriveMin(staticDefault),
      max: deriveMax(staticDefault),
    })),
  }));