import React from "react";
import tabsConfig from "../../config/tabsConfig.json";
import "./TabNavigation.css";

function TabNavigation({ activeTab, setActiveTab }) {
  return (
    <div className="tab-navigation">
      {tabsConfig.tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export default TabNavigation;
