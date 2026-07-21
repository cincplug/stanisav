import { useCallback, useEffect, useMemo, useRef } from "react";
import { useConfigContext } from "../../contexts/ConfigContext";
import { useLanguageSelectionContext } from "../../contexts/LanguageSelectionContext";
import { usePlaylistContext } from "../../contexts/PlaylistContext";
import { useSortedLanguages } from "../../hooks/useSortedLanguages";
import { buildLanguageTree, groupLanguages } from "../../utils/groupingUtils";
import "./LanguagesTab.css";
import LanguageTree from "./LanguageTree";

function LanguagesTab({
  languages,
  lineages,
  isSelected,
  languageColors = {},
}) {
  const { selectedLanguage } = useLanguageSelectionContext();
  const { startFromLanguage, previewLanguageCode, setPreviewToLanguage } =
    usePlaylistContext();
  const buttonRefs = useRef({});

  const { config } = useConfigContext();
  const { sortBy, labelContent, isReverse } = config;

  // Use the centralized hook for sorted language codes
  const sortedLanguageCodes = useSortedLanguages();

  const languageTreeData = useMemo(() => {
    if (sortBy === "family") {
      return buildLanguageTree(sortedLanguageCodes, languages, lineages);
    }
    return null;
  }, [sortedLanguageCodes, sortBy, languages, lineages]);

  const groups = useMemo(() => {
    return groupLanguages({
      sortedLanguageCodes,
      sortBy,
      languages,
      lineages,
      labelContent,
      isReverse,
    });
  }, [
    sortedLanguageCodes,
    sortBy,
    languages,
    lineages,
    labelContent,
    isReverse,
  ]);

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

  // Visual-only sync: scrolls the cursor into view but never steals real
  // DOM focus, since this can fire without any user action (autoplay) and
  // stealing focus would be disorienting for keyboard/screen-reader users
  useEffect(() => {
    if (
      isSelected &&
      previewLanguageCode &&
      previewLanguageCode !== selectedLanguage &&
      buttonRefs.current[previewLanguageCode]
    ) {
      buttonRefs.current[previewLanguageCode].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [previewLanguageCode, selectedLanguage, isSelected]);

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
            languagesData={languages}
            labelContent={labelContent}
            selectedLanguage={selectedLanguage}
            previewLanguageCode={previewLanguageCode}
            buttonRefs={buttonRefs}
            onSelectLanguage={onSelectLanguage}
            onFocusLanguage={setPreviewToLanguage}
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
                languagesData={languages}
                labelContent={labelContent}
                selectedLanguage={selectedLanguage}
                previewLanguageCode={previewLanguageCode}
                buttonRefs={buttonRefs}
                onSelectLanguage={onSelectLanguage}
                onFocusLanguage={setPreviewToLanguage}
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
