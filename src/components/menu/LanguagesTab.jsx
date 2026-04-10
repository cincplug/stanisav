import "./LanguagesTab.css";
import { useEffect, useRef, useMemo, useCallback } from "react";
import { useControls } from "../../contexts/ControlsContext";
import { useLanguageSelection } from "../../contexts/LanguageSelectionContext";
import { usePlaylist } from "../../contexts/PlaylistContext";
import controlsConfig from "../../config/controlsConfig.json";
import lineages from "../../config/lineages.json";
import { localizeControlConfig } from "../../utils/configI18nUtils";
import { getSortingData, sortLanguages } from "../../utils/sortingUtils";
import {
  buildLanguageTree,
  groupLanguages,
} from "../../utils/languageGroupingUtils";
import ControlItem from "./ControlItem";
import LanguageTree from "./LanguageTree";

function LanguagesTab({ languageData, isSelected, languageColors = {} }) {
  const { selectedLanguage } = useLanguageSelection();
  const { startFromLanguage } = usePlaylist();
  const { controls, updateControl } = useControls();
  const buttonRefs = useRef({});

  const { sortBy, labelContent, isReverse } = controls;

  const { languageCodes, languageLineages, speakerData, typologicalFeatures } =
    useMemo(() => getSortingData(languageData), [languageData]);

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

  const languageTreeData = useMemo(() => {
    if (sortBy === "family") {
      return buildLanguageTree(sortedLanguageCodes, languageData, lineages);
    }
    return null;
  }, [sortedLanguageCodes, sortBy, languageData]);

  const groups = useMemo(
    () =>
      groupLanguages({
        sortedLanguageCodes,
        sortBy,
        languageData,
        languageLineages,
        labelContent,
        isReverse,
      }),
    [
      sortedLanguageCodes,
      sortBy,
      languageData,
      languageLineages,
      labelContent,
      isReverse,
    ],
  );

  const sortingControls = Object.entries(controlsConfig)
    .filter(
      ([_id, config]) =>
        config.group === "Languages tab" && config.isUserEditable,
    )
    .map(([id, config]) => ({ id, ...localizeControlConfig(id, config) }));

  useEffect(() => {
    if (
      isSelected &&
      selectedLanguage &&
      buttonRefs.current[selectedLanguage]
    ) {
      buttonRefs.current[selectedLanguage].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [selectedLanguage, isSelected]);

  const onSelectLanguage = useCallback(
    (langCode) => {
      startFromLanguage(langCode);
    },
    [startFromLanguage],
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
          groups.map((group, index) => (
            <fieldset key={index} className="language-group-container">
              {group.title && (
                <legend className="group-header">{group.title}</legend>
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
            </fieldset>
          ))
        )}
      </div>
    </div>
  );
}

export default LanguagesTab;
