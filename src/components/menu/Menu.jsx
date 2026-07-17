import { useState } from "react";
import tabsConfig from "../../config/tabsConfig.json";
import { useConfigContext } from "../../contexts/ConfigContext";
import { useI18nContext } from "../../contexts/I18nContext";
import { useLanguageColorsContext } from "../../contexts/LanguageColorsContext";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import ControlItemGroup from "./ControlItemGroup";
import LocaleLinks from "./LocaleLinks";
import "./Menu.css";
import {
  HomeIcon,
  BurgerIcon,
  CloseIcon,
  BlackboardIcon,
  SortIcon,
} from "../Icons";
import Playlist from "./Playlist";
import TabNavigation from "./TabNavigation";
import TabRenderer from "./TabRenderer";
import Select from "../ux/Select";

function Menu({
  onControlChange,
  data,
  isLoading,
  isExpanded,
  onToggleMenu,
  filters,
  onFiltersChange,
}) {
  const { config, updateConfigValue, getConfigGroup } = useConfigContext();
  const { languageColors } = useLanguageColorsContext();
  const { t, isRtl } = useI18nContext();
  const [selectedTab, setSelectedTab] = useState(tabsConfig.defaultTab);
  const isMobile = useMediaQuery("(max-width: 640px)");
  const { isBlackboard, sortBy } = config;

  const sortByControl = getConfigGroup("header").find(
    ({ groupRelativeKey }) => groupRelativeKey === "sortBy",
  );

  const sortByOptions = (sortByControl?.options || []).map((value) => {
    const i18nKey = `controls.sortBy.options.${value}`;
    const translated = t(i18nKey);
    return {
      value,
      label: translated !== i18nKey ? translated : String(value),
    };
  });

  const selectedSortBy =
    sortByOptions.find(({ value }) => value === sortBy)?.value ||
    sortByOptions[0]?.value ||
    "";

  const handleControlChange = (dotKey, value) => {
    onControlChange(dotKey, value);
    updateConfigValue(dotKey, value);
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
      <ControlItemGroup groupName="header" />
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
            {!isMobile && renderHeaderControls()}
          </div>

          <div className="menu-scroll-area">
            {isMobile && renderHeaderControls()}
            <TabNavigation
              selectedTab={selectedTab}
              setSelectedTab={handleTabChange}
            />
            <TabRenderer
              selectedTab={selectedTab}
              setSelectedTab={setSelectedTab}
              config={config}
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
          {sortByOptions.length > 0 && (
            <Select
              options={sortByOptions}
              value={selectedSortBy}
              onChange={(value) => updateConfigValue("header.sortBy", value)}
              label={t("controls.sortBy.label")}
              isCompact
              icon={<SortIcon />}
            />
          )}
          <button
            onClick={() =>
              updateConfigValue("header.isBlackboard", !isBlackboard)
            }
            aria-pressed={isBlackboard}
            className={`menu-item ${isBlackboard ? "selected" : ""}`}
            aria-label={t("controls.isBlackboard.label")}
          >
            <BlackboardIcon />
          </button>
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
