import { useState } from "react";
import { useControls } from "../../contexts/ControlsContext";
import { useI18n } from "../../contexts/I18nContext";
import { usePlaylist } from "../../contexts/PlaylistContext";
import { useMediaQuery } from "../../hooks/useMediaQuery";
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
  isExpanded,
  onToggleMenu,
  onToggleSegmentation,
  filters,
  onFiltersChange,
  languageColors,
}) {
  const { controls, updateControl } = useControls();
  const { t, isRtl } = useI18n();
  const [selectedTab, setSelectedTab] = useState(tabsConfig.defaultTab);
  const isMobile = useMediaQuery("(max-width: 640px)");

  const handleControlChange = (controlId, value) => {
    onControlChange(controlId, value);
    updateControl(controlId, value);
  };

  const handleTabChange = (tabId) => {
    setSelectedTab(tabId);
  };

  if (isLoading) {
    return null;
  }

  const renderHeaderControls = () => (
    <div className="menu-header-controls">
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
  );

  return (
    <div className="menu-wrapper">
      {isExpanded ? (
        <div className="menu expanded">
          <div className="menu-sticky-top">
            <button
              id="menu-close"
              onClick={() => onToggleMenu(false)}
              className={`close-button ${isRtl ? "close-button-rtl" : ""}`}
              aria-label={t("menu.close")}
            >
              <CloseIcon />
            </button>
            <Playlist />
            {/* On desktop, header controls sit here so sticky works without a fixed height */}
            {!isMobile && renderHeaderControls()}
          </div>

          <div className="menu-scroll-area">
            {/* On mobile, header controls scroll away with the content */}
            {isMobile && renderHeaderControls()}
            <TabNavigation
              selectedTab={selectedTab}
              setSelectedTab={handleTabChange}
            />
            <TabRenderer
              selectedTab={selectedTab}
              setSelectedTab={setSelectedTab}
              controls={controls}
              onControlChange={handleControlChange}
              languageData={data?.languages || {}}
              data={data}
              filters={filters}
              onFiltersChange={onFiltersChange}
              languageColors={languageColors}
            />
          </div>
        </div>
      ) : (
        <div className={`menu compact${isRtl ? " rtl" : ""}`}>
          <Playlist />
          <LocaleLinks isCompact />
          <button
            id="menu-open"
            onClick={() => onToggleMenu(true)}
            className="menu-item"
            aria-label={t("menu.open")}
          >
            <BurgerIcon />
          </button>
        </div>
      )}
    </div>
  );
}

export default Menu;
