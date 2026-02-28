import linguisticConfig from "../config/linguisticConfig.json";

/**
 * Linguistic Configuration Utility
 * Functions for accessing linguistic feature metadata
 */

// Get all available linguistic features from config
export const getLinguisticFeatures = () => {
  return Object.entries(linguisticConfig)
    .filter(([_, config]) => config.values) // Only features with values object
    .map(([key, config]) => ({
      key,
      label: config.name,
    }));
};

// Get feature label from config
export const getFeatureLabel = (feature, value) => {
  // Special handling for family and group - just return the name as-is
  if (feature === "family" || feature === "group") {
    return value;
  }

  const featureConfig = linguisticConfig[feature];
  if (!featureConfig?.values?.[value]) {
    return value; // fallback to raw value
  }
  return featureConfig.values[value].label;
};

// Get feature description from config
export const getFeatureDescription = (feature, value) => {
  const featureConfig = linguisticConfig[feature];
  if (!featureConfig?.values?.[value]) {
    return null;
  }
  return featureConfig.values[value].description;
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
    return feature; // fallback to key
  }
  return featureConfig.name;
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
    .map(([key, config]) => ({
      key,
      label: config.name,
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
      label: config.name,
      isNumeric: config.template !== undefined,
      isGroup: key === "group",
      isFamily: key === "family",
    }));
};

export function getTonalityType(linguisticProperties) {
  const tonality = linguisticProperties?.tonality;
  return (linguisticConfig.tonality.values[tonality]?.score ?? 1) - 1;
}
