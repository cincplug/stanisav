import { getFeatureScore, isNumericFeature } from "./linguisticUtils";
import lineages from "../config/lineages.json";

const collator = new Intl.Collator("und", {
  sensitivity: "base",
  numeric: true,
});

const invariant = (condition, message) => {
  if (!condition) throw new Error(message);
};

const getLineageKey = (code, languageLineages) => {
  const lineageKey = languageLineages?.[code];
  if (!lineageKey) throw new Error(`Missing lineageKey for '${code}'`);
  return lineageKey;
};

const getLineagePath = (code, languageLineages) => {
  const lineageKey = getLineageKey(code, languageLineages);
  const ancestors = lineages?.[lineageKey];
  if (!Array.isArray(ancestors)) {
    throw new Error(`Missing lineage in lineages.json for '${lineageKey}'`);
  }
  return [...ancestors, lineageKey];
};

const comparePath = (aPath, bPath) => {
  const len = Math.max(aPath.length, bPath.length);
  for (let i = 0; i < len; i += 1) {
    const cmp = collator.compare(aPath[i] || "", bPath[i] || "");
    if (cmp !== 0) return cmp;
  }
  return 0;
};

export function sortLanguages({
  allLanguages,
  languageData,
  languageLineages,
  speakerData,
  typologicalFeatures,
  sortBy,
  labelContent,
  isReverse,
}) {
  const sorted = (() => {
    switch (sortBy) {
      case "alphabetically":
        return allLanguages.sort((a, b) => {
          const labelA =
            labelContent === "isoCode" ? a : languageData[a]?.[labelContent];
          const labelB =
            labelContent === "isoCode" ? b : languageData[b]?.[labelContent];

          invariant(labelA != null, `Missing '${labelContent}' for '${a}'`);
          invariant(labelB != null, `Missing '${labelContent}' for '${b}'`);

          return collator.compare(String(labelA), String(labelB));
        });

      case "speakers":
        return allLanguages.sort((a, b) => speakerData[b] - speakerData[a]);

      case "family":
        return allLanguages.sort((a, b) => {
          const pathA = getLineagePath(a, languageLineages);
          const pathB = getLineagePath(b, languageLineages);

          const byPath = comparePath(pathA, pathB);
          if (byPath !== 0) return byPath;

          return collator.compare(languageData[a].name, languageData[b].name);
        });

      case "tonality":
      case "morphology":
      case "wordOrderFlexibility":
      case "wordOrder":
      case "evidentiality":
      case "verbAspect":
      case "nounClassCount":
      case "maxClusterSize":
        return allLanguages.sort((a, b) => {
          const featureA = typologicalFeatures[a][sortBy];
          const featureB = typologicalFeatures[b][sortBy];

          const scoreA = getFeatureScore(sortBy, featureA);
          const scoreB = getFeatureScore(sortBy, featureB);

          if (scoreA !== null && scoreB !== null && scoreA !== scoreB) {
            return scoreA - scoreB;
          }

          const cmp = collator.compare(String(featureA), String(featureB));
          if (cmp !== 0) return cmp;

          return collator.compare(languageData[a].name, languageData[b].name);
        });

      case "phonemeCount":
      case "caseCount":
        return allLanguages.sort((a, b) => {
          const cmp =
            typologicalFeatures[b][sortBy] - typologicalFeatures[a][sortBy];
          if (cmp !== 0) return cmp;
          return collator.compare(languageData[a].name, languageData[b].name);
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
