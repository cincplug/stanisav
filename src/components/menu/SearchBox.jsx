import { CloseIcon } from "./MenuIcons";
import "./SearchTab.css";
import { useLanguageSelection } from "../../contexts/LanguageSelectionContext";
import { usePlaylist } from "../../contexts/PlaylistContext";
import { useI18n } from "../../hooks/useI18n";

function SearchBox({ searchTerm, setSearchTerm, clearSearch }) {
  const { viewAllLanguages } = useLanguageSelection();
  const { pausePlaylist } = usePlaylist();
  const { t } = useI18n();

  const handleClear = () => {
    clearSearch();
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
    </div>
  );
}

export default SearchBox;
