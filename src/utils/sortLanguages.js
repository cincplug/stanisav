export function sortLanguages({
  allLanguages,
  languageData,
  languageGroups,
  speakerData,
  sortLanguagesBy,
  labelContent,
  isReverse
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
            sensitivity: "base"
          });
        });

      case "speakers":
        return allLanguages.sort((a, b) => {
          const speakersA = speakerData[a];
          const speakersB = speakerData[b];
          return speakersB - speakersA;
        });

      case "group":
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
