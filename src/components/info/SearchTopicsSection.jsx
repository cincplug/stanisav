import React from "react";
import infoConfig from "../../config/infoConfig.json";

/**
 * Component for rendering search topics section
 */
function SearchTopicsSection({ languageName, onTopicClick }) {
  return (
    <div className="control-section language-group-container">
      <h3>Search for:</h3>
      {Object.entries(infoConfig.searchTemplates).map(([key, template]) => (
        <button
          key={key}
          className="language-item-button"
          onClick={() => onTopicClick(key)}
        >
          {template.label.replace(/{language}/g, languageName)}
        </button>
      ))}
    </div>
  );
}

export default SearchTopicsSection;
