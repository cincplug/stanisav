import { getFeatureScore } from "./linguisticUtils.js";
import numericFeatures from "../config/numericFeatures.json";

export const calculateLanguageFilterStatus = (
  languages,
  typologicalFeatures,
  filteringUtils,
  languageGroups,
) => {
  if (Object.keys(filteringUtils).length === 0) {
    return languages.reduce((acc, langCode) => {
      acc[langCode] = { isVisible: true, isFiltered: false };
      return acc;
    }, {});
  }

  return languages.reduce((acc, langCode) => {
    const matchesFilters = Object.entries(filteringUtils).every(
      ([feature, values]) => {
        if (!values || !Array.isArray(values) || values.length === 0) {
          return true;
        }
        // Special handling for family filter
        if (feature === "family") {
          const languageGroup = languageGroups?.[langCode];
          const languageFamily =
            typologicalFeatures?._groupInfo?.[languageGroup]?.family;
          return values.includes(languageFamily);
        }
        // Special handling for group filter
        if (feature === "group") {
          const languageGroup = languageGroups?.[langCode];
          return values.includes(languageGroup);
        }

        // Handle typological features
        const features = typologicalFeatures?.[langCode];
        if (!features) {
          return false;
        }

        const featureValue = features[feature];
        if (typeof featureValue === "number") {
          return values.map(Number).includes(featureValue);
        }
        return values.includes(featureValue);
      },
    );

    acc[langCode] = { isVisible: matchesFilters, isFiltered: !matchesFilters };
    return acc;
  }, {});
};

const getSizeValue = (sortBy, data, languageCode) => {
  // If sorting by numeric typological features, use that value
  if (numericFeatures.includes(sortBy)) {
    return data?.typologicalFeatures?.[languageCode]?.[sortBy] || 1;
  }
  // If sorting by a typological feature with a score, use the score
  const featureValue = data?.typologicalFeatures?.[languageCode]?.[sortBy];
  const score = getFeatureScore(sortBy, featureValue);
  if (typeof score === "number" && !isNaN(score)) {
    return score;
  }
  // Otherwise let them have equal size
  return 1;
};

const hasRankedValues = (sortBy, data) => {
  // Check if feature is numeric
  if (numericFeatures.includes(sortBy)) {
    return true;
  }

  // Check if any language has a scorable value for this feature
  if (data?.typologicalFeatures) {
    for (const features of Object.values(data.typologicalFeatures)) {
      const rawVal = features[sortBy];
      if (rawVal !== undefined && rawVal !== null) {
        const score = getFeatureScore(sortBy, rawVal);
        if (typeof score === "number" && !isNaN(score)) {
          return true;
        }
      }
    }
  }
  return false;
};

export const calculateSizeMultiplier = (
  sortBy,
  data,
  languageCode,
  layoutConfig,
) => {
  const { outMin, outMax } = layoutConfig.labelSizeNormalization;

  // If feature has no scores and is not numeric, all languages get equal size
  if (!hasRankedValues(sortBy, data)) {
    return (outMin + outMax) / 3; // midpoint = equal size for all
  }

  // Get the value for this specific language
  const sizeValue = getSizeValue(sortBy, data, languageCode);

  // Collect all values from all languages to establish ranking
  const allValues = [];
  if (data?.typologicalFeatures) {
    Object.values(data.typologicalFeatures).forEach((features) => {
      const rawVal = features[sortBy];
      if (rawVal !== undefined && rawVal !== null) {
        // If this feature uses scores, get the score; otherwise use raw value
        const score = getFeatureScore(sortBy, rawVal);
        const val = typeof score === "number" && !isNaN(score) ? score : rawVal;
        allValues.push(val);
      }
    });
  }

  if (allValues.length === 0) return outMin;

  const uniqueValues = [...new Set(allValues)].sort((a, b) => a - b);
  const rank = uniqueValues.indexOf(sizeValue);
  const totalRanks = uniqueValues.length - 1;
  const normalizedRank = totalRanks > 0 ? rank / totalRanks : 0;

  return outMin + normalizedRank * (outMax - outMin);
};
