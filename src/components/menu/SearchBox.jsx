import { useRef, useEffect } from "react";
import { CloseIcon } from "./MenuIcons";
import "./SearchTab.css";

function SearchBox({
  searchTerm,
  setSearchTerm,
  clearSearch,
  autoFocus,
  onGroupFocus
}) {
  const searchInputRef = useRef(null);

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
      <button
        onClick={() => onGroupFocus("viewAll")}
        className="view-all-button"
      >
        View all
      </button>
    </div>
  );
}

export default SearchBox;
