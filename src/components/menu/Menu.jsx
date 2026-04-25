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

  const handleControlChange = (controlId, value) => {
    onControlChange(controlId, value);
    updateControl(controlId, value);
  };

  const handleTabChange = (tabId) => {
    setSelectedTab(tabId);
    if (tabId !== "search") {
      clearSearch();
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <div className="menu-wrapper">
      {!isVisible && (
        <button
          id="menu-open"
          onClick={() => onToggleCollapse(true)}
          className={`close-button ${isRtl ? "close-button-rtl" : ""}`}
          aria-label={t("menu.open")}
        >
          <BurgerIcon />
        </button>
      )}

      {isVisible && (
        <div className={`menu ${isMenuExpanded ? "expanded" : "compact"}`}>
          <div className="menu-header">
            <button
              id="menu-close"
              onClick={() => onToggleCollapse(false)}
              className={`close-button ${isRtl ? "close-button-rtl" : ""}`}
              aria-label={t("menu.close")}
            >
              <CloseIcon />
            </button>

            <Playlist />

            <div className="menu-essentials">
              <div className="control-item">
                <label>{t("menu.languageSelector")}</label>
                <LocaleLinks />
              </div>
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
            <div className="tabs-scroll-area">
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
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Menu;
