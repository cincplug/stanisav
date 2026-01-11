/**
 * Linguistic Filters Utility
 * Functions for filtering languages by typological features
 */

// Get unique values for a linguistic feature across all languages
export const getFeatureValues = (data, feature) => {
  if (!data) {
    return [];
  }

  // Special handling for group filter
  if (feature === "group") {
    if (!data.languageGroups) {
      return [];
    }
    const values = new Set(Object.values(data.languageGroups));
    return Array.from(values).sort();
  }

  // Handle typological features
  if (!data.typologicalFeatures) {
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

// Filter languages by multiple linguistic criteria (OR logic within features, AND logic between features)
export const filterLanguagesByFeatures = (data, filters) => {
  if (!data?.languageData) {
    return [];
  }

  const results = [];
  const languageCodes = Object.keys(data.languageData);

  languageCodes.forEach((code) => {
    const matchesFilters = Object.entries(filters).every(
      ([feature, values]) => {
        if (!values || !Array.isArray(values) || values.length === 0) {
          return true;
        }

        // Special handling for group filter
        if (feature === "group") {
          const languageGroup = data.languageGroups?.[code];
          return values.includes(languageGroup);
        }

        // Handle typological features
        const features = data.typologicalFeatures?.[code];
        if (!features) {
          return false;
        }

        const featureValue = features[feature];
        if (typeof featureValue === "number") {
          return values.map(Number).includes(featureValue);
        }
        return values.includes(featureValue);
      }
    );

    if (matchesFilters && data.languageData[code]) {
      const groupKey = data.languageGroups?.[code];
      const groupInfo = data.groupInfo?.[groupKey];

      results.push({
        code,
        name: data.languageData[code].name,
        groupName: groupInfo?.name || groupKey || "Unknown",
        groupKey,
        features: data.typologicalFeatures?.[code] || {},
      });
    }
  });

  return results.sort((a, b) => a.name.localeCompare(b.name));
};
