import { useEffect, useRef } from "react";
import tabsConfig from "../../config/tabsConfig.json";
import "./SearchTab.css";

// Search Results Component
function SearchResults({
  searchTerm,
  searchResults,
  selectedLanguage,
  onLanguageFocus,
  languageData
}) {
  const threshold = tabsConfig.searchLengthThreshold;

  if (!searchTerm) return null;

  // Don't show results if search term is below threshold
  if (searchTerm.length < threshold) {
    return (
      <div className="search-threshold-message">
        Type at least {threshold} characters to search...
      </div>
    );
  }

  if (searchResults.languages && searchResults.languages.length > 0) {
    return (
      <fieldset className="results-fieldset">
        <legend className="results-legend">
          Search Results ({searchResults.languages.length})
        </legend>
        <div className="language-grid">
          {searchResults.languages.map((lang) => {
            const groupName = languageData?.[lang.code]?.group || "Unknown";
            return (
              <button
                key={lang.code}
                className={`language-button-grid ${
                  selectedLanguage === lang.code ? "selected" : ""
                }`}
                onClick={() => onLanguageFocus(lang.code)}
                title={`${lang.name} (${groupName})`}
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
        No languages found matching "{searchTerm}"
      </div>
    );
  }

  return null;
}

function SearchTab({
  searchTerm,
  searchResults,
  selectedLanguage,
  onLanguageFocus,
  languageData
}) {
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
        (lang) => lang.name.toLowerCase() === searchTerm.toLowerCase()
      );

      if (exactMatch && lastAutoSelectedRef.current !== exactMatch.code) {
        lastAutoSelectedRef.current = exactMatch.code;
        onLanguageFocus(exactMatch.code);
      }
    }
  }, [searchTerm, searchResults, onLanguageFocus]);

  return (
    <div className="control-section">
      <SearchResults
        searchTerm={searchTerm}
        searchResults={searchResults}
        selectedLanguage={selectedLanguage}
        onLanguageFocus={onLanguageFocus}
        languageData={languageData}
      />
    </div>
  );
}

export default SearchTab;
