import lineages from "../config/lineages.json";
import { getLocalizedLanguageName } from "../i18n/runtime";
import {
  getFeatureScore,
  getLanguageLabel,
  isNumericFeature,
} from "./linguisticUtils";

const collator = new Intl.Collator("und", {
  sensitivity: "base",
  numeric: true,
});

const invariant = (condition, message) => {
  if (!condition) throw new Error(message);
};

const getLineageKey = (code, languages) => {
  const lineageKey = languages?.[code]?.lineageKey;
  if (!lineageKey) throw new Error(`Missing lineageKey for '${code}'`);
  return lineageKey;
};

export const getLineagePath = (code, languages) => {
  const lineageKey = getLineageKey(code, languages);
  const ancestors = lineages?.[lineageKey];
  if (!Array.isArray(ancestors)) {
    throw new Error(`Missing lineage in lineages.json for '${lineageKey}'`);
  }
  return [...ancestors, lineageKey];
};

export const comparePath = (aPath, bPath) => {
  const len = Math.max(aPath.length, bPath.length);
  for (let i = 0; i < len; i += 1) {
    const cmp = collator.compare(aPath[i] || "", bPath[i] || "");
    if (cmp !== 0) return cmp;
  }
  return 0;
};

// Returns the lineage path for a leaf lineage key directly (not via language code)
export const getLineagePathForKey = (lineageKey) => {
  const ancestors = lineages?.[lineageKey];
  if (!Array.isArray(ancestors)) return [lineageKey];
  return [...ancestors, lineageKey];
};

export function sortLanguages({
  allLanguages,
  languages,
  sortBy,
  labelContent,
  isReverse,
}) {
  const sorted = (() => {
    switch (sortBy) {
      case "alphabetically":
        return allLanguages.sort((a, b) => {
          const labelA = getLanguageLabel(a, languages, labelContent);
          const labelB = getLanguageLabel(b, languages, labelContent);

          invariant(labelA !== null, `Missing '${labelContent}' for '${a}'`);
          invariant(labelB !== null, `Missing '${labelContent}' for '${b}'`);

          return collator.compare(String(labelA), String(labelB));
        });

      case "speakers":
        return allLanguages.sort((a, b) => {
          const cmp = languages[a].speakers - languages[b].speakers;
          if (cmp !== 0) return cmp;
          return collator.compare(
            getLocalizedLanguageName(a),
            getLocalizedLanguageName(b),
          );
        });

      case "family":
        return allLanguages.sort((a, b) => {
          const pathA = getLineagePath(a, languages);
          const pathB = getLineagePath(b, languages);

          const byPath = comparePath(pathA, pathB);
          if (byPath !== 0) return byPath;

          return collator.compare(
            getLocalizedLanguageName(a),
            getLocalizedLanguageName(b),
          );
        });

      case "tonality":
      case "morphology":
      case "wordOrderFlexibility":
      case "wordOrder":
      case "evidentiality":
      case "verbAspect":
      case "nounClassCount":
      case "phonemeCount":
      case "caseCount":
        return allLanguages.sort((a, b) => {
          const featureA = languages[a][sortBy];
          const featureB = languages[b][sortBy];

          const scoreA = getFeatureScore(sortBy, featureA);
          const scoreB = getFeatureScore(sortBy, featureB);

          if (scoreA !== null && scoreB !== null && scoreA !== scoreB) {
            return scoreA - scoreB;
          }

          const cmp = collator.compare(String(featureA), String(featureB));
          if (cmp !== 0) return cmp;

          return collator.compare(
            getLocalizedLanguageName(a),
            getLocalizedLanguageName(b),
          );
        });

      default:
        throw new Error(`Unsupported sortBy value '${sortBy}'`);
    }
  })();

  return isReverse ? sorted.reverse() : sorted;
}

export function sortFeatureValues(feature, values, isReverse = false) {
  const sorted = [...values];
  if (isNumericFeature(feature)) {
    sorted.sort((a, b) => Number(a) - Number(b));
  } else {
    sorted.sort((a, b) => {
      const scoreA = getFeatureScore(feature, a);
      const scoreB = getFeatureScore(feature, b);
      if (scoreA !== null && scoreB !== null) return scoreA - scoreB;
      return collator.compare(String(a), String(b));
    });
  }
  return isReverse ? sorted.reverse() : sorted;
}
