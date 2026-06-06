import { advancedConfigGroups } from "../modules/configStore";
import { deriveMax, deriveMin, deriveStep } from "../utils/controlUtils";

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
