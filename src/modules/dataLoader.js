import languages from "../config/languages.json";
import lineages from "../config/lineages.json";
import linguisticConfig from "../config/linguisticConfig.json";

class DataLoader {
  constructor() {
    this.data = {};
  }

  async loadAll() {
    try {
      // Validate that all languages have lineageKey
      Object.entries(languages).forEach(([code, langData]) => {
        if (!langData.lineageKey) {
          throw new Error(`Missing lineageKey in languages.json for '${code}'`);
        }
      });

      this.data = {
        languages,
        lineages,
        languageCodes: Object.keys(languages),
        numericFeatureValues: this.extractNumericFeatureValues(),
      };

      return this.data;
    } catch (error) {
      console.error("Error loading data files:", error);
      throw error;
    }
  }

  /**
   * Extract unique numeric values for features without values property
   */
  extractNumericFeatureValues() {
    const numericFeatureValues = {};

    // Identify numeric features from config (those without values object)
    const numericFeatures = Object.entries(linguisticConfig)
      .filter(([_, config]) => !config.values)
      .map(([key]) => key);

    // Collect unique values for each numeric feature
    numericFeatures.forEach((feature) => {
      const uniqueValues = new Set();
      Object.values(languages).forEach((lang) => {
        const value = lang[feature];
        if (value !== undefined && value !== null) {
          uniqueValues.add(value);
        }
      });
      numericFeatureValues[feature] = Array.from(uniqueValues).sort(
        (a, b) => a - b,
      );
    });

    return numericFeatureValues;
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
