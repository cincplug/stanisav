import { useRef, useEffect } from "react";
import { CloseIcon } from "./MenuIcons";
import "./SearchTab.css";
import { useLanguageSelection } from "../../contexts/LanguageSelectionContext";

function SearchBox({
  searchTerm,
  setSearchTerm,
  clearSearch,
  autoFocus,
  sceneReady,
  onCameraFocus
}) {
  const searchInputRef = useRef(null);
  const { viewAllLanguages } = useLanguageSelection();

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
    viewAllLanguages(onCameraFocus, sceneReady);
  };

  return (
    <div className="controls-grid search-header">
      <div className="search-input-container">
        <label htmlFor="language-search">Search</label>
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
          aria-label="Clear search"
          disabled={!searchTerm}
        >
          <CloseIcon />
        </button>
      </div>
      <button onClick={handleViewAll} className="view-all-button">
        View all
      </button>
    </div>
  );
}

export default SearchBox;
