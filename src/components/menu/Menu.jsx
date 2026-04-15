import { useState, useEffect } from "react";
import { useControls } from "../../contexts/ControlsContext";
import { useSearch } from "../../hooks/useSearch";
import { useI18n } from "../../contexts/I18nContext";
import { BurgerIcon, CloseIcon } from "./MenuIcons";
import tabsConfig from "../../config/tabsConfig.json";
import ControlItemGroup from "./ControlItemGroup";
import TabNavigation from "./TabNavigation";
import TabRenderer from "./TabRenderer";
import Playlist from "./Playlist";
import LocaleLinks from "./LocaleLinks";
import "./Menu.css";

function Menu({
  onControlChange,
  data,
  isLoading,
  isVisible,
  onToggleCollapse,
  filteringUtils,
  onFilteringUtilsChange,
  languageColors,
}) {
  const { controls, updateControl } = useControls();
  const { t, isRtl } = useI18n();
  const { isMenuExpanded } = controls;
  const [selectedTab, setSelectedTab] = useState(tabsConfig.defaultTab);

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
      selectedTab !== "search"
    ) {
      setSelectedTab("search");
    }
  }, [searchTerm, selectedTab, setSelectedTab, threshold]);

  const handleTabChange = (tabId) => {
    setSelectedTab(tabId);
    if (tabId !== "search") {
      clearSearch();
    }
  };

  return (
    <>
      <button
        id="menu-toggle"
        onClick={() => onToggleCollapse(!isVisible)}
        className={`close-button ${isRtl ? "close-button-rtl" : ""}`}
        aria-label={isVisible ? t("menu.close") : t("menu.open")}
      >
        {isVisible ? <CloseIcon /> : <BurgerIcon />}
      </button>

      {isVisible && (
        <div className={`menu ${isMenuExpanded ? "expanded" : "compact"}`}>
          <div className="sticky-header">
            <div className="menu-essentials">
              <Playlist />
              <LocaleLinks />
              <ControlItemGroup
                groupName="Header"
                controls={controls}
                onChange={handleControlChange}
              />
            </div>
            {isMenuExpanded && (
              <TabNavigation
                selectedTab={selectedTab}
                setSelectedTab={handleTabChange}
              />
            )}
          </div>

          {isMenuExpanded && (
            <TabRenderer
              selectedTab={selectedTab}
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
              languageColors={languageColors}
            />
          )}
        </div>
      )}
    </>
  );
}

export default Menu;
