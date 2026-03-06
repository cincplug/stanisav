import { getLocalizedLanguageName } from "../i18n/runtime";

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
