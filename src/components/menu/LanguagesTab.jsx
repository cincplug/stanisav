import "./LanguagesTab.css";
import { useEffect, useRef } from "react";
import { useControls } from "../../contexts/ControlsContext";
import { useLanguageSelection } from "../../contexts/LanguageSelectionContext";

function LanguagesTab({ groupedLanguages, languageData, isActive }) {
  const {
    groupColors,
    setGroupColor,
    selectedLanguage,
    selectLanguageWithFocus
  } = useLanguageSelection();
  const { controls } = useControls();
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
      <div className="languages-list">
        {Object.entries(groupedLanguages).map(([groupName, group]) => (
          <div key={groupName} className="language-group-container">
            <h3 className={`group-header`}>
              {groupName}

              {controls.canEditColors && (
                <input
                  type="color"
                  value={groupColors?.[groupName] || group.info.color}
                  onChange={(e) => {
                    setGroupColor(groupName, e.target.value);
                  }}
                  title="Pick group color"
                />
              )}
            </h3>

            <div className="languages-in-group">
              {group.languages.map((langCode) => (
                <button
                  key={langCode}
                  ref={(el) => (buttonRefs.current[langCode] = el)}
                  style={{ background: groupColors?.[groupName] }}
                  className={`language-item-button ${
                    selectedLanguage === langCode ? "selected" : ""
                  } ${!languageData[langCode]?.sr ? "todo-item" : ""}`}
                  onClick={() => selectLanguageWithFocus(langCode)}
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
