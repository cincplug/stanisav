import linguisticConfig from "../config/linguisticConfig.json";
import numericFeatures from "../config/numericFeatures.json";
import { getFamilyLabel } from "./i18nUtils";
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

export function groupLanguages({
  sortedLanguageCodes,
  sortBy,
  languageData,
  languageLineages,
  labelContent,
  isReverse,
}) {
  if (sortBy === "speakers") {
    const result = {};
    sortedLanguageCodes.forEach((langCode) => {
      const group = getSpeakerGroup(languageData[langCode].speakers);
      if (!group) return;

      if (!result[group.title]) {
        result[group.title] = {
          title: group.title,
          languages: [],
          _min: group.min,
        };
      }
      result[group.title].languages.push(langCode);
    });

    return Object.values(result)
      .sort((a, b) => (isReverse ? b._min - a._min : a._min - b._min))
      .map(({ title, languages }) => ({ title, languages }));
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
    return Object.values(result).sort((a, b) => {
      const cmp = a.title.localeCompare(b.title, "und", {
        sensitivity: "base",
      });
      return isReverse ? -cmp : cmp;
    });
  }

  if (sortBy === "family") {
    const result = {};
    sortedLanguageCodes.forEach((langCode) => {
      const lineageKey = languageLineages[langCode];
      if (!lineageKey) throw new Error(`Missing lineageKey for '${langCode}'`);

      let categoryKey = lineageKey;

      if (!result[categoryKey]) {
        result[categoryKey] = {
          title: getFamilyLabel(categoryKey),
          languages: [],
        };
      }
      result[categoryKey].languages.push(langCode);
    });
    return Object.values(result);
  }

  const result = {};

  sortedLanguageCodes.forEach((langCode) => {
    if (linguisticConfig[sortBy]?.values) {
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
      if (!result[categoryKey]) {
        result[categoryKey] = {
          title: `${categoryKey}`,
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

export const speakerGroups = [
  { title: "< 10M", min: -Infinity, max: 10 },
  { title: "10 - 50M", min: 10, max: 50 },
  { title: "50 - 100M", min: 50, max: 100 },
  { title: "> 100M", min: 100, max: Infinity },
];

export const getSpeakerGroup = (speakers) =>
  speakerGroups.find((group) => speakers >= group.min && speakers < group.max);
