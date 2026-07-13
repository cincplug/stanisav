import { useCallback, useEffect, useMemo, useRef } from "react";
import lineages from "../../config/lineages.json";
import { useConfigContext } from "../../contexts/ConfigContext";
import { useLanguageSelectionContext } from "../../contexts/LanguageSelectionContext";
import { usePlaylistContext } from "../../contexts/PlaylistContext";
import { useSortedLanguages } from "../../hooks/useSortedLanguages";
import { buildLanguageTree, groupLanguages } from "../../utils/groupingUtils";
import "./LanguagesTab.css";
import LanguageTree from "./LanguageTree";

function LanguagesTab({ languageData, isSelected, languageColors = {} }) {
  const { selectedLanguage } = useLanguageSelectionContext();
  const { startFromLanguage } = usePlaylistContext();
  const buttonRefs = useRef({});

  const { config } = useConfigContext();
  const { sortBy, labelContent, isReverse } = config;

  // Use the centralized hook for sorted language codes
  const sortedLanguageCodes = useSortedLanguages();

  const languageTreeData = useMemo(() => {
    if (sortBy === "family") {
      return buildLanguageTree(sortedLanguageCodes, languageData, lineages);
    }
    return null;
  }, [sortedLanguageCodes, sortBy, languageData]);

  const groups = useMemo(() => {
    const languageLineages = {};
    sortedLanguageCodes.forEach((code) => {
      languageLineages[code] = languageData[code].lineageKey;
    });

    return groupLanguages({
      sortedLanguageCodes,
      sortBy,
      languageData,
      languageLineages,
      labelContent,
      isReverse,
    });
  }, [sortedLanguageCodes, sortBy, languageData, labelContent, isReverse]);

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
