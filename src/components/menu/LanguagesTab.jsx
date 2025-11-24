import "./LanguagesTab.css";
import { useEffect, useRef } from "react";
import { useLanguageSelection } from "../../contexts/LanguageSelectionContext";

function LanguagesTab({
  groupedLanguages,
  selectedLanguage,
  selectedGroup,
  onGroupFocus,
  onLanguageFocus,
  languageData,
  availableGroups,
  onGroupSelectChange,
  isActive
}) {
  const { groupColors, setGroupColor } = useLanguageSelection();
  const buttonRefs = useRef({});

  useEffect(() => {
    if (isActive && selectedLanguage && buttonRefs.current[selectedLanguage]) {
      buttonRefs.current[selectedLanguage].scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }
  }, [selectedLanguage, isActive]);

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
            <option key={group.name} value={group.name}>
              {group.name}
            </option>
          ))}
        </select>
      </div>

      <div className="languages-list">
        {Object.entries(groupedLanguages).map(([groupName, group]) => (
          <div key={groupName} className="language-group-container">
            <button
              className={`group-header-button ${
                selectedGroup === groupName ? "selected" : ""
              }`}
              onClick={() => onGroupFocus(groupName)}
            >
              {groupName}
            </button>
            <input
              type="color"
              value={groupColors?.[groupName] || group.info.color}
              onChange={(e) => {
                setGroupColor(groupName, e.target.value);
              }}
              title="Pick group color"
            />

            <div className="languages-in-group">
              {group.languages.map((langCode) => (
                <button
                  key={langCode}
                  ref={(el) => (buttonRefs.current[langCode] = el)}
                  style={{ background: groupColors?.[groupName] }}
                  className={`language-item-button ${
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
