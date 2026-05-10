import { useState } from "react";
import { useControls } from "../../contexts/ControlsContext";
import { useI18n } from "../../contexts/I18nContext";
import { useLanguageSelection } from "../../contexts/LanguageSelectionContext";
import { usePlaylist } from "../../contexts/PlaylistContext";
import {
  BurgerIcon,
  CloseIcon,
  GlobeIcon,
  LoopIcon,
  PauseIcon,
  PlayIcon,
  SegmentationIcon,
  StopIcon,
} from "./MenuIcons";
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
  filteringUtils,
  onFilteringUtilsChange,
  languageColors,
}) {
  const { controls, updateControl } = useControls();
  const { t, isRtl } = useI18n();
  const { isPlaying, startPlaylist, pausePlaylist } = usePlaylist();
  const { selectedLanguage, viewAllLanguages } = useLanguageSelection();
  const { isSegmented } = controls;
  const [selectedTab, setSelectedTab] = useState(tabsConfig.defaultTab);

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

  return (
    <div className="menu-wrapper">
      {isExpanded ? (
        <div className={`menu expanded`}>
          <div className="menu-header">
            <button
              id="menu-close"
              onClick={() => onToggleMenu(false)}
              className={`close-button ${isRtl ? "close-button-rtl" : ""}`}
              aria-label={t("menu.close")}
            >
              <CloseIcon />
            </button>

            <Playlist />

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

            <TabNavigation
              selectedTab={selectedTab}
              setSelectedTab={handleTabChange}
            />
          </div>

          <div className="tabs-scroll-area">
            <TabRenderer
              selectedTab={selectedTab}
              setSelectedTab={setSelectedTab}
              controls={controls}
              onControlChange={handleControlChange}
              languageData={data?.languages || {}}
              data={data}
              filteringUtils={filteringUtils}
              onFilteringUtilsChange={onFilteringUtilsChange}
              languageColors={languageColors}
            />
          </div>
        </div>
      ) : (
        <div className={`menu compact ${isRtl ? "rtl" : ""}`}>
          <Playlist />
          <LocaleLinks compact />
          <button
            id="segmentation-toggle"
            onClick={onToggleSegmentation}
            className={`menu-item ${isSegmented ? "selected" : ""}`}
            aria-label={t("controls.isSegmented.label")}
          >
            <SegmentationIcon />
          </button>
          <button
            id="menu-open"
            onClick={() => onToggleMenu(true)}
            className="menu-item "
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
