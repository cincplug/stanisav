import languages from "../config/languages.json";
import groupInfo from "../config/groupInfo.json";
import linguisticConfig from "../config/linguisticConfig.json";

class DataLoader {
  constructor() {
    this.data = {};
  }

  async loadAll() {
    try {
      this.data = {
        languages,
        groupInfo,
        languageCodes: Object.keys(languages),
        languageData: {},
        languageGroups: {},
        speakerData: {},
        typologicalFeatures: {},
        numericFeatureValues: {},
      };

      const {
        languageData,
        languageGroups,
        speakerData,
        typologicalFeatures,
        numericFeatureValues,
      } = this.data;

      Object.entries(languages).forEach(
        ([code, { group, speakers, typology }]) => {
          languageData[code] = languages[code];
          languageGroups[code] = group;
          speakerData[code] = speakers;
          typologicalFeatures[code] = typology;
        }
      );

      // Extract unique values for numeric features
      this.extractNumericFeatureValues(
        numericFeatureValues,
        typologicalFeatures
      );

      return this.data;
    } catch (error) {
      console.error("Error loading data files:", error);
      throw error;
    }
  }

  /**
   * Extract unique numeric values for features without values property
   */
  extractNumericFeatureValues(numericFeatureValues, typologicalFeatures) {
    // Identify numeric features from config (those without values object)
    const numericFeatures = Object.entries(linguisticConfig)
      .filter(([_, config]) => !config.values)
      .map(([key]) => key);

    // Collect unique values for each numeric feature
    numericFeatures.forEach((feature) => {
      const uniqueValues = new Set();
      Object.values(typologicalFeatures).forEach((typology) => {
        if (typology[feature] !== undefined && typology[feature] !== null) {
          uniqueValues.add(typology[feature]);
        }
      });
      numericFeatureValues[feature] = Array.from(uniqueValues).sort(
        (a, b) => a - b
      );
    });
  }

  /**
   * Get the currently loaded data
   * @returns {Object} The combined data object, or empty object if not loaded
   */
  getData() {
    return this.data;
  }
}

export { DataLoader };
