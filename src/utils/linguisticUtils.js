/**
 * Utility functions for generating human-readable linguistic descriptions
 */

import linguisticConfig from "../config/linguisticConfig.json";

// Case count range thresholds
const CASE_COUNT_THRESHOLDS = {
  BASIC: 4,
  LOCATIVE: 8,
  EXTENSIVE: 15
};

/**
 * Replace placeholders in template strings with actual values
 * @param {string} template - Template string with placeholders
 * @param {Object} values - Values to replace placeholders with
 * @returns {string} Processed string
 */
const processTemplate = (template, values = {}) => {
  return template.replace(/{(\w+)}/g, (match, key) => values[key] || match);
};

/**
 * Get case count description based on count range
 * @param {number} count - Number of cases
 * @returns {string} Description template key
 */
const getCaseCountRange = (count) => {
  if (count === 0) return "0";
  if (count <= CASE_COUNT_THRESHOLDS.BASIC) return "1-4";
  if (count <= CASE_COUNT_THRESHOLDS.LOCATIVE) return "5-8";
  if (count <= CASE_COUNT_THRESHOLDS.EXTENSIVE) return "9-15";
  return "16+";
};

/**
 * Generate description for a specific feature
 * @param {string} featureType - Type of feature (e.g., 'tonality', 'morphology')
 * @param {*} featureValue - Value of the feature
 * @param {Object} templateValues - Additional values for template processing
 * @returns {string|null} Description string or null if not found
 */
const getFeatureDescription = (
  featureType,
  featureValue,
  templateValues = {}
) => {
  const descriptions = linguisticConfig[featureType];
  if (!descriptions) return null;

  // Handle special case for caseCount
  if (featureType === "caseCount") {
    const rangeKey = getCaseCountRange(featureValue);
    const template = descriptions[rangeKey];
    return template
      ? processTemplate(template, { count: featureValue, ...templateValues })
      : null;
  }

  // Handle template-based descriptions
  if (descriptions.template) {
    return processTemplate(descriptions.template, {
      [featureType]: featureValue,
      ...templateValues
    });
  }

  // Handle direct mapping
  const description = descriptions[featureValue];
  return description || null;
};

/**
 * Generate human-readable descriptions of linguistic features
 * @param {Object} features - Typological features object
 * @returns {Array<string>} Array of description strings
 */
export const generateLinguisticDescription = (features) => {
  if (!features) return [];

  const featureProcessors = [
    { key: "phonemeCount", condition: (val) => val > 0 },
    { key: "caseCount", condition: (val) => val !== undefined },
    { key: "caseSystem", condition: (val) => val && !features.caseCount },
    { key: "tonality", condition: (val) => val },
    { key: "morphology", condition: (val) => val },
    { key: "wordOrderFlexibility", condition: (val) => val }
  ];

  return featureProcessors
    .filter(({ key, condition }) => condition(features[key]))
    .map(({ key }) =>
      getFeatureDescription(key, features[key], { count: features[key] })
    )
    .filter(Boolean);
};
