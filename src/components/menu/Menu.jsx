import { useState, useEffect } from "react";
import { useControls } from "../../contexts/ControlsContext";
import { useLanguageSearch } from "../../hooks/useLanguageSearch";
import { useMenuHandlers } from "../../hooks/useMenuHandlers";
import { useTabHandlers } from "../../hooks/useTabHandlers";
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
  onfilteringUtilsChange,
  selectedLanguage,
  selectedGroup
}) {
  const { controls, updateControl } = useControls();
  const [activeTab, setActiveTab] = useState(tabsConfig.defaultTab);

  const { searchTerm, setSearchTerm, searchResults, clearSearch } =
    useLanguageSearch(data);

  const { handleLanguageFocus, handleGroupFocus, handleViewAll } =
    useMenuHandlers(onCameraFocus, sceneReady, data, controls);

  const { availableGroups, groupedLanguages, handleGroupSelectChange } =
    useTabHandlers(data, handleGroupFocus, handleViewAll);

  if (isLoading) {
    return null;
  }

  // Unified handler that updates both local state and context
  const handleControlChange = (controlId, value) => {
    // Update local state through unified handler
    onControlChange(controlId, value);

    // Update context
    updateControl(controlId, value);
  };

  // Switch to search tab if searchTerm meets threshold and not already on search tab
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

  // Custom tab change handler to clear search when switching tabs
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (tabId !== "search") {
      clearSearch();
    }
  };

  return (
    <>
      {/* Toggle button - always visible */}
      <button
        id="menu-toggle"
        onClick={() => onToggleCollapse(!isCollapsed)}
        className="close-button"
        aria-label={isCollapsed ? "Open menu" : "Close menu"}
      >
        {isCollapsed ? <BurgerIcon /> : <CloseIcon />}
      </button>

      {/* Menu panel - hidden when collapsed */}
      {!isCollapsed && (
        <div className="menu">
          <TabNavigation activeTab={activeTab} setActiveTab={handleTabChange} />

          <SearchBox
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            clearSearch={clearSearch}
            autoFocus={activeTab === "search"}
            onGroupFocus={handleGroupFocus}
          />

          <TabRenderer
            activeTab={activeTab}
            controls={controls}
            onControlChange={handleControlChange}
            handleViewAll={handleViewAll}
            groupedLanguages={groupedLanguages}
            selectedLanguage={selectedLanguage}
            selectedGroup={selectedGroup}
            handleGroupFocus={handleGroupFocus}
            handleLanguageFocus={handleLanguageFocus}
            languageData={data?.languages || {}}
            availableGroups={availableGroups}
            handleGroupSelectChange={handleGroupSelectChange}
            data={data}
            filteringUtils={filteringUtils}
            onfilteringUtilsChange={onfilteringUtilsChange}
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
