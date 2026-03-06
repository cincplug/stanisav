import eng from "./messages/eng.json";
import languageNamesEng from "./language-names/eng.json";
import lineageLabelsEng from "./lineage-labels/eng.json";

const messagesByLocale = {
  eng,
};

const lineageLabelsByLocale = {
  eng: lineageLabelsEng,
};

const languageNamesByLocale = {
  eng: languageNamesEng,
};

let currentLocale = "eng";

const interpolate = (message, params = {}) =>
  message.replace(/\{(\w+)\}/g, (fullMatch, key) => {
    const value = params[key];
    if (value === undefined || value === null) {
      throw new Error(`Missing interpolation param '${key}'`);
    }
    return String(value);
  });

const translations = () => messagesByLocale[currentLocale];
const localizedLanguageNames = () => languageNamesByLocale[currentLocale];
const localizedLineageLabels = () => lineageLabelsByLocale[currentLocale];

export const setActiveLocale = (locale) => {
  currentLocale = locale;
};

export const translate = (key, params) => {
  const localeMessages = translations();
  if (!localeMessages) {
    throw new Error(`Missing locale '${currentLocale}'`);
  }

  const message = localeMessages[key];
  if (!message) {
    throw new Error(
      `Missing translation key '${key}' for locale '${currentLocale}'`,
    );
  }

  return interpolate(message, params);
};

export const getLocalizedLanguageName = (languageCode) => {
  const localeLanguageNames = localizedLanguageNames();
  if (!localeLanguageNames) {
    throw new Error(`Missing language names locale '${currentLocale}'`);
  }

  const normalizedCode = String(languageCode).toLowerCase();
  const languageName = localeLanguageNames[normalizedCode];

  if (!languageName) {
    throw new Error(
      `Missing language name '${normalizedCode}' for locale '${currentLocale}'`,
    );
  }

  return languageName;
};

export const getLocalizedLineageLabel = (lineageName) => {
  const localeLineageLabels = localizedLineageLabels();
  if (!localeLineageLabels) {
    throw new Error(`Missing lineage labels locale '${currentLocale}'`);
  }

  const label = localeLineageLabels[lineageName];
  if (!label) {
    throw new Error(
      `Missing lineage label '${lineageName}' for locale '${currentLocale}'`,
    );
  }

  return label;
};
