import { advancedConfigGroups } from "../modules/configStore";

const deriveMin = (value) => {
  return value / 5;
};

const deriveMax = (value) => {
  return value * 5;
};

const deriveStep = (value) => {
  if (value.endsWith("Int")) {
    console.log(value.endsWith("Int"));
    return 1;
  }
  return 0.1;
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
      step: deriveStep(dotKey),
    })),
  }));
