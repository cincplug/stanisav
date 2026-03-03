import "./LanguagesTab.css";
import { useEffect, useRef, useMemo } from "react";
import { useAppState } from "../../contexts/AppStateContext";
import { useControls } from "../../contexts/ControlsContext";
import { useLanguageSelection } from "../../contexts/LanguageSelectionContext";
import { usePlaylist } from "../../contexts/PlaylistContext";
import controlsConfig from "../../config/controlsConfig.json";
import linguisticConfig from "../../config/linguisticConfig.json";
import numericFeatures from "../../config/numericFeatures.json";
import lineages from "../../config/lineages.json";
import { sortLanguages } from "../../utils/sortingUtils";
import { calculateLanguageColors } from "../../utils/colorUtils";
import ControlItem from "./ControlItem";

function LanguagesTab({ languageData, isActive }) {
  const { selectedLanguage, selectLanguage } = useLanguageSelection();
  const { startFromLanguage } = usePlaylist();
  const { controls, updateControl } = useControls();
  const buttonRefs = useRef({});
  const { data } = useAppState();

  const { sortBy, labelContent, isReverse } = controls;

  // Prepare all required data for sorting
  const languageCodes = useMemo(
    () => Object.keys(languageData),
    [languageData],
  );
  const languageLineages = useMemo(() => {
    const lineages = {};
    languageCodes.forEach((code) => {
      lineages[code] = languageData[code].lineageKey;
    });
    return lineages;
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
    return features;
  }, [languageCodes, languageData]);

  // Get sorted language codes using sortingUtils
  const sortedLanguageCodes = useMemo(
    () =>
      sortLanguages({
        allLanguages: [...languageCodes],
        languageData,
        languageLineages,
        speakerData,
        typologicalFeatures,
        sortBy,
        labelContent,
        isReverse,
      }),
    [
      languageCodes,
      languageData,
      languageLineages,
      speakerData,
      typologicalFeatures,
      sortBy,
      labelContent,
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
        let label;
        if (labelContent === "isoCode") {
          label = langCode;
        } else {
          label = languageData[langCode]?.[labelContent] || langCode;
        }
        // Use the first Unicode character, uppercased for grouping
        const safeLabel =
          typeof label === "string" && label.trim() ? label.trim() : langCode;
        const firstChar =
          Array.from(safeLabel)[0]?.toLocaleUpperCase("und") || "#";
        if (!result[firstChar]) {
          result[firstChar] = {
            title: firstChar,
            languages: [],
          };
        }
        result[firstChar].languages.push(langCode);
      });
      // Sort group titles in full Unicode order
      return Object.values(result).sort((a, b) =>
        a.title.localeCompare(b.title, "und", { sensitivity: "base" }),
      );
    }
    const result = {};
    sortedLanguageCodes.forEach((langCode) => {
      let categoryKey, categoryLabel;

      if (sortBy === "family") {
        const lineageKey = languageLineages[langCode];
        const ancestors = lineages[lineageKey] || [];
        categoryKey = ancestors[0] || lineageKey;
        categoryLabel = categoryKey;
      } else if (linguisticConfig[sortBy]?.values) {
        categoryKey = languageData[langCode][sortBy];
        const config = linguisticConfig[sortBy].values?.[categoryKey];
        categoryLabel = config?.label;
      } else if (numericFeatures.includes(sortBy)) {
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
  }, [
    sortedLanguageCodes,
    sortBy,
    languageData,
    labelContent,
    languageLineages,
  ]);

  // Get Sorting controls
  const sortingControls = Object.entries(controlsConfig)
    .filter(
      ([_id, config]) =>
        config.group === "Languages tab" && config.isUserEditable,
    )
    .map(([id, config]) => ({ id, ...config }));

  useEffect(() => {
    if (isActive && selectedLanguage && buttonRefs.current[selectedLanguage]) {
      buttonRefs.current[selectedLanguage].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [selectedLanguage, isActive]);

  // Calculate colors for all languages with hue shifts
  const languageColors = useMemo(
    () => calculateLanguageColors(languageData, languageLineages),
    [languageData, languageLineages],
  );

  return (
    <div className="control-section">
      <div className="controls-grid sorting-controls">
        {sortingControls.map((control) => (
          <ControlItem
            key={control.id}
            control={control}
            value={controls[control.id]}
            onChange={(value) => updateControl(control.id, value)}
          />
        ))}
      </div>

      <div className="languages-list">
        {groupedByCategory.map((group) => (
          <div key={group.title} className="language-group-container">
            {/* Only render h3 if not sorting by speakers */}
            {sortBy !== "speakers" && (
              <h3 className="group-header">{group.title}</h3>
            )}
            <div className="languages-in-group">
              {group.languages.map((langCode) => {
                const label =
                  labelContent === "isoCode"
                    ? langCode
                    : languageData[langCode]?.[labelContent];

                return (
                  <button
                    key={langCode}
                    ref={(el) => (buttonRefs.current[langCode] = el)}
                    style={{ background: languageColors[langCode] }}
                    className={`language-item-button ${
                      selectedLanguage === langCode ? "selected" : ""
                    } ${!languageData[langCode]?.sr ? "todo-item" : ""}`}
                    onClick={() => {
                      selectLanguage(langCode);
                      startFromLanguage(langCode);
                    }}
                  >
                    {label}
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
