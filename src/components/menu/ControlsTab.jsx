import { useControls } from "../../contexts/ControlsContext";
import { useLanguageSelection } from "../../contexts/LanguageSelectionContext";
import { advancedConfigGroups } from "../../modules/configStore";
import controlsConfig from "../../config/controls.json";
import ControlItemGroup from "./ControlItemGroup";
import Range from "./ux/Range.jsx";
import "./ControlsTab.css";

const advancedRangeFactor = 5;
const advancedRangeStep = 0.1;

const ControlsTab = ({ className }) => {
  const {
    controls,
    updateControl,
    advancedControls,
    updateAdvancedControl,
    isAdvancedOpen,
    toggleAdvanced,
  } = useControls();
  const { selectedLanguage } = useLanguageSelection();

  const uniqueGroups = Object.keys(controlsConfig).filter(
    (group) => group !== "Header",
  );

  return (
    <div className={`control-section ${className}`}>
      {uniqueGroups.map((groupName) => (
        <ControlItemGroup
          key={groupName}
          groupName={groupName}
          controls={controls}
          onChange={updateControl}
          showFieldset
        />
      ))}

      <fieldset className="control-group advanced-controls">
        <legend>
          <button className="advanced-controls-toggle" onClick={toggleAdvanced}>
            {isAdvancedOpen ? "Hide advanced" : "Show advanced"}
          </button>
        </legend>

        {isAdvancedOpen &&
          Object.entries(advancedConfigGroups).map(([groupName, entries]) => (
            <fieldset key={groupName} className="control-group">
              <legend>{groupName}</legend>
              <div className="controls-grid">
                {entries.map(([dotKey, label, staticDefault]) => {
                  const currentValue = advancedControls[dotKey];
                  return (
                    <div key={dotKey} className="control-item range-control">
                      <label>
                        <span>{label}</span>
                        <span>{currentValue}</span>
                      </label>
                      <Range
                        min={staticDefault / advancedRangeFactor}
                        max={staticDefault * advancedRangeFactor}
                        step={advancedRangeStep}
                        value={currentValue}
                        onChange={(e) =>
                          updateAdvancedControl(
                            dotKey,
                            parseFloat(e.target.value),
                          )
                        }
                      />
                    </div>
                  );
                })}
              </div>
            </fieldset>
          ))}
      </fieldset>
    </div>
  );
};

export default ControlsTab;
