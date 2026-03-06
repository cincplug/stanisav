import eng from "./messages/eng.json";
import nld from "./messages/nld.json";
import languageNamesEng from "./language-names/eng.json";
import languageNamesNld from "./language-names/nld.json";
import lineageLabelsEng from "./lineage-labels/eng.json";
import lineageLabelsNld from "./lineage-labels/nld.json";

const messagesByLocale = {
  eng,
  nld,
};

const lineageLabelsByLocale = {
  eng: lineageLabelsEng,
  nld: lineageLabelsNld,
};

const languageNamesByLocale = {
  eng: languageNamesEng,
  nld: languageNamesNld,
};

export const defaultLocale = "eng";

const normalizeLocaleCode = (locale) =>
  String(locale || "")
    .trim()
    .toLowerCase();

const hasLocaleDataset = (locale) =>
  locale in messagesByLocale &&
  locale in languageNamesByLocale &&
  locale in lineageLabelsByLocale;

export const normalizeLocale = (locale) => normalizeLocaleCode(locale);

export const isSupportedLocale = (locale) => {
  const normalized = normalizeLocaleCode(locale);
  return Boolean(normalized) && hasLocaleDataset(normalized);
};

let currentLocale = defaultLocale;

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

const getMessageByPath = (messages, key) =>
  key.split(".").reduce((current, segment) => {
    if (current && typeof current === "object") {
      return current[segment];
    }
    return undefined;
  }, messages);

export const setActiveLocale = (locale) => {
  const normalized = normalizeLocaleCode(locale);
  if (!isSupportedLocale(normalized)) {
    throw new Error(`Unsupported locale '${locale}'`);
  }
  currentLocale = normalized;
};

export const translate = (key, params) => {
  const localeMessages = translations();
  if (!localeMessages) {
    throw new Error(`Missing locale '${currentLocale}'`);
  }

  const message = getMessageByPath(localeMessages, key);
  if (message === undefined) {
    throw new Error(
      `Missing translation key '${key}' for locale '${currentLocale}'`,
    );
  }

  if (typeof message !== "string") {
    throw new Error(
      `Translation key '${key}' for locale '${currentLocale}' is not a string`,
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
