/**
 * Linguistic Filters Utility
 * Functions for filtering languages by typological features
 */

// Get unique values for a linguistic feature across all languages
export const getFeatureValues = (data, feature) => {
  if (!data?.typologicalFeatures) {
    return [];
  }

  const values = new Set();
  Object.values(data.typologicalFeatures).forEach((lang) => {
    if (lang[feature]) {
      values.add(lang[feature]);
    }
  });

  return Array.from(values).sort();
};

// Get all available linguistic features
export const getLinguisticFeatures = () => [
  { key: "tonality", label: "Tonality" },
  { key: "morphology", label: "Morphology" },
  { key: "wordOrderFlexibility", label: "Word Order" }
];

// Filter languages by multiple linguistic criteria (OR logic within features, AND logic between features)
export const filterLanguagesByFeatures = (data, filters) => {
  if (!data?.typologicalFeatures || !data?.languageData) {
    return [];
  }

  const results = [];

  Object.entries(data.typologicalFeatures).forEach(([code, features]) => {
    const matchesFilters = Object.entries(filters).every(
      ([feature, values]) => {
        if (!values || !Array.isArray(values) || values.length === 0) {
          return true;
        }
        return values.includes(features[feature]);
      }
    );

    if (matchesFilters && data.languageData[code]) {
      const groupKey = data.languageGroups?.[code];
      const groupInfo = data.groupInfo?.[groupKey];

      results.push({
        code,
        name: data.languageData[code].name, // Access the name property
        groupName: groupInfo?.name || "Unknown",
        groupKey,
        features
      });
    }
  });

  return results.sort((a, b) => a.name.localeCompare(b.name));
};
