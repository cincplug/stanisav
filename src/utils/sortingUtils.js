import { getFeatureScore, isNumericFeature } from "./linguisticUtils";

export function sortLanguages({
  allLanguages,
  languageData,
  languageGroups,
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
          let labelA, labelB;
          if (labelContent === "isoCode") {
            labelA = a;
            labelB = b;
          } else {
            labelA = languageData[a]?.[labelContent] || "";
            labelB = languageData[b]?.[labelContent] || "";
          }
          // Use localeCompare with 'und' locale for full Unicode order
          return labelA.localeCompare(labelB, 'und', {
            sensitivity: "base",
            numeric: true,
          });
        });

      case "speakers":
        return allLanguages.sort((a, b) => {
          const speakersA = speakerData[a];
          const speakersB = speakerData[b];
          return speakersB - speakersA;
        });

      case "family":
        return allLanguages.sort((a, b) => {
          const groupA = languageGroups[a];
          const groupB = languageGroups[b];
          const familyA =
            typologicalFeatures?._groupInfo?.[groupA]?.family || groupA;
          const familyB =
            typologicalFeatures?._groupInfo?.[groupB]?.family || groupB;

          if (familyA !== familyB) {
            return familyA.localeCompare(familyB);
          }

          // If same family, sort by group
          if (groupA !== groupB) {
            return groupA.localeCompare(groupB);
          }

          const nameA = languageData[a]?.name;
          const nameB = languageData[b]?.name;
          return nameA.localeCompare(nameB);
        });

      case "group":
        return allLanguages.sort((a, b) => {
          const groupA = languageGroups[a];
          const groupB = languageGroups[b];

          if (groupA !== groupB) {
            return groupA.localeCompare(groupB);
          }

          const nameA = languageData[a]?.name;
          const nameB = languageData[b]?.name;
          return nameA.localeCompare(nameB);
        });

      // Typological feature sorting
      case "tonality":
      case "morphology":
      case "wordOrderFlexibility":
      case "wordOrder":
      case "evidentiality":
      case "verbAspect":
        return allLanguages.sort((a, b) => {
          const featureA = typologicalFeatures?.[a]?.[sortBy];
          const featureB = typologicalFeatures?.[b]?.[sortBy];

          // Handle missing values - put them at the end
          if (!featureA && !featureB) return 0;
          if (!featureA) return 1;
          if (!featureB) return -1;

          // Sort by score if available
          const scoreA = getFeatureScore(sortBy, featureA);
          const scoreB = getFeatureScore(sortBy, featureB);
          if (scoreA !== null && scoreB !== null) {
            if (scoreA !== scoreB) return scoreA - scoreB;
          }

          // Fallback to alphabetical
          const comparison = String(featureA).localeCompare(
            String(featureB),
            undefined,
            {
              sensitivity: "base",
            },
          );

          // If same feature value, sort by name
          if (comparison === 0) {
            const nameA = languageData[a]?.name;
            const nameB = languageData[b]?.name;
            return String(nameA).localeCompare(String(nameB));
          }

          return comparison;
        });

      case "phonemeCount":
      case "caseCount":
        return allLanguages.sort((a, b) => {
          const featureA = typologicalFeatures?.[a]?.[sortBy];
          const featureB = typologicalFeatures?.[b]?.[sortBy];

          // Handle missing values - put them at the end
          if (featureA === undefined && featureB === undefined) return 0;
          if (featureA === undefined) return 1;
          if (featureB === undefined) return -1;

          // Sort numeric features numerically (descending by default)
          const comparison = featureB - featureA;

          // If same feature value, sort by name
          if (comparison === 0) {
            const nameA = languageData[a]?.name;
            const nameB = languageData[b]?.name;
            return nameA.localeCompare(nameB);
          }

          return comparison;
        });

      default:
        return allLanguages.sort((a, b) => {
          const groupA = languageGroups[a];
          const groupB = languageGroups[b];

          if (groupA !== groupB) {
            return groupA.localeCompare(groupB);
          }

          const nameA = languageData[a]?.name;
          const nameB = languageData[b]?.name;
          return nameA.localeCompare(nameB);
        });
    }
  })();

  return isReverse ? sorted.reverse() : sorted;
}

/**
 * Sorts feature values for a given feature key.
 * @param {string} feature - Feature key.
 * @param {Array} values - Array of values to sort.
 * @param {boolean} isReverse - Whether to reverse the order.
 * @returns {Array} Sorted values.
 */
export function sortFeatureValues(feature, values, isReverse = false) {
  const sorted = [...values];
  if (isNumericFeature(feature)) {
    sorted.sort((a, b) => Number(a) - Number(b));
  } else {
    sorted.sort((a, b) => {
      const scoreA = getFeatureScore(feature, a);
      const scoreB = getFeatureScore(feature, b);
      if (scoreA !== null && scoreB !== null) {
        return scoreA - scoreB;
      }
      return String(a).localeCompare(String(b), undefined, {
        sensitivity: "base",
      });
    });
  }
  return isReverse ? sorted.reverse() : sorted;
}
