import tabsConfig from "../../config/tabsConfig.json";
import { useI18n } from "../../contexts/I18nContext";
import "./TabNavigation.css";

function TabNavigation({ selectedTab, setSelectedTab }) {
  const { t } = useI18n();

  return (
    <div className="tab-navigation">
      {tabsConfig.tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setSelectedTab(tab.id)}
          className={`tab-button ${selectedTab === tab.id ? "selected" : ""}`}
        >
          {t(`tabs.${tab.id}`)}
        </button>
      ))}
    </div>
  );
}

export default TabNavigation;
