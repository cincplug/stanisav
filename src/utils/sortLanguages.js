export function sortLanguages({
  allLanguages,
  languageData,
  languageGroups,
  speakerData,
  typologicalFeatures,
  sortLanguagesBy,
  labelContent,
  isReverse,
}) {
  const sorted = (() => {
    switch (sortLanguagesBy) {
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
          return labelA.localeCompare(labelB, undefined, {
            sensitivity: "base",
          });
        });

      case "speakers":
        return allLanguages.sort((a, b) => {
          const speakersA = speakerData[a];
          const speakersB = speakerData[b];
          return speakersB - speakersA;
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
        return allLanguages.sort((a, b) => {
          const featureA = typologicalFeatures?.[a]?.[sortLanguagesBy];
          const featureB = typologicalFeatures?.[b]?.[sortLanguagesBy];

          // Handle missing values - put them at the end
          if (!featureA && !featureB) return 0;
          if (!featureA) return 1;
          if (!featureB) return -1;

          // Sort categorical features alphabetically
          const comparison = featureA.localeCompare(featureB);

          // If same feature value, sort by name
          if (comparison === 0) {
            const nameA = languageData[a]?.name;
            const nameB = languageData[b]?.name;
            return nameA.localeCompare(nameB);
          }

          return comparison;
        });

      case "phonemeCount":
      case "caseCount":
        return allLanguages.sort((a, b) => {
          const featureA = typologicalFeatures?.[a]?.[sortLanguagesBy];
          const featureB = typologicalFeatures?.[b]?.[sortLanguagesBy];

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
