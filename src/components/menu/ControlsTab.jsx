import { useRef } from "react";
import staticConfig from "../../config/config.json";
import controlsHideConfig from "../../config/controlsHideConfig.json";
import { presetNames } from "../../config/storageConfig.json";
import { useConfigContext } from "../../contexts/ConfigContext";
import { RefreshIcon } from "../Icons.jsx";
import ControlItemGroup from "./ControlItemGroup";
import "./ControlsTab.css";

const allGroupNames = Object.keys(staticConfig);

// Searches every group for a key and returns its current value.
// Used to evaluate conditional hide rules that watch a key living in another group.
const findConfigValueByKey = (getConfigGroup, targetKey) => {
  for (const groupName of allGroupNames) {
    const match = getConfigGroup(groupName).find(
      ({ groupRelativeKey }) => groupRelativeKey === targetKey,
    );
    if (match) return match.value;
  }
  return undefined;
};

// Resolves whether a group should be hidden, based on controlsHideConfig.json.
// A group is hidden if its rule is unconditional (isAlwaysHidden), or if the
// watched key currently equals the value that should trigger hiding.
const shouldHideGroup = (groupName, getConfigGroup) => {
  const hideRule = controlsHideConfig[groupName];
  if (!hideRule) return false;
  if (hideRule.isAlwaysHidden) return true;

  const { watchKey, hideWhenValue } = hideRule;
  return findConfigValueByKey(getConfigGroup, watchKey) === hideWhenValue;
};

// True if any control, in any of the given (visible) groups, currently differs from its default.
// Groups hidden via controlsHideConfig.json are excluded, since their values (e.g. isMenuExpanded)
// can change without the user touching a visible control.
const hasAnyChangedControl = (visibleGroupNames, getConfigGroup) =>
  visibleGroupNames.some((groupName) =>
    getConfigGroup(groupName).some(({ isChanged }) => isChanged),
  );

const ControlsTab = ({ className }) => {
  const {
    getConfigGroup,
    resetAllConfigValues,
    downloadConfigPreset,
    loadConfigFromFile,
    loadConfigPresetByName,
  } = useConfigContext();
  const fileInputRef = useRef(null);

  const visibleGroupNames = allGroupNames.filter(
    (groupName) => !shouldHideGroup(groupName, getConfigGroup),
  );

  const isAnyControlChanged = hasAnyChangedControl(
    visibleGroupNames,
    getConfigGroup,
  );

  const handleFileInputChange = (event) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) loadConfigFromFile(selectedFile);
    event.target.value = "";
  };

  return (
    <div className={`control-section ${className}`}>
      {visibleGroupNames.map((groupName) => (
        <ControlItemGroup key={groupName} groupName={groupName} showFieldset />
      ))}

      <fieldset className="preset-controls">
        {isAnyControlChanged && (
          <>
            <button
              type="button"
              className="reset-all-button"
              onClick={resetAllConfigValues}
            >
              <span>Reset to defaults</span>
            </button>

            <button
              type="button"
              className="preset-save-button"
              onClick={downloadConfigPreset}
            >
              Save preset
            </button>
          </>
        )}

        <button
          type="button"
          className="preset-load-button"
          onClick={() => fileInputRef.current?.click()}
        >
          Load preset
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="preset-file-input"
          onChange={handleFileInputChange}
        />
      </fieldset>

      {presetNames.length > 0 && (
        <fieldset className="preset-list preset-controls">
          <legend>Presets</legend>
          {presetNames.map((presetName) => (
            <button
              key={presetName}
              type="button"
              className="preset-select-button"
              onClick={() => loadConfigPresetByName(presetName)}
            >
              {presetName}
            </button>
          ))}
        </fieldset>
      )}
    </div>
  );
};

export default ControlsTab;
