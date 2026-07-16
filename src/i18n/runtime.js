// Lazy loaders — Vite splits each JSON into its own chunk, loaded on demand
const messageLoaders = import.meta.glob("./messages/*.json");
const languageNameLoaders = import.meta.glob("./language-names/*.json");
const lineageLabelLoaders = import.meta.glob("./lineage-labels/*.json");
const entranceStepLoaders = import.meta.glob("./entrance/*.json");

// Eagerly load the default locale so the app renders immediately
import defaultEntranceSteps from "./entrance/eng.json";
import defaultLanguageNames from "./language-names/eng.json";
import defaultLineageLabels from "./lineage-labels/eng.json";
import defaultMessages from "./messages/eng.json";

// Extract supported locale codes from the file system (Vite resolves at build time)
const extractCode = (path) => path.match(/\/(\w+)\.json$/)[1];

export const getSupportedLocales = () =>
  Array.from(Object.keys(messageLoaders).map(extractCode));

// Caches for loaded locale data
const messagesByLocale = { eng: defaultMessages };
const languageNamesByLocale = { eng: defaultLanguageNames };
const lineageLabelsByLocale = { eng: defaultLineageLabels };
const entranceStepsByLocale = { eng: defaultEntranceSteps };

const loadLocaleData = async (locale) => {
  if (messagesByLocale[locale]) return;

  const entranceLoader = entranceStepLoaders[`./entrance/${locale}.json`];

  const [messages, languageNames, lineageLabels, entranceSteps] =
    await Promise.all([
      messageLoaders[`./messages/${locale}.json`](),
      languageNameLoaders[`./language-names/${locale}.json`](),
      lineageLabelLoaders[`./lineage-labels/${locale}.json`](),
      // Fall back to eng if no entrance file exists for this locale
      entranceLoader
        ? entranceLoader()
        : Promise.resolve({ default: defaultEntranceSteps }),
    ]);

  messagesByLocale[locale] = messages.default;
  languageNamesByLocale[locale] = languageNames.default;
  lineageLabelsByLocale[locale] = lineageLabels.default;
  entranceStepsByLocale[locale] = entranceSteps.default;
};

export const defaultLocale = "eng";

// Derive URL slug ↔ ISO 639-3 mappings dynamically via Intl.Locale
const supportedLocalesArr = getSupportedLocales();
const iso3ToSlug = Object.fromEntries(
  supportedLocalesArr.map((iso3) => [iso3, new Intl.Locale(iso3).language]),
);
const slugToIso3 = Object.fromEntries(
  Object.entries(iso3ToSlug).map(([iso3, slug]) => [slug, iso3]),
);

export const defaultUrlSlug = iso3ToSlug[defaultLocale];

/** Converts an internal ISO 639-3 code to its URL slug (BCP 47 shortest). */
export const toUrlSlug = (iso3) => iso3ToSlug[iso3] || iso3;

/**
 * Resolves a URL slug (or ISO 639-3 code) to the internal ISO 639-3 code.
 * Returns null if the locale is not supported.
 */
export const resolveUrlLocale = (slug) => {
  const normalized = String(slug || "")
    .trim()
    .toLowerCase();
  if (slugToIso3[normalized]) return slugToIso3[normalized];
  if (supportedLocalesArr.includes(normalized)) return normalized;
  return null;
};

const normalizeLocaleCode = (locale) =>
  String(locale || "")
    .trim()
    .toLowerCase();

export const normalizeLocale = (locale) => normalizeLocaleCode(locale);

export const isSupportedLocale = (locale) => {
  const normalized = normalizeLocaleCode(locale);
  return Boolean(normalized) && supportedLocalesArr.includes(normalized);
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
const localizedEntranceSteps = () =>
  entranceStepsByLocale[currentLocale] ?? entranceStepsByLocale[defaultLocale];

const getMessageByPath = (messages, key) =>
  key.split(".").reduce((current, segment) => {
    if (current && typeof current === "object") {
      return current[segment];
    }
    return undefined;
  }, messages);

export const setSelectedLocale = async (locale) => {
  const normalized = normalizeLocaleCode(locale);
  if (!isSupportedLocale(normalized)) {
    throw new Error(`Unsupported locale '${locale}'`);
  }
  await loadLocaleData(normalized);
  currentLocale = normalized;
};

export const translate = (key, params) => {
  const localeMessages = translations();
  if (!localeMessages) {
    throw new Error(`Missing locale '${currentLocale}'`);
  }

  let message = getMessageByPath(localeMessages, key);
  if (message === undefined && currentLocale !== defaultLocale) {
    message = getMessageByPath(messagesByLocale[defaultLocale], key);
  }

  if (message === undefined) {
    return key;
  }

  if (typeof message !== "string") {
    throw new Error(
      `Translation key '${key}' for locale '${currentLocale}' is not a string`,
    );
  }

  return interpolate(message, params);
};

// Like translate(), but returns null when the key is not found instead of the key string itself.
export const tryTranslate = (key, params) => {
  const localeMessages = translations();
  if (!localeMessages) return null;

  let message = getMessageByPath(localeMessages, key);
  if (message === undefined && currentLocale !== defaultLocale) {
    message = getMessageByPath(messagesByLocale[defaultLocale], key);
  }

  if (message === undefined || typeof message !== "string") return null;

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

export const getEntranceSteps = () => localizedEntranceSteps();
