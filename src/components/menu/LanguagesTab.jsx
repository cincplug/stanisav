import React from "react";
import "./LanguagesTab.css";
import { useLanguageSelection } from "../../contexts/LanguageSelectionContext";

function LanguagesTab({
  groupedLanguages,
  selectedLanguage,
  selectedGroup,
  onGroupFocus,
  onLanguageFocus,
  languageData,
  availableGroups,
  onGroupSelectChange
}) {
  const { groupColors, setGroupColor } = useLanguageSelection();

  return (
    <div className="control-section">
      {/* Group Filter */}
      <div className="control-item">
        <label htmlFor="group-filter">Zoom to Group:</label>
        <select
          id="group-filter"
          value={selectedGroup || "all"}
          onChange={onGroupSelectChange}
          className="search-select"
        >
          <option value="all">All Groups</option>
          {availableGroups.map((group) => (
            <option key={group.key} value={group.key}>
              {group.name}
            </option>
          ))}
        </select>
      </div>

      <div className="languages-list">
        {Object.entries(groupedLanguages).map(([groupKey, group]) => (
          <div key={groupKey} className="language-group-container">
            <button
              className={`group-header-button ${
                selectedGroup === groupKey ? "selected" : ""
              }`}
              onClick={() => onGroupFocus(groupKey)}
            >
              {group.info.name} Group ({group.languages.length})
            </button>
            <input
              type="color"
              value={groupColors?.[groupKey] || group.info.color}
              onChange={(e) => {
                setGroupColor(groupKey, e.target.value);
              }}
              title="Pick group color"
            />

            <div className="languages-in-group">
              {group.languages.map((langCode) => (
                <button
                  key={langCode}
                  className={`
                    language-item-button ${
                      selectedLanguage === langCode ? "selected" : ""
                    } ${!languageData[langCode]?.sr ? "todo-item" : ""}`}
                  onClick={() => onLanguageFocus(langCode)}
                >
                  {languageData[langCode]?.name || langCode}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LanguagesTab;
