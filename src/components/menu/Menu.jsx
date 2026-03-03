import { useState, useEffect } from "react";
import { useControls } from "../../contexts/ControlsContext";
import { useSearch } from "../../hooks/useSearch";
import { BurgerIcon, CloseIcon } from "./MenuIcons";
import tabsConfig from "../../config/tabsConfig.json";
import TabNavigation from "./TabNavigation";
import TabRenderer from "./TabRenderer";
import SearchBox from "./SearchBox";
import "./Menu.css";

function Menu({
  onControlChange,
  data,
  isLoading,
  sceneReady,
  onCameraFocus,
  isCollapsed,
  onToggleCollapse,
  filteringUtils,
  onFilteringUtilsChange,
}) {
  const { controls, updateControl } = useControls();
  const [activeTab, setActiveTab] = useState(tabsConfig.defaultTab);

  const { searchTerm, setSearchTerm, searchResults, clearSearch } =
    useSearch(data);

  if (isLoading) {
    return null;
  }

  const handleControlChange = (controlId, value) => {
    onControlChange(controlId, value);
    updateControl(controlId, value);
  };

  const threshold = tabsConfig.searchLengthThreshold;
  useEffect(() => {
    if (
      searchTerm &&
      searchTerm.length >= threshold &&
      activeTab !== "search"
    ) {
      setActiveTab("search");
    }
  }, [searchTerm, activeTab, setActiveTab, threshold]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (tabId !== "search") {
      clearSearch();
    }
  };

  return (
    <>
      <button
        id="menu-toggle"
        onClick={() => onToggleCollapse(!isCollapsed)}
        className="close-button"
        aria-label={isCollapsed ? "Open menu" : "Close menu"}
      >
        {isCollapsed ? <BurgerIcon /> : <CloseIcon />}
      </button>

      {!isCollapsed && (
        <div className="menu">
          <TabNavigation activeTab={activeTab} setActiveTab={handleTabChange} />

          <SearchBox
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            clearSearch={clearSearch}
            autoFocus={activeTab === "search"}
            sceneReady={sceneReady}
            onCameraFocus={onCameraFocus}
          />

          <TabRenderer
            activeTab={activeTab}
            controls={controls}
            onControlChange={handleControlChange}
            languageData={data?.languages || {}}
            data={data}
            filteringUtils={filteringUtils}
            onFilteringUtilsChange={onFilteringUtilsChange}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            searchResults={searchResults}
            clearSearch={clearSearch}
          />
        </div>
      )}
    </>
  );
}

export default Menu;
