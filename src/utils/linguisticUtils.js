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
