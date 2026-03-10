import eng from "./messages/eng.json";
import nld from "./messages/nld.json";
import srp from "./messages/srp.json";
import cmn from "./messages/cmn.json";
import deu from "./messages/deu.json";
import ukr from "./messages/ukr.json";
import fra from "./messages/fra.json";
import por from "./messages/por.json";
import spa from "./messages/spa.json";
import pol from "./messages/pol.json";
import ita from "./messages/ita.json";
import ces from "./messages/ces.json";
import mkd from "./messages/mkd.json";

import languageNamesEng from "./language-names/eng.json";
import languageNamesNld from "./language-names/nld.json";
import languageNamesSrp from "./language-names/srp.json";
import languageNamesCmn from "./language-names/cmn.json";
import languageNamesDeu from "./language-names/deu.json";
import languageNamesUkr from "./language-names/ukr.json";
import languageNamesFra from "./language-names/fra.json";
import languageNamesPor from "./language-names/por.json";
import languageNamesSpa from "./language-names/spa.json";
import languageNamesPol from "./language-names/pol.json";
import languageNamesIta from "./language-names/ita.json";
import languageNamesCes from "./language-names/ces.json";
import languageNamesMkd from "./language-names/mkd.json";

import lineageLabelsEng from "./lineage-labels/eng.json";
import lineageLabelsNld from "./lineage-labels/nld.json";
import lineageLabelsSrp from "./lineage-labels/srp.json";
import lineageLabelsCmn from "./lineage-labels/cmn.json";
import lineageLabelsDeu from "./lineage-labels/deu.json";
import lineageLabelsUkr from "./lineage-labels/ukr.json";
import lineageLabelsFra from "./lineage-labels/fra.json";
import lineageLabelsPor from "./lineage-labels/por.json";
import lineageLabelsSpa from "./lineage-labels/spa.json";
import lineageLabelsPol from "./lineage-labels/pol.json";
import lineageLabelsIta from "./lineage-labels/ita.json";
import lineageLabelsCes from "./lineage-labels/ces.json";
import lineageLabelsMkd from "./lineage-labels/mkd.json";

const messagesByLocale = {
  eng,
  nld,
  srp,
  mkd,
  ces,
  ita,
  pol,
  spa,
  por,
  fra,
  ukr,
  deu,
  cmn,
};

const lineageLabelsByLocale = {
  eng: lineageLabelsEng,
  nld: lineageLabelsNld,
  srp: lineageLabelsSrp,
  mkd: lineageLabelsMkd,
  ces: lineageLabelsCes,
  ita: lineageLabelsIta,
  pol: lineageLabelsPol,
  spa: lineageLabelsSpa,
  por: lineageLabelsPor,
  fra: lineageLabelsFra,
  ukr: lineageLabelsUkr,
  deu: lineageLabelsDeu,
  cmn: lineageLabelsCmn,
};

const languageNamesByLocale = {
  eng: languageNamesEng,
  nld: languageNamesNld,
  srp: languageNamesSrp,
  mkd: languageNamesMkd,
  ces: languageNamesCes,
  ita: languageNamesIta,
  pol: languageNamesPol,
  spa: languageNamesSpa,
  por: languageNamesPor,
  fra: languageNamesFra,
  ukr: languageNamesUkr,
  deu: languageNamesDeu,
  cmn: languageNamesCmn,
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
