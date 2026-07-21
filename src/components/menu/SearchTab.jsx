import { useEffect, useRef } from "react";
import tabsConfig from "../../config/tabsConfig.json";
import { useI18nContext } from "../../contexts/I18nContext";
import { useLanguageSelectionContext } from "../../contexts/LanguageSelectionContext";
import { usePlaylistContext } from "../../contexts/PlaylistContext";
import { getFamilyLabel } from "../../utils/i18nUtils";
import SearchBox from "./SearchBox";
import "./SearchTab.css";

// Search Results Component
function SearchResults({
  searchTerm,
  searchResults,
  languages,
  languageColors = {},
}) {
  const threshold = tabsConfig.searchLengthThreshold;
  const { selectedLanguage } = useLanguageSelectionContext();
  const { startFromLanguage } = usePlaylistContext();
  const { t } = useI18nContext();

  // Handler for selecting a language from results
  const handleSelectLanguage = (langCode) => {
    startFromLanguage(langCode);
  };

  if (!searchTerm) return null;

  // Don't show results if search term is below threshold
  if (searchTerm.length < threshold) {
    return (
      <div className="search-threshold-message">
        {t("search.threshold", { threshold })}
      </div>
    );
  }

  if (searchResults.languages && searchResults.languages.length > 0) {
    return (
      <fieldset className="results-fieldset">
        <legend className="results-legend">
          {t("search.results", { count: searchResults.languages.length })}
        </legend>
        <ul className="languages-in-group" role="list">
          {searchResults.languages.map((lang) => {
            const lineageKey = languages?.[lang.code]?.lineageKey;
            const localizedLineageLabel = lineageKey
              ? getFamilyLabel(lineageKey)
              : null;
            return (
              <li key={lang.code}>
                <button
                  className={`language-item-button ${
                    selectedLanguage === lang.code ? "selected" : ""
                  }`}
                  style={{ background: languageColors[lang.code] }}
                  onClick={() => handleSelectLanguage(lang.code)}
                  title={
                    localizedLineageLabel
                      ? `${lang.name} (${localizedLineageLabel})`
                      : lang.name
                  }
                >
                  {lang.name}
                </button>
              </li>
            );
          })}
        </ul>
      </fieldset>
    );
  }

  if (searchResults.languages && searchResults.languages.length === 0) {
    return (
      <div className="search-no-results">
        {t("search.noResults", { term: searchTerm })}
      </div>
    );
  }

  return null;
}

function SearchTab({
  searchTerm,
  searchResults,
  languages,
  languageColors,
  setSearchTerm,
  clearSearch,
}) {
  const { startFromLanguage } = usePlaylistContext();
  const lastAutoSelectedRef = useRef(null);

  // Handle exact match selection (only once per unique match)
  useEffect(() => {
    const threshold = tabsConfig.searchLengthThreshold;

    if (!searchTerm || searchTerm.length < threshold) {
      lastAutoSelectedRef.current = null;
      return;
    }

    if (searchResults.languages && searchResults.languages.length > 0) {
      const exactMatch = searchResults.languages.find(
        (lang) => lang.name.toLowerCase() === searchTerm.toLowerCase(),
      );

      if (exactMatch && lastAutoSelectedRef.current !== exactMatch.code) {
        lastAutoSelectedRef.current = exactMatch.code;
        startFromLanguage(exactMatch.code);
      }
    }
  }, [searchTerm, searchResults, startFromLanguage]);

  return (
    <div className="control-section">
      <SearchBox
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        clearSearch={clearSearch}
      />
      <SearchResults
        searchTerm={searchTerm}
        searchResults={searchResults}
        languages={languages}
        languageColors={languageColors}
      />
    </div>
  );
}

export default SearchTab;
