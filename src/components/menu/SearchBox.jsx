import { useI18nContext } from "../../contexts/I18nContext";
import { CloseIcon } from "./MenuIcons";
import "./SearchTab.css";

function SearchBox({ searchTerm, setSearchTerm, clearSearch }) {
  const { t } = useI18nContext();

  const handleClear = () => {
    clearSearch();
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
