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
  isVisible,
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
  const { isMenuExpanded, isSegmented } = controls;
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
      {!isVisible && (
        <div
          className={`menu-essentials ${isRtl ? "menu-essentials-rtl" : ""}`}
        >
          <LocaleLinks compact />
          <button
            onClick={isPlaying ? pausePlaylist : startPlaylist}
            className="icon-only-button playlist-button playlist-main"
            aria-label={isPlaying ? t("playlist.pause") : t("playlist.play")}
            aria-pressed={isPlaying}
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
          {selectedLanguage && (
            <>
              <button
                onClick={() => {
                  pausePlaylist();
                  viewAllLanguages();
                }}
                className="playlist-button"
                aria-label={t("playlist.stop")}
              >
                <StopIcon />
              </button>
              <button
                onClick={() => updateControl("isLoop", !controls.isLoop)}
                className={`playlist-button ${controls.isLoop ? "selected" : ""}`}
                aria-label={t("playlist.toggleLoop")}
                aria-pressed={controls.isLoop}
              >
                <LoopIcon selected={controls.isLoop} />
              </button>
            </>
          )}
          <button
            id="segmentation-toggle"
            onClick={onToggleSegmentation}
            className="icon-only-button"
            aria-label={t("controls.isSegmented.label")}
          >
            {isSegmented ? <GlobeIcon /> : <SegmentationIcon />}
          </button>
          <button
            id="menu-open"
            onClick={() => onToggleMenu(true)}
            className="icon-only-button"
            aria-label={t("menu.open")}
          >
            <BurgerIcon />
          </button>
        </div>
      )}

      {isVisible && (
        <div className={`menu ${isMenuExpanded ? "expanded" : "compact"}`}>
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
          )}
        </div>
      )}
    </div>
  );
}

export default Menu;
