import React from "react";
import { getGroupInfo } from "../../utils/groupingUtils";
import { useLanguageSelectionHandler } from "../../hooks/useLanguageSelectionHandler";
import languages from "../../../src/config/languages.json";
import "./GroupLanguagesSection.css";

/**
 * Component that displays the language group information with clickable language buttons
 */
function GroupLanguagesSection({
  languageCode,
  sceneControls,
  onCameraFocus,
  data
}) {
  const { selectLanguageWithFocus } = useLanguageSelectionHandler(
    onCameraFocus,
    true,
    data,
    sceneControls
  );
  const groupInfo = getGroupInfo(languageCode);

  if (!groupInfo) {
    return null;
  }

  const { groupName, otherLanguages } = groupInfo;

  // Get language codes for the other languages to enable selection
  const otherLanguageCodes = Object.entries(languages)
    .filter(
      ([code, info]) =>
        info.group === languages[languageCode]?.group &&
        code !== languageCode &&
        otherLanguages.includes(info.name)
    )
    .map(([code, info]) => ({ code, name: info.name }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const handleLanguageClick = (targetLanguageCode) => {
    // Use centralized handler for full functionality (selection + audio + camera focus)
    selectLanguageWithFocus(targetLanguageCode, true, true);
  };

  if (otherLanguages.length === 0) {
    return (
      <div className="control-item">
        <p>
          It belongs to the <strong>{groupName}</strong> language group.
        </p>
      </div>
    );
  }

  return (
    <div className="control-item">
      <p>
        It belongs to the <strong>{groupName}</strong> language group, along
        with{" "}
        <span className="group-languages-buttons">
          {otherLanguageCodes.map(({ code, name }, index) => (
            <React.Fragment key={code}>
              <button
                className="group-language-button"
                onClick={() => handleLanguageClick(code)}
                title={`Select ${name}`}
              >
                {name}
              </button>
              {/* Add separators like formatLanguageList function */}
              {index < otherLanguageCodes.length - 1 &&
                (index === otherLanguageCodes.length - 2
                  ? otherLanguageCodes.length === 2
                    ? " and "
                    : ", and "
                  : ", ")}
            </React.Fragment>
          ))}
        </span>
        .
      </p>
    </div>
  );
}

export default GroupLanguagesSection;
