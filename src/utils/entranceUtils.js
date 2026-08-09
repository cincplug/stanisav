// Picks the recognized shape-property keys present on an entrance step,
// so overrides never leak the "message" or "language" keys.
export const extractPropertyOverrides = (step, propertyNames) => {
  const overrides = {};
  propertyNames.forEach((propertyName) => {
    if (step[propertyName] !== undefined) {
      overrides[propertyName] = step[propertyName];
    }
  });
  return overrides;
};

export const hasPropertyOverrides = (overrides) =>
  Object.keys(overrides).length > 0;

// Merges a language's full property set with the current step's overrides,
// letting the overrides win when both define the same key.
export const resolveLinguisticProperties = (baseProperties, overrides) => ({
  ...baseProperties,
  ...overrides,
});
