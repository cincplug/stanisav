import tabsConfig from "../../config/tabsConfig.json";
import { useI18nContext } from "../../contexts/I18nContext";

function TabNavigation({ selectedTab, setSelectedTab }) {
  const { t } = useI18nContext();
  const tabs = tabsConfig.tabs;

  const handleKeyDown = (e, index) => {
    let nextIndex = null;
    if (e.key === "ArrowRight") {
      nextIndex = (index + 1) % tabs.length;
    } else if (e.key === "ArrowLeft") {
      nextIndex = (index - 1 + tabs.length) % tabs.length;
    } else if (e.key === "Home") {
      nextIndex = 0;
    } else if (e.key === "End") {
      nextIndex = tabs.length - 1;
    }
    if (nextIndex !== null) {
      e.preventDefault();
      setSelectedTab(tabs[nextIndex].id);
      document.getElementById(`tab-${tabs[nextIndex].id}`)?.focus();
    }
  };

  return (
    <div className="tab-navigation" role="tablist">
      {tabs.map((tab, index) => {
        const isSelected = selectedTab === tab.id;
        return (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            role="tab"
            aria-label={`${t(`tabs.${tab.id}`)} ${tab.isVisual ? t("menu.isVisual") : ""}`}
            aria-selected={isSelected}
            aria-controls={`tabpanel-${tab.id}`}
            onClick={() => setSelectedTab(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={`tab-button ${isSelected ? "selected" : ""}`}
          >
            {t(`tabs.${tab.id}`)}
          </button>
        );
      })}
    </div>
  );
}

export default TabNavigation;
