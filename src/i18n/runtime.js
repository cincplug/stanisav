// Lazy loaders — Vite splits each JSON into its own chunk, loaded on demand
const messageLoaders = import.meta.glob("./messages/*.json");
const languageNameLoaders = import.meta.glob("./language-names/*.json");
const lineageLabelLoaders = import.meta.glob("./lineage-labels/*.json");
const entranceStepLoaders = import.meta.glob("./entrance/*.json");

// Kavian name files are optional per locale (e.g. "./language-names/nld-kav.json").
// Unlike the loaders above, most locales will never have one.
const kavianLanguageNameLoaders = import.meta.glob(
  "./language-names/*-kav.json",
);

// THE single source of truth for which locale is the built-in default/fallback.
// Everything below that CAN be derived from this constant, is — but Vite import
// specifiers must be static string literals, so the four eager imports right
// below still have to spell it out by hand. Change this constant AND those
// four paths together, or the DEV-only assertion further down will catch it.
export const defaultLocale = "eng";

// Eagerly load the default locale so the app renders immediately.
// These four paths MUST literally match defaultLocale above.
import defaultEntranceSteps from "./entrance/eng.json";
import defaultLanguageNames from "./language-names/eng.json";
import defaultLineageLabels from "./lineage-labels/eng.json";
import defaultMessages from "./messages/eng.json";

// Extract supported locale codes from the file system (Vite resolves at build time)
const extractCode = (path) => path.match(/\/(\w+)\.json$/)[1];

export const getSupportedLocales = () =>
  Array.from(Object.keys(messageLoaders).map(extractCode));

// Locale codes that have a "<locale>-kav.json" file, derived the same way
const extractKavianCode = (path) => path.match(/\/(\w+)-kav\.json$/)[1];

const kavianSupportedLocales = new Set(
  Object.keys(kavianLanguageNameLoaders).map(extractKavianCode),
);

// True if this locale has its own kavian names file (e.g. "nld", not "eng").
// Locales without one simply fall back to the default locale's kavian names.
const hasKavianNames = (locale) =>
  kavianSupportedLocales.has(normalizeLocaleCode(locale));

// Caches for loaded locale data. Every key here is defaultLocale, not the
// literal "eng" — this is the one part of the eager-load setup that already
// had no reason to hardcode it.
const messagesByLocale = { [defaultLocale]: defaultMessages };
const languageNamesByLocale = { [defaultLocale]: defaultLanguageNames };
const lineageLabelsByLocale = { [defaultLocale]: defaultLineageLabels };
const entranceStepsByLocale = { [defaultLocale]: defaultEntranceSteps };
const kavianLanguageNamesByLocale = {};

// DEV-only tripwire: if defaultLocale above ever changes without updating the
// four eager import paths to match, fail loudly at startup — instead of a
// "Missing locale" error three components deep, with no clue why.
if (import.meta.env?.DEV && defaultLocale !== "eng") {
  throw new Error(
    `runtime.js: defaultLocale is set to '${defaultLocale}', but the four ` +
      `eager imports above (entrance/eng.json, language-names/eng.json, ` +
      `lineage-labels/eng.json, messages/eng.json) still literally say ` +
      `'eng'. Update those four import paths to '${defaultLocale}.json' too.`,
  );
}

// Loads kavian names for this locale if a file for it exists; otherwise a no-op.
const loadKavianLanguageNames = async (locale) => {
  if (kavianLanguageNamesByLocale[locale] || !hasKavianNames(locale)) return;
  const kavianNames =
    await kavianLanguageNameLoaders[`./language-names/${locale}-kav.json`]();
  kavianLanguageNamesByLocale[locale] = kavianNames.default;
};

const loadLocaleData = async (locale) => {
  // Kavian data is never part of the eager eng bundle above (unlike messages,
  // language names, etc.), so it needs its own load regardless of whether the
  // rest of this locale's data was already eagerly bundled. Both calls are
  // no-ops once cached, so this is cheap even when it runs on every call.
  await Promise.all([
    loadKavianLanguageNames(locale),
    loadKavianLanguageNames(defaultLocale),
  ]);

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
const localizedKavianLanguageNames = () =>
  kavianLanguageNamesByLocale[currentLocale];
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

export const getLocalizedKavianLanguageName = (languageCode) => {
  const normalizedCode = String(languageCode).toLowerCase();

  const localeKavianNames = localizedKavianLanguageNames();
  const kavianName = localeKavianNames?.[normalizedCode];
  if (kavianName) return kavianName;

  // Silent fallback: this locale has no kavian file at all, or has one but
  // is missing this particular language — either way, use the default
  // locale's kavian name instead of surfacing a gap to the user.
  const fallbackKavianNames = kavianLanguageNamesByLocale[defaultLocale];
  const fallbackKavianName = fallbackKavianNames?.[normalizedCode];
  if (fallbackKavianName) return fallbackKavianName;

  throw new Error(
    `Missing kavian name '${normalizedCode}' for locale '${currentLocale}' and fallback '${defaultLocale}'`,
  );
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
