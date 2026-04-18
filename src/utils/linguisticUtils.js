import linguisticConfig from "../config/linguisticConfig.json";
import lineages from "../config/lineages.json";
import { translate } from "../i18n/runtime";
import { getFamilyLabel } from "./configI18nUtils";

/**
 * Linguistic Configuration Utility
 * Functions for accessing linguistic feature metadata
 */

// Get all available linguistic features from config
export const getLinguisticFeatures = () => {
  return Object.entries(linguisticConfig)
    .filter(([_, config]) => config.values) // Only features with values object
    .map(([key]) => ({
      key,
      label: translate(`linguistic.${key}.name`),
    }));
};

// Get feature label from config
export const getFeatureLabel = (feature, value) => {
  // Special handling for family - just return the name as-is
  if (feature === "family") {
    return getFamilyLabel(value);
  }

  const featureConfig = linguisticConfig[feature];
  if (!featureConfig?.values?.[value]) {
    throw new Error(`Missing feature value config for '${feature}.${value}'`);
  }
  return translate(`linguistic.${feature}.values.${value}.label`);
};

// Get feature description from config
export const getFeatureDescription = (feature, value) => {
  const featureConfig = linguisticConfig[feature];
  if (!featureConfig?.values?.[value]?.description) {
    return null;
  }
  return translate(`linguistic.${feature}.values.${value}.description`);
};

// Get feature score from config
export const getFeatureScore = (feature, value) => {
  const featureConfig = linguisticConfig[feature];
  if (!featureConfig?.values?.[value]) {
    return null;
  }
  return featureConfig.values[value].score;
};

// Get multiple feature scores from linguistic properties
export const getFeatureScoreList = (linguisticProperties, features) => {
  return features.reduce((scores, feature) => {
    scores[feature] = getFeatureScore(feature, linguisticProperties?.[feature]);
    return scores;
  }, {});
};

// Get feature name from config
export const getFeatureName = (feature) => {
  const featureConfig = linguisticConfig[feature];
  if (!featureConfig) {
    throw new Error(`Missing feature config for '${feature}'`);
  }
  return translate(`linguistic.${feature}.name`);
};

// Get all values for a feature from config
export const getFeatureValuesFromConfig = (feature) => {
  const featureConfig = linguisticConfig[feature];
  if (!featureConfig?.values) {
    return [];
  }
  return Object.keys(featureConfig.values);
};

// Get all numeric features from config (those with template property)
export const getNumericFeatures = () => {
  return Object.entries(linguisticConfig)
    .filter(([_, config]) => config.template)
    .map(([key]) => ({
      key,
      label: translate(`linguistic.${key}.name`),
    }));
};

// Check if a feature is numeric (has template instead of values)
export const isNumericFeature = (feature) => {
  const featureConfig = linguisticConfig[feature];
  return featureConfig?.template !== undefined;
};

// Get all features (both categorical and numeric)
export const getAllFeatures = () => {
  return Object.entries(linguisticConfig)
    .filter(([_, config]) => config.values || config.template || config.name)
    .map(([key, config]) => ({
      key,
      label: translate(`linguistic.${key}.name`),
      isNumeric: config.template !== undefined,
      isFamily: key === "family",
    }));
};

export const isPropertyDescribed = (propertyKey) => {
  if (
    !propertyKey ||
    !linguisticConfig[propertyKey] ||
    !linguisticConfig[propertyKey].values
  )
    return false;
  const values = linguisticConfig[propertyKey].values;
  return Object.values(values).some((v) => !!v.description);
};

export const formatNumber = (value) => new Intl.NumberFormat().format(value);

export const formatSpeakers = (speakersInMillions) => {
  if (!Number.isFinite(speakersInMillions)) return null;
  return formatNumber(Math.round(speakersInMillions * 1000000));
};

export const getLineageTrail = (lineageKey) => {
  if (!lineageKey) return [];
  const ancestors = lineages[lineageKey];
  if (!Array.isArray(ancestors)) return [lineageKey];
  return [...ancestors, lineageKey];
};

export function getLanguagePropertyValue(
  languageData,
  languageCode,
  propertyKey,
) {
  if (!languageData || !languageCode || !propertyKey) return undefined;
  const lang = languageData[languageCode];
  if (!lang) return undefined;
  return lang[propertyKey];
}
