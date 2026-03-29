import linguisticConfig from "../config/linguisticConfig.json";
import numericFeatures from "../config/numericFeatures.json";
import { getFamilyLabel } from "./configI18nUtils";
import { getFeatureLabel } from "./linguisticUtils";
import { getLanguageLabel } from "./languageDisplayUtils";

export function buildLanguageTree(languageCodes, languageData, lineagesConfig) {
  const tree = {};

  languageCodes.forEach((langCode) => {
    const lineageKey = languageData?.[langCode]?.lineageKey;
    if (!lineageKey) return;

    const lineagePath = lineagesConfig?.[lineageKey]
      ? [...lineagesConfig[lineageKey], lineageKey]
      : [lineageKey];

    let node = tree;
    lineagePath.forEach((level, index) => {
      if (!node[level]) {
        node[level] = { children: {}, languages: [] };
      }

      if (index === lineagePath.length - 1) {
        node[level].languages.push(langCode);
      }

      node = node[level].children;
    });
  });

  return tree;
}

// Returns [{ title, languages[] }] for all sortBy cases.
// Matches the groupedByCategory logic in LanguagesTab.
export function groupLanguages({
  sortedLanguageCodes,
  sortBy,
  languageData,
  languageLineages,
  labelContent,
  lineages,
  isReverse,
}) {
  if (sortBy === "speakers") {
    return [{ title: null, languages: sortedLanguageCodes }];
  }

  if (sortBy === "alphabetically") {
    const result = {};
    sortedLanguageCodes.forEach((langCode) => {
      const label = getLanguageLabel(langCode, languageData, labelContent);
      const firstChar =
        Array.from(label.trim())[0]?.toLocaleUpperCase("und") || "#";
      if (!result[firstChar]) {
        result[firstChar] = { title: firstChar, languages: [] };
      }
      result[firstChar].languages.push(langCode);
    });
    return Object.values(result).sort((a, b) =>
      a.title.localeCompare(b.title, "und", { sensitivity: "base" }),
    );
  }

  const result = {};

  sortedLanguageCodes.forEach((langCode) => {
    if (sortBy === "family") {
      const lineageKey = languageLineages[langCode];
      if (!lineageKey) throw new Error(`Missing lineageKey for '${langCode}'`);
      const ancestors = lineages[lineageKey];
      const categoryKey =
        Array.isArray(ancestors) && ancestors.length > 0
          ? ancestors[0]
          : lineageKey;
      const categoryLabel = getFamilyLabel(categoryKey);
      if (!result[categoryKey]) {
        result[categoryKey] = {
          title: categoryLabel,
          languages: [],
          _key: categoryKey,
        };
      }
      result[categoryKey].languages.push(langCode);
    } else if (linguisticConfig[sortBy]?.values) {
      const raw = languageData[langCode][sortBy];
      const keys = Array.isArray(raw) ? raw : [raw];
      keys.forEach((key) => {
        const label = getFeatureLabel(sortBy, key);
        if (!result[key]) {
          result[key] = { title: label, languages: [], _key: key };
        }
        result[key].languages.push(langCode);
      });
    } else if (numericFeatures.includes(sortBy)) {
      const categoryKey = languageData[langCode][sortBy];
      const categoryLabel = `${categoryKey}`;
      if (!result[categoryKey]) {
        result[categoryKey] = {
          title: categoryLabel,
          languages: [],
          _key: categoryKey,
        };
      }
      result[categoryKey].languages.push(langCode);
    }
  });

  let groups = Object.values(result);

  if (linguisticConfig[sortBy]?.values) {
    groups.sort((a, b) => {
      const scoreA = linguisticConfig[sortBy].values[a._key]?.score ?? 0;
      const scoreB = linguisticConfig[sortBy].values[b._key]?.score ?? 0;
      return isReverse ? scoreB - scoreA : scoreA - scoreB;
    });
  } else if (numericFeatures.includes(sortBy)) {
    groups.sort((a, b) => {
      const numA = Number(a._key);
      const numB = Number(b._key);
      return isReverse ? numB - numA : numA - numB;
    });
  } else {
    groups.sort((a, b) =>
      a.title.localeCompare(b.title, "und", { sensitivity: "base" }),
    );
  }

  return groups;
}
