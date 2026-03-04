import lineages from "../config/lineages.json";

const getFamily = (lineageKey) => {
  const lineage = lineages[lineageKey];
  if (!Array.isArray(lineage)) {
    throw new Error(`Missing lineage for '${lineageKey}' in lineages.json`);
  }
  return lineage.length > 0 ? lineage[0] : lineageKey;
};

// Get unique values for a linguistic feature across all languages
export const getFeatureValues = (data, feature) => {
  if (!data) return [];

  if (feature === "family") {
    if (!data.languageLineages) return [];
    const families = new Set();

    Object.values(data.languageLineages).forEach((lineageKey) => {
      families.add(getFamily(lineageKey));
    });

    return Array.from(families).sort((a, b) => a.localeCompare(b));
  }

  if (!data.typologicalFeatures) return [];

  const values = new Set();
  Object.values(data.typologicalFeatures).forEach((lang) => {
    if (lang[feature] !== undefined && lang[feature] !== null) {
      values.add(lang[feature]);
    }
  });

  return Array.from(values).sort((a, b) => String(a).localeCompare(String(b)));
};

// Filter languages by multiple linguistic criteria
export const filterLanguagesByFeatures = (data, filters) => {
  if (!data?.languageData) return [];

  const results = [];
  const languageCodes = Object.keys(data.languageData);

  languageCodes.forEach((code) => {
    const matchesFilters = Object.entries(filters).every(
      ([feature, values]) => {
        if (!Array.isArray(values) || values.length === 0) return true;

        if (feature === "family") {
          const lineageKey = data.languageLineages?.[code];
          return values.includes(getFamily(lineageKey));
        }

        const features = data.typologicalFeatures?.[code];
        if (!features) return false;

        const featureValue = features[feature];
        if (typeof featureValue === "number") {
          return values.map(Number).includes(featureValue);
        }
        return values.includes(featureValue);
      },
    );

    if (matchesFilters) {
      const lineageKey = data.languageLineages?.[code];

      results.push({
        code,
        name: data.languageData[code].name,
        groupName: lineageKey,
        groupKey: lineageKey,
        features: data.typologicalFeatures?.[code] || {},
      });
    }
  });

  return results.sort((a, b) => a.name.localeCompare(b.name));
};
