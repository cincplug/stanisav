import { useControls } from "../../contexts/ControlsContext";
import { useLanguageSelection } from "../../contexts/LanguageSelectionContext";
import controlsConfig from "../../config/controls.json";
import {
  getControlGroupLabel,
  localizeControlConfig,
} from "../../utils/configI18nUtils";
import ControlItem from "./ControlItem";
import "./ControlsTab.css";

const getControlsByGroup = (groupName) =>
  Object.entries(controlsConfig[groupName] ?? {})
    .filter(([_id, config]) => config.isShownInMenu)
    .map(([id, config]) => ({ id, ...localizeControlConfig(id, config) }));

const ControlGroup = ({ groupName, controls, updateControl }) => {
  const groupControls = getControlsByGroup(groupName);
  if (groupControls.length === 0) return null;

  return (
    <fieldset className="control-group">
      <legend>{getControlGroupLabel(groupName)}</legend>
      <div className="controls-grid">
        {groupControls.map((control) => (
          <ControlItem
            key={control.id}
            control={control}
            value={controls[control.id]}
            onChange={(value) => updateControl(control.id, value)}
          />
        ))}
      </div>
    </fieldset>
  );
};

const ControlsTab = () => {
  const { controls, updateControl } = useControls();
  const { selectedLanguage } = useLanguageSelection();

  const uniqueGroups = Object.keys(controlsConfig).filter(
    (group) =>
      group !== "Header" &&
      (selectedLanguage ? group !== "Stage light" : group !== "Mesha light"),
  );

  return (
    <div className="control-section">
      {uniqueGroups.map((groupName) => (
        <ControlGroup
          key={groupName}
          groupName={groupName}
          controls={controls}
          updateControl={updateControl}
        />
      ))}
    </div>
  );
};

export default ControlsTab;
