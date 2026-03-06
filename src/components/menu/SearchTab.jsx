import { useEffect, useRef } from "react";
import { useLanguageSelection } from "../../contexts/LanguageSelectionContext";
import { usePlaylist } from "../../contexts/PlaylistContext";
import { useI18n } from "../../hooks/useI18n";
import tabsConfig from "../../config/tabsConfig.json";
import "./SearchTab.css";

// Search Results Component
function SearchResults({ searchTerm, searchResults, languageData }) {
  const threshold = tabsConfig.searchLengthThreshold;
  const { selectLanguage, selectedLanguage } = useLanguageSelection();
  const { startFromLanguage } = usePlaylist();
  const { t } = useI18n();

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
        <div className="language-grid">
          {searchResults.languages.map((lang) => {
            const lineageKey = languageData?.[lang.code]?.lineageKey;
            return (
              <button
                key={lang.code}
                className={`language-button-grid ${
                  selectedLanguage === lang.code ? "selected" : ""
                }`}
                onClick={() => {
                  selectLanguage(lang.code);
                  startFromLanguage(lang.code);
                }}
                title={lineageKey ? `${lang.name} (${lineageKey})` : lang.name}
              >
                <div className="language-name">
                  <div>{lang.name}</div>
                  <small>{lang.nativeName}</small>
                </div>
              </button>
            );
          })}
        </div>
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

function SearchTab({ searchTerm, searchResults, languageData }) {
  const { selectLanguage, selectedLanguage } = useLanguageSelection();
  const { startFromLanguage } = usePlaylist();
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
        selectLanguage(exactMatch.code);
        startFromLanguage(exactMatch.code);
      }
    }
  }, [searchTerm, searchResults, selectLanguage, startFromLanguage]);

  return (
    <div className="control-section">
      <SearchResults
        searchTerm={searchTerm}
        searchResults={searchResults}
        selectedLanguage={selectedLanguage}
        onLanguageFocus={selectLanguage}
        languageData={languageData}
      />
    </div>
  );
}

export default SearchTab;
