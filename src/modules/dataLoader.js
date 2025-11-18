import languages from "../config/languages.json";
import groupInfo from "../config/groupInfo.json";

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
        typologicalFeatures: {}
      };

      const { languageData, languageGroups, speakerData, typologicalFeatures } =
        this.data;

      Object.entries(languages).forEach(
        ([code, { group, speakers, typology }]) => {
          languageData[code] = languages[code];
          languageGroups[code] = group;
          speakerData[code] = speakers;
          typologicalFeatures[code] = typology;
        }
      );

      return this.data;
    } catch (error) {
      console.error("Error loading data files:", error);
      throw error;
    }
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
