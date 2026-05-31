import { advancedConfigGroups } from "../modules/configStore";

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
      min: deriveMin(staticDefault),
      max: deriveMax(staticDefault),
    })),
  }));
