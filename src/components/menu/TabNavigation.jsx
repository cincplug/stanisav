import tabsConfig from "../../config/tabsConfig.json";
import { useI18n } from "../../hooks/useI18n";
import "./TabNavigation.css";

function TabNavigation({ activeTab, setActiveTab }) {
  const { t } = useI18n();

  return (
    <div className="tab-navigation">
      {tabsConfig.tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
        >
          {t(`tabs.${tab.id}`)}
        </button>
      ))}
    </div>
  );
}

export default TabNavigation;
