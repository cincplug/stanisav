import "./LanguagesTab.css";
import { useEffect, useRef, useMemo } from "react";
import { useControls } from "../../contexts/ControlsContext";
import { useLanguageSelection } from "../../contexts/LanguageSelectionContext";
import { usePlaylist } from "../../contexts/PlaylistContext";
import linguisticConfig from "../../config/linguisticConfig.json";
import groupInfo from "../../config/groupInfo.json";
import { sortLanguages } from "../../utils/sortingUtils";

function LanguagesTab({ languageData, isActive }) {
  const { groupColors, selectedLanguage, selectLanguage } =
    useLanguageSelection();
  const { startFromLanguage } = usePlaylist();
  const { controls } = useControls();
  const buttonRefs = useRef({});

  const sortBy = controls.sortLanguagesBy;
  const isReverse = controls.isReverse;

  // Prepare all required data for sorting
  const languageCodes = useMemo(
    () => Object.keys(languageData),
    [languageData],
  );
  const languageGroups = useMemo(() => {
    const groups = {};
    languageCodes.forEach((code) => {
      groups[code] = languageData[code].group;
    });
    return groups;
  }, [languageCodes, languageData]);
  const speakerData = useMemo(() => {
    const speakers = {};
    languageCodes.forEach((code) => {
      speakers[code] = languageData[code].speakers;
    });
    return speakers;
  }, [languageCodes, languageData]);
  const typologicalFeatures = useMemo(() => {
    const features = {};
    languageCodes.forEach((code) => {
      features[code] = languageData[code];
    });
    features._groupInfo = groupInfo;
    return features;
  }, [languageCodes, languageData]);

  // Get sorted language codes using sortingUtils
  const sortedLanguageCodes = useMemo(
    () =>
      sortLanguages({
        allLanguages: [...languageCodes],
        languageData,
        languageGroups,
        speakerData,
        typologicalFeatures,
        sortLanguagesBy: sortBy,
        labelContent: controls.labelContent,
        isReverse,
      }),
    [
      languageCodes,
      languageData,
      languageGroups,
      speakerData,
      typologicalFeatures,
      sortBy,
      controls.labelContent,
      isReverse,
    ],
  );

  // Group for display
  const groupedByCategory = useMemo(() => {
    if (sortBy === "speakers") {
      return [
        {
          title: "All languages",
          languages: sortedLanguageCodes,
        },
      ];
    }
    if (sortBy === "alphabetically") {
      const result = {};
      sortedLanguageCodes.forEach((langCode) => {
        const name = languageData[langCode]?.name || langCode;
        const firstLetter = name[0]?.toUpperCase() || "#";
        if (!result[firstLetter]) {
          result[firstLetter] = {
            title: firstLetter,
            languages: [],
          };
        }
        result[firstLetter].languages.push(langCode);
      });
      // Sort letters A-Z
      return Object.values(result).sort((a, b) =>
        a.title.localeCompare(b.title, undefined, { sensitivity: "base" }),
      );
    }
    const result = {};
    sortedLanguageCodes.forEach((langCode) => {
      let categoryKey, categoryLabel;
      if (sortBy === "group") {
        categoryKey = languageData[langCode].group;
        categoryLabel = categoryKey;
      } else if (sortBy === "family") {
        const group = languageData[langCode].group;
        categoryKey = groupInfo[group]?.family || "Other";
        categoryLabel = categoryKey;
      } else if (linguisticConfig[sortBy]?.values) {
        categoryKey = languageData[langCode][sortBy];
        const config = linguisticConfig[sortBy].values?.[categoryKey];
        categoryLabel = config?.label || categoryKey || "Unknown";
      } else if (sortBy === "phonemeCount" || sortBy === "caseCount") {
        categoryKey = languageData[langCode][sortBy];
        categoryLabel = `${categoryKey}`;
      } else {
        categoryKey = "all";
        categoryLabel = "All languages";
      }
      if (!result[categoryKey]) {
        result[categoryKey] = {
          title: categoryLabel,
          languages: [],
        };
      }
      result[categoryKey].languages.push(langCode);
    });
    return Object.values(result);
  }, [sortedLanguageCodes, sortBy, languageData]);

  useEffect(() => {
    if (isActive && selectedLanguage && buttonRefs.current[selectedLanguage]) {
      buttonRefs.current[selectedLanguage].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [selectedLanguage, isActive]);

  return (
    <div className="control-section">
      <div className="languages-list">
        <h2>
          {linguisticConfig[sortBy]?.name ||
            (sortBy === "group" && "Language group") ||
            (sortBy === "family" && "Language family") ||
            (sortBy === "speakers" && "Number of speakers") ||
            "Languages"}
        </h2>
        {groupedByCategory.map((group) => (
          <div key={group.title} className="language-group-container">
            {/* Only render h3 if not sorting by speakers */}
            {sortBy !== "speakers" && (
              <h3 className="group-header">{group.title}</h3>
            )}
            <div className="languages-in-group">
              {group.languages.map((langCode) => {
                const groupName = languageData[langCode].group;
                return (
                  <button
                    key={langCode}
                    ref={(el) => (buttonRefs.current[langCode] = el)}
                    style={{ background: groupColors?.[groupName] }}
                    className={`language-item-button ${
                      selectedLanguage === langCode ? "selected" : ""
                    } ${!languageData[langCode]?.sr ? "todo-item" : ""}`}
                    onClick={() => {
                      selectLanguage(langCode);
                      startFromLanguage(langCode);
                    }}
                  >
                    {languageData[langCode]?.name || langCode}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LanguagesTab;
