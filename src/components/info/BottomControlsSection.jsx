import React from "react";
import infoConfig from "../../config/infoConfig.json";

/**
 * Component for bottom controls row (search engine selector + panel toggle)
 */
function BottomControlsSection({
  selectedEngine,
  setSelectedEngine,
  showInfo,
  onToggleShowInfo
}) {
  return (
    <div className="control-section">
      <div className="controls-grid">
        <div className="control-item">
          <label>Search Engine:</label>
          <select
            value={selectedEngine}
            onChange={(e) => setSelectedEngine(e.target.value)}
            className="search-select"
          >
            {Object.entries(infoConfig.searchEngines).map(([key, engine]) => (
              <option key={key} value={key}>
                {engine.name}
              </option>
            ))}
          </select>
        </div>

        <div className="control-item checkbox-control">
          <label>
            <input
              type="checkbox"
              checked={showInfo}
              onChange={(e) => onToggleShowInfo(e.target.checked)}
            />
            <span>Show this panel</span>
          </label>
        </div>
      </div>
    </div>
  );
}

export default BottomControlsSection;
