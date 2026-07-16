import lineages from "../config/lineages.json";
import linguisticConfig from "../config/linguisticConfig.json";
import {
  getLocalizedLanguageName,
  translate,
  tryTranslate,
} from "../i18n/runtime";
import { getFamilyLabel } from "./i18nUtils";

/**
 * Linguistic Configuration Utility
 * Functions for accessing linguistic feature metadata, language display, and lineage traversal
 */

// --- Feature metadata ---

export const getLinguisticFeatures = () => {
  return Object.entries(linguisticConfig)
    .filter(([_, config]) => config.values)
    .map(([key]) => ({
      key,
      label: translate(`linguistic.${key}.name`),
    }));
};

export const getFeatureLabel = (feature, value) => {
  if (feature === "family") {
    return getFamilyLabel(value);
  }

  const featureConfig = linguisticConfig[feature];
  if (!featureConfig?.values?.[value]) {
    throw new Error(`Missing feature value config for '${feature}.${value}'`);
  }
  return translate(`linguistic.${feature}.values.${value}.label`);
};

export const getFeatureDescription = (feature, value) => {
  return tryTranslate(`linguistic.${feature}.values.${value}.description`);
};

export const getFeatureScore = (feature, value) => {
  const featureConfig = linguisticConfig[feature];
  if (!featureConfig?.values?.[value]) {
    return null;
  }
  return featureConfig.values[value].score;
};

export const getFeatureScoreList = (linguisticProperties, features) => {
  return features.reduce((scores, feature) => {
    scores[feature] = getFeatureScore(feature, linguisticProperties?.[feature]);
    return scores;
  }, {});
};

export const getFeatureName = (feature) => {
  const featureConfig = linguisticConfig[feature];
  if (!featureConfig) {
    throw new Error(`Missing feature config for '${feature}'`);
  }
  return translate(`linguistic.${feature}.name`);
};

export const getFeatureValuesFromConfig = (feature) => {
  const featureConfig = linguisticConfig[feature];
  if (!featureConfig?.values) {
    return [];
  }
  return Object.keys(featureConfig.values);
};

export const getNumericFeatures = () => {
  return Object.entries(linguisticConfig)
    .filter(([_, config]) => config.numeric)
    .map(([key]) => ({
      key,
      label: translate(`linguistic.${key}.name`),
    }));
};

// Single source of truth for numeric feature detection
export const isNumericFeature = (feature) => {
  return linguisticConfig[feature]?.numeric === true;
};

export const getAllFeatures = () => {
  return Object.entries(linguisticConfig)
    .filter(([_, config]) => config.values || config.numeric)
    .map(([key, config]) => ({
      key,
      label: translate(`linguistic.${key}.name`),
      isNumeric: config.numeric === true,
      isFamily: key === "family",
    }));
};

export const isPropertyDescribed = (propertyKey) => {
  if (!propertyKey) return false;
  const valueKeys = getFeatureValuesFromConfig(propertyKey);
  return valueKeys.some(
    (value) =>
      tryTranslate(`linguistic.${propertyKey}.values.${value}.description`) !==
      null,
  );
};

// --- Formatting ---

export const formatNumber = (value) => new Intl.NumberFormat().format(value);

export const formatSpeakers = (speakersInMillions) => {
  if (!Number.isFinite(speakersInMillions)) return null;
  return formatNumber(Math.round(speakersInMillions * 1000000));
};

// --- Lineage ---

// Returns the full ancestor chain ending with the key itself: [...ancestors, lineageKey]
export const getLineageTrail = (lineageKey) => {
  if (!lineageKey) return [];
  const ancestors = lineages[lineageKey];
  if (!Array.isArray(ancestors)) return [lineageKey];
  return [...ancestors, lineageKey];
};

// --- Language data access ---

export const getLanguagePropertyValue = (
  languageData,
  languageCode,
  propertyKey,
) => {
  if (!languageData || !languageCode || !propertyKey) return undefined;
  const lang = languageData[languageCode];
  if (!lang) return undefined;
  return lang[propertyKey];
};

// --- Language display (merged from linguisticUtils) ---

export const getLanguageLabel = (languageCode, languageData, labelContent) => {
  switch (labelContent) {
    case "name":
      return getLocalizedLanguageName(languageCode);
    case "nativeName": {
      const nativeName = languageData?.[languageCode]?.nativeName;
      if (!nativeName) {
        throw new Error(`Missing nativeName for '${languageCode}'`);
      }
      return nativeName;
    }
    case "isoCode":
      return languageCode;
    default:
      throw new Error(`Unsupported labelContent '${labelContent}'`);
  }
};

// Builds the speech balloon text for a clicked face property.
// Numeric properties use a localized template string with the count interpolated.
// Described properties append the description after the value label.
export const getPropertyBalloonText = (propertyKey, rawValue) => {
  const propertyName = getFeatureName(propertyKey);

  if (isNumericFeature(propertyKey)) {
    return translate(`linguistic.${propertyKey}.template`, {
      count: formatNumber(rawValue),
    });
  }

  const valueLabel = Array.isArray(rawValue)
    ? rawValue.map((v) => getFeatureLabel(propertyKey, v)).join(", ")
    : getFeatureLabel(propertyKey, rawValue);

  if (!isPropertyDescribed(propertyKey)) {
    return `${propertyName}: ${valueLabel}`;
  }

  const description = getFeatureDescription(propertyKey, rawValue);
  return `${propertyName}: ${valueLabel}. ${description}`;
};
