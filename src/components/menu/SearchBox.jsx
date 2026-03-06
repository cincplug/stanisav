import { useRef, useEffect } from "react";
import { CloseIcon } from "./MenuIcons";
import "./SearchTab.css";
import { useLanguageSelection } from "../../contexts/LanguageSelectionContext";
import { usePlaylist } from "../../contexts/PlaylistContext";
import { useI18n } from "../../hooks/useI18n";

function SearchBox({ searchTerm, setSearchTerm, clearSearch, autoFocus }) {
  const searchInputRef = useRef(null);
  const { viewAllLanguages } = useLanguageSelection();
  const { pausePlaylist } = usePlaylist();
  const { t } = useI18n();

  useEffect(() => {
    if (autoFocus && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [autoFocus]);

  const handleClear = () => {
    clearSearch();
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleViewAll = () => {
    pausePlaylist();
    viewAllLanguages();
  };

  return (
    <div className="controls-grid search-header">
      <div className="search-input-container">
        <label htmlFor="language-search">{t("search.label")}</label>
        <input
          ref={searchInputRef}
          id="language-search"
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <button
          onClick={handleClear}
          className="search-clear-button"
          aria-label={t("search.clear")}
          disabled={!searchTerm}
        >
          <CloseIcon />
        </button>
      </div>
      <button onClick={handleViewAll} className="view-all-button">
        {t("search.viewAll")}
      </button>
    </div>
  );
}

export default SearchBox;
