import "./LanguagesTab.css";
import { useEffect, useRef, useMemo, useCallback } from "react";
import { useControls } from "../../contexts/ControlsContext";
import { useLanguageSelection } from "../../contexts/LanguageSelectionContext";
import { usePlaylist } from "../../contexts/PlaylistContext";
import lineages from "../../config/lineages.json";
import { getSortingData, sortLanguages } from "../../utils/sortingUtils";
import { buildLanguageTree, groupLanguages } from "../../utils/groupingUtils";
import LanguageTree from "./LanguageTree";

function LanguagesTab({ languageData, isSelected, languageColors = {} }) {
  const { selectedLanguage } = useLanguageSelection();
  const { startFromLanguage } = usePlaylist();
  const { controls } = useControls();
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
