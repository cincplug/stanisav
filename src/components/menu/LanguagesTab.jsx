import "./LanguagesTab.css";
import { useEffect, useRef, useMemo, useCallback } from "react";
import { useControls } from "../../contexts/ControlsContext";
import { useLanguageSelection } from "../../contexts/LanguageSelectionContext";
import { usePlaylist } from "../../contexts/PlaylistContext";
import controlsConfig from "../../config/controlsConfig.json";
import linguisticConfig from "../../config/linguisticConfig.json";
import numericFeatures from "../../config/numericFeatures.json";
import lineages from "../../config/lineages.json";
import {
  getFamilyLabel,
  localizeControlConfig,
} from "../../utils/configI18nUtils";
import { getFeatureLabel } from "../../utils/linguisticUtils";
import { getLanguageLabel } from "../../utils/languageDisplayUtils";
import { sortLanguages } from "../../utils/sortingUtils";
import { buildLanguageTree } from "../../utils/languageGroupingUtils";
import ControlItem from "./ControlItem";
import LanguageTree from "./LanguageTree";

function LanguagesTab({ languageData, isActive, languageColors = {} }) {
  const { selectedLanguage, selectLanguage } = useLanguageSelection();
  const { startFromLanguage } = usePlaylist();
  const { controls, updateControl } = useControls();
  const buttonRefs = useRef({});

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

  // Only apply nested lineage grouping for sortBy === "family"
  const languageTreeData = useMemo(() => {
    if (sortBy === "family") {
      return buildLanguageTree(sortedLanguageCodes, languageData, lineages);
    }
    return null;
  }, [sortedLanguageCodes, sortBy, languageData]);

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
        const label = getLanguageLabel(langCode, languageData, labelContent);
        // Use the first Unicode character, uppercased for grouping
        const firstChar =
          Array.from(label.trim())[0]?.toLocaleUpperCase("und") || "#";
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
    // For sorting group keys
    let groupSortArr = [];
    sortedLanguageCodes.forEach((langCode) => {
      let categoryKey, categoryLabel;

      if (sortBy === "family") {
        const lineageKey = languageLineages[langCode];
        if (!lineageKey) {
          throw new Error(`Missing lineageKey for '${langCode}'`);
        }
        const ancestors = lineages[lineageKey];
        categoryKey =
          Array.isArray(ancestors) && ancestors.length > 0
            ? ancestors[0]
            : lineageKey;
        categoryLabel = getFamilyLabel(categoryKey);
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
        return;
      } else if (numericFeatures.includes(sortBy)) {
        categoryKey = languageData[langCode][sortBy];
        categoryLabel = `${categoryKey}`;
      }

      if (!result[categoryKey]) {
        result[categoryKey] = {
          title: categoryLabel,
          languages: [],
          _key: categoryKey,
        };
      }
      result[categoryKey].languages.push(langCode);
    });

    let groups = Object.values(result);
    // Determine sorting method for group titles
    if (linguisticConfig[sortBy]?.values) {
      // Sort by score for scored features
      groups.sort((a, b) => {
        const scoreA = linguisticConfig[sortBy].values[a._key]?.score ?? 0;
        const scoreB = linguisticConfig[sortBy].values[b._key]?.score ?? 0;
        return isReverse ? scoreB - scoreA : scoreA - scoreB;
      });
    } else if (numericFeatures.includes(sortBy)) {
      // Sort numerically for numeric features
      groups.sort((a, b) => {
        const numA = Number(a._key);
        const numB = Number(b._key);
        return isReverse ? numB - numA : numA - numB;
      });
    } else {
      // Fallback: alphabetical
      groups.sort((a, b) =>
        a.title.localeCompare(b.title, "und", { sensitivity: "base" }),
      );
    }
    return groups;
  }, [
    sortedLanguageCodes,
    sortBy,
    languageData,
    labelContent,
    languageLineages,
    isReverse,
  ]);

  // Get Sorting controls
  const sortingControls = Object.entries(controlsConfig)
    .filter(
      ([_id, config]) =>
        config.group === "Languages tab" && config.isUserEditable,
    )
    .map(([id, config]) => ({ id, ...localizeControlConfig(id, config) }));

  useEffect(() => {
    if (isActive && selectedLanguage && buttonRefs.current[selectedLanguage]) {
      buttonRefs.current[selectedLanguage].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [selectedLanguage, isActive]);

  const onSelectLanguage = useCallback(
    (langCode) => {
      selectLanguage(langCode);
      startFromLanguage(langCode);
    },
    [selectLanguage, startFromLanguage],
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
        {sortBy === "family" ? (
          <LanguageTree
            tree={languageTreeData}
            languageData={languageData}
            labelContent={labelContent}
            selectedLanguage={selectedLanguage}
            buttonRefs={buttonRefs}
            onSelectLanguage={onSelectLanguage}
            languageColors={languageColors}
          />
        ) : (
          groupedByCategory.map((group) => (
            <section key={group.title} className="language-group-container">
              {sortBy !== "speakers" && (
                <h3 className="group-header">{group.title}</h3>
              )}

              <LanguageTree
                languages={group.languages}
                languageData={languageData}
                labelContent={labelContent}
                selectedLanguage={selectedLanguage}
                buttonRefs={buttonRefs}
                onSelectLanguage={onSelectLanguage}
                languageColors={languageColors}
              />
            </section>
          ))
        )}
      </div>
    </div>
  );
}

export default LanguagesTab;
