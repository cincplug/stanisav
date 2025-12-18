import { useAppControls } from "../../contexts/AppControlsContext";
import controlsConfig from "../../config/controlsConfig.json";
import ControlItem from "./ControlItem";

const getControlsByGroup = (groupName) =>
  Object.entries(controlsConfig)
    .filter(
      ([_id, config]) => config.group === groupName && config.isUserEditable
    )
    .map(([id, config]) => ({ id, ...config }));

const ControlGroup = ({ groupName, appControls, updateControl }) => {
  const controls = getControlsByGroup(groupName);
  if (controls.length === 0) return null;

  const gridClass =
    groupName === "Colors" ? "controls-grid-colors" : "controls-grid";

  return (
    <fieldset className="control-group">
      <legend>{groupName}</legend>
      <div className={gridClass}>
        {controls.map((control) => (
          <ControlItem
            key={control.id}
            control={control}
            value={appControls[control.id]}
            onChange={(value) => updateControl(control.id, value)}
          />
        ))}
      </div>
    </fieldset>
  );
};

const ControlsTab = () => {
  const { appControls, updateControl } = useAppControls();

  const uniqueGroups = Array.from(
    new Set(Object.values(controlsConfig).map(({ group }) => group))
  ).filter(Boolean);

  return (
    <div className="control-section">
      {uniqueGroups.map((groupName) => (
        <ControlGroup
          key={groupName}
          groupName={groupName}
          appControls={appControls}
          updateControl={updateControl}
        />
      ))}
    </div>
  );
};

export default ControlsTab;
