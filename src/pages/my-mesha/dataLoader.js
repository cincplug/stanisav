/**
 * Data loader for Mosha page - loads a single language
 */

import languages from "../../config/languages.json";
import groupInfo from "../../config/groupInfo.json";

/**
 * Load data for a single language
 * @param {string} languageCode - ISO 639-3 language code
 * @returns {object|null} Language data in same format as main app, or null if not found
 */
export function loadLanguageData(languageCode) {
  if (!languageCode || !languages[languageCode]) {
    console.error(`Language code "${languageCode}" not found`);
    return null;
  }

  const langData = languages[languageCode];
  const { group, speakers, ...typology } = langData;

  // Return data in same structure as main app for compatibility
  return {
    languageData: {
      [languageCode]: langData,
    },
    languageGroups: {
      [languageCode]: group,
    },
    speakerData: {
      [languageCode]: speakers,
    },
    typologicalFeatures: {
      [languageCode]: typology,
      _groupInfo: groupInfo, // Include group info for color mapping
    },
    // Not needed for Mosha but included for consistency
    numericFeatureValues: {},
  };
}

/**
 * Get all available language codes
 * @returns {string[]} Array of ISO 639-3 language codes
 */
export function getAvailableLanguages() {
  return Object.keys(languages);
}

/**
 * Validate if a language code exists
 * @param {string} languageCode - ISO 639-3 language code
 * @returns {boolean} True if language exists
 */
export function isValidLanguageCode(languageCode) {
  return !!languages[languageCode];
}
