import { useAppControls } from "../../contexts/AppControlsContext";
import guiConfig from "../../config/guiConfig.json";
import ControlItem from "./ControlItem";

const getControlsByGroup = (groupName) =>
  Object.entries(guiConfig)
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
    new Set(Object.values(guiConfig).map(({ group }) => group))
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
      <div className="control-item">
        <a className="get-playlist" href="/gopofajlija.m3u">
          Get Playlist
        </a>
      </div>
    </div>
  );
};

export default ControlsTab;
