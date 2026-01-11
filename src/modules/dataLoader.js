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

      Object.entries(languages).forEach(([code, langData]) => {
        const {
          group,
          speakers,
          tonality,
          morphology,
          wordOrderFlexibility,
          phonemeCount,
          caseCount,
          ...rest
        } = langData;

        languageData[code] = languages[code];
        languageGroups[code] = group;
        speakerData[code] = speakers;

        // Extract typological features from the flattened structure
        const typology = {};
        if (tonality !== undefined) typology.tonality = tonality;
        if (morphology !== undefined) typology.morphology = morphology;
        if (wordOrderFlexibility !== undefined)
          typology.wordOrderFlexibility = wordOrderFlexibility;
        if (phonemeCount !== undefined) typology.phonemeCount = phonemeCount;
        if (caseCount !== undefined) typology.caseCount = caseCount;

        typologicalFeatures[code] = typology;
      });

      // Add groupInfo to typologicalFeatures for easy access in sorting/filtering
      typologicalFeatures._groupInfo = groupInfo;

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
