import { useEffect, useRef } from "react";
import controlsConfig from "../../config/controls.json";
import { useControls } from "../../contexts/ControlsContext";
import { advancedConfigGroups } from "../../modules/configStore";
import { formatCamelCase } from "../../utils/stringUtils";
import ControlItemGroup from "./ControlItemGroup";
import "./ControlsTab.css";
import Range from "./ux/Range";

// Derives step from the number of decimal places, scaled to the magnitude.
// E.g. 0.01 → 0.01, 1.5 → 0.1, 20000 → 1000, 12 → 1
const deriveStep = (value) => {
  const abs = Math.abs(value);
  if (abs === 0) return 0.01;

  const magnitude = Math.pow(10, Math.floor(Math.log10(abs)));
  const str = String(value);
  const decimalIndex = str.indexOf(".");
  const decimalPlaces = decimalIndex === -1 ? 0 : str.length - decimalIndex - 1;

  if (decimalPlaces >= 2) return magnitude * 0.001;
  if (decimalPlaces === 1) return magnitude * 0.01;
  return magnitude * 0.1;
};

// Range spans one order of magnitude below and above the default.
// Min never crosses zero for positive defaults.
const deriveMin = (value) => {
  if (value < 0) return value * 10;
  if (value === 0) return -1;
  return value / 10;
};

const deriveMax = (value) => {
  if (value === 0) return 1;
  if (value < 0) return value / 10;
  return value * 10;
};

const ControlsTab = ({ className }) => {
  const {
    controls,
    updateControl,
    advancedControls,
    updateAdvancedControl,
    isAdvancedOpen,
    toggleAdvanced,
  } = useControls();

  const advancedRef = useRef();

  useEffect(() => {
    if (isAdvancedOpen) {
      advancedRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [isAdvancedOpen]);

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

      <fieldset className="control-group advanced-controls" ref={advancedRef}>
        <legend>
          <button className="advanced-controls-toggle" onClick={toggleAdvanced}>
            {isAdvancedOpen ? "Hide advanced" : "Show advanced"}
          </button>
        </legend>

        {isAdvancedOpen &&
          Object.entries(advancedConfigGroups).map(([groupName, entries]) => (
            <fieldset key={groupName} className="control-group">
              <legend>{formatCamelCase(groupName)}</legend>
              <div className="controls-grid">
                {entries.map(([dotKey, label, staticDefault]) => {
                  const currentValue = advancedControls[dotKey];
                  const step = deriveStep(staticDefault);
                  const min = deriveMin(staticDefault);
                  const max = deriveMax(staticDefault);
                  return (
                    <div key={dotKey} className="control-item range-control">
                      <label>
                        <span>{formatCamelCase(label)}</span>
                        <span>{currentValue}</span>
                      </label>
                      <Range
                        min={min}
                        max={max}
                        step={step}
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