import { getFeatureScore } from "./linguisticUtils.js";
import numericFeatures from "../config/numericFeatures.json";
import lineages from "../config/lineages.json";

const getFamily = (lineageKey) => {
  const lineage = lineages[lineageKey];
  if (!Array.isArray(lineage)) {
    throw new Error(`Missing lineage for '${lineageKey}' in lineages.json`);
  }
  return lineage.length > 0 ? lineage[0] : lineageKey;
};

export const calculateLanguageFilterStatus = (
  languages,
  typologicalFeatures,
  filteringUtils,
  languageLineages,
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

        if (feature === "family") {
          const languageLineage = languageLineages?.[langCode];
          const languageFamily = getFamily(languageLineage);
          return values.includes(languageFamily);
        }

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
  if (numericFeatures.includes(sortBy)) {
    return data?.typologicalFeatures?.[languageCode]?.[sortBy] || 1;
  }
  const featureValue = data?.typologicalFeatures?.[languageCode]?.[sortBy];
  const score = getFeatureScore(sortBy, featureValue);
  if (typeof score === "number" && !isNaN(score)) {
    return score;
  }
  return 1;
};

const hasRankedValues = (sortBy, data) => {
  if (numericFeatures.includes(sortBy)) {
    return true;
  }

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

  if (!hasRankedValues(sortBy, data)) {
    return (outMin + outMax) / 3;
  }

  const sizeValue = getSizeValue(sortBy, data, languageCode);

  const allValues = [];
  if (data?.typologicalFeatures) {
    Object.values(data.typologicalFeatures).forEach((features) => {
      const rawVal = features[sortBy];
      if (rawVal !== undefined && rawVal !== null) {
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
