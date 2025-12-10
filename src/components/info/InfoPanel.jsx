import React, { useState } from "react";
import infoConfig from "../../config/infoConfig.json";
import languages from "../../../src/config/languages.json";
import { CloseIcon } from "../menu/MenuIcons";
import LinguisticPropertiesSection from "./LinguisticPropertiesSection";
import SearchTopicsSection from "./SearchTopicsSection";
import BottomControlsSection from "./BottomControlsSection";
import AlphabetSection from "./AlphabetSection";
import GroupLanguagesSection from "./GroupLanguagesSection";
import "./InfoPanel.css";

function InfoPanel({
  selectedLanguage,
  isVisible,
  onClose,
  showInfo,
  onToggleShowInfo,
  appControls,
  onCameraFocus,
  data
}) {
  const [selectedEngine, setSelectedEngine] = useState(
    infoConfig.defaultSearchEngine
  );

  if (!isVisible || !selectedLanguage) {
    return null;
  }

  const languageInfo = languages[selectedLanguage];
  const languageName = languageInfo?.name;
  const speakerCount = languageInfo?.speakers;
  const features = languageInfo?.typology;

  const formatSpeakerCount = (count) => {
    if (!count) return "Unknown number of";
    // Data is in millions, convert to actual number and format with commas
    const million = 1000000;
    const actualCount = count * million;
    return actualCount.toLocaleString("en-US");
  };

  const handleTopicClick = (templateKey) => {
    const engine = infoConfig.searchEngines[selectedEngine];
    const template = infoConfig.searchTemplates[templateKey];

    if (engine && template) {
      const query = template.query.replace(/{language}/g, languageName);
      const searchUrl = engine.url + encodeURIComponent(query);
      window.open(searchUrl, "_blank");
    }
  };

  return (
    <div className="info-panel menu">
      <div className="info-header menu-header">
        <button
          onClick={onClose}
          className="close-button"
          aria-label="Close info panel"
        >
          <CloseIcon />
        </button>
      </div>

      <div className="info-content">
        {/* Speaker Count */}
        <div className="control-item">
          <p>
            {languageName} has around {formatSpeakerCount(speakerCount)} native
            speakers.
          </p>
        </div>

        <GroupLanguagesSection
          languageCode={selectedLanguage}
          appControls={appControls}
          onCameraFocus={onCameraFocus}
          data={data}
        />

        <AlphabetSection
          languageCode={selectedLanguage}
          languageName={languageName}
        />
        <LinguisticPropertiesSection
          features={features}
          languageName={languageName}
        />
        <SearchTopicsSection
          languageName={languageName}
          onTopicClick={handleTopicClick}
        />
        <BottomControlsSection
          selectedEngine={selectedEngine}
          setSelectedEngine={setSelectedEngine}
          showInfo={showInfo}
          onToggleShowInfo={onToggleShowInfo}
        />
      </div>
    </div>
  );
}

export default InfoPanel;
