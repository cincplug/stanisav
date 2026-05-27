import staticConfig from "../config/config.json";

export const config = { ...staticConfig };

const flattenNumericEntries = (obj, prefix = "") =>
  Object.entries(obj).flatMap(([key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "number") return [[fullKey, value]];
    if (typeof value === "object" && value !== null && !Array.isArray(value))
      return flattenNumericEntries(value, fullKey);
    return [];
  });

export const advancedConfigEntries = flattenNumericEntries(staticConfig);

export const advancedConfigGroups = advancedConfigEntries.reduce(
  (groups, [dotKey, value]) => {
    const firstDot = dotKey.indexOf(".");
    const isTopLevel = firstDot === -1;
    const groupName = isTopLevel ? "" : dotKey.slice(0, firstDot);
    const label = isTopLevel ? dotKey : dotKey.slice(firstDot + 1);
    if (!groups[groupName]) groups[groupName] = [];
    groups[groupName].push([dotKey, label, value]);
    return groups;
  },
  {},
);

export const applyAdvancedOverrides = (overrides) => {
  Object.entries(overrides).forEach(([dotKey, value]) => {
    const parts = dotKey.split(".");
    let target = config;
    for (let i = 0; i < parts.length - 1; i++) {
      target = target[parts[i]];
    }
    target[parts[parts.length - 1]] = value;
  });
};
